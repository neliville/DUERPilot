# Amélioration UX et Accessibilité - Plans Tarifaires
## Guide d'implémentation

**Date :** Janvier 2026  
**Statut :** ✅ Implémenté

---

## 🎯 Principes UX appliqués

### 1. Messages positifs et rassurants
- ❌ On ne dit jamais "bloqué"
- ✅ On explique pourquoi, ce que ça apporte, comment débloquer
- ✅ On rassure : conformité toujours possible
- ✅ On montre la valeur du plan supérieur
- ✅ On propose une évolution claire

### 2. Accessibilité
- ✅ Labels ARIA appropriés
- ✅ Gestion du focus
- ✅ Contraste des couleurs
- ✅ Navigation au clavier
- ✅ Messages d'erreur clairs

---

## 📦 Nouveaux composants créés

### 1. PlanBlockMessage
Composant principal pour afficher les messages de blocage avec UX améliorée.

**Utilisation :**
```tsx
<PlanBlockMessage
  currentPlan="free"
  requiredPlan="starter"
  type="ia" // ou "method", "feature", "quota", "limit"
  onContinue={() => {/* continuer sans assistance */}}
/>
```

**Types de messages :**
- `ia` : Blocage IA (Free → Starter)
- `method` : Blocage méthode (Free → Starter ou Starter → Pro)
- `feature` : Blocage fonctionnalité (Starter → Pro ou Pro → Expert)
- `quota` : Quota atteint (Starter → Pro ou Pro → Expert)
- `limit` : Limite atteinte

### 2. PlanQuotaWarning
Affiche un avertissement quand le quota IA approche ou dépasse la limite.

**Utilisation :**
```tsx
<PlanQuotaWarning />
```

**Comportement :**
- Affiche un avertissement à 80% du quota
- Affiche un message de blocage à 100%
- Propose automatiquement l'upgrade

### 3. MethodAccessGuardImproved
Version améliorée du guard avec messages UX.

**Utilisation :**
```tsx
<MethodAccessGuardImproved
  method="guided_ia"
  showMessage={true}
  onContinue={() => {/* continuer avec méthode alternative */}}
>
  <OiraEvaluationForm />
</MethodAccessGuardImproved>
```

### 4. PlanFeatureBlock
Protège l'accès à une fonctionnalité avec message UX.

**Utilisation :**
```tsx
<PlanFeatureBlock
  feature="workUnits"
  featureName="Unités de travail"
  onContinue={() => {/* continuer sans cette fonctionnalité */}}
>
  <WorkUnitForm />
</PlanFeatureBlock>
```

### 5. TRPCErrorHandler
Gère les erreurs tRPC et les convertit en messages UX.

**Utilisation :**
```tsx
const { error } = api.riskAssessments.create.useMutation({
  onError: (error) => {
    setError(error);
  },
});

<TRPCErrorHandler error={error} />
```

### 6. PlanUsageSummary
Affiche un résumé complet de l'utilisation du plan.

**Utilisation :**
```tsx
<PlanUsageSummary />
```

**Affiche :**
- Plan actuel avec prix
- Tous les compteurs (entreprises, sites, unités, utilisateurs, risques, IA)
- Barres de progression
- Bouton d'upgrade si disponible

---

## 💬 Messages UX par scénario

### Free → Starter

**Blocage IA :**
```
🔒 Fonctionnalité avancée

Cette fonctionnalité utilise l'assistance intelligente pour vous faire gagner du temps.
Avec le plan Free, vous pouvez réaliser votre DUERP de manière autonome et conforme,
mais sans assistance automatique.

👉 Passez au plan Starter pour bénéficier :
• Suggestions d'actions de prévention
• Cotation indicative des risques
• Accompagnement pas à pas adapté à votre activité

[🔵 Découvrir le plan Starter] [⚪ Continuer sans assistance]
```

**Blocage méthode guidée :**
```
🔒 Méthode guidée indisponible

La méthode guidée vous permet d'être accompagné à partir de votre secteur d'activité.
Elle est disponible à partir du plan Starter, conçu pour les TPE souhaitant gagner du temps
sans expertise QSE.

[🔵 Découvrir le plan Starter] [⚪ Continuer sans assistance]
```

### Starter → Pro

**Blocage unités de travail :**
```
🔒 Structuration avancée requise

Les unités de travail permettent une évaluation plus fine et mieux défendable en cas de
contrôle ou d'audit. Cette fonctionnalité est disponible dans le plan Pro, pensé pour les
PME souhaitant structurer leur démarche QSE.

👉 Avec le plan Pro, vous bénéficiez :
• Évaluation par unité de travail
• Cotation F×P×G×M complète
• Structuration défendable en audit

[🔵 Passer au plan Pro] [⚪ Revenir à l'évaluation manuelle]
```

**Blocage quota IA :**
```
⚠️ Quota d'assistance atteint

Vous avez utilisé l'ensemble des suggestions intelligentes incluses dans votre plan Starter.

👉 Avec le plan Pro, vous bénéficiez :
• Quota d'assistance étendu
• Analyses plus détaillées
• Structuration par unité de travail

[🔵 Passer au plan Pro] [⚪ Revenir à l'évaluation manuelle]
```

### Pro → Expert

