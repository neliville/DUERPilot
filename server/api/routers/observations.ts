import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { PLAN_FEATURES, getUpgradePlan, type Plan } from '@/lib/plans';

const createObservationSchema = z.object({
  workUnitId: z.string().cuid(),
  description: z.string().min(1, 'La description est requise'),
  photoUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  status: z.enum(['nouvelle', 'en_analyse', 'intégrée', 'rejetée']).default('nouvelle'),
  riskAssessmentId: z.string().cuid().optional(),
});

const updateObservationSchema = createObservationSchema.partial().extend({
  id: z.string().cuid(),
});

export const observationsRouter = createTRPCRouter({
  /**
   * Récupère toutes les observations du tenant
   */
  getAll: authenticatedProcedure
    .input(
      z
        .object({
          workUnitId: z.string().cuid().optional(),
          status: z.enum(['nouvelle', 'en_analyse', 'intégrée', 'rejetée']).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.userProfile;
      const userRoles = user.roles || [];
      const isOwner = user.isOwner || false;
      
      // Filtrage par scope si nécessaire (site_manager, observer)
      const scopeSites = user.scopeSites || [];
      const hasScope = ['site_manager', 'observer'].some((r) => userRoles.includes(r));
      
      const where: any = {
        workUnit: {
          site: {
            company: {
              tenantId: ctx.tenantId,
            },
          },
        },
      };

      // Filtrage par scope pour site_manager et observer
      // Representative voit TOUTES les observations du tenant (view_all: 'full')
      if (hasScope && !isOwner && !userRoles.includes('admin') && !userRoles.includes('qse') && !userRoles.includes('representative')) {
        where.workUnit = {
          ...where.workUnit,
          siteId: scopeSites.length > 0 ? { in: scopeSites } : undefined,
        };
      }

      // Observer ne voit que ses propres observations (view_own: 'limited')
      if (userRoles.includes('observer') && !userRoles.includes('site_manager') && !isOwner && !userRoles.includes('admin') && !userRoles.includes('qse')) {
        where.submittedById = ctx.userProfile.id;
      }

      if (input?.workUnitId) {
        where.workUnitId = input.workUnitId;
      }

      if (input?.status) {
        where.status = input.status;
      }

      const observations = await ctx.prisma.observation.findMany({
        where,
        include: {
          workUnit: {
            include: {
              site: {
                include: {
                  company: {
                    select: {
                      id: true,
                      legalName: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return observations;
    }),

  /**
   * Récupère une observation par son ID
   */
  getById: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const observation = await ctx.prisma.observation.findFirst({
        where: {
          id: input.id,
          workUnit: {
            site: {
              company: {
                tenantId: ctx.tenantId,
              },
            },
          },
        },
        include: {
          workUnit: {
            include: {
              site: {
                include: {
                  company: true,
                },
              },
            },
          },
        },
      });

      if (!observation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Observation non trouvée',
        });
      }

      return observation;
    }),

  /**
   * Crée une nouvelle observation
   */
  create: authenticatedProcedure
    .input(createObservationSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier les permissions : auditor ne peut pas créer d'observations
      const userRoles = ctx.userProfile.roles || [];
      if (userRoles.includes('auditor')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Les auditeurs externes ne peuvent pas créer d\'observations',
        });
      }

      // Vérifier le quota mensuel d'observations
      const userPlan = (ctx.userProfile?.plan || 'free') as Plan;
      const planFeatures = PLAN_FEATURES[userPlan];
      
      if (planFeatures.maxObservationsPerMonth !== Infinity) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const observationsCount = await ctx.prisma.observation.count({
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
        
        if (observationsCount >= planFeatures.maxObservationsPerMonth) {
          const { PLAN_ERROR_MESSAGES } = await import('@/lib/plans');
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.limit_exceeded(
              'observations',
              observationsCount,
              planFeatures.maxObservationsPerMonth,
              userPlan,
              upgradePlan
            ),
          });
        }
      }

      // Vérifier que l'unité de travail appartient au tenant
      const workUnit = await ctx.prisma.workUnit.findFirst({
        where: {
          id: input.workUnitId,
          site: {
            company: {
              tenantId: ctx.tenantId,
            },
          },
        },
      });

      if (!workUnit) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Unité de travail non trouvée',
        });
      }

      const observation = await ctx.prisma.observation.create({
        data: {
          tenantId: ctx.tenantId,
          workUnitId: input.workUnitId,
          description: input.description,
          photoUrl: input.photoUrl === '' ? undefined : input.photoUrl,
          location: input.location,
          status: input.status,
          submittedByEmail: ctx.userProfile?.email || ctx.user?.email || '',
          submittedById: ctx.userProfile?.id || undefined,
          integratedRiskAssessmentId: input.riskAssessmentId || undefined,
        },
        include: {
          workUnit: {
            include: {
              site: {
                include: {
                  company: true,
                },
              },
            },
          },
        },
      });

      return observation;
    }),

  /**
   * Met à jour une observation
   */
  update: authenticatedProcedure
    .input(updateObservationSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner || false;
      const scopeSites = ctx.userProfile.scopeSites || [];

      // Vérifier que l'observation appartient au tenant
      const existing = await ctx.prisma.observation.findFirst({
        where: {
          id,
          workUnit: {
            site: {
              company: {
                tenantId: ctx.tenantId,
              },
            },
          },
        },
        include: {
          workUnit: {
            select: { siteId: true },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Observation non trouvée',
        });
      }

      // Vérifier les permissions
      // auditor ne peut pas modifier
      if (userRoles.includes('auditor')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Les auditeurs externes ne peuvent pas modifier d\'observations',
        });
      }

      // Observer ne peut modifier que ses propres observations
      if (userRoles.includes('observer') && !isOwner && !userRoles.includes('admin') && !userRoles.includes('qse') && !userRoles.includes('site_manager')) {
        if (existing.submittedById !== ctx.userProfile.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Vous ne pouvez modifier que vos propres observations',
          });
        }
      }

      // site_manager peut modifier celles de son périmètre
      if (userRoles.includes('site_manager') && !isOwner && !userRoles.includes('admin') && !userRoles.includes('qse')) {
        if (!scopeSites.includes(existing.workUnit.siteId)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Vous ne pouvez modifier que les observations de votre périmètre',
          });
        }
      }

      const observation = await ctx.prisma.observation.update({
        where: { id },
        data: {
          description: data.description,
          photoUrl: data.photoUrl === '' ? undefined : data.photoUrl,
          location: data.location,
          status: data.status,
          integratedRiskAssessmentId: data.riskAssessmentId || undefined,
        },
        include: {
          workUnit: {
            include: {
              site: {
                include: {
                  company: true,
                },
              },
            },
          },
        },
      });

      return observation;
    }),

  /**
   * Supprime une observation
   */
  delete: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner || false;

      // Vérifier que l'observation appartient au tenant
      const existing = await ctx.prisma.observation.findFirst({
        where: {
          id: input.id,
          workUnit: {
            site: {
              company: {
                tenantId: ctx.tenantId,
              },
            },
          },
        },
        include: {
          workUnit: {
            select: { siteId: true },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Observation non trouvée',
        });
      }

      // Vérifier les permissions
      // Seuls owner, admin, qse peuvent supprimer
      // Les autres rôles ne peuvent pas supprimer (clôturer seulement)
      if (!isOwner && !userRoles.includes('admin') && !userRoles.includes('qse')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Vous n\'êtes pas autorisé à supprimer des observations',
        });
      }

      await ctx.prisma.observation.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Change le statut d'une observation
   */
  updateStatus: authenticatedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        status: z.enum(['nouvelle', 'en_analyse', 'intégrée', 'rejetée']),
        riskAssessmentId: z.string().cuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner || false;
      const scopeSites = ctx.userProfile.scopeSites || [];

      // Vérifier que l'observation appartient au tenant
      const existing = await ctx.prisma.observation.findFirst({
        where: {
          id: input.id,
          workUnit: {
            site: {
              company: {
                tenantId: ctx.tenantId,
              },
            },
          },
        },
        include: {
          workUnit: {
            select: { siteId: true },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Observation non trouvée',
        });
      }

      // Vérifier les permissions
      // auditor ne peut pas modifier le statut
      if (userRoles.includes('auditor')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Les auditeurs externes ne peuvent pas modifier le statut des observations',
        });
      }

      // Observer et representative peuvent clôturer leurs propres observations
      const canCloseOwn = (userRoles.includes('observer') || userRoles.includes('representative')) &&
                          existing.submittedById === ctx.userProfile.id;

      // site_manager peut clôturer les observations de son périmètre
      const canCloseScope = userRoles.includes('site_manager') &&
                            !isOwner &&
                            !userRoles.includes('admin') &&
                            !userRoles.includes('qse') &&
                            scopeSites.includes(existing.workUnit.siteId);

      // owner, admin, qse peuvent modifier toutes les observations
      const canModifyAll = isOwner || userRoles.includes('admin') || userRoles.includes('qse');

      if (!canModifyAll && !canCloseOwn && !canCloseScope) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Vous n\'êtes pas autorisé à modifier le statut de cette observation',
        });
      }

      const observation = await ctx.prisma.observation.update({
        where: { id: input.id },
        data: {
          status: input.status,
          integratedRiskAssessmentId: input.riskAssessmentId || undefined,
        },
      });

      return observation;
    }),
});

