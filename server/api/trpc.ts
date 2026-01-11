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
    userProfile = await prisma.userProfile.findUnique({
      where: { email: session.user.email },
    });
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
 */
const enforceTenant = t.middleware(async ({ ctx, next }) => {
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
 * Middleware combiné : authentification + multi-tenancy
 */
const protectedProcedure = t.procedure.use(isAuthenticated).use(enforceTenant);

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
const createRoleMiddleware = (allowedRoles: string[]) => {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.userProfile) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const userRoles = ctx.userProfile.roles || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role as any));

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
 * Procedures exportées
 */
export const authenticatedProcedure = protectedProcedure;
// adminProcedure est déjà défini plus haut (ligne 130)
// Ne pas redéclarer ici pour éviter les conflits
export const qseProcedure = protectedProcedure.use(
  createRoleMiddleware(['super_admin', 'admin_tenant', 'qse'])
);

