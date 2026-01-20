# Changelog DUERPilot

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### En attente
- Génération PDF du DUERP
- Export CSV des données
- Génération d'actions IA fonctionnelle

## [2.0.0] - 2026-01-20

### 🔄 Migration Majeure - Grille Tarifaire v2.0

#### Renommage des Plans (Breaking Change)
- `essentiel` → `starter` (29€ → 59€, +103%)
- `pro` → `business` (79€ → 149€, +89%)
- `expert` → `premium` (149€ → 349€, +134%)
- `free` et `entreprise` inchangés

**Justifications des hausses :**
- **STARTER** : Méthode INRS reconnue, conservation 40 ans, rappels automatiques
- **BUSINESS** : IA guidée (gain 60-80%), quotas généreux, import/export avancés
- **PREMIUM** : PAPRIPACT obligatoire, IA avancée, multi-sites, audits internes

#### Nouveaux Quotas Massifs

**Plans d'action :** Ratio 4-5× risques
- FREE: 10 → **25** (+150%)
- STARTER: 50 → **150** (+200%)
- BUSINESS: 300 → **600** (+100%)
- PREMIUM: 1000 → **2000** (+100%)

**Observations :** Ratio 6-10× risques
- FREE: 5 → **50** (+900%)
- STARTER: 20 → **300** (+1400%)
- BUSINESS: 100 → **1000** (+900%)
- PREMIUM: 500 → **3000** (+500%)

**Rationale :** Les quotas reflètent la réalité terrain (1 risque = plusieurs actions, observations quotidiennes) sans limitation artificielle.

#### Autres Améliorations

**Quotas IA augmentés :**
- BUSINESS : 100 suggestions risques/mois (était 50), 150 risques/mois (était 100)
- PREMIUM : 300 suggestions risques/mois (était 200), 100 suggestions actions/mois (était 50)

**Quotas structure augmentés :**
- STARTER : 30 risques/mois (était 20), 3 exports/an (était 2)
- BUSINESS : 24 exports/an (était 12), 10 imports/mois (était 5)
- PREMIUM : 100 exports/an (était 50), 30 imports/mois (était 20)

**Nouvelles fonctionnalités PREMIUM :**
- Module PAPRIPACT (obligatoire 50+ salariés)
- Audits internes avec checklists sectorielles
- Chat en ligne (support prioritaire)

#### Changements Techniques

**Code :**
- `lib/plans.ts` : Migration complète (renommage, nouveaux quotas, nouveaux prix)
- `types/index.ts` : Type Plan mis à jour
- Tous les routers tRPC : Enum et références mis à jour
- Tous les composants frontend : Noms et prix mis à jour
- `prisma/schema.prisma` : Commentaires mis à jour

**Scripts :**
- `scripts/migrate-plans-v2.ts` : Script de migration BDD créé
- `scripts/verify-plans-migration.ts` : Script de vérification créé
- `scripts/init-user-plans.ts` : Références mises à jour
- `scripts/update-user-plan.ts` : Références mises à jour

**Documentation :**
- `docs/plans-tarifs/README.md` : Documentation complète v2.0
- `docs/plans-tarifs/CHANGELOG.md` : Historique mis à jour
- `docs/plans-tarifs/RESUME_CHANGEMENTS_2026.md` : Résumé complet
- `docs/plans-tarifs/IMPLEMENTATION_TECHNIQUE.md` : Exemples mis à jour
- Fichiers sources archivés : `NOUVELLE_GRILLE_TARIFAIRE.md` et `PATCH_QUOTAS_PLANS.md`

#### Migration Requise

**⚠️ Action requise :** Exécuter la migration BDD avant déploiement :
```bash
npx tsx scripts/migrate-plans-v2.ts
npx tsx scripts/verify-plans-migration.ts
```

**Impact :**
- Tous les utilisateurs `essentiel` → `starter`
- Tous les utilisateurs `pro` → `business`
- Tous les utilisateurs `expert` → `premium`
- Nouveaux prix appliqués selon la nouvelle grille
- Nouveaux quotas bénéficiés automatiquement

#### Communication

**Recommandations :**
- Email de préavis 30 jours avant application des nouveaux prix
- Explication des hausses et justifications
- Proposition d'upgrade si besoin

## [1.1.0] - 2026-01-20

### ⚡ Performance - Cache des suggestions IA

#### Problème résolu
Avant cette version, chaque navigation entre les étapes de l'assistant DUERP ou chaque clic sur "Suggérer des dangers (IA)" déclenchait un nouvel appel à l'API OpenAI, consommant inutilement des crédits et ralentissant l'expérience utilisateur.

#### Solution implémentée

1. **Cache en base de données**
   - Nouvelle table `HazardSuggestionCache` pour stocker les suggestions par unité de travail
   - Durée de vie : 24 heures par défaut
   - Économie de coûts API : ~90% sur navigations répétées

