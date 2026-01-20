/**
 * Router admin pour la gestion des documents légaux
 * CGU, Mentions légales, Politique de confidentialité
 */

import { createTRPCRouter, adminProcedure } from '../../trpc';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { marked } from 'marked';

const legalDocumentTypes = ['cgu', 'mentions-legales', 'politique-confidentialite'] as const;
type LegalDocumentType = typeof legalDocumentTypes[number];

export const legalDocumentsRouter = createTRPCRouter({
  /**
   * Récupérer tous les documents légaux
   */
  getAll: adminProcedure.query(async () => {
    const documents = await prisma.legalDocument.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        updatedByUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return documents;
  }),

  /**
   * Récupérer un document légal par type
   */
  getByType: adminProcedure
    .input(z.enum(legalDocumentTypes))
    .query(async ({ input }) => {
      const document = await prisma.legalDocument.findUnique({
        where: { type: input },
        include: {
          updatedByUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return document;
    }),

  /**
   * Créer ou mettre à jour un document légal (avec versioning)
   */
  upsert: adminProcedure
    .input(
      z.object({
        type: z.enum(legalDocumentTypes),
        title: z.string().min(1, 'Le titre est requis'),
        content: z.string().min(1, 'Le contenu est requis'),
        changeNote: z.string().optional(), // Note de changement pour cette version
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Utilisateur non authentifié',
        });
      }

      // Convertir markdown en HTML
      const htmlContent = await marked(input.content);

      // Vérifier si le document existe
      const existing = await prisma.legalDocument.findUnique({
        where: { type: input.type },
        include: {
          versions: {
            orderBy: { version: 'desc' },
            take: 1,
          },
        },
      });

      const nextVersion = existing
        ? (existing.versions[0]?.version || existing.currentVersion) + 1
        : 1;

      // Créer ou mettre à jour le document
      const document = await prisma.legalDocument.upsert({
        where: { type: input.type },
        create: {
          type: input.type,
          title: input.title,
          content: input.content,
          htmlContent,
          currentVersion: 1,
          updatedBy: userId,
          versions: {
            create: {
              version: 1,
              title: input.title,
              content: input.content,
              htmlContent,
              updatedBy: userId,
              changeNote: input.changeNote || 'Version initiale',
            },
          },
        },
        update: {
          title: input.title,
          content: input.content,
          htmlContent,
          currentVersion: nextVersion,
          updatedBy: userId,
          versions: {
            create: {
              version: nextVersion,
              title: input.title,
              content: input.content,
              htmlContent,
              updatedBy: userId,
              changeNote: input.changeNote || `Mise à jour version ${nextVersion}`,
            },
          },
        },
      });

      return document;
    }),

  /**
   * Récupérer l'historique des versions d'un document
   */
  getVersions: adminProcedure
    .input(z.enum(legalDocumentTypes))
    .query(async ({ input }) => {
      const document = await prisma.legalDocument.findUnique({
        where: { type: input },
      });

      if (!document) {
        return [];
      }

      const versions = await prisma.legalDocumentVersion.findMany({
        where: { documentId: document.id },
        orderBy: { version: 'desc' },
        include: {
          updatedByUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return versions;
    }),

  /**
   * Récupérer une version spécifique d'un document
   */
  getVersion: adminProcedure
    .input(
      z.object({
        type: z.enum(legalDocumentTypes),
        version: z.number().int().positive(),
      })
    )
    .query(async ({ input }) => {
      // D'abord récupérer le document pour avoir son ID
      const document = await prisma.legalDocument.findUnique({
        where: { type: input.type },
      });

      if (!document) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document non trouvé',
        });
      }

      const version = await prisma.legalDocumentVersion.findUnique({
        where: {
          documentId_version: {
            documentId: document.id,
            version: input.version,
          },
        },
        include: {
          updatedByUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!version) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Version ${input.version} non trouvée pour ce document`,
        });
      }

      return version;
    }),

  /**
   * Restaurer une version précédente (crée une nouvelle version basée sur l'ancienne)
   */
  restoreVersion: adminProcedure
    .input(
      z.object({
        type: z.enum(legalDocumentTypes),
        version: z.number().int().positive(),
        changeNote: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Utilisateur non authentifié',
        });
      }

      // D'abord récupérer le document pour avoir son ID
      const document = await prisma.legalDocument.findUnique({
        where: { type: input.type },
        include: {
          versions: {
            orderBy: { version: 'desc' },
            take: 1,
          },
        },
      });

      if (!document) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document non trouvé',
        });
      }

      // Récupérer la version à restaurer
      const versionToRestore = await prisma.legalDocumentVersion.findUnique({
        where: {
          documentId_version: {
            documentId: document.id,
            version: input.version,
          },
        },
      });

      if (!versionToRestore) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Version ${input.version} non trouvée`,
        });
      }

      const nextVersion = document
        ? (document.versions[0]?.version || document.currentVersion) + 1
        : 1;

      // Restaurer la version (créer une nouvelle version avec le contenu de l'ancienne)
      const restoredDocument = await prisma.legalDocument.update({
        where: { type: input.type },
        data: {
          title: versionToRestore.title,
          content: versionToRestore.content,
          htmlContent: versionToRestore.htmlContent,
          currentVersion: nextVersion,
          updatedBy: userId,
          versions: {
            create: {
              version: nextVersion,
              title: versionToRestore.title,
              content: versionToRestore.content,
              htmlContent: versionToRestore.htmlContent,
              updatedBy: userId,
              changeNote:
                input.changeNote ||
                `Restauration de la version ${input.version}`,
            },
          },
        },
      });

      return restoredDocument;
    }),

  /**
   * Supprimer un document légal (avec confirmation)
   */
  delete: adminProcedure
    .input(z.enum(legalDocumentTypes))
    .mutation(async ({ input }) => {
      await prisma.legalDocument.delete({
        where: { type: input },
      });

      return { success: true };
    }),
});

