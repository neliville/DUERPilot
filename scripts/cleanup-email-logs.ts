/**
 * Script de nettoyage des logs email (RGPD)
 * 
 * Conformité RGPD :
 * - Conserver les logs pendant 3 ans
 * - Anonymiser les données après suppression utilisateur
 * - Supprimer les logs de plus de 3 ans
 * 
 * À exécuter via cron mensuel :
 * 0 2 1 * * cd /path/to/project && pnpm tsx scripts/cleanup-email-logs.ts
 */

import { prisma } from '@/lib/db';

const RETENTION_YEARS = 3;

async function cleanupEmailLogs() {
  console.log('🧹 Début du nettoyage des logs email...');

  try {
    // Date limite : 3 ans en arrière
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - RETENTION_YEARS);

    // 1. Anonymiser les logs liés à des utilisateurs supprimés
    const deletedUsers = await prisma.userProfile.findMany({
      where: {
        // Utilisateurs supprimés (si vous avez un champ deletedAt)
        // Pour l'instant, on ne peut pas détecter les utilisateurs supprimés
        // car Prisma les supprime en cascade. Cette partie nécessiterait
        // un soft delete (champ deletedAt).
      },
      select: { id: true },
    });

    // 2. Supprimer les logs de plus de 3 ans
    const deletedCount = await prisma.emailLog.deleteMany({
      where: {
        sentAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`✅ ${deletedCount.count} logs email supprimés (plus de ${RETENTION_YEARS} ans)`);

    // 3. Anonymiser les emails dans les logs (optionnel, pour logs conservés)
    // Si vous voulez garder les logs mais anonymiser les emails :
    // await prisma.emailLog.updateMany({
    //   where: {
    //     sentAt: {
    //       lt: anonymizeDate, // Date plus récente (ex: 1 an)
    //     },
    //   },
    //   data: {
    //     email: 'anonymized@deleted.local',
    //   },
    // });

    // 4. Statistiques
    const totalLogs = await prisma.emailLog.count();
    const recentLogs = await prisma.emailLog.count({
      where: {
        sentAt: {
          gte: cutoffDate,
        },
      },
    });

    console.log(`📊 Statistiques :`);
    console.log(`   - Total logs conservés : ${recentLogs}`);
    console.log(`   - Total logs en base : ${totalLogs}`);

    // 5. Nettoyer les préférences email orphelines (utilisateurs supprimés)
    // Note: Prisma supprime en cascade, mais vérifions quand même
    // On vérifie en cherchant les préférences dont l'utilisateur n'existe plus
    const allPrefs = await prisma.emailPreferences.findMany({
      select: { id: true, userId: true },
    });
    
    const orphanedPrefs = [];
    for (const pref of allPrefs) {
      const user = await prisma.userProfile.findUnique({
        where: { id: pref.userId },
        select: { id: true },
      });
      if (!user) {
        orphanedPrefs.push(pref);
      }
    }

    if (orphanedPrefs.length > 0) {
      await prisma.emailPreferences.deleteMany({
        where: {
          id: {
            in: orphanedPrefs.map((p) => p.id),
          },
        },
      });
      console.log(`✅ ${orphanedPrefs.length} préférences email orphelines supprimées`);
    }

    console.log('✅ Nettoyage terminé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  cleanupEmailLogs()
    .then(() => {
      console.log('✅ Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export { cleanupEmailLogs };

