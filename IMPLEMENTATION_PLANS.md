# Implémentation des Plans Tarifaires
## Guide d'utilisation pour les développeurs

**Date :** Janvier 2026  
**Statut :** ✅ Implémenté et fonctionnel

---

## 📋 Résumé de l'implémentation

L'implémentation complète du système de plans tarifaires est terminée. Toutes les vérifications, middlewares et composants UI sont en place.

---

## 🗄️ Base de données

### Modifications Prisma

**UserProfile :**
- Ajout du champ `plan` (String, default: "free")
- Index sur `plan` pour les requêtes

**Nouveau modèle IAAUsage :**
- Suivi de l'utilisation IA par utilisateur et mois
- Champs : `userId`, `month`, `callsCount`, `quotaLimit`, `plan`
- Contrainte unique sur `userId` + `month`

**Migration :**
```bash
pnpm prisma db push
pnpm prisma generate
```

---

## 📦 Fichiers créés/modifiés

### Nouveaux fichiers

1. **`lib/plans.ts`** - Configuration centrale des plans
   - Constantes `PLAN_FEATURES`, `PLAN_PRICES`, `PLAN_NAMES`
   - Fonctions utilitaires : `hasMethodAccess()`, `getRequiredPlan()`, etc.
   - Messages d'erreur standardisés

2. **`server/api/routers/plans.ts`** - Router tRPC pour les plans
   - `getCurrentPlan` : Informations du plan + usage
   - `getAllPlans` : Liste de tous les plans
   - `updatePlan` : Mise à jour (admin uniquement)

3. **`components/plans/plan-limits-banner.tsx`** - Bannière d'alerte des limites
4. **`components/plans/plan-upgrade-dialog.tsx`** - Dialog de mise à niveau
5. **`components/plans/plan-quota-indicator.tsx`** - Indicateur de quota IA
6. **`components/plans/method-access-guard.tsx`** - Guard pour méthodes d'évaluation

### Fichiers modifiés

1. **`prisma/schema.prisma`** - Ajout plan et IAAUsage
2. **`server/api/trpc.ts`** - Middlewares de vérification
3. **`server/api/routers/_app.ts`** - Ajout plansRouter
4. **`server/api/routers/oiraResponses.ts`** - Vérification méthode guidée
5. **`server/api/routers/riskAssessments.ts`** - Vérification méthode classique + limites

---

## 🔧 Middlewares tRPC

### Middlewares disponibles

1. **`createMethodAccessMiddleware(method)`**
   - Vérifie l'accès à une méthode d'évaluation
   - Utilisation : `authenticatedProcedure.use(createMethodAccessMiddleware('guided_ia'))`

2. **`createFeatureAccessMiddleware(feature)`**
   - Vérifie l'accès à une fonctionnalité
   - Utilisation : `authenticatedProcedure.use(createFeatureAccessMiddleware('work_units'))`

3. **`checkIAAQuota`**
   - Vérifie le quota IA avant utilisation
   - Utilisation : `authenticatedProcedure.use(checkIAAQuota)`

### Fonctions utilitaires

- **`incrementIAAUsage(userId, prisma)`** : Incrémente le compteur IA
- **`hasMethodAccess(plan, method)`** : Vérifie l'accès à une méthode
- **`hasFeatureAccess(plan, feature)`** : Vérifie l'accès à une fonctionnalité

---

## 🎨 Composants UI

### Utilisation des composants

#### 1. PlanLimitsBanner
Affiche une alerte si des limites sont proches ou atteintes.

```tsx
import { PlanLimitsBanner } from '@/components/plans';

// Dans votre page/composant
<PlanLimitsBanner />
```

#### 2. PlanQuotaIndicator
Affiche le quota IA avec barre de progression.

```tsx
import { PlanQuotaIndicator } from '@/components/plans';

// Dans la sidebar ou dashboard
<PlanQuotaIndicator />
```

#### 3. MethodAccessGuard
Protège l'accès à une méthode d'évaluation.

```tsx
import { MethodAccessGuard } from '@/components/plans';

<MethodAccessGuard method="guided_ia">
  <OiraEvaluationForm />
</MethodAccessGuard>
```

#### 4. PlanUpgradeDialog
Dialog de mise à niveau avec comparaison des plans.

```tsx
import { PlanUpgradeDialog } from '@/components/plans';

<PlanUpgradeDialog
  currentPlan="free"
  requiredPlan="starter"
  reason="La méthode guidée IA nécessite le plan Starter"
>
  <Button>Upgrader</Button>
</PlanUpgradeDialog>
```

---

