/**
 * Router tRPC pour la gestion du PAPRIPACT
 * 
 * PAPRIPACT = Plan d'Actions de Prévention des Risques et d'Amélioration des Conditions de Travail
 * Obligatoire pour les entreprises de 50 salariés et plus (article L.4121-3 du Code du travail)
 */

import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// Constante pour le seuil d'effectif PAPRIPACT
export const PAPRIPACT_EMPLOYEE_THRESHOLD = 50;

const createPAPRIPACTSchema = z.object({
  companyId: z.string().cuid(),
  year: z.number().int().min(2000).max(2100),
});

const createPAPRIPACTActionSchema = z.object({
  papripactId: z.string().cuid(),
  actionPlanId: z.string().cuid().optional(),
  title: z.string().min(1, 'Le titre est obligatoire'),
  description: z.string().optional(),
  priority: z.enum(['priorité_1', 'priorité_2', 'priorité_3']),
  responsibleName: z.string().optional(),
  responsibleEmail: z.string().email().optional().or(z.literal('')),
  conditionsExecution: z.string().optional(), // Obligatoire pour PAPRIPACT mais optionnel dans le schéma
  plannedStartDate: z.date().optional(),
  plannedEndDate: z.date().optional(),
  status: z.enum(['planifiée', 'en_cours', 'réalisée', 'reportée', 'annulée']).default('planifiée'),
  progress: z.number().int().min(0).max(100).default(0),
  notes: z.string().optional(),
});

const createPAPRIPACTIndicatorSchema = z.object({
  papripactId: z.string().cuid(),
  name: z.string().min(1, 'Le nom de l\'indicateur est obligatoire'),
  type: z.enum(['quantitatif', 'qualitatif']),
  unit: z.string().optional(),
  targetValue: z.string().optional(),
  currentValue: z.string().optional(),
  frequency: z.enum(['mensuel', 'trimestriel', 'annuel']),
  notes: z.string().optional(),
});

/**
 * Vérifie si une entreprise est éligible au PAPRIPACT (effectif >= 50)
 */
export async function isCompanyEligibleForPAPRIPACT(
  prisma: any,
  companyId: string
): Promise<boolean> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { employeeCount: true },
  });

  return company?.employeeCount !== null && company.employeeCount >= PAPRIPACT_EMPLOYEE_THRESHOLD;
}

