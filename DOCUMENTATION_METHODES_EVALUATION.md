# 📋 Documentation - Méthodes d'Évaluation DUERP

## 🎯 Vue d'ensemble

Ce document décrit l'intégration des **3 méthodes d'évaluation** dans l'application DUERPilot, conformément aux spécifications fournies.

### Phrase clé de l'application

> **Vous choisissez la méthode. Vous restez responsable. L'outil s'adapte à votre niveau.**

---

## 📚 Fichiers créés/modifiés

### 1. `/lib/evaluation-methods.ts`
**Nouveau fichier** - Source de vérité pour les descriptions des méthodes

- Définit `EVALUATION_METHODS` : descriptions complètes des 3 méthodes
- Exporte `METHOD_SELECTION_KEY_MESSAGE` : phrase clé à afficher
- Fonctions utilitaires : `getMethodDescription()`, `getAISymbol()`, `getAIDescription()`

### 2. `/components/evaluations/method-selector.tsx`
**Nouveau composant** - Sélecteur visuel de méthode d'évaluation

**Fonctionnalités** :
- Affichage des 3 méthodes sous forme de cartes
- Descriptions détaillées selon le document fourni
- Indicateurs d'accès selon le plan utilisateur
- Messages d'upsell pour méthodes non accessibles
- Sélection visuelle avec badge

**Intégration** :
- Utilise `MethodAccessGuardImproved` pour contrôler l'accès
- Affiche les descriptions depuis `EVALUATION_METHODS`
- Gère la sélection et le callback `onMethodSelect`

### 3. `/components/evaluations/evaluations-page-client.tsx`
**Nouveau composant** - Client component pour la page d'évaluations

**Fonctionnalités** :
- Affichage conditionnel du sélecteur de méthodes
- Vue rapide des 3 méthodes avec résumés
- Liste des évaluations existantes
- Navigation fluide entre sélection et liste

### 4. `/app/(dashboard)/dashboard/evaluations/page.tsx`
**Modifié** - Page principale des évaluations

- Intégration du composant client `EvaluationsPageClient`
- Récupération des données serveur
- Affichage du sélecteur de méthodes avec descriptions

### 5. `/lib/plans.ts`
**Modifié** - Messages d'erreur améliorés

- Messages `method_not_available` alignés avec le document
- Descriptions détaillées pour chaque méthode et plan
- Formatage amélioré avec emojis et structure claire

---

## 🧩 Les 3 Méthodes d'Évaluation

### 1️⃣ ÉVALUATION GÉNÉRIQUE

**Fichier source** : `lib/evaluation-methods.ts` → `EVALUATION_METHODS.generic`

**Caractéristiques** :
- **Nom** : Évaluation Générique
- **Sous-titre** : Simple, autonome, sans IA
- **IA** : ❌ Aucune
- **Complexité** : Très faible
- **Plan requis** : Free (accessible à tous)

**Description complète** :
- **À quoi ça sert** : Conformité minimale sans expertise QSE
- **Comment ça fonctionne** : Sélection manuelle des risques génériques INRS
- **Pour qui** : TPE (1-5 salariés), dirigeants seuls, découverte
- **Avantages** : Très simple, aucun coût IA, conforme, idéal pour débuter
- **Limites** : Pas de guidage, pas de cotation assistée, pas de structuration avancée

**Usage dans l'app** :
- Page : `/dashboard/evaluations` (méthode classique - sans unités de travail)
- Accessible à : Tous les plans (dès Free)

---

### 2️⃣ MÉTHODE GUIDÉE ASSISTÉE PAR IA

**Fichier source** : `lib/evaluation-methods.ts` → `EVALUATION_METHODS.guided_ia`

**Caractéristiques** :
- **Nom** : Méthode Guidée Assistée par IA
- **Sous-titre** : Accompagnée, pédagogique, gain de temps
- **IA** : ✅ Oui, mais uniquement après validation humaine. Jamais décisionnaire.
- **Complexité** : Faible
- **Plan requis** : Starter (minimum)

