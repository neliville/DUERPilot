# Implémentation Complète : Système de Rôles et Permissions

## 📋 Résumé

Implémentation complète du système de rôles et permissions selon la matrice définie dans `docs/matrice-permissions-roles-duerpilot.md`.

**Date d'implémentation :** Janvier 2026  
**Statut :** ✅ Terminé - Backend complet, Frontend partiellement finalisé

---

## 🔄 Migration des Rôles

### Anciens rôles → Nouveaux rôles

| Ancien | Nouveau | Description |
|--------|---------|-------------|
| `super_admin` | `super_admin` | ÉDITEUR (DDWIN Solutions) - Inchangé |
| `admin_tenant` | `admin` | ADMINISTRATEUR |
| `manager` | `site_manager` | RESPONSABLE DE SITE |
| `operator` | `observer` | OBSERVATEUR |
| `auditor` | `auditor` | AUDITEUR (externe temporaire) |
| - | `owner` | PROPRIÉTAIRE (nouveau) |
| - | `representative` | REPRÉSENTANT (CSE/CSSCT) - Nouveau |
| - | `qse` | RESPONSABLE QSE - Inchangé |

### Rôles finaux (8 rôles)

1. **super_admin** - ÉDITEUR (DDWIN Solutions)
2. **owner** - PROPRIÉTAIRE (souscripteur)
3. **admin** - ADMINISTRATEUR
4. **qse** - RESPONSABLE QSE
5. **site_manager** - RESPONSABLE DE SITE
6. **representative** - REPRÉSENTANT (CSE/CSSCT)
7. **observer** - OBSERVATEUR
8. **auditor** - AUDITEUR (externe temporaire)

---

## 🗄️ Modifications Base de Données

### Schema Prisma (`prisma/schema.prisma`)

#### Model `Tenant`
```prisma
model Tenant {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  ownerId   String?  // Nouveau : ID du propriétaire
  // ... autres champs
  owner     UserProfile? @relation("TenantOwner", fields: [ownerId], references: [id])
  users     UserProfile[] @relation("TenantUsers")
}
```

#### Model `UserProfile`
```prisma
model UserProfile {
  id                      String                      @id @default(cuid())
  tenantId                String
  email                   String                      @unique
  roles                   String[]                    // Valeurs : owner, admin, qse, site_manager, representative, observer, auditor
  isOwner                 Boolean                     @default(false) // Nouveau
  scopeSites              String[]                    @default([]) // Nouveau : IDs des sites accessibles
  accessExpiry            DateTime?                   // Nouveau : Pour auditor
  invitedBy               String?                     // Nouveau : ID de l'inviteur
  // ... autres champs
  tenant                  Tenant                      @relation("TenantUsers", fields: [tenantId], references: [id])
  ownedTenant             Tenant?                     @relation("TenantOwner")
  inviter                 UserProfile?                @relation("UserInvitations", fields: [invitedBy], references: [id])
  invitedUsers            UserProfile[]               @relation("UserInvitations")
}
```

#### Nouveau Model `OwnershipTransferRequest`
```prisma
model OwnershipTransferRequest {
  id              String   @id @default(cuid())
  tenantId        String
  currentOwnerId  String
  newOwnerId      String
  token           String   @unique
  status          String   @default("pending") // pending, accepted, rejected, expired
  expiresAt       DateTime
  createdAt       DateTime @default(now())
  acceptedAt      DateTime?
  
  currentOwner    UserProfile @relation("OwnershipTransferCurrentOwner", fields: [currentOwnerId], references: [id])
  newOwner        UserProfile @relation("OwnershipTransferNewOwner", fields: [newOwnerId], references: [id])
  tenant          Tenant       @relation(fields: [tenantId], references: [id])
}
```

---

## 🔧 Middlewares tRPC

### Fichier : `server/api/trpc.ts`

#### Middlewares ajoutés/modifiés :

1. **`ownerProcedure`** - Vérifie que l'utilisateur est propriétaire
2. **`checkSiteScope(siteId)`** - Vérifie le scope pour site_manager/observer
3. **`checkAuditorExpiry`** - Vérifie l'expiration des auditors (intégré dans `protectedProcedure`)
4. **`createRoleMiddleware`** - Mis à jour pour supporter la compatibilité ascendante

---

## 📚 Matrice de Permissions

### Fichier : `lib/permissions.ts`

Matrice complète des permissions par rôle, selon `docs/matrice-permissions-roles-duerpilot.md`.

**Fonction principale :**
```typescript
hasPermission(userRoles, isOwner, resource, action, scopeCheck?)
```

**Ressources couvertes :**
- `facturation`, `users`, `organization`, `referentiels`
- `evaluations`, `imports`, `ai`
- `actions`, `observations`, `exports`
- `conformite`, `api`, `parameters`, `auditors`

---

## 🔄 Synchronisation ScopeSites

### Fichier : `lib/user-scope.ts`

**Synchronisation automatique pour OBSERVATEURS uniquement :**

Quand on assigne des unités de travail à un observer, `scopeSites` se met à jour automatiquement avec les sites de ces unités.

