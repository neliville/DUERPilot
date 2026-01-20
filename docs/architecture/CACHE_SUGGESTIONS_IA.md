# Cache des Suggestions IA

## Problème résolu

Avant cette implémentation, chaque fois qu'un utilisateur :
- Naviguait entre les étapes de l'assistant DUERP
- Revenait sur l'étape d'évaluation
- Cliquait sur "Suggérer des dangers (IA)"

...une nouvelle requête était envoyée à l'API OpenAI, **consommant inutilement des crédits** et ralentissant l'expérience utilisateur.

## Solution mise en place

### 1. Cache en base de données

Création d'une table `HazardSuggestionCache` qui stocke :
- Les suggestions IA par unité de travail
- Une date d'expiration (24h par défaut)
- Les suggestions sous forme JSON

**Avantages :**
- ✅ Pas de nouvelle requête OpenAI si suggestions récentes (<24h)
- ✅ Persistance entre sessions utilisateur
- ✅ Économie de coûts API
- ✅ Réponse instantanée

### 2. Cache en mémoire React

Utilisation d'un `Map` dans le state React pour :
- Conserver les suggestions lors de la navigation entre étapes
- Éviter les rechargements inutiles
- Améliorer la fluidité UX

**Avantages :**
- ✅ Navigation fluide sans perte de données
- ✅ Pas de rechargement visible pour l'utilisateur
- ✅ Indicateur visuel "En cache"

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Frontend (evaluation-step.tsx)                          │
│                                                          │
│  • Map<workUnitId, suggestions[]> (cache React)         │
│  • useEffect pour charger depuis cache local            │
│  • Bouton "Actualiser" pour forcer le rafraîchissement │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ tRPC Router (riskAssessments.ts)                        │
│                                                          │
│  1. Vérifier cache DB (expiresAt > now)                │
│  2. Si valide → retourner cache                         │
│  3. Si expiré/absent → appel OpenAI                     │
│  4. Sauvegarder nouveau cache (24h)                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ OpenAI Service (openai-service.ts)                      │
│                                                          │
│  • suggestHazardsForWorkUnit()                          │
│  • Logger l'utilisation IA pour monitoring              │
│  • Retourner suggestions + confiance                    │
└─────────────────────────────────────────────────────────┘
```

## Modèle Prisma

```prisma
model HazardSuggestionCache {
  id           String   @id @default(cuid())
  workUnitId   String   @unique
  suggestions  Json     // Array des suggestions IA
  expiresAt    DateTime // Invalider après 24h
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  workUnit WorkUnit @relation(fields: [workUnitId], references: [id], onDelete: Cascade)

  @@index([workUnitId])
  @@index([expiresAt])
}
```

## Flux d'utilisation

### Premier appel (cache vide)

```
Utilisateur clique "Suggérer des dangers (IA)"
  ↓
tRPC vérifie cache DB → ABSENT
  ↓
Appel OpenAI API (consommation de crédits)
  ↓
Sauvegarde en DB (expiresAt = now + 24h)
  ↓
Sauvegarde en React Map
  ↓
Affichage : "X suggestions générées (nouvelles suggestions)"
```

### Appels suivants (cache valide)

```
Utilisateur clique "Suggérer des dangers (IA)"
  ↓
tRPC vérifie cache DB → PRÉSENT & NON EXPIRÉ
  ↓
Retour immédiat depuis cache (pas d'appel OpenAI)
  ↓
Sauvegarde en React Map
  ↓
Affichage : "X suggestions générées (suggestions précédentes)"
Badge "En cache" visible
```

### Navigation entre étapes

```
Utilisateur navigue : Étape 2 → Étape 3 → Étape 2
  ↓
useEffect détecte changement de selectedWorkUnitId
  ↓
Vérifie React Map → suggestions présentes
  ↓
Affichage immédiat (pas de requête réseau)
```

## Invalidation du cache

### Automatique
- **Expiration temporelle** : 24h après création
- **Suppression de l'unité de travail** : CASCADE DELETE

### Manuelle
- Bouton **"Actualiser"** dans l'UI
  - Force un nouveau calcul IA
  - Met à jour le cache DB
  - Reset l'expiration à +24h

## Monitoring des coûts

Chaque appel OpenAI est loggé dans `AIUsageLog` avec :
- Nombre de tokens (input/output)
- Coût estimé
- Fonction appelée (`suggest_hazards_for_work_unit`)
- Contexte (tenantId, userId, companyId)

Cela permet de :
- ✅ Tracer la consommation par tenant
- ✅ Facturer les plans selon l'usage IA
- ✅ Identifier les abus potentiels

## Configuration

### Durée de cache

Par défaut : **24 heures**

Pour modifier, éditer dans `riskAssessments.ts` :

```typescript
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 24); // Modifier ici
```

### Forcer le rafraîchissement

L'endpoint accepte un paramètre optionnel :

```typescript
api.riskAssessments.suggestHazards.useQuery({
  workUnitId: "...",
  forceRefresh: true, // Bypass le cache
})
```

## Impact sur les coûts

### Avant (sans cache)
- Navigation : **10 suggestions** = 10 appels OpenAI
- Coût estimé : ~0.10€

### Après (avec cache)
- Navigation : **1 suggestion + 9 cache** = 1 appel OpenAI
- Coût estimé : ~0.01€
- **Économie : 90%**

## Bonnes pratiques

1. **Ne jamais bypasser le cache en production** sauf si l'utilisateur clique explicitement sur "Actualiser"
2. **Monitorer les logs IA** pour détecter les patterns d'utilisation
3. **Ajuster la durée de cache** selon les retours utilisateurs
4. **Nettoyer les caches expirés** avec un CRON job hebdomadaire

## Migrations futures possibles

- [ ] Cache partagé entre utilisateurs du même tenant (si pertinent)
- [ ] Invalidation du cache si l'unité de travail est modifiée
- [ ] Versionning du cache pour gérer les évolutions du référentiel
- [ ] Compression des suggestions JSON pour optimiser la BD
