/**
 * Router pour la gestion des utilisateurs
 * Gère les invitations, modifications de rôles, révocations, transfert de propriété
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, ownerProcedure, createRoleMiddleware } from '../trpc';
import { TRPCError } from '@trpc/server';
import type { UserRole } from '@/types';
import { hasPermission } from '@/lib/permissions';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const inviteUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['admin', 'qse', 'site_manager', 'representative', 'observer']),
  scopeSites: z.array(z.string().cuid()).optional(),
});

const inviteAuditorSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  durationDays: z.number().min(1).max(180).default(30),
});

const updateUserRoleSchema = z.object({
  userId: z.string().cuid(),
  roles: z.array(z.string()),
  scopeSites: z.array(z.string().cuid()).optional(),
});

const requestOwnershipTransferSchema = z.object({
  newOwnerId: z.string().cuid(),
  password: z.string().min(1, 'Mot de passe requis pour confirmer le transfert'),
});

const confirmOwnershipTransferSchema = z.object({
  token: z.string().min(1, 'Token requis'),
});

const assignSitesToUserSchema = z.object({
  userId: z.string().cuid(),
  siteIds: z.array(z.string().cuid()),
});

export const usersRouter = createTRPCRouter({
  /**
   * Inviter un utilisateur permanent
   */
  inviteUser: protectedProcedure
    .use(createRoleMiddleware(['owner', 'admin']))
    .input(inviteUserSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'email n'existe pas déjà
      const existingUser = await ctx.prisma.userProfile.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Un utilisateur avec cet email existe déjà',
        });
      }

      // Vérifier que l'utilisateur a la permission d'inviter ce rôle
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner;

      // Seul le propriétaire peut inviter un admin
      if (input.role === 'admin' && !isOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seul le propriétaire peut inviter un administrateur',
        });
      }

      // Vérifier les limites du plan (max users)
      const plan = (ctx.userProfile.plan || 'free') as string;
      
      // Plan FREE : pas d'invitation possible (1 seul utilisateur = propriétaire)
      if (plan === 'free') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Le plan FREE ne permet pas d\'inviter d\'autres utilisateurs. Passez à un plan supérieur pour ajouter des utilisateurs.',
        });
      }
      
      const currentUserCount = await ctx.prisma.userProfile.count({
        where: { tenantId: ctx.tenantId },
      });

      // TODO: Vérifier contre PLAN_FEATURES[plan].maxUsers

      // Créer l'utilisateur UserProfile
      const userProfile = await ctx.prisma.userProfile.create({
        data: {
          email: input.email,
          firstName: input.firstName || '',
          lastName: input.lastName || '',
          roles: [input.role],
          tenantId: ctx.tenantId,
          isOwner: false,
          scopeSites: input.scopeSites || [],
          invitedBy: ctx.userProfile.id,
          emailVerified: false,
        },
      });

      // Créer aussi l'utilisateur NextAuth
      await ctx.prisma.user.upsert({
        where: { email: input.email },
        update: {},
        create: {
          email: input.email,
          name: `${input.firstName || ''} ${input.lastName || ''}`.trim() || input.email,
          emailVerified: null,
        },
      });

      // TODO: Envoyer un email d'invitation

      return {
        success: true,
        userId: userProfile.id,
        email: userProfile.email,
      };
    }),

  /**
   * Inviter un auditeur externe temporaire (inspecteur, expert, CARSAT, etc.)
   */
  inviteAuditor: protectedProcedure
    .use(createRoleMiddleware(['owner', 'admin', 'qse']))
    .input(inviteAuditorSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier les quotas auditeurs externes selon le plan
      const plan = (ctx.userProfile.plan || 'free') as string;
      
      // TODO: Vérifier les quotas auditeurs externes (2/an PRO, 5/an EXPERT)

      // Calculer la date d'expiration
      const accessExpiry = new Date();
      accessExpiry.setDate(accessExpiry.getDate() + input.durationDays);

      // Vérifier que l'email n'existe pas déjà
      const existingUser = await ctx.prisma.userProfile.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Un utilisateur avec cet email existe déjà',
        });
      }

      // Créer l'auditeur externe temporaire
      const auditor = await ctx.prisma.userProfile.create({
        data: {
          email: input.email,
          firstName: input.firstName || '',
          lastName: input.lastName || '',
          roles: ['auditor'], // Auditeur externe temporaire
          tenantId: ctx.tenantId,
          isOwner: false,
          accessExpiry,
          invitedBy: ctx.userProfile.id,
          emailVerified: false,
        },
      });

      // Créer aussi l'utilisateur NextAuth
      await ctx.prisma.user.upsert({
        where: { email: input.email },
        update: {},
        create: {
          email: input.email,
          name: `${input.firstName || ''} ${input.lastName || ''}`.trim() || input.email,
          emailVerified: null,
        },
      });

      // TODO: Envoyer un email d'invitation avec lien temporaire

      return {
        success: true,
        userId: auditor.id,
        email: auditor.email,
        accessExpiry: auditor.accessExpiry,
      };
    }),

  /**
   * Modifier le rôle d'un utilisateur
   */
  updateUserRole: protectedProcedure
    .use(createRoleMiddleware(['owner', 'admin']))
    .input(updateUserRoleSchema)
    .mutation(async ({ ctx, input }) => {
      // Récupérer l'utilisateur à modifier
      const targetUser = await ctx.prisma.userProfile.findFirst({
        where: {
          id: input.userId,
          tenantId: ctx.tenantId,
        },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utilisateur non trouvé',
        });
      }

      // Vérifier les permissions
      const isOwner = ctx.userProfile.isOwner;

      // Seul le propriétaire peut modifier le rôle d'un admin
      if (targetUser.roles.includes('admin') && !isOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seul le propriétaire peut modifier le rôle d\'un administrateur',
        });
      }

      // Un admin ne peut pas créer d'autres admin
      if (input.roles.includes('admin') && !isOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seul le propriétaire peut créer des administrateurs',
        });
      }

      // Le propriétaire ne peut pas être modifié
      if (targetUser.isOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Le rôle du propriétaire ne peut pas être modifié',
        });
      }

      // Mettre à jour l'utilisateur
      await ctx.prisma.userProfile.update({
        where: { id: input.userId },
        data: {
          roles: input.roles,
          scopeSites: input.scopeSites || targetUser.scopeSites,
        },
      });

      return { success: true };
    }),

  /**
   * Révoquer un utilisateur
   */
  revokeUser: protectedProcedure
    .use(createRoleMiddleware(['owner', 'admin']))
    .input(z.object({ userId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Récupérer l'utilisateur à révoquer
      const targetUser = await ctx.prisma.userProfile.findFirst({
        where: {
          id: input.userId,
          tenantId: ctx.tenantId,
        },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utilisateur non trouvé',
        });
      }

      // Vérifier les permissions
      const isOwner = ctx.userProfile.isOwner;

      // Seul le propriétaire peut révoquer un admin
      if (targetUser.roles.includes('admin') && !isOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seul le propriétaire peut révoquer un administrateur',
        });
      }

      // Le propriétaire ne peut pas être révoqué
      if (targetUser.isOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Le propriétaire ne peut pas être révoqué',
        });
      }

      // Supprimer l'utilisateur
      await ctx.prisma.userProfile.delete({
        where: { id: input.userId },
      });

      return { success: true };
    }),

  /**
   * Demander le transfert de propriété (owner uniquement) - Étape 1
   * L'ancien owner initie le transfert avec son mot de passe
   */
  requestOwnershipTransfer: ownerProcedure
    .input(requestOwnershipTransferSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier le mot de passe du propriétaire actuel
      if (!ctx.userProfile.password) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Aucun mot de passe défini pour votre compte',
        });
      }

      const isPasswordValid = await bcrypt.compare(
        input.password,
        ctx.userProfile.password
      );

      if (!isPasswordValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Mot de passe incorrect',
        });
      }

      // Récupérer le nouvel owner
      const newOwner = await ctx.prisma.userProfile.findFirst({
        where: {
          id: input.newOwnerId,
          tenantId: ctx.tenantId,
        },
      });

      if (!newOwner) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utilisateur non trouvé',
        });
      }

      // Le nouvel owner ne doit pas être un observer ou auditor
      if (newOwner.roles.includes('observer') || newOwner.roles.includes('auditor')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Un observateur ou auditeur ne peut pas être propriétaire',
        });
      }

      // Vérifier s'il existe déjà une demande de transfert en attente
      const existingRequest = await ctx.prisma.ownershipTransferRequest.findFirst({
        where: {
          tenantId: ctx.tenantId,
          status: 'pending',
          expiresAt: { gt: new Date() },
        },
      });

      if (existingRequest) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Une demande de transfert est déjà en cours',
        });
      }

      // Générer un token de validation
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

      // Créer la demande de transfert
      await ctx.prisma.ownershipTransferRequest.create({
        data: {
          tenantId: ctx.tenantId,
          currentOwnerId: ctx.userProfile.id,
          newOwnerId: input.newOwnerId,
          token,
          status: 'pending',
          expiresAt,
        },
      });

      // TODO: Envoyer un email au nouveau propriétaire avec le token

      return {
        success: true,
        message: 'Demande de transfert créée. Le nouveau propriétaire doit confirmer le transfert.',
      };
    }),

  /**
   * Confirmer le transfert de propriété - Étape 2
   * Le nouveau owner confirme avec le token reçu par email
   */
  confirmOwnershipTransfer: protectedProcedure
    .input(confirmOwnershipTransferSchema)
    .mutation(async ({ ctx, input }) => {
      // Récupérer la demande de transfert
      const transferRequest = await ctx.prisma.ownershipTransferRequest.findUnique({
        where: { token: input.token },
        include: {
          currentOwner: true,
          newOwner: true,
          tenant: true,
        },
      });

      if (!transferRequest) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Demande de transfert non trouvée ou token invalide',
        });
      }

      // Vérifier que le token n'a pas expiré
      if (transferRequest.expiresAt < new Date()) {
        await ctx.prisma.ownershipTransferRequest.update({
          where: { id: transferRequest.id },
          data: { status: 'expired' },
        });
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Le token de transfert a expiré',
        });
      }

      // Vérifier que la demande est en attente
      if (transferRequest.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cette demande de transfert a déjà été traitée',
        });
      }

      // Vérifier que l'utilisateur actuel est bien le nouveau owner
      if (transferRequest.newOwnerId !== ctx.userProfile.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Vous n\'êtes pas autorisé à confirmer ce transfert',
        });
      }

      // Transaction : transférer la propriété
      await ctx.prisma.$transaction([
        // Mettre à jour l'ancien owner
        ctx.prisma.userProfile.update({
          where: { id: transferRequest.currentOwnerId },
          data: {
            isOwner: false,
            roles: transferRequest.currentOwner.roles
              .filter((r: string) => r !== 'owner')
              .concat('admin'),
          },
        }),
        // Mettre à jour le nouvel owner
        ctx.prisma.userProfile.update({
          where: { id: transferRequest.newOwnerId },
          data: {
            isOwner: true,
            roles: transferRequest.newOwner.roles
              .filter((r: string) => r !== 'owner')
              .concat('owner'),
          },
        }),
        // Mettre à jour le tenant
        ctx.prisma.tenant.update({
          where: { id: transferRequest.tenantId },
          data: { ownerId: transferRequest.newOwnerId },
        }),
        // Marquer la demande comme acceptée
        ctx.prisma.ownershipTransferRequest.update({
          where: { id: transferRequest.id },
          data: {
            status: 'accepted',
            acceptedAt: new Date(),
          },
        }),
      ]);

      // TODO: Envoyer des emails de notification aux deux parties

      return {
        success: true,
        message: 'Transfert de propriété effectué avec succès',
      };
    }),

  /**
   * Assigner des sites à un site_manager ou observer
   */
  assignSitesToUser: protectedProcedure
    .use(createRoleMiddleware(['owner', 'admin']))
    .input(assignSitesToUserSchema)
    .mutation(async ({ ctx, input }) => {
      // Récupérer l'utilisateur
      const targetUser = await ctx.prisma.userProfile.findFirst({
        where: {
          id: input.userId,
          tenantId: ctx.tenantId,
        },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utilisateur non trouvé',
        });
      }

      // Vérifier que l'utilisateur est site_manager ou observer
      const userRoles = targetUser.roles || [];
      if (!userRoles.includes('site_manager') && !userRoles.includes('observer')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Seuls les responsables de site et observateurs peuvent avoir des sites assignés',
        });
      }

      // Vérifier que tous les sites appartiennent au tenant
      const sites = await ctx.prisma.site.findMany({
        where: {
          id: { in: input.siteIds },
          company: { tenantId: ctx.tenantId },
        },
      });

      if (sites.length !== input.siteIds.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Certains sites ne sont pas valides',
        });
      }

      // Mettre à jour les sites assignés
      await ctx.prisma.userProfile.update({
        where: { id: input.userId },
        data: {
          scopeSites: input.siteIds,
        },
      });

      return { success: true };
    }),

  /**
   * Récupérer tous les utilisateurs du tenant
   */
  getAll: protectedProcedure
    .use(createRoleMiddleware(['owner', 'admin', 'qse']))
    .query(async ({ ctx }) => {
      const userRoles = ctx.userProfile.roles || [];
      const isOwner = ctx.userProfile.isOwner;

      // Filtrage selon le rôle
      let where: any = { tenantId: ctx.tenantId };

      // site_manager : voir uniquement son périmètre
      if (userRoles.includes('site_manager') && !isOwner && !userRoles.includes('admin') && !userRoles.includes('qse')) {
        const scopeSites = ctx.userProfile.scopeSites || [];
        // TODO: Filtrer les utilisateurs par scope sites
      }

      const users = await ctx.prisma.userProfile.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          roles: true,
          isOwner: true,
          scopeSites: true,
          accessExpiry: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return users;
    }),
});
