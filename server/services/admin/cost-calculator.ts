/**
 * Service de calcul des coûts et marges
 * CRITIQUE pour pilotage business
 */

import { prisma } from '@/lib/db';
import { PLAN_FEATURES, type Plan } from '@/lib/plans';

/**
 * Coûts infrastructure par plan (approximation)
 * À ajuster selon votre infrastructure réelle
 */
const INFRA_COSTS_PER_PLAN: Record<Plan, number> = {
  free: 0.5, // Coût minimal (stockage, base de données)
  starter: 2.0, // Coût modéré
  pro: 5.0, // Coût moyen
  expert: 10.0, // Coût élevé (multi-tenant, haute disponibilité)
};

/**
 * Prix mensuels par plan
 */
const PLAN_PRICES: Record<Plan, { monthly: number; annual: number }> = {
  free: { monthly: 0, annual: 0 },
  starter: { monthly: 69, annual: 55 },
  pro: { monthly: 249, annual: 199 },
  expert: { monthly: 599, annual: 479 },
};

/**
 * Calcule le coût infrastructure réel par client selon le plan
 */
export async function calculateInfraCostPerClient(plan: Plan): Promise<number> {
  return INFRA_COSTS_PER_PLAN[plan] || 0;
}

/**
 * Calcule le coût IA réel pour un tenant sur une période
 */
export async function calculateAICostForTenant(
  tenantId: string,
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  const logs = await prisma.aIUsageLog.findMany({
    where: {
      tenantId,
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    },
  });

  return logs.reduce((sum, log) => sum + log.estimatedCost, 0);
}

/**
 * Calcule le coût IA moyen par client pour un plan
 */
export async function calculateAverageAICostPerClient(plan: Plan): Promise<number> {
  // Récupérer tous les tenants avec ce plan
  const tenants = await prisma.tenant.findMany({
    where: {
      users: {
        some: {
          plan,
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (tenants.length === 0) {
    return 0;
  }

  const tenantIds = tenants.map((t) => t.id);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const logs = await prisma.aIUsageLog.findMany({
    where: {
      tenantId: { in: tenantIds },
      createdAt: { gte: monthStart },
    },
  });

  const totalCost = logs.reduce((sum, log) => sum + log.estimatedCost, 0);
  return totalCost / tenants.length;
}

/**
 * Calcule la marge brute pour un client
 * Marge brute = Revenus - Coûts infra - Coûts IA
 */
export async function calculateGrossMarginForTenant(
  tenantId: string,
  billingMode: 'monthly' | 'annual' = 'monthly'
): Promise<{
  revenue: number;
  infraCost: number;
  aiCost: number;
  grossMargin: number;
  marginPercentage: number;
}> {
  // Récupérer le plan et le mode de facturation
  const user = await prisma.userProfile.findFirst({
    where: {
      tenantId,
    },
    select: {
      plan: true,
    },
  });

  if (!user) {
    throw new Error('Tenant non trouvé');
  }

  const plan = user.plan as Plan;
  const price = billingMode === 'monthly' ? PLAN_PRICES[plan].monthly : PLAN_PRICES[plan].annual;

  // Coût infra
  const infraCost = await calculateInfraCostPerClient(plan);

  // Coût IA (mois en cours)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const aiCost = await calculateAICostForTenant(tenantId, monthStart);

  const revenue = price;
  const grossMargin = revenue - infraCost - aiCost;
  const marginPercentage = revenue > 0 ? (grossMargin / revenue) * 100 : 0;

  return {
    revenue,
    infraCost,
    aiCost,
    grossMargin,
    marginPercentage: Math.round(marginPercentage * 100) / 100,
  };
}

/**
 * Calcule la marge moyenne par plan
 */
export async function calculateAverageMarginByPlan(plan: Plan): Promise<{
  averageRevenue: number;
  averageInfraCost: number;
  averageAICost: number;
  averageGrossMargin: number;
  averageMarginPercentage: number;
  clientCount: number;
}> {
  const tenants = await prisma.tenant.findMany({
    where: {
      users: {
        some: {
          plan,
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (tenants.length === 0) {
    return {
      averageRevenue: 0,
      averageInfraCost: 0,
      averageAICost: 0,
      averageGrossMargin: 0,
      averageMarginPercentage: 0,
      clientCount: 0,
    };
  }

  // Récupérer les abonnements pour déterminer le mode de facturation
  const subscriptions = await prisma.subscription.findMany({
    where: {
      tenantId: { in: tenants.map((t) => t.id) },
      status: 'active',
    },
    select: {
      tenantId: true,
      billingMode: true,
    },
  });

  const subscriptionMap = new Map(
    subscriptions.map((s) => [s.tenantId, s.billingMode as 'monthly' | 'annual'])
  );

  const margins = await Promise.all(
    tenants.map(async (tenant) => {
      const billingMode = subscriptionMap.get(tenant.id) || 'monthly';
      return await calculateGrossMarginForTenant(tenant.id, billingMode);
    })
  );

  const totalRevenue = margins.reduce((sum, m) => sum + m.revenue, 0);
  const totalInfraCost = margins.reduce((sum, m) => sum + m.infraCost, 0);
  const totalAICost = margins.reduce((sum, m) => sum + m.aiCost, 0);
  const totalGrossMargin = margins.reduce((sum, m) => sum + m.grossMargin, 0);

  return {
    averageRevenue: totalRevenue / tenants.length,
    averageInfraCost: totalInfraCost / tenants.length,
    averageAICost: totalAICost / tenants.length,
    averageGrossMargin: totalGrossMargin / tenants.length,
    averageMarginPercentage:
      totalRevenue > 0 ? (totalGrossMargin / totalRevenue) * 100 : 0,
    clientCount: tenants.length,
  };
}

/**
 * Calcule le coût IA total pour tous les tenants
 */
export async function calculateTotalAICost(startDate?: Date, endDate?: Date): Promise<number> {
  const logs = await prisma.aIUsageLog.findMany({
    where: {
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    },
  });

  return logs.reduce((sum, log) => sum + log.estimatedCost, 0);
}

/**
 * Calcule le coût infrastructure total pour tous les clients actifs
 */
export async function calculateTotalInfraCost(): Promise<number> {
  const tenants = await prisma.tenant.findMany({
    where: {
      users: {
        some: {
          plan: { not: 'free' },
        },
      },
    },
    include: {
      users: {
        select: {
          plan: true,
        },
        take: 1,
      },
    },
  });

  let totalCost = 0;
  for (const tenant of tenants) {
    const plan = (tenant.users[0]?.plan || 'free') as Plan;
    totalCost += INFRA_COSTS_PER_PLAN[plan];
  }

  return totalCost;
}

