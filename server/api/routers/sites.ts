import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { PLAN_FEATURES, getUpgradePlan, type Plan } from '@/lib/plans';

const createSiteSchema = z.object({
  companyId: z.string().cuid(),
  name: z.string().min(1, 'Le nom du site est requis'),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('France'),
  employeeCount: z.number().int().positive().optional(),
  isMainSite: z.boolean().default(false),
});

const updateSiteSchema = createSiteSchema.partial().extend({
  id: z.string().cuid(),
});

export const sitesRouter = createTRPCRouter({
  /**
   * Récupère tous les sites d'une entreprise
   */
  getByCompany: authenticatedProcedure
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

      const sites = await ctx.prisma.site.findMany({
        where: {
          companyId: input.companyId,
        },
        orderBy: [
          { isMainSite: 'desc' },
          { name: 'asc' },
        ],
      });

      return sites;
    }),

  /**
   * Crée un nouveau site
   */
  create: authenticatedProcedure
    .input(createSiteSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier les permissions : seuls owner, admin peuvent créer des sites
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner || false;

      if (!isOwner && !userRoles.includes('admin') && !userRoles.includes('qse')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls le propriétaire, les administrateurs et les responsables QSE peuvent créer des sites',
        });
      }

      // Vérifier la limite de sites
      const userPlan = (ctx.userProfile?.plan || 'free') as Plan;
      const planFeatures = PLAN_FEATURES[userPlan];
      
      if (planFeatures.maxSites !== Infinity) {
        const sitesCount = await ctx.prisma.site.count({
          where: {
            company: { tenantId: ctx.tenantId },
          },
        });
        
        if (sitesCount >= planFeatures.maxSites) {
          const { PLAN_ERROR_MESSAGES, getUpgradePlan } = await import('@/lib/plans');
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.limit_exceeded(
              'sites',
              sitesCount,
              planFeatures.maxSites,
              userPlan,
              upgradePlan
            ),
          });
        }
      }

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

      // Si c'est le site principal, s'assurer qu'il n'y en a pas déjà un
      if (input.isMainSite) {
        const existingMainSite = await ctx.prisma.site.findFirst({
          where: {
            companyId: input.companyId,
            isMainSite: true,
          },
        });

        if (existingMainSite) {
          // Mettre à jour l'ancien site principal
          await ctx.prisma.site.update({
            where: { id: existingMainSite.id },
            data: { isMainSite: false },
          });
        }
      }

      const site = await ctx.prisma.site.create({
        data: {
          ...input,
        },
      });

      return site;
    }),

  /**
   * Met à jour un site
   */
  update: authenticatedProcedure
    .input(updateSiteSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Vérifier que le site appartient à une entreprise du tenant
      const existing = await ctx.prisma.site.findFirst({
        where: { id },
        include: {
          company: true,
        },
      });

      if (!existing || existing.company.tenantId !== ctx.tenantId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Site non trouvé',
        });
      }

      // Vérifier les permissions : seuls owner, admin peuvent modifier des sites
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner || false;

      if (!isOwner && !userRoles.includes('admin') && !userRoles.includes('qse')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls le propriétaire, les administrateurs et les responsables QSE peuvent modifier des sites',
        });
      }

      // Si on définit ce site comme principal, retirer le statut des autres
      if (data.isMainSite) {
        await ctx.prisma.site.updateMany({
          where: {
            companyId: existing.companyId,
            id: { not: id },
            isMainSite: true,
          },
          data: { isMainSite: false },
        });
      }

      const site = await ctx.prisma.site.update({
        where: { id },
        data,
      });

      return site;
    }),

  /**
   * Supprime un site
   */
  delete: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le site appartient à une entreprise du tenant
      const existing = await ctx.prisma.site.findFirst({
        where: { id: input.id },
        include: {
          company: true,
        },
      });

      if (!existing || existing.company.tenantId !== ctx.tenantId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Site non trouvé',
        });
      }

      // Vérifier les permissions : seuls owner, admin peuvent supprimer des sites
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner || false;

      if (!isOwner && !userRoles.includes('admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls le propriétaire et les administrateurs peuvent supprimer des sites',
        });
      }

      await ctx.prisma.site.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

