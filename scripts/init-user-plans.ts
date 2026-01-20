/**
 * Script pour initialiser les plans des utilisateurs existants
 * 
 * Usage: pnpm tsx scripts/init-user-plans.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initialisation des plans utilisateurs...\n');

  // Récupérer tous les utilisateurs sans plan défini ou avec un plan invalide
  const users = await prisma.userProfile.findMany({
    where: {
      OR: [
        { plan: null as any },
        { plan: { notIn: ['free', 'starter', 'business', 'premium', 'entreprise'] } },
      ],
    },
  });

  console.log(`📊 ${users.length} utilisateur(s) à mettre à jour\n`);

  let updated = 0;
  for (const user of users) {
    await prisma.userProfile.update({
      where: { id: user.id },
      data: { plan: 'free' },
    });
    updated++;
    console.log(`✅ ${user.email || user.id} -> plan "free"`);
  }

  console.log(`\n✨ ${updated} utilisateur(s) mis à jour avec le plan "free"`);

  // Afficher les statistiques par plan
  const stats = await prisma.userProfile.groupBy({
    by: ['plan'],
    _count: {
      id: true,
    },
  });

  console.log('\n📈 Statistiques par plan:');
  for (const stat of stats) {
    console.log(`  - ${stat.plan || 'null'}: ${stat._count.id} utilisateur(s)`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

