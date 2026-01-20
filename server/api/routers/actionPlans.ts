import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { PLAN_FEATURES, getUpgradePlan, type Plan } from '@/lib/plans';

const createActionPlanSchema = z.object({
  riskAssessmentId: z.string().cuid().optional(),
  preventionMeasureId: z.string().cuid().optional(), // Nouveau champ
  workUnitId: z.string().cuid(),
  type: z.enum(['technique', 'organisationnelle', 'humaine']),
  description: z.string().min(1, 'La description est requise'),
  priority: z.enum(['basse', 'moyenne', 'haute', 'critique']),
  responsibleName: z.string().optional(),
  responsibleEmail: z.string().email().optional().or(z.literal('')),
  dueDate: z.date().optional(),
  status: z.enum(['à_faire', 'en_cours', 'bloqué', 'terminé']).default('à_faire'),
  notes: z.string().optional(),
});

const updateActionPlanSchema = createActionPlanSchema.partial().extend({
  id: z.string().cuid(),
});

export const actionPlansRouter = createTRPCRouter({
  /**
   * Récupère tous les plans d'actions du tenant
   */
  getAll: authenticatedProcedure
    .input(
      z
        .object({
          workUnitId: z.string().cuid().optional(),
          riskAssessmentId: z.string().cuid().optional(),
          status: z.enum(['à_faire', 'en_cours', 'bloqué', 'terminé']).optional(),
          priority: z.enum(['basse', 'moyenne', 'haute', 'critique']).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.userProfile;
      const userRoles = user.roles || [];
      const isOwner = user.isOwner || false;
      
      // Filtrage par scope si nécessaire
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

      // Filtrage par scope pour site_manager (son périmètre)
      if (userRoles.includes('site_manager') && !isOwner && !userRoles.includes('admin') && !userRoles.includes('qse')) {
        where.workUnit = {
          ...where.workUnit,
          siteId: scopeSites.length > 0 ? { in: scopeSites } : undefined,
        };
      }

      // Observer voit uniquement les actions assignées
      // TODO: Ajouter un champ assignedTo dans ActionPlan si nécessaire
      // Pour l'instant, observer voit toutes les actions de son périmètre

      if (input?.workUnitId) {
        where.workUnitId = input.workUnitId;
      }

      if (input?.riskAssessmentId) {
        where.riskAssessmentId = input.riskAssessmentId;
      }

      if (input?.status) {
        where.status = input.status;
      }

      if (input?.priority) {
        where.priority = input.priority;
      }

      const actions = await ctx.prisma.actionPlan.findMany({
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
          riskAssessment: {
            select: {
              id: true,
              priorityLevel: true,
              riskScore: true,
            },
          },
          preventionMeasure: {
            select: {
              id: true,
              type: true,
              description: true,
              effectiveness: true,
            },
          },
        },
        orderBy: [
          { dueDate: 'asc' },
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      return actions;
    }),

  /**
   * Récupère un plan d'action par son ID
   */
  getById: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const action = await ctx.prisma.actionPlan.findFirst({
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
          riskAssessment: {
            include: {
              dangerousSituation: {
                include: {
                  category: true,
                },
              },
            },
          },
          preventionMeasure: {
            select: {
              id: true,
              type: true,
              description: true,
              effectiveness: true,
            },
          },
        },
      });

      if (!action) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plan d\'action non trouvé',
        });
      }

      return action;
    }),

  /**
   * Crée un nouveau plan d'action
   */
  create: authenticatedProcedure
    .input(createActionPlanSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier les permissions : auditor ne peut pas créer d'actions
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner || false;
      const scopeSites = ctx.userProfile.scopeSites || [];

      if (userRoles.includes('auditor')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Les auditeurs externes ne peuvent pas créer de plans d\'action',
        });
      }

      // Vérifier le quota mensuel de plans d'action
      const userPlan = (ctx.userProfile?.plan || 'free') as Plan;
      const planFeatures = PLAN_FEATURES[userPlan];
      
      if (planFeatures.maxPlansActionPerMonth !== Infinity) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const plansActionCount = await ctx.prisma.actionPlan.count({
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
        
        if (plansActionCount >= planFeatures.maxPlansActionPerMonth) {
          const { PLAN_ERROR_MESSAGES } = await import('@/lib/plans');
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.limit_exceeded(
              'plansAction',
              plansActionCount,
              planFeatures.maxPlansActionPerMonth,
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

      // Vérifier le scope pour site_manager : ne peut créer que dans son périmètre
      if (userRoles.includes('site_manager') && !isOwner && !userRoles.includes('admin') && !userRoles.includes('qse')) {
        // Récupérer le site de l'unité de travail
        const workUnitWithSite = await ctx.prisma.workUnit.findUnique({
          where: { id: input.workUnitId },
          select: { siteId: true },
        });

        if (workUnitWithSite && !scopeSites.includes(workUnitWithSite.siteId)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Vous ne pouvez créer des plans d\'action que dans votre périmètre',
          });
        }
      }

      // Si un riskAssessmentId est fourni, vérifier qu'il appartient au tenant
      if (input.riskAssessmentId) {
        const riskAssessment = await ctx.prisma.riskAssessment.findFirst({
          where: {
            id: input.riskAssessmentId,
            workUnit: {
              site: {
                company: {
                  tenantId: ctx.tenantId,
                },
              },
            },
          },
        });

        if (!riskAssessment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Évaluation de risque non trouvée',
          });
        }
      }

      // Si un preventionMeasureId est fourni, vérifier qu'il appartient au tenant
      if (input.preventionMeasureId) {
        const preventionMeasure = await ctx.prisma.preventionMeasure.findFirst({
          where: {
            id: input.preventionMeasureId,
            riskAssessment: {
              workUnit: {
                site: {
                  company: {
                    tenantId: ctx.tenantId,
                  },
                },
              },
            },
          },
        });

        if (!preventionMeasure) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Mesure de prévention non trouvée',
          });
        }
      }

      const action = await ctx.prisma.actionPlan.create({
        data: {
          riskAssessmentId: input.riskAssessmentId,
          preventionMeasureId: input.preventionMeasureId,
          workUnitId: input.workUnitId,
          type: input.type,
          description: input.description,
          priority: input.priority,
          responsibleName: input.responsibleName,
          responsibleEmail:
            input.responsibleEmail === '' ? undefined : input.responsibleEmail,
          dueDate: input.dueDate,
          status: input.status,
          notes: input.notes,
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
          riskAssessment: {
            select: {
              id: true,
              priorityLevel: true,
              riskScore: true,
            },
          },
          preventionMeasure: {
            select: {
              id: true,
              type: true,
              description: true,
              effectiveness: true,
            },
          },
        },
      });

      return action;
    }),

  /**
   * Met à jour un plan d'action
   */
  update: authenticatedProcedure
    .input(updateActionPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Vérifier que l'action appartient au tenant
      const existing = await ctx.prisma.actionPlan.findFirst({
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
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plan d\'action non trouvé',
        });
      }

      // Vérifier les permissions
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner || false;
      const scopeSites = ctx.userProfile.scopeSites || [];

      // auditor ne peut pas modifier
      if (userRoles.includes('auditor')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Les auditeurs externes ne peuvent pas modifier de plans d\'action',
        });
      }

      // site_manager peut modifier celles de son périmètre
      if (userRoles.includes('site_manager') && !isOwner && !userRoles.includes('admin') && !userRoles.includes('qse')) {
        // Récupérer le site de l'unité de travail
        const workUnit = await ctx.prisma.workUnit.findUnique({
          where: { id: existing.workUnitId },
          select: { siteId: true },
        });

        if (workUnit && !scopeSites.includes(workUnit.siteId)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Vous ne pouvez modifier que les plans d\'action de votre périmètre',
          });
        }
      }

      // Vérifier preventionMeasureId si modifié
      if (data.preventionMeasureId !== undefined && data.preventionMeasureId !== existing.preventionMeasureId) {
        if (data.preventionMeasureId) {
          const preventionMeasure = await ctx.prisma.preventionMeasure.findFirst({
            where: {
              id: data.preventionMeasureId,
              riskAssessment: {
                workUnit: {
                  site: {
                    company: {
                      tenantId: ctx.tenantId,
                    },
                  },
                },
              },
            },
          });

          if (!preventionMeasure) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Mesure de prévention non trouvée',
            });
          }
        }
      }

      // Note: Le champ completedAt sera géré automatiquement par Prisma si défini dans le schéma

      const action = await ctx.prisma.actionPlan.update({
        where: { id },
        data: {
          ...data,
          responsibleEmail:
            data.responsibleEmail === '' ? undefined : data.responsibleEmail,
          // Note: attachmentUrls est maintenant utilisé au lieu de proofUrl
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
          riskAssessment: {
            select: {
              id: true,
              priorityLevel: true,
              riskScore: true,
            },
          },
          preventionMeasure: {
            select: {
              id: true,
              type: true,
              description: true,
              effectiveness: true,
            },
          },
        },
      });

      return action;
    }),

  /**
   * Supprime un plan d'action
   */
  delete: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'action appartient au tenant
      const existing = await ctx.prisma.actionPlan.findFirst({
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
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plan d\'action non trouvé',
        });
      }

      // Vérifier les permissions : seuls owner, admin, qse peuvent supprimer
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner || false;

      if (!isOwner && !userRoles.includes('admin') && !userRoles.includes('qse')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls le propriétaire, les administrateurs et les responsables QSE peuvent supprimer des plans d\'action',
        });
      }

      await ctx.prisma.actionPlan.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

