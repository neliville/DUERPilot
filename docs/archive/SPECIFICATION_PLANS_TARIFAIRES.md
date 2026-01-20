# Spécification Officielle des Plans Tarifaires
## DUERPilot - Source de Vérité Produit

**Version :** 1.1  
**Date :** Janvier 2026 (Mise à jour pricing)  
**Statut :** VALIDÉ - Non modifiable sans validation produit

> ⚠️ **IMPORTANT** : Ce document définit les règles OFFICIELLES des plans tarifaires.  
> Ces règles doivent être STRICTEMENT appliquées dans le code, l'UX et la logique métier.

**Plans actuels :**
- Plan FREE : 0€/mois - Découverte (méthode générique uniquement)
- Plan ESSENTIEL : 29€/mois - TPE (méthode INRS + 10 unités de travail)
- Plan PRO : 79€/mois - PME/Consultants (IA + Import + API)
- Plan EXPERT : 149€/mois - PME structurées (Tout illimité + IA avancée)

---

## Table des matières

1. [Modes d'évaluation](#1-modes-dévaluation)
2. [Plan FREE](#2-plan-free)
3. [Plan STARTER](#3-plan-starter)
4. [Plan PRO](#4-plan-pro)
5. [Plan EXPERT](#5-plan-expert)
6. [Contraintes globales](#6-contraintes-globales)
7. [Implémentation technique](#7-implémentation-technique)

---

## 1. Modes d'évaluation

Le SaaS DUERP propose **TROIS MODES D'ÉVALUATION distincts** qui ne doivent **JAMAIS** être fusionnés automatiquement.

### 1.1 ÉVALUATION GÉNÉRIQUE (sans IA)

**Description :**
- Basée sur les risques génériques INRS
- Sélection manuelle des risques par l'utilisateur
- DUERP global (sans unités de travail)
- Aucune automatisation IA
- Aucune structuration par unité de travail

**Objectif :**
- Conformité minimale et simplicité
- Découverte du DUERP
- Pas de complexité

**Utilisation :**
- L'utilisateur sélectionne manuellement les risques depuis une liste de risques génériques INRS
- Pas de questions guidées
- Pas de structuration par unité de travail
- Export DUERP global

**IA :** ❌ STRICTEMENT INTERDITE

---

### 1.2 MÉTHODE GUIDÉE ASSISTÉE PAR IA (OiRA + IA)

**Description :**
- Basée sur les référentiels OiRA et questions sectorielles
- L'utilisateur répond lui-même aux questions OiRA
- Sélection et validation humaine des risques
- IA utilisée **UNIQUEMENT APRÈS** validation humaine
- IA jamais décisionnaire

**Objectif :**
- Accompagnement pédagogique
- Gain de temps pour non-experts
- Structuration facilitée

**Utilisation :**
1. L'utilisateur sélectionne un référentiel OiRA (secteur d'activité)
2. L'utilisateur répond aux questions OiRA (Oui/Non/Partiellement/Non applicable)
3. L'utilisateur sélectionne les mesures de prévention appliquées
4. **Validation humaine obligatoire** des risques identifiés
5. **APRÈS validation** : IA peut suggérer des actions, cotations, reformulations
6. L'utilisateur valide/modifie les suggestions IA avant enregistrement

**IA autorisée (après validation) :**
- ✅ Suggestion d'actions de prévention
- ✅ Cotation indicative simplifiée (F×P×G×M suggérée)
- ✅ Reformulation pédagogique
- ❌ AUCUNE structuration automatique par unité de travail
- ❌ AUCUNE décision automatique

**Contraintes :**
- L'IA ne peut pas être utilisée avant la validation humaine
- L'utilisateur peut ignorer toutes les suggestions IA
- L'utilisateur peut modifier toutes les suggestions IA

---

### 1.3 MÉTHODE CLASSIQUE INRS (experts)

**Description :**
- Évaluation par unité de travail
- Identification manuelle des dangers et risques
- Cotation F × P × G × M
- Approche experte, exhaustive et auditable
- IA uniquement assistive, jamais centrale

**Objectif :**
- DUERP robuste et défendable
- Conformité stricte INRS
- Préparation audits

**Utilisation :**
1. L'utilisateur crée des unités de travail
2. Pour chaque unité, l'utilisateur identifie manuellement :
   - Les dangers (depuis le référentiel ou personnalisés)
   - Les situations dangereuses
   - Les personnes exposées
   - Les mesures existantes
3. L'utilisateur cote manuellement F × P × G × M
4. Calcul automatique du score de risque
5. Structuration par unité de travail

**IA autorisée (assistive uniquement) :**
- ✅ Suggestion de cotation F×P×G×M (indicative)
- ✅ Suggestion d'actions de prévention
- ❌ AUCUNE identification automatique de dangers
- ❌ AUCUNE structuration automatique

**Contraintes :**
- L'utilisateur doit toujours valider/modifier les suggestions IA
- L'IA est optionnelle (l'utilisateur peut tout faire manuellement)
- La méthode reste conforme INRS même sans IA

---

### 1.4 Règles communes aux modes

**⚠️ RÈGLE FONDAMENTALE :**
- Le **CHOIX DU MODE** appartient **TOUJOURS** à l'utilisateur
- Les modes ne doivent **JAMAIS** être fusionnés automatiquement
- L'utilisateur peut utiliser différents modes pour différentes évaluations
- L'utilisateur peut combiner les modes (dans la limite de son plan)

---

## 2. Plan FREE

### 2.1 Cible

- **TPE** : 1 à 5 salariés
- **Profil** : Dirigeant seul
- **Objectif** : Découverte du DUERP, conformité minimale

### 2.2 Modes d'évaluation autorisés

- ✅ **ÉVALUATION GÉNÉRIQUE UNIQUEMENT**
- ❌ Méthode guidée assistée par IA : **INTERDITE**
- ❌ Méthode classique INRS : **INTERDITE**

### 2.3 Fonctionnalités incluses

**Entreprise et structure :**
- 1 entreprise maximum
- Secteur générique uniquement (pas de secteurs OiRA spécifiques)
- Pas d'unités de travail
- DUERP global (sans structuration par unité)

**Évaluation :**
- Accès aux risques génériques INRS
- Sélection manuelle des risques
- Pas de questions guidées OiRA
- Pas de cotation F×P×G×M

**Export et historique :**
- Export PDF basique (DUERP global)
- Pas d'historique de versions
- Pas de versioning

**Utilisateurs :**
- 1 utilisateur maximum

### 2.4 IA

- ❌ **IA STRICTEMENT INTERDITE**
- Aucun appel IA autorisé
- Aucune suggestion IA
- Aucune automatisation IA

**Justification :**
- Contrôle des coûts
- Découverte de la valeur sans IA
- Upsell vers Starter pour accéder à l'IA

### 2.5 Limites et quotas

- **Entreprises** : 1
- **Sites** : 1
- **Unités de travail** : 0 (non disponible)
- **Risques évalués** : 5/mois (réduit de 10 à 5 pour pousser conversion vers Starter)
- **Appels IA** : 0
- **Exports PDF** : 1/mois
- **Utilisateurs** : 1

### 2.6 Objectif produit

- Sensibilisation au DUERP
- Découverte de la valeur
- Aucun coût IA
- Conversion vers ESSENTIEL

### 2.7 Blocages et messages

**Si tentative d'utilisation méthode guidée :**
```
"La méthode guidée assistée par IA n'est pas disponible dans le plan Free.
Passez au plan ESSENTIEL pour accéder aux référentiels OiRA et à l'assistance IA."
```

**Si tentative d'utilisation méthode classique :**
```
"La méthode classique INRS (par unités de travail) n'est pas disponible dans le plan Free.
Passez au plan Pro pour accéder aux unités de travail et à la cotation F×P×G×M."
```

**Si tentative d'appel IA :**
```
"L'assistance IA n'est pas disponible dans le plan Free.
Passez au plan ESSENTIEL pour accéder à l'assistance IA (10-15 appels/mois)."
```

---

## 3. Plan ESSENTIEL

### 3.1 Cible

- **TPE** : 5 à 20 salariés
- **Profil** : Dirigeant / RH polyvalent, besoin de structuration INRS
- **Objectif** : DUERP structuré conforme INRS sans IA

### 3.2 Modes d'évaluation autorisés

- ✅ **ÉVALUATION GÉNÉRIQUE** (sans IA)
- ✅ **MÉTHODE INRS** (par unités de travail)
- ❌ IA : **STRICTEMENT INTERDITE**

**⚠️ IMPORTANT :**
- L'utilisateur **choisit librement** son mode à chaque évaluation
- Les deux modes peuvent être utilisés pour des évaluations différentes
- Pas de fusion automatique des modes
- **Aucune IA disponible** (volontaire pour ce plan)

### 3.3 Fonctionnalités incluses

**Entreprise et structure :**
- 1 entreprise maximum
- 1 site
- **10 unités de travail** (structuration INRS)
- Accès aux risques génériques INRS
- Méthode INRS complète

**Évaluation générique :**
- Sélection manuelle des risques génériques INRS
- DUERP global
- Pas de cotation F×P×G×M

**Évaluation INRS :**
- Création d'unités de travail
- Identification manuelle des dangers
- Cotation F×P×G×M manuelle
- Mesures de prévention
- Structuration par unité de travail

**Export et historique :**
- Export PDF complet
- 2 exports DUERP/an
- Mise à jour annuelle facilitée

**Utilisateurs :**
- 3 utilisateurs maximum

### 3.4 IA

**IA STRICTEMENT INTERDITE :**
- ❌ Aucune suggestion IA
- ❌ Aucune reformulation IA
- ❌ Aucune cotation IA
- ❌ Aucun appel IA autorisé

**Justification :**
- Plan positionné pour TPE voulant une méthode structurée INRS sans coût IA
- Différenciation claire avec le plan PRO (qui inclut l'IA)
- Contrôle des coûts
- Upsell vers PRO pour accéder à l'IA

**Quota IA :**
- **0 appel IA / mois**

### 3.5 Limites et quotas

- **Entreprises** : 1
- **Sites** : 1
- **Unités de travail** : 10
- **Risques évalués** : 20/mois
- **Appels IA** : 0 (aucune IA)
- **Exports PDF** : 2/an
- **Plans d'action** : 30/mois
- **Observations** : 20/mois
- **Imports** : 0
- **Utilisateurs** : 3

### 3.6 Prix

- **29€/mois**
- **290€/an** (10 mois)

### 3.7 Objectif produit

- Accès à la méthode INRS structurée
- Structuration par unités de travail (10 max)
- Pas d'IA pour contrôler les coûts
- Upsell vers Pro pour IA + Import + API

### 3.8 Blocages et messages

**Si tentative d'utilisation IA :**
```
"L'assistance IA n'est pas disponible dans le plan ESSENTIEL.
Passez au plan PRO pour accéder à l'IA (50 suggestions de risques/mois + reformulation illimitée)."
```

**Si dépassement limite unités de travail :**
```
"Vous avez atteint la limite de 10 unités de travail du plan ESSENTIEL.
Passez au plan PRO pour créer jusqu'à 50 unités de travail."
```

**Si tentative d'import :**
```
"L'import de DUERP n'est pas disponible dans le plan ESSENTIEL.
Passez au plan PRO pour importer vos DUERP existants (PDF, Word, Excel)."
```

---

## 4. Plan PRO

### 4.1 Cible

- **PME** : 20 à 100 salariés
- **Profil** : Responsable QSE non dédié, préparation audits/inspections
- **Objectif** : DUERP robuste et défendable

### 4.2 Modes d'évaluation autorisés

- ✅ **ÉVALUATION GÉNÉRIQUE**
- ✅ **MÉTHODE GUIDÉE ASSISTÉE PAR IA**
- ✅ **MÉTHODE CLASSIQUE INRS**

**⚠️ IMPORTANT :**
- Les trois modes sont disponibles
- L'utilisateur choisit librement son mode à chaque évaluation
- Les modes peuvent être combinés (ex: OiRA pour certaines unités, classique pour d'autres)

### 4.3 Fonctionnalités incluses

**Entreprise et structure :**
- 1 entreprise maximum
- Accès à tous les secteurs OiRA
- Accès aux risques génériques INRS
- **Unités de travail** (templates + personnalisables)

**Évaluation générique :**
- Sélection manuelle des risques génériques
- Structuration possible par unité de travail

**Évaluation guidée OiRA :**
- Questions guidées OiRA
- Validation humaine obligatoire
- Structuration par unité de travail possible (après validation)

**Évaluation classique INRS :**
- Cotation F × P × G × M complète
- Identification manuelle des dangers
- Structuration par unité de travail
- Mesures existantes et actions structurées

**Export et historique :**
- Historique et versioning DUERP
- Tableaux de bord risques
- Exports avancés (PDF, Excel, CSV)

**Utilisateurs :**
- 10 utilisateurs maximum

### 4.4 IA (avancée mais contrôlée)

**IA autorisée :**
- ✅ Cotation détaillée assistée (F×P×G×M suggérée)
- ✅ Suggestions d'actions priorisées
- ✅ Aide à la structuration par unité (après validation)
- ✅ Reformulation et pédagogie

**IA INTERDITE :**
- ❌ Identification automatique de dangers
- ❌ Décision automatique
- ❌ Utilisation avant validation humaine
- ❌ Structuration automatique sans validation

**Quota IA :**
- **40 à 60 appels IA / mois**
- Limitation par risque / unité
- Compteur visible et détaillé

### 4.5 Limites et quotas

- **Entreprises** : 1
- **Sites** : 3
- **Unités de travail** : 50
- **Risques évalués** : 200/mois
- **Appels IA** : 40-60/mois
- **Exports PDF** : 12/an (mensuels)
- **Utilisateurs** : 10
- **Historique versions** : 12 mois

### 4.6 Objectif produit

- DUERP robuste et défendable
- Fidélisation PME
- Upsell vers Expert pour multi-entreprises

### 4.7 Blocages et messages

**Si dépassement quota IA :**
```
"Vous avez atteint votre quota mensuel d'appels IA (60/60).
Passez au plan Expert pour accéder à 300 appels IA/mois, ou attendez le mois prochain."
[Upsell vers Expert]
```

**Si tentative de création unité au-delà de la limite :**
```
"Vous avez atteint la limite d'unités de travail (50/50) du plan Pro.
Passez au plan Expert pour accéder aux unités illimitées."
```

---

## 5. Plan EXPERT

### 5.1 Cible

- **PME matures** : 100+ salariés
- **Multi-sites** : Plusieurs établissements
- **Audits réguliers** : ISO, clients, inspections
- **Objectif** : Maîtrise totale et sérénité audit

### 5.2 Modes d'évaluation autorisés

- ✅ **ÉVALUATION GÉNÉRIQUE**
- ✅ **MÉTHODE GUIDÉE ASSISTÉE PAR IA**
- ✅ **MÉTHODE CLASSIQUE INRS (COMPLÈTE)**

**⚠️ IMPORTANT :**
- Les trois modes sont disponibles
- Utilisables indépendamment
- Combinables librement
- Sélectionnés à la convenance de l'utilisateur
- Aucune restriction de mode

### 5.3 Fonctionnalités incluses

**Entreprise et structure :**
- **Entreprises multiples** (illimitées)
- **Sites multiples** (illimités)
- **Unités de travail** (illimitées)
- Tous les secteurs OiRA
- Tous les risques génériques INRS

**Évaluation :**
- Tous les modes disponibles
- Combinaison libre des modes
- Cotation F×P×G×M complète
- Structuration avancée

**Export et historique :**
- **Historique long terme** (illimité)
- **GED QSE complète** (documents, preuves)
- Préparation audits ISO
- Exports personnalisables
- Traçabilité complète

**Utilisateurs :**
- Utilisateurs illimités

**Accompagnement :**
- Support prioritaire
- Onboarding dédié
- Revue annuelle DUERP possible (option payante)

### 5.4 IA (intensive mais toujours contrôlée)

**IA autorisée :**
- ✅ Analyse croisée risques / unités
- ✅ Priorisation intelligente des actions
- ✅ Aide à la mise à jour annuelle DUERP
- ✅ Synthèses direction et audit
- ✅ Cotation détaillée assistée
- ✅ Suggestions d'actions priorisées
- ✅ Aide à la structuration

**IA INTERDITE :**
- ❌ Décision automatique
- ❌ Utilisation avant validation humaine
- ❌ Identification automatique sans validation

**Quota IA :**
- **300 appels IA / mois** (limité à 300 au lieu de 500 pour marge positive)
- Monitoring et journalisation complets
- Analytics d'usage IA

### 5.5 Limites et quotas

- **Entreprises** : Illimitées
- **Sites** : Illimités
- **Unités de travail** : Illimitées
- **Risques évalués** : Illimités
- **Appels IA** : 300/mois (limité pour marge positive)
- **Exports PDF** : Illimités
- **Utilisateurs** : Illimités
- **Historique versions** : Illimité

### 5.6 Objectif produit

- Liberté totale de méthode
- Sérénité réglementaire
- Très forte valeur perçue
- Fidélisation maximale

### 5.7 Blocages et messages

**Si dépassement quota IA :**
```
"Vous avez atteint votre quota mensuel d'appels IA (300/300).
Contactez le support pour un quota personnalisé ou attendez le mois prochain."
[Contact support]
```

---

## 6. Contraintes globales

### 6.1 Règles non négociables

**Choix utilisateur :**
- ✅ Le choix du MODE D'ÉVALUATION appartient **TOUJOURS** à l'utilisateur
- ✅ L'utilisateur peut changer de mode à tout moment
- ✅ Les modes ne doivent **JAMAIS** être fusionnés automatiquement

**IA :**
- ✅ L'IA n'est **JAMAIS** obligatoire pour être conforme
- ✅ L'IA n'est **JAMAIS** décisionnaire
- ✅ L'IA est **TOUJOURS** utilisée après validation humaine
- ✅ L'utilisateur peut **TOUJOURS** ignorer/modifier les suggestions IA

**Limites :**
- ✅ Les limites de plan doivent être **VISIBLES** et **EXPLIQUÉES**
- ✅ Tout dépassement de quota IA déclenche un **BLOCAGE CLAIR** + proposition d'upsell
- ✅ Aucune fonctionnalité ne doit être accessible hors plan

**Conformité :**
- ✅ La méthode classique reste conforme INRS même sans IA
- ✅ L'évaluation générique reste conforme même sans IA
- ✅ La méthode guidée reste conforme même si l'utilisateur ignore l'IA

### 6.2 Messages utilisateur obligatoires

**Avant dépassement (80% du quota) :**
```
"Attention : Vous avez utilisé 12/15 appels IA ce mois (80%).
Pensez à passer au plan Pro pour accéder à 40-60 appels IA/mois."
```

**Au dépassement :**
```
"Quota IA atteint (15/15).
[Message spécifique selon le plan]
[Upsell vers plan supérieur]"
```

**Tentative d'accès fonctionnalité non disponible :**
```
"[Fonctionnalité] n'est pas disponible dans le plan [Plan actuel].
Passez au plan [Plan supérieur] pour accéder à cette fonctionnalité."
```

### 6.3 Visibilité des limites

**Dans l'interface :**
- Compteur de quota IA visible en permanence
- Barre de progression du quota
- Liste des limites du plan actuel
- Comparateur de plans accessible

**Dans les exports :**
- Watermark discret sur Free
- Mention du plan dans les métadonnées PDF

---

## 7. Implémentation technique

### 7.1 Vérifications à implémenter

**Au niveau backend (tRPC) :**
```typescript
// Vérification du plan avant chaque action
const checkPlanFeature = (userPlan: Plan, feature: Feature) => {
  const planFeatures = PLAN_FEATURES[userPlan];
  if (!planFeatures.includes(feature)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Feature ${feature} not available in plan ${userPlan}`
    });
  }
};

// Vérification du quota IA
const checkIAAQuota = async (userId: string, plan: Plan) => {
  const quota = await getIAAQuota(userId, currentMonth);
  const limit = PLAN_IA_QUOTAS[plan];
  if (quota >= limit) {
    throw new TRPCError({
      code: 'QUOTA_EXCEEDED',
      message: `IA quota exceeded (${quota}/${limit})`
    });
  }
};
```

**Au niveau frontend :**
```typescript
// Désactivation des fonctionnalités non disponibles
const isFeatureAvailable = (feature: Feature) => {
  return userPlan.features.includes(feature);
};

// Affichage conditionnel
{isFeatureAvailable('method_classique') && (
  <Button onClick={handleClassicMethod}>Méthode classique</Button>
)}
```

### 7.2 Structure de données

**Plan dans UserProfile :**
```typescript
enum Plan {
  FREE = 'free',
  STARTER = 'starter',
  PRO = 'pro',
  EXPERT = 'expert'
}

interface PlanFeatures {
  methods: EvaluationMethod[];
  maxCompanies: number;
  maxSites: number;
  maxWorkUnits: number;
  maxIACalls: number;
  maxUsers: number;
  features: string[];
}
```

### 7.3 Middleware de vérification

**Middleware tRPC :**
```typescript
const enforcePlan = (requiredFeature: string) => {
  return t.middleware(async ({ ctx, next }) => {
    const userPlan = ctx.userProfile.plan;
    const planFeatures = PLAN_FEATURES[userPlan];
    
    if (!planFeatures.includes(requiredFeature)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Feature ${requiredFeature} requires plan ${getRequiredPlan(requiredFeature)}`
      });
    }
    
    return next({ ctx });
  });
};
```

### 7.4 Compteur IA

**Table de suivi :**
```sql
CREATE TABLE ia_usage (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL,
  month DATE NOT NULL,
  calls_count INT DEFAULT 0,
  quota_limit INT NOT NULL,
  plan VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId, month)
);
```

---

## 8. Tableau récapitulatif

| Critère | FREE | STARTER | PRO | EXPERT |
|---|---|---|---|---|
| **Prix/mois** | 0€ | 99€ | 249€ | 599€ |
| **Méthode Générique** | ✅ | ✅ | ✅ | ✅ |
| **Méthode Guidée IA** | ❌ | ✅ | ✅ | ✅ |
| **Méthode Classique** | ❌ | ❌ | ✅ | ✅ |
| **Entreprises** | 1 | 1 | 1 | Illimité |
| **Sites** | 1 | 1 | 3 | Illimité |
| **Unités de travail** | 0 | 0 | 50 | Illimité |
| **Utilisateurs** | 1 | 3 | 10 | Illimité |
| **Appels IA/mois** | 0 | 10-15 | 40-60 | 300 |
| **Exports PDF** | 1/mois | 4/an | 12/an | Illimité |
| **Historique** | ❌ | Basique | 12 mois | Illimité |
| **Support** | Email (48h) | Email (24h) | Email+Chat (6h) | Prioritaire (2h) |

---

## 9. Validation et approbation

**Ce document a été validé par :**
- ✅ Product Manager
- ✅ Architecte fonctionnel
- ✅ Direction produit

**Date de validation :** Janvier 2026 (v1.0)  
**Mise à jour v1.1 :** Janvier 2026 (ajustements pricing)

**Prochaine révision :** Après 3 mois de production (analyse usage réel et conversion)

---

**⚠️ IMPORTANT :** Ce document est la **SOURCE DE VÉRITÉ** pour :
- Le développement backend (tRPC, Prisma)
- Le développement frontend (React, Next.js)
- L'UX/UI (messages, blocages, upsells)
- Le support client (réponses aux questions)
- Le marketing (communication des fonctionnalités)

**Toute modification doit être validée par le Product Manager.**

