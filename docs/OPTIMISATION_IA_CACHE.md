# Optimisation IA : Système de Cache des Suggestions

## Résumé

Cette optimisation résout le problème de **consommation excessive de l'API OpenAI** lors de la navigation dans l'Assistant DUERP. Avant cette implémentation, chaque retour sur l'étape d'évaluation déclenchait un nouvel appel coûteux.

**Impact :** Économie de **~90%** des coûts API sur cas d'usage typique.

## Modifications apportées

### 1. Base de données

**Nouveau modèle : `HazardSuggestionCache`**

```prisma
model HazardSuggestionCache {
  id           String   @id @default(cuid())
  workUnitId   String   @unique
  suggestions  Json     
  expiresAt    DateTime 
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  workUnit WorkUnit @relation(fields: [workUnitId], references: [id], onDelete: Cascade)
}
```

**Fichiers modifiés :**
- `prisma/schema.prisma`
- `prisma/migrations/add_hazard_suggestion_cache/migration.sql`

### 2. Backend tRPC

**Endpoint modifié : `riskAssessments.suggestHazards`**

Nouveau comportement :
1. Vérifie si un cache valide existe (< 24h)
2. Si oui → retourne le cache (pas d'appel OpenAI)
3. Si non → appelle OpenAI et sauvegarde en cache

```typescript
// Nouveau retour
{
  suggestions: [...],
  fromCache: boolean,  // Nouveau champ
  expiresAt: Date,     // Nouveau champ
}
```

**Fichier modifié :**
- `server/api/routers/riskAssessments.ts`

### 3. Frontend React

**Composant modifié : `evaluation-step.tsx`**

Nouveautés :
- State `cachedSuggestions` : Map<workUnitId, suggestions[]>
- `useEffect` : Charge suggestions depuis cache local lors du changement d'UT
- Badge "En cache" visible quand suggestions récupérées du cache
- Bouton "Actualiser" pour forcer un nouveau calcul
- Toast différenciés : "(nouvelles)" vs "(précédentes)"

**Fichiers modifiés :**
- `components/assistance/steps/evaluation-step.tsx`
- `components/assistance/risk-assessment-dialog-wizard.tsx`

### 4. Documentation

**Nouveaux fichiers :**
- `docs/architecture/CACHE_SUGGESTIONS_IA.md` - Documentation technique complète
- `scripts/clean-expired-cache.ts` - Script de maintenance CRON

**Fichiers mis à jour :**
- `CHANGELOG.md` - Version 1.1.0 documentée
- `docs/OPTIMISATION_IA_CACHE.md` - Ce fichier

## Flux technique

### Premier appel (cache vide)

```
┌─────────────────────────────────────────────┐
│ Utilisateur clique "Suggérer dangers (IA)" │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ tRPC vérifie cache DB                       │
│ → ABSENT ou EXPIRÉ                          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Appel OpenAI API                            │
│ → Consommation de crédits                   │
│ → Tokens loggés dans AIUsageLog             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Sauvegarde en DB                            │
│ → expiresAt = now + 24h                     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Sauvegarde en React Map                     │
│ → cachedSuggestions.set(workUnitId, [...])  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Affichage                                   │
│ → "X suggestions (nouvelles suggestions)"   │
└─────────────────────────────────────────────┘
```

### Appels suivants (cache valide)

```
┌─────────────────────────────────────────────┐
│ Utilisateur clique "Suggérer dangers (IA)" │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ tRPC vérifie cache DB                       │
│ → PRÉSENT & NON EXPIRÉ                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Retour immédiat                             │
│ → Pas d'appel OpenAI                        │
│ → fromCache: true                           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Sauvegarde en React Map                     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Affichage                                   │
│ → "X suggestions (suggestions précédentes)" │
│ → Badge "En cache" visible                  │
└─────────────────────────────────────────────┘
```

### Navigation entre étapes

```
┌─────────────────────────────────────────────┐
│ Utilisateur : Étape 2 → 3 → 2               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ useEffect détecte changement workUnitId     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Vérifie React Map                           │
│ → cachedSuggestions.has(workUnitId)         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Affichage immédiat                          │
│ → Pas de requête réseau                     │
│ → UX fluide                                 │
└─────────────────────────────────────────────┘
```

## Migration

### 1. Appliquer la migration

```bash
# Appliquer le schéma à la base de données
npx prisma db push

# Générer le client Prisma
npx prisma generate
```

### 2. Redémarrer le serveur

```bash
# En développement
npm run dev

# En production
pm2 restart duerpilot
# ou
systemctl restart duerpilot
```

### 3. (Optionnel) Configurer le nettoyage automatique

Ajouter au crontab :

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne (nettoyage tous les dimanches à 3h)
0 3 * * 0 cd /path/to/duerpilot && npx tsx scripts/clean-expired-cache.ts >> /var/log/duerpilot-cache-clean.log 2>&1
```

## Tests à effectuer

### Test 1 : Premier appel (cache vide)

1. Aller sur `/dashboard/assistance`
2. Créer une nouvelle unité de travail "Bureau"
3. Cliquer sur "Suggérer des dangers (IA)"
4. **Vérifier** : Toast "X suggestions générées (nouvelles suggestions)"
5. **Vérifier** : Pas de badge "En cache"

### Test 2 : Second appel (cache valide)

1. Depuis la même unité de travail
2. Fermer les suggestions (bouton "Fermer")
3. Re-cliquer sur "Suggérer des dangers (IA)"
4. **Vérifier** : Toast "X suggestions générées (suggestions précédentes)"
5. **Vérifier** : Badge "En cache" visible

### Test 3 : Navigation entre étapes

1. Avoir des suggestions affichées
2. Cliquer sur "Suivant →" (aller à l'étape 3)
3. Cliquer sur "← Retour" (revenir à l'étape 2)
4. **Vérifier** : Les suggestions sont toujours affichées
5. **Vérifier** : Pas de rechargement visible

### Test 4 : Actualiser manuellement

1. Avoir des suggestions en cache
2. Cliquer sur le bouton "Actualiser"
3. **Vérifier** : Toast "X suggestions générées (nouvelles suggestions)"
4. **Vérifier** : Badge "En cache" disparaît puis réapparaît

### Test 5 : Nettoyage du cache expiré

1. Exécuter le script :
   ```bash
   npx tsx scripts/clean-expired-cache.ts
   ```
2. **Vérifier** : Sortie console affiche le nombre de caches supprimés
3. **Vérifier** : Pas d'erreurs

## Monitoring

### Vérifier les logs IA

```sql
-- Compter les appels OpenAI pour suggestions de dangers
SELECT 
  COUNT(*) as total_calls,
  SUM("inputTokens") as total_input_tokens,
  SUM("outputTokens") as total_output_tokens
FROM "ai_usage_logs"
WHERE function = 'suggest_hazards_for_work_unit'
  AND "createdAt" > NOW() - INTERVAL '7 days';
```

### Vérifier les caches

```sql
-- Statistiques des caches
SELECT 
  COUNT(*) as total_caches,
  COUNT(*) FILTER (WHERE "expiresAt" > NOW()) as valid_caches,
  COUNT(*) FILTER (WHERE "expiresAt" <= NOW()) as expired_caches
FROM "hazard_suggestion_cache";
```

### Vérifier l'âge moyen des caches

```sql
-- Âge moyen des caches valides
SELECT 
  AVG(EXTRACT(EPOCH FROM (NOW() - "createdAt")) / 3600) as avg_age_hours
FROM "hazard_suggestion_cache"
WHERE "expiresAt" > NOW();
```

## Configuration

### Modifier la durée de cache

Dans `server/api/routers/riskAssessments.ts` :

```typescript
// Actuellement : 24 heures
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 24);

