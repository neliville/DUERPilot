import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { onDuerpGenerated } from '@/server/services/email/triggers';
import { minioService } from '@/server/services/storage/minio-service';
import { BUCKETS } from '@/server/services/storage/constants';
import { buildPath, calculateRetentionDate } from '@/server/services/storage/utils';

const createDuerpVersionSchema = z.object({
  companyId: z.string().cuid(),
  year: z.number().int().min(2000).max(2100),
  generationMode: z.enum(['IA', 'humain']).default('humain'),
  updateReason: z.string().optional(), // Justification de la mise à jour (conformité réglementaire)
});

export const duerpVersionsRouter = createTRPCRouter({
  /**
   * Récupère toutes les versions DUERP du tenant
   */
  getAll: authenticatedProcedure
    .input(
      z
        .object({
          companyId: z.string().cuid().optional(),
          year: z.number().int().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        tenantId: ctx.tenantId,
      };

      if (input?.companyId) {
        where.companyId = input.companyId;
      }

      if (input?.year) {
        where.year = input.year;
      }

      const versions = await ctx.prisma.duerpVersion.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              legalName: true,
            },
          },
          generatedByUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: [
          { year: 'desc' },
          { versionNumber: 'desc' },
        ],
      });

      return versions;
    }),

  /**
   * Récupère une version DUERP par son ID
   */
  getById: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const version = await ctx.prisma.duerpVersion.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
        include: {
          company: true,
          snapshots: true,
          generatedByUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!version) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Version DUERP non trouvée',
        });
      }

      return version;
    }),

  /**
   * Crée une nouvelle version DUERP
   */
  create: authenticatedProcedure
    .input(createDuerpVersionSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'entreprise appartient au tenant
      const company = await ctx.prisma.company.findFirst({
        where: {
          id: input.companyId,
          tenantId: ctx.tenantId,
        },
      });

      if (!company) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Entreprise non trouvée',
        });
      }

      // Trouver le numéro de version suivant pour cette année
      const lastVersion = await ctx.prisma.duerpVersion.findFirst({
        where: {
          companyId: input.companyId,
          year: input.year,
        },
        orderBy: {
          versionNumber: 'desc',
        },
      });

      const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

      // Vérifier si c'est la première version DUERP pour cette entreprise (toutes années confondues)
      const firstVersionEver = await ctx.prisma.duerpVersion.findFirst({
        where: {
          companyId: input.companyId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      const isFirstVersion = !firstVersionEver;

      // Préparer les données de traçabilité
      const now = new Date();
      const versionData: any = {
        ...input,
        tenantId: ctx.tenantId,
        versionNumber,
        generatedBy: ctx.userProfile?.email || ctx.user?.email || '',
        generatedById: ctx.userProfile?.id || null,
        updateReason: input.updateReason || null,
      };

      // Créer la version DUERP
      const version = await ctx.prisma.duerpVersion.create({
        data: versionData,
        include: {
          company: true,
        },
      });

      // Mettre à jour la traçabilité dans Company (conformité réglementaire)
      const companyUpdateData: any = {
        duerpLastUpdateDate: now,
        duerpLastUpdateReason: input.updateReason || null,
      };

      // Si c'est la première version, initialiser duerpCreationDate
      if (isFirstVersion) {
        companyUpdateData.duerpCreationDate = now;
      }

      await ctx.prisma.company.update({
        where: { id: input.companyId },
        data: companyUpdateData,
      });

      // Envoyer l'email de notification (non bloquant)
      if (ctx.userProfile) {
        onDuerpGenerated({
          companyName: company.legalName,
          duerpId: version.id,
          userId: ctx.userProfile.id,
          email: ctx.userProfile.email,
          tenantId: ctx.tenantId,
        }).catch((error) => {
          console.error('Erreur lors de l\'envoi de l\'email DUERP (non bloquant):', error);
        });
      }

      return version;
    }),

  /**
   * Génère un snapshot pour une version DUERP
   */
  generateSnapshot: authenticatedProcedure
    .input(z.object({ versionId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que la version appartient au tenant
      const version = await ctx.prisma.duerpVersion.findFirst({
        where: {
          id: input.versionId,
          tenantId: ctx.tenantId,
        },
        include: {
          company: {
            include: {
              sites: {
                include: {
                  workUnits: {
                    include: {
                      riskAssessments: {
                        include: {
                          hazardRef: true,
                        },
                      },
                      actionPlans: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!version) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Version DUERP non trouvée',
        });
      }

      // Collecter toutes les évaluations de risques et actions
      const allRiskAssessments = version.company.sites.flatMap((site) =>
        site.workUnits.flatMap((wu) => wu.riskAssessments)
      );
      const allActionPlans = version.company.sites.flatMap((site) =>
        site.workUnits.flatMap((wu) => wu.actionPlans)
      );

      // Créer les snapshots pour chaque évaluation de risque
      for (const ra of allRiskAssessments) {
        await ctx.prisma.duerpVersionSnapshot.create({
          data: {
            duerpVersionId: version.id,
            snapshotType: 'risk_assessment',
            snapshotData: ra as any,
            entityId: ra.id,
          },
        });
      }

      // Créer les snapshots pour chaque plan d'action
      for (const ap of allActionPlans) {
        await ctx.prisma.duerpVersionSnapshot.create({
          data: {
            duerpVersionId: version.id,
            snapshotType: 'action_plan',
            snapshotData: ap as any,
            entityId: ap.id,
          },
        });
      }

      // Mettre à jour les statistiques de la version
      await ctx.prisma.duerpVersion.update({
        where: { id: input.versionId },
        data: {
          workUnitCount: version.company.sites.reduce(
            (sum, site) => sum + site.workUnits.length,
            0
          ),
          riskCount: allRiskAssessments.length,
          priorityActionCount: allActionPlans.filter(
            (ap) => ap.priority === 'haute' || ap.priority === 'critique'
          ).length,
        },
      });

      return { success: true, riskCount: allRiskAssessments.length, actionCount: allActionPlans.length };
    }),

  /**
   * Génère et upload le PDF DUERP vers MinIO
   */
  generatePDF: authenticatedProcedure
    .input(z.object({ versionId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que la version appartient au tenant
      const version = await ctx.prisma.duerpVersion.findFirst({
        where: {
          id: input.versionId,
          tenantId: ctx.tenantId,
        },
        include: {
          company: true,
        },
      });

      if (!version) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Version DUERP non trouvée',
        });
      }

      // TODO: Générer le PDF avec Puppeteer
      // Pour l'instant, on crée juste la structure pour l'upload
      // Le PDF sera généré dans un service séparé (à implémenter)
      
      // Construire le chemin MinIO
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const versionStr = `${dateStr}-v${version.versionNumber}`;
      const path = buildPath.duerp(ctx.tenantId, version.year, versionStr);

      // Pour l'instant, on retourne juste le chemin
      // Quand le PDF sera généré, on l'uploadera ainsi :
      /*
      const pdfBuffer = await generatePDFBuffer(version); // À implémenter
      
      const metadata = {
        organization_id: ctx.tenantId,
        user_id: ctx.userId,
        created_by: ctx.userProfile?.email || ctx.userId,
        document_type: 'duerp',
        created_at: new Date().toISOString(),
        content_type: 'application/pdf',
        file_size: pdfBuffer.length,
        retention_until: calculateRetentionDate('duerp').toISOString(),
      };

      const fileUrl = await minioService.uploadFile({
        bucket: BUCKETS.DOCUMENTS,
        path,
        buffer: pdfBuffer,
        contentType: 'application/pdf',
        metadata,
      });

      // Mettre à jour la version avec l'URL
      await ctx.prisma.duerpVersion.update({
        where: { id: input.versionId },
        data: { pdfUrl: fileUrl },
      });
      */

      // Pour l'instant, on retourne le chemin prévu
      return {
        success: true,
        path,
        message: 'Structure de chemin créée. Génération PDF à implémenter.',
      };
    }),

  /**
   * Upload un PDF DUERP existant vers MinIO
   */
  uploadPDF: authenticatedProcedure
    .input(
      z.object({
        versionId: z.string().cuid(),
        pdfBuffer: z.string(), // Base64
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier que la version appartient au tenant
      const version = await ctx.prisma.duerpVersion.findFirst({
        where: {
          id: input.versionId,
          tenantId: ctx.tenantId,
        },
        include: {
          company: true,
        },
      });

      if (!version) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Version DUERP non trouvée',
        });
      }

      // Décoder base64
      const base64Data = input.pdfBuffer.replace(/^data:application\/pdf;base64,/, '');
      const pdfBuffer = Buffer.from(base64Data, 'base64');

      // Construire le chemin MinIO
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const versionStr = `${dateStr}-v${version.versionNumber}`;
      const path = buildPath.duerp(ctx.tenantId, version.year, versionStr);

      // Créer les métadonnées
      const retentionDate = calculateRetentionDate('duerp');
      const metadata = {
        organization_id: ctx.tenantId,
        user_id: ctx.userId,
        created_by: ctx.userProfile?.email || ctx.userId,
        document_type: 'duerp',
        created_at: new Date().toISOString(),
        content_type: 'application/pdf',
        file_size: pdfBuffer.length,
        retention_until: retentionDate.toISOString(),
      };

      // Upload vers MinIO
      let fileUrl: string;
      try {
        fileUrl = await minioService.uploadFile({
          bucket: BUCKETS.DOCUMENTS,
          path,
          buffer: pdfBuffer,
          contentType: 'application/pdf',
          metadata,
        });
      } catch (error) {
        console.error('[DUERP] Erreur upload PDF MinIO:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erreur lors de l'upload du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        });
      }

      // Mettre à jour la version avec l'URL
      await ctx.prisma.duerpVersion.update({
        where: { id: input.versionId },
        data: { pdfUrl: fileUrl },
      });

      return {
        success: true,
        pdfUrl: fileUrl,
        message: 'PDF uploadé avec succès',
      };
    }),

  /**
   * Génère une URL présignée pour télécharger le PDF DUERP
   */
  getPDFDownloadUrl: authenticatedProcedure
    .input(z.object({ versionId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que la version appartient au tenant
      const version = await ctx.prisma.duerpVersion.findFirst({
        where: {
          id: input.versionId,
          tenantId: ctx.tenantId,
        },
      });

      if (!version) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Version DUERP non trouvée',
        });
      }

      if (!version.pdfUrl) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Aucun PDF disponible pour cette version',
        });
      }

      // Extraire le chemin depuis l'URL
      let path = version.pdfUrl;
      if (path.startsWith('s3://')) {
        path = path.replace(`s3://${BUCKETS.DOCUMENTS}/`, '');
      } else if (path.includes(`/${BUCKETS.DOCUMENTS}/`)) {
        path = path.split(`/${BUCKETS.DOCUMENTS}/`)[1] || '';
      }

      if (!path) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Format d\'URL PDF invalide',
        });
      }

      // Générer l'URL présignée GET
      const downloadUrl = await minioService.generatePresignedUrl({
        bucket: BUCKETS.DOCUMENTS,
        path,
        method: 'GET',
      });

      return {
        downloadUrl,
        expiresIn: 3600, // 1 heure
      };
    }),
});

