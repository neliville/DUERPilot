/**
 * Router API pour la gestion des plans tarifaires
 * Gère les quotas, l'utilisation, les upgrades et les demandes ENTREPRISE
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { PLAN_FEATURES, PLAN_PRICES, PLAN_NAMES, PLAN_DESCRIPTIONS, getUpgradePlan } from '@/lib/plans';
import type { Plan } from '@/lib/plans';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/lib/db';

/**
 * Calcule l'utilisation actuelle d'une fonctionnalité pour un tenant
 */
async function getCurrentUsage(
  prisma: any,
  tenantId: string,
  feature: string
): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  switch (feature) {
    case 'maxWorkUnits':
      return await prisma.workUnit.count({ where: { tenantId } });

    case 'maxUsers':
      return await prisma.userProfile.count({ where: { tenantId } });

    case 'maxCompanies':
      return await prisma.company.count({ where: { tenantId } });

    case 'maxSites':
      return await prisma.site.count({ where: { tenantId } });

    case 'maxRisksPerMonth':
      return await prisma.riskEvaluation.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth },
        },
      });

    case 'maxPlansActionPerMonth':
      return await prisma.actionPlan.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth },
        },
      });

    case 'maxObservationsPerMonth':
      return await prisma.observation.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth },
        },
      });

    case 'maxExportsPerMonth':
      // Compter les exports sur l'année (pas le mois)
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return await prisma.duerpVersion.count({
        where: {
          tenantId,
          createdAt: { gte: startOfYear },
          status: 'published',
        },
      });

    case 'maxImportsPerMonth':
      return await prisma.duerpImport.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth },
        },
      });

    case 'maxAISuggestionsRisks':
      return await prisma.aIUsageLog.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth },
          action: 'suggest_risks',
        },
      });

    case 'maxAISuggestionsActions':
      return await prisma.aIUsageLog.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth },
          action: 'suggest_actions',
        },
      });

    default:
      return 0;
  }
}

/**
 * Récupère ou crée l'enregistrement PlanUsage pour le mois en cours
 */
