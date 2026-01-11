import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed les secteurs d'activité principaux
 * Conforme au référentiel DUERP propriétaire
 */
export async function seedActivitySectors() {
  console.log('🌱 Seeding activity sectors...');

  const sectors = [
    { code: 'BTP', label: 'Bâtiment et travaux publics', description: 'Construction, rénovation, travaux publics', order: 1 },
    { code: 'RESTO', label: 'Restauration et hôtellerie', description: 'Restaurants, hôtels, traiteurs', order: 2 },
    { code: 'BUREAU', label: 'Travail de bureau', description: 'Administratif, comptabilité, services', order: 3 },
    { code: 'COMMERCE', label: 'Commerce', description: 'Commerce de détail, gros, e-commerce', order: 4 },
    { code: 'SANTE', label: 'Santé et aide à la personne', description: 'Hôpitaux, cliniques, EHPAD, soins à domicile', order: 5 },
    { code: 'INDUSTRIE', label: 'Industrie', description: 'Production, transformation, maintenance', order: 6 },
    { code: 'LOGISTIQUE', label: 'Logistique et transport', description: 'Transport, entreposage, livraison', order: 7 },
    { code: 'SERVICES', label: 'Services à la personne', description: 'Coiffure, esthétique, ménage, garde d\'enfants', order: 8 },
    { code: 'AGRICULTURE', label: 'Agriculture et agroalimentaire', description: 'Exploitations agricoles, transformation alimentaire', order: 9 },
    { code: 'EDUCATION', label: 'Éducation et formation', description: 'Écoles, centres de formation, garderies', order: 10 },
    { code: 'GENERIQUE', label: 'Référentiel transversal (fallback)', description: 'Risques transversaux applicables à tous les secteurs d\'activité', order: 11 },
  ];

  for (const sector of sectors) {
    await prisma.activitySector.upsert({
      where: { code: sector.code },
      update: {
        label: sector.label,
        description: sector.description,
        order: sector.order,
        active: true,
      },
      create: {
        ...sector,
        active: true,
        isCustom: false,
        tenantId: null, // Secteurs globaux
      },
    });
  }

  console.log(`✅ Seeded ${sectors.length} activity sectors`);
}