**Fonction :**
```typescript
syncScopeSitesForObserver(userId: string): Promise<boolean>
```

**Intégration :** Dans `server/api/routers/workUnits.ts` → `assignUsers`

---

## 🛠️ Routers API

### Routers mis à jour avec permissions et filtrage

#### ✅ **server/api/routers/auth.ts**
- Création automatique du propriétaire lors de l'inscription
- Premier utilisateur = `owner` avec `isOwner = true`
- Lien `ownerId` dans Tenant

#### ✅ **server/api/routers/users.ts** (Nouveau)
Endpoints :
- `inviteUser` - Inviter un utilisateur permanent
- `inviteAuditor` - Inviter un auditor externe temporaire
- `updateUserRole` - Modifier le rôle d'un utilisateur
- `revokeUser` - Révoquer un utilisateur
- `requestOwnershipTransfer` - Demander le transfert de propriété (Étape 1)
- `confirmOwnershipTransfer` - Confirmer le transfert (Étape 2 - Double validation)
- `assignSitesToUser` - Assigner des sites à un site_manager/observer
- `getAll` - Récupérer tous les utilisateurs du tenant (filtré selon rôle)

#### ✅ **server/api/routers/observations.ts**
- Filtrage par scope dans `getAll` (site_manager, observer)
- Representative voit TOUTES les observations du tenant
- Observer ne voit que ses propres observations (`submittedById`)
- Permissions dans `create`, `update`, `delete`, `updateStatus`
- Auditor ne peut pas créer/modifier

#### ✅ **server/api/routers/actionPlans.ts**
- Filtrage par scope dans `getAll`
- Vérification scope pour site_manager dans `create`/`update`
- Permissions dans `create`, `update`, `delete`
- Auditor ne peut pas créer/modifier

#### ✅ **server/api/routers/sites.ts**
- Permissions dans `create`, `update`, `delete`
- Seuls owner/admin peuvent créer/modifier/supprimer

#### ✅ **server/api/routers/companies.ts**
- Permissions dans `create`, `update`, `delete`, `createWithMainSite`
- Seuls owner/admin peuvent créer/modifier/supprimer

#### ✅ **server/api/routers/riskAssessments.ts**
- Filtrage par scope dans `getAll`
- Vérification scope pour site_manager dans `create`/`update`
- Permissions dans `create`, `update`, `delete`
- Representative, observer, auditor ne peuvent pas créer/modifier

#### ✅ **server/api/routers/workUnits.ts**
- Filtrage par scope dans `getAll` (déjà présent)
- Vérification scope pour site_manager dans `create`/`update`
- Permissions dans `create`, `update`, `delete`
- Synchronisation automatique `scopeSites` pour observers dans `assignUsers`

---

## 🎨 Composants Frontend

### Guards créés

#### ✅ **components/guards/owner-guard.tsx**
Protège les routes réservées au propriétaire.

#### ✅ **components/guards/role-guard.tsx**
Protège les routes par rôle (générique).

#### ✅ **components/permissions/permission-checker.tsx**
Hook `useHasPermission` et composant `PermissionChecker` pour vérifier les permissions.

### Sidebar mise à jour

#### ✅ **components/dashboard/sidebar-new.tsx**
- Récupération de `userProfile` via tRPC
- Filtrage des items selon les permissions
- Badge "PROPRIÉTAIRE" si `isOwner`
- Badge "Auditeur" avec date d'expiration si `auditor`
- Masquage automatique des items non accessibles

---

## 📝 Script de Migration

### Fichier : `scripts/migrate-roles-to-new-system.ts`

**Fonctionnalités :**
- Mapping des anciens rôles vers les nouveaux
- Identification automatique du premier utilisateur de chaque tenant comme `owner`
- Définition de `isOwner = true` et `ownerId` dans Tenant
- Migration des rôles :
  - `admin_tenant` → `admin`
  - `manager` → `site_manager`
  - `operator` → `observer`
  - `auditor` → `auditor` (inchangé)

**Usage :**
```bash
pnpm tsx scripts/migrate-roles-to-new-system.ts
```

---

## 📊 Disponibilité des Rôles par Plan

### Fichier : `lib/plans.ts`

```typescript
export const PLAN_AVAILABLE_ROLES: Record<Plan, UserRole[]> = {
  free: ['owner', 'admin'], // Mode découverte - owner peut agir comme admin
  essentiel: ['owner', 'admin', 'representative', 'observer'],
  pro: ['owner', 'admin', 'qse', 'site_manager', 'representative', 'observer', 'auditor'],
  expert: ['owner', 'admin', 'qse', 'site_manager', 'representative', 'observer', 'auditor'],
  entreprise: ['owner', 'admin', 'qse', 'site_manager', 'representative', 'observer', 'auditor'],
};
```

**Plan FREE :**
- Pas d'invitation possible (1 seul utilisateur max)
- Propriétaire agit automatiquement comme admin

---

## 🔐 Transfert de Propriété

### Système de double validation

**Étape 1 :** `requestOwnershipTransfer`
- L'ancien owner initie le transfert avec son mot de passe
- Création d'une `OwnershipTransferRequest` avec token
- Email envoyé au nouveau owner (TODO)

