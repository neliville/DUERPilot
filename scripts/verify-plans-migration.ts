#!/usr/bin/env tsx

/**
 * Vérification de la migration des plans v2.0
 * Vérifie qu'aucun utilisateur n'a encore les anciens noms de plans
 * 
 * Usage:
 *   npx tsx scripts/verify-plans-migration.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMigration() {
  console.log('🔍 Vérification de la migration des plans v2.0...\n');
  
  // Vérifier les anciens plans
  const oldPlans = {
    essentiel: await prisma.userProfile.count({ where: { plan: 'essentiel' } }),
    pro: await prisma.userProfile.count({ where: { plan: 'pro' } }),
    expert: await prisma.userProfile.count({ where: { plan: 'expert' } }),
  };
  
  // Vérifier les nouveaux plans
  const newPlans = {
    starter: await prisma.userProfile.count({ where: { plan: 'starter' } }),
    business: await prisma.userProfile.count({ where: { plan: 'business' } }),
    premium: await prisma.userProfile.count({ where: { plan: 'premium' } }),
  };
  
  // Vérifier les autres plans
  const otherPlans = {
    free: await prisma.userProfile.count({ where: { plan: 'free' } }),
    entreprise: await prisma.userProfile.count({ where: { plan: 'entreprise' } }),
  };
  
  console.log('📊 Répartition des plans :\n');
  console.log('Nouveaux plans :');
  console.log(`   - free : ${otherPlans.free}`);
  console.log(`   - starter : ${newPlans.starter}`);
  console.log(`   - business : ${newPlans.business}`);
  console.log(`   - premium : ${newPlans.premium}`);
  console.log(`   - entreprise : ${otherPlans.entreprise}`);
  
  const totalOld = oldPlans.essentiel + oldPlans.pro + oldPlans.expert;
  
  if (totalOld > 0) {
    console.log('\n❌ PROBLÈME : Des utilisateurs ont encore les anciens plans :');
    if (oldPlans.essentiel > 0) {
      console.log(`   ⚠️  essentiel : ${oldPlans.essentiel} utilisateur(s)`);
    }
    if (oldPlans.pro > 0) {
      console.log(`   ⚠️  pro : ${oldPlans.pro} utilisateur(s)`);
    }
    if (oldPlans.expert > 0) {
      console.log(`   ⚠️  expert : ${oldPlans.expert} utilisateur(s)`);
    }
    console.log('\n💡 Exécutez le script de migration : npx tsx scripts/migrate-plans-v2.ts');
    process.exit(1);
  } else {
    console.log('\n✅ Migration vérifiée : Aucun utilisateur avec ancien plan.');
    console.log('\n📈 Statistiques :');
    const total = otherPlans.free + newPlans.starter + newPlans.business + newPlans.premium + otherPlans.entreprise;
    console.log(`   Total utilisateurs : ${total}`);
    console.log(`   Répartition :`);
    console.log(`     - FREE : ${otherPlans.free} (${Math.round((otherPlans.free / total) * 100)}%)`);
    console.log(`     - STARTER : ${newPlans.starter} (${Math.round((newPlans.starter / total) * 100)}%)`);
    console.log(`     - BUSINESS : ${newPlans.business} (${Math.round((newPlans.business / total) * 100)}%)`);
    console.log(`     - PREMIUM : ${newPlans.premium} (${Math.round((newPlans.premium / total) * 100)}%)`);
    console.log(`     - ENTREPRISE : ${otherPlans.entreprise} (${Math.round((otherPlans.entreprise / total) * 100)}%)`);
  }
}

verifyMigration()
  .catch((e) => {
    console.error('❌ Erreur lors de la vérification :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
