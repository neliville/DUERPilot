# Configuration des Workflows n8n - DUERPilot

Ce document décrit les 6 workflows n8n principaux pour l'orchestration avancée des emails.

## Prérequis

1. Instance n8n opérationnelle (self-hosted ou cloud)
2. Accès API Brevo configuré dans n8n
3. Webhooks n8n accessibles depuis le backend DUERPilot
4. Variables d'environnement configurées (voir `.env.example`)

---

## Architecture

```
Backend DUERPilot → Webhook n8n → Logique conditionnelle → Brevo API → Email
```

---

## Workflow 1 : AI Suggestions (Délai + Relance)

**Objectif** : Envoyer un email si les suggestions IA ne sont pas consultées dans les 2h.

**Template Brevo** : `ai_suggestions_available` (ID: 9)

### Structure

```
1. Webhook (reçoit les données du backend)
   ↓
2. Attendre 2 heures (Wait node)
   ↓
3. Vérifier si consulté (HTTP Request vers backend API)
   ↓
4. IF non consulté :
   → Envoyer email via Brevo
   ELSE :
   → Arrêter le workflow
```

### Configuration Webhook

- **URL** : `https://n8n.duerpilot.fr/webhook/ai-suggestions`
- **Méthode** : POST
- **Données reçues** :
  ```json
  {
    "templateId": "ai_suggestions_available",
    "to": "user@example.com",
    "variables": {
      "suggestionsCount": 5,
      "riskContext": "Risques prioritaires",
      "viewLink": "https://duerpilot.fr/dashboard/suggestions"
    },
    "userId": "user-id",
    "tenantId": "tenant-id"
  }
  ```

### Node "Vérifier si consulté"

- **Type** : HTTP Request
- **URL** : `https://duerpilot.fr/api/trpc/riskAssessments.getAISuggestionsStatus`
- **Méthode** : POST
- **Body** : `{ "userId": "{{ $json.userId }}" }`
- **Condition** : Si `consulted === false`, continuer

### Node "Envoyer via Brevo"

- **Type** : Brevo (ou HTTP Request vers Brevo API)
- **Action** : Send Transactional Email
- **Template ID** : 9
- **To** : `{{ $json.to }}`
- **Params** : `{{ $json.variables }}`

---

## Workflow 2 : Import Onboarding (Séquence)

**Objectif** : Séquence d'emails après un import réussi (J+0, J+1, J+3).

**Template Brevo** : `import_success` (ID: 10)

### Structure

```
1. Webhook (reçoit les données)
   ↓
2. Envoyer email J+0 (immédiat)
   ↓
3. Attendre 24h
   ↓
4. Envoyer email J+1 (prochaines étapes)
   ↓
5. Attendre 48h supplémentaires
   ↓
6. Envoyer email J+3 (aide disponible)
```

### Configuration

**Email J+0** :
- Template : `import_success` (ID: 10)
- Variables : `fileName`, `risksImported`, `nextStepsLink`

**Email J+1** :
- Template : Créer un nouveau template `import_next_steps` (ID: 15)
- Variables : `dashboardLink`, `tutorialLink`

**Email J+3** :
- Template : Créer un nouveau template `import_support_available` (ID: 16)
- Variables : `supportLink`, `documentationLink`

### Notes

- Utiliser des **Wait nodes** avec durée configurable
- Stocker l'état dans une variable workflow pour éviter les doublons
- Vérifier si l'utilisateur a déjà complété les étapes (optionnel)

---

## Workflow 3 : Validation Import (Relances)

**Objectif** : Relancer l'utilisateur si un import nécessite validation (J+0, J+1, J+3).

**Template Brevo** : `import_needs_validation` (ID: 11)

### Structure

```
1. Webhook (reçoit les données)
   ↓
2. Envoyer notification J+0
   ↓
3. Attendre 24h
   ↓
4. Vérifier si validé (HTTP Request)
   ↓
5. IF non validé :
   → Envoyer relance J+1
   ↓
6. Attendre 48h supplémentaires
   ↓
7. Vérifier si validé
   ↓
8. IF non validé :
   → Envoyer relance urgente J+3
```

