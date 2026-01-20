import { z } from 'zod';
import { createTRPCRouter, publicProcedure, authenticatedProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/types';
import { TRPCError } from '@trpc/server';
import { generateVerificationCode } from '@/lib/email';
import { onUserRegistered } from '@/server/services/email/triggers';

export const authRouter = createTRPCRouter({
  /**
   * Inscription d'un nouvel utilisateur
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Vérifier si l'utilisateur existe déjà dans UserProfile ou User
        const existingUserProfile = await prisma.userProfile.findUnique({
          where: { email: input.email },
        });

        const existingUser = await prisma.user.findUnique({
          where: { email: input.email },
        });

        if (existingUserProfile || existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Un utilisateur avec cet email existe déjà',
          });
        }

        // Créer un nouveau tenant unique pour chaque nouvel utilisateur
        // Chaque utilisateur doit avoir son propre espace isolé
        const tenantSlug = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const tenantName = input.firstName && input.lastName
          ? `${input.firstName} ${input.lastName}`
          : input.email.split('@')[0]; // Utiliser la partie avant @ de l'email
        
        const tenant = await prisma.tenant.create({
          data: {
            name: tenantName,
            slug: tenantSlug,
          },
        });

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Générer un code de vérification
        const verificationCode = generateVerificationCode();
        const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Créer l'utilisateur UserProfile (email non vérifié par défaut)
        // Le premier utilisateur est automatiquement le propriétaire (owner)
        const userProfile = await prisma.userProfile.create({
          data: {
            email: input.email,
            firstName: input.firstName || '',
            lastName: input.lastName || '',
            password: hashedPassword, // Stocker le hash du mot de passe
            roles: ['owner', 'admin'], // Premier utilisateur = propriétaire + admin
            isOwner: true, // Premier utilisateur = propriétaire
            tenantId: tenant.id,
            emailVerified: false, // Email non vérifié par défaut
            emailVerificationToken: verificationCode,
            emailVerificationExpiry: verificationExpiry,
          },
        });

        // Lier le propriétaire au tenant
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { ownerId: userProfile.id },
        });

        // Créer aussi l'utilisateur NextAuth (email non vérifié)
        await prisma.user.upsert({
          where: { email: input.email },
          update: {
            emailVerified: null, // Email non vérifié
          },
          create: {
            email: input.email,
            name: `${input.firstName || ''} ${input.lastName || ''}`.trim() || input.email,
            emailVerified: null, // Email non vérifié par défaut
          },
        });

        // Envoyer l'email d'activation via le nouveau système
        // (non bloquant, en arrière-plan)
        onUserRegistered({
          id: userProfile.id,
          email: userProfile.email,
          firstName: userProfile.firstName,
          tenantId: userProfile.tenantId,
          verificationCode, // Passer le code à 6 chiffres
        }).catch((error) => {
          console.error('Erreur lors de l\'envoi de l\'email (non bloquant):', error);
          // L'utilisateur pourra demander un nouveau code via resendVerificationCode
        });

        // Ne pas attendre l'envoi d'email, retourner immédiatement
        return {
          success: true,
          userId: userProfile.id,
          email: userProfile.email,
          emailSent: true,
        };
      } catch (error: unknown) {
        console.error('Erreur lors de l\'inscription:', error);
        
        // Si c'est déjà une TRPCError, la relancer
        if (error instanceof TRPCError) {
          throw error;
        }
        
        // Sinon, créer une TRPCError
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'inscription';
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: errorMessage,
          cause: error,
        });
      }
    }),

  /**
   * Vérifier le statut de vérification d'un email
   */
  checkEmailVerification: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const userProfile = await prisma.userProfile.findUnique({
        where: { email: input.email },
        select: {
          emailVerified: true,
          email: true,
        },
      });

      if (!userProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Aucun utilisateur trouvé avec cet email',
        });
      }

      return {
        emailVerified: userProfile.emailVerified,
        email: userProfile.email,
      };
    }),

  /**
   * Renvoyer le code de vérification
   */
  resendVerificationCode: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const userProfile = await prisma.userProfile.findUnique({
        where: { email: input.email },
      });

      if (!userProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Aucun utilisateur trouvé avec cet email',
        });
      }

      if (userProfile.emailVerified) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cet email est déjà vérifié',
        });
      }

      // Générer un nouveau code
      const verificationCode = generateVerificationCode();
      const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Mettre à jour le code de vérification
      await prisma.userProfile.update({
        where: { email: input.email },
        data: {
          emailVerificationToken: verificationCode,
          emailVerificationExpiry: verificationExpiry,
        },
      });

      // Envoyer l'email via le nouveau système
      try {
        await onUserRegistered({
          id: userProfile.id,
          email: userProfile.email,
          firstName: userProfile.firstName,
          tenantId: userProfile.tenantId,
          verificationCode, // Passer le code à 6 chiffres
        });
        return { success: true, message: 'Code de vérification envoyé' };
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Impossible d\'envoyer l\'email de vérification',
        });
      }
    }),

  /**
   * Vérifier le code de vérification email
   */
  verifyEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        code: z.string().length(6, 'Le code doit contenir 6 chiffres'),
      })
    )
    .mutation(async ({ input }) => {
      const userProfile = await prisma.userProfile.findUnique({
        where: { email: input.email },
      });

      if (!userProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Aucun utilisateur trouvé avec cet email',
        });
      }

      if (userProfile.emailVerified) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cet email est déjà vérifié',
        });
      }

      // Vérifier le code et l'expiration
      if (!userProfile.emailVerificationToken || !userProfile.emailVerificationExpiry) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Aucun code de vérification trouvé. Veuillez en demander un nouveau.',
        });
      }

      if (userProfile.emailVerificationToken !== input.code) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Code de vérification incorrect',
        });
      }

      if (new Date() > userProfile.emailVerificationExpiry) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Le code de vérification a expiré. Veuillez en demander un nouveau.',
        });
      }

      // Marquer l'email comme vérifié
      await prisma.userProfile.update({
        where: { email: input.email },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiry: null,
        },
      });

      // Mettre à jour aussi l'utilisateur NextAuth
      await prisma.user.update({
        where: { email: input.email },
        data: {
          emailVerified: new Date(),
        },
      });

      return {
        success: true,
        message: 'Email vérifié avec succès',
      };
    }),

  /**
   * Récupère le profil utilisateur actuel
   */
  getCurrentUser: authenticatedProcedure.query(async ({ ctx }) => {
    return ctx.userProfile;
  }),
});
