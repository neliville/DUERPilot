import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { PLAN_FEATURES, getUpgradePlan, type Plan } from '@/lib/plans';

const createCompanySchema = z.object({
  legalName: z.string().min(1, 'La raison sociale est requise'),
  siret: z.string().optional(),
  activity: z.string().optional(),
  sector: z.string().optional(),
  employeeCount: z.number().int().positive().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('France'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  hasCSE: z.boolean().default(false),
});

const updateCompanySchema = createCompanySchema.partial().extend({
  id: z.string().cuid(),
});

export const companiesRouter = createTRPCRouter({
  /**
   * Récupère toutes les entreprises du tenant
   */
  getAll: authenticatedProcedure.query(async ({ ctx }) => {
    // Si le tenantId est null (super admin sans tenant), retourner un tableau vide
    if (!ctx.tenantId) {
      return [];
    }

    const companies = await ctx.prisma.company.findMany({
      where: {
        tenantId: ctx.tenantId,
      },
        include: {
          sites: {
            select: {
              id: true,
              name: true,
              isMainSite: true,
            },
          },
          _count: {
            select: {
              sites: true,
              duerpVersions: true,
              papripact: true,
              participationTravailleurs: true,
            },
          },
        },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return companies;
  }),

  /**
   * Récupère une entreprise par son ID
   */
  getById: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      // Si le tenantId est null (super admin sans tenant), ne pas chercher
      if (!ctx.tenantId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Entreprise introuvable',
        });
      }

      const company = await ctx.prisma.company.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
        include: {
          sites: {
            orderBy: {
              isMainSite: 'desc',
            },
          },
          papripact: {
            orderBy: {
              year: 'desc',
            },
            take: 5, // Limiter à 5 pour éviter de surcharger
          },
          participationTravailleurs: {
            orderBy: {
              date: 'desc',
            },
            take: 5, // Limiter à 5 pour éviter de surcharger
          },
          _count: {
            select: {
              sites: true,
              duerpVersions: true,
              papripact: true,
              participationTravailleurs: true,
            },
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
   * Crée une nouvelle entreprise
   */
  create: authenticatedProcedure
    .input(createCompanySchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier les permissions : seuls owner, admin peuvent créer des entreprises
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner || false;

      if (!isOwner && !userRoles.includes('admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls le propriétaire et les administrateurs peuvent créer des entreprises',
        });
      }

      // Vérifier la limite d'entreprises
      const userPlan = (ctx.userProfile?.plan || 'free') as Plan;
      const planFeatures = PLAN_FEATURES[userPlan];
      
      if (planFeatures.maxCompanies !== Infinity) {
        const companiesCount = await ctx.prisma.company.count({
          where: { tenantId: ctx.tenantId },
        });
        
        if (companiesCount >= planFeatures.maxCompanies) {
          const { PLAN_ERROR_MESSAGES, getUpgradePlan } = await import('@/lib/plans');
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.limit_exceeded(
              'companies',
              companiesCount,
              planFeatures.maxCompanies,
              userPlan,
              upgradePlan
            ),
          });
        }
      }

      // Vérifier l'unicité du SIRET si fourni
      if (input.siret) {
        const existing = await ctx.prisma.company.findFirst({
          where: {
            siret: input.siret,
            tenantId: ctx.tenantId,
          },
        });

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Une entreprise avec ce SIRET existe déjà',
          });
        }
      }

      const company = await ctx.prisma.company.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
        include: {
          sites: true,
        },
      });

      return company;
    }),

  /**
   * Met à jour une entreprise
   */
  update: authenticatedProcedure
    .input(updateCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Vérifier que l'entreprise appartient au tenant
      const existing = await ctx.prisma.company.findFirst({
        where: {
          id,
          tenantId: ctx.tenantId,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Entreprise non trouvée',
        });
      }

      // Vérifier les permissions : seuls owner, admin peuvent modifier des entreprises
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner || false;

      if (!isOwner && !userRoles.includes('admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls le propriétaire et les administrateurs peuvent modifier des entreprises',
        });
      }

      // Vérifier l'unicité du SIRET si modifié
      if (data.siret && data.siret !== existing.siret) {
        const duplicate = await ctx.prisma.company.findFirst({
          where: {
            siret: data.siret,
            tenantId: ctx.tenantId,
            id: { not: id },
          },
        });

        if (duplicate) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Une entreprise avec ce SIRET existe déjà',
          });
        }
      }

      const company = await ctx.prisma.company.update({
        where: { id },
        data,
        include: {
          sites: true,
        },
      });

      return company;
    }),

  /**
   * Supprime une entreprise
   */
  delete: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'entreprise appartient au tenant
      const existing = await ctx.prisma.company.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
        include: {
          _count: {
            select: {
              sites: true,
              duerpVersions: true,
            },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Entreprise non trouvée',
        });
      }

      // Vérifier les permissions : seuls owner, admin peuvent supprimer des entreprises
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner || false;

      if (!isOwner && !userRoles.includes('admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls le propriétaire et les administrateurs peuvent supprimer des entreprises',
        });
      }

      // Vérifier qu'il n'y a pas de sites associés
      if (existing._count.sites > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Impossible de supprimer une entreprise avec des sites associés',
        });
      }

      await ctx.prisma.company.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Crée une entreprise avec son site principal (pour l'onboarding)
   */
  createWithMainSite: authenticatedProcedure
    .input(
      createCompanySchema.extend({
        siteName: z.string().min(1, 'Le nom du site est requis'),
        siteAddress: z.string().optional(),
        siteCity: z.string().optional(),
        sitePostalCode: z.string().optional(),
        siteEmployeeCount: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { siteName, siteAddress, siteCity, sitePostalCode, siteEmployeeCount, ...companyData } = input;

      // Vérifier les permissions : seuls owner, admin peuvent créer des entreprises
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner || false;

      if (!isOwner && !userRoles.includes('admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls le propriétaire et les administrateurs peuvent créer des entreprises',
        });
      }

      // Vérifier l'unicité du SIRET si fourni
      if (companyData.siret) {
        const existing = await ctx.prisma.company.findFirst({
          where: {
            siret: companyData.siret,
            tenantId: ctx.tenantId,
          },
        });

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Une entreprise avec ce SIRET existe déjà',
          });
        }
      }

      // Créer l'entreprise et le site principal en transaction
      const result = await ctx.prisma.$transaction(async (tx) => {
        // Créer l'entreprise
        const company = await tx.company.create({
          data: {
            ...companyData,
            tenantId: ctx.tenantId,
          },
        });

        // Créer le site principal
        const site = await tx.site.create({
          data: {
            companyId: company.id,
            name: siteName,
            address: siteAddress,
            city: siteCity,
            postalCode: sitePostalCode,
            employeeCount: siteEmployeeCount,
            isMainSite: true,
            country: 'France',
          },
        });

        return { company, site };
      });

      return result;
    }),
});

