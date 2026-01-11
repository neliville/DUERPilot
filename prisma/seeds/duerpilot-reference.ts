import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

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
  secteur?: {
    nom: string;
    code: string;
    code_naf?: string;
    description?: string;
  };
  nom?: string;
  code?: string;
  code_naf?: string;
  description?: string;
  risques: RiskData[];
  statistiques?: any;
  statistiques_secteur?: any;
}

interface DuerpilotBaseData {
  metadata: {
    version: string;
    date_creation: string;
    application: string;
    description: string;
    referentiel: string;
    nb_secteurs: number;
    nb_risques_total: number;
  };
  secteurs: Record<string, SectorData>;
}

interface IndexRisk {
  id: string;
  intitule: string;
  secteur: string;
  criticite_score: number;
}

interface IndexFamily {
  nom: string;
  risques: IndexRisk[];
}

interface DuerpilotIndexData {
  metadata: {
    description: string;
    date: string;
  };
  familles: Record<string, IndexFamily>;
}

/**
 * Calcule le niveau de prévalence d'un risque dans un secteur
 */
function calculatePrevalenceLevel(risksInSector: number, totalRisksInSector: number): {
  level: 'tres_frequent' | 'frequent' | 'occasionnel' | 'rare';
  score: number;
} {
  if (totalRisksInSector === 0) {
    return { level: 'rare', score: 0 };
  }

  const ratio = risksInSector / totalRisksInSector;
  
  if (ratio >= 0.8) return { level: 'tres_frequent', score: 4 };
  if (ratio >= 0.5) return { level: 'frequent', score: 3 };
  if (ratio >= 0.2) return { level: 'occasionnel', score: 2 };
  return { level: 'rare', score: 1 };
}

/**
 * Importe le référentiel central consolidé DUERPilot
 */
