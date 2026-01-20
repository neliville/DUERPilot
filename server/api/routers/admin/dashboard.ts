/**
 * Router admin pour la vue CEO
 * Tous les KPI essentiels en une requête pour décision business en 2 minutes
 */

import { createTRPCRouter, adminProcedure } from '../../trpc';
import { prisma } from '@/lib/db';
import { calculateTotalAICost, calculateTotalInfraCost } from '@/server/services/admin/cost-calculator';
import { PLAN_FEATURES, type Plan } from '@/lib/plans';

const PLAN_PRICES: Record<Plan, { monthly: number; annual: number }> = {
  free: { monthly: 0, annual: 0 },
  starter: { monthly: 59, annual: 590 },
  business: { monthly: 149, annual: 1490 },
  premium: { monthly: 349, annual: 3490 },
  entreprise: { monthly: 0, annual: 0 },
};

export const dashboardRouter = createTRPCRouter({
  /**
   * Vue CEO : Tous les KPI essentiels
   */
  getCEOView: adminProcedure.query(async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Clients actifs
    const activeClients = await prisma.subscription.count({
      where: {
        status: 'active',
      },
    });

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

    // ARR
    let totalARR = 0;
    for (const sub of subscriptions) {
      const plan = (sub.tenant.users[0]?.plan || 'free') as Plan;
      totalARR += sub.billingMode === 'annual' ? PLAN_PRICES[plan].annual * 12 : PLAN_PRICES[plan].monthly * 12;
    }

    // Coût IA total (mois en cours)
    const aiCost = await calculateTotalAICost(monthStart);
    const infraCost = await calculateTotalInfraCost();
    const totalCost = aiCost + infraCost;

    // Marge nette
    const mrrNet = totalMRR - aiCost;
    const grossMargin = totalMRR - totalCost;
    const marginPercentage = totalMRR > 0 ? (grossMargin / totalMRR) * 100 : 0;

    // Conversion Free → Starter
    const freeUsers = await prisma.userProfile.count({
      where: { plan: 'free' },
    });

    const starterUsersThisMonth = await prisma.userProfile.count({
      where: {
        plan: 'starter',
        createdAt: { gte: monthStart },
      },
    });

    const freeToStarterRate = freeUsers > 0 ? (starterUsersThisMonth / freeUsers) * 100 : 0;

    // Alertes critiques
    const alerts: Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }> = [];

    // Alerte marge négative
    if (grossMargin < 0) {
      alerts.push({
        type: 'negative_margin',
        message: `Marge négative: ${Math.round(grossMargin)}€`,
        severity: 'high',
      });
    }

    // Alerte coût IA élevé
    if (aiCost > totalMRR * 0.3) {
      alerts.push({
        type: 'high_ai_cost',
        message: `Coût IA représente ${Math.round((aiCost / totalMRR) * 100)}% du MRR`,
        severity: 'high',
      });
    }

    // Alerte churn élevé
    const cancellationsThisMonth = await prisma.subscription.count({
      where: {
        status: 'cancelled',
        cancelledAt: { gte: monthStart },
      },
    });

    const churnRate = activeClients > 0 ? (cancellationsThisMonth / activeClients) * 100 : 0;
    if (churnRate > 5) {
      alerts.push({
        type: 'high_churn',
        message: `Taux de churn élevé: ${Math.round(churnRate)}%`,
        severity: 'high',
      });
    }

    // Alerte conversion faible
    if (freeToStarterRate < 2) {
      alerts.push({
        type: 'low_conversion',
        message: `Conversion Free → Starter faible: ${Math.round(freeToStarterRate)}%`,
        severity: 'medium',
      });
    }

    return {
      clients: {
        active: activeClients,
        free: freeUsers,
        starter: await prisma.userProfile.count({ where: { plan: 'starter' } }),
        business: await prisma.userProfile.count({ where: { plan: 'business' } }),
        premium: await prisma.userProfile.count({ where: { plan: 'premium' } }),
        entreprise: await prisma.userProfile.count({ where: { plan: 'entreprise' } }),
      },
      revenue: {
        mrr: Math.round(totalMRR * 100) / 100,
        arr: Math.round(totalARR * 100) / 100,
        mrrNet: Math.round(mrrNet * 100) / 100,
      },
      margins: {
        grossMargin: Math.round(grossMargin * 100) / 100,
        marginPercentage: Math.round(marginPercentage * 100) / 100,
        aiCost: Math.round(aiCost * 100) / 100,
        infraCost: Math.round(infraCost * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
      },
      conversion: {
        freeToStarterRate: Math.round(freeToStarterRate * 100) / 100,
        freeUsers,
        starterUsersThisMonth,
      },
      alerts,
    };
  }),
});

