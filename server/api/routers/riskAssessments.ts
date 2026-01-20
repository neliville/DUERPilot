import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { calculateRiskScore, getPriorityLevel } from '@/lib/utils';
import { hasMethodAccess, PLAN_FEATURES, PLAN_ERROR_MESSAGES, getUpgradePlan, type Plan } from '@/lib/plans';
import { suggestHazardsForWorkUnit, generateActionsForRisk } from '@/server/services/ai/openai-service';

const createRiskAssessmentSchema = z.object({
  workUnitId: z.string().cuid(),
  situationId: z.string().cuid(), // Nouveau champ (remplace hazardRefId)
  contextDescription: z.string().min(1, 'La description contextuelle est requise'),
  exposedPersons: z.string().optional(),
  frequency: z.number().int().min(1).max(4),
  probability: z.number().int().min(1).max(4),
  severity: z.number().int().min(1).max(4),
  control: z.number().int().min(1).max(4),
  existingMeasures: z.string().optional(),
  source: z.enum(['manual', 'ai_assisted', 'imported']).default('manual'),
  evaluationMethod: z.enum(['duerp_generique', 'inrs']).optional().default('inrs'),
});

const updateRiskAssessmentSchema = createRiskAssessmentSchema.partial().extend({
  id: z.string().cuid(),
});