// Pour changer à 48 heures :
expiresAt.setHours(expiresAt.getHours() + 48);

// Pour changer à 7 jours :
expiresAt.setDate(expiresAt.getDate() + 7);
```

## Dépannage

### Problème : Cache ne se crée pas

**Symptôme :** Toast affiche toujours "(nouvelles suggestions)"

**Solution :**
1. Vérifier que la table existe :
   ```sql
   SELECT * FROM "hazard_suggestion_cache" LIMIT 1;
   ```
2. Vérifier les logs backend pour erreurs Prisma
3. Vérifier que `npx prisma generate` a bien été exécuté

### Problème : Cache ne s'invalide jamais

**Symptôme :** Suggestions toujours identiques même après 24h

**Solution :**
1. Vérifier la date d'expiration en DB :
   ```sql
   SELECT "workUnitId", "expiresAt", "createdAt" 
   FROM "hazard_suggestion_cache";
   ```
2. Forcer l'actualisation avec le bouton "Actualiser"
3. Exécuter manuellement le script de nettoyage

### Problème : Suggestions disparaissent lors de la navigation

**Symptôme :** Revenir sur l'étape 2 n'affiche plus les suggestions

**Solution :**
1. Vérifier que le `useEffect` se déclenche bien (console.log)
2. Vérifier que `cachedSuggestions` est bien une Map
3. Vérifier que `selectedWorkUnitId` ne change pas inopinément

## Performance attendue

### Avant optimisation
- 10 navigations entre étapes
- 10 appels OpenAI
- ~10,000 tokens consommés
- Coût estimé : **~0.10€**
- Latence : 2-3 secondes par appel

### Après optimisation
- 10 navigations entre étapes
- 1 appel OpenAI + 9 lectures cache
- ~1,000 tokens consommés
- Coût estimé : **~0.01€**
- Latence : 
  - Premier appel : 2-3 secondes
  - Suivants : <100ms

**Économie : 90% des coûts et 95% du temps de chargement**

## Roadmap

### Version future (1.2.0)
- [ ] Cache partagé entre utilisateurs du même tenant
- [ ] Invalidation automatique si l'UT est modifiée
- [ ] Versionning du cache (gérer évolutions du référentiel)
- [ ] Compression JSON des suggestions
- [ ] Dashboard admin pour visualiser les caches

## Contributeurs

- Implémentation : AI Assistant
- Revue : @neliville
- Date : 2026-01-20
