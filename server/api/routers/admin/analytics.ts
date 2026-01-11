/**
 * Router admin pour les analytics produit
 */

import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '../../trpc';
import { prisma } from '@/lib/db';

export const analyticsRouter = createTRPCRouter({
  /**
   * Méthode la plus utilisée par plan
   */
  getMethodUsage: adminProcedure.query(async () => {
    // Analyser les évaluations pour déterminer la méthode utilisée
    // Pour simplifier, on regarde les RiskAssessment avec oiraQuestionId (méthode guidée)
    // et ceux sans (méthode classique ou générique)

    const plans: Array<'free' | 'starter' | 'pro' | 'expert'> = ['free', 'starter', 'pro', 'expert'];
    const results: Record<string, { generic: number; guided: number; classic: number }> = {};

    for (const plan of plans) {
      const users = await prisma.userProfile.findMany({
        where: { plan },
        select: { id: true },
      });

      const userIds = users.map((u) => u.id);
      const tenantIds = await prisma.userProfile
        .findMany({
          where: { id: { in: userIds } },
          select: { tenantId: true },
        })
        .then((users) => users.map((u) => u.tenantId));

      // Risques avec OiRA = méthode guidée
      const guided = await prisma.riskAssessment.count({
        where: {
          workUnit: {
            site: {
              company: {
                tenantId: { in: tenantIds },
              },
            },
          },
          oiraQuestionId: { not: null },
        },
      });

      // Risques sans OiRA = méthode classique ou générique
      const classic = await prisma.riskAssessment.count({
        where: {
          workUnit: {
            site: {
              company: {
                tenantId: { in: tenantIds },
              },
            },
          },
          oiraQuestionId: null,
        },
      });

      // Pour générique, on peut regarder les évaluations sans unité de travail spécifique
      // Approximatif
      const generic = 0; // À affiner selon votre logique métier

      results[plan] = { generic, guided, classic };
    }

    return results;
  }),

  /**
   * Étape d'abandon (Free / Starter)
   */
  getAbandonmentFunnel: adminProcedure.query(async () => {
    // Analyser où les utilisateurs Free/Starter abandonnent
    const freeUsers = await prisma.userProfile.findMany({
      where: { plan: 'free' },
      select: {
        id: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    const starterUsers = await prisma.userProfile.findMany({
      where: { plan: 'starter' },
      select: {
        id: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    // Utilisateurs qui n'ont jamais créé de risque
    const freeWithoutRisks = await Promise.all(
      freeUsers.map(async (user) => {
        const tenant = await prisma.userProfile.findUnique({
          where: { id: user.id },
          select: { tenantId: true },
        });

        if (!tenant) return false;

        const riskCount = await prisma.riskAssessment.count({
          where: {
            workUnit: {
              site: {
                company: {
                  tenantId: tenant.tenantId,
                },
              },
            },
          },
        });

        return riskCount === 0;
      })
    );

    return {
      free: {
        total: freeUsers.length,
        withoutRisks: freeWithoutRisks.filter(Boolean).length,
        inactive: freeUsers.filter((u) => !u.lastLoginAt || u.lastLoginAt < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
      },
      starter: {
        total: starterUsers.length,
        inactive: starterUsers.filter((u) => !u.lastLoginAt || u.lastLoginAt < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
      },
    };
  }),

  /**
   * Temps moyen création DUERP
   */
  getAverageDuerpTime: adminProcedure.query(async () => {
    const duerpVersions = await prisma.duerpVersion.findMany({
      select: {
        createdAt: true,
        company: {
          select: {
            createdAt: true,
          },
        },
      },
    });

    if (duerpVersions.length === 0) {
      return { averageDays: 0 };
    }

    const times = duerpVersions.map((dv) => {
      const companyCreated = dv.company.createdAt;
      const duerpCreated = dv.createdAt;
      const diff = duerpCreated.getTime() - companyCreated.getTime();
      return diff / (1000 * 60 * 60 * 24); // en jours
    });

    const averageDays = times.reduce((sum, time) => sum + time, 0) / times.length;

    return {
      averageDays: Math.round(averageDays * 100) / 100,
    };
  }),

  /**
   * Taux validation IA
   */
  getIAValidationRate: adminProcedure.query(async () => {
    const logs = await prisma.aIUsageLog.findMany({
      where: {
        result: { in: ['validated', 'rejected'] },
      },
    });

    const validated = logs.filter((log) => log.result === 'validated').length;
    const rejected = logs.filter((log) => log.result === 'rejected').length;
    const total = validated + rejected;

    return {
      validated,
      rejected,
      total,
      validationRate: total > 0 ? (validated / total) * 100 : 0,
    };
  }),

  /**
   * Fonctionnalités sous-utilisées
   */
  getFeatureUsage: adminProcedure.query(async () => {
    // Analyser l'utilisation des différentes fonctionnalités
    const [
      totalUsers,
      usersWithImports,
      usersWithObservations,
      usersWithActionPlans,
      usersWithDuerpVersions,
    ] = await Promise.all([
      prisma.userProfile.count(),
      prisma.userProfile.count({
        where: {
          imports: {
            some: {},
          },
        },
      }),
      prisma.userProfile.count({
        where: {
          observations: {
            some: {},
          },
        },
      }),
      prisma.userProfile.count({
        where: {
          tenant: {
            companies: {
              some: {
                duerpVersions: {
                  some: {},
                },
              },
            },
          },
        },
      }),
      prisma.userProfile.count({
        where: {
          tenant: {
            companies: {
              some: {
                duerpVersions: {
                  some: {},
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      totalUsers,
      featureUsage: {
        imports: {
          users: usersWithImports,
          percentage: totalUsers > 0 ? (usersWithImports / totalUsers) * 100 : 0,
        },
        observations: {
          users: usersWithObservations,
          percentage: totalUsers > 0 ? (usersWithObservations / totalUsers) * 100 : 0,
        },
        actionPlans: {
          users: usersWithActionPlans,
          percentage: totalUsers > 0 ? (usersWithActionPlans / totalUsers) * 100 : 0,
        },
        duerpVersions: {
          users: usersWithDuerpVersions,
          percentage: totalUsers > 0 ? (usersWithDuerpVersions / totalUsers) * 100 : 0,
        },
      },
    };
  }),
});

