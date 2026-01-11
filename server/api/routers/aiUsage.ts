import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { PLAN_FEATURES, PLAN_ERROR_MESSAGES, getUpgradePlan, type Plan } from '@/lib/plans';
import type { AIUsageType } from '@/types';

/**
 * Router pour la gestion des quotas et de l'usage IA
 */
export const aiUsageRouter = createTRPCRouter({
  /**
   * Récupère l'usage IA du mois en cours pour le tenant
   */
  getCurrentUsage: authenticatedProcedure.query(async ({ ctx }) => {
    const userPlan = (ctx.userProfile?.plan || 'free') as Plan;
    const planFeatures = PLAN_FEATURES[userPlan];

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Compter l'usage par type depuis AIUsageLog
    const usageLogs = await ctx.prisma.aIUsageLog.findMany({
      where: {
        tenantId: ctx.tenantId,
        userId: ctx.userProfile.id,
        createdAt: {
          gte: monthStart,
        },
      },
      select: {
        function: true,
        createdAt: true,
      },
    });

    // Mapper les fonctions aux types IA
    const suggestionsRisksCount = usageLogs.filter(
      (log) => log.function === 'suggestions_risques' || log.function === 'risk_suggestions'
    ).length;

    const suggestionsActionsCount = usageLogs.filter(
      (log) => log.function === 'suggestions_actions' || log.function === 'action_suggestions'
    ).length;

    // Reformulation : quota journalier technique (300/jour) mais affiché comme illimité
    // On compte quand même pour statistiques mais ne bloque pas
    const reformulationsCount = usageLogs.filter(
      (log) => log.function === 'reformulation' || log.function === 'reformat'
    ).length;

    return {
      suggestions_risques: {
        used: suggestionsRisksCount,
        limit: planFeatures.maxAISuggestionsRisks,
        available: planFeatures.maxAISuggestionsRisks === Infinity
          ? Infinity
          : Math.max(0, planFeatures.maxAISuggestionsRisks - suggestionsRisksCount),
      },
      suggestions_actions: {
        used: suggestionsActionsCount,
        limit: planFeatures.maxAISuggestionsActions,
        available: planFeatures.maxAISuggestionsActions === Infinity
          ? Infinity
          : Math.max(0, planFeatures.maxAISuggestionsActions - suggestionsActionsCount),
      },
      reformulation: {
        used: reformulationsCount,
        limit: planFeatures.hasAIReformulation ? 'unlimited' : 0,
        available: planFeatures.hasAIReformulation ? 'unlimited' : 0,
        // Note: Limite technique de 300/jour mais non affichée à l'utilisateur
        dailyLimit: 300,
      },
      monthStart,
      plan: userPlan,
    };
  }),

  /**
   * Vérifie si un type d'usage IA est disponible pour le tenant
   */
  checkQuota: authenticatedProcedure
    .input(
      z.object({
        usageType: z.enum(['suggestions_risques', 'suggestions_actions', 'reformulation']),
      })
    )
    .query(async ({ ctx, input }) => {
      const userPlan = (ctx.userProfile?.plan || 'free') as Plan;
      const planFeatures = PLAN_FEATURES[userPlan];

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      if (input.usageType === 'reformulation') {
        if (!planFeatures.hasAIReformulation) {
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.feature_not_available('reformulation', userPlan, upgradePlan || 'pro'),
          });
        }

        // Vérifier la limite journalière technique (300/jour)
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayReformulations = await ctx.prisma.aIUsageLog.count({
          where: {
            tenantId: ctx.tenantId,
            userId: ctx.userProfile.id,
            function: {
              in: ['reformulation', 'reformat'],
            },
            createdAt: {
              gte: todayStart,
            },
          },
        });

        if (todayReformulations >= 300) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Limite technique journalière atteinte pour la reformulation. Réessayez demain.',
          });
        }

        return { available: true, quota: 'unlimited' };
      }

      if (input.usageType === 'suggestions_risques') {
        if (planFeatures.maxAISuggestionsRisks === 0) {
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.feature_not_available('ia', userPlan, upgradePlan || 'pro'),
          });
        }

        if (planFeatures.maxAISuggestionsRisks === Infinity) {
          return { available: true, quota: Infinity };
        }

        const suggestionsRisksCount = await ctx.prisma.aIUsageLog.count({
          where: {
            tenantId: ctx.tenantId,
            userId: ctx.userProfile.id,
            function: {
              in: ['suggestions_risques', 'risk_suggestions'],
            },
            createdAt: {
              gte: monthStart,
            },
          },
        });

        if (suggestionsRisksCount >= planFeatures.maxAISuggestionsRisks) {
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.quota_exceeded(
              suggestionsRisksCount,
              planFeatures.maxAISuggestionsRisks,
              userPlan,
              upgradePlan,
              'risks'
            ),
          });
        }

        return {
          available: true,
          quota: planFeatures.maxAISuggestionsRisks - suggestionsRisksCount,
        };
      }

      if (input.usageType === 'suggestions_actions') {
        if (planFeatures.maxAISuggestionsActions === 0) {
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.feature_not_available('suggestions_actions', userPlan, upgradePlan || 'expert'),
          });
        }

        if (planFeatures.maxAISuggestionsActions === Infinity) {
          return { available: true, quota: Infinity };
        }

        const suggestionsActionsCount = await ctx.prisma.aIUsageLog.count({
          where: {
            tenantId: ctx.tenantId,
            userId: ctx.userProfile.id,
            function: {
              in: ['suggestions_actions', 'action_suggestions'],
            },
            createdAt: {
              gte: monthStart,
            },
          },
        });

        if (suggestionsActionsCount >= planFeatures.maxAISuggestionsActions) {
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.quota_exceeded(
              suggestionsActionsCount,
              planFeatures.maxAISuggestionsActions,
              userPlan,
              upgradePlan,
              'actions'
            ),
          });
        }

        return {
          available: true,
          quota: planFeatures.maxAISuggestionsActions - suggestionsActionsCount,
        };
      }

      return { available: false, quota: 0 };
    }),

  /**
   * Enregistre un usage IA (appelé après chaque utilisation effective)
   */
  logUsage: authenticatedProcedure
    .input(
      z.object({
        usageType: z.enum(['suggestions_risques', 'suggestions_actions', 'reformulation']),
        provider: z.string(),
        model: z.string(),
        inputTokens: z.number().int(),
        outputTokens: z.number().int(),
        totalTokens: z.number().int(),
        estimatedCost: z.number(),
        companyId: z.string().cuid().optional(),
        confidence: z.number().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Mapper le type d'usage au champ function d'AIUsageLog
      const functionMap: Record<AIUsageType, string> = {
        suggestions_risques: 'suggestions_risques',
        suggestions_actions: 'suggestions_actions',
        reformulation: 'reformulation',
      };

      const log = await ctx.prisma.aIUsageLog.create({
        data: {
          tenantId: ctx.tenantId,
          userId: ctx.userProfile.id,
          companyId: input.companyId,
          function: functionMap[input.usageType],
          provider: input.provider,
          model: input.model,
          inputTokens: input.inputTokens,
          outputTokens: input.outputTokens,
          totalTokens: input.totalTokens,
          estimatedCost: input.estimatedCost,
          confidence: input.confidence,
          metadata: input.metadata || {},
          result: 'pending', // À valider/rejeter par l'utilisateur
        },
      });

      return { id: log.id, createdAt: log.createdAt };
    }),
});

