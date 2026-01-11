import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const dangerCategoriesRouter = createTRPCRouter({
  /**
   * Récupère toutes les catégories de dangers
   */
  getAll: authenticatedProcedure.query(async ({ ctx }) => {
    const categories = await ctx.prisma.dangerCategory.findMany({
      orderBy: { order: 'asc' },
    });

    return categories;
  }),

  /**
   * Récupère une catégorie par son ID
   */
  getById: authenticatedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.prisma.dangerCategory.findUnique({
        where: { id: input.id },
      });

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Catégorie de danger non trouvée',
        });
      }

      return category;
    }),

  /**
   * Récupère une catégorie par son code
   */
  getByCode: authenticatedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.prisma.dangerCategory.findUnique({
        where: { code: input.code },
      });

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Catégorie de danger non trouvée',
        });
      }

      return category;
    }),

  /**
   * Récupère les catégories pertinentes pour un secteur
   * (via les situations dangereuses suggérées pour ce secteur)
   */
  getBySector: authenticatedProcedure
    .input(z.object({ sectorCode: z.string() }))
    .query(async ({ ctx, input }) => {
      // Trouver les situations dangereuses suggérées pour ce secteur
      const situations = await ctx.prisma.dangerousSituation.findMany({
        where: {
          OR: [
            { suggestedSector: input.sectorCode },
            { suggestedSector: null }, // Situations communes
          ],
          OR: [
            { tenantId: null },
            { tenantId: ctx.tenantId },
          ],
        },
        select: {
          categoryId: true,
        },
        distinct: ['categoryId'],
      });

      const categoryIds = situations.map(s => s.categoryId);

      if (categoryIds.length === 0) {
        // Si aucune situation spécifique, retourner toutes les catégories
        return await ctx.prisma.dangerCategory.findMany({
          orderBy: { order: 'asc' },
        });
      }

      const categories = await ctx.prisma.dangerCategory.findMany({
        where: {
          id: { in: categoryIds },
        },
        orderBy: { order: 'asc' },
      });

      return categories;
    }),
});