**Description complète** :
- **À quoi ça sert** : Aider les TPE/PME non expertes à identifier, structurer et prioriser les risques
- **Comment ça fonctionne** :
  1. Choix du secteur d'activité
  2. Réponse aux questions OiRA ciblées
  3. Validation humaine des risques
  4. **Après validation** : IA propose cotation indicative, suggestions d'actions, reformulation
- **Pour qui** : TPE/PME, dirigeants/RH polyvalents, peu ou pas de compétences QSE
- **Avantages** : Très pédagogique, fort gain de temps, accessible sans expertise, forte valeur perçue
- **Limites** : Dépendance à un quota IA, moins fine qu'une analyse experte, pas idéale pour audits complexes

**Usage dans l'app** :
- Page : `/dashboard/evaluations-oira`
- Composant : `OiraEvaluationForm`
- Guard : `MethodAccessGuardImproved` avec méthode `guided_ia`
- Accessible à : Plans Starter, Pro, Expert

---

### 3️⃣ MÉTHODE CLASSIQUE INRS

**Fichier source** : `lib/evaluation-methods.ts` → `EVALUATION_METHODS.classic`

**Caractéristiques** :
- **Nom** : Méthode Classique INRS
- **Sous-titre** : Experte, structurée, audit-ready
- **IA** : ⚠️ Optionnelle et assistive. Aide à la reformulation ou à la suggestion. Jamais centrale.
- **Complexité** : Élevée
- **Plan requis** : Pro (minimum)

**Description complète** :
- **À quoi ça sert** : Évaluation approfondie et défendable, conforme aux attentes des inspecteurs, auditeurs et donneurs d'ordre
- **Comment ça fonctionne** :
  1. Définition d'unités de travail
  2. Identification des dangers et risques par unité
  3. Renseignement des mesures existantes
  4. Cotation F × P × G × M
  5. Planification et suivi des actions
- **Pour qui** : PME structurées, responsables QSE, entreprises auditées, contextes réglementaires exigeants
- **Avantages** : Très robuste, méthode reconnue, défendable en contrôle, structuration complète
- **Limites** : Plus longue, plus technique, moins accessible aux non-experts

**Usage dans l'app** :
- Page : `/dashboard/evaluations`
- Composant : `RiskAssessmentForm`, `RiskAssessmentDialog`
- Guard : `MethodAccessGuardImproved` avec méthode `classic`
- Accessible à : Plans Pro et Expert

---

## 🎨 Composants UI créés

### `MethodSelector`

**Fichier** : `components/evaluations/method-selector.tsx`

**Props** :
```typescript
interface MethodSelectorProps {
  selectedMethod?: EvaluationMethod | null;
  onMethodSelect: (method: EvaluationMethod) => void;
  currentPlan?: Plan;
  showKeyMessage?: boolean; // Affiche la phrase clé par défaut
}
```

**Affichage** :
- 3 cartes côte à côte (responsive : 1 colonne sur mobile, 3 sur desktop)
- Chaque carte contient :
  - Icône de la méthode
  - Nom et sous-titre
  - Usage IA (avec emoji)
  - Complexité
  - Description "À quoi ça sert"
  - Liste "Pour qui" (2 premiers + "X autres")
  - Liste "Avantages" (2 premiers avec ✓)
  - Liste "Limites" (2 premiers avec ✗)
  - Bouton de sélection ou message d'upsell
- Badge "Sélectionnée" si méthode choisie
- Message d'upsell si méthode non accessible

**Exemple d'utilisation** :
```tsx
<MethodSelector
  selectedMethod={selectedMethod}
  onMethodSelect={(method) => setSelectedMethod(method)}
  showKeyMessage={true}
/>
```

---

## 📍 Points d'intégration dans l'application

### 1. Page principale des évaluations
**Fichier** : `app/(dashboard)/dashboard/evaluations/page.tsx`

- Affiche le `MethodSelector` avec option de voir les méthodes
- Vue rapide des 3 méthodes avec résumés
- Liste des évaluations existantes en dessous

### 2. Page évaluations OiRA
**Fichier** : `app/(dashboard)/dashboard/evaluations-oira/page.tsx`

- Utilise `MethodAccessGuardImproved` pour la méthode `guided_ia`
- Composant `OiraEvaluationForm` pour les questions guidées

