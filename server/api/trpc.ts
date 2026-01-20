import { initTRPC, TRPCError } from '@trpc/server';
import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import type { NextRequest } from 'next/server';
import superjson from 'superjson';
import type { Plan, EvaluationMethod } from '@/lib/plans';
import {
  PLAN_FEATURES,
  hasMethodAccess,
  hasFeatureAccess,
  getRequiredPlan,
  PLAN_ERROR_MESSAGES,
} from '@/lib/plans';

/**
 * 1. CONTEXT
 *
 * Cette section définit le "contexte" qui est disponible dans tous les routers tRPC.
 *
 * Le contexte est utilisé pour :
 * - Gérer la session utilisateur
 * - Accéder à la base de données
 * - Vérifier le tenantId pour le multi-tenancy
 */
export async function createTRPCContext(opts: { req: NextRequest; res?: Response }) {
  const session = await auth();
  
  // Récupérer le UserProfile si l'utilisateur est authentifié
  let userProfile = null;
  if (session?.user?.email) {
    try {
      userProfile = await prisma.userProfile.findUnique({
        where: { email: session.user.email },
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du UserProfile:', error);
      // Continuer avec userProfile = null si la DB n'est pas accessible
      // L'authentification échouera mais au moins l'app ne plantera pas
    }
  }

  return {
    session,
    user: session?.user || null,
    userProfile,
    prisma,
    req: opts.req,
    res: opts.res,
  };
}

/**
 * 2. INITIALIZATION
 *
 * Initialisation de tRPC avec le contexte.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && 'flatten' in error.cause
            ? (error.cause as any).flatten()
            : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE
 *
 * Création des helpers pour créer des routers et des procedures.
 */
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

/**
 * 4. MIDDLEWARES
 *
 * Middlewares pour la validation et la sécurité.
 */

/**
 * Middleware pour vérifier que l'utilisateur est authentifié
 */
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user || !ctx.userProfile) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
      userProfile: ctx.userProfile,
    },
  });
});

/**
 * Middleware pour vérifier le tenantId et s'assurer que l'utilisateur
 * n'accède qu'aux données de son tenant
 * 
 * Exception : Les super admins peuvent accéder à leur tenant s'ils en ont un,
 * ou à null s'ils n'en ont pas (pour les pages admin)
 */
const enforceTenant = t.middleware(async ({ ctx, next }) => {
  // Les super admins peuvent accéder à leur tenant s'ils en ont un
  const isSuperAdmin = ctx.userProfile?.isSuperAdmin || 
                      (ctx.userProfile?.roles && ctx.userProfile.roles.includes('super_admin'));
  
  if (isSuperAdmin) {
    return next({
      ctx: {
        ...ctx,
        tenantId: ctx.userProfile!.tenantId || null, // Utiliser le tenant du super admin s'il existe
        userId: ctx.userProfile!.id,
      },
    });
  }

  // Pour les utilisateurs normaux, le tenantId est obligatoire
  if (!ctx.userProfile?.tenantId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Tenant ID manquant',
    });
  }

  return next({
    ctx: {
      ...ctx,
      tenantId: ctx.userProfile.tenantId,
      userId: ctx.userProfile.id,
    },
  });
});

/**
 * Middleware pour vérifier l'expiration auditor (externe temporaire)
 */
export const checkAuditorExpiry = t.middleware(async ({ ctx, next }) => {
  const user = ctx.userProfile;
  if (user?.roles?.includes('auditor') && user.accessExpiry) {
    if (user.accessExpiry < new Date()) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Votre accès auditeur a expiré',
      });
    }
  }
  return next({ ctx });
});

/**
 * Middleware combiné : authentification + multi-tenancy + vérification expiration auditor
 */
const protectedProcedure = t.procedure
  .use(isAuthenticated)
  .use(enforceTenant)
  .use(checkAuditorExpiry);

/**
 * Middleware admin : vérifie que l'utilisateur est super_admin
 * Accès global (pas de restriction tenant pour admin)
 */
export const adminProcedure = t.procedure
  .use(isAuthenticated)
  .use(async ({ ctx, next }) => {
    if (!ctx.userProfile) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentification requise' });
    }

    // Vérifier le rôle super_admin
    const isSuperAdmin = ctx.userProfile.isSuperAdmin || 
                        (ctx.userProfile.roles && ctx.userProfile.roles.includes('super_admin'));

    if (!isSuperAdmin) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Accès admin requis. Seuls les super administrateurs peuvent accéder à cette fonctionnalité.',
      });
    }

    return next({
      ctx: {
        ...ctx,
        // Admin a accès global, pas de restriction tenant
        adminUserId: ctx.userProfile.id,
      },
    });
  });