2. **Cache en mémoire React**
   - Map<workUnitId, suggestions[]> pour conserver les suggestions lors de la navigation
   - Pas de rechargement visible pour l'utilisateur
   - Badge "En cache" pour la transparence

3. **Bouton d'actualisation manuelle**
   - Permet de forcer un nouveau calcul si nécessaire
   - Met à jour le cache automatiquement

#### Changements techniques

**Base de données** :
- Ajout du modèle `HazardSuggestionCache` dans `prisma/schema.prisma`
- Migration automatique avec `prisma db push`

**Backend** :
- `server/api/routers/riskAssessments.ts` : endpoint `suggestHazards` modifié
  - Vérifie le cache avant d'appeler OpenAI
  - Retourne `fromCache: true/false` pour traçabilité
  - Paramètre optionnel `forceRefresh` pour bypass

**Frontend** :
- `components/assistance/steps/evaluation-step.tsx`
  - State local avec Map pour cache React
  - useEffect pour charger suggestions depuis cache local
  - Indicateur visuel "En cache" + bouton "Actualiser"
  - Toast différenciés : "(nouvelles suggestions)" vs "(suggestions précédentes)"

#### Documentation
- Nouvelle doc technique : `docs/architecture/CACHE_SUGGESTIONS_IA.md`
  - Architecture complète du système de cache
  - Flux d'utilisation détaillé
  - Monitoring des coûts
  - Bonnes pratiques

#### Impact mesuré
- **Avant** : 10 navigations = 10 appels OpenAI (~0.10€)
- **Après** : 10 navigations = 1 appel + 9 cache (~0.01€)
- **Économie : 90%** sur cas d'usage typique

### 🐛 Corrigé

#### Bug : Erreur lors de la modification d'un risque suggéré par l'IA

**Problème** : Quand l'utilisateur cliquait sur "Évaluer" (modifier) depuis une suggestion IA, une erreur apparaissait :
```json
{
  "code": "invalid_type",
  "expected": "string",
  "received": "undefined",
  "path": ["id"],
  "message": "Required"
}
```

**Cause** : Le système tentait de faire une mise à jour (`update`) alors qu'il devrait créer une nouvelle évaluation (`create`), car la suggestion IA n'a pas d'`id` en base de données.

**Corrections apportées** :

