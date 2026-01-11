/**
 * Router tRPC pour la gestion des préférences email (RGPD)
 */

import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { prisma } from '@/lib/db';

export const emailPreferencesRouter = createTRPCRouter({
  /**
   * Récupère les préférences email de l'utilisateur
   */
  get: authenticatedProcedure.query(async ({ ctx }) => {
    const preferences = await prisma.emailPreferences.findUnique({
      where: { userId: ctx.userProfile!.id },
    });

    // Si pas de préférences, créer avec valeurs par défaut
    if (!preferences) {
      return await prisma.emailPreferences.create({
        data: {
          userId: ctx.userProfile!.id,
          unsubscribedAll: false,
          marketingEmails: true,
          productUpdates: true,
          monthlyDigest: true,
          aiInsights: true,
        },
      });
    }

    return preferences;
  }),

  /**
   * Met à jour les préférences email
   */
  update: authenticatedProcedure
    .input(
      z.object({
        unsubscribedAll: z.boolean().optional(),
        marketingEmails: z.boolean().optional(),
        productUpdates: z.boolean().optional(),
        monthlyDigest: z.boolean().optional(),
        aiInsights: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.emailPreferences.upsert({
        where: { userId: ctx.userProfile!.id },
        update: input,
        create: {
          userId: ctx.userProfile!.id,
          unsubscribedAll: input.unsubscribedAll ?? false,
          marketingEmails: input.marketingEmails ?? true,
          productUpdates: input.productUpdates ?? true,
          monthlyDigest: input.monthlyDigest ?? true,
          aiInsights: input.aiInsights ?? true,
        },
      });
    }),
});

