/**
 * Service de monitoring des quotas de plans
 * Vérifie l'utilisation des quotas et envoie des notifications
 */

import { prisma } from '@/lib/db';
import { PLAN_FEATURES } from '@/lib/plans';
import type { Plan } from '@/lib/plans';
import { sendEmail } from './email/sender';

export interface QuotaStatus {
  feature: string;
  featureName: string;
  limit: number;
  current: number;
  percentage: number;
  exceeded: boolean;
  isWarning: boolean;
  isCritical: boolean;
}

/**
 * Noms lisibles des fonctionnalités
 */
const FEATURE_NAMES: Record<string, string> = {
  maxWorkUnits: 'Unités de travail',
  maxUsers: 'Utilisateurs',
  maxCompanies: 'Entreprises',
  maxSites: 'Sites',
  maxRisksPerMonth: 'Évaluations de risques (mois)',
  maxPlansActionPerMonth: 'Plans d\'action (mois)',
  maxObservationsPerMonth: 'Observations (mois)',
  maxExportsPerMonth: 'Exports DUERP (année)',
  maxImportsPerMonth: 'Imports DUERP (mois)',
  maxAISuggestionsRisks: 'Suggestions IA risques (mois)',
  maxAISuggestionsActions: 'Suggestions IA actions (mois)',
};

/**
 * Calcule l'utilisation actuelle pour une fonctionnalité
 */
async function getCurrentUsage(
  tenantId: string,
  feature: string
): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

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
 * Vérifie les quotas pour un tenant spécifique
 */
export async function checkTenantQuotas(
  tenantId: string,
  plan: Plan
): Promise<QuotaStatus[]> {
  const features = PLAN_FEATURES[plan];
  const quotas: QuotaStatus[] = [];

  // Liste des fonctionnalités à vérifier
  const featuresToCheck = [
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

  for (const feature of featuresToCheck) {
    const limit = features[feature as keyof typeof features];

    // Ignorer les limites illimitées
    if (typeof limit !== 'number' || limit === Infinity) {
      continue;
    }

    const current = await getCurrentUsage(tenantId, feature);
    const percentage = limit > 0 ? (current / limit) * 100 : 0;

    quotas.push({
      feature,
      featureName: FEATURE_NAMES[feature] || feature,
      limit,
      current,
      percentage,
      exceeded: current > limit,
      isWarning: percentage >= 80 && percentage < 90,
      isCritical: percentage >= 90,
    });
  }

  return quotas;
}

/**
 * Vérifie les quotas pour tous les tenants
 */
export async function checkAllTenantsQuotas(): Promise<void> {
  console.log('🔍 [PlanMonitoring] Vérification des quotas pour tous les tenants...');

  const tenants = await prisma.tenant.findMany({
    include: {
      users: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        where: {
          roles: { has: 'admin_tenant' },
        },
      },
    },
  });

  console.log(`📊 [PlanMonitoring] ${tenants.length} tenants à vérifier`);

  let tenantsWithWarnings = 0;
  let tenantsWithExceeded = 0;

  for (const tenant of tenants) {
    if (tenant.users.length === 0) {
      console.log(`⚠️  [PlanMonitoring] Tenant ${tenant.id} sans admin, ignoré`);
      continue;
    }

    const plan = (tenant.users[0].plan || 'free') as Plan;
    const quotas = await checkTenantQuotas(tenant.id, plan);

    // Filtrer les quotas qui nécessitent une action
    const warnings = quotas.filter((q) => q.isWarning);
    const critical = quotas.filter((q) => q.isCritical);
    const exceeded = quotas.filter((q) => q.exceeded);

    if (warnings.length > 0 || critical.length > 0 || exceeded.length > 0) {
      console.log(`⚠️  [PlanMonitoring] Tenant ${tenant.name} (${plan}):`);
      
      if (warnings.length > 0) {
        tenantsWithWarnings++;
        console.log(`   📊 ${warnings.length} quota(s) en warning (80-90%)`);
        for (const warning of warnings) {
          await sendQuotaWarning(tenant.id, warning, 80);
        }
      }

      if (critical.length > 0) {
        tenantsWithWarnings++;
        console.log(`   🔴 ${critical.length} quota(s) critiques (90-100%)`);
        for (const crit of critical) {
          await sendQuotaWarning(tenant.id, crit, 90);
        }
      }

      if (exceeded.length > 0) {
        tenantsWithExceeded++;
        console.log(`   ❌ ${exceeded.length} quota(s) dépassé(s)`);
        for (const exc of exceeded) {
          await sendQuotaExceeded(tenant.id, exc);
        }
      }
    }
  }

  console.log(`✅ [PlanMonitoring] Vérification terminée:`);
  console.log(`   - ${tenantsWithWarnings} tenant(s) avec warnings`);
  console.log(`   - ${tenantsWithExceeded} tenant(s) avec dépassements`);
}