### Configuration

- **Vérification validation** : HTTP Request vers `api.imports.getById`
- **Condition** : `status !== "validated"`
- **Relance urgente** : Modifier le ton du message (template différent ou variables)

---

## Workflow 4 : Monthly Digest (Batch Mensuel)

**Objectif** : Envoyer une synthèse mensuelle QSE le 1er de chaque mois.

**Template Brevo** : `monthly_qse_summary` (ID: 13)

### Structure

```
1. Cron (1er du mois à 9h00)
   ↓
2. Query Prisma (utilisateurs actifs du mois précédent)
   ↓
3. Loop sur chaque utilisateur
   ↓
4. Calculer statistiques (risques créés, actions complétées)
   ↓
5. Envoyer email personnalisé via Brevo
```

### Configuration Cron

- **Schedule** : `0 9 1 * *` (1er du mois à 9h00)
- **Timezone** : Europe/Paris

### Node "Query Prisma"

- **Type** : HTTP Request
- **URL** : `https://duerpilot.fr/api/trpc/admin.analytics.getActiveUsersLastMonth`
- **Méthode** : POST
- **Headers** : `Authorization: Bearer {{ $env.N8N_API_KEY }}`

### Node "Calculer Statistiques"

- **Type** : HTTP Request
- **URL** : `https://duerpilot.fr/api/trpc/admin.analytics.getMonthlyStats`
- **Body** : `{ "userId": "{{ $json.userId }}", "month": "2025-01" }`

### Node "Envoyer Email"

- **Template ID** : 13
- **Variables** :
  ```json
  {
    "month": "Janvier 2025",
    "risksCreated": 12,
    "actionsCompleted": 8,
    "reportLink": "https://duerpilot.fr/dashboard/reports/monthly"
  }
  ```

### Filtres

- **Plan requis** : Starter, Pro, Expert uniquement
- **Préférences** : Vérifier `monthlyDigest === true`
- **Activité** : Utilisateurs avec au moins 1 action dans le mois

---

## Workflow 5 : Inactivity Nudge (Conversion)

**Objectif** : Relancer les utilisateurs inactifs (J+7, J+14, J+30).

**Template Brevo** : `inactivity_nudge` (ID: 14)

### Structure

```
1. Cron (tous les jours à 10h00)
   ↓
2. Query utilisateurs inactifs (J+7, J+14, J+30)
   ↓
3. Loop sur chaque utilisateur
   ↓
4. Personnaliser message selon jours d'inactivité
   ↓
5. Envoyer email via Brevo
```

### Configuration Cron

- **Schedule** : `0 10 * * *` (tous les jours à 10h00)

### Node "Query Inactifs"

- **Type** : HTTP Request
- **URL** : `https://duerpilot.fr/api/trpc/admin.analytics.getInactiveUsers`
- **Body** : `{ "days": [7, 14, 30] }`

### Personnalisation Message

- **J+7** : Message amical, rappel des fonctionnalités
- **J+14** : Message plus incitatif, offre d'aide
- **J+30** : Message urgent, risque de perte de données

### Variables Dynamiques

```json
{
  "daysSinceLastLogin": 7,
  "featureHighlight": "Nouvelle fonctionnalité d'import",
  "loginLink": "https://duerpilot.fr/auth/signin"
}
```

### Filtres

- **Plan** : Tous sauf Free (ou inclure Free avec message différent)
- **Préférences** : Vérifier `marketingEmails === true`
- **Limite** : 1 email par période (ne pas spammer)

---

## Workflow 6 : Upsell Triggers (Friction Moments)

**Objectif** : Détecter les moments de friction (quota 80%) et proposer un upgrade.

**Template Brevo** : Créer `quota_upsell_offer` (ID: 17)

### Structure