/**
 * Middleware pour vérifier les rôles utilisateur
 */
export const createRoleMiddleware = (allowedRoles: string[]) => {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.userProfile) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const userRoles = ctx.userProfile.roles || [];
    
    // Support de compatibilité ascendante : mapper les anciens rôles
    const normalizedRoles = userRoles.map((role) => {
      const mapping: Record<string, string> = {
        admin_tenant: 'admin',
        manager: 'site_manager',
        operator: 'observer',
        consultant: 'auditor', // Ancien nom → nouveau nom (auditeur externe)
      };
      return mapping[role] || role;
    });
    
    const hasRole = allowedRoles.some((role) => 
      normalizedRoles.includes(role) || userRoles.includes(role as any)
    );

    if (!hasRole) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Accès refusé. Rôles requis: ${allowedRoles.join(', ')}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        tenantId: ctx.userProfile.tenantId,
        userId: ctx.userProfile.id,
      },
    });
  });
};

/**
 * Middleware pour vérifier le propriétaire
 */
export const ownerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.userProfile?.isOwner) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Accès réservé au propriétaire',
    });
  }
  return next({ ctx });
});

/**
 * Middleware pour vérifier le scope (sites accessibles)
 */
export const checkSiteScope = (siteId: string) => {
  return t.middleware(async ({ ctx, next }) => {
    const user = ctx.userProfile;
    if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    
    // Owner, admin, qse, representative, auditor : accès global
    const userRoles = user.roles || [];
    const globalAccessRoles = ['admin', 'qse', 'representative', 'auditor'];
    
    if (user.isOwner || globalAccessRoles.some((r) => userRoles.includes(r))) {
      return next({ ctx });
    }
    
    // site_manager et observer : vérifier le scope
    const scopedRoles = ['site_manager', 'observer'];
    if (scopedRoles.some((r) => userRoles.includes(r))) {
      const scopeSites = user.scopeSites || [];
      if (!scopeSites.includes(siteId)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Accès limité à votre périmètre',
        });
      }
    }
    
    return next({ ctx });
  });
};

/**
 * Middleware pour vérifier l'accès à une méthode d'évaluation
 */
export const createMethodAccessMiddleware = (method: EvaluationMethod) => {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.userProfile) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const userPlan = (ctx.userProfile.plan || 'free') as Plan;

    if (!hasMethodAccess(userPlan, method)) {
      const requiredPlan = getRequiredPlan(method);
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: PLAN_ERROR_MESSAGES.method_not_available(
          method,
          userPlan,
          requiredPlan
        ),
      });
    }

    return next({ ctx });
  });
};

/**
 * Middleware pour vérifier l'accès à une fonctionnalité
 */
export const createFeatureAccessMiddleware = (feature: string) => {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.userProfile) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const userPlan = (ctx.userProfile.plan || 'free') as Plan;

    if (!hasFeatureAccess(userPlan, feature as keyof typeof PLAN_FEATURES[Plan])) {
      const requiredPlan = getRequiredPlan(feature);
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: PLAN_ERROR_MESSAGES.feature_not_available(
          feature,
          userPlan,
          requiredPlan
        ),
      });
    }

    return next({ ctx });
  });
};

/**
 * Middleware pour vérifier le quota IA (DÉPRÉCIÉ - Utiliser le router aiUsage)
 * @deprecated Utiliser api.aiUsage.checkQuota.query() à la place
 */
export const checkIAAQuota = t.middleware(async ({ ctx, next }) => {
  // Ce middleware est déprécié car les quotas IA sont maintenant gérés par type (suggestions_risques, suggestions_actions, reformulation)
  // Utiliser le router aiUsage à la place
  console.warn('checkIAAQuota middleware is deprecated. Use aiUsage.checkQuota instead.');
  return next({ ctx });
});

/**
 * Fonction utilitaire pour incrémenter le compteur IA (DÉPRÉCIÉ)
 * @deprecated Utiliser api.aiUsage.logUsage.mutate() à la place
 */
export async function incrementIAAUsage(
  userId: string,
  prismaClient: typeof prisma
): Promise<void> {
  // Cette fonction est dépréciée car l'usage IA est maintenant tracké via AIUsageLog avec les types spécifiques
  // Utiliser api.aiUsage.logUsage.mutate() à la place
  console.warn('incrementIAAUsage function is deprecated. Use aiUsage.logUsage instead.');
}

/**
 * Calcule l'utilisation actuelle d'une fonctionnalité pour un tenant
 */