export const riskAssessmentsRouter = createTRPCRouter({
  /**
   * Récupère toutes les évaluations de risques du tenant
   */
  getAll: authenticatedProcedure
    .input(
      z
        .object({
          workUnitId: z.string().cuid().optional(),
          situationId: z.string().cuid().optional(),
          priorityLevel: z.enum(['faible', 'à_améliorer', 'prioritaire']).optional(),
          categoryCode: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.userProfile;
      const userRoles = user.roles || [];
      const isOwner = user.isOwner || false;
      
      // Filtrage par scope si nécessaire (site_manager, observer)
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

      // Filtrage par scope pour site_manager et observer
      if (hasScope && !isOwner && !userRoles.includes('admin') && !userRoles.includes('qse')) {
        where.workUnit = {
          ...where.workUnit,
          siteId: scopeSites.length > 0 ? { in: scopeSites } : undefined,
        };
      }

      if (input?.workUnitId) {
        where.workUnitId = input.workUnitId;
      }

      if (input?.situationId) {
        where.situationId = input.situationId;
      }

      if (input?.priorityLevel) {
        where.priorityLevel = input.priorityLevel;
      }

      if (input?.categoryCode) {
        // Filtrer par code de catégorie via la relation dangerousSituation
        const category = await ctx.prisma.dangerCategory.findUnique({
          where: { code: input.categoryCode },
        });
        if (category) {
          where.dangerousSituation = {
            categoryId: category.id,
          };
        }
      }

      const assessments = await ctx.prisma.riskAssessment.findMany({
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
          dangerousSituation: {
            include: {
              category: true,
            },
          },
          preventionMeasures: {
            select: {
              id: true,
              type: true,
              description: true,
              existing: true,
            },
          },
          _count: {
            select: {
              actionPlans: true,
              preventionMeasures: true,
            },
          },
        },
        orderBy: [
          { riskScore: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      return assessments;
    }),

  /**
   * Récupère une évaluation par son ID
   */
  getById: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const assessment = await ctx.prisma.riskAssessment.findFirst({
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
          dangerousSituation: {
            include: {
              category: true,
            },
          },
          preventionMeasures: {
            include: {
              actionPlans: true,
            },
          },
          actionPlans: {
            orderBy: {
              priority: 'desc',
            },
          },
        },
      });

      if (!assessment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Évaluation de risque non trouvée',
        });
      }

      return assessment;
    }),

  /**
   * Crée une nouvelle évaluation de risque
   */
  create: authenticatedProcedure
    .input(createRiskAssessmentSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier les permissions : seuls owner, admin, qse, site_manager peuvent créer
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner || false;
      const scopeSites = ctx.userProfile.scopeSites || [];

      // representative, observer, auditor ne peuvent pas créer
      if (!isOwner && !userRoles.includes('admin') && !userRoles.includes('qse') && !userRoles.includes('site_manager')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Vous n\'êtes pas autorisé à créer des évaluations de risque',
        });
      }

      const userPlan = (ctx.userProfile?.plan || 'free') as Plan;
      const requestedMethod = input.evaluationMethod || 'inrs';
      
      // Vérifier que le plan permet la méthode demandée
      if (!hasMethodAccess(userPlan, requestedMethod)) {
        const { PLAN_ERROR_MESSAGES, getRequiredPlan } = await import('@/lib/plans');
        const requiredPlan = getRequiredPlan(requestedMethod);
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: PLAN_ERROR_MESSAGES.method_not_available(requestedMethod, userPlan, requiredPlan),
        });
      }

      // Vérifier les limites du plan
      const planFeatures = PLAN_FEATURES[userPlan];
      
      // Vérifier limite unités de travail
      if (planFeatures.maxWorkUnits !== Infinity) {
        const workUnitsCount = await ctx.prisma.workUnit.count({
          where: {
            site: {
              company: { tenantId: ctx.tenantId },
            },
          },
        });
        if (workUnitsCount >= planFeatures.maxWorkUnits) {
          const { PLAN_ERROR_MESSAGES, getUpgradePlan } = await import('@/lib/plans');
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.limit_exceeded(
              'workUnits',
              workUnitsCount,
              planFeatures.maxWorkUnits,
              userPlan,
              upgradePlan
            ),
          });
        }
      }

      // Vérifier limite risques/mois
      if (planFeatures.maxRisksPerMonth !== Infinity) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const risksCount = await ctx.prisma.riskAssessment.count({
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
        if (risksCount >= planFeatures.maxRisksPerMonth) {
          const { PLAN_ERROR_MESSAGES, getUpgradePlan } = await import('@/lib/plans');
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.limit_exceeded(
              'risks',
              risksCount,
              planFeatures.maxRisksPerMonth,
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
          include: {
            site: {
              select: { id: true },
            },
          },
        });

        if (workUnitWithSite && !scopeSites.includes(workUnitWithSite.site.id)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Vous ne pouvez créer des évaluations de risque que dans votre périmètre',
          });
        }
      }

      // Vérifier que la situation dangereuse existe
      const situation = await ctx.prisma.dangerousSituation.findFirst({
        where: {
          id: input.situationId,
          OR: [
            { tenantId: null }, // Situation globale
            { tenantId: ctx.tenantId }, // Situation du tenant
          ],
        },
        include: {
          category: true,
        },
      });

      if (!situation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Situation dangereuse non trouvée',
        });
      }

      // Calculer le score et le niveau de priorité (F x P x G)
      const riskScore = calculateRiskScore(
        input.frequency,
        input.probability,
        input.severity,
        input.control
      );
      const priorityLevel = getPriorityLevel(riskScore);

      const assessment = await ctx.prisma.riskAssessment.create({
        data: {
          workUnitId: input.workUnitId,
          situationId: input.situationId,
          contextDescription: input.contextDescription,
          exposedPersons: input.exposedPersons,
          frequency: input.frequency,
          probability: input.probability,
          severity: input.severity,
          control: input.control,
          existingMeasures: input.existingMeasures,
          source: input.source,
          riskScore,
          priorityLevel,
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
          dangerousSituation: {
            include: {
              category: true,
            },
          },
          preventionMeasures: true,
        },
      });

      return assessment;
    }),

  /**
   * Met à jour une évaluation de risque
   */
  update: authenticatedProcedure
    .input(updateRiskAssessmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Vérifier que l'évaluation appartient au tenant
      const existing = await ctx.prisma.riskAssessment.findFirst({
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
          message: 'Évaluation de risque non trouvée',
        });
      }

      // Vérifier les permissions
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner || false;
      const scopeSites = ctx.userProfile.scopeSites || [];

      // representative, observer, auditor ne peuvent pas modifier
      if (!isOwner && !userRoles.includes('admin') && !userRoles.includes('qse') && !userRoles.includes('site_manager')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Vous n\'êtes pas autorisé à modifier des évaluations de risque',
        });
      }

      // site_manager peut modifier seulement dans son périmètre
      if (userRoles.includes('site_manager') && !isOwner && !userRoles.includes('admin') && !userRoles.includes('qse')) {
        // Récupérer le site de l'unité de travail
        const workUnit = await ctx.prisma.workUnit.findUnique({
          where: { id: existing.workUnitId },
          include: {
            site: {
              select: { id: true },
            },
          },
        });

        if (workUnit && !scopeSites.includes(workUnit.site.id)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Vous ne pouvez modifier que les évaluations de risque de votre périmètre',
          });
        }
      }

      // Recalculer le score si les cotations changent
      let riskScore = existing.riskScore;
      let priorityLevel = existing.priorityLevel;

      if (
        data.frequency !== undefined ||
        data.probability !== undefined ||
        data.severity !== undefined ||
        data.control !== undefined
      ) {
        const frequency = data.frequency ?? existing.frequency;
        const probability = data.probability ?? existing.probability;
        const severity = data.severity ?? existing.severity;
        const control = data.control ?? existing.control;

        riskScore = calculateRiskScore(frequency, probability, severity, control);
        priorityLevel = getPriorityLevel(riskScore);
      }

      const assessment = await ctx.prisma.riskAssessment.update({
        where: { id },
        data: {
          ...data,
          riskScore,
          priorityLevel,
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
          dangerousSituation: {
            include: {
              category: true,
            },
          },
          preventionMeasures: true,
        },
      });

      return assessment;
    }),

  /**
   * Supprime une évaluation de risque
   */
  delete: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'évaluation appartient au tenant
      const existing = await ctx.prisma.riskAssessment.findFirst({
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
          _count: {
            select: {
              actionPlans: true,
            },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Évaluation de risque non trouvée',
        });
      }

      // Vérifier les permissions : seuls owner, admin, qse peuvent supprimer
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner || false;

      if (!isOwner && !userRoles.includes('admin') && !userRoles.includes('qse')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seuls le propriétaire, les administrateurs et les responsables QSE peuvent supprimer des évaluations de risque',
        });
      }

      // Vérifier qu'il n'y a pas d'actions associées
      if (existing._count.actionPlans > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message:
            'Impossible de supprimer une évaluation avec des actions associées',
        });
      }

      await ctx.prisma.riskAssessment.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Valide une évaluation de risque
   */
  validate: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'évaluation appartient au tenant
      const existing = await ctx.prisma.riskAssessment.findFirst({
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
          message: 'Évaluation de risque non trouvée',
        });
      }

      const assessment = await ctx.prisma.riskAssessment.update({
        where: { id: input.id },
        data: {
          validatedBy: ctx.userProfile?.email || ctx.user?.email || '',
          validatedAt: new Date(),
        },
      });

      return assessment;
    }),

  /**
   * Obtenir des suggestions IA pour l'évaluation des risques
   * Note : L'IA assiste mais ne décide jamais - l'utilisateur valide toujours
   */
  getAISuggestions: authenticatedProcedure
    .input(
      z.object({
        workUnitId: z.string().cuid(),
        situationId: z.string().cuid().optional(),
        contextDescription: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
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
        include: {
          suggestedSector: true,
        },
      });

      if (!workUnit) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Unité de travail non trouvée',
        });
      }

      // TODO: Implémenter l'appel à l'IA pour générer des suggestions
      // Pour l'instant, retourner un tableau vide
      // L'IA doit :
      // - Analyser la situation dangereuse si fournie
      // - Analyser le contexte (description, secteur)
      // - Suggérer des situations dangereuses fréquentes pour ce secteur
      // - Suggérer des cotations possibles (F, P, G) avec raisonnement
      // - Ne JAMAIS certifier la conformité
      // - Ne JAMAIS imposer de niveau de risque

      return {
        suggestedSituations: [] as Array<{
          situationId: string;
          label: string;
          category: string;
          confidence: number;
          reasoning: string;
        }>,
        suggestedCotation: null as {
          frequency: number;
          probability: number;
          severity: number;
          reasoning: string;
        } | null,
        message: 'Suggestions IA non implémentées - À venir',
      };
    }),

  /**
   * Suggère des dangers pour une unité de travail (Assistant DUERP)
   * Utilise un cache pour éviter de reconsommer l'API IA inutilement
   */
  suggestHazards: authenticatedProcedure
    .input(
      z.object({
        workUnitId: z.string().cuid(),
        forceRefresh: z.boolean().optional().default(false), // Forcer un nouveau calcul
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Vérification de sécurité : s'assurer que prisma est disponible
      if (!ctx.prisma) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur de configuration : prisma non disponible',
        });
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

      // Vérifier si on a un cache valide (non expiré) - PRIORITAIRE
      // Le cache ne consomme pas de quota, donc on peut le retourner même si quota dépassé
      if (!input.forceRefresh) {
        try {
          // Vérifier si le modèle existe dans le client Prisma
          if (ctx.prisma && 'hazardSuggestionCache' in ctx.prisma) {
            const cache = await (ctx.prisma as any).hazardSuggestionCache.findUnique({
              where: { workUnitId: input.workUnitId },
            });

            if (cache && cache.expiresAt > new Date()) {
              // Cache valide, retourner les suggestions en cache (sans vérifier le quota)
              return {
                suggestions: cache.suggestions as any[],
                fromCache: true,
                expiresAt: cache.expiresAt,
              };
            }
          } else {
            console.warn('hazardSuggestionCache non disponible dans le client Prisma - le client doit être régénéré');
          }
        } catch (cacheError) {
          // Si le cache n'est pas disponible, continuer sans cache
          console.warn('Erreur lors de l\'accès au cache:', cacheError);
        }
      }

      // Pas de cache valide : vérifier l'accès IA selon le plan AVANT d'appeler l'IA
      const userPlan = (ctx.userProfile?.plan || 'free') as Plan;
      const planFeatures = PLAN_FEATURES[userPlan];
      
      if (planFeatures.maxAISuggestionsRisks === 0) {
        const upgradePlan = getUpgradePlan(userPlan);
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: PLAN_ERROR_MESSAGES.feature_not_available('ia', userPlan, upgradePlan || 'business'),
        });
      }

      // Vérifier le quota mensuel (sauf si illimité)
      if (planFeatures.maxAISuggestionsRisks !== Infinity) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const suggestionsRisksCount = await ctx.prisma.aIUsageLog.count({
          where: {
            tenantId: ctx.tenantId,
            createdAt: { gte: monthStart },
            function: {
              in: ['suggestions_risques', 'risk_suggestions', 'suggest_risks'],
            },
          },
        });

        if (suggestionsRisksCount >= planFeatures.maxAISuggestionsRisks) {
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.quota_exceeded(
              suggestionsRisksCount,
              planFeatures.maxAISuggestionsRisks,
              userPlan,
              upgradePlan,
              'risks'
            ),
          });
        }
      }

      // Pas de cache ou cache expiré ou forceRefresh : générer de nouvelles suggestions
      const dangerousSituations = await ctx.prisma.dangerousSituation.findMany({
        where: {
          OR: [
            { tenantId: null }, // Référentiels globaux
            { tenantId: ctx.tenantId }, // Référentiels personnalisés du tenant
          ],
        },
        select: {
          id: true,
          label: true,
          description: true,
          keywords: true,
        },
      });

      // Appeler l'IA pour générer des suggestions
      const result = await suggestHazardsForWorkUnit({
        workUnitName: workUnit.name,
        workUnitDescription: workUnit.description || undefined,
        dangerousSituations,
        loggingContext: {
          tenantId: ctx.tenantId || '',
          userId: ctx.userProfile.userId,
          companyId: workUnit.siteId,
        },
      });

      // Sauvegarder en cache (expiration : 24h)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      try {
        // Vérifier si le modèle existe dans le client Prisma
        if (ctx.prisma && 'hazardSuggestionCache' in ctx.prisma) {
          await (ctx.prisma as any).hazardSuggestionCache.upsert({
            where: { workUnitId: input.workUnitId },
            create: {
              workUnitId: input.workUnitId,
              suggestions: result.suggestions,
              expiresAt,
            },
            update: {
              suggestions: result.suggestions,
              expiresAt,
              updatedAt: new Date(),
            },
          });
        } else {
          console.warn('hazardSuggestionCache non disponible - impossible de sauvegarder le cache');
        }
      } catch (cacheError) {
        // Si le cache n'est pas disponible, continuer sans sauvegarder
        console.warn('Erreur lors de la sauvegarde du cache:', cacheError);
      }

      return {
        ...result,
        fromCache: false,
        expiresAt,
      };
    }),

  /**
   * Génère des actions de prévention pour un risque évalué
   */
  generateActions: authenticatedProcedure
    .input(z.object({ riskAssessmentId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'évaluation de risque appartient au tenant
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
        include: {
          dangerousSituation: {
            include: {
              category: true,
            },
          },
          workUnit: {
            include: {
              site: {
                include: {
                  company: {
                    select: {
                      id: true,
                      legalName: true,
                      activity: true,
                    },
                  },
                },
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

      // Vérifier l'accès IA selon le plan
      const userPlan = (ctx.userProfile?.plan || 'free') as Plan;
      const planFeatures = PLAN_FEATURES[userPlan];

      if (planFeatures.maxAISuggestionsActions === 0) {
        const upgradePlan = getUpgradePlan(userPlan);
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: PLAN_ERROR_MESSAGES.feature_not_available('suggestions_actions', userPlan, upgradePlan || 'premium'),
        });
      }

      // Vérifier le quota mensuel (sauf si illimité)
      if (planFeatures.maxAISuggestionsActions !== Infinity) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const suggestionsActionsCount = await ctx.prisma.aIUsageLog.count({
          where: {
            tenantId: ctx.tenantId,
            createdAt: { gte: monthStart },
            function: {
              in: ['suggestions_actions', 'action_suggestions'],
            },
          },
        });

        if (suggestionsActionsCount >= planFeatures.maxAISuggestionsActions) {
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.quota_exceeded(
              suggestionsActionsCount,
              planFeatures.maxAISuggestionsActions,
              userPlan,
              upgradePlan,
              'actions'
            ),
          });
        }
      }

      // Générer les actions avec l'IA
      const result = await generateActionsForRisk({
        riskAssessment: {
          id: riskAssessment.id,
          dangerousSituation: {
            label: riskAssessment.dangerousSituation?.label,
          },
          contextDescription: riskAssessment.contextDescription,
          riskScore: riskAssessment.riskScore,
          priorityLevel: riskAssessment.priorityLevel,
          existingMeasures: riskAssessment.existingMeasures || undefined,
          frequency: riskAssessment.frequency,
          probability: riskAssessment.probability,
          severity: riskAssessment.severity,
          control: riskAssessment.control,
        },
        company: riskAssessment.workUnit.site.company,
        loggingContext: {
          tenantId: ctx.tenantId,
          userId: ctx.userProfile.id,
          companyId: riskAssessment.workUnit.site.company.id,
        },
      });

      // Créer les actions dans la base de données
      const createdActions = [];
      for (const action of result.actions) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (action.weeks || 4) * 7);

        const createdAction = await ctx.prisma.actionPlan.create({
          data: {
            riskAssessmentId: riskAssessment.id,
            workUnitId: riskAssessment.workUnitId,
            type: action.action_type,
            description: action.action_label,
            priority: action.priority,
            status: 'à_faire',
            dueDate,
            notes: `Indicateur de suivi: ${action.indicator}`,
          },
        });

        createdActions.push(createdAction);
      }

      return {
        success: true,
        actions: createdActions,
        count: createdActions.length,
      };
    }),
});


