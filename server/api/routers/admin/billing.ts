/**
 * Router admin pour la facturation et les marges (CRITIQUE)
 * Calculs MRR, ARR, churn, marges pour pilotage business
 */

import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/lib/db';
import {
  calculateGrossMarginForTenant,
  calculateAverageMarginByPlan,
  calculateTotalAICost,
  calculateTotalInfraCost,
  calculateAverageAICostPerClient,
} from '@/server/services/admin/cost-calculator';
import { PLAN_FEATURES, type Plan } from '@/lib/plans';

const PLAN_PRICES: Record<Plan, { monthly: number; annual: number }> = {
  free: { monthly: 0, annual: 0 },
  starter: { monthly: 59, annual: 590 },
  business: { monthly: 149, annual: 1490 },
  premium: { monthly: 349, annual: 3490 },
  entreprise: { monthly: 0, annual: 0 },
};

export const billingRouter = createTRPCRouter({
  /**
   * MRR total et par plan
   */
  getMRR: adminProcedure.query(async () => {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
      },
      include: {
        tenant: {
          include: {
            users: {
              select: {
                plan: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    let totalMRR = 0;
    const mrrByPlan: Record<Plan, number> = {
      free: 0,
      starter: 0,
      business: 0,
      premium: 0,
      entreprise: 0,
    };

    for (const sub of subscriptions) {
      const plan = (sub.tenant.users[0]?.plan || 'free') as Plan;
      const price =
        sub.billingMode === 'monthly'
          ? PLAN_PRICES[plan].monthly
          : PLAN_PRICES[plan].monthly; // MRR = prix mensuel même pour abonnements annuels

      totalMRR += price;
      mrrByPlan[plan] = (mrrByPlan[plan] || 0) + price;
    }

    return {
      totalMRR: Math.round(totalMRR * 100) / 100,
      byPlan: mrrByPlan,
    };
  }),

  /**
   * ARR total
   */
  getARR: adminProcedure.query(async () => {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
      },
      include: {
        tenant: {
          include: {
            users: {
              select: {
                plan: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    let totalARR = 0;

    for (const sub of subscriptions) {
      const plan = (sub.tenant.users[0]?.plan || 'free') as Plan;
      const annualPrice =
        sub.billingMode === 'annual'
          ? PLAN_PRICES[plan].annual * 12
          : PLAN_PRICES[plan].monthly * 12;

      totalARR += annualPrice;
    }

    return {
      totalARR: Math.round(totalARR * 100) / 100,
    };
  }),

  /**
   * Répartition mensuel vs annuel
   */
  getRevenueBreakdown: adminProcedure.query(async () => {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
      },
      include: {
        tenant: {
          include: {
            users: {
              select: {
                plan: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    let monthlyRevenue = 0;
    let annualRevenue = 0;
    let monthlyCount = 0;
    let annualCount = 0;

    for (const sub of subscriptions) {
      const plan = (sub.tenant.users[0]?.plan || 'free') as Plan;
      if (sub.billingMode === 'monthly') {
        monthlyRevenue += PLAN_PRICES[plan].monthly;
        monthlyCount++;
      } else {
        annualRevenue += PLAN_PRICES[plan].annual * 12;
        annualCount++;
      }
    }

    return {
      monthly: {
        revenue: Math.round(monthlyRevenue * 100) / 100,
        count: monthlyCount,
      },
      annual: {
        revenue: Math.round(annualRevenue * 100) / 100,
        count: annualCount,
      },
    };
  }),

  /**
   * Taux de churn par plan
   */
  getChurnRate: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      // Récupérer les résiliations dans la période
      const cancellations = await prisma.subscription.findMany({
        where: {
          status: 'cancelled',
          cancelledAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        include: {
          tenant: {
            include: {
              users: {
                select: {
                  plan: true,
                },
                take: 1,
              },
            },
          },
        },
      });

      // Compter les clients actifs au début de la période
      const activeAtStart = await prisma.subscription.count({
        where: {
          status: 'active',
          startDate: { lte: input.startDate },
        },
      });

      const churnByPlan: Record<Plan, { cancellations: number; churnRate: number }> = {
        free: { cancellations: 0, churnRate: 0 },
        starter: { cancellations: 0, churnRate: 0 },
        business: { cancellations: 0, churnRate: 0 },
        premium: { cancellations: 0, churnRate: 0 },
        entreprise: { cancellations: 0, churnRate: 0 },
      };

      for (const cancel of cancellations) {
        const plan = (cancel.tenant.users[0]?.plan || 'free') as Plan;
        churnByPlan[plan].cancellations++;
      }

      // Calculer le taux de churn par plan
      const planCounts = await Promise.all(
        (['free', 'starter', 'business', 'premium', 'entreprise'] as Plan[]).map(async (plan) => {
          const count = await prisma.subscription.count({
            where: {
              status: 'active',
              startDate: { lte: input.startDate },
              tenant: {
                users: {
                  some: {
                    plan,
                  },
                },
              },
            },
          });
          return { plan, count };
        })
      );

      for (const { plan, count } of planCounts) {
        churnByPlan[plan].churnRate =
          count > 0 ? (churnByPlan[plan].cancellations / count) * 100 : 0;
      }

      return {
        totalChurn: cancellations.length,
        totalChurnRate: activeAtStart > 0 ? (cancellations.length / activeAtStart) * 100 : 0,
        byPlan: churnByPlan,
      };
    }),

  /**
   * Mouvements upgrade/downgrade
   */
  getUpgradesDowngrades: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      // Récupérer les changements de plan via AuditLog
      const planChanges = await prisma.auditLog.findMany({
        where: {
          entityType: 'subscription',
          action: { in: ['upgrade', 'downgrade', 'plan_change'] },
          createdAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        select: {
          details: true,
          createdAt: true,
        },
      });

      let upgrades = 0;
      let downgrades = 0;

      for (const change of planChanges) {
        const details = change.details as any;
        if (details?.fromPlan && details?.toPlan) {
          const planOrder: Plan[] = ['free', 'starter', 'business', 'premium', 'entreprise'];
          const fromIndex = planOrder.indexOf(details.fromPlan);
          const toIndex = planOrder.indexOf(details.toPlan);

          if (toIndex > fromIndex) {
            upgrades++;
          } else if (toIndex < fromIndex) {
            downgrades++;
          }
        }
      }

      return {
        upgrades,
        downgrades,
        netUpgrades: upgrades - downgrades,
      };
    }),

  /**
   * Marge brute par client et par plan
   */
  getMargins: adminProcedure
    .input(
      z.object({
        plan: z.enum(['free', 'starter', 'business', 'premium', 'entreprise']).optional(),
      })
    )
    .query(async ({ input }) => {
      if (input.plan) {
        // Marge moyenne pour un plan spécifique
        const margin = await calculateAverageMarginByPlan(input.plan);
        return {
          byPlan: {
            [input.plan]: margin,
          },
        };
      }

      // Marges pour tous les plans
      const plans: Plan[] = ['free', 'starter', 'business', 'premium', 'entreprise'];
      const margins: Record<Plan, Awaited<ReturnType<typeof calculateAverageMarginByPlan>>> = {
        free: await calculateAverageMarginByPlan('free'),
        starter: await calculateAverageMarginByPlan('starter'),
        business: await calculateAverageMarginByPlan('business'),
        premium: await calculateAverageMarginByPlan('premium'),
        entreprise: await calculateAverageMarginByPlan('entreprise'),
      };

      return {
        byPlan: margins,
      };
    }),

  /**
   * Coût infra et IA réels
   */
  getCosts: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const aiCost = await calculateTotalAICost(input.startDate, input.endDate);
      const infraCost = await calculateTotalInfraCost();

      return {
        aiCost: Math.round(aiCost * 100) / 100,
        infraCost: Math.round(infraCost * 100) / 100,
        totalCost: Math.round((aiCost + infraCost) * 100) / 100,
      };
    }),

  /**
   * Tous les KPI essentiels
   */
  getKPIs: adminProcedure.query(async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // MRR
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'active' },
      include: {
        tenant: {
          include: {
            users: {
              select: { plan: true },
              take: 1,
            },
          },
        },
      },
    });

    let totalMRR = 0;
    for (const sub of subscriptions) {
      const plan = (sub.tenant.users[0]?.plan || 'free') as Plan;
      totalMRR += sub.billingMode === 'monthly' ? PLAN_PRICES[plan].monthly : PLAN_PRICES[plan].monthly;
    }

    // MRR net (après coûts IA)
    const aiCostThisMonth = await calculateTotalAICost(monthStart);
    const mrrNet = totalMRR - aiCostThisMonth;

    // Marge par plan
    const margins = {
      byPlan: {
        free: await calculateAverageMarginByPlan('free'),
        starter: await calculateAverageMarginByPlan('starter'),
        business: await calculateAverageMarginByPlan('business'),
        premium: await calculateAverageMarginByPlan('premium'),
        entreprise: await calculateAverageMarginByPlan('entreprise'),
      },
    };

    // Coût IA / client
    const aiCostPerClient: Record<Plan, number> = {
      free: 0,
      starter: await calculateAverageAICostPerClient('starter'),
      business: await calculateAverageAICostPerClient('business'),
      premium: await calculateAverageAICostPerClient('premium'),
      entreprise: await calculateAverageAICostPerClient('entreprise'),
    };

    // Taux Free → Starter
    const freeUsers = await prisma.userProfile.count({
      where: { plan: 'free' },
    });

    const starterUsers = await prisma.userProfile.count({
      where: {
        plan: 'starter',
        createdAt: { gte: monthStart },
      },
    });

    const freeToStarterRate = freeUsers > 0 ? (starterUsers / freeUsers) * 100 : 0;

    return {
      mrr: Math.round(totalMRR * 100) / 100,
      mrrNet: Math.round(mrrNet * 100) / 100,
      margins: margins.byPlan,
      aiCostPerClient,
      freeToStarterRate: Math.round(freeToStarterRate * 100) / 100,
    };
  }),
});

