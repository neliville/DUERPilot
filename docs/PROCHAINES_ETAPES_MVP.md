# Prochaines Étapes MVP - DUERPilot

## 🎯 Objectif MVP

Créer un MVP fonctionnel permettant à un utilisateur de :
1. ✅ S'inscrire et vérifier son email
2. ✅ Compléter l'onboarding (créer entreprise + site)
3. ✅ Créer des unités de travail
4. ✅ Évaluer des risques (méthode générique ou INRS)
5. ✅ Créer des plans d'actions
6. ✅ Générer un DUERP (document PDF)

---

## ✅ Ce qui est déjà fait

### Backend - Système complet
- ✅ Authentification et inscription
- ✅ Système de rôles et permissions
- ✅ Multi-tenancy
- ✅ Plans tarifaires (FREE, ESSENTIEL, PRO, EXPERT, ENTREPRISE)
- ✅ CRUD complet : Entreprises, Sites, Unités, Évaluations, Actions, Observations
- ✅ Référentiels de dangers
- ✅ Routers tRPC fonctionnels

### Frontend - Pages principales
- ✅ Landing page
- ✅ Page d'inscription/connexion
- ✅ Page d'onboarding
- ✅ Dashboard avec modal d'onboarding
- ✅ Pages : Entreprises, Sites, Unités, Évaluations, Actions, Observations
- ✅ Sidebar avec filtrage par permissions

---

## 🚨 Priorité 1 : Corrections critiques pour MVP

### 1. Validation du flux complet utilisateur FREE

**Objectif :** S'assurer qu'un utilisateur FREE peut compléter le cycle complet.

**Actions :**
1. **Tester le flux d'inscription**
   - Inscription → Email vérification → Onboarding
   - Vérifier qu'il devient automatiquement `owner` + `admin`
   - Vérifier que `isOwner = true` et `ownerId` dans Tenant

2. **Tester l'onboarding**
   - Création entreprise + site principal
   - Vérifier que ça fonctionne pour plan FREE (1 entreprise, 1 site)

3. **Tester la création d'unités**
   - Créer jusqu'à 3 unités (limite FREE)
   - Vérifier que le blocage fonctionne à 4 unités

4. **Tester les évaluations**
   - Créer des évaluations avec méthode générique (FREE)
   - Tester la méthode INRS (doit être bloquée pour FREE)
   - Vérifier les limites (5 risques/mois pour FREE)

5. **Tester la génération DUERP**
   - Vérifier que l'export PDF fonctionne (même basique)
   - Vérifier les limites (1 export/an pour FREE)

**Fichiers à tester :**
- `app/page.tsx` - Redirection après connexion
- `app/(dashboard)/dashboard/onboarding/page.tsx` - Onboarding
- `app/(dashboard)/dashboard/evaluations/page.tsx` - Évaluations
- `server/api/routers/duerpVersions.ts` - Génération DUERP

---

### 2. Correction des erreurs TypeScript bloquantes

**Problèmes identifiés :**

