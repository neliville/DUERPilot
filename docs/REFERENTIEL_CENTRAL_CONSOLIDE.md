# Référentiel Central Consolidé DUERPilot

## Vue d'ensemble

Le référentiel central consolidé (`duerpilot_base_complete.json`) est le **SOCLE MÉTIER PRINCIPAL** de DUERPilot. Il remplace les fichiers sectoriels individuels et constitue une base unifiée, versionnable et non modifiable pour l'application.

## Structure des données

### Fichiers sources

1. **`duerpilot_base_complete.json`** - Référentiel principal consolidé
   - Métadonnées (version, date, description)
   - Secteurs d'activité (10 secteurs : BTP, RESTO, BUREAU, etc.)
   - Risques par secteur (107 risques totaux)

2. **`duerpilot_index_risques.json`** - Index par familles (optionnel, pour taxonomie)
   - Organisation des risques par familles INRS
   - Permet de structurer la taxonomie hiérarchique

### Structure du modèle Prisma

#### `DuerpilotReference` (Référentiel central)
- Versionnable (version unique)
- Non modifiable par les utilisateurs
- Stocke les données complètes du JSON

#### `DuerpilotRisk` (Risques unifiés)
- Risques par secteur
- Catégories principales et sous-catégories
- Situations de travail, dangers, dommages
- Mesures de prévention (collective, organisationnelle, individuelle)
- Références réglementaires
- Criticité (fréquence, gravité, score, niveau)
- **Marqueur `isTransversal`** : présent dans plusieurs secteurs
- **Prévalence calculée** : niveau de prévalence dans le secteur

#### `TaxonomyFamily` (Taxonomie - Familles)
- Extraction automatique depuis les catégories principales
- Organisation hiérarchique des risques

#### `TaxonomySubCategory` (Taxonomie - Sous-catégories)
- Sous-catégories par famille
- Organisation hiérarchique de niveau 2

#### `RiskPrevalence` (Matrice de prévalence)
- Prévalence par secteur : `tres_frequent`, `frequent`, `occasionnel`, `rare`
- Score numérique pour tri
- **Note pédagogique** : "Fréquemment observé dans ce secteur d'activité"

#### `TransversalRisk` (Risques transverses)
- Risques présents dans au moins 2 secteurs
- Liste des secteurs applicables
- Prévalence globale

#### `RegulatoryReference` (Références réglementaires)
- Extraction automatique des références
- Type : code_travail, arrete, recommandation
- Pour contextualisation uniquement (non décisionnaire)

## Logique produit

### 1. Sélection du secteur

Lorsqu'un utilisateur sélectionne un secteur :

```typescript
// Router tRPC : duerpilotReference.getRisksBySector
{
  sectorCode: "BTP",
  sortBy: "prevalence", // Hiérarchisation intelligente
  category?: "Risques mécaniques",
  search?: "chute"
}
```

**Comportement** :
- Les risques sont triés par prévalence (fréquents en premier)
- Les risques transverses sont prioritaires
- Messages pédagogiques affichés : "Fréquemment observé dans ce secteur"

**Aucune évaluation automatique** : L'utilisateur doit toujours valider et adapter.

### 2. Construction du DUERP

Pour chaque unité de travail :

```typescript
// Router tRPC : duerpilotReference.suggestRisksForWorkUnit
{
  workUnitId: "...",
  sectorCode?: "BTP", // Auto-détecté depuis l'unité de travail
  limit: 20
}
```

**Comportement** :
- Propose les risques selon la prévalence dans le secteur
- Affiche les risques majeurs transverses applicables
- Permet l'ajout libre de risques personnalisés
- **Aucune évaluation n'est automatique**

### 3. Hiérarchisation intelligente (SANS DÉCISION)

La matrice de prévalence sert uniquement à :

✅ **Suggérer** des risques plus fréquents dans le secteur  
✅ **Afficher** des messages pédagogiques : "Ce risque est fréquemment observé dans ce secteur"  
✅ **Hiérarchiser** l'affichage (fréquents en premier)

❌ **Ne génère JAMAIS** de cotation automatique  
❌ **Ne décide JAMAIS** qu'un risque est obligatoire  
❌ **Ne verrouille JAMAIS** la personnalisation

### 4. IA Assistive (Usage autorisé)

L'IA utilise le référentiel comme **CONTEXTE** pour :

✅ **Suggérer** des risques manquants (selon secteur + unité)  
✅ **Reformuler** des descriptions (risques, situations, actions)  
✅ **Proposer** des mesures de prévention génériques

**Formulations IA** :
- "Ce risque pourrait être pertinent pour cette unité de travail"
- "Suggestion basée sur les pratiques courantes du secteur"
- "À valider ou ajuster selon votre situation réelle"

**L'IA doit** :
- S'appuyer exclusivement sur le référentiel et les données utilisateur
- Formuler des propositions conditionnelles
- Afficher clairement que la validation humaine est obligatoire
- **JAMAIS** garantir la conformité
- **JAMAIS** décider qu'un risque est obligatoire

### 5. Risques transverses

Les risques présents dans plusieurs secteurs sont :
- Marqués comme `isTransversal: true`
- Affichés en priorité lors de la sélection
- Accompagnés du message : "Risque identifié dans plusieurs secteurs similaires"

### 6. Références réglementaires

Les références servent uniquement à :
- Contextualiser les obligations
- Afficher des rappels réglementaires généraux
- **Ne jamais générer** de conformité automatique

## UX & Messages utilisateur

### Formulations acceptables

