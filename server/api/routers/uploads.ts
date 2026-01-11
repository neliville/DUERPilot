import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { minioService } from '@/server/services/storage/minio-service';
import { BUCKETS, PRESIGNED_URL_EXPIRY } from '@/server/services/storage/constants';
import { buildPath, sanitizeFileName } from '@/server/services/storage/utils';

const generateUploadUrlSchema = z.object({
  bucket: z.enum([
    BUCKETS.DOCUMENTS,
    BUCKETS.IMPORTS,
    BUCKETS.AVATARS,
    BUCKETS.LOGOS,
    BUCKETS.ATTACHMENTS,
  ]),
  fileName: z.string().min(1),
  contentType: z.string(),
  documentType: z.enum([
    'duerp',
    'import',
    'avatar',
    'logo',
    'attachment',
    'observation_photo',
    'action_plan_attachment',
  ]),
  entityId: z.string().optional(), // Pour attachments (observationId, actionPlanId, etc.)
  additionalPath: z.string().optional(), // Pour chemins personnalisés
});

const confirmUploadSchema = z.object({
  bucket: z.string(),
  path: z.string(),
  fileName: z.string(),
  fileSize: z.number().positive(),
  contentType: z.string(),
  documentType: z.string(),
});

const generateDownloadUrlSchema = z.object({
  bucket: z.string(),
  path: z.string(),
  expiresIn: z.number().optional(),
});

const deleteFileSchema = z.object({
  bucket: z.string(),
  path: z.string(),
});

export const uploadsRouter = createTRPCRouter({
  /**
   * Génère une URL présignée PUT pour upload direct depuis le frontend
   */
  generateUploadUrl: authenticatedProcedure
    .input(generateUploadUrlSchema)
    .mutation(async ({ ctx, input }) => {
      const { bucket, fileName, contentType, documentType, entityId, additionalPath } = input;

      // Construire le chemin selon le type de document
      let path: string;
      const sanitizedFileName = sanitizeFileName(fileName);

      switch (documentType) {
        case 'duerp':
          if (!additionalPath) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'additionalPath requis pour type duerp (format: year/version)',
            });
          }
          const [year, version] = additionalPath.split('/');
          path = buildPath.duerp(ctx.tenantId, parseInt(year), version);
          break;

        case 'import':
          path = buildPath.import(ctx.userId, ctx.userId, sanitizedFileName);
          break;

        case 'avatar':
          path = buildPath.avatar(ctx.userId);
          break;

        case 'logo':
          if (!entityId) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'entityId requis pour type logo (companyId)',
            });
          }
          path = buildPath.companyLogo(ctx.tenantId, entityId);
          break;

        case 'attachment':
        case 'observation_photo':
        case 'action_plan_attachment':
          if (!entityId) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `entityId requis pour type ${documentType}`,
            });
          }
          const attachmentType =
            documentType === 'observation_photo'
              ? 'photos-terrain'
              : documentType === 'action_plan_attachment'
              ? 'action-plans'
              : 'attachments';
          path = buildPath.attachment(ctx.tenantId, attachmentType, entityId, sanitizedFileName);
          break;

        default:
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Type de document non supporté: ${documentType}`,
          });
      }

      // Générer l'URL présignée PUT
      const presignedUrl = await minioService.generatePresignedUrl({
        bucket: bucket as any,
        path,
        method: 'PUT',
        contentType,
        expiresIn: PRESIGNED_URL_EXPIRY.UPLOAD,
      });

      return {
        uploadUrl: presignedUrl,
        path,
        expiresIn: PRESIGNED_URL_EXPIRY.UPLOAD,
      };
    }),

  /**
   * Confirme un upload et sauvegarde les métadonnées
   */
  confirmUpload: authenticatedProcedure
    .input(confirmUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const { bucket, path, fileName, fileSize, contentType, documentType } = input;

      // Vérifier que le fichier existe
      const exists = await minioService.fileExists(bucket as any, path);
      if (!exists) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Fichier non trouvé dans MinIO',
        });
      }

      // Créer les métadonnées
      const metadata = {
        organization_id: ctx.tenantId,
        user_id: ctx.userId,
        created_by: ctx.userProfile?.email || ctx.userId,
        document_type: documentType,
        created_at: new Date().toISOString(),
        content_type: contentType,
        file_size: fileSize,
        original_filename: fileName,
      };

      // Mettre à jour les métadonnées du fichier (nécessite un re-upload avec métadonnées)
      // Pour l'instant, on retourne juste les infos
      // TODO: Implémenter updateMetadata si nécessaire

      return {
        success: true,
        path,
        metadata,
      };
    }),

  /**
   * Génère une URL présignée GET pour téléchargement
   */
  generateDownloadUrl: authenticatedProcedure
    .input(generateDownloadUrlSchema)
    .mutation(async ({ ctx, input }) => {
      const { bucket, path, expiresIn } = input;

      // Vérifier que le fichier appartient au tenant (sécurité)
      if (!path.startsWith(`organizations/${ctx.tenantId}/`) && !path.startsWith(`users/${ctx.userId}/`)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Accès non autorisé à ce fichier',
        });
      }

      // Vérifier que le fichier existe
      const exists = await minioService.fileExists(bucket as any, path);
      if (!exists) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Fichier non trouvé',
        });
      }

      // Générer l'URL présignée GET
      const presignedUrl = await minioService.generatePresignedUrl({
        bucket: bucket as any,
        path,
        method: 'GET',
        expiresIn: expiresIn || PRESIGNED_URL_EXPIRY.DOWNLOAD,
      });

      return {
        downloadUrl: presignedUrl,
        expiresIn: expiresIn || PRESIGNED_URL_EXPIRY.DOWNLOAD,
      };
    }),

  /**
   * Supprime un fichier de MinIO
   */
  deleteFile: authenticatedProcedure
    .input(deleteFileSchema)
    .mutation(async ({ ctx, input }) => {
      const { bucket, path } = input;

      // Vérifier que le fichier appartient au tenant (sécurité)
      if (!path.startsWith(`organizations/${ctx.tenantId}/`) && !path.startsWith(`users/${ctx.userId}/`)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Accès non autorisé à ce fichier',
        });
      }

      // Supprimer le fichier
      await minioService.deleteFile(bucket as any, path);

      return {
        success: true,
        message: 'Fichier supprimé avec succès',
      };
    }),

  /**
   * Obtient les statistiques de stockage pour l'organisation
   */
  getStorageStats: authenticatedProcedure.query(async ({ ctx }) => {
    const stats = await minioService.getStorageUsage(ctx.tenantId);

    // Convertir en Go pour affichage
    const totalSizeGB = stats.totalSize / (1024 * 1024 * 1024);

    return {
      ...stats,
      totalSizeGB: parseFloat(totalSizeGB.toFixed(2)),
      byBucketGB: Object.entries(stats.byBucket).reduce(
        (acc, [bucket, data]) => {
          acc[bucket] = {
            ...data,
            sizeGB: parseFloat((data.size / (1024 * 1024 * 1024)).toFixed(2)),
          };
          return acc;
        },
        {} as Record<string, { size: number; count: number; sizeGB: number }>
      ),
    };
  }),
});