1. **Imports incorrects** (déjà corrigés dans ce que j'ai modifié)
   - ✅ `~/trpc/react` → `@/trpc/react`
   - ✅ `~/lib/permissions` → `@/lib/permissions`
   - ✅ `~/types` → `@/types`

2. **Composants manquants** (non critiques pour MVP)
   - `PlanUsageSummary` - Pas nécessaire pour MVP
   - `PlanQuotaWarning` - Pas nécessaire pour MVP
   - `TRPCErrorHandler` - Pas nécessaire pour MVP

3. **Composants avec props manquantes** (déjà corrigé dans sidebar)
   - `PlanQuotaIndicator` - Retiré de sidebar (nécessite props)

**Action recommandée :**
- Corriger uniquement les erreurs qui bloquent le build en production
- Les composants plan avancés peuvent être ajoutés plus tard

---

### 3. Test du système de permissions

**Objectif :** Vérifier que les permissions ne bloquent pas le flux de base.

**Tests à faire :**

1. **Utilisateur FREE (owner)**
   - ✅ Peut créer entreprise/site/unités (dans les limites)
   - ✅ Peut créer évaluations (méthode générique uniquement)
   - ✅ Peut créer actions/observations
   - ❌ Ne peut pas inviter d'utilisateurs (attendu)

2. **Vérifier les restrictions**
   - Tentative d'utiliser méthode INRS → Doit proposer upgrade
   - Tentative de créer 4ème unité → Doit bloquer
   - Tentative de créer 6ème risque/mois → Doit bloquer

**Fichiers à tester :**
- `server/api/routers/companies.ts` - Vérifier permissions
- `server/api/routers/workUnits.ts` - Vérifier permissions et limites
- `server/api/routers/riskAssessments.ts` - Vérifier méthode et limites

---

## 📋 Priorité 2 : Améliorations pour MVP

### 4. Génération DUERP basique

**État actuel :** Structure prête, génération PDF à finaliser.

**Pour MVP :**
- ✅ Affichage HTML du DUERP (déjà fait probablement)
- ⏳ Export PDF basique (Puppeteer) - **Critique pour MVP**
- ⏰ Export Word/Excel - Peut attendre

**Action :**
```typescript
// server/api/routers/duerpVersions.ts - TODO ligne 316
// Implémenter génération PDF avec Puppeteer
```

**Alternative MVP :** Si Puppeteer complexe, au minimum :
- Export HTML téléchargeable
- Ou export PDF basique sans mise en forme complexe

---

### 5. Messages d'upgrade et blocs de fonctionnalités

**Objectif :** Guider l'utilisateur vers l'upgrade quand il atteint les limites.

**Composants existants :**
- ✅ `PlanFeatureBlock` - Bloque l'accès aux fonctionnalités
- ✅ `PlanUpgradeDialog` - Dialog d'upgrade

**À faire :**
- Intégrer dans les pages critiques (évaluations, import, etc.)
- Afficher les messages contextuels selon les limites

---

### 6. Correction des limites de plan (cohérence)

**Problèmes identifiés dans `ETAT_DES_LIEUX.md` :**

1. **FREE** : 3 unités (pas 0) - Vérifier `workUnits.ts`
2. **ESSENTIEL** : 3 sites (pas 1) - Vérifier `sites.ts`
3. **PRO** : 3 entreprises (pas 1) - Vérifier `companies.ts`

**Action :** Vérifier `lib/plans.ts` et s'assurer que tous les routers utilisent ces valeurs.

---

## 📋 Priorité 3 : Nice-to-have (post-MVP)

### 7. Emails d'invitation (non critique MVP)

**TODOs identifiés :**
- Invitation utilisateur (`users.ts`)
- Invitation auditor (`users.ts`)
- Transfert de propriété (`users.ts`)

**Pour MVP :** Peut fonctionner sans emails automatiques (invitation manuelle possible).

---

### 8. IA et suggestions (non critique MVP)

**TODOs identifiés :**
- Suggestions IA risques (`riskAssessments.ts`)
- Suggestions IA actions (`preventionMeasures.ts`)

**Pour MVP :** L'IA peut être ajoutée après le MVP. Le système fonctionne sans.

---

### 9. Import DUERP (non critique MVP)

**État :** Backend ~80%, Frontend partiel.

**Pour MVP :** Peut être ajouté après. Les utilisateurs peuvent créer manuellement.

---

## 🎯 Plan d'Action Recommandé (Priorité MVP)

### Phase 1 : Validation et corrections critiques (1-2 jours)

1. ✅ **Tester le flux complet utilisateur FREE**
   - [ ] Inscription → Vérification → Onboarding → Dashboard
   - [ ] Création entreprise + site
   - [ ] Création unités (test limite 3)
   - [ ] Création évaluations (test limite 5/mois)
   - [ ] Création actions/observations
   - [ ] Génération DUERP (même basique)

2. ✅ **Corriger les erreurs TypeScript bloquantes**
   - Corriger uniquement celles qui empêchent le build

3. ✅ **Valider les permissions ne bloquent pas le flux**
   - Tester avec utilisateur FREE (owner)
   - Vérifier les restrictions fonctionnent

---

### Phase 2 : Finalisation MVP (2-3 jours)

4. ✅ **Génération DUERP PDF basique**
   - Implémenter Puppeteer ou alternative basique
   - Au minimum : export HTML téléchargeable

5. ✅ **Messages d'upgrade contextuels**
   - Intégrer `PlanFeatureBlock` et `PlanUpgradeDialog`
   - Tester les messages d'upgrade

6. ✅ **Vérifier cohérence limites de plan**
   - Comparer `lib/plans.ts` avec tous les routers
   - Corriger les incohérences

---

### Phase 3 : Tests et polish (1-2 jours)

7. ✅ **Tests end-to-end du flux complet**
   - Test avec utilisateur FREE complet
   - Test avec utilisateur ESSENTIEL (si possible)
   - Vérifier toutes les limites fonctionnent

8. ✅ **Correction des bugs mineurs**
   - UX améliorations
   - Messages d'erreur clairs
   - Validation des formulaires

---

## 📊 Checklist MVP

### Fonctionnalités Core

- [ ] **Inscription et vérification email** ✅ Déjà fait
- [ ] **Onboarding (entreprise + site)** ✅ Déjà fait
- [ ] **Création unités de travail** ✅ Déjà fait
- [ ] **Évaluation de risques (méthode générique)** ✅ Déjà fait
- [ ] **Évaluation de risques (méthode INRS)** ✅ Déjà fait (avec upgrade)
- [ ] **Création plans d'actions** ✅ Déjà fait
- [ ] **Création observations** ✅ Déjà fait
- [ ] **Génération DUERP (PDF)** ⏳ À finaliser

### Système et Permissions

- [ ] **Multi-tenancy** ✅ Déjà fait
- [ ] **Rôles et permissions** ✅ Déjà fait
- [ ] **Plans tarifaires** ✅ Déjà fait
- [ ] **Limites par plan** ✅ Déjà fait (à valider)

### UX et Messages

- [ ] **Messages d'upgrade contextuels** ⏳ Partiellement fait
- [ ] **Blocs de fonctionnalités premium** ✅ Déjà fait
- [ ] **Validation des limites** ✅ Déjà fait

---

## 🚀 Prochaine Étape Immédiate

### **Recommandation : Tester le flux complet FREE**

**Pourquoi :**
1. Identifie les bugs bloquants immédiatement
2. Valide que le MVP fonctionne de bout en bout
3. Met en évidence ce qui manque vraiment

**Comment :**

1. **Créer un nouvel utilisateur test**
   ```bash
   # Inscription via l'interface
   # Email: test-mvp@example.com
   # Plan: FREE
   ```

2. **Tester le flux étape par étape**
   - ✅ Inscription → Vérification email → Connexion
   - ✅ Onboarding → Création entreprise + site
   - ✅ Création de 3 unités de travail
   - ✅ Création de 5 évaluations de risques (méthode générique)
   - ✅ Création de quelques plans d'actions
   - ✅ Tentative de génération DUERP

3. **Identifier les blocages**
   - Noter tous les problèmes rencontrés
   - Prioriser selon impact sur MVP

4. **Corriger les blocages critiques**
   - Un par un, en commençant par les plus bloquants

---

## 📝 Notes

### Ce qui n'est PAS critique pour MVP

- ❌ Emails d'invitation automatiques (peut être manuel)
- ❌ IA et suggestions avancées (peut être ajoutée après)
- ❌ Import DUERP (peut être ajouté après)
- ❌ Export Word/Excel (PDF suffit pour MVP)
- ❌ Support chat/téléphone (email suffit)
- ❌ Tableaux de bord analytiques avancés
- ❌ Gestion avancée des utilisateurs (multi-utilisateurs)

### Ce qui EST critique pour MVP

- ✅ Inscription et authentification
- ✅ Onboarding fonctionnel
- ✅ Création des entités de base (entreprise, site, unités)
- ✅ Évaluation de risques (au moins méthode générique)
- ✅ Génération DUERP (même basique en PDF ou HTML)
- ✅ Limitations par plan qui fonctionnent

---

**Date :** Janvier 2026  
**Statut :** Plan d'action pour MVP  
**Prochaine étape :** Tester le flux complet utilisateur FREE