**Blocage quota IA :**
```
⚠️ Capacité d'assistance atteinte

Votre plan Pro inclut une assistance avancée, mais limitée afin de garantir des performances
optimales.

👉 Le plan Expert vous permet :
• Utilisation libre des deux méthodes d'évaluation
• Analyses transverses approfondies
• Accès à un accompagnement prioritaire

[🔵 Passer au plan Expert]
```

**Blocage multi-sites :**
```
🔒 Fonctionnalité Expert

La gestion multi-sites et l'historique long terme sont conçus pour les organisations matures
avec des exigences d'audit élevées.

👉 Disponibles dans le plan Expert.

[🔵 Passer au plan Expert]
```

### Expert (usage intensif)

**Avertissement préventif :**
```
ℹ️ Usage intensif détecté

Vous utilisez fortement l'assistance intelligente ce mois-ci.

Toutes les fonctionnalités restent disponibles.
Un suivi est assuré pour garantir la qualité du service.
```

---

## 🎨 Design et accessibilité

### Couleurs et icônes

- **Info** : Bleu (`bg-blue-100 text-blue-600`)
- **Warning** : Orange (`bg-orange-100 text-orange-600`)
- **Error** : Rouge (`bg-red-100 text-red-600`)
- **Success** : Vert (`text-green-600`)

### Icônes utilisées

- `Sparkles` : IA / Assistance intelligente
- `Lock` : Fonctionnalité verrouillée
- `AlertTriangle` : Avertissement / Quota
- `Info` : Information préventive
- `CheckCircle2` : Avantages / Bénéfices
- `TrendingUp` : Upgrade / Amélioration

### Accessibilité

- ✅ Labels ARIA sur tous les boutons
- ✅ Focus visible sur les éléments interactifs
- ✅ Contraste WCAG AA minimum
- ✅ Navigation au clavier complète
- ✅ Messages d'erreur annoncés par les lecteurs d'écran

---

## 🔧 Intégration dans les routers

### Messages améliorés dans tRPC

Les messages d'erreur dans les routers utilisent maintenant `PLAN_ERROR_MESSAGES` qui contient des messages UX améliorés :

```typescript
// Avant
throw new TRPCError({
  code: 'FORBIDDEN',
  message: 'Fonctionnalité non disponible',
});

// Après
throw new TRPCError({
  code: 'FORBIDDEN',
  message: PLAN_ERROR_MESSAGES.method_not_available('guided_ia', userPlan, 'starter'),
});
```

### Routers modifiés

- ✅ `oiraResponses.ts` : Messages améliorés pour méthode guidée
- ✅ `riskAssessments.ts` : Messages améliorés pour méthode classique + limites

---

## 📱 Exemples d'utilisation

### Dans une page d'évaluation

```tsx
import { MethodAccessGuardImproved } from '@/components/plans';
import { PlanQuotaWarning } from '@/components/plans';

export function EvaluationPage() {
  return (
    <div>
      <PlanQuotaWarning />
      
      <MethodAccessGuardImproved
        method="guided_ia"
        onContinue={() => router.push('/evaluations/generic')}
      >
        <OiraEvaluationForm />
      </MethodAccessGuardImproved>
    </div>
  );
}
```

### Dans le dashboard

```tsx
import { PlanUsageSummary } from '@/components/plans';
import { PlanLimitsBanner } from '@/components/plans';

export function DashboardPage() {
  return (
    <div>
      <PlanLimitsBanner />
      <PlanUsageSummary />
    </div>
  );
}
```

### Gestion d'erreurs

```tsx
import { TRPCErrorHandler } from '@/components/plans';

export function RiskAssessmentForm() {
  const [error, setError] = useState<Error | null>(null);
  
  const mutation = api.riskAssessments.create.useMutation({
    onError: (err) => setError(err),
  });
  
  return (
    <div>
      <TRPCErrorHandler error={error} onDismiss={() => setError(null)} />
      {/* Formulaire */}
    </div>
  );
}
```

---

## ✅ Checklist d'implémentation

- [x] Composant PlanBlockMessage avec tous les types de messages
- [x] Composant PlanQuotaWarning pour les avertissements
- [x] Composant MethodAccessGuardImproved
- [x] Composant PlanFeatureBlock
- [x] Composant TRPCErrorHandler
- [x] Composant PlanUsageSummary
- [x] Messages améliorés dans lib/plans.ts
- [x] Messages améliorés dans oiraResponses.ts
- [x] Messages améliorés dans riskAssessments.ts
- [x] Design accessible (ARIA, contraste, clavier)
- [x] Documentation complète

---

## 🚀 Prochaines étapes

1. **Intégrer dans les pages existantes :**
   - Dashboard : PlanUsageSummary + PlanLimitsBanner
   - Pages d'évaluation : MethodAccessGuardImproved
   - Formulaires : TRPCErrorHandler

2. **Tests utilisateurs :**
   - Vérifier la compréhension des messages
   - Tester les parcours d'upgrade
   - Valider l'accessibilité

3. **Analytics :**
   - Tracker les clics sur les boutons d'upgrade
   - Mesurer le taux de conversion
   - Analyser les points de friction

---

**Implémentation terminée le :** Janvier 2026  
**Prêt pour :** Intégration dans l'interface utilisateur et tests

