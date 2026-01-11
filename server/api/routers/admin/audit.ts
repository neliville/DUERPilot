/**
 * Router admin pour le journal d'audit global
 * Jamais supprimable, seulement archivable
 */

import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '../../trpc';
import { prisma } from '@/lib/db';

export const auditRouter = createTRPCRouter({
  /**
   * Journal d'audit global avec filtres
   */
  getAll: adminProcedure
    .input(
      z.object({
        entityType: z.string().optional(),
        action: z.string().optional(),
        actorId: z.string().cuid().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(200).default(100),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const where: any = {};

      if (input.entityType) {
        where.entityType = input.entityType;
      }

      if (input.action) {
        where.action = input.action;
      }

      if (input.actorId) {
        where.actorId = input.actorId;
      }

      if (input.startDate || input.endDate) {
        where.createdAt = {
          ...(input.startDate ? { gte: input.startDate } : {}),
          ...(input.endDate ? { lte: input.endDate } : {}),
        };
      }

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            actor: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
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
          take: input.limit,
          skip: input.offset,
        }),
        prisma.auditLog.count({ where }),
      ]);

      return {
        logs,
        total,
      };
    }),

  /**
   * Audit d'une entité spécifique
   */
  getByEntity: adminProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await prisma.auditLog.findMany({
        where: {
          entityType: input.entityType,
          entityId: input.entityId,
        },
        include: {
          actor: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),

  /**
   * Audit d'un utilisateur
   */
  getByUser: adminProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        limit: z.number().min(1).max(200).default(100),
      })
    )
    .query(async ({ input }) => {
      return await prisma.auditLog.findMany({
        where: {
          actorId: input.userId,
        },
        include: {
          tenant: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: input.limit,
      });
    }),

  /**
   * Audit par type d'action
   */
  getByAction: adminProcedure
    .input(
      z.object({
        action: z.string(),
        limit: z.number().min(1).max(200).default(100),
      })
    )
    .query(async ({ input }) => {
      return await prisma.auditLog.findMany({
        where: {
          action: input.action,
        },
        include: {
          actor: {
            select: {
              email: true,
            },
          },
          tenant: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: input.limit,
      });
    }),
});