1. **`risk-assessment-dialog-wizard.tsx`**
   - Ligne 195-197 : Ajout d'une vérification `editingRisk && editingRisk.id` pour distinguer édition vs pré-remplissage
   - useEffect amélioré pour détecter les pré-remplissages IA (pas d'id)
   - Titre et bouton du dialogue corrigés pour refléter le mode réel

2. **`evaluation-step.tsx`**
   - Commentaires ajoutés pour clarifier que `prefilledRisk` ne contient jamais d'id

**Résultat** :
- ✅ Cliquer sur "Évaluer" depuis suggestion IA → Création d'une nouvelle évaluation
- ✅ Cliquer sur "Modifier" depuis évaluation existante → Modification de l'évaluation

## [1.0.0] - 2026-01-20

### 🎉 Ajouté - Assistant DUERP (IA)

#### Fonctionnalités principales
- **Parcours guidé en 4 étapes** pour la création du DUERP
  - Étape 1 : Gestion des unités de travail
  - Étape 2 : Évaluation des risques avec assistance IA
  - Étape 3 : Aperçu du plan d'actions
  - Étape 4 : Génération et export

- **Stepper horizontal interactif** avec navigation fluide entre les étapes

- **Méthode d'évaluation "assistance_ia"**
  - Disponible pour les plans PRO, EXPERT et ENTREPRISE
  - Intégrée au sélecteur de méthodes
  - Redirection automatique vers `/dashboard/assistance`

#### Étape 1 : Unités de travail
- Affichage en grille des unités de travail existantes
- Statistiques par unité (effectif, nombre de risques)
- Dialog de création/modification réutilisant `WorkUnitDialog`
- CRUD complet avec mutations tRPC
- Validation avec react-hook-form et Zod

#### Étape 2 : Évaluation des risques
- **Layout 2 colonnes** : liste des unités / détails de l'évaluation
- **Suggestions de dangers IA inline** (pas de modal)
  - Card bleue avec 5 suggestions contextualisées
  - Simulation de 2 secondes
  - Bouton "Évaluer" pour pré-remplir le formulaire
  - Bouton "Fermer" pour masquer les suggestions

- **Dialog d'évaluation complet** (`RiskAssessmentDialogWizard`)
  - Sélection du danger depuis le référentiel
  - Description de la situation dangereuse
  - Personnes exposées et mesures existantes
  - **4 sliders interactifs** pour la cotation (F, P, G, M)
  - Tooltips explicatifs sur chaque critère
  - **Calcul automatique** du score de risque (F×P×G×M)
  - **Badge de priorité dynamique** (faible/à améliorer/prioritaire)
  - Bouton "Proposer une cotation (IA)" avec simulation
  - Affichage de la justification IA

- **Gestion des risques**
  - Liste des risques par unité de travail
  - Modification et suppression
  - Badge de priorité et score visible
  - Bouton "Générer actions (IA)" sur chaque risque

#### Étape 3 : Plan d'actions
- Aperçu des actions générées
- Affichage du statut, type, responsable et priorité
- Lien vers `/dashboard/actions` pour la gestion complète

#### Étape 4 : Génération
- Récapitulatif des statistiques (UT, risques, actions)
- Boutons "Générer le PDF" et "Exporter CSV"
- Lien vers l'historique des DUERP

#### Composants créés
- `components/assistance/assistant-duerp-wizard.tsx`
- `components/assistance/steps/work-units-step.tsx`
- `components/assistance/steps/evaluation-step.tsx`
- `components/assistance/steps/action-plan-step.tsx`
- `components/assistance/steps/generation-step.tsx`
- `components/assistance/risk-assessment-dialog-wizard.tsx`

#### Routes et API
- Route : `/dashboard/assistance`
- Utilisation des mutations tRPC existantes :
  - `workUnits.create`, `workUnits.update`, `workUnits.delete`
  - `riskAssessments.create`, `riskAssessments.update`, `riskAssessments.delete`
  - `dangerousSituations.getAll`

### 📚 Ajouté - Documentation

- **Documentation technique complète** de l'Assistant DUERP (`docs/ASSISTANT_DUERP_IA.md`)
  - Architecture et composants
  - Fonctionnalités IA
  - Flux utilisateur complet
  - Guide d'intégration OpenAI/Claude
  - État d'avancement et roadmap

- **Mise à jour du README principal** avec section Assistant DUERP
- **Changelog structuré** pour suivre l'évolution du projet

### 🔧 Modifié

- **Plans d'évaluation** (`lib/plans.ts`)
  - Ajout de `'assistance_ia'` aux méthodes disponibles pour PRO+
  
- **Méthodes d'évaluation** (`lib/evaluation-methods.ts`)
  - Description complète de la méthode "Assistant DUERP (IA)"
  - Avantages, limitations et cas d'usage

- **Sélecteur de méthodes** (`components/evaluations/method-selector.tsx`)
  - Ajout de la carte "Assistant DUERP (IA)" avec icône Sparkles
  - Redirection vers `/dashboard/assistance` au lieu d'ouvrir un dialog

- **Layout principal** (`app/layout.tsx`)
  - Ajout du composant `Toaster` de Sonner pour les notifications

### 📦 Dépendances

- **Ajouté** : `sonner` pour les notifications toast

### ✅ Tests

- Navigation entre les 4 étapes fonctionnelle
- Création d'unités de travail testée
- Dialog d'évaluation avec sliders testé
- Suggestions IA inline testées (avec simulation)
- Pré-remplissage du formulaire depuis suggestion testé

### 🐛 Corrections

- Correction de l'import Prisma dans `dashboard/layout.tsx`
- Correction du sélecteur de site dans le dialog d'unité de travail
- Suppression des doublons de composants (WorkUnitFormDialog)
- Correction des z-index pour les dialogs imbriqués

## Notes de migration

### Pour activer l'Assistant DUERP

1. **Changer le plan d'un utilisateur** :
```bash
npx tsx scripts/update-user-plan.ts utilisateur@email.com premium
```

2. **Accéder à l'assistant** :
- Aller sur "Évaluations"
- Cliquer sur "Nouvelle évaluation"
- Sélectionner "Assistant DUERP (IA)"

3. **Pour activer l'IA réelle** (optionnel) :
- Ajouter une clé API OpenAI ou Claude dans `.env.local`
- Créer le router `server/api/routers/ai.ts`
- Remplacer les simulations par de vrais appels API

### Variables d'environnement

Nouvelles variables optionnelles :
```env
# .env.local
OPENAI_API_KEY=sk-...           # Pour les fonctionnalités IA
# ou
ANTHROPIC_API_KEY=sk-ant-...    # Alternative à OpenAI
```

## Roadmap

### Version 1.1.0 (À venir)
- [ ] Endpoints tRPC IA réels (OpenAI/Claude)
- [ ] Génération PDF du DUERP
- [ ] Export CSV des données
- [ ] Archivage automatique des versions
- [ ] Génération d'actions IA fonctionnelle

### Version 1.2.0 (Futur)
- [ ] Templates de DUERP par secteur
- [ ] Suggestions basées sur l'historique
- [ ] Analyse comparative des risques
- [ ] Dashboard d'analytics IA

---

**Format** : [Type] Description - Détails

**Types** :
- 🎉 Ajouté : Nouvelles fonctionnalités
- 🔧 Modifié : Changements dans les fonctionnalités existantes
- 🐛 Corrigé : Corrections de bugs
- 📚 Documenté : Ajouts ou modifications de documentation
- 🗑️ Supprimé : Fonctionnalités supprimées
- 🔒 Sécurité : Correctifs de sécurité
- ⚡ Performance : Améliorations de performance
