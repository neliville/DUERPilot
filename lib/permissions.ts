/**
 * Matrice de permissions pour les rôles utilisateur
 * Basée sur la matrice complète définie dans docs/matrice-permissions-roles-duerpilot.md
 * 
 * Types de permissions :
 * - 'full' : Accès complet
 * - 'limited' : Accès limité/conditionnel (scope, propre créations, etc.)
 * - 'none' : Pas d'accès
 */

import type { UserRole } from '@/types';

export type PermissionLevel = 'full' | 'limited' | 'none';

export interface PermissionMatrix {
  [role: string]: {
    [resource: string]: {
      [action: string]: PermissionLevel;
    };
  };
}

/**
 * Matrice complète des permissions par rôle
 */
export const PERMISSIONS_MATRIX: PermissionMatrix = {
  owner: {
    facturation: {
      manage: 'full',
      view: 'full',
      change_plan: 'full',
      transfer: 'full',
      delete_account: 'full',
    },
    users: {
      invite: 'full',
      modify_all_roles: 'full',
      revoke: 'full',
      view_all: 'full',
    },
    organization: {
      create: 'full',
      modify: 'full',
      delete: 'full',
      view: 'full',
    },
    referentiels: {
      create: 'full',
      modify: 'full',
      delete: 'full',
      view: 'full',
    },
    evaluations: {
      create_all: 'full',
      create_scope: 'full',
      modify_all: 'full',
      modify_scope: 'full',
      delete: 'full',
      view_all: 'full',
      view_scope: 'full',
      comment: 'full',
    },
    imports: {
      duerp: 'full',
    },
    ai: {
      suggest_risks: 'full',
      suggest_actions: 'full',
      reformulate: 'full',
    },
    actions: {
      create_all: 'full',
      create_scope: 'full',
      modify_all: 'full',
      modify_scope: 'full',
      assign: 'full',
      view_all: 'full',
      view_scope: 'full',
      view_assigned: 'full',
      close: 'full',
      suggest: 'full',
    },
    observations: {
      create: 'full',
      modify_own: 'full',
      modify_all: 'full',
      assign: 'full',
      view_all: 'full',
      view_scope: 'full',
      view_own: 'full',
      close: 'full',
    },
    exports: {
      pdf: 'full',
      word: 'full',
      excel: 'full',
    },
    conformite: {
      view_all: 'full',
      view_scope: 'full',
      validate: 'full',
      download_reports: 'full',
    },
    api: {
      generate_keys: 'full',
      use: 'full',
    },
    parameters: {
      company: 'full',
      personal: 'full',
      notifications: 'full',
    },
    auditors: {
      invite: 'full',
    },
  },

  admin: {
    facturation: {
      manage: 'none',
      view: 'full',
      change_plan: 'none',
      transfer: 'none',
      delete_account: 'none',
    },
    users: {
      invite: 'full',
      modify_all_roles: 'limited', // Sauf ADMIN
      revoke: 'limited', // Sauf ADMIN
      view_all: 'full',
    },
    organization: {
      create: 'full',
      modify: 'full',
      delete: 'full',
      view: 'full',
    },
    referentiels: {
      create: 'full',
      modify: 'full',
      delete: 'full',
      view: 'full',
    },
    evaluations: {
      create_all: 'full',
      create_scope: 'full',
      modify_all: 'full',
      modify_scope: 'full',
      delete: 'full',
      view_all: 'full',
      view_scope: 'full',
      comment: 'full',
    },
    imports: {
      duerp: 'full',
    },
    ai: {
      suggest_risks: 'full',
      suggest_actions: 'full',
      reformulate: 'full',
    },
    actions: {
      create_all: 'full',
      create_scope: 'full',
      modify_all: 'full',
      modify_scope: 'full',
      assign: 'full',
      view_all: 'full',
      view_scope: 'full',
      view_assigned: 'full',
      close: 'full',
      suggest: 'full',
    },
    observations: {
      create: 'full',
      modify_own: 'full',
      modify_all: 'full',
      assign: 'full',
      view_all: 'full',
      view_scope: 'full',
      view_own: 'full',
      close: 'full',
    },
    exports: {
      pdf: 'full',
      word: 'full',
      excel: 'full',
    },
    conformite: {
      view_all: 'full',
      view_scope: 'full',
      validate: 'full',
      download_reports: 'full',
    },
    api: {
      generate_keys: 'full',
      use: 'full',
    },
    parameters: {
      company: 'full',
      personal: 'full',
      notifications: 'full',
    },
    auditors: {
      invite: 'full',
    },
  },

  qse: {
    facturation: {
      manage: 'none',
      view: 'none',
      change_plan: 'none',
      transfer: 'none',
      delete_account: 'none',
    },
    users: {
      invite: 'none',
      modify_all_roles: 'none',
      revoke: 'none',
      view_all: 'full',
    },
    organization: {
      create: 'none',
      modify: 'none',
      delete: 'none',
      view: 'full',
    },
    referentiels: {
      create: 'full',
      modify: 'full',
      delete: 'full',
      view: 'full',
    },
    evaluations: {
      create_all: 'full',
      create_scope: 'none',
      modify_all: 'full',
      modify_scope: 'none',
      delete: 'full',
      view_all: 'full',
      view_scope: 'full',
      comment: 'full',
    },
    imports: {
      duerp: 'full',
    },
    ai: {
      suggest_risks: 'full',
      suggest_actions: 'full',
      reformulate: 'full',
    },
    actions: {
      create_all: 'full',
      create_scope: 'none',
      modify_all: 'full',
      modify_scope: 'none',
      assign: 'full',
      view_all: 'full',
      view_scope: 'full',
      view_assigned: 'full',
      close: 'full',
      suggest: 'full',
    },
    observations: {
      create: 'full',
      modify_own: 'full',
      modify_all: 'full',
      assign: 'full',
      view_all: 'full',
      view_scope: 'full',
      view_own: 'full',
      close: 'full',
    },
    exports: {
      pdf: 'full',
      word: 'full',
      excel: 'full',
    },
    conformite: {
      view_all: 'full',
      view_scope: 'full',
      validate: 'full',
      download_reports: 'full',
    },
    api: {
      generate_keys: 'none',
      use: 'full',
    },
    parameters: {
      company: 'none',
      personal: 'full',
      notifications: 'full',
    },
    auditors: {
      invite: 'full',
    },
  },

  site_manager: {
    facturation: {
      manage: 'none',
      view: 'none',
      change_plan: 'none',
      transfer: 'none',
      delete_account: 'none',
    },
    users: {
      invite: 'none',
      modify_all_roles: 'none',
      revoke: 'none',
      view_all: 'limited', // Son périmètre
    },
    organization: {
      create: 'none',
      modify: 'none',
      delete: 'none',
      view: 'limited', // Son périmètre
    },
    referentiels: {
      create: 'none',
      modify: 'none',
      delete: 'none',
      view: 'full',
    },
    evaluations: {
      create_all: 'none',
      create_scope: 'full', // Son site
      modify_all: 'none',
      modify_scope: 'full', // Son site
      delete: 'none',
      view_all: 'none',
      view_scope: 'full', // Son site
      comment: 'full',
    },
    imports: {
      duerp: 'none',
    },
    ai: {
      suggest_risks: 'full',
      suggest_actions: 'full',
      reformulate: 'full',
    },
    actions: {
      create_all: 'none',
      create_scope: 'full', // Son site
      modify_all: 'none',
      modify_scope: 'full', // Son site
      assign: 'limited', // Dans son site
      view_all: 'none',
      view_scope: 'full', // Son site
      view_assigned: 'none',
      close: 'limited', // Assignées
      suggest: 'full',
    },
    observations: {
      create: 'full',
      modify_own: 'full',
      modify_all: 'none',
      assign: 'limited', // Dans son site
      view_all: 'none',
      view_scope: 'limited', // Son site
      view_own: 'full',
      close: 'limited', // Son site
    },
    exports: {
      pdf: 'limited', // Son périmètre
      word: 'limited', // Son périmètre
      excel: 'limited', // Son périmètre
    },
    conformite: {
      view_all: 'none',
      view_scope: 'full', // Son site
      validate: 'none',
      download_reports: 'limited', // Son site
    },
    api: {
      generate_keys: 'none',
      use: 'none',
    },
    parameters: {
      company: 'none',
      personal: 'full',
      notifications: 'full',
    },
    consultants: {
      invite: 'none',
    },
  },

  representative: {
    facturation: {
      manage: 'none',
      view: 'none',
      change_plan: 'none',
      transfer: 'none',
      delete_account: 'none',
    },
    users: {
      invite: 'none',
      modify_all_roles: 'none',
      revoke: 'none',
      view_all: 'none',
    },
    organization: {
      create: 'none',
      modify: 'none',
      delete: 'none',
      view: 'full',
    },
    referentiels: {
      create: 'none',
      modify: 'none',
      delete: 'none',
      view: 'full',
    },
    evaluations: {
      create_all: 'none',
      create_scope: 'none',
      modify_all: 'none',
      modify_scope: 'none',
      delete: 'none',
      view_all: 'full', // Consultation complète (obligation légale L2312-5)
      view_scope: 'full',
      comment: 'full',
    },
    imports: {
      duerp: 'none',
    },
    ai: {
      suggest_risks: 'none',
      suggest_actions: 'none',
      reformulate: 'none',
    },
    actions: {
      create_all: 'none',
      create_scope: 'none',
      modify_all: 'none',
      modify_scope: 'none',
      assign: 'none',
      view_all: 'full',
      view_scope: 'full',
      view_assigned: 'full',
      close: 'none',
      suggest: 'full',
    },
    observations: {
      create: 'full',
      modify_own: 'full',
      modify_all: 'none',
      assign: 'none',
      view_all: 'full',
      view_scope: 'full',
      view_own: 'full',
      close: 'limited', // Siennes
    },
    exports: {
      pdf: 'full',
      word: 'full',
      excel: 'full',
    },
    conformite: {
      view_all: 'full',
      view_scope: 'full',
      validate: 'none',
      download_reports: 'full',
    },
    api: {
      generate_keys: 'none',
      use: 'none',
    },
    parameters: {
      company: 'none',
      personal: 'full',
      notifications: 'full',
    },
    consultants: {
      invite: 'none',
    },
  },

  observer: {
    facturation: {
      manage: 'none',
      view: 'none',
      change_plan: 'none',
      transfer: 'none',
      delete_account: 'none',
    },
    users: {
      invite: 'none',
      modify_all_roles: 'none',
      revoke: 'none',
      view_all: 'none',
    },
    organization: {
      create: 'none',
      modify: 'none',
      delete: 'none',
      view: 'none',
    },
    referentiels: {
      create: 'none',
      modify: 'none',
      delete: 'none',
      view: 'full',
    },
    evaluations: {
      create_all: 'none',
      create_scope: 'none',
      modify_all: 'none',
      modify_scope: 'none',
      delete: 'none',
      view_all: 'none',
      view_scope: 'limited', // Son périmètre (lecture seule)
      comment: 'none',
    },
    imports: {
      duerp: 'none',
    },
    ai: {
      suggest_risks: 'none',
      suggest_actions: 'none',
      reformulate: 'none',
    },
    actions: {
      create_all: 'none',
      create_scope: 'none',
      modify_all: 'none',
      modify_scope: 'none',
      assign: 'none',
      view_all: 'none',
      view_scope: 'none',
      view_assigned: 'full', // Actions assignées
      close: 'limited', // Assignées
      suggest: 'none',
    },
    observations: {
      create: 'full',
      modify_own: 'full',
      modify_all: 'none',
      assign: 'none',
      view_all: 'none',
      view_scope: 'none',
      view_own: 'limited', // Siennes
      close: 'limited', // Siennes
    },
    exports: {
      pdf: 'none',
      word: 'none',
      excel: 'none',
    },
    conformite: {
      view_all: 'none',
      view_scope: 'limited', // Son périmètre
      validate: 'none',
      download_reports: 'none',
    },
    api: {
      generate_keys: 'none',
      use: 'none',
    },
    parameters: {
      company: 'none',
      personal: 'full',
      notifications: 'full',
    },
    consultants: {
      invite: 'none',
    },
  },

  auditor: {
    facturation: {
      manage: 'none',
      view: 'none',
      change_plan: 'none',
      transfer: 'none',
      delete_account: 'none',
    },
    users: {
      invite: 'none',
      modify_all_roles: 'none',
      revoke: 'none',
      view_all: 'none',
    },
    organization: {
      create: 'none',
      modify: 'none',
      delete: 'none',
      view: 'full',
    },
    referentiels: {
      create: 'none',
      modify: 'none',
      delete: 'none',
      view: 'full',
    },
    evaluations: {
      create_all: 'none',
      create_scope: 'none',
      modify_all: 'none',
      modify_scope: 'none',
      delete: 'none',
      view_all: 'full', // Lecture seule
      view_scope: 'full',
      comment: 'full',
    },
    imports: {
      duerp: 'none',
    },
    ai: {
      suggest_risks: 'none', // Pas d'accès IA (coût maîtrisé)
      suggest_actions: 'none',
      reformulate: 'none',
    },
    actions: {
      create_all: 'none',
      create_scope: 'none',
      modify_all: 'none',
      modify_scope: 'none',
      assign: 'none',
      view_all: 'full', // Lecture seule
      view_scope: 'full',
      view_assigned: 'full',
      close: 'none',
      suggest: 'full',
    },
    observations: {
      create: 'none',
      modify_own: 'none',
      modify_all: 'none',
      assign: 'none',
      view_all: 'full', // Lecture seule
      view_scope: 'full',
      view_own: 'full',
      close: 'none',
    },
    exports: {
      pdf: 'full',
      word: 'full',
      excel: 'full',
    },
    conformite: {
      view_all: 'full',
      view_scope: 'full',
      validate: 'none',
      download_reports: 'full',
    },
    api: {
      generate_keys: 'none',
      use: 'none',
    },
    parameters: {
      company: 'none',
      personal: 'full',
      notifications: 'full',
    },
    consultants: {
      invite: 'none',
    },
  },
};

