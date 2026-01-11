import { PrismaClient } from '@prisma/client';
import { seedDangerCategories } from './seeds/danger-categories';
import { seedActivitySectors } from './seeds/activity-sectors';
import { seedDangerousSituations } from './seeds/dangerous-situations';
import { seedSectorRiskReferences } from './seeds/sector-risk-references';
import { seedDuerpilotReference } from './seeds/duerpilot-reference';

const prisma = new PrismaClient();

/**
 * Script principal de seed pour le référentiel DUERP propriétaire
 * 
 * Ordre d'exécution :
 * 1. Catégories de dangers (indépendant)
 * 2. Secteurs d'activité (indépendant)
 * 3. Situations dangereuses (dépend de catégories et secteurs)
 */
async function main() {
  console.log('🌱 Starting seed...\n');

  try {
    // 1. Seed danger categories
    await seedDangerCategories();
    console.log('');

    // 2. Seed activity sectors
    await seedActivitySectors();
    console.log('');

    // 3. Seed dangerous situations (dépend des catégories et secteurs)
    await seedDangerousSituations();
    console.log('');

    // 4. Seed sector risk references (référentiels JSON sectoriels - LEGACY)
    // Note: Peut être remplacé par le référentiel central consolidé
    // await seedSectorRiskReferences();
    // console.log('');

    // 5. Seed DUERPilot central reference (référentiel central consolidé - PRINCIPAL)
    await seedDuerpilotReference();
    console.log('');

    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