```
1. Webhook (quota atteint 80%)
   ↓
2. Attendre 24h (laisser l'utilisateur réfléchir)
   ↓
3. Vérifier si toujours à 80%+
   ↓
4. Envoyer email upsell
   ↓
5. Attendre 3 jours
   ↓
6. Envoyer rappel (si toujours à 80%+)
   ↓
7. Attendre 4 jours supplémentaires
   ↓
8. Envoyer offre limitée (si toujours à 80%+)
```

### Configuration

**Email Upsell** :
- Template : `quota_upsell_offer` (ID: 17)
- Variables : `currentPlan`, `recommendedPlan`, `upgradeLink`, `discountCode`

**Email Rappel** :
- Template : Créer `quota_upsell_reminder` (ID: 18)
- Variables : `currentPlan`, `recommendedPlan`, `upgradeLink`

**Email Offre Limitée** :
- Template : Créer `quota_upsell_limited` (ID: 19)
- Variables : `currentPlan`, `recommendedPlan`, `upgradeLink`, `discountCode`, `expiresIn`

### Webhook Trigger

- **URL** : `https://n8n.duerpilot.fr/webhook/quota-warning`
- **Données** :
  ```json
  {
    "userId": "user-id",
    "email": "user@example.com",
    "quotaType": "evaluations",
    "percentUsed": 80,
    "currentPlan": "starter",
    "recommendedPlan": "pro"
  }
  ```

### Logique Conditionnelle

- **Vérifier quota** : HTTP Request vers `api.plans.getUsage`
- **Condition** : `percentUsed >= 80`
- **Plan recommandé** : Logique basée sur `currentPlan` (Starter → Pro, Pro → Expert)

---

## Configuration n8n

### Variables d'Environnement n8n

```bash
BREVO_API_KEY=xkeysib-...
DUERPILOT_API_URL=https://duerpilot.fr
DUERPILOT_API_KEY=...
```

### Credentials Brevo

1. **Aller dans** : Settings > Credentials
2. **Créer** : "Brevo API"
3. **Type** : Generic Credential Type
4. **API Key** : `{{ $env.BREVO_API_KEY }}`

### Webhooks Publics

Pour que le backend puisse déclencher les workflows, les webhooks doivent être **publics** :

1. **Créer le webhook node**
2. **Activer** : "Public" dans les paramètres
3. **Copier l'URL** : `https://n8n.duerpilot.fr/webhook/xxx`
4. **Ajouter dans** : `.env` du backend

---

## Tests

### Test Manuel

1. **Déclencher le webhook** via Postman ou curl :
   ```bash
   curl -X POST https://n8n.duerpilot.fr/webhook/ai-suggestions \
     -H "Content-Type: application/json" \
     -d '{
       "templateId": "ai_suggestions_available",
       "to": "test@example.com",
       "variables": {
         "suggestionsCount": 5,
         "riskContext": "Test",
         "viewLink": "https://duerpilot.fr"
       },
       "userId": "test-user",
       "tenantId": "test-tenant"
     }'
   ```

2. **Vérifier l'exécution** dans n8n (Execution History)
3. **Vérifier la réception** de l'email

### Test Automatisé

Créer un workflow de test qui :
1. Déclenche chaque workflow
2. Vérifie les conditions
3. Log les résultats

---

## Monitoring

### Logs n8n

- **Vérifier** : Execution History dans n8n
- **Alertes** : Configurer des notifications en cas d'échec

### Métriques

- **Taux d'envoi** : Nombre d'emails envoyés par workflow
- **Taux d'ouverture** : Via webhooks Brevo
- **Taux de conversion** : Pour les workflows upsell

---

## Maintenance

### Mise à Jour des Templates

Si un template Brevo change d'ID :
1. **Mettre à jour** : `server/services/email/templates.ts`
2. **Tester** : Le workflow concerné
3. **Déployer** : Nouvelle version

### Désactivation Temporaire

Pour désactiver un workflow :
1. **Désactiver** : Le workflow dans n8n
2. **OU** : Retirer l'URL webhook de `.env`

---

## Support

Pour toute question :
- Documentation n8n : https://docs.n8n.io
- Fichier de configuration : `server/services/email/templates.ts`
- Logs backend : Vérifier `EmailLog` dans Prisma

