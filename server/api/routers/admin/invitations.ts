/**
 * Router admin pour la gestion des invitations admin
 */

import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export const invitationsRouter = createTRPCRouter({
  /**
   * Envoyer une invitation admin à un email
   */
  sendAdminInvitation: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier que l'email n'existe pas déjà
      const existingUser = await prisma.userProfile.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Un utilisateur avec cet email existe déjà. Utilisez "inviteAdmin" pour promouvoir un utilisateur existant.',
        });
      }

      // Générer un token d'invitation
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date();
      expires.setHours(expires.getHours() + 168); // 7 jours pour valider

      // Créer un tenant temporaire pour l'invitation
      const tenant = await prisma.tenant.create({
        data: {
          name: `Admin ${input.firstName || input.email}`,
          slug: `admin-invite-${Date.now()}`,
        },
      });

      // Créer l'utilisateur avec le token d'invitation
      const userProfile = await prisma.userProfile.create({
        data: {
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          roles: ['super_admin'],
          isSuperAdmin: true,
          tenantId: tenant.id,
          emailVerified: false,
          emailVerificationToken: token,
          emailVerificationExpiry: expires,
        },
      });

      // Créer aussi l'utilisateur NextAuth
      await prisma.user.upsert({
        where: { email: input.email },
        update: {},
        create: {
          email: input.email,
          name: `${input.firstName || ''} ${input.lastName || ''}`.trim() || input.email,
          emailVerified: null,
        },
      });

      // TODO: Envoyer l'email d'invitation
      // Pour l'instant, on retourne le token (à supprimer en production)
      const invitationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;

      console.log(`📧 Invitation admin à envoyer à ${input.email}`);
      console.log(`🔗 URL: ${invitationUrl}`);

      return {
        success: true,
        message: 'Invitation créée',
        invitationUrl, // À supprimer en production, utiliser un service d'email
        expiresAt: expires,
      };
    }),

  /**
   * Renvoyer une invitation
   */
  resendInvitation: adminProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await prisma.userProfile.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utilisateur non trouvé',
        });
      }

      if (user.emailVerified) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'L\'utilisateur a déjà vérifié son email',
        });
      }

      // Générer un nouveau token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date();
      expires.setHours(expires.getHours() + 168); // 7 jours

      await prisma.userProfile.update({
        where: { id: input.userId },
        data: {
          emailVerificationToken: token,
          emailVerificationExpiry: expires,
        },
      });

      const invitationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;

      console.log(`📧 Réinvitation à envoyer à ${user.email}`);
      console.log(`🔗 URL: ${invitationUrl}`);

      return {
        success: true,
        message: 'Invitation renvoyée',
        invitationUrl, // À supprimer en production
        expiresAt: expires,
      };
    }),

  /**
   * Lister les invitations en attente
   */
  getPendingInvitations: adminProcedure.query(async () => {
    return await prisma.userProfile.findMany({
      where: {
        isSuperAdmin: true,
        emailVerified: false,
        emailVerificationToken: { not: null },
        emailVerificationExpiry: { gt: new Date() },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerificationExpiry: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }),

  /**
   * Annuler une invitation
   */
  cancelInvitation: adminProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await prisma.userProfile.findUnique({
        where: { id: input.userId },
      });

      if (!user || user.emailVerified) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invitation non trouvée ou déjà acceptée',
        });
      }

      // Supprimer l'utilisateur et son tenant si l'invitation n'a pas été acceptée
      await prisma.userProfile.delete({
        where: { id: input.userId },
      });

      // Supprimer aussi l'utilisateur NextAuth
      await prisma.user.deleteMany({
        where: { email: user.email },
      });

      return {
        success: true,
        message: 'Invitation annulée',
      };
    }),
});

