/**
 * Router tRPC pour la gestion de la participation des travailleurs
 * 
 * Conformité réglementaire : Consultation, information, association au processus DUERP
 * Article L.4121-1 et suivants du Code du travail
 */

import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

const createParticipationSchema = z.object({
  companyId: z.string().cuid(),
  type: z.enum(['consultation', 'information', 'association']),
  date: z.date(),
  organizerEmail: z.string().email(),
  isRealized: z.boolean().default(false), // Consultation réalisée : oui/non (obligatoire)
  participantsCount: z.number().int().min(0).optional(),
  participants: z.array(z.string()).default([]), // Liste des participants (noms/emails)
  subject: z.string().optional(), // Sujet de la consultation (ex: "Révision DUERP annuelle")
  summary: z.string().optional(), // Résumé des échanges
  observations: z.string().optional(), // Observations et retours des travailleurs
  decisions: z.string().optional(), // Décisions prises suite à la consultation
  nextSteps: z.string().optional(), // Prochaines étapes
  attachmentUrls: z.array(z.string()).default([]), // Pièces jointes
});

const updateParticipationSchema = z.object({
  id: z.string().cuid(),
  type: z.enum(['consultation', 'information', 'association']).optional(),
  date: z.date().optional(),
  organizerEmail: z.string().email().optional(),
  isRealized: z.boolean().optional(),
  participantsCount: z.number().int().min(0).optional().nullable(),
  participants: z.array(z.string()).optional(),
  subject: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  decisions: z.string().optional().nullable(),
  nextSteps: z.string().optional().nullable(),
  attachmentUrls: z.array(z.string()).optional(),
});

export const participationTravailleursRouter = createTRPCRouter({
  /**
   * Récupère toutes les participations d'une entreprise
   */
  getAll: authenticatedProcedure
    .input(
      z
        .object({
          companyId: z.string().cuid().optional(),
          type: z.enum(['consultation', 'information', 'association']).optional(),
          isRealized: z.boolean().optional(),
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

      if (input?.type) {
        where.type = input.type;
      }

      if (input?.isRealized !== undefined) {
        where.isRealized = input.isRealized;
      }

      const participations = await ctx.prisma.participationTravailleurs.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              legalName: true,
            },
          },
          organizer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });

      return participations;
    }),

  /**
   * Récupère une participation par son ID
   */
  getById: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const participation = await ctx.prisma.participationTravailleurs.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
        include: {
          company: {
            select: {
              id: true,
              legalName: true,
            },
          },
          organizer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!participation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Participation non trouvée',
        });
      }

      return participation;
    }),

  /**
   * Crée une nouvelle participation
   */
  create: authenticatedProcedure
    .input(createParticipationSchema)
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

      const participation = await ctx.prisma.participationTravailleurs.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
          organizerId: ctx.userProfile?.id || null,
          organizerEmail: input.organizerEmail || ctx.userProfile?.email || ctx.user?.email || '',
        },
        include: {
          company: {
            select: {
              id: true,
              legalName: true,
            },
          },
          organizer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return participation;
    }),

  /**
   * Met à jour une participation
   */
  update: authenticatedProcedure
    .input(updateParticipationSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const participation = await ctx.prisma.participationTravailleurs.findFirst({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
      });

      if (!participation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Participation non trouvée',
        });
      }

      const updated = await ctx.prisma.participationTravailleurs.update({
        where: { id },
        data,
        include: {
          company: {
            select: {
              id: true,
              legalName: true,
            },
          },
          organizer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return updated;
    }),

  /**
   * Supprime une participation
   */
  delete: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const participation = await ctx.prisma.participationTravailleurs.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
      });

      if (!participation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Participation non trouvée',
        });
      }

      await ctx.prisma.participationTravailleurs.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Récupère les statistiques de participation pour une entreprise
   */
  getStats: authenticatedProcedure
    .input(z.object({ companyId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
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

      const participations = await ctx.prisma.participationTravailleurs.findMany({
        where: {
          companyId: input.companyId,
          tenantId: ctx.tenantId,
        },
      });

      const stats = {
        total: participations.length,
        consultation: participations.filter((p) => p.type === 'consultation').length,
        information: participations.filter((p) => p.type === 'information').length,
        association: participations.filter((p) => p.type === 'association').length,
        realized: participations.filter((p) => p.isRealized).length,
        notRealized: participations.filter((p) => !p.isRealized).length,
        totalParticipants: participations.reduce((sum, p) => sum + (p.participantsCount || 0), 0),
      };

      return stats;
    }),
});

