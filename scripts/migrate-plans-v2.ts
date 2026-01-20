#!/usr/bin/env tsx

/**
 * Migration des plans vers v2.0
 * essentiel → starter
 * pro → business  
 * expert → premium
 * 
 * Usage:
 *   npx tsx scripts/migrate-plans-v2.ts
 * 
 * ⚠️ IMPORTANT : Exécuter en environnement de développement d'abord !
 * ⚠️ Sauvegarder la base de données avant migration en production
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migratePlans() {
  console.log('🔄 Migration des plans vers v2.0...\n');
  
  // Vérifier d'abord combien d'utilisateurs seront affectés
  const counts = {
    essentiel: await prisma.userProfile.count({ where: { plan: 'essentiel' } }),
    pro: await prisma.userProfile.count({ where: { plan: 'pro' } }),
    expert: await prisma.userProfile.count({ where: { plan: 'expert' } }),
  };
  
  console.log('📊 Utilisateurs à migrer :');
  console.log(`   - essentiel → starter : ${counts.essentiel}`);
  console.log(`   - pro → business : ${counts.pro}`);
  console.log(`   - expert → premium : ${counts.expert}`);
  console.log(`   Total : ${counts.essentiel + counts.pro + counts.expert}\n`);
  
  if (counts.essentiel + counts.pro + counts.expert === 0) {
    console.log('✅ Aucun utilisateur à migrer. Migration terminée.');
    return;
  }
  
  // Mettre à jour tous les utilisateurs
  const migrations = [
    { from: 'essentiel', to: 'starter' },
    { from: 'pro', to: 'business' },
    { from: 'expert', to: 'premium' },
  ];
  
  let totalMigrated = 0;
  
  for (const { from, to } of migrations) {
    const result = await prisma.userProfile.updateMany({
      where: { plan: from },
      data: { plan: to },
    });
    
    console.log(`✅ ${result.count} utilisateur(s) migré(s) de ${from} → ${to}`);
    totalMigrated += result.count;
  }
  
  console.log(`\n✨ Migration terminée ! ${totalMigrated} utilisateur(s) migré(s) au total.`);
  
  // Vérification post-migration
  const remaining = {
    essentiel: await prisma.userProfile.count({ where: { plan: 'essentiel' } }),
    pro: await prisma.userProfile.count({ where: { plan: 'pro' } }),
    expert: await prisma.userProfile.count({ where: { plan: 'expert' } }),
  };
  
  if (remaining.essentiel + remaining.pro + remaining.expert > 0) {
    console.warn('\n⚠️  ATTENTION : Des utilisateurs avec les anciens plans subsistent :');
    if (remaining.essentiel > 0) console.warn(`   - essentiel : ${remaining.essentiel}`);
    if (remaining.pro > 0) console.warn(`   - pro : ${remaining.pro}`);
    if (remaining.expert > 0) console.warn(`   - expert : ${remaining.expert}`);
  } else {
    console.log('\n✅ Vérification : Aucun utilisateur avec ancien plan restant.');
  }
}

migratePlans()
  .catch((e) => {
    console.error('❌ Erreur lors de la migration :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