export const papripactRouter = createTRPCRouter({
  /**
   * Vérifie si une entreprise est éligible au PAPRIPACT
   */
  checkEligibility: authenticatedProcedure
    .input(z.object({ companyId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const eligible = await isCompanyEligibleForPAPRIPACT(ctx.prisma, input.companyId);
      
      const company = await ctx.prisma.company.findUnique({
        where: { id: input.companyId },
        select: { employeeCount: true, legalName: true },
      });

      return {
        eligible,
        employeeCount: company?.employeeCount ?? null,
        threshold: PAPRIPACT_EMPLOYEE_THRESHOLD,
        message: eligible
          ? `PAPRIPACT obligatoire : entreprise de ${company?.employeeCount} salariés (seuil : ${PAPRIPACT_EMPLOYEE_THRESHOLD})`
          : `PAPRIPACT non obligatoire : entreprise de ${company?.employeeCount ?? 'effectif non renseigné'} salariés (seuil : ${PAPRIPACT_EMPLOYEE_THRESHOLD})`,
      };
    }),

  /**
   * Récupère tous les PAPRIPACT d'une entreprise
   */
  getAll: authenticatedProcedure
    .input(
      z
        .object({
          companyId: z.string().cuid().optional(),
          year: z.number().int().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        tenantId: ctx.tenantId,
      };

      if (input?.companyId) {
        // Vérifier que l'entreprise appartient au tenant
        const company = await ctx.prisma.company.findFirst({
          where: {
            id: input.companyId,
            tenantId: ctx.tenantId,
          },
        });

        if (!company) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Entreprise non trouvée',
          });
        }

        where.companyId = input.companyId;
      }

      if (input?.year) {
        where.year = input.year;
      }

      const papripacts = await ctx.prisma.pAPRIPACT.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              legalName: true,
              employeeCount: true,
            },
          },
          actions: {
            orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
          },
          indicators: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: [
          { year: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      return papripacts;
    }),

  /**
   * Récupère un PAPRIPACT par son ID
   */
  getById: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const papripact = await ctx.prisma.pAPRIPACT.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
        include: {
          company: {
            select: {
              id: true,
              legalName: true,
              employeeCount: true,
            },
          },
          actions: {
            orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
          },
          indicators: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!papripact) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'PAPRIPACT non trouvé',
        });
      }

      return papripact;
    }),

  /**
   * Crée un nouveau PAPRIPACT (vérifie l'éligibilité)
   */
  create: authenticatedProcedure
    .input(createPAPRIPACTSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'entreprise appartient au tenant
      const company = await ctx.prisma.company.findFirst({
        where: {
          id: input.companyId,
          tenantId: ctx.tenantId,
        },
      });

      if (!company) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Entreprise non trouvée',
        });
      }

      // Vérifier l'éligibilité (effectif >= 50)
      const eligible = await isCompanyEligibleForPAPRIPACT(ctx.prisma, input.companyId);
      if (!eligible) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `PAPRIPACT non obligatoire : entreprise de ${company.employeeCount ?? 'effectif non renseigné'} salariés (seuil : ${PAPRIPACT_EMPLOYEE_THRESHOLD}). Le PAPRIPACT est obligatoire uniquement pour les entreprises de ${PAPRIPACT_EMPLOYEE_THRESHOLD} salariés et plus (article L.4121-3 du Code du travail).`,
        });
      }

      // Vérifier qu'il n'existe pas déjà un PAPRIPACT pour cette année
      const existing = await ctx.prisma.pAPRIPACT.findUnique({
        where: {
          companyId_year: {
            companyId: input.companyId,
            year: input.year,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Un PAPRIPACT existe déjà pour l'année ${input.year}`,
        });
      }

      const papripact = await ctx.prisma.pAPRIPACT.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
          status: 'brouillon',
        },
        include: {
          company: {
            select: {
              id: true,
              legalName: true,
              employeeCount: true,
            },
          },
        },
      });

      return papripact;
    }),

  /**
   * Met à jour un PAPRIPACT
   */
  update: authenticatedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        status: z.enum(['brouillon', 'validé', 'en_cours', 'terminé']).optional(),
        validatedBy: z.string().email().optional().or(z.literal('')),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const papripact = await ctx.prisma.pAPRIPACT.findFirst({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
      });

      if (!papripact) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'PAPRIPACT non trouvé',
        });
      }

      const updateData: any = { ...data };
      
      // Si le statut passe à "validé", enregistrer la date et le validateur
      if (input.status === 'validé' && !papripact.validatedAt) {
        updateData.validatedAt = new Date();
        if (input.validatedBy) {
          updateData.validatedBy = input.validatedBy;
        } else {
          updateData.validatedBy = ctx.userProfile?.email || ctx.user?.email || null;
        }
      }

      const updated = await ctx.prisma.pAPRIPACT.update({
        where: { id },
        data: updateData,
        include: {
          company: true,
          actions: true,
          indicators: true,
        },
      });

      return updated;
    }),

  /**
   * Ajoute une action au PAPRIPACT
   */
  addAction: authenticatedProcedure
    .input(createPAPRIPACTActionSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le PAPRIPACT appartient au tenant
      const papripact = await ctx.prisma.pAPRIPACT.findFirst({
        where: {
          id: input.papripactId,
          tenantId: ctx.tenantId,
        },
      });

      if (!papripact) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'PAPRIPACT non trouvé',
        });
      }

      const action = await ctx.prisma.pAPRIPACTAction.create({
        data: input,
        include: {
          papripact: {
            select: {
              id: true,
              year: true,
              status: true,
            },
          },
        },
      });

      return action;
    }),

  /**
   * Met à jour une action PAPRIPACT
   */
  updateAction: authenticatedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        priority: z.enum(['priorité_1', 'priorité_2', 'priorité_3']).optional(),
        responsibleName: z.string().optional(),
        responsibleEmail: z.string().email().optional().or(z.literal('')),
        conditionsExecution: z.string().optional(),
        plannedStartDate: z.date().optional().nullable(),
        plannedEndDate: z.date().optional().nullable(),
        actualStartDate: z.date().optional().nullable(),
        actualEndDate: z.date().optional().nullable(),
        status: z.enum(['planifiée', 'en_cours', 'réalisée', 'reportée', 'annulée']).optional(),
        progress: z.number().int().min(0).max(100).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Vérifier que l'action appartient à un PAPRIPACT du tenant
      const action = await ctx.prisma.pAPRIPACTAction.findFirst({
        where: { id },
        include: {
          papripact: {
            select: {
              tenantId: true,
            },
          },
        },
      });

      if (!action || action.papripact.tenantId !== ctx.tenantId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Action PAPRIPACT non trouvée',
        });
      }

      const updated = await ctx.prisma.pAPRIPACTAction.update({
        where: { id },
        data,
      });

      return updated;
    }),

  /**
   * Supprime une action PAPRIPACT
   */
  deleteAction: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'action appartient à un PAPRIPACT du tenant
      const action = await ctx.prisma.pAPRIPACTAction.findFirst({
        where: { id: input.id },
        include: {
          papripact: {
            select: {
              tenantId: true,
            },
          },
        },
      });

      if (!action || action.papripact.tenantId !== ctx.tenantId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Action PAPRIPACT non trouvée',
        });
      }

      await ctx.prisma.pAPRIPACTAction.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Ajoute un indicateur au PAPRIPACT
   */
  addIndicator: authenticatedProcedure
    .input(createPAPRIPACTIndicatorSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le PAPRIPACT appartient au tenant
      const papripact = await ctx.prisma.pAPRIPACT.findFirst({
        where: {
          id: input.papripactId,
          tenantId: ctx.tenantId,
        },
      });

      if (!papripact) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'PAPRIPACT non trouvé',
        });
      }

      const indicator = await ctx.prisma.pAPRIPACTIndicator.create({
        data: input,
      });

      return indicator;
    }),

  /**
   * Met à jour un indicateur PAPRIPACT
   */
  updateIndicator: authenticatedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(1).optional(),
        type: z.enum(['quantitatif', 'qualitatif']).optional(),
        unit: z.string().optional().nullable(),
        targetValue: z.string().optional().nullable(),
        currentValue: z.string().optional().nullable(),
        frequency: z.enum(['mensuel', 'trimestriel', 'annuel']).optional(),
        notes: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: indicatorId, ...data } = input;

      // Vérifier que l'indicateur appartient à un PAPRIPACT du tenant
      const indicator = await ctx.prisma.pAPRIPACTIndicator.findFirst({
        where: { id: indicatorId },
        include: {
          papripact: {
            select: {
              tenantId: true,
            },
          },
        },
      });

      if (!indicator || indicator.papripact.tenantId !== ctx.tenantId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Indicateur PAPRIPACT non trouvé',
        });
      }

      // Si currentValue est mis à jour, mettre à jour lastUpdateDate
      const updateData: any = { ...data };
      if (input.currentValue !== undefined && input.currentValue !== indicator.currentValue) {
        updateData.lastUpdateDate = new Date();
      }

      const updated = await ctx.prisma.pAPRIPACTIndicator.update({
        where: { id: indicatorId },
        data: updateData,
      });

      return updated;
    }),

  /**
   * Supprime un indicateur PAPRIPACT
   */
  deleteIndicator: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'indicateur appartient à un PAPRIPACT du tenant
      const indicator = await ctx.prisma.pAPRIPACTIndicator.findFirst({
        where: { id: input.id },
        include: {
          papripact: {
            select: {
              tenantId: true,
            },
          },
        },
      });

      if (!indicator || indicator.papripact.tenantId !== ctx.tenantId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Indicateur PAPRIPACT non trouvé',
        });
      }

      await ctx.prisma.pAPRIPACTIndicator.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

