# Matrice des Permissions et Rôles - DUERPilot

**Version :** 2.0 - Janvier 2026  
**Statut :** Système de permissions complet avec 7 niveaux de rôles

---

## 🎭 Structure des Rôles (7 niveaux)

```
🏢 ÉDITEUR (DDWIN Solutions) - Super-admin système
    ↓
    └── 👑 PROPRIÉTAIRE (Owner) - Souscripteur du plan
        ├── 🔧 ADMINISTRATEUR
        ├── 🛡️ RESPONSABLE QSE
        ├── 👷 RESPONSABLE DE SITE
        ├── 👥 REPRÉSENTANT
        ├── 👀 OBSERVATEUR
        └── 🔍 CONSULTANT
```

---

## 📊 Matrice Complète des Permissions

| Fonctionnalité | PROPRIÉTAIRE | ADMINISTRATEUR | RESPONSABLE QSE | RESPONSABLE SITE | REPRÉSENTANT | OBSERVATEUR | CONSULTANT |
|----------------|--------------|----------------|-----------------|------------------|--------------|-------------|------------|
| **💳 FACTURATION & COMPTE** |
| Gérer abonnement/paiement | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Voir factures | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Changer de plan | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Transférer propriété | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Supprimer le compte | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **👥 GESTION UTILISATEURS** |
| Inviter utilisateurs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Modifier rôles | ✅ | ✅ (sauf ADMIN) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Révoquer utilisateurs | ✅ | ✅ (sauf ADMIN) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Inviter consultant temporaire | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Voir tous les utilisateurs | ✅ | ✅ | ✅ | 🟡 Son périmètre | ❌ | ❌ | ❌ |
| **🏢 ORGANISATION** |
| Créer/modifier entreprise | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Créer/modifier sites | ✅ | ✅ | 🟡 Suggérer | ❌ | ❌ | ❌ | ❌ |
| Créer/modifier unités | ✅ | ✅ | ✅ | 🟡 Son périmètre | ❌ | ❌ | ❌ |
| Supprimer entreprise/site | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Voir toute l'organisation | ✅ | ✅ | ✅ | 🟡 Son périmètre | ✅ | ❌ | ✅ |
| **📋 RÉFÉRENTIELS** |
| Créer dangers/risques | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Modifier référentiels | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Supprimer référentiels | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Consulter référentiels | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Créer grilles cotation | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **⚠️ ÉVALUATIONS DUERP** |
| Créer évaluations (tous sites) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Créer évaluations (son site) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Modifier évaluations (tous) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Modifier évaluations (son site) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Supprimer évaluations | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Consulter évaluations (tous) | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Consulter évaluations (son site) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Commenter évaluations | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **📤 IMPORT DUERP** |
| Importer DUERP | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **🤖 ASSISTANCE IA** |
| Utiliser suggestions risques | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Utiliser suggestions actions | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Utiliser reformulation | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **📋 PLAN D'ACTIONS** |
| Créer actions (tous sites) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Créer actions (son site) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Modifier actions (tous) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Modifier actions (son site) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assigner actions | ✅ | ✅ | ✅ | 🟡 Dans son site | ❌ | ❌ | ❌ |
| Consulter actions (tous) | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Consulter actions (son site) | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 Assignées | ✅ |
| Clôturer actions | ✅ | ✅ | ✅ | 🟡 Assignées | ❌ | 🟡 Assignées | ❌ |
| Proposer actions (suggestions) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **👁️ OBSERVATIONS** |
| Créer observations | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Modifier ses observations | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Modifier toutes observations | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assigner observations | ✅ | ✅ | ✅ | 🟡 Dans son site | ❌ | ❌ | ❌ |
| Consulter observations (tous) | ✅ | ✅ | ✅ | 🟡 Son site | ✅ | 🟡 Siennes | ✅ |
| Clôturer observations | ✅ | ✅ | ✅ | 🟡 Son site | 🟡 Siennes | 🟡 Siennes | ❌ |
| **📄 EXPORTS** |
| Exporter PDF | ✅ | ✅ | ✅ | 🟡 Son périmètre | ✅ | ❌ | ✅ |
| Exporter Word | ✅ | ✅ | ✅ | 🟡 Son périmètre | ✅ | ❌ | ✅ |
| Exporter Excel | ✅ | ✅ | ✅ | 🟡 Son périmètre | ✅ | ❌ | ✅ |
| **✓ CONFORMITÉ** |
| Consulter historique (tous) | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Consulter historique (son site) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Valider conformité | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Télécharger rapports d'audit | ✅ | ✅ | ✅ | 🟡 Son site | ✅ | ❌ | ✅ |
| **🔗 API** |
| Générer clés API | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Utiliser API | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **⚙️ PARAMÈTRES** |
| Paramètres entreprise | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Paramètres personnels | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gérer notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Légende :**
- ✅ = Accès complet
- 🟡 = Accès limité/conditionnel
- ❌ = Pas d'accès

