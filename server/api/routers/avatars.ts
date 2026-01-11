import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { minioService } from '@/server/services/storage/minio-service';
import { BUCKETS } from '@/server/services/storage/constants';
import { buildPath } from '@/server/services/storage/utils';
import sharp from 'sharp';

const uploadAvatarSchema = z.object({
  imageData: z.string(), // Base64
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

export const avatarsRouter = createTRPCRouter({
  /**
   * Upload un avatar utilisateur (resize + conversion WebP)
   */
  uploadAvatar: authenticatedProcedure
    .input(uploadAvatarSchema)
    .mutation(async ({ ctx, input }) => {
      const { imageData, contentType } = input;

      try {
        // Décoder base64
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Redimensionner et convertir en WebP avec Sharp
        const processedBuffer = await sharp(buffer)
          .resize(256, 256, {
            fit: 'cover',
            position: 'center',
          })
          .webp({ quality: 85 })
          .toBuffer();

        // Construire le chemin
        const path = buildPath.avatar(ctx.userId);

        // Créer les métadonnées
        const metadata = {
          organization_id: ctx.tenantId,
          user_id: ctx.userId,
          created_by: ctx.userProfile?.email || ctx.userId,
          document_type: 'avatar',
          created_at: new Date().toISOString(),
          content_type: 'image/webp',
          file_size: processedBuffer.length,
        };

        // Upload vers MinIO (bucket public pour avatars)
        const fileUrl = await minioService.uploadFile({
          bucket: BUCKETS.AVATARS,
          path,
          buffer: processedBuffer,
          contentType: 'image/webp',
          metadata,
          makePublic: true, // Seul bucket public
        });

        // Construire l'URL publique
        const endpoint = process.env.MINIO_ENDPOINT || '';
        const baseUrl = endpoint.replace(/\/$/, '');
        const publicUrl = `${baseUrl}/${BUCKETS.AVATARS}/${path}`;

        // Mettre à jour le profil utilisateur
        await ctx.prisma.userProfile.update({
          where: { id: ctx.userProfile!.id },
          data: { avatarUrl: publicUrl },
        });

        return {
          success: true,
          avatarUrl: publicUrl,
          message: 'Avatar uploadé avec succès',
        };
      } catch (error) {
        console.error('[Avatars] Erreur upload avatar:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erreur lors de l'upload de l'avatar: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        });
      }
    }),

  /**
   * Obtient l'URL publique de l'avatar (ou URL par défaut)
   */
  getAvatarUrl: authenticatedProcedure.query(async ({ ctx }) => {
    const userProfile = await ctx.prisma.userProfile.findUnique({
      where: { id: ctx.userProfile!.id },
      select: { avatarUrl: true },
    });

    if (userProfile?.avatarUrl) {
      return {
        avatarUrl: userProfile.avatarUrl,
      };
    }

    // Retourner une URL par défaut ou null
    return {
      avatarUrl: null,
    };
  }),

  /**
   * Supprime l'avatar de l'utilisateur
   */
  deleteAvatar: authenticatedProcedure.mutation(async ({ ctx }) => {
    const path = buildPath.avatar(ctx.userId);

    try {
      // Vérifier que l'avatar existe
      const exists = await minioService.fileExists(BUCKETS.AVATARS, path);
      if (exists) {
        // Supprimer de MinIO
        await minioService.deleteFile(BUCKETS.AVATARS, path);
      }

      // Mettre à jour le profil
      await ctx.prisma.userProfile.update({
        where: { id: ctx.userProfile!.id },
        data: { avatarUrl: null },
      });

      return {
        success: true,
        message: 'Avatar supprimé avec succès',
      };
    } catch (error) {
      console.error('[Avatars] Erreur suppression avatar:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Erreur lors de la suppression de l'avatar: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      });
    }
  }),
});

