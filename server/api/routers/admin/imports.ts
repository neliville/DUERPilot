/**
 * Router admin pour le monitoring des imports
 */

import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/lib/db';

export const importsRouter = createTRPCRouter({
  /**
   * Tous les imports avec filtres
   */
  getAll: adminProcedure
    .input(
      z.object({
        status: z.enum(['uploading', 'analyzing', 'validated', 'completed', 'failed']).optional(),
        format: z.enum(['pdf', 'word', 'excel', 'csv']).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const where: any = {};

      if (input.status) {
        where.status = input.status;
      }

      if (input.format) {
        where.format = input.format;
      }

      if (input.startDate || input.endDate) {
        where.createdAt = {
          ...(input.startDate ? { gte: input.startDate } : {}),
          ...(input.endDate ? { lte: input.endDate } : {}),
        };
      }

      const [imports, total] = await Promise.all([
        prisma.duerpImport.findMany({
          where,
          include: {
            user: {
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
        prisma.duerpImport.count({ where }),
      ]);

      return {
        imports,
        total,
      };
    }),

  /**
   * Imports d'une entreprise
   */
  getByCompany: adminProcedure
    .input(
      z.object({
        companyId: z.string().cuid(),
      })
    )
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

      return await prisma.duerpImport.findMany({
        where: { tenantId: company.tenantId },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),

  /**
   * Statistiques imports
   */
  getStats: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const where: any = {};
      if (input.startDate || input.endDate) {
        where.createdAt = {
          ...(input.startDate ? { gte: input.startDate } : {}),
          ...(input.endDate ? { lte: input.endDate } : {}),
        };
      }

      const imports = await prisma.duerpImport.findMany({
        where,
        include: {
          user: {
            select: {
              tenantId: true,
            },
          },
        },
      });

      // Grouper par format
      const byFormat = imports.reduce(
        (acc, imp) => {
          acc[imp.format] = (acc[imp.format] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Grouper par statut
      const byStatus = imports.reduce(
        (acc, imp) => {
          acc[imp.status] = (acc[imp.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Calculer temps moyen de validation (pour imports complétés)
      const completedImports = imports.filter(
        (imp) => imp.status === 'completed' && imp.updatedAt && imp.createdAt
      );
      const avgValidationTime =
        completedImports.length > 0
          ? completedImports.reduce((sum, imp) => {
              const time = imp.updatedAt.getTime() - imp.createdAt.getTime();
              return sum + time;
            }, 0) / completedImports.length
          : 0;

      // Taux d'erreurs
      const errorRate =
        imports.length > 0
          ? (imports.filter((imp) => imp.status === 'failed').length / imports.length) * 100
          : 0;

      // Taux d'abandon (uploads qui n'ont jamais été validés)
      const abandonedRate =
        imports.length > 0
          ? (imports.filter((imp) => ['uploading', 'analyzing'].includes(imp.status)).length /
            imports.length) *
            100
          : 0;

      // Nombre imports par entreprise (tenant)
      const byTenant = imports.reduce(
        (acc, imp) => {
          const tenantId = imp.user.tenantId;
          acc[tenantId] = (acc[tenantId] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        total: imports.length,
        byFormat,
        byStatus,
        avgValidationTime: Math.round(avgValidationTime / 1000 / 60), // en minutes
        errorRate: Math.round(errorRate * 100) / 100,
        abandonedRate: Math.round(abandonedRate * 100) / 100,
        byTenant,
      };
    }),

  /**
   * Imports en erreur
   */
  getErrors: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      return await prisma.duerpImport.findMany({
        where: {
          status: 'failed',
        },
        include: {
          user: {
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