---

## 🎯 Mapping Rôles × Plans Tarifaires

### Disponibilité des Rôles par Plan

| Plan | Rôles Disponibles | Max Utilisateurs | Restrictions |
|------|------------------|------------------|--------------|
| **FREE** | PROPRIÉTAIRE uniquement | 1 | Mode découverte |
| **ESSENTIEL** | PROPRIÉTAIRE + ADMIN + REPRÉSENTANT + OBSERVATEUR | 3 | Pas de SITE/QSE, pas de CONSULTANT |
| **PRO** | Tous sauf CONSULTANT* | 10 | 2 invitations CONSULTANT/an |
| **EXPERT** | Tous les rôles | 30 | 5 invitations CONSULTANT/an |
| **ENTREPRISE** | Tous + rôles custom | Sur mesure | CONSULTANT illimité |

**Note PRO* :** Le PROPRIÉTAIRE agit automatiquement comme ADMIN, pas de délégation séparée possible.

---

## 📋 Descriptions Détaillées des Rôles

### 👑 PROPRIÉTAIRE (Owner)
**Définition :** Personne qui a souscrit au plan (unique par organisation)

**Caractéristiques :**
- Responsabilité juridique et financière
- Tous les droits ADMINISTRATEUR +
- Gestion facturation et abonnement
- Transfert de propriété
- Suppression du compte
- Non supprimable tant que l'abonnement est actif

**Profil type :** Dirigeant, Gérant, DRH

**Particularité :** Peut choisir son rôle opérationnel lors de l'onboarding (souvent ADMIN ou QSE)

---

### 🔧 ADMINISTRATEUR
**Définition :** Gestion complète déléguée par le propriétaire

**Caractéristiques :**
- Gestion de l'organisation (entreprise, sites, unités)
- Gestion des utilisateurs (invitation, modification, révocation)
- Accès complet aux données
- Configuration des paramètres
- Génération de clés API

**Profil type :** Directeur QSE, Responsable RH, Bras droit du dirigeant

**Limitation :** Ne peut pas gérer la facturation ni créer d'autres ADMIN

---

### 🛡️ RESPONSABLE QSE
**Définition :** Pilotage de la prévention et conformité

**Caractéristiques :**
- Accès complet aux évaluations (tous sites)
- Gestion des référentiels
- Import DUERP
- Gestion des plans d'actions (tous sites)
- Consultation de toutes les observations
- Validation de conformité
- Invitation de consultants externes

**Profil type :** Responsable QSE, Préventeur, HSE Manager

**Limitation :** Ne peut pas gérer les utilisateurs ni l'organisation structurelle

---

### 👷 RESPONSABLE DE SITE
**Définition :** Gestion opérationnelle d'un périmètre défini

**Caractéristiques :**
- Accès limité à son/ses sites
- Création/modification d'évaluations sur son périmètre
- Gestion des plans d'actions de son site
- Assignation d'actions dans son périmètre
- Utilisation de l'IA assistive
- Exports de son périmètre

**Profil type :** Chef d'équipe, Manager de site, Responsable d'établissement

**Limitation :** Périmètre restreint aux sites assignés, pas d'accès global

---

### 👥 REPRÉSENTANT
**Définition :** Instances représentatives du personnel (CSE, CSSCT, délégués, médecine du travail)

