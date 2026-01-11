import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Types pour les différents formats JSON
interface FormatA {
  referentiel: string;
  source: string;
  date_revision: string;
  structure: Record<string, string>;
  activite: {
    code: string;
    libelle: string;
    domaines: Array<{
      code: string;
      libelle: string;
      questions: Array<{
        code: string;
        question: string;
        mesures: string[];
      }>;
    }>;
  };
}

interface FormatB {
  referentiel: string;
  source: string;
  date_revision: string;
  description?: string;
  structure: Record<string, string>;
  risques: Array<{
    code: string;
    libelle: string;
    questions: Array<{
      code: string;
      question: string;
      mesures: string[];
    }>;
  }>;
}

interface FormatC {
  referentiel: string;
  source?: string;
  date_revision: string;
  structure: Record<string, string>;
  activites: Array<{
    code: string;
    libelle: string;
    themes: Array<{
      code: string;
      libelle: string;
      questions: Array<{
        code: string;
        question: string;
        mesures: string[];
      }>;
    }>;
  }>;
}

type OiraJson = FormatA | FormatB | FormatC;

function detectFormat(data: any): 'A' | 'B' | 'C' {
  if (data.activite && !data.activites) {
    return 'A';
  }
  if (data.risques) {
    return 'B';
  }
  if (data.activites) {
    return 'C';
  }
  throw new Error('Format JSON non reconnu');
}

function normalizeToUnifiedFormat(data: OiraJson): {
  referentialCode: string;
  referentialName: string;
  source: string;
  revisionDate: Date;
  description?: string;
  structure: Record<string, string>;
  sectors: Array<{
    code: string;
    label: string;
    order: number;
    riskDomains: Array<{
      code: string;
      label: string;
      order: number;
      questions: Array<{
        code: string;
        question: string;
        order: number;
        measures: Array<{
          text: string;
          order: number;
        }>;
      }>;
    }>;
  }>;
} {
  const format = detectFormat(data);
  const referentialCode = format === 'A' 
    ? (data as FormatA).activite.code
    : format === 'B'
    ? 'GENERIQUE'
    : 'HCR';

  const referentialName = (data.referentiel || 'Référentiel sans nom') as string;
  const source = ('source' in data && data.source) ? data.source : 'OiRA INRS';
  const revisionDate = new Date(data.date_revision);
  const description = 'description' in data ? data.description : undefined;

  let sectors: Array<{
    code: string;
    label: string;
    order: number;
    riskDomains: Array<{
      code: string;
      label: string;
      order: number;
      questions: Array<{
        code: string;
        question: string;
        order: number;
        measures: Array<{ text: string; order: number }>;
      }>;
    }>;
  }> = [];

  if (format === 'A') {
    const formatA = data as FormatA;
    sectors = [{
      code: formatA.activite.code,
      label: formatA.activite.libelle,
      order: 1,
      riskDomains: formatA.activite.domaines.map((domaine, idx) => ({
        code: domaine.code,
        label: domaine.libelle,
        order: idx + 1,
        questions: domaine.questions.map((q, qIdx) => ({
          code: q.code,
          question: q.question,
          order: qIdx + 1,
          measures: q.mesures.map((m, mIdx) => ({
            text: m,
            order: mIdx + 1,
          })),
        })),
      })),
    }];
  } else if (format === 'B') {
    const formatB = data as FormatB;
    // Format B : un seul secteur générique avec les risques comme domaines
    sectors = [{
      code: 'GENERIQUE',
      label: 'Évaluation générique',
      order: 1,
      riskDomains: formatB.risques.map((risque, idx) => ({
        code: risque.code,
        label: risque.libelle,
        order: idx + 1,
        questions: risque.questions.map((q, qIdx) => ({
          code: q.code,
          question: q.question,
          order: qIdx + 1,
          measures: q.mesures.map((m, mIdx) => ({
            text: m,
            order: mIdx + 1,
          })),
        })),
      })),
    }];
  } else if (format === 'C') {
    const formatC = data as FormatC;
    sectors = formatC.activites.map((activite, aIdx) => ({
      code: activite.code,
      label: activite.libelle,
      order: aIdx + 1,
      riskDomains: activite.themes.map((theme, tIdx) => ({
        code: theme.code,
        label: theme.libelle,
        order: tIdx + 1,
        questions: theme.questions.map((q, qIdx) => ({
          code: q.code,
          question: q.question,
          order: qIdx + 1,
          measures: q.mesures.map((m, mIdx) => ({
            text: m,
            order: mIdx + 1,
          })),
        })),
      })),
    }));
  }

  return {
    referentialCode,
    referentialName,
    source,
    revisionDate,
    description,
    structure: data.structure,
    sectors,
  };
}