/**
 * Envoie une notification de warning (80% ou 90%)
 */
async function sendQuotaWarning(
  tenantId: string,
  quota: QuotaStatus,
  threshold: number
): Promise<void> {
  // Récupérer les admins du tenant
  const admins = await prisma.userProfile.findMany({
    where: {
      tenantId,
      roles: { has: 'admin_tenant' },
    },
    include: { user: true },
  });

  if (admins.length === 0) {
    console.log(`⚠️  [PlanMonitoring] Aucun admin trouvé pour tenant ${tenantId}`);
    return;
  }

  // Vérifier si une notification a déjà été envoyée récemment (dans les dernières 24h)
  const recentNotification = await prisma.emailLog.findFirst({
    where: {
      tenantId,
      templateId: 'plan-limit-warning',
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h
      },
      metadata: {
        path: ['feature'],
        equals: quota.feature,
      },
    },
  });

  if (recentNotification) {
    console.log(
      `ℹ️  [PlanMonitoring] Notification déjà envoyée pour ${quota.feature} (tenant ${tenantId})`
    );
    return;
  }

  for (const admin of admins) {
    try {
      await sendEmail({
        to: admin.user.email,
        templateId: 'plan-limit-warning',
        params: {
          userName: `${admin.firstName} ${admin.lastName}`,
          featureName: quota.featureName,
          feature: quota.feature,
          limit: quota.limit.toString(),
          current: quota.current.toString(),
          percentage: Math.round(quota.percentage).toString(),
          threshold: threshold.toString(),
        },
        tenantId,
      });

      console.log(
        `📧 [PlanMonitoring] Email warning envoyé à ${admin.user.email} pour ${quota.featureName}`
      );
    } catch (error) {
      console.error(
        `❌ [PlanMonitoring] Erreur envoi email à ${admin.user.email}:`,
        error
      );
    }
  }
}

/**
 * Envoie une notification de dépassement
 */
async function sendQuotaExceeded(
  tenantId: string,
  quota: QuotaStatus
): Promise<void> {
  // Récupérer les admins du tenant
  const admins = await prisma.userProfile.findMany({
    where: {
      tenantId,
      roles: { has: 'admin_tenant' },
    },
    include: { user: true },
  });

  if (admins.length === 0) {
    console.log(`⚠️  [PlanMonitoring] Aucun admin trouvé pour tenant ${tenantId}`);
    return;
  }

  // Vérifier si une notification a déjà été envoyée récemment (dans les dernières 24h)
  const recentNotification = await prisma.emailLog.findFirst({
    where: {
      tenantId,
      templateId: 'plan-limit-exceeded',
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h
      },
      metadata: {
        path: ['feature'],
        equals: quota.feature,
      },
    },
  });

  if (recentNotification) {
    console.log(
      `ℹ️  [PlanMonitoring] Notification dépassement déjà envoyée pour ${quota.feature} (tenant ${tenantId})`
    );
    return;
  }

  for (const admin of admins) {
    try {
      await sendEmail({
        to: admin.user.email,
        templateId: 'plan-limit-exceeded',
        params: {
          userName: `${admin.firstName} ${admin.lastName}`,
          featureName: quota.featureName,
          feature: quota.feature,
          limit: quota.limit.toString(),
          current: quota.current.toString(),
        },
        tenantId,
      });

      console.log(
        `📧 [PlanMonitoring] Email dépassement envoyé à ${admin.user.email} pour ${quota.featureName}`
      );
    } catch (error) {
      console.error(
        `❌ [PlanMonitoring] Erreur envoi email à ${admin.user.email}:`,
        error
      );
    }
  }
}

/**
 * Fonction à appeler via un cron job quotidien
 */
export async function runDailyQuotaCheck(): Promise<void> {
  try {
    await checkAllTenantsQuotas();
  } catch (error) {
    console.error('❌ [PlanMonitoring] Erreur lors de la vérification des quotas:', error);
    throw error;
  }
}
