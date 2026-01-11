# Configuration du Template d'Activation Brevo

## 📧 Variables du Template

Le template `account_activation` dans Brevo utilise les variables suivantes :

### Variables obligatoires

| Variable | Description | Exemple |
|----------|-------------|---------|
| `{{ activation_code }}` | Code à 6 chiffres pour l'activation | `123456` |
| `{{ support_email }}` | Email de support client | `support@duerpilot.fr` |
| `{{ privacy_policy_url }}` | URL de la politique de confidentialité | `https://duerpilot.fr/legal/privacy` |
| `{{ terms_url }}` | URL des conditions générales d'utilisation | `https://duerpilot.fr/legal/terms` |
| `{{ unsubscribe_url }}` | URL de désabonnement (géré par Brevo) | `https://duerpilot.fr/settings/notifications` |

## 🔧 Configuration Backend

### Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```bash
# Email de support
# Configuration email (voir CONFIGURATION_EMAIL.md pour plus de détails)
EMAIL_FROM=noreply@duerpilot.fr
EMAIL_REPLY_TO=support@duerpilot.fr
EMAIL_CONTACT=contact@duerpilot.fr
EMAIL_SENDER_NAME=DUERPilot

# URLs légales
PRIVACY_POLICY_URL=https://duerpilot.fr/legal/privacy
TERMS_URL=https://duerpilot.fr/legal/terms

# URL de base (déjà configurée)
NEXTAUTH_URL=https://duerpilot.fr
```

### Valeurs par défaut

Si les variables d'environnement ne sont pas définies, le backend utilise :

- `SUPPORT_EMAIL` → `support@duerpilot.fr`
- `PRIVACY_POLICY_URL` → `${NEXTAUTH_URL}/legal/privacy`
- `TERMS_URL` → `${NEXTAUTH_URL}/legal/terms`
- `unsubscribe_url` → `${NEXTAUTH_URL}/settings/notifications`

## 📋 Configuration dans Brevo

### 1. Créer le template

1. Allez dans **Campaigns** > **Email Templates**
2. Créez un nouveau template transactionnel
3. Collez le HTML fourni
4. Notez l'**ID du template** (ex: `1`)

### 2. Configurer les variables

Dans Brevo, les variables doivent être définies dans le template avec la syntaxe `{{ variable_name }}`.

**Important** : Assurez-vous que toutes les variables sont bien présentes dans le template HTML :
- ✅ `{{ activation_code }}`
- ✅ `{{ support_email }}`
- ✅ `{{ privacy_policy_url }}`
- ✅ `{{ terms_url }}`
- ✅ `{{ unsubscribe_url }}`

### 3. Mettre à jour le backend

Dans `server/services/email/templates.ts`, vérifiez que l'ID du template correspond :

```typescript
account_activation: {
  brevoTemplateId: 1, // ← Remplacer par l'ID réel de votre template
  category: 'transactional',
  alwaysSend: true,
  useN8n: false,
  variables: [
    'activation_code',
    'support_email',
    'privacy_policy_url',
    'terms_url',
    'unsubscribe_url',
  ],
},
```

## ✅ Test du Template

### Test manuel dans Brevo

1. Dans Brevo, utilisez la fonction **"Send a test email"**
2. Remplissez les variables avec des valeurs de test :
   ```
   activation_code: 123456
   support_email: support@duerpilot.fr
   privacy_policy_url: https://duerpilot.fr/legal/privacy
   terms_url: https://duerpilot.fr/legal/terms
   unsubscribe_url: https://duerpilot.fr/settings/notifications
   ```
3. Vérifiez que toutes les variables sont correctement remplacées

### Test depuis le backend

Le code d'activation est automatiquement envoyé lors de l'inscription :

```typescript
// Dans server/api/routers/auth.ts
onUserRegistered({
  id: userProfile.id,
  email: userProfile.email,
  firstName: userProfile.firstName,
  tenantId: userProfile.tenantId,
  verificationCode: verificationCode, // Code à 6 chiffres généré
});
```

## 🔍 Vérification

### Logs backend

Vérifiez les logs pour confirmer l'envoi :

```bash
# Les emails sont loggés dans la table emailLogs
# Vérifiez avec Prisma Studio ou une requête SQL
```

### Vérification des variables envoyées

Dans `server/services/email/brevo-service.ts`, les variables sont loggées en mode développement :

```typescript
console.log(`📧 [DEV] Email ${params.templateId} → ${params.to}`);
console.log(`   Variables:`, JSON.stringify(params.variables, null, 2));
```

## 🚨 Problèmes courants

### Variables non remplacées dans Brevo

- ✅ Vérifiez que les noms de variables correspondent exactement (case-sensitive)
- ✅ Vérifiez que les variables sont bien définies dans le template HTML
- ✅ Vérifiez que l'ID du template dans `templates.ts` correspond à celui dans Brevo

### Email non reçu

- ✅ Vérifiez les logs backend pour les erreurs
- ✅ Vérifiez que `BREVO_API_KEY` est configuré
- ✅ Vérifiez les préférences email de l'utilisateur (RGPD)
- ✅ Vérifiez les spams

### Code d'activation invalide

- ✅ Le code expire après 15 minutes
- ✅ Un nouveau code peut être demandé via `resendVerificationCode`

## 📝 Notes importantes

1. **RGPD** : Le template inclut les mentions légales requises (politique de confidentialité, droit de désabonnement)

2. **Durée de validité** : Le code est valide 15 minutes (configuré dans `auth.ts`)

3. **Sécurité** : Le code est généré de manière sécurisée avec `crypto.randomBytes`

4. **Unsubscribe URL** : Brevo gère automatiquement le désabonnement, mais l'URL est passée pour cohérence

