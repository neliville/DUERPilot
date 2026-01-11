/**
 * Router admin pour le suivi support
 */

import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '../../trpc';
import { prisma } from '@/lib/db';
import { calculateGrossMarginForTenant } from '@/server/services/admin/cost-calculator';

export const supportRouter = createTRPCRouter({
  /**
   * Tickets par plan (placeholder - à intégrer avec votre système de tickets)
   */
  getTickets: adminProcedure
    .input(
      z.object({
        plan: z.enum(['free', 'starter', 'pro', 'expert']).optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      // Placeholder - à remplacer par votre système de tickets
      return {
        tickets: [],
        total: 0,
        message: 'Système de tickets à implémenter',
      };
    }),

  /**
   * Temps réponse réel vs SLA
   */
  getResponseTime: adminProcedure.query(async () => {
    // Placeholder - à remplacer par votre système de tickets
    return {
      averageResponseTime: 0,
      slaTarget: 0,
      compliance: 0,
      message: 'Système de tickets à implémenter',
    };
  }),

  /**
   * Motifs fréquents
   */
  getFrequentIssues: adminProcedure.query(async () => {
    // Placeholder - à remplacer par votre système de tickets
    return {
      issues: [],
      message: 'Système de tickets à implémenter',
    };
  }),

  /**
   * Clients à risque (support élevé + faible marge)
   */
  getAtRiskClients: adminProcedure.query(async () => {
    // Identifier les clients avec faible marge
    const tenants = await prisma.tenant.findMany({
      include: {
        subscription: true,
        users: {
          select: {
            plan: true,
          },
          take: 1,
        },
      },
    });

    const atRiskClients = [];

    for (const tenant of tenants) {
      if (!tenant.subscription || tenant.subscription.status !== 'active') {
        continue;
      }

      try {
        const margin = await calculateGrossMarginForTenant(
          tenant.id,
          tenant.subscription.billingMode as 'monthly' | 'annual'
        );

        // Client à risque si marge < 10%
        if (margin.marginPercentage < 10) {
          atRiskClients.push({
            tenantId: tenant.id,
            tenantName: tenant.name,
            plan: tenant.users[0]?.plan || 'free',
            margin: margin.marginPercentage,
            revenue: margin.revenue,
            aiCost: margin.aiCost,
          });
        }
      } catch (error) {
        // Ignorer les erreurs de calcul
        console.error(`Erreur calcul marge pour tenant ${tenant.id}:`, error);
      }
    }

    return {
      clients: atRiskClients.sort((a, b) => a.margin - b.margin),
      total: atRiskClients.length,
    };
  }),
});

