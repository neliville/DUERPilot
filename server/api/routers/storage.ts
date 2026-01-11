import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { minioService } from '@/server/services/storage/minio-service';

/**
 * Router pour tester et vérifier la configuration MinIO
 */
export const storageRouter = createTRPCRouter({
  /**
   * Teste la connexion MinIO (vérifie que les credentials sont valides)
   */
  testConnection: authenticatedProcedure.mutation(async () => {
    try {
      // Tenter de lister les fichiers du bucket imports (opération légère)
      // Cela va initialiser le client et tester la connexion
      await minioService.listFiles({
        bucket: 'duerpilot-imports',
        prefix: 'test/',
        maxKeys: 1,
      });

      return {
        success: true,
        message: 'Connexion MinIO réussie',
      };
    } catch (error) {
      console.error('[Storage] Erreur test connexion MinIO:', error);
      
      // Vérifier si c'est une erreur de configuration
      if (error instanceof Error && error.message.includes('Configuration MinIO manquante')) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Configuration MinIO manquante. Vérifiez les variables d\'environnement MINIO_*',
        });
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Erreur de connexion MinIO: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      });
    }
  }),

  /**
   * Vérifie que les variables d'environnement MinIO sont définies
   */
  checkConfig: authenticatedProcedure.query(() => {
    const endpoint = process.env.MINIO_ENDPOINT;
    const accessKey = process.env.MINIO_ACCESS_KEY;
    const secretKey = process.env.MINIO_SECRET_KEY;
    const region = process.env.MINIO_REGION || 'eu-central-1';
    const useSSL = process.env.MINIO_USE_SSL === 'true';

    return {
      endpoint: endpoint ? '✅ Défini' : '❌ Manquant',
      accessKey: accessKey ? '✅ Défini' : '❌ Manquant',
      secretKey: secretKey ? '✅ Défini' : '❌ Manquant',
      region,
      useSSL,
      allConfigured: !!(endpoint && accessKey && secretKey),
    };
  }),
});

