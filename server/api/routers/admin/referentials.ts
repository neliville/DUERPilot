/**
 * Router admin pour la gestion des référentiels
 */

import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/lib/db';

export const referentialsRouter = createTRPCRouter({
  /**
   * Liste référentiels
   */
  getAll: adminProcedure.query(async () => {
    return await prisma.oiraReferential.findMany({
      include: {
        sectors: {
          select: {
            id: true,
            code: true,
            label: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }),

  /**
   * Versions d'un référentiel
   */
  getVersions: adminProcedure
    .input(z.object({ referentialId: z.string().cuid() }))
    .query(async ({ input }) => {
      // Pour l'instant, on retourne le référentiel unique
      // À améliorer si vous implémentez un système de versioning
      const referential = await prisma.oiraReferential.findUnique({
        where: { id: input.referentialId },
      });

      if (!referential) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Référentiel non trouvé',
        });
      }

      return [referential]; // À adapter selon votre système de versioning
    }),

  /**
   * Créer référentiel
   */
  create: adminProcedure
    .input(
      z.object({
        code: z.string(),
        name: z.string(),
        source: z.string(),
        revisionDate: z.date(),
        description: z.string().optional(),
        structure: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.oiraReferential.create({
        data: {
          code: input.code,
          name: input.name,
          source: input.source,
          revisionDate: input.revisionDate,
          description: input.description,
          structure: input.structure,
        },
      });
    }),

  /**
   * Modifier référentiel
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().optional(),
        description: z.string().optional(),
        structure: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await prisma.oiraReferential.update({
        where: { id },
        data,
      });
    }),

  /**
   * Activer/désactiver référentiel
   */
  activate: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        active: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      // Pour l'instant, pas de champ active dans le modèle
      // À ajouter si nécessaire
      return { success: true, message: 'Fonctionnalité à implémenter' };
    }),
});

