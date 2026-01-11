/**
 * Job de nettoyage automatique des fichiers temporaires MinIO
 * À exécuter quotidiennement via cron ou scheduler
 */

import { minioService } from './minio-service';
import { BUCKETS } from './constants';

interface CleanupStats {
  importsDeleted: number;
  orphanedAvatarsDeleted: number;
  errors: string[];
}

/**
 * Nettoie les imports temporaires plus anciens que 7 jours
 */
export async function cleanupTemporaryImports(): Promise<number> {
  try {
    const deletedCount = await minioService.cleanupTemporaryImports(7);
    console.log(`[Cleanup] ${deletedCount} imports temporaires supprimés`);
    return deletedCount;
  } catch (error) {
    console.error('[Cleanup] Erreur nettoyage imports:', error);
    throw error;
  }
}

/**
 * Nettoie les avatars des utilisateurs supprimés
 * Note: Cette fonction nécessite d'accéder à la DB pour vérifier les utilisateurs existants
 */
export async function cleanupOrphanedAvatars(
  existingUserIds: string[]
): Promise<number> {
  let deletedCount = 0;
  const userIdsSet = new Set(existingUserIds);

  try {
    // Lister tous les avatars
    let continuationToken: string | undefined;
    do {
      const result = await minioService.listFiles({
        bucket: BUCKETS.AVATARS,
        prefix: 'users/',
        maxKeys: 1000,
        continuationToken,
      });

      for (const file of result.files) {
        // Extraire userId depuis le chemin: users/{userId}/avatar-256x256.webp
        const pathParts = file.path.split('/');
        if (pathParts.length >= 2) {
          const userId = pathParts[1];
          // Si l'utilisateur n'existe plus, supprimer l'avatar
          if (!userIdsSet.has(userId)) {
            try {
              await minioService.deleteFile(BUCKETS.AVATARS, file.path);
              deletedCount++;
              console.log(`[Cleanup] Avatar orphelin supprimé: ${file.path}`);
            } catch (error) {
              console.error(`[Cleanup] Erreur suppression avatar ${file.path}:`, error);
            }
          }
        }
      }

      continuationToken = result.continuationToken;
    } while (continuationToken);

    console.log(`[Cleanup] ${deletedCount} avatars orphelins supprimés`);
    return deletedCount;
  } catch (error) {
    console.error('[Cleanup] Erreur nettoyage avatars:', error);
    throw error;
  }
}

/**
 * Exécute tous les jobs de nettoyage
 */
export async function runCleanupJobs(
  existingUserIds: string[] = []
): Promise<CleanupStats> {
  const stats: CleanupStats = {
    importsDeleted: 0,
    orphanedAvatarsDeleted: 0,
    errors: [],
  };

  // Nettoyer imports temporaires
  try {
    stats.importsDeleted = await cleanupTemporaryImports();
  } catch (error) {
    const errorMsg = `Erreur nettoyage imports: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
    stats.errors.push(errorMsg);
    console.error(`[Cleanup] ${errorMsg}`);
  }

  // Nettoyer avatars orphelins (si liste utilisateurs fournie)
  if (existingUserIds.length > 0) {
    try {
      stats.orphanedAvatarsDeleted = await cleanupOrphanedAvatars(existingUserIds);
    } catch (error) {
      const errorMsg = `Erreur nettoyage avatars: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
      stats.errors.push(errorMsg);
      console.error(`[Cleanup] ${errorMsg}`);
    }
  }

  return stats;
}

/**
 * Fonction helper pour exécuter le cleanup depuis un cron job
 * Exemple d'utilisation avec node-cron ou similaire:
 * 
 * import cron from 'node-cron';
 * import { runCleanupJobs } from '@/server/services/storage/cleanup-job';
 * import { prisma } from '@/lib/db';
 * 
 * // Exécuter tous les jours à 2h du matin
 * cron.schedule('0 2 * * *', async () => {
 *   const userIds = await prisma.userProfile.findMany({ select: { id: true } });
 *   const userIdsList = userIds.map(u => u.id);
 *   await runCleanupJobs(userIdsList);
 * });
 */
export default {
  cleanupTemporaryImports,
  cleanupOrphanedAvatars,
  runCleanupJobs,
};

