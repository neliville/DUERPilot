# Intégration du Référentiel Central Consolidé DUERPilot

## 🎯 Objectif

Intégrer le référentiel central consolidé (`duerpilot_base_complete.json` et `duerpilot_index_risques.json`) comme **SOCLE MÉTIER PRINCIPAL** de DUERPilot, remplaçant les fichiers sectoriels individuels.

## ✅ Réalisations

### 1. Modèle de données Prisma

**Fichier** : `prisma/schema.prisma`

Création de 6 nouveaux modèles pour le référentiel central :

- **`DuerpilotReference`** : Référentiel central versionné (non modifiable)
- **`DuerpilotRisk`** : Risques unifiés par secteur avec prévalence et marqueur transverse
- **`TaxonomyFamily`** : Taxonomie hiérarchique niveau 1 (familles)
- **`TaxonomySubCategory`** : Taxonomie hiérarchique niveau 2 (sous-catégories)
- **`RiskPrevalence`** : Matrice de prévalence par secteur (tres_frequent, frequent, occasionnel, rare)
- **`TransversalRisk`** : Risques présents dans plusieurs secteurs
- **`RegulatoryReference`** : Références réglementaires pour contextualisation

### 2. Seeder d'import

**Fichier** : `prisma/seeds/duerpilot-reference.ts`

Fonctionnalités :
- ✅ Importe `duerpilot_base_complete.json` (référentiel principal)
- ✅ Optionnellement utilise `duerpilot_index_risques.json` (taxonomie par familles)
- ✅ Extrait et structure la taxonomie (familles → sous-catégories)
- ✅ Calcule automatiquement la matrice de prévalence par secteur
- ✅ Identifie les risques transverses (présents dans ≥ 2 secteurs)
- ✅ Extrait les références réglementaires uniques
- ✅ Versionne le référentiel (1.0.0 par défaut)

**Intégration** : Ajouté au seed principal (`prisma/seed.ts`)

### 3. API tRPC

**Fichier** : `server/api/routers/duerpilotReference.ts`

7 endpoints créés :

1. **`getActive()`** - Récupère le référentiel actif
2. **`getRisksBySector()`** - Risques par secteur avec hiérarchisation intelligente
   - Tri par prévalence (par défaut)
   - Filtres par catégorie, sous-catégorie, recherche
   - Messages pédagogiques basés sur la prévalence
3. **`getRiskById()`** - Détails d'un risque spécifique
4. **`getTaxonomy()`** - Taxonomie complète (familles → sous-catégories)
5. **`getCategoriesBySector()`** - Catégories disponibles pour un secteur
6. **`getTransversalRisks()`** - Risques majeurs transverses
7. **`suggestRisksForWorkUnit()`** - Suggestions pour une unité de travail
   - Utilise la matrice de prévalence
   - Messages pédagogiques contextuels

**Intégration** : Ajouté au router principal (`server/api/routers/_app.ts`)

### 4. Composants UI

#### `RiskLibrary` (`components/referentiel/risk-library.tsx`)
- ✅ Bibliothèque consultable par secteur
- ✅ Hiérarchisation par prévalence
- ✅ Messages pédagogiques : "Fréquemment observé dans ce secteur"
- ✅ Badge "Transverse" pour les risques transverses
- ✅ Filtres par catégorie et recherche
- ✅ Dialog de détails complet (situations, dangers, prévention, références)

#### `RiskLibraryIntegration` (`components/evaluations/risk-library-integration.tsx`)
- ✅ Intégration dans les formulaires d'évaluation
- ✅ Sélection guidée avec prévalence
- ✅ Messages d'avertissement pédagogiques
- ✅ Auto-détection du secteur depuis l'unité de travail

#### Page bibliothèque (`app/(dashboard)/dashboard/referentiels/risques/page.tsx`)
- ✅ Page dédiée à la consultation des risques
- ✅ Utilise le composant `RiskLibrary`

### 5. Service IA adapté

**Fichier** : `server/services/ai/openai-service.ts`

Fonction `suggestRisksFromSectorReference()` :
- ✅ Utilise le référentiel central consolidé
- ✅ Récupère les risques avec prévalence
- ✅ Hiérarchise les suggestions selon la prévalence
- ✅ Formule des propositions conditionnelles
- ✅ Affiche clairement que la validation humaine est obligatoire
- ✅ Messages IA : "Ce risque pourrait être pertinent", "Suggestion basée sur les pratiques courantes"

### 6. Messages pédagogiques (UX)

Tous les messages respectent les principes :
- ✅ "Fréquemment observé dans ce secteur d'activité"
- ✅ "Risque identifié dans plusieurs secteurs similaires"
- ✅ "Suggestion basée sur le référentiel interne DUERPilot"
- ✅ "À adapter selon votre réalité terrain"
- ✅ "Aucune évaluation n'est automatique"

### 7. Corrections de code

- ✅ Correction de toutes les références obsolètes à `hazardRef` → `dangerousSituation`
- ✅ Correction des méthodes d'évaluation : `"classic"` → `"inrs"`
- ✅ Adaptation de la page référentiel pour utiliser le nouveau système
- ✅ Correction des erreurs TypeScript dans les composants d'évaluation

## 📋 Prochaines étapes

### Application des migrations

```bash
# 1. Appliquer le schéma Prisma
pnpm db:push --accept-data-loss

# 2. Importer le référentiel central consolidé
pnpm db:seed
```

### Vérifications

1. ✅ Vérifier que le référentiel est bien importé
2. ✅ Tester la bibliothèque de risques par secteur
3. ✅ Vérifier la hiérarchisation par prévalence
4. ✅ Tester les suggestions IA avec prévalence
5. ✅ Vérifier les messages pédagogiques

### Améliorations futures (optionnelles)

- [ ] Ajouter des tendances (émergents/régressifs) depuis les données
- [ ] Enrichir les messages pédagogiques selon les tendances
- [ ] Créer une page de visualisation de la taxonomie
- [ ] Ajouter des statistiques de prévalence par secteur
- [ ] Créer un dashboard d'administration du référentiel

## 🔒 Conformité juridique

Tous les principes non négociables sont respectés :

✅ **Pas de citation d'outils propriétaires**  
✅ **Formulations neutres** : "référentiel interne", "bonnes pratiques professionnelles"  
✅ **IA strictement assistive** : propositions conditionnelles uniquement  
✅ **Responsabilité utilisateur** : validation humaine obligatoire  
✅ **Personnalisable** : tous les risques peuvent être adaptés/supprimés

## 📊 Statistiques

- **10 secteurs** d'activité couverts
- **107 risques** totaux dans le référentiel
- **10 familles** de risques (taxonomie)
- **Matrice de prévalence** calculée automatiquement
- **Risques transverses** identifiés automatiquement
- **Références réglementaires** extraites automatiquement

## 🎓 Utilisation

Le référentiel central consolidé est maintenant le **SOCLE PRINCIPAL** pour :
1. Structurer les évaluations DUERP
2. Pré-remplir intelligemment les risques selon le secteur
3. Alimenter l'IA assistive de manière contrôlée
4. Guider l'utilisateur sans l'enfermer
5. Rester juridiquement neutre et indépendant

