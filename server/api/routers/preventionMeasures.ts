import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

const createPreventionMeasureSchema = z.object({
  riskAssessmentId: z.string().cuid(),
  type: z.enum(['technique', 'organisationnelle', 'humaine', 'collective', 'individuelle']),
  description: z.string().min(1, 'La description est requise'),
  existing: z.boolean().default(false),
  effectiveness: z.number().int().min(1).max(4).optional(),
  priority: z.enum(['basse', 'moyenne', 'haute', 'critique']).optional(),
  aiSuggested: z.boolean().default(false),
});

const updatePreventionMeasureSchema = createPreventionMeasureSchema.partial().extend({
  id: z.string().cuid(),
});

export const preventionMeasuresRouter = createTRPCRouter({
  /**
   * Récupère les mesures d'une évaluation de risque
   */
  getByRiskAssessment: authenticatedProcedure
    .input(z.object({ riskAssessmentId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      // Vérifier que l'évaluation appartient au tenant
      const riskAssessment = await ctx.prisma.riskAssessment.findFirst({
        where: {
          id: input.riskAssessmentId,
          workUnit: {
            site: {
              company: {
                tenantId: ctx.tenantId,
              },
            },
          },
        },
      });

      if (!riskAssessment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Évaluation de risque non trouvée',
        });
      }

      const measures = await ctx.prisma.preventionMeasure.findMany({
        where: {
          riskAssessmentId: input.riskAssessmentId,
        },
        include: {
          actionPlans: {
            where: {
              status: { not: 'terminé' },
            },
          },
        },
        orderBy: [
          { priority: 'asc' },
          { existing: 'asc' }, // Mesures à mettre en place en premier
          { createdAt: 'asc' },
        ],
      });

      return measures;
    }),

  /**
   * Crée une mesure de prévention
   */
  create: authenticatedProcedure
    .input(createPreventionMeasureSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'évaluation appartient au tenant
      const riskAssessment = await ctx.prisma.riskAssessment.findFirst({
        where: {
          id: input.riskAssessmentId,
          workUnit: {
            site: {
              company: {
                tenantId: ctx.tenantId,
              },
            },
          },
        },
      });

      if (!riskAssessment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Évaluation de risque non trouvée',
        });
      }

      const measure = await ctx.prisma.preventionMeasure.create({
        data: input,
        include: {
          riskAssessment: {
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
          },
        },
      });

      return measure;
    }),

  /**
   * Modifie une mesure de prévention
   */
  update: authenticatedProcedure
    .input(updatePreventionMeasureSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Vérifier que la mesure appartient au tenant
      const existing = await ctx.prisma.preventionMeasure.findFirst({
        where: {
          id,
          riskAssessment: {
            workUnit: {
              site: {
                company: {
                  tenantId: ctx.tenantId,
                },
              },
            },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Mesure de prévention non trouvée',
        });
      }

      // Vérifier le riskAssessmentId si modifié
      if (data.riskAssessmentId && data.riskAssessmentId !== existing.riskAssessmentId) {
        const riskAssessment = await ctx.prisma.riskAssessment.findFirst({
          where: {
            id: data.riskAssessmentId,
            workUnit: {
              site: {
                company: {
                  tenantId: ctx.tenantId,
                },
              },
            },
          },
        });

        if (!riskAssessment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Évaluation de risque non trouvée',
          });
        }
      }

      const measure = await ctx.prisma.preventionMeasure.update({
        where: { id },
        data,
        include: {
          riskAssessment: true,
          actionPlans: true,
        },
      });

      return measure;
    }),

  /**
   * Supprime une mesure de prévention
   */
  delete: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que la mesure appartient au tenant
      const existing = await ctx.prisma.preventionMeasure.findFirst({
        where: {
          id: input.id,
          riskAssessment: {
            workUnit: {
              site: {
                company: {
                  tenantId: ctx.tenantId,
                },
              },
            },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Mesure de prévention non trouvée',
        });
      }

      // Vérifier qu'aucun plan d'action n'utilise cette mesure
      const actionPlansUsingMeasure = await ctx.prisma.actionPlan.count({
        where: { preventionMeasureId: input.id },
      });

      if (actionPlansUsingMeasure > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Impossible de supprimer : ${actionPlansUsingMeasure} plan(s) d'action utilise(nt) cette mesure`,
        });
      }

      await ctx.prisma.preventionMeasure.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Obtenir des suggestions IA de mesures de prévention
   * Note : L'IA assiste mais ne décide jamais - l'utilisateur valide
   */
  getAISuggestions: authenticatedProcedure
    .input(
      z.object({
        riskAssessmentId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Vérifier que l'évaluation appartient au tenant
      const riskAssessment = await ctx.prisma.riskAssessment.findFirst({
        where: {
          id: input.riskAssessmentId,
          workUnit: {
            site: {
              company: {
                tenantId: ctx.tenantId,
              },
            },
          },
        },
        include: {
          dangerousSituation: {
            include: {
              category: true,
            },
          },
          workUnit: {
            include: {
              suggestedSector: true,
            },
          },
        },
      });

      if (!riskAssessment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Évaluation de risque non trouvée',
        });
      }

      // TODO: Implémenter l'appel à l'IA pour générer des suggestions
      // Pour l'instant, retourner un tableau vide
      // L'IA doit :
      // - Analyser la situation dangereuse
      // - Analyser la cotation (gravité, probabilité)
      // - Proposer des mesures adaptées avec raisonnement
      // - Ne JAMAIS certifier la conformité
      // - Ne JAMAIS imposer de mesures

      return {
        suggestions: [] as Array<{
          type: 'technique' | 'organisationnelle' | 'humaine' | 'collective' | 'individuelle';
          description: string;
          effectiveness: 1 | 2 | 3 | 4;
          reasoning: string;
          estimatedCost?: string;
        }>,
        message: 'Suggestions IA non implémentées - À venir',
      };
    }),
});