/**
 * Vérifie si un utilisateur a la permission pour une action sur une ressource
 * 
 * @param userRoles - Liste des rôles de l'utilisateur
 * @param isOwner - Indique si l'utilisateur est propriétaire
 * @param resource - Ressource concernée (ex: 'evaluations', 'actions')
 * @param action - Action à effectuer (ex: 'create', 'modify', 'view')
 * @param scopeCheck - Fonction optionnelle pour vérifier le scope (retourne true si accès autorisé)
 * 
 * @returns true si l'utilisateur a la permission, false sinon
 */
export function hasPermission(
  userRoles: string[],
  isOwner: boolean,
  resource: string,
  action: string,
  scopeCheck?: () => boolean
): boolean {
  // Le propriétaire a tous les droits
  if (isOwner) {
    return true;
  }

  // Normaliser les rôles (compatibilité ascendante)
  const normalizedRoles = userRoles.map((role) => {
    const mapping: Record<string, string> = {
      admin_tenant: 'admin',
      manager: 'site_manager',
      operator: 'observer',
      consultant: 'auditor', // Ancien nom → nouveau nom
    };
    return mapping[role] || role;
  });

  // Vérifier chaque rôle de l'utilisateur
  for (const role of normalizedRoles) {
    const rolePermissions = PERMISSIONS_MATRIX[role];
    if (!rolePermissions) continue;

    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions) continue;

    const permissionLevel = resourcePermissions[action];
    if (!permissionLevel || permissionLevel === 'none') continue;

    // Si 'full', autoriser
    if (permissionLevel === 'full') {
      return true;
    }

    // Si 'limited', vérifier le scope si fourni
    if (permissionLevel === 'limited') {
      if (scopeCheck && scopeCheck()) {
        return true;
      }
      // Si pas de scopeCheck, considérer comme refusé pour 'limited'
      continue;
    }
  }

  return false;
}

/**
 * Vérifie si un rôle peut effectuer une action sur une ressource
 */
export function canRolePerformAction(
  role: string,
  resource: string,
  action: string
): PermissionLevel {
  const rolePermissions = PERMISSIONS_MATRIX[role];
  if (!rolePermissions) return 'none';

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return 'none';

  return resourcePermissions[action] || 'none';
}

/**
 * Récupère toutes les permissions d'un rôle
 */
export function getRolePermissions(role: string): PermissionMatrix[string] | null {
  return PERMISSIONS_MATRIX[role] || null;
}
