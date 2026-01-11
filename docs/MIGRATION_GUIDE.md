# Guide de migration - Référentiel DUERP Propriétaire

## Vue d'ensemble

Ce guide documente la migration du référentiel OiRA vers le référentiel DUERP propriétaire conforme au Code du travail français.

## Changements majeurs

### Schéma Prisma

#### Tables supprimées

Les 6 tables OiRA suivantes ont été complètement supprimées :
- `oira_referentials`
- `oira_sectors`
- `oira_risk_domains`
- `oira_questions`
- `oira_prevention_measures`
- `oira_user_responses`

#### Nouvelles tables

4 nouvelles tables ont été créées :
- `activity_sectors` - Secteurs d'activité (BTP, Restauration, Bureau, etc.)
- `danger_categories` - 9 catégories de dangers (PHY, CHI, BIO, etc.)
- `dangerous_situations` - Situations dangereuses types par catégorie
- `prevention_measures` - Mesures de prévention liées aux évaluations

#### Tables modifiées

- `work_units` : Ajout de `suggestedSectorId` (relation vers `activity_sectors`)
- `risk_assessments` : 
  - Suppression de `hazardRefId` et `oiraQuestionId`
  - Ajout de `situationId` (relation vers `dangerous_situations`)
  - Ajout de `contextDescription` (remplace `dangerousSituation`)
  - Ajout de `source` (manual, ai_assisted, imported)
- `action_plans` : Ajout de `preventionMeasureId` (relation vers `prevention_measures`)

### Routers tRPC

#### Routers supprimés

- `oiraReferentials`
- `oiraQuestions`
- `oiraResponses`

#### Nouveaux routers

- `activitySectors` - Gestion des secteurs d'activité
- `dangerCategories` - Gestion des catégories de dangers
- `dangerousSituations` - Gestion des situations dangereuses
- `preventionMeasures` - Gestion des mesures de prévention

#### Routers modifiés

- `riskAssessments` : Utilise maintenant `situationId` au lieu de `hazardRefId`
- `actionPlans` : Supporte maintenant `preventionMeasureId`

### Types TypeScript

#### Types supprimés

- `BusinessSector` (remplacé par table dynamique)

#### Nouveaux types

- `DangerCategoryCode` - Codes des 9 catégories (PHY, CHI, etc.)
- `PreventionMeasureType` - Types de mesures (technique, organisationnelle, etc.)
- `RiskSource` - Source d'évaluation (manual, ai_assisted, imported)
- `EffectivenessLevel` - Niveau d'efficacité (1-4)
- `DangerousSituationSuggestion` - Interface pour suggestions IA de situations
- `PreventionMeasureSuggestion` - Interface pour suggestions IA de mesures

#### Types modifiés

- `RiskCotation` : Conservé pour compatibilité (le champ `control` est toujours utilisé mais n'est plus dans le calcul du score)
- `AISuggestions` : Conservé pour compatibilité, de nouveaux types spécifiques ont été ajoutés

## Commandes de migration

### 1. Générer le client Prisma

```bash
pnpm db:generate
```

### 2. Créer et appliquer la migration

```bash
# Créer une nouvelle migration
pnpm db:migrate --name migrate_to_proprietary_duerp_referential

# Appliquer la migration (si non fait automatiquement)
pnpm prisma migrate deploy
```

**Attention** : Cette migration supprimera toutes les tables OiRA. Si vous avez des données de production, créez un backup avant.

### 3. Exécuter les seeders

```bash
# Peupler le référentiel avec les données initiales
pnpm db:seed
```

Ou manuellement :
```bash
npx tsx prisma/seed.ts
```

Les seeders créent :
- 9 catégories de dangers (PHY, CHI, BIO, ERG, PSY, MEC, ELEC, INC, ORG)
- 10 secteurs d'activité principaux (BTP, Restauration, Bureau, Commerce, etc.)
- ~30 situations dangereuses types par catégorie

## Changements dans le code

### Utilisation des nouveaux routers

#### Avant (OiRA)
```typescript
const sectors = await trpc.oiraReferentials.getAll.query();
const questions = await trpc.oiraQuestions.getBySector.query({ sectorCode: 'BTP' });
```

#### Après (Référentiel propriétaire)
```typescript
const sectors = await trpc.activitySectors.getAll.query();
const situations = await trpc.dangerousSituations.getAll.query({
  sectorCode: 'BTP',
  categoryCode: 'PHY',
});
```

### Création d'une évaluation de risque

#### Avant
```typescript
await trpc.riskAssessments.create.mutate({
  workUnitId: 'xxx',
  hazardRefId: 'yyy',
  dangerousSituation: 'Exposition au bruit',
  // ...
});
```

#### Après
```typescript
await trpc.riskAssessments.create.mutate({
  workUnitId: 'xxx',
  situationId: 'zzz', // ID de la situation dangereuse
  contextDescription: 'Exposition au bruit sur chantier BTP',
  // ...
});
```

### Calcul du score de risque

#### Avant
```typescript
const score = calculateRiskScore(frequency, probability, severity, control); // F × P × G × M
```

#### Après
```typescript
const score = calculateRiskScore(frequency, probability, severity); // F × P × G
// Note: control n'est plus utilisé dans le calcul mais est conservé pour les mesures de prévention
```

## Points d'attention

### Base de données

- ⚠️ Les tables OiRA sont supprimées définitivement lors de la migration
- ⚠️ Les relations `oiraQuestionId` dans `risk_assessments` sont supprimées
- ⚠️ Les données OiRA existantes ne sont pas migrées automatiquement
- ✅ Les évaluations de risques existantes doivent être ré-associées aux nouvelles situations dangereuses

### Code applicatif

- ⚠️ Tous les composants utilisant `hazardRef` doivent être adaptés pour utiliser `dangerousSituation`
- ⚠️ Toutes les références à `oiraQuestions`, `oiraReferentials`, `oiraResponses` doivent être supprimées
- ⚠️ Les calculs de score doivent utiliser la nouvelle formule (F × P × G)

### UI/Frontend

Les composants suivants devront être adaptés (phase suivante) :
- `components/evaluations/risk-assessment-form.tsx`
- `components/evaluations/risk-assessment-list.tsx`
- `components/evaluations/risk-assessment-dialog.tsx`
- Tous les composants utilisant des données OiRA

## Tests

Après migration, vérifier :

1. ✅ Le schéma Prisma génère sans erreur
2. ✅ Les seeders s'exécutent correctement
3. ✅ Les routers tRPC répondent aux requêtes
4. ✅ Les types TypeScript sont corrects
5. ✅ Aucune référence à OiRA ne reste dans le code

## Rétrocompatibilité

**Aucune rétrocompatibilité** : Le référentiel OiRA est complètement supprimé. Les nouvelles évaluations doivent utiliser le nouveau référentiel.

## Support

Pour toute question technique sur la migration, consulter :
- [docs/REFERENTIEL_DUERP.md](./REFERENTIEL_DUERP.md) - Documentation du référentiel
- [DUERPilot_CADRE_REGLEMENTAIIRE.md](../DUERPilot_CADRE_REGLEMENTAIIRE.md) - Cadre réglementaire