async function importReferential(filePath: string) {
  try {
    console.log(`\n📄 Lecture du fichier: ${path.basename(filePath)}`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData: OiraJson = JSON.parse(fileContent);

    const normalized = normalizeToUnifiedFormat(jsonData);

    // Vérifier si le référentiel existe déjà
    const existing = await prisma.oiraReferential.findUnique({
      where: { code: normalized.referentialCode },
    });

    let referential;
    if (existing) {
      // Mettre à jour si la date de révision est plus récente
      if (normalized.revisionDate > existing.revisionDate) {
        console.log(`🔄 Mise à jour du référentiel: ${normalized.referentialName}`);
        referential = await prisma.oiraReferential.update({
          where: { code: normalized.referentialCode },
          data: {
            name: normalized.referentialName,
            source: normalized.source,
            revisionDate: normalized.revisionDate,
            description: normalized.description,
            structure: normalized.structure as any,
          },
        });
        // Supprimer les anciennes données pour réimporter
        await prisma.oiraSector.deleteMany({
          where: { referentialId: referential.id },
        });
      } else {
        console.log(`⏭️  Référentiel déjà à jour: ${normalized.referentialName}`);
        referential = existing;
        return;
      }
    } else {
      console.log(`✅ Création du référentiel: ${normalized.referentialName}`);
      referential = await prisma.oiraReferential.create({
        data: {
          code: normalized.referentialCode,
          name: normalized.referentialName,
          source: normalized.source,
          revisionDate: normalized.revisionDate,
          description: normalized.description,
          structure: normalized.structure as any,
        },
      });
    }

    // Importer les secteurs
    let sectorCount = 0;
    let domainCount = 0;
    let questionCount = 0;
    let measureCount = 0;

    for (const sectorData of normalized.sectors) {
      const sector = await prisma.oiraSector.upsert({
        where: {
          referentialId_code: {
            referentialId: referential.id,
            code: sectorData.code,
          },
        },
        update: {
          label: sectorData.label,
          order: sectorData.order,
        },
        create: {
          referentialId: referential.id,
          code: sectorData.code,
          label: sectorData.label,
          order: sectorData.order,
        },
      });
      sectorCount++;

      // Importer les domaines de risque
      for (const domainData of sectorData.riskDomains) {
        const domain = await prisma.oiraRiskDomain.upsert({
          where: {
            sectorId_code: {
              sectorId: sector.id,
              code: domainData.code,
            },
          },
          update: {
            label: domainData.label,
            order: domainData.order,
          },
          create: {
            sectorId: sector.id,
            code: domainData.code,
            label: domainData.label,
            order: domainData.order,
          },
        });
        domainCount++;

        // Importer les questions
        for (const questionData of domainData.questions) {
          const question = await prisma.oiraQuestion.upsert({
            where: {
              riskDomainId_code: {
                riskDomainId: domain.id,
                code: questionData.code,
              },
            },
            update: {
              question: questionData.question,
              order: questionData.order,
            },
            create: {
              riskDomainId: domain.id,
              code: questionData.code,
              question: questionData.question,
              order: questionData.order,
            },
          });
          questionCount++;

          // Supprimer les anciennes mesures pour cette question
          await prisma.oiraPreventionMeasure.deleteMany({
            where: { questionId: question.id },
          });

          // Importer les mesures
          for (const measureData of questionData.measures) {
            await prisma.oiraPreventionMeasure.create({
              data: {
                questionId: question.id,
                text: measureData.text,
                order: measureData.order,
              },
            });
            measureCount++;
          }
        }
      }
    }

    console.log(`\n📊 Résumé de l'import:`);
    console.log(`   ✅ Référentiel: ${normalized.referentialName}`);
    console.log(`   📁 Secteurs: ${sectorCount}`);
    console.log(`   📂 Domaines: ${domainCount}`);
    console.log(`   ❓ Questions: ${questionCount}`);
    console.log(`   🛡️  Mesures: ${measureCount}`);
  } catch (error: any) {
    console.error(`❌ Erreur lors de l'import de ${filePath}:`, error.message);
    throw error;
  }
}

async function importAllReferentials() {
  try {
    const templateDir = path.join(process.cwd(), 'data', 'hazard_template');
    const files = fs.readdirSync(templateDir).filter((f) => f.endsWith('.json'));

    console.log(`📋 ${files.length} fichier(s) JSON trouvé(s)`);

    for (const file of files) {
      const filePath = path.join(templateDir, file);
      await importReferential(filePath);
    }

    console.log(`\n✅ Import terminé avec succès !`);
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'import:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter l'import
importAllReferentials();

