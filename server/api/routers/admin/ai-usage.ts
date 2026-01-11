/**
 * Router admin pour le pilotage IA (PRIORITÉ ABSOLUE)
 * Suivi détaillé de tous les appels IA pour contrôle des coûts
 */

import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/lib/db';

export const aiUsageRouter = createTRPCRouter({
  /**
   * Consommation IA par entreprise
   */
  getByCompany: adminProcedure
    .input(
      z.object({
        companyId: z.string().cuid(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const logs = await prisma.aIUsageLog.findMany({
        where: {
          companyId: input.companyId,
          ...(input.startDate || input.endDate
            ? {
                createdAt: {
                  ...(input.startDate ? { gte: input.startDate } : {}),
                  ...(input.endDate ? { lte: input.endDate } : {}),
                },
              }
            : {}),
        },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          company: {
            select: {
              legalName: true,
              siret: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalCost = logs.reduce((sum, log) => sum + log.estimatedCost, 0);
      const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);

      return {
        logs,
        summary: {
          totalCalls: logs.length,
          totalCost,
          totalTokens,
          averageCostPerCall: logs.length > 0 ? totalCost / logs.length : 0,
        },
      };
    }),

  /**
   * Consommation IA par plan
   */
  getByPlan: adminProcedure
    .input(
      z.object({
        plan: z.enum(['free', 'starter', 'pro', 'expert']).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      // Récupérer les tenants avec le plan spécifié
      const tenants = await prisma.tenant.findMany({
        where: {
          users: {
            some: {
              plan: input.plan || undefined,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const tenantIds = tenants.map((t) => t.id);

      const logs = await prisma.aIUsageLog.findMany({
        where: {
          tenantId: { in: tenantIds },
          ...(input.startDate || input.endDate
            ? {
                createdAt: {
                  ...(input.startDate ? { gte: input.startDate } : {}),
                  ...(input.endDate ? { lte: input.endDate } : {}),
                },
              }
            : {}),
        },
        include: {
          tenant: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalCost = logs.reduce((sum, log) => sum + log.estimatedCost, 0);
      const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);

      // Grouper par fonction IA
      const byFunction = logs.reduce(
        (acc, log) => {
          if (!acc[log.function]) {
            acc[log.function] = { count: 0, cost: 0, tokens: 0 };
          }
          acc[log.function].count++;
          acc[log.function].cost += log.estimatedCost;
          acc[log.function].tokens += log.totalTokens;
          return acc;
        },
        {} as Record<string, { count: number; cost: number; tokens: number }>
      );

      return {
        logs,
        summary: {
          totalCalls: logs.length,
          totalCost,
          totalTokens,
          byFunction,
        },
      };
    }),

  /**
   * Top 10 clients les plus coûteux
   */
  getTopConsumers: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const logs = await prisma.aIUsageLog.groupBy({
        by: ['companyId', 'tenantId'],
        where: {
          companyId: { not: null },
          ...(input.startDate || input.endDate
            ? {
                createdAt: {
                  ...(input.startDate ? { gte: input.startDate } : {}),
                  ...(input.endDate ? { lte: input.endDate } : {}),
                },
              }
            : {}),
        },
        _sum: {
          estimatedCost: true,
          totalTokens: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            estimatedCost: 'desc',
          },
        },
        take: input.limit,
      });

      // Enrichir avec les informations des entreprises
      const enriched = await Promise.all(
        logs.map(async (log) => {
          const company = log.companyId
            ? await prisma.company.findUnique({
                where: { id: log.companyId },
                select: {
                  legalName: true,
                  siret: true,
                  sector: true,
                },
              })
            : null;

          const tenant = await prisma.tenant.findUnique({
            where: { id: log.tenantId },
            select: {
              name: true,
              slug: true,
            },
          });

          return {
            companyId: log.companyId,
            company,
            tenant,
            totalCost: log._sum.estimatedCost || 0,
            totalTokens: log._sum.totalTokens || 0,
            callCount: log._count.id,
          };
        })
      );

      return enriched;
    }),

  /**
   * Consommation par fonction IA
   */
  getByFunction: adminProcedure
    .input(
      z.object({
        function: z
          .enum(['import', 'cotation', 'actions', 'reformulation', 'structuration', 'enrichment'])
          .optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const logs = await prisma.aIUsageLog.findMany({
        where: {
          ...(input.function ? { function: input.function } : {}),
          ...(input.startDate || input.endDate
            ? {
                createdAt: {
                  ...(input.startDate ? { gte: input.startDate } : {}),
                  ...(input.endDate ? { lte: input.endDate } : {}),
                },
              }
            : {}),
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
          company: {
            select: {
              legalName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalCost = logs.reduce((sum, log) => sum + log.estimatedCost, 0);
      const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);

      return {
        logs,
        summary: {
          totalCalls: logs.length,
          totalCost,
          totalTokens,
        },
      };
    }),

  /**
   * Alertes seuils (Pro >80%, Expert >80%)
   */
  getAlerts: adminProcedure.query(async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Récupérer les utilisateurs Pro et Expert
    const proExpertUsers = await prisma.userProfile.findMany({
      where: {
        plan: { in: ['pro', 'expert'] },
      },
      select: {
        id: true,
        email: true,
        plan: true,
        tenantId: true,
      },
    });

    const alerts: Array<{
      userId: string;
      userEmail: string;
      plan: string;
      currentUsage: number;
      quotaLimit: number;
      percentage: number;
      estimatedCost: number;
    }> = [];

    for (const user of proExpertUsers) {
      // Calculer la consommation IA du mois en cours
      const monthLogs = await prisma.aIUsageLog.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: monthStart },
        },
      });

      const totalCost = monthLogs.reduce((sum, log) => sum + log.estimatedCost, 0);
      const totalCalls = monthLogs.length;

      // Récupérer le quota selon le plan (approximation basée sur les quotas IA)
      // Pour Pro: 100 suggestions/mois, Expert: 300 suggestions/mois
      const quotaLimit = user.plan === 'pro' ? 100 : 300;
      const percentage = (totalCalls / quotaLimit) * 100;

      // Alerte si > 80%
      if (percentage > 80) {
        alerts.push({
          userId: user.id,
          userEmail: user.email,
          plan: user.plan,
          currentUsage: totalCalls,
          quotaLimit,
          percentage: Math.round(percentage),
          estimatedCost: totalCost,
        });
      }
    }

    return alerts.sort((a, b) => b.percentage - a.percentage);
  }),

  /**
   * Statistiques globales IA
   */
  getStats: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const logs = await prisma.aIUsageLog.findMany({
        where: {
          ...(input.startDate || input.endDate
            ? {
                createdAt: {
                  ...(input.startDate ? { gte: input.startDate } : {}),
                  ...(input.endDate ? { lte: input.endDate } : {}),
                },
              }
            : {}),
        },
      });

      const totalCost = logs.reduce((sum, log) => sum + log.estimatedCost, 0);
      const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);

      // Grouper par provider
      const byProvider = logs.reduce(
        (acc, log) => {
          if (!acc[log.provider]) {
            acc[log.provider] = { count: 0, cost: 0, tokens: 0 };
          }
          acc[log.provider].count++;
          acc[log.provider].cost += log.estimatedCost;
          acc[log.provider].tokens += log.totalTokens;
          return acc;
        },
        {} as Record<string, { count: number; cost: number; tokens: number }>
      );

      // Grouper par fonction
      const byFunction = logs.reduce(
        (acc, log) => {
          if (!acc[log.function]) {
            acc[log.function] = { count: 0, cost: 0, tokens: 0 };
          }
          acc[log.function].count++;
          acc[log.function].cost += log.estimatedCost;
          acc[log.function].tokens += log.totalTokens;
          return acc;
        },
        {} as Record<string, { count: number; cost: number; tokens: number }>
      );

      // Grouper par résultat (validated/rejected/pending)
      const byResult = logs.reduce(
        (acc, log) => {
          if (!acc[log.result]) {
            acc[log.result] = { count: 0, cost: 0 };
          }
          acc[log.result].count++;
          acc[log.result].cost += log.estimatedCost;
          return acc;
        },
        {} as Record<string, { count: number; cost: number }>
      );

      return {
        totalCalls: logs.length,
        totalCost,
        totalTokens,
        averageCostPerCall: logs.length > 0 ? totalCost / logs.length : 0,
        byProvider,
        byFunction,
        byResult,
      };
    }),

  /**
   * Marquer un résultat comme validé/rejeté
   */
  validateResult: adminProcedure
    .input(
      z.object({
        logId: z.string().cuid(),
        result: z.enum(['validated', 'rejected']),
      })
    )
    .mutation(async ({ input }) => {
      const log = await prisma.aIUsageLog.findUnique({
        where: { id: input.logId },
      });

      if (!log) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Log IA non trouvé',
        });
      }

      return await prisma.aIUsageLog.update({
        where: { id: input.logId },
        data: { result: input.result },
      });
    }),
});