export async function seedDuerpilotReference() {
  console.log('🌱 Seeding DUERPilot central reference...');

  const dataDir = path.join(process.cwd(), 'data', 'Référentiel');
  const baseFile = path.join(dataDir, 'duerpilot_base_complete.json');
  const indexFile = path.join(dataDir, 'duerpilot_index_risques.json');
  const genericFile = path.join(dataDir, 'risques_generique.json');

  // Vérifier que les fichiers existent
  if (!fs.existsSync(baseFile)) {
    console.error(`❌ File not found: ${baseFile}`);
    return;
  }

  if (!fs.existsSync(indexFile)) {
    console.warn(`⚠️  Index file not found: ${indexFile} (continuing without taxonomy from index)`);
  }

  // Lire les fichiers JSON
  const baseContent = fs.readFileSync(baseFile, 'utf-8');
  const baseData: DuerpilotBaseData = JSON.parse(baseContent);
  
  // Lire et intégrer le fichier générique si présent
  if (fs.existsSync(genericFile)) {
    console.log('  📥 Reading generic risks file...');
    const genericContent = fs.readFileSync(genericFile, 'utf-8');
    const genericData: SectorData = JSON.parse(genericContent);
    
    // Normaliser la structure (gérer les deux formats possibles)
    const genericSector = genericData.secteur || {
      nom: genericData.nom || 'Référentiel générique transversal',
      code: genericData.code || 'GENERIQUE',
      code_naf: genericData.code_naf || 'Tous secteurs',
      description: genericData.description || 'Référentiel de risques professionnels transversaux',
    };
    
    // Ajouter le secteur GENERIQUE au référentiel central
    if (!baseData.secteurs['GENERIQUE']) {
      baseData.secteurs['GENERIQUE'] = {
        nom: genericSector.nom,
        code: genericSector.code,
        code_naf: genericSector.code_naf,
        description: genericSector.description,
        risques: genericData.risques,
        statistiques: genericData.statistiques || genericData.statistiques_secteur,
      };
      console.log(`  ✅ Added GENERIQUE sector with ${genericData.risques.length} risks`);
    } else {
      console.log(`  ⚠️  GENERIQUE sector already exists in base file, merging risks...`);
      // Fusionner les risques génériques avec ceux existants
      const existingRiskIds = new Set(baseData.secteurs['GENERIQUE'].risques.map(r => r.id));
      for (const risk of genericData.risques) {
        if (!existingRiskIds.has(risk.id)) {
          baseData.secteurs['GENERIQUE'].risques.push(risk);
        }
      }
      console.log(`  ✅ Merged GENERIQUE sector (${baseData.secteurs['GENERIQUE'].risques.length} total risks)`);
    }
    
    // Mettre à jour les métadonnées
    baseData.metadata.nb_secteurs = Object.keys(baseData.secteurs).length;
    baseData.metadata.nb_risques_total = Object.values(baseData.secteurs).reduce(
      (sum, sector) => sum + sector.risques.length,
      0
    );
  } else {
    console.warn(`  ⚠️  Generic risks file not found: ${genericFile}`);
  }

  let indexData: DuerpilotIndexData | null = null;
  if (fs.existsSync(indexFile)) {
    const indexContent = fs.readFileSync(indexFile, 'utf-8');
    indexData = JSON.parse(indexContent);
  }

  const version = baseData.metadata.version || '1.0.0';

  // Créer ou mettre à jour le référentiel central
  const reference = await prisma.duerpilotReference.upsert({
    where: {
      version_tenantId: {
        version,
        tenantId: null, // Référentiel global
      },
    },
    update: {
      dateCreation: new Date(baseData.metadata.date_creation || new Date()),
      description: baseData.metadata.description || 'Référentiel central consolidé DUERPilot',
      fullData: baseData as any,
      isActive: true,
    },
    create: {
      version,
      dateCreation: new Date(baseData.metadata.date_creation || new Date()),
      description: baseData.metadata.description || 'Référentiel central consolidé DUERPilot',
      fullData: baseData as any,
      isActive: true,
      tenantId: null, // Référentiel global
    },
  });

  console.log(`✅ Created/updated reference v${version}`);

  // Supprimer les anciennes données
  await prisma.duerpilotRisk.deleteMany({ where: { referenceId: reference.id } });
  await prisma.taxonomyFamily.deleteMany({ where: { referenceId: reference.id } });
  await prisma.riskPrevalence.deleteMany({ where: { referenceId: reference.id } });
  await prisma.transversalRisk.deleteMany({ where: { referenceId: reference.id } });

  // Collecter tous les risques pour calculer la prévalence et les risques transverses
  const allRisks: Array<RiskData & { secteurCode: string }> = [];
  const risksByIntitule = new Map<string, Array<{ riskId: string; secteurCode: string }>>();

  // Importer les risques par secteur
  for (const [sectorCode, sectorData] of Object.entries(baseData.secteurs)) {
    console.log(`  📥 Importing ${sectorCode} (${sectorData.risques.length} risks)...`);

    for (const risk of sectorData.risques) {
      allRisks.push({ ...risk, secteurCode });

      // Identifier les risques transverses (même intitulé dans plusieurs secteurs)
      const normalizedIntitule = risk.intitule.toLowerCase().trim();
      if (!risksByIntitule.has(normalizedIntitule)) {
        risksByIntitule.set(normalizedIntitule, []);
      }
      risksByIntitule.get(normalizedIntitule)!.push({
        riskId: risk.id,
        secteurCode,
      });

      // Créer le risque
      await prisma.duerpilotRisk.create({
        data: {
          referenceId: reference.id,
          riskId: risk.id,
          intitule: risk.intitule,
          secteurCode,
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
        },
      });
    }
  }

  console.log(`  ✅ Imported ${allRisks.length} risks total`);

  // Construire la taxonomie depuis les catégories et sous-catégories
  console.log('  📚 Building taxonomy...');
  const familiesMap = new Map<string, { nom: string; order: number }>();
  const subCategoriesMap = new Map<string, { familyCode: string; nom: string; order: number }>();

  // Extraire les familles depuis les catégories principales
  let familyOrder = 1;
  for (const risk of allRisks) {
    const familyCode = `FAM${String(familyOrder).padStart(2, '0')}`;
    if (!familiesMap.has(risk.categorie_principale)) {
      familiesMap.set(risk.categorie_principale, {
        nom: risk.categorie_principale,
        order: familyOrder++,
      });
    }

    if (risk.sous_categorie && !subCategoriesMap.has(risk.sous_categorie)) {
      subCategoriesMap.set(risk.sous_categorie, {
        familyCode: risk.categorie_principale,
        nom: risk.sous_categorie,
        order: 1,
      });
    }
  }

  // Créer les familles de taxonomie
  const createdFamilies = new Map<string, string>(); // categorie -> familyId
  for (const [categorie, data] of familiesMap.entries()) {
    const family = await prisma.taxonomyFamily.create({
      data: {
        referenceId: reference.id,
        code: `FAM${String(data.order).padStart(2, '0')}`,
        nom: data.nom,
        order: data.order,
        description: `Famille de risques : ${data.nom}`,
      },
    });
    createdFamilies.set(categorie, family.id);

    // Créer les sous-catégories
    let subOrder = 1;
    for (const [subCat, subData] of subCategoriesMap.entries()) {
      if (subData.familyCode === categorie) {
        await prisma.taxonomySubCategory.create({
          data: {
            familyId: family.id,
            code: `SUB${String(subOrder++).padStart(3, '0')}`,
            nom: subData.nom,
            order: subOrder,
            description: `Sous-catégorie : ${subData.nom}`,
          },
        });
      }
    }
  }

  console.log(`  ✅ Created ${familiesMap.size} families and ${subCategoriesMap.size} sub-categories`);

  // Calculer la matrice de prévalence par secteur
  console.log('  📊 Calculating prevalence matrix...');
  const sectorRiskCounts = new Map<string, number>();
  const riskSectorCounts = new Map<string, Set<string>>(); // riskId -> Set<secteurCode>

  // Compter les risques par secteur
  for (const risk of allRisks) {
    sectorRiskCounts.set(risk.secteurCode, (sectorRiskCounts.get(risk.secteurCode) || 0) + 1);
    
    if (!riskSectorCounts.has(risk.riskId)) {
      riskSectorCounts.set(risk.riskId, new Set());
    }
    riskSectorCounts.get(risk.riskId)!.add(risk.secteurCode);
  }

  // Créer la matrice de prévalence
  let prevalenceCount = 0;
  for (const [sectorCode, totalRisks] of sectorRiskCounts.entries()) {
    const sectorRisks = allRisks.filter((r) => r.secteurCode === sectorCode);
    
    for (const risk of sectorRisks) {
      const prevalence = calculatePrevalenceLevel(1, totalRisks); // Simplifié : chaque risque = 1 occurrence
      
      await prisma.riskPrevalence.create({
        data: {
          referenceId: reference.id,
          riskId: risk.id,
          secteurCode,
          prevalenceLevel: prevalence.level,
          prevalenceScore: prevalence.score,
          note: prevalence.level === 'frequent' || prevalence.level === 'tres_frequent'
            ? `Ce risque est fréquemment observé dans ce secteur d'activité`
            : null,
        },
      });
      prevalenceCount++;
    }
  }

  console.log(`  ✅ Created ${prevalenceCount} prevalence entries`);

  // Identifier les risques transverses (présents dans au moins 2 secteurs)
  console.log('  🔄 Identifying transversal risks...');
  let transversalCount = 0;
  for (const [normalizedIntitule, occurrences] of risksByIntitule.entries()) {
    if (occurrences.length >= 2) {
      // Risque transverse : présent dans plusieurs secteurs
      const uniqueSectors = new Set(occurrences.map((o) => o.secteurCode));
      const firstOccurrence = occurrences[0];

      // Trouver le risque principal (celui avec le score de criticité le plus élevé)
      const mainRisk = allRisks.find(
        (r) => r.id === firstOccurrence.riskId && r.secteurCode === firstOccurrence.secteurCode
      );

      if (mainRisk) {
        await prisma.transversalRisk.create({
          data: {
            referenceId: reference.id,
            riskId: mainRisk.id,
            intitule: mainRisk.intitule,
            categoriePrincipale: mainRisk.categorie_principale,
            secteursApplicables: Array.from(uniqueSectors),
            prevalenceGlobal: occurrences.length >= 5 ? 'tres_frequent' : occurrences.length >= 3 ? 'frequent' : 'occasionnel',
            description: `Risque présent dans ${uniqueSectors.size} secteur(s) : ${Array.from(uniqueSectors).join(', ')}`,
          },
        });

        // Marquer les risques correspondants comme transverses
        await prisma.duerpilotRisk.updateMany({
          where: {
            referenceId: reference.id,
            intitule: mainRisk.intitule,
          },
          data: {
            isTransversal: true,
          },
        });

        transversalCount++;
      }
    }
  }

  console.log(`  ✅ Identified ${transversalCount} transversal risks`);

  // Extraire les références réglementaires uniques
  console.log('  📖 Extracting regulatory references...');
  const regulatoryRefsSet = new Set<string>();
  for (const risk of allRisks) {
    if (risk.references_reglementaires) {
      for (const ref of risk.references_reglementaires) {
        regulatoryRefsSet.add(ref);
      }
    }
  }

  let regRefCount = 0;
  for (const ref of regulatoryRefsSet) {
    // Extraire un code et un titre de la référence
    const codeMatch = ref.match(/[ARL]\d{4,}-?\d{0,4}/);
    const code = codeMatch ? codeMatch[0] : `REF-${regRefCount + 1}`;

    await prisma.regulatoryReference.create({
      data: {
        referenceId: reference.id,
        code,
        titre: ref.substring(0, 200), // Limiter la longueur
        description: ref,
        type: ref.includes('Article') ? 'code_travail' : ref.includes('Arrêté') ? 'arrete' : 'recommandation',
      },
    });
    regRefCount++;
  }

  console.log(`  ✅ Created ${regRefCount} regulatory references`);

  console.log(`\n✅ DUERPilot reference seeded successfully!`);
  console.log(`   - Version: ${version}`);
  console.log(`   - Sectors: ${Object.keys(baseData.secteurs).length}`);
  console.log(`   - Risks: ${allRisks.length}`);
  console.log(`   - Families: ${familiesMap.size}`);
  console.log(`   - Transversal risks: ${transversalCount}`);

  return {
    reference,
    stats: {
      sectors: Object.keys(baseData.secteurs).length,
      risks: allRisks.length,
      families: familiesMap.size,
      subCategories: subCategoriesMap.size,
      transversalRisks: transversalCount,
      regulatoryRefs: regRefCount,
    },
  };
}

// Exécuter si appelé directement
if (require.main === module) {
  seedDuerpilotReference()
    .catch((error) => {
      console.error('Error seeding DUERPilot reference:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

