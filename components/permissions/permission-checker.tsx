'use client';

import { api } from '@/lib/trpc/client';
import { hasPermission } from '@/lib/permissions';

/**
 * Hook pour vérifier si l'utilisateur a une permission spécifique
 * 
 * @param resource - Ressource concernée (ex: 'evaluations', 'actions')
 * @param action - Action à effectuer (ex: 'create', 'modify', 'view')
 * @param scopeCheck - Fonction optionnelle pour vérifier le scope (retourne true si accès autorisé)
 * 
 * @returns true si l'utilisateur a la permission, false sinon
 */
export function useHasPermission(
  resource: string,
  action: string,
  scopeCheck?: () => boolean
): boolean {
  const { data: user } = api.auth.getCurrentUser.useQuery();

  if (!user) return false;

  const userRoles = user.roles || [];
  const isOwner = user.isOwner || false;

  return hasPermission(userRoles, isOwner, resource, action, scopeCheck);
}

/**
 * Composant conditionnel qui affiche les enfants uniquement si l'utilisateur a la permission
 */
interface PermissionCheckerProps {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  scopeCheck?: () => boolean;
}

export function PermissionChecker({
  resource,
  action,
  children,
  fallback,
  scopeCheck,
}: PermissionCheckerProps) {
  const hasPermissionValue = useHasPermission(resource, action, scopeCheck);

  if (!hasPermissionValue) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
