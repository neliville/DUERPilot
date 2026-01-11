/**
 * Router admin pour la gestion des utilisateurs
 */

import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/lib/db';

export const usersRouter = createTRPCRouter({
  /**
   * Liste tous les utilisateurs avec filtres
   */
  getAll: adminProcedure
    .input(
      z.object({
        plan: z.enum(['free', 'starter', 'pro', 'expert']).optional(),
        role: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const where: any = {};

      if (input.plan) {
        where.plan = input.plan;
      }

      if (input.role) {
        where.roles = { has: input.role };
      }

      const [users, total] = await Promise.all([
        prisma.userProfile.findMany({
          where,
          include: {
            tenant: {
              select: {
                name: true,
                slug: true,
              },
            },
            aiUsageLogs: {
              select: {
                estimatedCost: true,
                totalTokens: true,
              },
              take: 100, // Pour calculer le volume IA
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: input.limit,
          skip: input.offset,
        }),
        prisma.userProfile.count({ where }),
      ]);

      // Enrichir avec volume IA
      const enriched = users.map((user) => {
        const totalAICost = user.aiUsageLogs.reduce((sum, log) => sum + log.estimatedCost, 0);
        const totalAITokens = user.aiUsageLogs.reduce((sum, log) => sum + log.totalTokens, 0);

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          plan: user.plan,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          tenant: user.tenant,
          aiVolume: {
            totalCost: totalAICost,
            totalTokens: totalAITokens,
            callCount: user.aiUsageLogs.length,
          },
        };
      });

      return {
        users: enriched,
        total,
      };
    }),

  /**
   * Détails utilisateur
   */
  getById: adminProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .query(async ({ input }) => {
      const user = await prisma.userProfile.findUnique({
        where: { id: input.userId },
        include: {
          tenant: {
            include: {
              subscription: true,
            },
          },
          aiUsageLogs: {
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
              company: {
                select: {
                  legalName: true,
                },
              },
            },
          },
          auditLogs: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utilisateur non trouvé',
        });
      }

      return user;
    }),

  /**
   * Utilisateurs d'une entreprise
   */
  getByCompany: adminProcedure
    .input(z.object({ companyId: z.string().cuid() }))
    .query(async ({ input }) => {
      const company = await prisma.company.findUnique({
        where: { id: input.companyId },
        select: { tenantId: true },
      });

      if (!company) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Entreprise non trouvée',
        });
      }

      return await prisma.userProfile.findMany({
        where: { tenantId: company.tenantId },
        include: {
          aiUsageLogs: {
            where: {
              companyId: input.companyId,
            },
            select: {
              estimatedCost: true,
              totalTokens: true,
            },
          },
        },
      });
    }),

  /**
   * Activité récente par utilisateur
   */
  getActivity: adminProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const [auditLogs, aiUsage, riskAssessments] = await Promise.all([
        prisma.auditLog.findMany({
          where: { actorId: input.userId },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
        }),
        prisma.aIUsageLog.findMany({
          where: { userId: input.userId },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
        }),
        prisma.riskAssessment.findMany({
          where: {
            workUnit: {
              assignedUsers: {
                some: {
                  id: input.userId,
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          select: {
            id: true,
            createdAt: true,
            hazardRef: {
              select: {
                shortLabel: true,
              },
            },
          },
        }),
      ]);

      return {
        auditLogs,
        aiUsage,
        riskAssessments,
      };
    }),

  /**
   * Modifier rôle utilisateur
   */
  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        roles: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.userProfile.update({
        where: { id: input.userId },
        data: { roles: input.roles },
      });
    }),

  /**
   * Suspendre un utilisateur
   */
  suspendUser: adminProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Ajouter un rôle "suspended" ou désactiver l'utilisateur
      const user = await prisma.userProfile.findUnique({
        where: { id: input.userId },
        select: { roles: true },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utilisateur non trouvé',
        });
      }

      return await prisma.userProfile.update({
        where: { id: input.userId },
        data: {
          roles: [...(user.roles || []), 'suspended'],
        },
      });
    }),

  /**
   * Réinitialiser mot de passe
   */
  resetPassword: adminProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(input.newPassword, 10);

      return await prisma.userProfile.update({
        where: { id: input.userId },
        data: { password: hashedPassword },
      });
    }),

  /**
   * Créer un nouvel admin
   */
  createAdmin: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        tenantId: z.string().cuid().optional(), // Si non fourni, crée un nouveau tenant
        sendInvitation: z.boolean().default(true),
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
          message: 'Un utilisateur avec cet email existe déjà',
        });
      }

      // Déterminer le tenant
      let tenantId = input.tenantId;
      if (!tenantId) {
        // Créer un nouveau tenant pour cet admin
        const tenant = await prisma.tenant.create({
          data: {
            name: `${input.firstName || ''} ${input.lastName || ''}`.trim() || 'Admin Tenant',
            slug: `admin-${Date.now()}`,
          },
        });
        tenantId = tenant.id;
      }

      // Créer l'utilisateur admin
      const userProfile = await prisma.userProfile.create({
        data: {
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          roles: ['super_admin'],
          isSuperAdmin: true,
          tenantId,
          emailVerified: false, // Sera vérifié via l'invitation
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

      // Envoyer l'invitation si demandé
      if (input.sendInvitation) {
        // TODO: Implémenter l'envoi d'email d'invitation
        // Pour l'instant, on génère juste un token de vérification
        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 48); // 48h pour valider

        await prisma.userProfile.update({
          where: { id: userProfile.id },
          data: {
            emailVerificationToken: token,
            emailVerificationExpiry: expires,
          },
        });

        // TODO: Envoyer email avec lien d'invitation
        console.log(`📧 Invitation à envoyer à ${input.email}`);
        console.log(`🔗 Token: ${token}`);
      }

      return {
        success: true,
        user: {
          id: userProfile.id,
          email: userProfile.email,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
        },
        message: input.sendInvitation
          ? 'Admin créé et invitation envoyée'
          : 'Admin créé (invitation non envoyée)',
      };
    }),

  /**
   * Inviter un admin existant (promouvoir un utilisateur en admin)
   */
  inviteAdmin: adminProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        sendInvitation: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.userProfile.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utilisateur non trouvé',
        });
      }

      // Promouvoir en admin
      const updatedUser = await prisma.userProfile.update({
        where: { id: input.userId },
        data: {
          roles: [...(user.roles || []), 'super_admin'],
          isSuperAdmin: true,
        },
      });

      // Envoyer notification si demandé
      if (input.sendInvitation) {
        // TODO: Implémenter l'envoi d'email de notification
        console.log(`📧 Notification à envoyer à ${user.email}`);
      }

      return {
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          isSuperAdmin: updatedUser.isSuperAdmin,
        },
        message: 'Utilisateur promu en admin',
      };
    }),

  /**
   * Retirer les droits admin d'un utilisateur
   */
  removeAdmin: adminProcedure
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

      // Retirer les droits admin
      const updatedRoles = (user.roles || []).filter((role) => role !== 'super_admin');

      return await prisma.userProfile.update({
        where: { id: input.userId },
        data: {
          roles: updatedRoles,
          isSuperAdmin: false,
        },
      });
    }),

  /**
   * Lister tous les admins
   */
  getAllAdmins: adminProcedure.query(async () => {
    return await prisma.userProfile.findMany({
      where: {
        OR: [
          { isSuperAdmin: true },
          { roles: { has: 'super_admin' } },
        ],
      },
      include: {
        tenant: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }),
});

