import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

const createDangerousSituationSchema = z.object({
  categoryId: z.string().cuid(),
  code: z.string().min(1, 'Le code est requis'),
  label: z.string().min(1, 'Le libellé est requis'),
  description: z.string().optional(),
  examples: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  suggestedSector: z.string().optional(),
  mandatory: z.boolean().default(false),
});

const updateDangerousSituationSchema = createDangerousSituationSchema.partial().extend({
  id: z.string().cuid(),
});

export const dangerousSituationsRouter = createTRPCRouter({
  /**
   * Récupère toutes les situations dangereuses (avec filtres)
   */
  getAll: authenticatedProcedure
    .input(
      z
        .object({
          categoryId: z.string().cuid().optional(),
          categoryCode: z.string().optional(),
          sectorCode: z.string().optional(),
          search: z.string().optional(),
          mandatory: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      // Construire la condition pour les situations globales et du tenant
      // Note: tenantId peut venir de ctx.tenantId (via enforceTenant) ou ctx.userProfile?.tenantId
      const tenantId = ctx.tenantId || ctx.userProfile?.tenantId;
      
      // Construire la condition OR pour les situations globales et du tenant
      // Utiliser une syntaxe Prisma compatible avec null
      const tenantCondition: any = tenantId
        ? {
            OR: [
              { tenantId: null }, // Situations globales (communes à tous)
              { tenantId }, // Situations du tenant
            ],
          }
        : { tenantId: null }; // Si pas de tenantId, seulement les situations globales
      
      // Construire le where de base avec le filtre tenant
      const where: any = {
        ...tenantCondition,
      };

      if (input?.categoryId) {
        where.categoryId = input.categoryId;
      }

      if (input?.categoryCode) {
        // Chercher la catégorie par code
        const category = await ctx.prisma.dangerCategory.findUnique({
          where: { code: input.categoryCode },
        });
        if (category) {
          where.categoryId = category.id;
        }
      }

      if (input?.sectorCode) {
        // Filtrer par secteur suggéré
        const sectorCondition = {
          OR: [
            { suggestedSector: input.sectorCode },
            { suggestedSector: null }, // Situations communes
          ],
        };
        
        // Combiner avec le filtre tenant
        if (where.OR) {
          // Si on a déjà un OR pour tenantId, créer un AND
          where.AND = [
            tenantCondition,
            sectorCondition,
          ];
          delete where.OR;
        } else {
          where.AND = [
            tenantCondition,
            sectorCondition,
          ];
        }
      }

      if (input?.mandatory !== undefined) {
        where.mandatory = input.mandatory;
      }

      if (input?.search) {
        const searchConditions = {
          OR: [
            { label: { contains: input.search, mode: 'insensitive' } },
            { description: { contains: input.search, mode: 'insensitive' } },
            { examples: { contains: input.search, mode: 'insensitive' } },
            { keywords: { has: input.search } },
            { code: { contains: input.search, mode: 'insensitive' } },
          ],
        };

        if (where.AND) {
          where.AND.push(searchConditions);
        } else {
          where.AND = [searchConditions];
        }
      }

      // Debug: logger pour comprendre le problème
      console.log('[dangerousSituations.getAll] Debug:', {
        tenantId,
        hasUserProfile: !!ctx.userProfile,
        userProfileTenantId: ctx.userProfile?.tenantId,
        whereCondition: JSON.stringify(where, null, 2),
      });

      const situations = await ctx.prisma.dangerousSituation.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: [
          { isCustom: 'asc' }, // Situations globales en premier
          { category: { order: 'asc' } },
          { label: 'asc' },
        ],
      });

      console.log('[dangerousSituations.getAll] Résultat:', {
        count: situations.length,
        firstSituation: situations[0] ? { id: situations[0].id, label: situations[0].label, tenantId: situations[0].tenantId } : null,
      });

      return situations;
    }),

  /**
   * Récupère une situation par son ID
   */
  getById: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const situation = await ctx.prisma.dangerousSituation.findFirst({
        where: {
          id: input.id,
          OR: [
            { tenantId: null }, // Situation globale
            { tenantId: ctx.tenantId }, // Situation du tenant
          ],
        },
        include: {
          category: true,
        },
      });

      if (!situation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Situation dangereuse non trouvée',
        });
      }

      return situation;
    }),

  /**
   * Récupère les situations d'une catégorie
   */
  getByCategory: authenticatedProcedure
    .input(z.object({ categoryId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const situations = await ctx.prisma.dangerousSituation.findMany({
        where: {
          categoryId: input.categoryId,
          OR: [
            { tenantId: null },
            { tenantId: ctx.tenantId },
          ],
        },
        include: {
          category: true,
        },
        orderBy: { label: 'asc' },
      });

      return situations;
    }),

  /**
   * Suggère des situations basées sur le secteur de l'unité de travail
   */
  getSuggestedForWorkUnit: authenticatedProcedure
    .input(z.object({ workUnitId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const workUnit = await ctx.prisma.workUnit.findFirst({
        where: {
          id: input.workUnitId,
          site: {
            company: {
              tenantId: ctx.tenantId,
            },
          },
        },
        include: {
          suggestedSector: true,
        },
      });

      if (!workUnit) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Unité de travail non trouvée',
        });
      }

      const where: any = {
        OR: [
          { tenantId: null },
          { tenantId: ctx.tenantId },
        ],
      };

      // Si l'unité a un secteur suggéré, filtrer par ce secteur
      if (workUnit.suggestedSector) {
        where.OR = [
          { suggestedSector: workUnit.suggestedSector.code },
          { suggestedSector: null }, // Situations communes
        ];
        where.AND = [
          { OR: [{ tenantId: null }, { tenantId: ctx.tenantId }] },
          where.OR,
        ];
        delete where.OR;
      }

      const situations = await ctx.prisma.dangerousSituation.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: [
          { mandatory: 'desc' }, // Situations obligatoires en premier
          { category: { order: 'asc' } },
          { label: 'asc' },
        ],
      });

      return situations;
    }),

  /**
   * Recherche full-text dans les situations
   */
  search: authenticatedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const situations = await ctx.prisma.dangerousSituation.findMany({
        where: {
          OR: [
            { tenantId: null },
            { tenantId: ctx.tenantId },
          ],
          OR: [
            { label: { contains: input.query, mode: 'insensitive' } },
            { description: { contains: input.query, mode: 'insensitive' } },
            { examples: { contains: input.query, mode: 'insensitive' } },
            { keywords: { has: input.query } },
            { code: { contains: input.query, mode: 'insensitive' } },
          ],
        },
        include: {
          category: true,
        },
        orderBy: [
          { isCustom: 'asc' },
          { category: { order: 'asc' } },
          { label: 'asc' },
        ],
        take: 50, // Limiter les résultats
      });

      return situations;
    }),

  /**
   * Crée une situation personnalisée (tenant-specific)
   */
  create: authenticatedProcedure
    .input(createDangerousSituationSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier que la catégorie existe
      const category = await ctx.prisma.dangerCategory.findUnique({
        where: { id: input.categoryId },
      });

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Catégorie de danger non trouvée',
        });
      }

      // Vérifier si le code existe déjà
      const existing = await ctx.prisma.dangerousSituation.findUnique({
        where: { code: input.code },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Une situation avec ce code existe déjà',
        });
      }

      // Vérifier le secteur suggéré s'il est fourni
      if (input.suggestedSector) {
        const sector = await ctx.prisma.activitySector.findUnique({
          where: { code: input.suggestedSector },
        });

        if (!sector) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Secteur suggéré non trouvé',
          });
        }
      }

      const situation = await ctx.prisma.dangerousSituation.create({
        data: {
          ...input,
          isCustom: true,
          tenantId: ctx.tenantId,
        },
        include: {
          category: true,
        },
      });

      return situation;
    }),

  /**
   * Modifie une situation (seulement les situations personnalisées du tenant)
   */
  update: authenticatedProcedure
    .input(updateDangerousSituationSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Vérifier que la situation appartient au tenant
      const existing = await ctx.prisma.dangerousSituation.findFirst({
        where: {
          id,
          tenantId: ctx.tenantId,
          isCustom: true,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Situation non trouvée ou non modifiable',
        });
      }

      // Si le code est modifié, vérifier qu'il n'existe pas déjà
      if (data.code && data.code !== existing.code) {
        const codeExists = await ctx.prisma.dangerousSituation.findUnique({
          where: { code: data.code },
        });

        if (codeExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Une situation avec ce code existe déjà',
          });
        }
      }

      // Vérifier la catégorie si elle est modifiée
      if (data.categoryId) {
        const category = await ctx.prisma.dangerCategory.findUnique({
          where: { id: data.categoryId },
        });

        if (!category) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Catégorie de danger non trouvée',
          });
        }
      }

      // Vérifier le secteur suggéré s'il est modifié
      if (data.suggestedSector !== undefined) {
        if (data.suggestedSector) {
          const sector = await ctx.prisma.activitySector.findUnique({
            where: { code: data.suggestedSector },
          });

          if (!sector) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Secteur suggéré non trouvé',
            });
          }
        }
      }

      const situation = await ctx.prisma.dangerousSituation.update({
        where: { id },
        data,
        include: {
          category: true,
        },
      });

      return situation;
    }),

  /**
   * Supprime une situation personnalisée
   */
  delete: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que la situation appartient au tenant et est personnalisée
      const existing = await ctx.prisma.dangerousSituation.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
          isCustom: true,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Situation non trouvée ou non supprimable',
        });
      }

      // Vérifier qu'aucune évaluation de risque n'utilise cette situation
      const riskAssessmentsUsingSituation = await ctx.prisma.riskAssessment.count({
        where: { situationId: input.id },
      });

      if (riskAssessmentsUsingSituation > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Impossible de supprimer : ${riskAssessmentsUsingSituation} évaluation(s) de risque utilise(nt) cette situation`,
        });
      }

      await ctx.prisma.dangerousSituation.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

