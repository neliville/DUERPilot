import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed les 9 catégories de dangers définies dans le cadre réglementaire
 * Conforme au référentiel DUERP propriétaire
 */
export async function seedDangerCategories() {
  console.log('🌱 Seeding danger categories...');

  const categories = [
    { code: 'PHY', label: 'Physiques', order: 1 },
    { code: 'CHI', label: 'Chimiques', order: 2 },
    { code: 'BIO', label: 'Biologiques', order: 3 },
    { code: 'ERG', label: 'Ergonomiques', order: 4 },
    { code: 'PSY', label: 'Psychosociaux', order: 5 },
    { code: 'MEC', label: 'Mécaniques', order: 6 },
    { code: 'ELEC', label: 'Électriques', order: 7 },
    { code: 'INC', label: 'Incendie', order: 8 },
    { code: 'ORG', label: 'Organisationnels', order: 9 },
  ];

  for (const category of categories) {
    await prisma.dangerCategory.upsert({
      where: { code: category.code },
      update: {
        label: category.label,
        order: category.order,
      },
      create: category,
    });
  }

  console.log(`✅ Seeded ${categories.length} danger categories`);
}

