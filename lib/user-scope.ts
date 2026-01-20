/**
 * Fonctions utilitaires pour gérer les scopes utilisateurs
 * - scopeSites : Liste des IDs de sites accessibles (manuel ou auto-sync pour observers)
 * - assignedWorkUnits : Unités de travail assignées (relation)
 */

import { prisma } from '@/lib/db';

/**
 * Synchronise automatiquement scopeSites depuis assignedWorkUnits
 * UNIQUEMENT pour les OBSERVATEURS
 * 
 * Pour les observers, le scopeSites doit refléter les sites des unités de travail assignées
 * Pour les autres rôles (site_manager, etc.), scopeSites reste manuel
 * 
 * @param userId - ID de l'utilisateur
 * @returns true si synchronisé, false si pas nécessaire
 */
export async function syncScopeSitesForObserver(userId: string): Promise<boolean> {
  // Récupérer l'utilisateur avec ses rôles et unités assignées
  const user = await prisma.userProfile.findUnique({
    where: { id: userId },
    include: {
      assignedWorkUnits: {
        include: {
          site: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error(`Utilisateur ${userId} non trouvé`);
  }

  // Vérifier si l'utilisateur est un observer
  const userRoles = user.roles || [];
  const isObserver = userRoles.includes('observer');

  // Si ce n'est pas un observer, pas de synchronisation automatique
  if (!isObserver) {
    return false;
  }

  // Extraire les IDs de sites uniques depuis les unités de travail assignées
  const siteIds = Array.from(
    new Set(
      user.assignedWorkUnits.map((workUnit) => workUnit.site.id)
    )
  );

  // Mettre à jour scopeSites uniquement si différent
  const currentScopeSites = user.scopeSites || [];
  const sortedCurrent = [...currentScopeSites].sort();
  const sortedNew = [...siteIds].sort();

  // Vérifier si les listes sont identiques
  const isDifferent =
    sortedCurrent.length !== sortedNew.length ||
    sortedCurrent.some((id, index) => id !== sortedNew[index]);

  if (isDifferent) {
    // Mettre à jour scopeSites
    await prisma.userProfile.update({
      where: { id: userId },
      data: {
        scopeSites: siteIds,
      },
    });

    return true;
  }

  return false;
}

/**
 * Vérifie si un utilisateur a accès à un site via son scope
 * 
 * @param userRoles - Rôles de l'utilisateur
 * @param isOwner - Indique si l'utilisateur est propriétaire
 * @param scopeSites - Liste des sites accessibles
 * @param siteId - ID du site à vérifier
 * @returns true si l'utilisateur a accès, false sinon
 */
export function hasSiteAccess(
  userRoles: string[],
  isOwner: boolean,
  scopeSites: string[],
  siteId: string
): boolean {
  // Owner, admin, qse, representative, auditor : accès global
  if (isOwner) return true;

  const globalAccessRoles = ['admin', 'qse', 'representative', 'auditor'];
  if (globalAccessRoles.some((role) => userRoles.includes(role))) {
    return true;
  }

  // site_manager et observer : vérifier le scope
  const scopedRoles = ['site_manager', 'observer'];
  if (scopedRoles.some((role) => userRoles.includes(role))) {
    return scopeSites.includes(siteId);
  }

  return false;
}