**Étape 2 :** `confirmOwnershipTransfer`
- Le nouveau owner confirme avec le token reçu
- Transaction atomique : mise à jour des deux users + tenant
- Emails de notification envoyés (TODO)

---

## ✅ Validations et Règles Métier

### Plan FREE
- ❌ Pas d'invitation d'utilisateurs
- ✅ Propriétaire = admin automatiquement

### Representative
- ✅ Voir TOUTES les observations du tenant (pas seulement son site)

### Observer
- ✅ Synchronisation automatique `scopeSites` depuis `assignedWorkUnits`
- ✅ Ne voit que ses propres observations

### Auditor
- ❌ Ne peut pas créer/modifier (lecture seule + commentaires)
- ❌ Pas d'accès IA (coût maîtrisé)
- ⏰ Accès temporaire avec expiration

### Site Manager
- 🟡 Scope limité : seulement son périmètre (`scopeSites`)
- ✅ Peut créer/modifier dans son périmètre

---

## 🚀 Prochaines Étapes

### À finaliser

1. **Documentation** :
   - Guide de gestion des rôles utilisateurs
   - Mise à jour de l'architecture
   - Documentation des permissions

2. **Frontend** :
   - Utiliser les guards dans les pages nécessaires
   - Masquer/désactiver les boutons selon les permissions
   - Afficher les indicateurs de scope pour site_manager/observer

3. **Tests** :
   - Tests unitaires pour les middlewares
   - Tests E2E pour les flux de permissions
   - Tests de la synchronisation scopeSites

4. **Emails** :
   - Template invitation utilisateur
   - Template invitation auditor
   - Template transfert de propriété
   - Notification de confirmation de transfert

---

## 📋 Fichiers Modifiés/Créés

### Backend
- ✅ `prisma/schema.prisma` - Modifié
- ✅ `types/index.ts` - Modifié (UserRole)
- ✅ `server/api/trpc.ts` - Modifié (middlewares)
- ✅ `server/api/routers/auth.ts` - Modifié
- ✅ `server/api/routers/users.ts` - **Nouveau**
- ✅ `server/api/routers/observations.ts` - Modifié
- ✅ `server/api/routers/actionPlans.ts` - Modifié
- ✅ `server/api/routers/sites.ts` - Modifié
- ✅ `server/api/routers/companies.ts` - Modifié
- ✅ `server/api/routers/riskAssessments.ts` - Modifié
- ✅ `server/api/routers/workUnits.ts` - Modifié

### Utilitaires
- ✅ `lib/permissions.ts` - **Nouveau** (matrice de permissions)
- ✅ `lib/user-scope.ts` - **Nouveau** (synchronisation scopeSites)
- ✅ `lib/plans.ts` - Modifié (PLAN_AVAILABLE_ROLES)

### Frontend
- ✅ `components/guards/owner-guard.tsx` - **Nouveau**
- ✅ `components/guards/role-guard.tsx` - **Nouveau**
- ✅ `components/permissions/permission-checker.tsx` - **Nouveau**
- ✅ `components/dashboard/sidebar-new.tsx` - Modifié

### Scripts
- ✅ `scripts/migrate-roles-to-new-system.ts` - **Nouveau**

### Documentation
- ✅ `docs/ROLES_PERMISSIONS_IMPLEMENTATION.md` - **Nouveau** (ce fichier)

---

## 🎯 Points Importants

### Compatibilité Ascendante

Tous les middlewares et fonctions supportent la compatibilité ascendante :
- Mapping automatique des anciens rôles vers les nouveaux
- Vérification des deux noms (ancien ET nouveau) pendant la transition

### Sécurité

- **Toujours vérifier côté backend** (jamais seulement frontend)
- Logger les tentatives d'accès refusé
- Vérifier l'expiration auditor à chaque requête
- Empêcher l'auto-élévation de privilèges

### Performance

- Index sur `isOwner`, `accessExpiry`, `invitedBy` dans UserProfile
- Index sur `ownerId`, `token`, `status` dans OwnershipTransferRequest
- Filtrage par scope au niveau Prisma (efficace)

---

## ✅ Validation

### Tests Manuels Recommandés

1. ✅ Création d'un utilisateur → Vérifier qu'il devient owner
2. ✅ Invitation d'un utilisateur avec rôle site_manager
3. ✅ Assignation d'unités à un observer → Vérifier synchronisation scopeSites
4. ✅ Tentative d'accès refusé selon les rôles
5. ✅ Transfert de propriété avec double validation
6. ✅ Expiration d'un auditor → Vérifier blocage d'accès
7. ✅ Filtrage par scope dans les listes (site_manager, observer)

---

## 📚 Références

- Matrice de permissions : `docs/matrice-permissions-roles-duerpilot.md`
- Architecture : `docs/architecture/README.md`
- Plans tarifaires : `docs/plans-tarifs/README.md`

---

**Version :** 1.0  
**Date :** Janvier 2026  
**Statut :** ✅ Backend complet, Frontend partiellement finalisé