async function getCurrentUsageForLimit(
  prismaClient: typeof prisma,
  tenantId: string,
  feature: string
): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  switch (feature) {
    case 'maxWorkUnits':
      return await prismaClient.workUnit.count({ where: { tenantId } });

    case 'maxUsers':
      return await prismaClient.userProfile.count({ where: { tenantId } });

    case 'maxCompanies':
      return await prismaClient.company.count({ where: { tenantId } });

    case 'maxSites':
      return await prismaClient.site.count({ where: { tenantId } });

    case 'maxRisksPerMonth':
      return await prismaClient.riskEvaluation.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth },
        },
      });

    case 'maxPlansActionPerMonth':
      return await prismaClient.actionPlan.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth },
        },
      });

    case 'maxObservationsPerMonth':
      return await prismaClient.observation.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth },
        },
      });

    case 'maxExportsPerMonth':
      return await prismaClient.duerpVersion.count({
        where: {
          tenantId,
          createdAt: { gte: startOfYear },
          status: 'published',
        },
      });

    case 'maxImportsPerMonth':
      return await prismaClient.duerpImport.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth },
        },
      });

    case 'maxAISuggestionsRisks':
      return await prismaClient.aIUsageLog.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth },
          action: 'suggest_risks',
        },
      });

    case 'maxAISuggestionsActions':
      return await prismaClient.aIUsageLog.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth },
          action: 'suggest_actions',
        },
      });

    default:
      return 0;
  }
}

/**
 * Middleware pour vérifier une limite de plan avant une action
 * 
 * @param feature - La fonctionnalité à vérifier (ex: 'maxWorkUnits')
 * @param errorMessage - Message d'erreur personnalisé (optionnel)
 * 
 * @example
 * ```ts
 * create: protectedProcedure
 *   .use(checkPlanLimit('maxWorkUnits'))
 *   .input(createWorkUnitSchema)
 *   .mutation(async ({ ctx, input }) => {
 *     // Créer l'unité de travail
 *   })
 * ```
 */
export const checkPlanLimit = (feature: string, errorMessage?: string) => {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.userProfile) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const userPlan = (ctx.userProfile.plan || 'free') as Plan;
    const planFeatures = PLAN_FEATURES[userPlan];
    const limit = planFeatures[feature as keyof typeof planFeatures];

    // Si la limite est illimitée (Infinity ou null), autoriser
    if (limit === Infinity || limit === null) {
      return next({ ctx });
    }

    // Vérifier la limite
    if (typeof limit === 'number') {
      const currentUsage = await getCurrentUsageForLimit(
        ctx.prisma,
        ctx.userProfile.tenantId,
        feature
      );

      if (currentUsage >= limit) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            errorMessage ||
            `Limite du plan ${userPlan.toUpperCase()} atteinte pour ${feature} (${currentUsage}/${limit})`,
          cause: {
            feature,
            limit,
            currentUsage,
            plan: userPlan,
            upgradePlan: getRequiredPlan(feature),
          },
        });
      }
    }

    return next({ ctx });
  });
};

/**
 * Middleware pour vérifier plusieurs limites de plan
 * 
 * @param features - Liste des fonctionnalités à vérifier
 * 
 * @example
 * ```ts
 * create: protectedProcedure
 *   .use(checkPlanLimits(['maxWorkUnits', 'maxSites']))
 *   .input(createWorkUnitSchema)
 *   .mutation(async ({ ctx, input }) => {
 *     // Créer l'unité de travail
 *   })
 * ```
 */
export const checkPlanLimits = (features: string[]) => {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.userProfile) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const userPlan = (ctx.userProfile.plan || 'free') as Plan;
    const planFeatures = PLAN_FEATURES[userPlan];

    for (const feature of features) {
      const limit = planFeatures[feature as keyof typeof planFeatures];

      // Si la limite est illimitée, continuer
      if (limit === Infinity || limit === null) {
        continue;
      }

      // Vérifier la limite
      if (typeof limit === 'number') {
        const currentUsage = await getCurrentUsageForLimit(
          ctx.prisma,
          ctx.userProfile.tenantId,
          feature
        );

        if (currentUsage >= limit) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Limite du plan ${userPlan.toUpperCase()} atteinte pour ${feature} (${currentUsage}/${limit})`,
            cause: {
              feature,
              limit,
              currentUsage,
              plan: userPlan,
              upgradePlan: getRequiredPlan(feature),
            },
          });
        }
      }
    }

    return next({ ctx });
  });
};

/**
 * Procedures exportées
 */
export { protectedProcedure };
export const authenticatedProcedure = protectedProcedure;
// adminProcedure est déjà défini plus haut (ligne 130)
// Ne pas redéclarer ici pour éviter les conflits
export const qseProcedure = protectedProcedure.use(
  createRoleMiddleware(['super_admin', 'admin_tenant', 'qse'])
);