**Caractéristiques :**
- **Consultation complète** de tous les DUERP (obligation légale L2312-5)
- Consultation de tous les plans d'action et observations
- Création d'observations (alertes, remontées terrain)
- Commentaires sur les évaluations (droit d'alerte)
- Proposition d'actions préventives
- Export pour réunions CSE

**Profil type :** Membre élu CSE, CSSCT, Délégué du personnel, Médecin du travail

**Limitation :** Aucune modification des évaluations, rôle consultatif et d'alerte

**Justification légale :** Article L2312-5 du Code du travail - droit de consultation du DUERP

---

### 👀 OBSERVATEUR
**Définition :** Consultation et remontées terrain

**Caractéristiques :**
- Création d'observations
- Consultation des évaluations de son périmètre
- Accès aux actions qui lui sont assignées
- Clôture de ses propres actions

**Profil type :** Salarié, Collaborateur terrain

**Limitation :** Aucune modification, accès très limité, participation minimale

---

### 🔍 CONSULTANT
**Définition :** Accès externe temporaire (audit, conseil, inspection)

**Caractéristiques :**
- **Accès temporaire** (durée définie à l'invitation)
- Consultation complète en lecture seule
- Commentaires sur évaluations et actions
- Export PDF/Word/Excel pour rapports
- Proposition d'actions (suggestions)
- Pas d'accès aux données utilisateurs/facturation
- **Pas d'accès à l'IA** (coût maîtrisé)

**Profil type :** Consultant QSE externe, Auditeur, Inspecteur du travail, CARSAT, Organisme de contrôle

**Limitation :** Aucune modification, accès en lecture seule, durée limitée

**Particularité :** Invitation par email avec date d'expiration (ex: 30 jours)

---

## 🎯 Tableau Synthétique: Qui Fait Quoi?

| Action Courante | PROPRIÉTAIRE | ADMIN | QSE | SITE_MANAGER | REPRÉSENTANT | OBSERVER | CONSULTANT |
|-----------------|--------------|-------|-----|--------------|--------------|----------|------------|
| **Payer la facture** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Inviter des collègues** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Inviter un consultant** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Créer un site** | ✅ | ✅ | 🟡 | ❌ | ❌ | ❌ | ❌ |
| **Évaluer un risque** | ✅ | ✅ | ✅ | 🟡 | ❌ | ❌ | ❌ |
| **Consulter tout le DUERP** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Importer un DUERP** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Créer un plan d'action** | ✅ | ✅ | ✅ | 🟡 | ❌ | ❌ | ❌ |
| **Proposer une action** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Faire une observation** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Commenter évaluation** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Exporter le DUERP** | ✅ | ✅ | ✅ | 🟡 | ✅ | ❌ | ✅ |
| **Utiliser l'IA** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Voir tout** | ✅ | ✅ | ✅ | 🟡 | ✅ | 🟡 | ✅ |

🟡 = Limité au périmètre attribué

---

## 📐 Logique d'Implémentation des Permissions

### 1. Structure de Données

```
TABLE users {
  id: UUID
  email: STRING
  organization_id: UUID
  is_owner: BOOLEAN [TRUE pour le souscripteur]
  operational_role: ENUM ['ADMIN', 'QSE', 'SITE_MANAGER', 'REPRESENTATIVE', 'OBSERVER', 'CONSULTANT']
  scope_sites: UUID[] [Vide si accès global, sinon IDs des sites]
  access_expiry: TIMESTAMP [Pour CONSULTANT uniquement]
  invited_by: UUID
  created_at: TIMESTAMP
  is_active: BOOLEAN
}

TABLE organizations {
  id: UUID
  owner_id: UUID [Référence vers users.id]
  subscription_plan: ENUM ['FREE', 'ESSENTIEL', 'PRO', 'EXPERT', 'ENTREPRISE']
  max_users: INTEGER [Selon le plan]
  max_consultants_per_year: INTEGER [Selon le plan]
  created_at: TIMESTAMP
}

TABLE consultant_invitations {
  id: UUID
  consultant_user_id: UUID
  invited_by: UUID
  organization_id: UUID
  expires_at: TIMESTAMP
  revoked: BOOLEAN
  created_at: TIMESTAMP
}

TABLE permissions_log {
  id: UUID
  user_id: UUID
  action: STRING ['create', 'read', 'update', 'delete', 'export', 'comment']
  resource: STRING ['evaluation', 'action', 'observation', 'user', etc.]
  resource_id: UUID
  success: BOOLEAN
  denial_reason: STRING [Si success = FALSE]
  timestamp: TIMESTAMP
}
```

---

### 2. Logique de Vérification des Permissions

#### A. Vérification Multi-niveaux

```
FONCTION checkPermission(user, action, resource, resource_id):
  
  // Niveau 0: Vérifier si le compte est actif
  IF NOT user.is_active:
    RETURN FALSE + "Compte désactivé"
  
  // Niveau 0bis: Vérifier si CONSULTANT n'a pas expiré
  IF user.operational_role == 'CONSULTANT' AND user.access_expiry < NOW():
    RETURN FALSE + "Accès consultant expiré"
  
  // Niveau 1: Vérifier si le plan permet la fonctionnalité
  IF NOT isPlanFeatureEnabled(user.organization.plan, resource):
    RETURN FALSE + "Upgrade requis vers plan supérieur"
  
  // Niveau 2: Vérifier le rôle global
  IF user.is_owner:
    RETURN TRUE // Le propriétaire a tous les droits
  
  // Niveau 3: Vérifier les permissions du rôle opérationnel
  IF NOT hasRolePermission(user.operational_role, action, resource):
    RETURN FALSE + "Permission refusée pour votre rôle"
  
  // Niveau 4: Vérifier le scope (périmètre)
  IF NOT hasScope(user, resource_id):
    RETURN FALSE + "Accès limité à votre périmètre"
  
  // Niveau 5: Vérifier les quotas
  IF hasQuotaExceeded(user.organization, resource):
    RETURN FALSE + "Quota mensuel atteint"
  
  // Log de l'accès autorisé
  logPermission(user, action, resource, resource_id, TRUE)
  
  RETURN TRUE
```

#### B. Vérification du Périmètre (Scope)

```
FONCTION hasScope(user, resource_id):
  
  // Propriétaire et Admin: accès global
  IF user.is_owner OR user.operational_role == 'ADMIN':
    RETURN TRUE
  
  // QSE et REPRÉSENTANT: accès global en lecture
  IF user.operational_role IN ['QSE', 'REPRESENTATIVE']:
    RETURN TRUE
  
  // CONSULTANT: accès global en lecture seule
  IF user.operational_role == 'CONSULTANT':
    RETURN TRUE
  
  // Responsable de Site: vérifier le périmètre
  IF user.operational_role == 'SITE_MANAGER':
    resource_site = getResourceSite(resource_id)
    RETURN resource_site IN user.scope_sites
  
  // Observateur: accès limité aux propres créations et assignations
  IF user.operational_role == 'OBSERVER':
    resource_owner = getResourceOwner(resource_id)
    resource_assignee = getResourceAssignee(resource_id)
    RETURN resource_owner == user.id OR resource_assignee == user.id
  
  RETURN FALSE
```

#### C. Permissions Spécifiques par Rôle

```
FONCTION hasRolePermission(role, action, resource):
  
  MATRICE_PERMISSIONS = {
    'ADMIN': {
      'evaluation': ['create', 'read', 'update', 'delete'],
      'action': ['create', 'read', 'update', 'delete', 'assign'],
      'observation': ['create', 'read', 'update', 'delete', 'assign'],
      'user': ['create', 'read', 'update', 'delete'],
      'organization': ['create', 'read', 'update', 'delete'],
      'referentiel': ['create', 'read', 'update', 'delete'],
      'export': ['pdf', 'word', 'excel'],
      'import': ['duerp'],
      'ai': ['suggestions_risques', 'suggestions_actions', 'reformulation'],
      'api': ['generate_key', 'use']
    },
    
    'QSE': {
      'evaluation': ['create', 'read', 'update', 'delete'],
      'action': ['create', 'read', 'update', 'delete', 'assign', 'suggest'],
      'observation': ['create', 'read', 'update', 'assign'],
      'user': ['read'],
      'organization': ['read'],
      'referentiel': ['create', 'read', 'update', 'delete'],
      'export': ['pdf', 'word', 'excel'],
      'import': ['duerp'],
      'ai': ['suggestions_risques', 'suggestions_actions', 'reformulation'],
      'api': ['use'],
      'consultant': ['invite']
    },
    
    'SITE_MANAGER': {
      'evaluation': ['create_scope', 'read_scope', 'update_scope', 'comment'],
      'action': ['create_scope', 'read_scope', 'update_scope', 'assign_scope', 'suggest'],
      'observation': ['create', 'read_scope', 'update_own', 'close_scope'],
      'user': ['read_scope'],
      'organization': ['read_scope'],
      'referentiel': ['read'],
      'export': ['pdf_scope', 'word_scope', 'excel_scope'],
      'ai': ['suggestions_risques', 'suggestions_actions', 'reformulation']
    },
    
    'REPRESENTATIVE': {
      'evaluation': ['read', 'comment'],
      'action': ['read', 'suggest'],
      'observation': ['create', 'read', 'update_own', 'close_own'],
      'user': [],
      'organization': ['read'],
      'referentiel': ['read'],
      'export': ['pdf', 'word', 'excel'],
      'conformite': ['read', 'download_reports']
    },
    
    'OBSERVER': {
      'evaluation': ['read_scope'],
      'action': ['read_assigned', 'close_assigned'],
      'observation': ['create', 'read_own', 'update_own', 'close_own'],
      'referentiel': ['read'],
      'conformite': ['read_scope']
    },
    
    'CONSULTANT': {
      'evaluation': ['read', 'comment'],
      'action': ['read', 'suggest'],
      'observation': ['read'],
      'user': [],
      'organization': ['read'],
      'referentiel': ['read'],
      'export': ['pdf', 'word', 'excel'],
      'conformite': ['read', 'download_reports']
    }
  }
  
  IF role NOT IN MATRICE_PERMISSIONS:
    RETURN FALSE
  
  IF resource NOT IN MATRICE_PERMISSIONS[role]:
    RETURN FALSE
  
  RETURN action IN MATRICE_PERMISSIONS[role][resource]
```

#### D. Vérification des Fonctionnalités par Plan

```
FONCTION isPlanFeatureEnabled(plan, resource):
  
  MATRICE_FONCTIONNALITES = {
    'FREE': {
      'methode_inrs': FALSE,
      'ia_suggestions': FALSE,
      'import_duerp': FALSE,
      'export_word': FALSE,
      'export_excel': FALSE,
      'api': FALSE,
      'role_representative': FALSE,
      'role_consultant': FALSE,
      'role_site_manager': FALSE,
      'role_qse': FALSE
    },
    'ESSENTIEL': {
      'methode_inrs': TRUE,
      'ia_suggestions': FALSE,
      'import_duerp': FALSE,
      'export_word': FALSE,
      'export_excel': FALSE,
      'api': FALSE,
      'role_representative': TRUE,
      'role_consultant': FALSE,
      'role_site_manager': FALSE,
      'role_qse': FALSE
    },
    'PRO': {
      'methode_inrs': TRUE,
      'ia_suggestions': TRUE, // Limité
      'ia_actions': FALSE,
      'import_duerp': TRUE,
      'export_word': TRUE,
      'export_excel': TRUE,
      'api': TRUE,
      'multi_tenant': FALSE,
      'role_representative': TRUE,
      'role_consultant': TRUE, // 2/an
      'role_site_manager': TRUE,
      'role_qse': TRUE
    },
    'EXPERT': {
      'methode_inrs': TRUE,
      'ia_suggestions': TRUE, // Plus généreux
      'ia_actions': TRUE,
      'import_duerp': TRUE,
      'export_word': TRUE,
      'export_excel': TRUE,
      'api': TRUE,
      'multi_tenant': TRUE,
      'role_representative': TRUE,
      'role_consultant': TRUE, // 5/an
      'role_site_manager': TRUE,
      'role_qse': TRUE
    },
    'ENTREPRISE': {
      // Toutes fonctionnalités + custom
      'all': TRUE
    }
  }
  
  IF plan == 'ENTREPRISE':
    RETURN TRUE
  
  RETURN MATRICE_FONCTIONNALITES[plan][resource] == TRUE
```

#### E. Vérification des Quotas

```
FONCTION hasQuotaExceeded(organization, resource):
  
  QUOTAS = {
    'FREE': {
      'risques': 5,
      'plans_action': 10,
      'observations': 5,
      'exports_pdf': 1, // par an
      'consultants': 0
    },
    'ESSENTIEL': {
      'risques': 20,
      'plans_action': 30,
      'observations': 20,
      'exports_pdf': 2, // par an
      'consultants': 0
    },
    'PRO': {
      'risques': 100,
      'plans_action': 200,
      'observations': 100,
      'imports': 5, // par mois
      'exports_pdf': 12, // par an
      'ia_suggestions_risques': 50, // par mois
      'consultants': 2 // par an
    },
    'EXPERT': {
      'risques': 500,
      'plans_action': 1000,
      'observations': 500,
      'imports': 20,
      'exports_pdf': 50,
      'ia_suggestions_risques': 200,
      'ia_suggestions_actions': 50,
      'consultants': 5 // par an
    },
    'ENTREPRISE': {
      // Sur mesure
    }
  }
  
  IF organization.plan == 'ENTREPRISE':
    RETURN FALSE // Pas de limite ou limites custom
  
  current_usage = getMonthlyUsage(organization.id, resource)
  plan_quota = QUOTAS[organization.plan][resource]
  
  IF current_usage >= plan_quota:
    RETURN TRUE + "Quota mensuel atteint: " + current_usage + "/" + plan_quota
  
  RETURN FALSE
```

---

### 3. Règles Métier Spécifiques

#### A. Gestion des Invitations

```
RÈGLE: Qui peut inviter des utilisateurs ?
- FREE: Personne (1 seul utilisateur = propriétaire)
- ESSENTIEL+: Propriétaire + ADMIN

RÈGLE: Qui peut inviter des consultants ?
- FREE, ESSENTIEL: Personne
- PRO: Propriétaire + ADMIN + QSE (max 2/an)
- EXPERT: Propriétaire + ADMIN + QSE (max 5/an)
- ENTREPRISE: Propriétaire + ADMIN + QSE (illimité)

PROCESSUS INVITATION UTILISATEUR:
1. Vérifier si user.is_owner OR user.operational_role == 'ADMIN'
2. Vérifier si organization.current_users < organization.max_users
3. Vérifier si le rôle demandé est disponible dans le plan
4. Créer invitation avec rôle proposé
5. Envoyer email d'invitation
6. Nouveau user créé avec invited_by = inviteur.id

PROCESSUS INVITATION CONSULTANT:
1. Vérifier si user.is_owner OR user.operational_role IN ['ADMIN', 'QSE']
2. Vérifier quota consultants/an selon le plan
3. Définir durée d'accès (par défaut 30 jours, max selon plan)
4. Créer invitation consultant avec access_expiry
5. Envoyer email d'invitation avec lien temporaire
6. Consultant créé avec operational_role = 'CONSULTANT'
7. Log dans consultant_invitations
```

#### B. Modification des Rôles

```
RÈGLE: Qui peut modifier les rôles ?
- Propriétaire: Tous sauf lui-même (is_owner ne peut être changé)
- Admin: Tous sauf Propriétaire et autres Admin

CONTRAINTES:
- is_owner ne peut jamais être modifié (sauf transfert)
- Un Admin ne peut pas créer d'autres Admin
- Un Admin ne peut pas révoquer d'autres Admin
- Le Propriétaire ne peut pas être révoqué (seulement transféré)
- Un REPRÉSENTANT ne peut pas être modifié en ADMIN/QSE sans validation propriétaire
- Un CONSULTANT ne peut pas être modifié en rôle permanent (doit être réinvité)

RÈGLE: Changement de rôle REPRÉSENTANT
- Nécessite validation du propriétaire (obligation légale)
- Email de notification au CSE
- Conservation de l'historique des mandats
```

#### C. Filtrage des Données par Périmètre

```
FONCTION getFilteredEvaluations(user):
  
  IF user.is_owner OR user.operational_role IN ['ADMIN', 'QSE', 'REPRESENTATIVE', 'CONSULTANT']:
    RETURN getAllEvaluations(user.organization_id)
  
  IF user.operational_role == 'SITE_MANAGER':
    RETURN getEvaluationsBySites(user.scope_sites)
  
  IF user.operational_role == 'OBSERVER':
    RETURN getEvaluationsBySites(user.scope_sites) // Lecture seule
```

#### D. Gestion des Actions Assignées

```
RÈGLE: Actions assignées à un utilisateur
- OBSERVATEUR peut voir et clôturer uniquement ses actions assignées
- SITE_MANAGER peut assigner des actions aux users de son site
- QSE peut assigner à tous
- ADMIN/PROPRIÉTAIRE peuvent assigner à tous
- REPRÉSENTANT peut proposer des actions (suggestions)
- CONSULTANT peut proposer des actions (suggestions)

VISIBILITÉ:
- Propriétaire/Admin/QSE/Représentant: Toutes les actions
- Site Manager: Actions de son périmètre
- Observateur: Actions qui lui sont assignées
- Consultant: Toutes les actions (lecture seule)
```

#### E. Expiration des Accès Consultants

```
RÈGLE: Durée des accès consultants
- PRO: 30 jours par défaut, max 90 jours
- EXPERT: 60 jours par défaut, max 180 jours
- ENTREPRISE: Configurable, pas de max

PROCESSUS D'EXPIRATION:
1. Vérification quotidienne (cron job) des access_expiry
2. Si access_expiry < NOW(): user.is_active = FALSE
3. Email de notification 7 jours avant expiration
4. Email de notification à l'expiration
5. Option de renouvellement (compte dans le quota annuel)
```

---

### 4. Indicateurs UX Dynamiques

#### A. Badges de Rôle dans la Sidebar

```
SI user.is_owner:
  Afficher: "👑 [Nom] - Propriétaire · [Rôle opérationnel]"
SINON SI user.operational_role == 'CONSULTANT':
  Afficher: "🔍 [Nom] - Consultant (expire le [date])"
SINON:
  Afficher: "[Icône rôle] [Nom] - [Rôle opérationnel]"

Sous le nom:
  "Plan [PLAN] ([X]/[MAX] utilisateurs)"
  SI CONSULTANT: "Accès expire le [date]"
```

#### B. Items de Menu Désactivés

```
SI feature non disponible pour le plan:
  Afficher l'item grisé avec icône 🔒
  Tooltip: "Fonctionnalité disponible à partir du plan [NOM PLAN]"
  Clic: Modal d'upgrade
  
SI permission insuffisante:
  Afficher l'item grisé avec icône 🔐
  Tooltip: "Réservé aux rôles: [LISTE RÔLES]"
  Pas de clic possible

SI CONSULTANT (pas d'accès IA):
  Item IA masqué complètement
```

#### C. Filtres Contextuels Automatiques

```
Dashboard:
- Propriétaire/Admin/QSE/Représentant/Consultant: Stats globales
- Site Manager: Stats de son/ses sites uniquement
- Observateur: Ses observations et actions assignées

Listes (évaluations, actions, observations):
- Filtrage automatique selon le scope
- Bouton "Filtrer" désactivé pour OBSERVATEUR (scope fixe)
- Badge "Lecture seule" pour CONSULTANT et REPRÉSENTANT
```

---

### 5. Gestion du Transfert de Propriété

```
PROCESSUS:
1. Propriétaire va dans Paramètres > Compte
2. Clique sur "Transférer la propriété"
3. Sélectionne un utilisateur existant (avec operational_role != 'OBSERVER' ET != 'CONSULTANT')
4. Confirme avec mot de passe
5. Email de confirmation envoyé au nouveau propriétaire
6. Nouveau propriétaire accepte
7. Transaction atomique:
   - Ancien: is_owner = FALSE, operational_role = 'ADMIN'
   - Nouveau: is_owner = TRUE, garde son operational_role
   - organization.owner_id = nouveau_user_id
8. Notifications envoyées aux deux parties
9. Log dans permissions_log
```

---

### 6. Upgrade de Plan et Impact sur les Rôles

```
SCÉNARIOS:

FREE → ESSENTIEL:
- Peut maintenant inviter jusqu'à 3 utilisateurs
- Nouveaux utilisateurs peuvent être OBSERVATEUR ou REPRÉSENTANT
- Propriétaire peut choisir operational_role = ADMIN

ESSENTIEL → PRO:
- Débloque rôles SITE_MANAGER et QSE
- Peut inviter jusqu'à 10 utilisateurs
- Propriétaire peut déléguer la gestion
- Débloque invitation de 2 CONSULTANTS/an

PRO → EXPERT:
- Passage de 10 à 30 utilisateurs
- Débloque fonctionnalités avancées pour tous les rôles
- Multi-tenant activé (QSE peut gérer plusieurs entités)
- Débloque invitation de 5 CONSULTANTS/an

EXPERT → ENTREPRISE:
- Rôles custom possibles
- Permissions granulaires sur mesure
- Gouvernance renforcée
- CONSULTANTS illimités
```

---

### 7. Messages d'Erreur Contextuels

```
Si permission refusée:

OBSERVATEUR tente de créer une évaluation:
→ "Vous devez être Responsable de Site ou supérieur pour créer des évaluations. Contactez votre administrateur."

SITE_MANAGER tente d'accéder à un autre site:
→ "Vous avez accès uniquement aux sites: [Liste]. Cette évaluation concerne le site [Nom]. Contactez votre Responsable QSE."

REPRÉSENTANT tente de modifier une évaluation:
→ "En tant que Représentant, vous pouvez consulter les DUERP et ajouter des commentaires, mais pas les modifier. Contactez votre Responsable QSE."

CONSULTANT tente d'utiliser l'IA:
→ "L'accès à l'Intelligence Artificielle n'est pas disponible pour les consultants externes."

FREE tente d'utiliser méthode INRS:
→ "La méthode INRS est disponible à partir du plan ESSENTIEL (29€/mois). [Upgrader maintenant]"

PRO atteint quota IA:
→ "Vous avez atteint votre quota mensuel de 50 suggestions IA. Réinitialisé le [date]. [Passer à EXPERT pour 200/mois]"

CONSULTANT expiré:
→ "Votre accès consultant a expiré le [date]. Contactez [inviteur] pour renouveler votre accès."
```

---


---

## 📊 Permissions ÉDITEUR (Solo)

| Domaine | Action | Accès |
|---------|--------|-------|
| **🏢 ORGANISATIONS** |
| Voir toutes les organisations | ✅ |
| Modifier les informations | ✅ |
| Supprimer une organisation | ✅ |
| Suspendre pour impayé | ✅ |
| **💳 FACTURATION** |
| Voir tous les abonnements | ✅ |
| Modifier le plan d'un client | ✅ |
| Appliquer une remise | ✅ |
| Annuler un abonnement | ✅ |
| **👥 UTILISATEURS** |
| Voir tous les utilisateurs | ✅ |
| Réinitialiser mot de passe | ✅ |
| Transférer la propriété (cas exceptionnel) | ✅ |
| **📋 DONNÉES CLIENTS** |
| Accéder aux DUERP | ❌ Sauf urgence justifiée |
| Export données (RGPD) | ✅ |
| Suppression données (RGPD) | ✅ |
| **📊 SYSTÈME** |
| Logs système | ✅ |
| Métriques d'usage | ✅ |
| Modifier quotas | ✅ |
| Maintenance | ✅ |
| **⚙️ CONFIGURATION** |
| Modifier les plans tarifaires | ✅ |
| Gérer référentiels INRS | ✅ |
| Configuration IA | ✅ |

**Légende :**
- ✅ = Accès complet
- ❌ = Interdit (respect vie privée clients)

---

## 🔐 Règles de Sécurité

### 1. Traçabilité Simple
Log minimal pour chaque action sensible :
- Quoi (action)
- Quand (date/heure)
- Pourquoi (raison courte)

### 2. Accès aux Données Clients
**Principe :** Tu n'accèdes JAMAIS aux DUERP et évaluations sauf :
- Demande explicite du client (support)
- Bug critique nécessitant investigation
- Obligation légale (RGPD, justice)

**Dans ces cas :** Note la raison dans un fichier de log

### 3. Notifications Clients
Notifie automatiquement le client quand tu :
- Modifies son plan
- Suspends son compte
- Accèdes à ses données métier
- Supprimes des données

---

## 📋 Structure Minimale

```sql
-- Un seul compte éditeur = toi
TABLE editor_account {
  id: UUID
  email: 'neli@ddwin.fr'
  role: 'SUPER_ADMIN'
  is_active: TRUE
}

-- Log simple des actions sensibles
TABLE editor_actions_log {
  id: UUID
  organization_id: UUID
  action: STRING
  reason: STRING
  timestamp: TIMESTAMP
}
```

---

## 🎯 Actions Courantes (Solo)

### Support Client
- ✅ Reset mot de passe
- ✅ Débloquer compte
- ✅ Modifier email
- ✅ Résoudre bug technique

### Commercial
- ✅ Upgrade/downgrade plan
- ✅ Appliquer remise early adopter
- ✅ Gérer période d'essai

### Technique
- ✅ Monitoring système
- ✅ Ajuster quotas si bug
- ✅ Maintenance base de données
- ✅ Optimisation performances

### RGPD
- ✅ Export données sur demande
- ✅ Suppression compte
- ✅ Répondre demande d'accès

---

## 💡 Bonnes Pratiques d'Implémentation

### 1. Approche Défensive
- **Toujours vérifier** les permissions côté backend (jamais seulement frontend)
- **Logger toutes les tentatives** d'accès refusé pour audit
- **Principe du moindre privilège** par défaut
- **Double vérification** pour les actions sensibles (suppression, transfert)

### 2. Performance
- **Cacher les permissions** par utilisateur (Redis, 15 min TTL)
- **Invalider le cache** uniquement lors de changements de rôle/plan
- **Pré-calculer les scopes** pour éviter les requêtes multiples
- **Index sur** user_id, organization_id, operational_role

### 3. UX Progressive
- **Masquer** les sections entières non accessibles
- **Griser** les fonctionnalités du plan supérieur (avec CTA upgrade)
- **Afficher** les limites restantes (ex: "45/100 risques ce mois")
- **Badge "Lecture seule"** pour CONSULTANT et REPRÉSENTANT

### 4. Traçabilité
- **Enregistrer** qui a fait quoi, quand (permissions_log)
- **Notifier** les changements de permissions (email)
- **Exporter** les logs pour conformité RGPD
- **Conserver** 5 ans minimum (obligation DUERP)

### 5. Tests
- **Tester chaque rôle** contre chaque permission
- **Tester les transitions** de plan (upgrade/downgrade)
- **Tester les cas limites** (dernier risque du quota, etc.)
- **Tester l'expiration** des consultants
- **Tests de sécurité** (tentatives d'escalade de privilèges)

### 6. Sécurité
- **JWT avec rôle** dans le payload
- **Vérification côté serveur** systématique
- **Rate limiting** par rôle (CONSULTANT plus strict)
- **Pas de données sensibles** dans les logs
- **Chiffrement** des access_tokens pour consultants

---

## 🎯 Checklist de Déploiement

### Base de données
- [ ] Créer les tables users, organizations, consultant_invitations, permissions_log
- [ ] Ajouter les index sur user_id, organization_id, operational_role
- [ ] Migration des utilisateurs existants vers le nouveau système
- [ ] Définir les contraintes (foreign keys, not null, etc.)

### Backend
- [ ] Implémenter toutes les permissions et rôles
- [ ] Middleware d'authentification/autorisation
- [ ] API endpoints pour gestion des rôles
- [ ] API endpoints pour invitations consultants
- [ ] Cron job pour expiration des consultants
- [ ] Système de cache Redis pour permissions

### Frontend
- [ ] Sidebar dynamique selon le rôle
- [ ] Badges de rôle
- [ ] Items de menu désactivés
- [ ] Modals d'upgrade
- [ ] Interface de gestion des utilisateurs
- [ ] Interface d'invitation consultants
- [ ] Indicateurs de quotas
- [ ] Messages d'erreur contextuels
- [ ] Filtres contextuels automatiques

### Juridique
- [ ] Mettre à jour CGU avec mentions REPRÉSENTANT/CONSULTANT
- [ ] Clause sur accès temporaire consultants
- [ ] Clause sur droit de consultation CSE
- [ ] Validation avocat (recommandé)

### Documentation
- [ ] Guide utilisateur par rôle
- [ ] Documentation API pour gestion des permissions
- [ ] FAQ sur les rôles et permissions


### Tests
- [ ] Tests unitaires des fonctions de permissions
- [ ] Tests d'intégration par scénario utilisateur
- [ ] Tests de sécurité (tentatives d'escalade)
- [ ] Tests de performance (avec cache)
- [ ] Tests d'expiration consultants

---


---

**Version finale validée - Prêt pour implémentation**