### 3. Modal d'évaluation classique
**Fichier** : `components/evaluations/risk-assessment-dialog.tsx`

- Utilise `MethodAccessGuardImproved` pour la méthode `classic`
- Composant `RiskAssessmentForm` pour la cotation F×P×G×M

---

## 🔐 Contrôle d'accès par plan

| Méthode           | Free | Starter | Pro   | Expert |
|-------------------|------|---------|-------|--------|
| Générique         | ✅   | ✅      | ✅    | ✅     |
| Guidée IA         | ❌   | ✅      | ✅    | ✅     |
| Classique INRS    | ❌   | ❌      | ✅    | ✅     |

**Implémentation** :
- `lib/plans.ts` → `PLAN_FEATURES[plan].methods`
- `lib/plans.ts` → `hasMethodAccess(plan, method)`
- Composants : `MethodAccessGuardImproved` pour bloquer/afficher selon le plan

---

## 💬 Messages d'upsell

### Free → Starter (pour méthode guidée IA)

**Message** :
```
🔒 Méthode guidée indisponible

La méthode guidée assistée par IA vous permet d'être accompagné à partir de votre secteur d'activité. Elle est disponible à partir du plan Starter, conçu pour les TPE souhaitant gagner du temps sans expertise QSE.

👉 Passez au plan Starter pour bénéficier :
• de questions guidées par secteur d'activité
• de référentiels OiRA complets
• d'une assistance IA pour suggestions
```

### Free/Starter → Pro (pour méthode classique)

**Message** :
```
🔒 Méthode classique indisponible / Structuration avancée requise

La méthode classique INRS permet une évaluation approfondie et défendable, conforme aux attentes des inspecteurs, auditeurs et donneurs d'ordre. Elle est disponible à partir du plan Pro, pensé pour les PME souhaitant structurer leur démarche QSE.

👉 Passez au plan Pro pour bénéficier :
• d'unités de travail structurées
• de cotation F × P × G × M experte
• d'une approche défendable en contrôle
```

---

## 🎯 Phrase clé affichée

**Texte** : "Vous choisissez la méthode. Vous restez responsable. L'outil s'adapte à votre niveau."

**Emplacement** :
- En haut du `MethodSelector` (si `showKeyMessage={true}`)
- Style : Bannière bleue avec bordure

---

## 🔄 Flux utilisateur

1. **Utilisateur accède à `/dashboard/evaluations`**
   - Voir un résumé des 3 méthodes
   - Possibilité de cliquer sur "Voir les méthodes disponibles"

2. **Utilisateur clique sur "Voir les méthodes disponibles"**
   - `MethodSelector` s'affiche avec les 3 cartes détaillées
   - Phrase clé affichée en haut
   - Messages d'upsell si méthode non accessible

3. **Utilisateur sélectionne une méthode**
   - Badge "Sélectionnée" apparaît sur la carte
   - Bouton change en "Méthode sélectionnée"
   - Possibilité de continuer avec les évaluations existantes

4. **Utilisateur tente d'accéder à une méthode non disponible**
   - `MethodAccessGuardImproved` intercepte
   - Message d'upsell affiché avec CTA
   - Option "Continuer sans assistance" si applicable

---

## 📝 Modifications futures possibles

1. **Page dédiée de sélection de méthode** : Créer `/dashboard/evaluations/choisir-methode`
2. **Onboarding guidé** : Intégrer le sélecteur dans le flux d'onboarding initial
3. **Comparaison côte à côte** : Mode détaillé avec toutes les informations
4. **Vidéos de démonstration** : Lien vers des vidéos pour chaque méthode
5. **FAQ contextuelle** : Questions fréquentes par méthode

---

## ✅ Checklist d'intégration

- [x] Création de `lib/evaluation-methods.ts` avec descriptions complètes
- [x] Création du composant `MethodSelector`
- [x] Intégration dans la page `/dashboard/evaluations`
- [x] Messages d'upsell améliorés dans `lib/plans.ts`
- [x] Phrase clé affichée dans le sélecteur
- [x] Guards d'accès (`MethodAccessGuardImproved`) sur les composants d'évaluation
- [x] Documentation complète créée

---

**Dernière mise à jour** : Janvier 2025

