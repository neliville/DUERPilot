import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const duerpilotReferenceRouter = createTRPCRouter({
  /**
   * Récupère le référentiel central actif
   */
  getActive: authenticatedProcedure.query(async ({ ctx }) => {
    const reference = await ctx.prisma.duerpilotReference.findFirst({
      where: {
        isActive: true,
        tenantId: null, // Référentiel global
      },
      orderBy: { version: 'desc' },
    });

    if (!reference) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Aucun référentiel actif trouvé',
      });
    }

    return {
      id: reference.id,
      version: reference.version,
      dateCreation: reference.dateCreation,
      description: reference.description,
    };
  }),

  /**
   * Récupère les risques pour un secteur avec hiérarchisation intelligente
   * La prévalence est utilisée pour ordonner, mais aucun risque n'est imposé
   */
  getRisksBySector: authenticatedProcedure
    .input(
      z.object({
        sectorCode: z.string(),
        category: z.string().optional(),
        subCategory: z.string().optional(),
        search: z.string().optional(),
        includeTransversal: z.boolean().optional().default(true),
        sortBy: z.enum(['prevalence', 'criticity', 'alphabetical']).optional().default('prevalence'),
        limit: z.number().int().min(1).max(200).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Trouver le référentiel actif
      const reference = await ctx.prisma.duerpilotReference.findFirst({
        where: {
          isActive: true,
          tenantId: null,
        },
        orderBy: { version: 'desc' },
      });

      if (!reference) {
        return [];
      }

      const where: any = {
        referenceId: reference.id,
        secteurCode: input.sectorCode,
      };

      if (input.category) {
        where.categoriePrincipale = input.category;
      }

      if (input.subCategory) {
        where.sousCategorie = input.subCategory;
      }

      if (input.search) {
        where.OR = [
          { intitule: { contains: input.search, mode: 'insensitive' } },
          { sousCategorie: { contains: input.search, mode: 'insensitive' } },
          { dangers: { has: input.search } },
        ];
      }

      if (!input.includeTransversal) {
        where.isTransversal = false;
      }

      // Déterminer l'ordre de tri
      let orderBy: any[] = [];
      switch (input.sortBy) {
        case 'criticity':
          orderBy = [{ criticiteScore: 'desc' }, { intitule: 'asc' }];
          break;
        case 'alphabetical':
          orderBy = [{ intitule: 'asc' }];
          break;
        case 'prevalence':
        default:
          orderBy = [{ isTransversal: 'desc' }, { criticiteScore: 'desc' }, { intitule: 'asc' }];
          break;
      }

      // Récupérer les risques
      const risks = await ctx.prisma.duerpilotRisk.findMany({
        where,
        orderBy,
        take: input.limit || 100,
      });

      // Récupérer les prévalences pour chaque risque
      const risksWithPrevalence = await Promise.all(
        risks.map(async (risk) => {
          const prevalence = await ctx.prisma.riskPrevalence.findFirst({
            where: {
              referenceId: reference.id,
              riskId: risk.riskId,
              secteurCode: input.sectorCode,
            },
          });

          // Construire un message pédagogique basé sur la prévalence
          let pedagogicalMessage: string | null = null;
          if (prevalence?.prevalenceLevel === 'tres_frequent' || prevalence?.prevalenceLevel === 'frequent') {
            pedagogicalMessage = `Fréquemment observé dans ce secteur d'activité. À adapter selon votre situation réelle.`;
          } else if (risk.isTransversal) {
            pedagogicalMessage = `Risque identifié dans plusieurs secteurs similaires. À valider selon votre contexte.`;
          } else {
            pedagogicalMessage = `Risque référencé pour ce secteur. À adapter selon votre réalité terrain.`;
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
            criticiteScore: risk.criticiteScore,
            criticiteNiveau: risk.criticiteNiveau,
            isTransversal: risk.isTransversal,
            prevalenceLevel: prevalence?.prevalenceLevel,
            prevalenceNote: prevalence?.note || pedagogicalMessage,
          };
        })
      );

      // Si tri par prévalence, réordonner après avoir récupéré les prévalences
      if (input.sortBy === 'prevalence') {
        risksWithPrevalence.sort((a, b) => {
          const aScore = a.prevalenceLevel === 'tres_frequent' ? 4 : a.prevalenceLevel === 'frequent' ? 3 : a.prevalenceLevel === 'occasionnel' ? 2 : 1;
          const bScore = b.prevalenceLevel === 'tres_frequent' ? 4 : b.prevalenceLevel === 'frequent' ? 3 : b.prevalenceLevel === 'occasionnel' ? 2 : 1;
          if (aScore !== bScore) return bScore - aScore;
          if (a.isTransversal && !b.isTransversal) return -1;
          if (!a.isTransversal && b.isTransversal) return 1;
          return (b.criticiteScore || 0) - (a.criticiteScore || 0);
        });
      }

      return risksWithPrevalence;
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
      const reference = await ctx.prisma.duerpilotReference.findFirst({
        where: {
          isActive: true,
          tenantId: null,
        },
        orderBy: { version: 'desc' },
      });

      if (!reference) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Référentiel actif non trouvé',
        });
      }

      const risk = await ctx.prisma.duerpilotRisk.findFirst({
        where: {
          referenceId: reference.id,
          riskId: input.riskId,
          secteurCode: input.sectorCode,
        },
      });

      if (!risk) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Risque ${input.riskId} non trouvé pour le secteur ${input.sectorCode}`,
        });
      }

      const prevalence = await ctx.prisma.riskPrevalence.findFirst({
        where: {
          referenceId: reference.id,
          riskId: input.riskId,
          secteurCode: input.sectorCode,
        },
      });

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
        isTransversal: risk.isTransversal,
        prevalenceLevel: prevalence?.prevalenceLevel,
        prevalenceNote: prevalence?.note,
        trend: risk.trend,
        fullData: risk.fullData,
      };
    }),

  /**
   * Récupère la taxonomie (familles → sous-catégories)
   */
  getTaxonomy: authenticatedProcedure.query(async ({ ctx }) => {
    const reference = await ctx.prisma.duerpilotReference.findFirst({
      where: {
        isActive: true,
        tenantId: null,
      },
      orderBy: { version: 'desc' },
    });

    if (!reference) {
      return [];
    }

    const families = await ctx.prisma.taxonomyFamily.findMany({
      where: { referenceId: reference.id },
      include: {
        sousCategories: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return families.map((family) => ({
      id: family.id,
      code: family.code,
      nom: family.nom,
      description: family.description,
      order: family.order,
      sousCategories: family.sousCategories.map((sub) => ({
        id: sub.id,
        code: sub.code,
        nom: sub.nom,
        description: sub.description,
        order: sub.order,
      })),
    }));
  }),

  /**
   * Récupère les catégories (familles) disponibles pour un secteur
   */
  getCategoriesBySector: authenticatedProcedure
    .input(
      z.object({
        sectorCode: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const reference = await ctx.prisma.duerpilotReference.findFirst({
        where: {
          isActive: true,
          tenantId: null,
        },
        orderBy: { version: 'desc' },
      });

      if (!reference) {
        return [];
      }

      const risks = await ctx.prisma.duerpilotRisk.findMany({
        where: {
          referenceId: reference.id,
          secteurCode: input.sectorCode,
        },
        select: {
          categoriePrincipale: true,
          sousCategorie: true,
        },
        distinct: ['categoriePrincipale'],
      });

      const categories = risks.map((r) => r.categoriePrincipale).filter(Boolean);

      return categories;
    }),

  /**
   * Récupère les risques transverses (présents dans plusieurs secteurs)
   */
  getTransversalRisks: authenticatedProcedure
    .input(
      z.object({
        sectorCode: z.string().optional(), // Filtrer par secteur applicable
        limit: z.number().int().min(1).max(100).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const reference = await ctx.prisma.duerpilotReference.findFirst({
        where: {
          isActive: true,
          tenantId: null,
        },
        orderBy: { version: 'desc' },
      });

      if (!reference) {
        return [];
      }

      const where: any = {
        referenceId: reference.id,
      };

      if (input.sectorCode) {
        where.secteursApplicables = { has: input.sectorCode };
      }

      const transversalRisks = await ctx.prisma.transversalRisk.findMany({
        where,
        orderBy: [
          { prevalenceGlobal: 'desc' },
          { intitule: 'asc' },
        ],
        take: input.limit || 50,
      });

      return transversalRisks.map((risk) => ({
        id: risk.id,
        riskId: risk.riskId,
        intitule: risk.intitule,
        categoriePrincipale: risk.categoriePrincipale,
        secteursApplicables: risk.secteursApplicables,
        prevalenceGlobal: risk.prevalenceGlobal,
        description: risk.description,
      }));
    }),

  /**
   * Suggère des risques pour une unité de travail basée sur le secteur et la prévalence
   * Utilise la matrice de prévalence pour hiérarchiser, mais ne décide jamais
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
          suggestedSector: true,
        },
      });

      if (!workUnit) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Unité de travail non trouvée',
        });
      }

      // Déterminer le secteur
      const sectorCode =
        input.sectorCode ||
        workUnit.suggestedSector?.code ||
        (workUnit.site.company.sector?.toUpperCase().substring(0, 4) || null);

      // Récupérer le référentiel actif
      const reference = await ctx.prisma.duerpilotReference.findFirst({
        where: {
          isActive: true,
          tenantId: null,
        },
        orderBy: { version: 'desc' },
      });

      if (!reference) {
        return [];
      }

      // Si aucun secteur n'est spécifié, proposer uniquement les risques génériques
      if (!sectorCode) {
        const genericRisks = await ctx.prisma.duerpilotRisk.findMany({
          where: {
            referenceId: reference.id,
            secteurCode: 'GENERIQUE',
          },
          orderBy: [
            { criticiteScore: 'desc' },
            { intitule: 'asc' },
          ],
          take: input.limit || 20,
        });

        // Récupérer les prévalences et construire la réponse
        const risksWithPrevalence = await Promise.all(
          genericRisks.map(async (risk) => {
            const prevalence = await ctx.prisma.riskPrevalence.findFirst({
              where: {
                referenceId: reference.id,
                riskId: risk.riskId,
                secteurCode: 'GENERIQUE',
              },
            });

            return {
              id: risk.id,
              riskId: risk.riskId,
              intitule: risk.intitule,
              categoriePrincipale: risk.categoriePrincipale,
              sousCategorie: risk.sousCategorie,
              criticiteScore: risk.criticiteScore,
              isTransversal: risk.isTransversal,
              prevalenceLevel: prevalence?.prevalenceLevel,
              prevalenceNote: prevalence?.note || 'Risque générique applicable à tous les secteurs',
              pedagogicalMessage: 'Ce risque est présent dans la majorité des entreprises, quel que soit le secteur d\'activité. Il constitue une base minimale d\'évaluation des risques.',
            };
          }),
        );

        return risksWithPrevalence;
      }

      // Récupérer les risques du secteur spécifié
      const sectorRisks = await ctx.prisma.duerpilotRisk.findMany({
        where: {
          referenceId: reference.id,
          secteurCode,
        },
        orderBy: [
          { isTransversal: 'desc' }, // Risques transverses en premier
          { criticiteScore: 'desc' },
          { intitule: 'asc' },
        ],
        take: input.limit ? Math.floor(input.limit * 0.7) : 14, // 70% du quota pour les risques sectoriels
      });

      // Récupérer aussi les risques génériques (30% du quota ou 6 risques minimum)
      const genericRisks = await ctx.prisma.duerpilotRisk.findMany({
        where: {
          referenceId: reference.id,
          secteurCode: 'GENERIQUE',
        },
        orderBy: [
          { criticiteScore: 'desc' },
          { intitule: 'asc' },
        ],
        take: input.limit ? Math.max(6, Math.floor(input.limit * 0.3)) : 6,
      });

      // Combiner les risques (sectoriels en premier, puis génériques)
      const allRisks = [...sectorRisks, ...genericRisks];

      // Récupérer les prévalences et construire la réponse avec messages pédagogiques
      const risksWithPrevalence = await Promise.all(
        allRisks.map(async (risk) => {
          // Pour les risques génériques, chercher la prévalence dans GENERIQUE
          // Pour les risques sectoriels, chercher dans le secteur spécifié
          const prevalenceSectorCode = risk.secteurCode === 'GENERIQUE' ? 'GENERIQUE' : sectorCode;
          const prevalence = await ctx.prisma.riskPrevalence.findFirst({
            where: {
              referenceId: reference.id,
              riskId: risk.riskId,
              secteurCode: prevalenceSectorCode,
            },
          });

          // Construire un message pédagogique basé sur la prévalence et le type de risque
          let pedagogicalMessage: string | null = null;
          if (risk.secteurCode === 'GENERIQUE') {
            pedagogicalMessage = `Risque générique applicable à tous les secteurs d'activité. Il constitue une base minimale d'évaluation des risques. À adapter selon votre situation réelle.`;
          } else if (prevalence?.prevalenceLevel === 'tres_frequent' || prevalence?.prevalenceLevel === 'frequent') {
            pedagogicalMessage = `Fréquemment observé dans ce secteur d'activité. À adapter selon votre situation réelle.`;
          } else if (risk.isTransversal) {
            pedagogicalMessage = `Risque identifié dans plusieurs secteurs similaires. À valider selon votre contexte.`;
          } else {
            pedagogicalMessage = `Risque référencé pour ce secteur. À adapter selon votre réalité terrain.`;
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
            criticiteScore: risk.criticiteScore,
            criticiteNiveau: risk.criticiteNiveau,
            isTransversal: risk.isTransversal,
            prevalenceLevel: prevalence?.prevalenceLevel,
            prevalenceNote: prevalence?.note,
            pedagogicalMessage,
          };
        })
      );

      return risksWithPrevalence;
    }),
});

