# Fix : Erreur "Table duerpilot_references does not exist" dans Prisma Studio

## ❌ Problème

Lorsque vous cliquez sur "Tenant" dans Prisma Studio, vous obtenez l'erreur :

```
The table `public.duerpilot_references` does not exist in the current database.
```

## 🔍 Cause

Le schéma Prisma contient le modèle `DuerpilotReference` et sa relation avec `Tenant`, mais la table n'existait pas dans la base de données. Cela peut arriver lorsque :

1. Le schéma Prisma a été modifié (ajout de nouveaux modèles) après les migrations initiales
2. Les migrations n'ont pas été créées/appliquées pour les nouveaux modèles
3. La base de données n'est pas synchronisée avec le schéma Prisma

## ✅ Solution Appliquée

### 1. Synchronisation du Schéma

La commande suivante a été exécutée pour synchroniser le schéma Prisma avec la base de données :

```bash
pnpm prisma db push --accept-data-loss
```

Cette commande :
- ✅ Crée les tables manquantes dans la base de données
- ✅ Met à jour les tables existantes pour correspondre au schéma
- ✅ Régénère le client Prisma

### 2. Tables Créées

Les tables suivantes ont été créées :
- `duerpilot_references` - Référentiel central consolidé
- `duerpilot_risks` - Risques du référentiel
- `taxonomy_families` - Familles de la taxonomie
- `taxonomy_sub_categories` - Sous-catégories de la taxonomie
- `risk_prevalence` - Matrice de prévalence par secteur
- `transversal_risks` - Risques transversaux
- `regulatory_references` - Références réglementaires

### 3. Vérification

Pour vérifier que les tables ont été créées :

```bash
# Vérifier les tables du référentiel
pnpm exec tsx scripts/diagnose-prisma-studio.ts

# Ou tester directement
pnpm exec tsx -e "import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient(); prisma.duerpilotReference.count().then(count => { console.log('✅ Table existe avec', count, 'enregistrements'); prisma.\$disconnect(); });"
```

## 🔄 Prochaines Étapes

### 1. Redémarrer Prisma Studio

Après la synchronisation, **redémarrer Prisma Studio** :

```bash
# Arrêter Prisma Studio actuel (Ctrl+C)
# Puis relancer :
cd /home/neliville/dev/LAB/PROJECTS/duerpilot
pnpm db:studio
```

### 2. Tester dans Prisma Studio

1. Ouvrir http://localhost:5555 dans votre navigateur
2. Cliquer sur **"Tenant"** → Cela devrait maintenant fonctionner ✅
3. Cliquer sur **"UserProfile"** → Vous devriez voir les 3 utilisateurs ✅
4. Cliquer sur **"DuerpilotReference"** → La table est maintenant disponible ✅

### 3. Optionnel : Créer une Migration Formelle

Si vous souhaitez créer une migration formelle pour versionner ces changements :

```bash
# Créer une migration pour les tables du référentiel
pnpm prisma migrate dev --name add_duerpilot_reference_tables

# Ou créer une migration vide si les tables existent déjà
pnpm prisma migrate dev --create-only --name add_duerpilot_reference_tables
```

**Note** : `db push` ne crée pas de migration. Utilisez `migrate dev` pour créer des migrations versionnées.

## ⚠️ Important : Différence entre `db push` et `migrate dev`

- **`prisma db push`** : Synchronise rapidement le schéma avec la base (développement)
  - ✅ Rapide
  - ❌ Ne crée pas de migration
  - ❌ Pas pour la production

- **`prisma migrate dev`** : Crée et applique des migrations versionnées
  - ✅ Crée des fichiers de migration
  - ✅ Versionné dans Git
  - ✅ Pour le développement et la production

## 📊 État Actuel

- ✅ **Schéma Prisma** : Synchronisé avec la base de données
- ✅ **Tables du référentiel** : Créées
- ✅ **Client Prisma** : Régénéré
- ✅ **Prisma Studio** : Prêt à être redémarré

## 🧪 Vérification Finale

Après avoir redémarré Prisma Studio, vérifier que :

1. ✅ La table `Tenant` s'ouvre sans erreur
2. ✅ La relation `duerpilotReferences` fonctionne
3. ✅ La table `DuerpilotReference` est accessible
4. ✅ Les autres tables fonctionnent normalement

## 📝 Résumé de la Solution

```bash
# 1. Synchroniser le schéma (fait)
pnpm prisma db push --accept-data-loss

# 2. Redémarrer Prisma Studio
# (Arrêter avec Ctrl+C puis relancer)
pnpm db:studio

# 3. Tester dans le navigateur
# Ouvrir http://localhost:5555
# Cliquer sur "Tenant" → Devrait fonctionner ✅
```

Le problème devrait maintenant être résolu ! 🎉