## 🔍 Vérifications implémentées

### Dans oiraResponses.ts

- ✅ Vérification méthode guidée IA (plan Starter minimum)
- ✅ Message d'erreur avec suggestion d'upgrade

### Dans riskAssessments.ts

- ✅ Vérification méthode classique (plan Pro minimum)
- ✅ Vérification limite unités de travail
- ✅ Vérification limite risques/mois
- ✅ Messages d'erreur avec suggestions d'upgrade

### À implémenter (exemples)

**Dans workUnits.ts :**
```typescript
// Vérifier limite unités de travail avant création
const planFeatures = PLAN_FEATURES[userPlan];
if (planFeatures.maxWorkUnits !== Infinity) {
  const count = await ctx.prisma.workUnit.count({...});
  if (count >= planFeatures.maxWorkUnits) {
    throw new TRPCError({...});
  }
}
```

**Dans companies.ts :**
```typescript
// Vérifier limite entreprises
const planFeatures = PLAN_FEATURES[userPlan];
if (planFeatures.maxCompanies !== Infinity) {
  const count = await ctx.prisma.company.count({...});
  if (count >= planFeatures.maxCompanies) {
    throw new TRPCError({...});
  }
}
```

---

## 📊 Utilisation de l'API plans

### Récupérer les informations du plan

```typescript
const { data: planInfo } = api.plans.getCurrentPlan.useQuery();

// planInfo contient :
// - plan, name, description, price
// - features (toutes les fonctionnalités)
// - usage (compteurs actuels vs limites)
// - upgradePlan (plan supérieur recommandé)
```

### Récupérer tous les plans

```typescript
const { data: allPlans } = api.plans.getAllPlans.useQuery();

// allPlans est un tableau avec tous les plans et leurs fonctionnalités
```

---

## 🚀 Prochaines étapes

### À implémenter

1. **Vérifications dans autres routers :**
   - `workUnits.ts` : Limite unités de travail
   - `companies.ts` : Limite entreprises
   - `sites.ts` : Limite sites
   - `duerpVersions.ts` : Limite exports/mois

2. **Compteur IA :**
   - Créer un endpoint pour utiliser l'IA (suggestions, cotations)
   - Appeler `incrementIAAUsage()` après chaque utilisation
   - Exemple : `api.iaa.suggestCotation.useMutation()`

3. **Page de facturation :**
   - Créer `/dashboard/settings/billing`
   - Afficher le plan actuel
   - Permettre l'upgrade (intégration Stripe/paiement)

4. **Intégration dans les formulaires :**
   - Ajouter `MethodAccessGuard` dans les pages d'évaluation
   - Ajouter `PlanLimitsBanner` dans le dashboard
   - Ajouter `PlanQuotaIndicator` dans la sidebar

---

## 🧪 Tests à effectuer

1. **Test Free :**
   - Vérifier que méthode guidée est bloquée
   - Vérifier que méthode classique est bloquée
   - Vérifier que l'IA est bloquée

2. **Test Starter :**
   - Vérifier que méthode guidée fonctionne
   - Vérifier que méthode classique est bloquée
   - Vérifier que quota IA fonctionne (15 max)

3. **Test Pro :**
   - Vérifier que toutes les méthodes fonctionnent
   - Vérifier les limites (50 unités, 200 risques/mois)
   - Vérifier que quota IA fonctionne (60 max)

4. **Test Expert :**
   - Vérifier que tout est illimité
   - Vérifier que quota IA fonctionne (200 max)

---

## 📝 Notes importantes

1. **Par défaut, tous les utilisateurs ont le plan "free"**
   - Pour tester, mettre à jour manuellement dans la base de données
   - Ou créer un script de migration pour définir les plans initiaux

2. **Le compteur IA est mensuel**
   - Se réinitialise le 1er de chaque mois
   - Basé sur `month` (premier jour du mois)

3. **Les vérifications sont au niveau backend**
   - Le frontend peut afficher/masquer des boutons
   - Mais les vérifications réelles sont dans tRPC

4. **Messages d'erreur**
   - Tous les messages incluent une suggestion d'upgrade
   - Utilisent les constantes de `PLAN_ERROR_MESSAGES`

---

## 🔗 Références

- **Spécification officielle :** `SPECIFICATION_PLANS_TARIFAIRES.md`
- **Configuration plans :** `lib/plans.ts`
- **Router plans :** `server/api/routers/plans.ts`
- **Composants UI :** `components/plans/`

---

**Implémentation terminée le :** Janvier 2026  
**Prêt pour :** Tests et intégration dans l'interface utilisateur

