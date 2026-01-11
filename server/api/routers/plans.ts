import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import {
  PLAN_FEATURES,
  PLAN_PRICES,
  PLAN_NAMES,
  PLAN_DESCRIPTIONS,
  getUpgradePlan,
  type Plan,
} from '@/lib/plans';

export const plansRouter = createTRPCRouter({
  /**
   * Récupère les informations du plan de l'utilisateur
   */
  getCurrentPlan: authenticatedProcedure.query(async ({ ctx }) => {
    const userPlan = (ctx.userProfile?.plan || 'free') as Plan;
    const features = PLAN_FEATURES[userPlan];
    const price = PLAN_PRICES[userPlan];
    const name = PLAN_NAMES[userPlan];
    const description = PLAN_DESCRIPTIONS[userPlan];

    // Récupérer l'utilisation IA du mois en cours (nouveaux quotas)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Compter les usages IA par type depuis AIUsageLog
    const aiUsageLogs = await ctx.prisma.aIUsageLog.findMany({
      where: {
        tenantId: ctx.tenantId,
        userId: ctx.userProfile!.id,
        createdAt: {
          gte: monthStart,
        },
      },
      select: {
        function: true,
      },
    });

    const suggestionsRisksCount = aiUsageLogs.filter(
      (log) => log.function === 'suggestions_risques' || log.function === 'risk_suggestions'
    ).length;

    const suggestionsActionsCount = aiUsageLogs.filter(
      (log) => log.function === 'suggestions_actions' || log.function === 'action_suggestions'
    ).length;

    const reformulationsCount = aiUsageLogs.filter(
      (log) => log.function === 'reformulation' || log.function === 'reformat'
    ).length;

    // Compter les ressources utilisées
    const companiesCount = await ctx.prisma.company.count({
      where: { tenantId: ctx.tenantId },
    });

    const sitesCount = await ctx.prisma.site.count({
      where: {
        company: { tenantId: ctx.tenantId },
      },
    });

    const workUnitsCount = await ctx.prisma.workUnit.count({
      where: {
        site: {
          company: { tenantId: ctx.tenantId },
        },
      },
    });

    const usersCount = await ctx.prisma.userProfile.count({
      where: { tenantId: ctx.tenantId },
    });

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

    return {
      plan: userPlan,
      name,
      description,
      price,
      features,
      usage: {
        ai: {
          suggestions_risques: {
            current: suggestionsRisksCount,
            limit: features.maxAISuggestionsRisks === Infinity ? null : features.maxAISuggestionsRisks,
            available: features.maxAISuggestionsRisks === Infinity 
              ? Infinity 
              : Math.max(0, features.maxAISuggestionsRisks - suggestionsRisksCount),
            warning: features.maxAISuggestionsRisks > 0 && suggestionsRisksCount >= Math.floor(features.maxAISuggestionsRisks * 0.8),
          },
          suggestions_actions: {
            current: suggestionsActionsCount,
            limit: features.maxAISuggestionsActions === Infinity ? null : features.maxAISuggestionsActions,
            available: features.maxAISuggestionsActions === Infinity 
              ? Infinity 
              : Math.max(0, features.maxAISuggestionsActions - suggestionsActionsCount),
            warning: features.maxAISuggestionsActions > 0 && suggestionsActionsCount >= Math.floor(features.maxAISuggestionsActions * 0.8),
          },
          reformulation: {
            current: reformulationsCount,
            limit: features.hasAIReformulation ? 'unlimited' : 0,
            available: features.hasAIReformulation ? 'unlimited' : 0,
            warning: false, // Reformulation illimitée (limite technique 300/jour non affichée)
          },
        },
        companies: {
          current: companiesCount,
          limit: features.maxCompanies === Infinity ? null : features.maxCompanies,
        },
        sites: {
          current: sitesCount,
          limit: features.maxSites === Infinity ? null : features.maxSites,
        },
        workUnits: {
          current: workUnitsCount,
          limit: features.maxWorkUnits === Infinity ? null : features.maxWorkUnits,
        },
        users: {
          current: usersCount,
          limit: features.maxUsers === Infinity ? null : features.maxUsers,
        },
        risks: {
          current: risksCount,
          limit: features.maxRisksPerMonth === Infinity ? null : features.maxRisksPerMonth,
        },
      },
      upgradePlan: getUpgradePlan(userPlan),
    };
  }),

  /**
   * Récupère tous les plans disponibles avec leurs fonctionnalités
   */
  getAllPlans: authenticatedProcedure.query(async () => {
    return Object.keys(PLAN_FEATURES).map((planKey) => {
      const plan = planKey as Plan;
      return {
        key: plan,
        name: PLAN_NAMES[plan],
        description: PLAN_DESCRIPTIONS[plan],
        price: PLAN_PRICES[plan],
        features: PLAN_FEATURES[plan],
      };
    });
  }),

  /**
   * Met à jour le plan d'un utilisateur (admin uniquement)
   */
  updatePlan: authenticatedProcedure
    .input(z.object({ userId: z.string().cuid(), plan: z.enum(['free', 'essentiel', 'pro', 'expert']) }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'utilisateur est admin
      const userRoles = ctx.userProfile?.roles || [];
      const isAdmin = userRoles.includes('super_admin') || userRoles.includes('admin_tenant');

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls les administrateurs peuvent modifier les plans',
        });
      }

      // Vérifier que l'utilisateur existe
      const targetUser = await ctx.prisma.userProfile.findUnique({
        where: { id: input.userId },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utilisateur non trouvé',
        });
      }

      // Mettre à jour le plan
      const updated = await ctx.prisma.userProfile.update({
        where: { id: input.userId },
        data: { plan: input.plan },
      });

      return updated;
    }),
});

