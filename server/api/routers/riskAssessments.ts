import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { calculateRiskScore, getPriorityLevel } from '@/lib/utils';
import { hasMethodAccess, PLAN_FEATURES, type Plan } from '@/lib/plans';

const createRiskAssessmentSchema = z.object({
  workUnitId: z.string().cuid(),
  situationId: z.string().cuid(), // Nouveau champ (remplace hazardRefId)
  contextDescription: z.string().min(1, 'La description contextuelle est requise'),
  exposedPersons: z.string().optional(),
  frequency: z.number().int().min(1).max(4),
  probability: z.number().int().min(1).max(4),
  severity: z.number().int().min(1).max(4),
  control: z.number().int().min(1).max(4),
  existingMeasures: z.string().optional(),
  source: z.enum(['manual', 'ai_assisted', 'imported']).default('manual'),
});

const updateRiskAssessmentSchema = createRiskAssessmentSchema.partial().extend({
  id: z.string().cuid(),
});

export const riskAssessmentsRouter = createTRPCRouter({
  /**
   * Récupère toutes les évaluations de risques du tenant
   */
  getAll: authenticatedProcedure
    .input(
      z
        .object({
          workUnitId: z.string().cuid().optional(),
          situationId: z.string().cuid().optional(),
          priorityLevel: z.enum(['faible', 'à_améliorer', 'prioritaire']).optional(),
          categoryCode: z.string().optional(),
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

      if (input?.situationId) {
        where.situationId = input.situationId;
      }

      if (input?.priorityLevel) {
        where.priorityLevel = input.priorityLevel;
      }

      if (input?.categoryCode) {
        // Filtrer par code de catégorie via la relation dangerousSituation
        const category = await ctx.prisma.dangerCategory.findUnique({
          where: { code: input.categoryCode },
        });
        if (category) {
          where.dangerousSituation = {
            categoryId: category.id,
          };
        }
      }

      const assessments = await ctx.prisma.riskAssessment.findMany({
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
          dangerousSituation: {
            include: {
              category: true,
            },
          },
          preventionMeasures: {
            select: {
              id: true,
              type: true,
              description: true,
              existing: true,
            },
          },
          _count: {
            select: {
              actionPlans: true,
              preventionMeasures: true,
            },
          },
        },
        orderBy: [
          { riskScore: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      return assessments;
    }),

  /**
   * Récupère une évaluation par son ID
   */
  getById: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const assessment = await ctx.prisma.riskAssessment.findFirst({
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
          dangerousSituation: {
            include: {
              category: true,
            },
          },
          preventionMeasures: {
            include: {
              actionPlans: true,
            },
          },
          actionPlans: {
            orderBy: {
              priority: 'desc',
            },
          },
        },
      });

      if (!assessment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Évaluation de risque non trouvée',
        });
      }

      return assessment;
    }),

  /**
   * Crée une nouvelle évaluation de risque
   */
  create: authenticatedProcedure
    .input(createRiskAssessmentSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le plan permet la méthode classique
      // Note: Méthode classique disponible dès Starter dans v2
      const userPlan = (ctx.userProfile?.plan || 'free') as Plan;
      if (!hasMethodAccess(userPlan, 'classic')) {
        const { PLAN_ERROR_MESSAGES } = await import('@/lib/plans');
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: PLAN_ERROR_MESSAGES.method_not_available('classic', userPlan, 'starter'),
        });
      }

      // Vérifier les limites du plan
      const planFeatures = PLAN_FEATURES[userPlan];
      
      // Vérifier limite unités de travail
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

      // Vérifier limite risques/mois
      if (planFeatures.maxRisksPerMonth !== Infinity) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const risksCount = await ctx.prisma.riskAssessment.count({
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
        if (risksCount >= planFeatures.maxRisksPerMonth) {
          const { PLAN_ERROR_MESSAGES, getUpgradePlan } = await import('@/lib/plans');
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.limit_exceeded(
              'risks',
              risksCount,
              planFeatures.maxRisksPerMonth,
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

      // Vérifier que la situation dangereuse existe
      const situation = await ctx.prisma.dangerousSituation.findFirst({
        where: {
          id: input.situationId,
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

      // Calculer le score et le niveau de priorité (F x P x G)
      const riskScore = calculateRiskScore(
        input.frequency,
        input.probability,
        input.severity,
        input.control
      );
      const priorityLevel = getPriorityLevel(riskScore);

      const assessment = await ctx.prisma.riskAssessment.create({
        data: {
          workUnitId: input.workUnitId,
          situationId: input.situationId,
          contextDescription: input.contextDescription,
          exposedPersons: input.exposedPersons,
          frequency: input.frequency,
          probability: input.probability,
          severity: input.severity,
          control: input.control,
          existingMeasures: input.existingMeasures,
          source: input.source,
          riskScore,
          priorityLevel,
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
          dangerousSituation: {
            include: {
              category: true,
            },
          },
          preventionMeasures: true,
        },
      });

      return assessment;
    }),

  /**
   * Met à jour une évaluation de risque
   */
  update: authenticatedProcedure
    .input(updateRiskAssessmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Vérifier que l'évaluation appartient au tenant
      const existing = await ctx.prisma.riskAssessment.findFirst({
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
          message: 'Évaluation de risque non trouvée',
        });
      }

      // Recalculer le score si les cotations changent
      let riskScore = existing.riskScore;
      let priorityLevel = existing.priorityLevel;

      if (
        data.frequency !== undefined ||
        data.probability !== undefined ||
        data.severity !== undefined ||
        data.control !== undefined
      ) {
        const frequency = data.frequency ?? existing.frequency;
        const probability = data.probability ?? existing.probability;
        const severity = data.severity ?? existing.severity;
        const control = data.control ?? existing.control;

        riskScore = calculateRiskScore(frequency, probability, severity, control);
        priorityLevel = getPriorityLevel(riskScore);
      }

      const assessment = await ctx.prisma.riskAssessment.update({
        where: { id },
        data: {
          ...data,
          riskScore,
          priorityLevel,
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
          dangerousSituation: {
            include: {
              category: true,
            },
          },
          preventionMeasures: true,
        },
      });

      return assessment;
    }),

  /**
   * Supprime une évaluation de risque
   */
  delete: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'évaluation appartient au tenant
      const existing = await ctx.prisma.riskAssessment.findFirst({
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
          _count: {
            select: {
              actionPlans: true,
            },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Évaluation de risque non trouvée',
        });
      }

      // Vérifier qu'il n'y a pas d'actions associées
      if (existing._count.actionPlans > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message:
            'Impossible de supprimer une évaluation avec des actions associées',
        });
      }

      await ctx.prisma.riskAssessment.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Valide une évaluation de risque
   */
  validate: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'évaluation appartient au tenant
      const existing = await ctx.prisma.riskAssessment.findFirst({
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
          message: 'Évaluation de risque non trouvée',
        });
      }

      const assessment = await ctx.prisma.riskAssessment.update({
        where: { id: input.id },
        data: {
          validatedBy: ctx.userProfile?.email || ctx.user?.email || '',
          validatedAt: new Date(),
        },
      });

      return assessment;
    }),

  /**
   * Obtenir des suggestions IA pour l'évaluation des risques
   * Note : L'IA assiste mais ne décide jamais - l'utilisateur valide toujours
   */
  getAISuggestions: authenticatedProcedure
    .input(
      z.object({
        workUnitId: z.string().cuid(),
        situationId: z.string().cuid().optional(),
        contextDescription: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
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

      // TODO: Implémenter l'appel à l'IA pour générer des suggestions
      // Pour l'instant, retourner un tableau vide
      // L'IA doit :
      // - Analyser la situation dangereuse si fournie
      // - Analyser le contexte (description, secteur)
      // - Suggérer des situations dangereuses fréquentes pour ce secteur
      // - Suggérer des cotations possibles (F, P, G) avec raisonnement
      // - Ne JAMAIS certifier la conformité
      // - Ne JAMAIS imposer de niveau de risque

      return {
        suggestedSituations: [] as Array<{
          situationId: string;
          label: string;
          category: string;
          confidence: number;
          reasoning: string;
        }>,
        suggestedCotation: null as {
          frequency: number;
          probability: number;
          severity: number;
          reasoning: string;
        } | null,
        message: 'Suggestions IA non implémentées - À venir',
      };
    }),
});


