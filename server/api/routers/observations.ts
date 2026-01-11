import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { PLAN_FEATURES, getUpgradePlan, type Plan } from '@/lib/plans';

const createObservationSchema = z.object({
  workUnitId: z.string().cuid(),
  description: z.string().min(1, 'La description est requise'),
  photoUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  status: z.enum(['nouvelle', 'en_analyse', 'intégrée', 'rejetée']).default('nouvelle'),
  riskAssessmentId: z.string().cuid().optional(),
});

const updateObservationSchema = createObservationSchema.partial().extend({
  id: z.string().cuid(),
});

export const observationsRouter = createTRPCRouter({
  /**
   * Récupère toutes les observations du tenant
   */
  getAll: authenticatedProcedure
    .input(
      z
        .object({
          workUnitId: z.string().cuid().optional(),
          status: z.enum(['nouvelle', 'en_analyse', 'intégrée', 'rejetée']).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        workUnit: {
          site: {
            company: {
              tenantId: ctx.tenantId,
            },
          },
        },
      };

      if (input?.workUnitId) {
        where.workUnitId = input.workUnitId;
      }

      if (input?.status) {
        where.status = input.status;
      }

      const observations = await ctx.prisma.observation.findMany({
        where,
        include: {
          workUnit: {
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
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return observations;
    }),

  /**
   * Récupère une observation par son ID
   */
  getById: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const observation = await ctx.prisma.observation.findFirst({
        where: {
          id: input.id,
          workUnit: {
            site: {
              company: {
                tenantId: ctx.tenantId,
              },
            },
          },
        },
        include: {
          workUnit: {
            include: {
              site: {
                include: {
                  company: true,
                },
              },
            },
          },
        },
      });

      if (!observation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Observation non trouvée',
        });
      }

      return observation;
    }),

  /**
   * Crée une nouvelle observation
   */
  create: authenticatedProcedure
    .input(createObservationSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier le quota mensuel d'observations
      const userPlan = (ctx.userProfile?.plan || 'free') as Plan;
      const planFeatures = PLAN_FEATURES[userPlan];
      
      if (planFeatures.maxObservationsPerMonth !== Infinity) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const observationsCount = await ctx.prisma.observation.count({
          where: {
            workUnit: {
              site: {
                company: { tenantId: ctx.tenantId },
              },
            },
            createdAt: {
              gte: monthStart,
            },
          },
        });
        
        if (observationsCount >= planFeatures.maxObservationsPerMonth) {
          const { PLAN_ERROR_MESSAGES } = await import('@/lib/plans');
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.limit_exceeded(
              'observations',
              observationsCount,
              planFeatures.maxObservationsPerMonth,
              userPlan,
              upgradePlan
            ),
          });
        }
      }

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

      const observation = await ctx.prisma.observation.create({
        data: {
          tenantId: ctx.tenantId,
          workUnitId: input.workUnitId,
          description: input.description,
          photoUrl: input.photoUrl === '' ? undefined : input.photoUrl,
          location: input.location,
          status: input.status,
          submittedByEmail: ctx.userProfile?.email || ctx.user?.email || '',
          integratedRiskAssessmentId: input.riskAssessmentId || undefined,
        },
        include: {
          workUnit: {
            include: {
              site: {
                include: {
                  company: true,
                },
              },
            },
          },
        },
      });

      return observation;
    }),

  /**
   * Met à jour une observation
   */
  update: authenticatedProcedure
    .input(updateObservationSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Vérifier que l'observation appartient au tenant
      const existing = await ctx.prisma.observation.findFirst({
        where: {
          id,
          workUnit: {
            site: {
              company: {
                tenantId: ctx.tenantId,
              },
            },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Observation non trouvée',
        });
      }

      const observation = await ctx.prisma.observation.update({
        where: { id },
        data: {
          description: data.description,
          photoUrl: data.photoUrl === '' ? undefined : data.photoUrl,
          location: data.location,
          status: data.status,
          integratedRiskAssessmentId: data.riskAssessmentId || undefined,
        },
        include: {
          workUnit: {
            include: {
              site: {
                include: {
                  company: true,
                },
              },
            },
          },
        },
      });

      return observation;
    }),

  /**
   * Supprime une observation
   */
  delete: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'observation appartient au tenant
      const existing = await ctx.prisma.observation.findFirst({
        where: {
          id: input.id,
          workUnit: {
            site: {
              company: {
                tenantId: ctx.tenantId,
              },
            },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Observation non trouvée',
        });
      }

      await ctx.prisma.observation.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Change le statut d'une observation
   */
  updateStatus: authenticatedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        status: z.enum(['nouvelle', 'en_analyse', 'intégrée', 'rejetée']),
        riskAssessmentId: z.string().cuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'observation appartient au tenant
      const existing = await ctx.prisma.observation.findFirst({
        where: {
          id: input.id,
          workUnit: {
            site: {
              company: {
                tenantId: ctx.tenantId,
              },
            },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Observation non trouvée',
        });
      }

      const observation = await ctx.prisma.observation.update({
        where: { id: input.id },
        data: {
          status: input.status,
          integratedRiskAssessmentId: input.riskAssessmentId || undefined,
        },
      });

      return observation;
    }),
});