✅ **Messages pédagogiques** :
- "Fréquemment observé dans ce secteur d'activité"
- "Risque identifié dans des situations similaires"
- "Suggestion basée sur le référentiel interne DUERPilot"
- "À adapter selon votre réalité terrain"

✅ **Messages de prévalence** :
- "Ce risque est fréquemment observé dans ce secteur" (prévalence élevée)
- "Risque présent dans plusieurs secteurs similaires" (transverse)
- "Risque référencé pour ce secteur" (prévalence normale)

### Interdictions

❌ **Promesses de conformité** :
- ❌ "Ce DUERP sera conforme"
- ❌ "Tous les risques obligatoires sont inclus"
- ❌ "Évaluation validée automatiquement"

❌ **Décisions automatiques** :
- ❌ "Ce risque doit être inclus"
- ❌ "Évaluation automatique effectuée"
- ❌ "Cotation suggérée validée"

❌ **Verrouillage** :
- ❌ "Impossible de modifier ce risque"
- ❌ "Risques imposés par le référentiel"
- ❌ "Personnalisation limitée"

## Utilisation dans l'application

### Import et seed

```bash
# Appliquer le schéma Prisma
pnpm db:push

# Importer le référentiel central consolidé
pnpm db:seed
```

Le seeder :
1. Lit `duerpilot_base_complete.json`
2. Crée le référentiel central versionné
3. Importe tous les risques par secteur
4. Extrait et structure la taxonomie (familles → sous-catégories)
5. Calcule la matrice de prévalence par secteur
6. Identifie les risques transverses (présents dans ≥ 2 secteurs)
7. Extrait les références réglementaires

### API tRPC

```typescript
// Récupérer le référentiel actif
api.duerpilotReference.getActive.useQuery()

// Récupérer les risques par secteur (hiérarchisés par prévalence)
api.duerpilotReference.getRisksBySector.useQuery({
  sectorCode: "BTP",
  sortBy: "prevalence",
  category: "Risques mécaniques"
})

// Récupérer un risque spécifique
api.duerpilotReference.getRiskById.useQuery({
  riskId: "R001",
  sectorCode: "BTP"
})

// Récupérer la taxonomie
api.duerpilotReference.getTaxonomy.useQuery()

// Récupérer les risques transverses
api.duerpilotReference.getTransversalRisks.useQuery({
  sectorCode: "BTP"
})

// Suggérer des risques pour une unité de travail
api.duerpilotReference.suggestRisksForWorkUnit.useQuery({
  workUnitId: "...",
  sectorCode: "BTP"
})
```

### Composants UI

1. **`RiskLibrary`** (`components/referentiel/risk-library.tsx`)
   - Bibliothèque consultable par secteur
   - Hiérarchisation par prévalence
   - Messages pédagogiques basés sur la prévalence
   - Filtres par catégorie et recherche

2. **`RiskLibraryIntegration`** (`components/evaluations/risk-library-integration.tsx`)
   - Intégration dans le formulaire d'évaluation
   - Sélection guidée avec prévalence
   - Messages d'avertissement pédagogiques

3. **Page bibliothèque** (`app/(dashboard)/dashboard/referentiels/risques/page.tsx`)
   - Page dédiée à la consultation des risques

### Service IA

**Fonction** : `suggestRisksFromSectorReference()` (`server/services/ai/openai-service.ts`)

**Utilisation du référentiel** :
- Récupère les risques du secteur avec prévalence
- Utilise la prévalence pour hiérarchiser les suggestions
- Formule des propositions conditionnelles
- Affiche clairement que la validation humaine est obligatoire

**Messages IA** :
- "Ce risque pourrait être pertinent pour cette unité de travail (raisonnement basé sur le contexte)"
- "Suggestion basée sur les pratiques courantes du secteur"
- "À valider ou ajuster selon votre situation réelle"

## Versioning

Le référentiel est versionné :
- Chaque version est unique (`version_tenantId`)
- Les versions précédentes restent consultables
- Une seule version est active à la fois

## Évolutivité

Pour ajouter un nouveau secteur :
1. Ajouter le secteur dans `duerpilot_base_complete.json`
2. Relancer le seeder : `pnpm db:seed`
3. Le secteur sera automatiquement disponible dans l'application

Pour mettre à jour un secteur existant :
1. Modifier le fichier JSON
2. Incrémenter la version dans les métadonnées
3. Relancer le seeder (nouvelle version créée)

## Conformité juridique

- **Référentiel interne** : Basé sur les exigences réglementaires françaises et les bonnes pratiques professionnelles
- **Non décisionnaire** : L'application guide mais ne décide jamais
- **Personnalisable** : L'utilisateur peut toujours adapter, supprimer ou compléter
- **Responsabilité utilisateur** : L'utilisateur reste responsable de la validation finale

## Différences avec les référentiels sectoriels individuels (LEGACY)

| Aspect | Référentiels sectoriels (LEGACY) | Référentiel central consolidé (PRINCIPAL) |
|--------|----------------------------------|-------------------------------------------|
| **Structure** | Un fichier JSON par secteur | Un fichier consolidé pour tous les secteurs |
| **Taxonomie** | Non structurée | Hiérarchique (familles → sous-catégories) |
| **Prévalence** | Non calculée | Matrice calculée par secteur |
| **Risques transverses** | Non identifiés | Identifiés automatiquement |
| **Versioning** | Par secteur | Centralisé |
| **Références réglementaires** | Par risque | Globales + par risque |

Le référentiel central consolidé est maintenant le **SOCLE PRINCIPAL** pour DUERPilot.

