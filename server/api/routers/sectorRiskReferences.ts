import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const sectorRiskReferencesRouter = createTRPCRouter({
  /**
   * Récupère tous les référentiels sectoriels actifs
   */
  getAll: authenticatedProcedure
    .input(
      z
        .object({
          active: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        isActive: input?.active !== undefined ? input.active : true,
      };

      const references = await ctx.prisma.sectorRiskReference.findMany({
        where,
        orderBy: [
          { sectorCode: 'asc' },
          { version: 'desc' },
        ],
        include: {
          _count: {
            select: { risks: true },
          },
        },
      });

      return references.map((ref) => ({
        id: ref.id,
        sectorCode: ref.sectorCode,
        version: ref.version,
        sourceFile: ref.sourceFile,
        sectorData: ref.sectorData,
        riskCount: ref._count.risks,
        importedAt: ref.importedAt,
        isActive: ref.isActive,
      }));
    }),

  /**
   * Récupère un référentiel par code de secteur
   */
  getBySector: authenticatedProcedure
    .input(
      z.object({
        sectorCode: z.string(),
        version: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const reference = await ctx.prisma.sectorRiskReference.findFirst({
        where: {
          sectorCode: input.sectorCode,
          version: input.version || '1.0.0',
          isActive: true,
        },
        include: {
          _count: {
            select: { risks: true },
          },
        },
      });

      if (!reference) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Référentiel non trouvé pour le secteur ${input.sectorCode}`,
        });
      }

      return {
        id: reference.id,
        sectorCode: reference.sectorCode,
        version: reference.version,
        sourceFile: reference.sourceFile,
        sectorData: reference.sectorData,
        riskCount: reference._count.risks,
        importedAt: reference.importedAt,
      };
    }),

  /**
   * Récupère les risques d'un référentiel sectoriel
   */
  getRisks: authenticatedProcedure
    .input(
      z.object({
        sectorCode: z.string(),
        category: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Trouver le référentiel actif pour ce secteur
      const reference = await ctx.prisma.sectorRiskReference.findFirst({
        where: {
          sectorCode: input.sectorCode,
          isActive: true,
        },
        orderBy: { version: 'desc' },
      });

      if (!reference) {
        return [];
      }

      const where: any = {
        referenceId: reference.id,
      };

      if (input.category) {
        where.categoriePrincipale = input.category;
      }

      if (input.search) {
        where.OR = [
          { intitule: { contains: input.search, mode: 'insensitive' } },
          { sousCategorie: { contains: input.search, mode: 'insensitive' } },
          { dangers: { has: input.search } },
        ];
      }

      const risks = await ctx.prisma.sectorRiskItem.findMany({
        where,
        orderBy: [
          { criticiteScore: 'desc' },
          { intitule: 'asc' },
        ],
        take: input.limit || 100,
      });

      return risks.map((risk) => ({
        id: risk.id,
        riskId: risk.riskId,
        intitule: risk.intitule,
        categoriePrincipale: risk.categoriePrincipale,
        sousCategorie: risk.sousCategorie,
        situationsTravail: risk.situationsTravail,
        dangers: risk.dangers,
        dommagesPotentiels: risk.dommagesPotentiels,
        preventionCollective: risk.preventionCollective,
        preventionOrga: risk.preventionOrga,
        preventionIndividuelle: risk.preventionIndividuelle,
        referencesReglementaires: risk.referencesReglementaires,
        criticiteFrequence: risk.criticiteFrequence,
        criticiteGravite: risk.criticiteGravite,
        criticiteScore: risk.criticiteScore,
        criticiteNiveau: risk.criticiteNiveau,
        // fullData disponible mais non exposé par défaut (trop volumineux)
      }));
    }),

  /**
   * Récupère un risque spécifique par son ID
   */
  getRiskById: authenticatedProcedure
    .input(
      z.object({
        riskId: z.string(),
        sectorCode: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const reference = await ctx.prisma.sectorRiskReference.findFirst({
        where: {
          sectorCode: input.sectorCode,
          isActive: true,
        },
        orderBy: { version: 'desc' },
      });

      if (!reference) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Référentiel non trouvé pour le secteur ${input.sectorCode}`,
        });
      }

      const risk = await ctx.prisma.sectorRiskItem.findFirst({
        where: {
          referenceId: reference.id,
          riskId: input.riskId,
        },
      });

      if (!risk) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Risque ${input.riskId} non trouvé dans le référentiel`,
        });
      }

      return {
        id: risk.id,
        riskId: risk.riskId,
        intitule: risk.intitule,
        categoriePrincipale: risk.categoriePrincipale,
        sousCategorie: risk.sousCategorie,
        situationsTravail: risk.situationsTravail,
        dangers: risk.dangers,
        dommagesPotentiels: risk.dommagesPotentiels,
        preventionCollective: risk.preventionCollective,
        preventionOrga: risk.preventionOrga,
        preventionIndividuelle: risk.preventionIndividuelle,
        referencesReglementaires: risk.referencesReglementaires,
        criticiteFrequence: risk.criticiteFrequence,
        criticiteGravite: risk.criticiteGravite,
        criticiteScore: risk.criticiteScore,
        criticiteNiveau: risk.criticiteNiveau,
        fullData: risk.fullData, // Données complètes pour l'IA
      };
    }),

  /**
   * Récupère les catégories de risques disponibles pour un secteur
   */
  getCategories: authenticatedProcedure
    .input(
      z.object({
        sectorCode: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const reference = await ctx.prisma.sectorRiskReference.findFirst({
        where: {
          sectorCode: input.sectorCode,
          isActive: true,
        },
        orderBy: { version: 'desc' },
      });

      if (!reference) {
        return [];
      }

      const categories = await ctx.prisma.sectorRiskItem.findMany({
        where: {
          referenceId: reference.id,
        },
        select: {
          categoriePrincipale: true,
          sousCategorie: true,
        },
        distinct: ['categoriePrincipale'],
      });

      return categories.map((c) => c.categoriePrincipale).filter(Boolean);
    }),

  /**
   * Suggère des risques pour une unité de travail basée sur le secteur
   */
  suggestRisksForWorkUnit: authenticatedProcedure
    .input(
      z.object({
        workUnitId: z.string().cuid(),
        sectorCode: z.string().optional(),
        limit: z.number().int().min(1).max(50).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Récupérer l'unité de travail
      const workUnit = await ctx.prisma.workUnit.findFirst({
        where: {
          id: input.workUnitId,
          site: {
            company: {
              tenantId: ctx.tenantId,
            },
          },
        },
        include: {
          site: {
            include: {
              company: true,
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

      // Déterminer le secteur (depuis l'unité de travail, la société, ou le paramètre)
      const sectorCode =
        input.sectorCode ||
        workUnit.suggestedSectorId
          ? (await ctx.prisma.activitySector.findUnique({
              where: { id: workUnit.suggestedSectorId! },
            }))?.code
          : null ||
            workUnit.site.company.sector
              ?.toUpperCase()
              .substring(0, 4) || null;

      if (!sectorCode) {
        return [];
      }

      // Récupérer les risques du référentiel
      const risks = await ctx.prisma.sectorRiskItem.findMany({
        where: {
          reference: {
            sectorCode,
            isActive: true,
          },
        },
        orderBy: [
          { criticiteScore: 'desc' },
          { intitule: 'asc' },
        ],
        take: input.limit || 20,
      });

      return risks.map((risk) => ({
        id: risk.id,
        riskId: risk.riskId,
        intitule: risk.intitule,
        categoriePrincipale: risk.categoriePrincipale,
        sousCategorie: risk.sousCategorie,
        situationsTravail: risk.situationsTravail,
        dangers: risk.dangers,
        dommagesPotentiels: risk.dommagesPotentiels,
        preventionCollective: risk.preventionCollective,
        preventionOrga: risk.preventionOrga,
        preventionIndividuelle: risk.preventionIndividuelle,
        referencesReglementaires: risk.referencesReglementaires,
        criticiteScore: risk.criticiteScore,
        criticiteNiveau: risk.criticiteNiveau,
      }));
    }),
});

