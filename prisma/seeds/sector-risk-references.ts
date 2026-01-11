import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Mapping des codes de secteurs vers les fichiers JSON
 */
const SECTOR_FILE_MAP: Record<string, string> = {
  BTP: 'risques_btp.json',
  RESTO: 'risques_restauration.json',
  BUREAU: 'risques_bureau.json',
  COMMERCE: 'risques_commerce.json',
  SANTE: 'risques_sante.json',
  INDUSTRIE: 'risques_industrie.json',
  LOGISTIQUE: 'risques_logistique.json',
  SERVICES: 'risques_services.json',
  AGRICULTURE: 'risques_agriculture.json',
  EDUCATION: 'risques_education.json',
};

interface RiskData {
  id: string;
  intitule: string;
  categorie_principale: string;
  sous_categorie?: string;
  famille_inrs?: string;
  criticite?: {
    frequence?: string;
    gravite?: string;
    score?: number;
    niveau?: string;
  };
  situations_travail?: string[];
  dangers?: string[];
  dommages_potentiels?: string[];
  prevention?: {
    collective?: string[];
    organisationnelle?: string[];
    individuelle?: string[];
  };
  references_reglementaires?: string[];
  ressources_inrs?: string[];
}

interface SectorData {
  secteur: {
    nom: string;
    code_naf?: string;
    description?: string;
  };
  risques: RiskData[];
}

/**
 * Importe un référentiel sectoriel depuis un fichier JSON
 */
async function importSectorReference(sectorCode: string, filePath: string) {
  console.log(`📥 Importing ${sectorCode} from ${filePath}...`);

  // Lire le fichier JSON
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const data: SectorData = JSON.parse(fileContent);

  // Créer ou mettre à jour le référentiel
  const reference = await prisma.sectorRiskReference.upsert({
    where: {
      sectorCode_version: {
        sectorCode,
        version: '1.0.0',
      },
    },
    update: {
      sectorData: data.secteur as any,
      risksData: data.risques as any,
      isActive: true,
    },
    create: {
      sectorCode,
      version: '1.0.0',
      sourceFile: path.basename(filePath),
      sectorData: data.secteur as any,
      risksData: data.risques as any,
      isActive: true,
    },
  });

  // Supprimer les anciens risques pour ce référentiel
  await prisma.sectorRiskItem.deleteMany({
    where: { referenceId: reference.id },
  });

  // Créer les risques individuels
  const riskItems = data.risques.map((risk) => ({
    referenceId: reference.id,
    riskId: risk.id,
    intitule: risk.intitule,
    categoriePrincipale: risk.categorie_principale,
    sousCategorie: risk.sous_categorie || null,
    familleInrs: risk.famille_inrs || null,
    situationsTravail: risk.situations_travail || [],
    dangers: risk.dangers || [],
    dommagesPotentiels: risk.dommages_potentiels || [],
    preventionCollective: risk.prevention?.collective || [],
    preventionOrga: risk.prevention?.organisationnelle || [],
    preventionIndividuelle: risk.prevention?.individuelle || [],
    referencesReglementaires: risk.references_reglementaires || [],
    ressourcesInrs: risk.ressources_inrs || [],
    criticiteFrequence: risk.criticite?.frequence || null,
    criticiteGravite: risk.criticite?.gravite || null,
    criticiteScore: risk.criticite?.score || null,
    criticiteNiveau: risk.criticite?.niveau || null,
    fullData: risk as any,
  }));

  // Insérer par batch pour éviter les problèmes de mémoire
  const batchSize = 50;
  for (let i = 0; i < riskItems.length; i += batchSize) {
    const batch = riskItems.slice(i, i + batchSize);
    await prisma.sectorRiskItem.createMany({
      data: batch,
    });
  }

  console.log(`✅ Imported ${riskItems.length} risks for ${sectorCode}`);
  return { reference, riskCount: riskItems.length };
}

/**
 * Seed tous les référentiels sectoriels
 */
export async function seedSectorRiskReferences() {
  console.log('🌱 Seeding sector risk references...');

  const dataDir = path.join(process.cwd(), 'data', 'Référentiel');

  // Vérifier que le dossier existe
  if (!fs.existsSync(dataDir)) {
    console.error(`❌ Directory not found: ${dataDir}`);
    return;
  }

  const results = [];

  // Importer chaque secteur
  for (const [sectorCode, fileName] of Object.entries(SECTOR_FILE_MAP)) {
    const filePath = path.join(dataDir, fileName);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}`);
      continue;
    }

    try {
      const result = await importSectorReference(sectorCode, filePath);
      results.push({ sectorCode, ...result });
    } catch (error) {
      console.error(`❌ Error importing ${sectorCode}:`, error);
    }
  }

  console.log(`\n✅ Seeded ${results.length} sector references`);
  console.log(`   Total risks imported: ${results.reduce((sum, r) => sum + r.riskCount, 0)}`);

  return results;
}

// Exécuter si appelé directement
if (require.main === module) {
  seedSectorRiskReferences()
    .catch((error) => {
      console.error('Error seeding sector risk references:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