async function getOrCreatePlanUsage(prisma: any, tenantId: string) {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  const existing = await prisma.planUsage.findUnique({
    where: {
      tenantId_month_year: {
        tenantId,
        month,
        year,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return await prisma.planUsage.create({
    data: {
      tenantId,
      month,
      year,
    },
  });
}

export const plansRouter = createTRPCRouter({
  /**
   * Récupère les informations du plan actuel de l'utilisateur
   */
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const userProfile = await prisma.userProfile.findUnique({
      where: { email: ctx.session.user.email! },
      select: { plan: true, tenantId: true },
    });

    if (!userProfile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Profil utilisateur introuvable',
      });
    }

    const plan = (userProfile.plan || 'free') as Plan;
    const features = PLAN_FEATURES[plan];
    const prices = PLAN_PRICES[plan];
    const name = PLAN_NAMES[plan];
    const upgradePlan = getUpgradePlan(plan);

    // Calculer l'utilisation actuelle pour les ressources principales
    const tenantId = userProfile.tenantId;
    let companiesCount = 0;
    let sitesCount = 0;
    let workUnitsCount = 0;
    let usersCount = 0;
    let risksCount = 0;
    let aiSuggestionsRisksCount = 0;

    // Ne calculer l'utilisation que si le tenantId existe
    if (tenantId) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      try {
        [
          companiesCount,
          sitesCount,
          workUnitsCount,
          usersCount,
          risksCount,
          aiSuggestionsRisksCount,
        ] = await Promise.all([
          prisma.company.count({ where: { tenantId } }),
          prisma.site.count({ where: { company: { tenantId } } }),
          prisma.workUnit.count({ where: { site: { company: { tenantId } } } }),
          prisma.userProfile.count({ where: { tenantId } }),
          prisma.riskAssessment.count({
            where: { 
              workUnit: {
                site: {
                  company: {
                    tenantId
                  }
                }
              },
              createdAt: { gte: startOfMonth } 
            },
          }),
          prisma.aIUsageLog.count({
            where: {
              tenantId,
              createdAt: { gte: startOfMonth },
              function: 'suggestions_risques',
            },
          }),
        ]);
      } catch (error) {
        console.error('Erreur lors du calcul de l\'utilisation:', error);
        // En cas d'erreur, on continue avec les valeurs par défaut (0)
      }
    }

    return {
      plan,
      current: plan, // Alias pour compatibilité
      name,
      features,
      prices,
      upgradePlan: upgradePlan
        ? {
            plan: upgradePlan,
            name: PLAN_NAMES[upgradePlan],
            prices: PLAN_PRICES[upgradePlan],
          }
        : null,
      usage: {
        companies: {
          current: companiesCount,
          limit: features.maxCompanies === true ? null : features.maxCompanies,
        },
        sites: {
          current: sitesCount,
          limit: features.maxSites === true ? null : features.maxSites,
        },
        workUnits: {
          current: workUnitsCount,
          limit: features.maxWorkUnits === true ? null : features.maxWorkUnits,
        },
        users: {
          current: usersCount,
          limit: features.maxUsers === true ? null : features.maxUsers,
        },
        risks: {
          current: risksCount,
          limit: features.maxRisksPerMonth === true ? null : features.maxRisksPerMonth,
        },
        ai: {
          suggestions_risques: {
            current: aiSuggestionsRisksCount,
            limit: features.maxAISuggestionsRisks === true ? null : features.maxAISuggestionsRisks,
            warning: features.maxAISuggestionsRisks !== true && aiSuggestionsRisksCount >= (features.maxAISuggestionsRisks as number) * 0.8,
          },
        },
      },
    };
  }),

  /**
   * Récupère tous les plans disponibles avec leurs caractéristiques
   */
  getAllPlans: protectedProcedure.query(async () => {
    const plans: Plan[] = ['free', 'starter', 'business', 'premium', 'entreprise'];
    
    return plans.map((plan) => ({
      key: plan,
      name: PLAN_NAMES[plan],
      description: PLAN_DESCRIPTIONS[plan],
      prices: PLAN_PRICES[plan],
      features: PLAN_FEATURES[plan],
    }));
  }),

  /**
   * Récupère l'utilisation actuelle d'une fonctionnalité spécifique
   */
  getUsage: protectedProcedure
    .input(
      z.object({
        feature: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userProfile = await ctx.prisma.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
        select: { plan: true, tenantId: true },
      });

      if (!userProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profil utilisateur introuvable',
        });
      }

      const plan = (userProfile.plan || 'free') as Plan;
      const features = PLAN_FEATURES[plan];
      const limit = features[input.feature as keyof typeof features];

      // Calculer l'utilisation actuelle
      const current = await getCurrentUsage(
        ctx.prisma,
        userProfile.tenantId,
        input.feature
      );

      return {
        feature: input.feature,
        limit: typeof limit === 'number' ? limit : Infinity,
        current,
        percentage: typeof limit === 'number' && limit > 0 ? (current / limit) * 100 : 0,
        isWarning: typeof limit === 'number' && limit > 0 && (current / limit) >= 0.8,
        isExceeded: typeof limit === 'number' && current > limit,
      };
    }),

  /**
   * Récupère l'utilisation de toutes les fonctionnalités
   */
  getAllUsage: protectedProcedure.query(async ({ ctx }) => {
    const userProfile = await ctx.prisma.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
      select: { plan: true, tenantId: true },
    });

    if (!userProfile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Profil utilisateur introuvable',
      });
    }

    const plan = (userProfile.plan || 'free') as Plan;
    const features = PLAN_FEATURES[plan];

    // Liste des fonctionnalités à tracker
    const featuresToTrack = [
      'maxWorkUnits',
      'maxUsers',
      'maxCompanies',
      'maxSites',
      'maxRisksPerMonth',
      'maxPlansActionPerMonth',
      'maxObservationsPerMonth',
      'maxExportsPerMonth',
      'maxImportsPerMonth',
      'maxAISuggestionsRisks',
      'maxAISuggestionsActions',
    ];

    const usage = await Promise.all(
      featuresToTrack.map(async (feature) => {
        const limit = features[feature as keyof typeof features];
        const current = await getCurrentUsage(
          ctx.prisma,
          userProfile.tenantId,
          feature
        );

        return {
          feature,
          limit: typeof limit === 'number' ? limit : Infinity,
          current,
          percentage:
            typeof limit === 'number' && limit > 0 ? (current / limit) * 100 : 0,
          isWarning:
            typeof limit === 'number' && limit > 0 && current / limit >= 0.8,
          isExceeded: typeof limit === 'number' && current > limit,
        };
      })
    );

    return {
      plan,
      usage: usage.filter((u) => u.limit !== Infinity && u.limit > 0),
    };
  }),

  /**
   * Récupère l'historique d'utilisation sur plusieurs mois
   */
  getUsageHistory: protectedProcedure
    .input(
      z.object({
        months: z.number().min(1).max(12).default(6),
      })
    )
    .query(async ({ ctx, input }) => {
      const userProfile = await ctx.prisma.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
        select: { tenantId: true },
      });

      if (!userProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profil utilisateur introuvable',
        });
      }

      const now = new Date();
      const history = [];

      for (let i = 0; i < input.months; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const usage = await ctx.prisma.planUsage.findUnique({
          where: {
            tenantId_month_year: {
              tenantId: userProfile.tenantId,
              month,
              year,
            },
          },
        });

        history.push({
          month,
          year,
          date: date.toISOString(),
          usage: usage || null,
        });
      }

      return history;
    }),

  /**
   * Demande d'upgrade vers un plan supérieur
   */
  requestUpgrade: protectedProcedure
    .input(
      z.object({
        targetPlan: z.enum(['starter', 'business', 'premium', 'entreprise']),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userProfile = await ctx.prisma.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
        select: { plan: true, tenantId: true },
      });

      if (!userProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profil utilisateur introuvable',
        });
      }

      // TODO: Implémenter la logique de demande d'upgrade
      // - Créer une demande dans la DB
      // - Envoyer un email à l'équipe sales
      // - Rediriger vers Stripe (si automatique)

      console.log('Demande d\'upgrade:', {
        userId: ctx.session.user.id,
        currentPlan: userProfile.plan,
        targetPlan: input.targetPlan,
        reason: input.reason,
      });

      return {
        success: true,
        message: 'Votre demande d\'upgrade a été enregistrée',
      };
    }),

  /**
   * Demande de contact pour le plan ENTREPRISE
   */
  requestEnterprise: protectedProcedure
    .input(
      z.object({
        companySize: z.number().min(1),
        numberOfSites: z.number().min(1),
        numberOfUsers: z.number().min(1),
        numberOfWorkUnits: z.number().min(1),
        specificNeeds: z.string().optional(),
        needsSSO: z.boolean().default(false),
        needsWhiteLabel: z.boolean().default(false),
        needsERPIntegration: z.boolean().default(false),
        timeline: z.enum(['immediate', '1_month', '3_months', '6_months']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userProfile = await ctx.prisma.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
        include: { user: true },
      });

      if (!userProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profil utilisateur introuvable',
        });
      }

      // TODO: Créer une table EnterpriseRequest pour stocker ces demandes
      // TODO: Envoyer un email à l'équipe sales avec les détails

      console.log('Demande ENTREPRISE:', {
        userId: ctx.session.user.id,
        userEmail: userProfile.user.email,
        userName: `${userProfile.firstName} ${userProfile.lastName}`,
        ...input,
      });

      return {
        success: true,
        message:
          'Votre demande a été transmise à notre équipe. Nous vous contacterons sous 24h.',
      };
    }),

  /**
   * Incrémente un compteur d'utilisation (appelé par les autres routers)
   */
  incrementUsage: protectedProcedure
    .input(
      z.object({
        counter: z.enum([
          'workUnitsCreated',
          'sitesCreated',
          'companiesCreated',
          'usersCreated',
          'risksCreated',
          'actionsCreated',
          'observationsCreated',
          'exportsGenerated',
          'importsProcessed',
          'aiSuggestionsRisks',
          'aiSuggestionsActions',
          'aiReformulations',
        ]),
        amount: z.number().default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userProfile = await ctx.prisma.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
        select: { tenantId: true },
      });

      if (!userProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profil utilisateur introuvable',
        });
      }

      // Récupérer ou créer l'enregistrement PlanUsage
      const planUsage = await getOrCreatePlanUsage(
        ctx.prisma,
        userProfile.tenantId
      );

      // Incrémenter le compteur
      await ctx.prisma.planUsage.update({
        where: { id: planUsage.id },
        data: {
          [input.counter]: {
            increment: input.amount,
          },
        },
      });

      return { success: true };
    }),
});
