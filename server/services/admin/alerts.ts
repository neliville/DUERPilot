/**
 * Service d'alertes automatiques
 */

import { prisma } from '@/lib/db';
import { PLAN_FEATURES, type Plan } from '@/lib/plans';

export interface Alert {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  tenantId?: string;
  userId?: string;
  companyId?: string;
  metadata?: Record<string, any>;
}

/**
 * Vérifie les alertes de quota IA
 */
export async function checkAIQuotaAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Récupérer les utilisateurs Business et Premium
  const businessPremiumUsers = await prisma.userProfile.findMany({
    where: {
      plan: { in: ['business', 'premium'] },
    },
    select: {
      id: true,
      email: true,
      plan: true,
      tenantId: true,
    },
  });

  for (const user of businessPremiumUsers) {
    const quotaLimit = user.plan === 'business' ? 100 : 300; // Approximatif selon PLAN_FEATURES

    // Calculer la consommation IA du mois
    const monthLogs = await prisma.aIUsageLog.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: monthStart },
      },
    });

    const totalCalls = monthLogs.length;
    const percentage = (totalCalls / quotaLimit) * 100;

    // Alerte si > 80%
    if (percentage > 80) {
      alerts.push({
        type: 'ai_quota_warning',
        severity: percentage > 95 ? 'high' : 'medium',
        message: `Utilisateur ${user.email} (${user.plan}) a utilisé ${Math.round(percentage)}% de son quota IA`,
        userId: user.id,
        tenantId: user.tenantId,
        metadata: {
          currentUsage: totalCalls,
          quotaLimit,
          percentage: Math.round(percentage),
        },
      });
    }
  }

  return alerts;
}

/**
 * Vérifie les alertes d'import massif suspect
 */
export async function checkMassImportAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Identifier les utilisateurs avec beaucoup d'imports ce mois
  const imports = await prisma.duerpImport.findMany({
    where: {
      createdAt: { gte: monthStart },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          plan: true,
          tenantId: true,
        },
      },
    },
  });

  // Grouper par utilisateur
  const importsByUser = imports.reduce(
    (acc, imp) => {
      const userId = imp.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: imp.user,
          count: 0,
          totalSize: 0,
        };
      }
      acc[userId].count++;
      acc[userId].totalSize += imp.fileSize;
      return acc;
    },
    {} as Record<
      string,
      {
        user: { id: string; email: string; plan: string; tenantId: string };
        count: number;
        totalSize: number;
      }
    >
  );

  // Alerte si > 10 imports ou > 500 Mo
  for (const [userId, data] of Object.entries(importsByUser)) {
    if (data.count > 10 || data.totalSize > 500 * 1024 * 1024) {
      alerts.push({
        type: 'mass_import_suspicious',
        severity: 'medium',
        message: `Utilisateur ${data.user.email} a effectué ${data.count} imports (${Math.round(data.totalSize / 1024 / 1024)} Mo) ce mois`,
        userId: data.user.id,
        tenantId: data.user.tenantId,
        metadata: {
          importCount: data.count,
          totalSize: data.totalSize,
        },
      });
    }
  }

  return alerts;
}

/**
 * Vérifie les alertes de churn à risque
 */
export async function checkChurnRiskAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Utilisateurs inactifs depuis 30 jours
  const inactiveUsers = await prisma.userProfile.findMany({
    where: {
      plan: { not: 'free' },
      OR: [
        { lastLoginAt: null },
        { lastLoginAt: { lt: thirtyDaysAgo } },
      ],
    },
    include: {
      tenant: {
        include: {
          subscription: {
            select: {
              status: true,
              plan: true,
            },
          },
        },
      },
    },
  });

  for (const user of inactiveUsers) {
    if (user.tenant.subscription?.status === 'active') {
      alerts.push({
        type: 'churn_risk',
        severity: 'medium',
        message: `Utilisateur ${user.email} inactif depuis plus de 30 jours`,
        userId: user.id,
        tenantId: user.tenantId,
        metadata: {
          lastLoginAt: user.lastLoginAt,
          plan: user.plan,
        },
      });
    }
  }

  return alerts;
}

/**
 * Vérifie les alertes de marge négative
 */
export async function checkNegativeMarginAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = [];

  const tenants = await prisma.tenant.findMany({
    include: {
      subscription: {
        where: {
          status: 'active',
        },
      },
    },
  });

  for (const tenant of tenants) {
    const subscription = tenant.subscription;
    if (!subscription) continue;

    try {
      const { calculateGrossMarginForTenant } = await import('./cost-calculator');
      const margin = await calculateGrossMarginForTenant(
        tenant.id,
        subscription.billingMode as 'monthly' | 'annual'
      );

      if (margin.grossMargin < 0) {
        alerts.push({
          type: 'negative_margin',
          severity: 'high',
          message: `Client ${tenant.name} a une marge négative: ${Math.round(margin.grossMargin)}€`,
          tenantId: tenant.id,
          metadata: {
            revenue: margin.revenue,
            aiCost: margin.aiCost,
            infraCost: margin.infraCost,
            grossMargin: margin.grossMargin,
          },
        });
      }
    } catch (error) {
      // Ignorer les erreurs
      console.error(`Erreur calcul marge pour ${tenant.id}:`, error);
    }
  }

  return alerts;
}

/**
 * Récupère toutes les alertes
 */
export async function getAllAlerts(): Promise<Alert[]> {
  const [
    quotaAlerts,
    importAlerts,
    churnAlerts,
    marginAlerts,
  ] = await Promise.all([
    checkAIQuotaAlerts(),
    checkMassImportAlerts(),
    checkChurnRiskAlerts(),
    checkNegativeMarginAlerts(),
  ]);

  return [
    ...quotaAlerts,
    ...importAlerts,
    ...churnAlerts,
    ...marginAlerts,
  ];
}

