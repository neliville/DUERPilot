import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

const createActivitySectorSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
  label: z.string().min(1, 'Le libellé est requis'),
  description: z.string().optional(),
  order: z.number().int().optional(),
  active: z.boolean().default(true),
});

const updateActivitySectorSchema = createActivitySectorSchema.partial().extend({
  id: z.string().cuid(),
});

export const activitySectorsRouter = createTRPCRouter({
  /**
   * Récupère tous les secteurs d'activité (globaux + tenant)
   */
  getAll: authenticatedProcedure
    .input(
      z
        .object({
          active: z.boolean().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        OR: [
          { tenantId: null }, // Secteurs globaux
          { tenantId: ctx.tenantId }, // Secteurs du tenant
        ],
      };

      if (input?.active !== undefined) {
        where.active = input.active;
      }

      if (input?.search) {
        where.OR = [
          ...where.OR,
          { label: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
          { code: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      const sectors = await ctx.prisma.activitySector.findMany({
        where,
        orderBy: [
          { isCustom: 'asc' }, // Secteurs globaux en premier
          { order: 'asc' },
          { label: 'asc' },
        ],
      });

      return sectors;
    }),

  /**
   * Récupère un secteur par son ID
   */
  getById: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const sector = await ctx.prisma.activitySector.findFirst({
        where: {
          id: input.id,
          OR: [
            { tenantId: null }, // Secteur global
            { tenantId: ctx.tenantId }, // Secteur du tenant
          ],
        },
      });

      if (!sector) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Secteur d\'activité non trouvé',
        });
      }

      return sector;
    }),

  /**
   * Crée un secteur personnalisé (tenant-specific)
   */
  create: authenticatedProcedure
    .input(createActivitySectorSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier si le code existe déjà (globaux + tenant)
      const existing = await ctx.prisma.activitySector.findUnique({
        where: { code: input.code },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Un secteur avec ce code existe déjà',
        });
      }

      const sector = await ctx.prisma.activitySector.create({
        data: {
          ...input,
          isCustom: true,
          tenantId: ctx.tenantId,
        },
      });

      return sector;
    }),

  /**
   * Modifie un secteur (seulement les secteurs personnalisés du tenant)
   */
  update: authenticatedProcedure
    .input(updateActivitySectorSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Vérifier que le secteur appartient au tenant
      const existing = await ctx.prisma.activitySector.findFirst({
        where: {
          id,
          tenantId: ctx.tenantId,
          isCustom: true, // Seulement les secteurs personnalisés peuvent être modifiés
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Secteur non trouvé ou non modifiable',
        });
      }

      // Si le code est modifié, vérifier qu'il n'existe pas déjà
      if (data.code && data.code !== existing.code) {
        const codeExists = await ctx.prisma.activitySector.findUnique({
          where: { code: data.code },
        });

        if (codeExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Un secteur avec ce code existe déjà',
          });
        }
      }

      const sector = await ctx.prisma.activitySector.update({
        where: { id },
        data,
      });

      return sector;
    }),

  /**
   * Supprime un secteur personnalisé
   */
  delete: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le secteur appartient au tenant et est personnalisé
      const existing = await ctx.prisma.activitySector.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
          isCustom: true,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Secteur non trouvé ou non supprimable',
        });
      }

      // Vérifier qu'aucune unité de travail n'utilise ce secteur
      const workUnitsUsingSector = await ctx.prisma.workUnit.count({
        where: { suggestedSectorId: input.id },
      });

      if (workUnitsUsingSector > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Impossible de supprimer : ${workUnitsUsingSector} unité(s) de travail utilise(nt) ce secteur`,
        });
      }

      await ctx.prisma.activitySector.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Suggère un secteur basé sur l'activité de l'entreprise
   */
  getSuggestedForCompany: authenticatedProcedure
    .input(z.object({ companyId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
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

      // Recherche basée sur le secteur et l'activité de l'entreprise
      let suggestedSector = null;

      if (company.sector) {
        // Recherche par code secteur
        suggestedSector = await ctx.prisma.activitySector.findFirst({
          where: {
            OR: [
              { code: { contains: company.sector, mode: 'insensitive' } },
              { label: { contains: company.sector, mode: 'insensitive' } },
            ],
            active: true,
            OR: [
              { tenantId: null },
              { tenantId: ctx.tenantId },
            ],
          },
          orderBy: { order: 'asc' },
        });
      }

      if (!suggestedSector && company.activity) {
        // Recherche par activité
        suggestedSector = await ctx.prisma.activitySector.findFirst({
          where: {
            OR: [
              { label: { contains: company.activity, mode: 'insensitive' } },
              { description: { contains: company.activity, mode: 'insensitive' } },
            ],
            active: true,
            OR: [
              { tenantId: null },
              { tenantId: ctx.tenantId },
            ],
          },
          orderBy: { order: 'asc' },
        });
      }

      return suggestedSector;
    }),
});

