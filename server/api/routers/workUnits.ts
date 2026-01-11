import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { PLAN_FEATURES, getUpgradePlan, type Plan } from '@/lib/plans';

const createWorkUnitSchema = z.object({
  siteId: z.string().cuid(),
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  exposedCount: z.number().int().positive().optional(),
  responsibleName: z.string().optional(),
  responsibleEmail: z.string().email().optional().or(z.literal('')),
});

const updateWorkUnitSchema = createWorkUnitSchema.partial().extend({
  id: z.string().cuid(),
});

export const workUnitsRouter = createTRPCRouter({
  /**
   * Récupère toutes les unités de travail du tenant
   */
  getAll: authenticatedProcedure
    .input(
      z
        .object({
          siteId: z.string().cuid().optional(),
          companyId: z.string().cuid().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        site: {
          company: {
            tenantId: ctx.tenantId,
          },
        },
      };

      if (input?.siteId) {
        where.siteId = input.siteId;
      }

      if (input?.companyId) {
        where.site = {
          ...where.site,
          companyId: input.companyId,
        };
      }

      const workUnits = await ctx.prisma.workUnit.findMany({
        where,
        include: {
          site: {
            include: {
              company: {
                select: {
                  id: true,
                  legalName: true,
                },
              },
            },
          },
          suggestedSector: true,
          _count: {
            select: {
              riskAssessments: true,
              actionPlans: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return workUnits;
    }),

  /**
   * Récupère une unité de travail par son ID
   */
  getById: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const workUnit = await ctx.prisma.workUnit.findFirst({
        where: {
          id: input.id,
          site: {
            company: {
              tenantId: ctx.tenantId,
            },
          },
        },
        include: {
          site: {
            include: {
              company: true,
            },
          },
          suggestedSector: true,
          assignedUsers: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              riskAssessments: true,
              actionPlans: true,
            },
          },
        },
      });

      if (!workUnit) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Unité de travail non trouvée',
        });
      }

      return workUnit;
    }),

  /**
   * Crée une nouvelle unité de travail
   */
  create: authenticatedProcedure
    .input(createWorkUnitSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier la limite d'unités de travail
      const userPlan = (ctx.userProfile?.plan || 'free') as Plan;
      const planFeatures = PLAN_FEATURES[userPlan];
      
      // Note: FREE a maintenant 3 unités, STARTER a 10, PRO a 50
      // Plus besoin de bloquer si maxWorkUnits === 0 car aucun plan n'a 0
      if (planFeatures.maxWorkUnits !== Infinity) {
        const workUnitsCount = await ctx.prisma.workUnit.count({
          where: {
            site: {
              company: { tenantId: ctx.tenantId },
            },
          },
        });
        
        if (workUnitsCount >= planFeatures.maxWorkUnits) {
          const { PLAN_ERROR_MESSAGES, getUpgradePlan } = await import('@/lib/plans');
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.limit_exceeded(
              'workUnits',
              workUnitsCount,
              planFeatures.maxWorkUnits,
              userPlan,
              upgradePlan
            ),
          });
        }
      }

      // Vérifier que le site appartient au tenant
      const site = await ctx.prisma.site.findFirst({
        where: {
          id: input.siteId,
          company: {
            tenantId: ctx.tenantId,
          },
        },
      });

      if (!site) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Site non trouvé',
        });
      }

      const workUnit = await ctx.prisma.workUnit.create({
        data: {
          ...input,
          responsibleEmail:
            input.responsibleEmail === '' ? undefined : input.responsibleEmail,
        },
        include: {
          site: {
            include: {
              company: true,
            },
          },
        },
      });

      return workUnit;
    }),

  /**
   * Met à jour une unité de travail
   */
  update: authenticatedProcedure
    .input(updateWorkUnitSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Vérifier que l'unité de travail appartient au tenant
      const existing = await ctx.prisma.workUnit.findFirst({
        where: {
          id,
          site: {
            company: {
              tenantId: ctx.tenantId,
            },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Unité de travail non trouvée',
        });
      }

      // Si le site est modifié, vérifier qu'il appartient au tenant
      if (data.siteId && data.siteId !== existing.siteId) {
        const site = await ctx.prisma.site.findFirst({
          where: {
            id: data.siteId,
            company: {
              tenantId: ctx.tenantId,
            },
          },
        });

        if (!site) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Site non trouvé',
          });
        }
      }

      const workUnit = await ctx.prisma.workUnit.update({
        where: { id },
        data: {
          ...data,
          responsibleEmail:
            data.responsibleEmail === '' ? undefined : data.responsibleEmail,
        },
        include: {
          site: {
            include: {
              company: true,
            },
          },
        },
      });

      return workUnit;
    }),

  /**
   * Supprime une unité de travail
   */
  delete: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'unité de travail appartient au tenant
      const existing = await ctx.prisma.workUnit.findFirst({
        where: {
          id: input.id,
          site: {
            company: {
              tenantId: ctx.tenantId,
            },
          },
        },
        include: {
          _count: {
            select: {
              riskAssessments: true,
              actionPlans: true,
            },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Unité de travail non trouvée',
        });
      }

      // Vérifier qu'il n'y a pas de risques ou d'actions associés
      if (
        existing._count.riskAssessments > 0 ||
        existing._count.actionPlans > 0
      ) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message:
            'Impossible de supprimer une unité de travail avec des évaluations de risques ou des actions associées',
        });
      }

      await ctx.prisma.workUnit.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Assigner des utilisateurs à une unité de travail
   */
  assignUsers: authenticatedProcedure
    .input(
      z.object({
        workUnitId: z.string().cuid(),
        userIds: z.array(z.string().cuid()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'unité de travail appartient au tenant
      const workUnit = await ctx.prisma.workUnit.findFirst({
        where: {
          id: input.workUnitId,
          site: {
            company: {
              tenantId: ctx.tenantId,
            },
          },
        },
      });

      if (!workUnit) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Unité de travail non trouvée',
        });
      }

      // Vérifier que tous les utilisateurs appartiennent au tenant
      const users = await ctx.prisma.userProfile.findMany({
        where: {
          id: { in: input.userIds },
          tenantId: ctx.tenantId,
        },
      });

      if (users.length !== input.userIds.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Certains utilisateurs ne sont pas valides',
        });
      }

      // Mettre à jour les assignations
      await ctx.prisma.workUnit.update({
        where: { id: input.workUnitId },
        data: {
          assignedUsers: {
            set: input.userIds.map((id) => ({ id })),
          },
        },
      });

      return { success: true };
    }),
});

