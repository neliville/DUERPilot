/**
 * Router admin pour la gestion des entreprises
 * Vue centralisée avec toutes les données nécessaires
 */

import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/lib/db';

export const companiesRouter = createTRPCRouter({
  /**
   * Liste toutes les entreprises avec filtres
   */
  getAll: adminProcedure
    .input(
      z.object({
        plan: z.enum(['free', 'starter', 'pro', 'expert']).optional(),
        status: z.enum(['active', 'trial', 'suspended', 'cancelled']).optional(),
        sector: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const where: any = {};

      if (input.plan) {
        where.tenant = {
          users: {
            some: {
              plan: input.plan,
            },
          },
        };
      }

      if (input.sector) {
        where.sector = { contains: input.sector, mode: 'insensitive' };
      }

      // Status via subscription
      if (input.status) {
        where.subscription = {
          status: input.status,
        };
      }

      const [companies, total] = await Promise.all([
        prisma.company.findMany({
          where,
          include: {
            tenant: {
              include: {
                users: {
                  select: {
                    plan: true,
                    email: true,
                  },
                  take: 1,
                },
                subscription: {
                  select: {
                    plan: true,
                    status: true,
                    billingMode: true,
                    startDate: true,
                    renewalDate: true,
                  },
                },
              },
            },
            duerpVersions: {
              select: {
                createdAt: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
            sites: {
              select: {
                workUnits: {
                  select: {
                    riskAssessments: {
                      select: {
                        createdAt: true,
                      },
                      orderBy: {
                        createdAt: 'desc',
                      },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: input.limit,
          skip: input.offset,
        }),
        prisma.company.count({ where }),
      ]);

      // Enrichir avec les données admin
      const enriched = companies.map((company) => {
        const user = company.tenant.users[0];
        const subscription = company.tenant.subscription;
        const lastDuerp = company.duerpVersions[0];
        
        // Dernière activité = dernier risque créé
        let lastActivity = company.lastActivity;
        for (const site of company.sites) {
          for (const workUnit of site.workUnits) {
            if (workUnit.riskAssessments[0]?.createdAt) {
              const riskDate = workUnit.riskAssessments[0].createdAt;
              if (!lastActivity || riskDate > lastActivity) {
                lastActivity = riskDate;
              }
            }
          }
        }

        return {
          id: company.id,
          tenantId: company.tenantId,
          legalName: company.legalName,
          siret: company.siret,
          sector: company.sector,
          employeeCount: company.employeeCount,
          plan: user?.plan || 'free',
          billingMode: subscription?.billingMode || 'monthly',
          status: subscription?.status || 'active',
          startDate: subscription?.startDate,
          renewalDate: subscription?.renewalDate,
          methodsUsed: company.methodsUsed || [],
          lastDuerpGeneration: lastDuerp?.createdAt || company.lastDuerpGeneration,
          lastActivity: lastActivity || company.lastActivity,
        };
      });

      return {
        companies: enriched,
        total,
      };
    }),

  /**
   * Détails complets d'une entreprise
   */
  getById: adminProcedure
    .input(z.object({ companyId: z.string().cuid() }))
    .query(async ({ input }) => {
      const company = await prisma.company.findUnique({
        where: { id: input.companyId },
        include: {
          tenant: {
            include: {
              users: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  plan: true,
                  lastLoginAt: true,
                },
              },
              subscription: true,
            },
          },
          sites: {
            include: {
              workUnits: {
                include: {
                  riskAssessments: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                  },
                },
              },
            },
          },
          duerpVersions: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      if (!company) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Entreprise non trouvée',
        });
      }

      return company;
    }),

  /**
   * Statistiques globales entreprises
   */
  getStats: adminProcedure.query(async () => {
    const [total, byPlan, byStatus] = await Promise.all([
      prisma.company.count(),
      prisma.company.groupBy({
        by: ['tenantId'],
        _count: true,
      }).then(async (groups) => {
        // Enrichir avec les plans
        const planCounts: Record<string, number> = {
          free: 0,
          starter: 0,
          pro: 0,
          expert: 0,
        };

        for (const group of groups) {
          const user = await prisma.userProfile.findFirst({
            where: { tenantId: group.tenantId },
            select: { plan: true },
          });
          const plan = (user?.plan || 'free') as keyof typeof planCounts;
          planCounts[plan] = (planCounts[plan] || 0) + group._count;
        }

        return planCounts;
      }),
      prisma.subscription.groupBy({
        by: ['status'],
        _count: true,
      }).then((groups) => {
        const statusCounts: Record<string, number> = {};
        for (const group of groups) {
          statusCounts[group.status] = group._count;
        }
        return statusCounts;
      }),
    ]);

    return {
      total,
      byPlan,
      byStatus,
    };
  }),

  /**
   * Changer statut (actif, essai, suspendu, résilié)
   */
  updateStatus: adminProcedure
    .input(
      z.object({
        tenantId: z.string().cuid(),
        status: z.enum(['active', 'trial', 'suspended', 'cancelled']),
      })
    )
    .mutation(async ({ input }) => {
      const subscription = await prisma.subscription.findUnique({
        where: { tenantId: input.tenantId },
      });

      if (!subscription) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Abonnement non trouvé',
        });
      }

      return await prisma.subscription.update({
        where: { tenantId: input.tenantId },
        data: {
          status: input.status,
          ...(input.status === 'cancelled' ? { cancelledAt: new Date() } : {}),
        },
      });
    }),

  /**
   * Changer plan manuellement
   */
  updatePlan: adminProcedure
    .input(
      z.object({
        tenantId: z.string().cuid(),
        plan: z.enum(['free', 'starter', 'pro', 'expert']),
      })
    )
    .mutation(async ({ input }) => {
      // Mettre à jour le plan de tous les utilisateurs du tenant
      await prisma.userProfile.updateMany({
        where: { tenantId: input.tenantId },
        data: { plan: input.plan },
      });

      // Mettre à jour l'abonnement
      const subscription = await prisma.subscription.findUnique({
        where: { tenantId: input.tenantId },
      });

      if (subscription) {
        await prisma.subscription.update({
          where: { tenantId: input.tenantId },
          data: { plan: input.plan },
        });
      }

      return { success: true };
    }),

  /**
   * Modifier abonnement
   */
  updateSubscription: adminProcedure
    .input(
      z.object({
        tenantId: z.string().cuid(),
        plan: z.enum(['free', 'starter', 'pro', 'expert']).optional(),
        billingMode: z.enum(['monthly', 'annual']).optional(),
        renewalDate: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { tenantId, ...data } = input;

      const subscription = await prisma.subscription.findUnique({
        where: { tenantId },
      });

      if (!subscription) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Abonnement non trouvé',
        });
      }

      return await prisma.subscription.update({
        where: { tenantId },
        data,
      });
    }),
});

