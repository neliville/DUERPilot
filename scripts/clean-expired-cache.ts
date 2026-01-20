#!/usr/bin/env tsx

/**
 * Script de nettoyage des caches IA expirés
 * 
 * Ce script supprime les entrées de HazardSuggestionCache qui ont dépassé leur date d'expiration.
 * À exécuter régulièrement via un CRON job (ex: hebdomadaire)
 * 
 * Usage:
 *   npx tsx scripts/clean-expired-cache.ts
 * 
 * CRON exemple (tous les dimanches à 3h):
 *   0 3 * * 0 cd /path/to/project && npx tsx scripts/clean-expired-cache.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanExpiredCache() {
  console.log('🧹 Démarrage du nettoyage des caches expirés...\n');

  try {
    // Compter les caches expirés avant suppression
    const expiredCount = await prisma.hazardSuggestionCache.count({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    if (expiredCount === 0) {
      console.log('✅ Aucun cache expiré trouvé. Rien à nettoyer.');
      return;
    }

    console.log(`📊 ${expiredCount} cache(s) expiré(s) trouvé(s)`);

    // Supprimer les caches expirés
    const result = await prisma.hazardSuggestionCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`✅ ${result.count} cache(s) supprimé(s) avec succès`);

    // Statistiques des caches restants
    const remainingCount = await prisma.hazardSuggestionCache.count();
    console.log(`\n📈 Caches restants : ${remainingCount}`);

    // Afficher la date d'expiration la plus proche
    const nextExpiring = await prisma.hazardSuggestionCache.findFirst({
      orderBy: {
        expiresAt: 'asc',
      },
      select: {
        expiresAt: true,
        workUnit: {
          select: {
            name: true,
          },
        },
      },
    });

    if (nextExpiring) {
      console.log(`⏰ Prochain cache à expirer : ${nextExpiring.expiresAt.toLocaleString('fr-FR')}`);
      console.log(`   Unité de travail : ${nextExpiring.workUnit.name}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des caches :', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
cleanExpiredCache()
  .then(() => {
    console.log('\n✨ Nettoyage terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale :', error);
    process.exit(1);
  });
