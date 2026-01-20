# Guide de Configuration Brevo pour les Emails d'Activation

## 🔍 Problème : L'utilisateur ne reçoit pas de code d'activation

Si les emails d'activation ne sont pas envoyés, voici la checklist complète de configuration Brevo.

## ✅ Checklist de Configuration

### 1. Variables d'environnement (`.env`)

Vérifiez que ces variables sont présentes dans votre fichier `.env` :

```env
# OBLIGATOIRE : Clé API Brevo
BREVO_API_KEY=xkeysib-votre-cle-api-brevo

# Optionnel (valeurs par défaut si non défini)
EMAIL_FROM=noreply@duerpilot.fr
EMAIL_REPLY_TO=support@duerpilot.fr
EMAIL_CONTACT=contact@duerpilot.fr
NEXTAUTH_URL=http://localhost:3000
PRIVACY_POLICY_URL=http://localhost:3000/legal/privacy
TERMS_URL=http://localhost:3000/legal/terms
```

**Comment obtenir la clé API Brevo :**
1. Connectez-vous à https://app.brevo.com
2. Allez dans **Paramètres** → **API Keys**
3. Créez une nouvelle clé API (ou utilisez une existante)
4. Copiez la clé (format : `xkeysib-...`)
5. Ajoutez-la à `.env` : `BREVO_API_KEY=xkeysib-...`

### 2. Template Brevo `account_activation`

#### A. Créer le template dans Brevo

1. **Connectez-vous à Brevo** : https://app.brevo.com
2. **Allez dans** : **Campaigns** → **Email Templates** → **Transactional Templates**
3. **Créez un nouveau template** :
   - Nom : `account_activation`
   - Type : Transactional Email
   - Catégorie : Transactional

#### B. Configurer l'expéditeur dans le template

**IMPORTANT** : Dans les paramètres du template Brevo, configurez :

- **FROM (Expéditeur)** :
  - Email : `noreply@duerpilot.fr`
  - Nom : `DUERPilot`

- **REPLY_TO (Répondre à)** :
  - Email : `support@duerpilot.fr`
  - Nom : `Support DUERPilot`

**Comment configurer :**
1. Ouvrez le template dans Brevo
2. Cliquez sur **Settings** ou **Paramètres**
3. Dans la section **Sender** :
   - FROM : `noreply@duerpilot.fr`
   - REPLY_TO : `support@duerpilot.fr`

#### C. Ajouter les variables dans le template HTML

Dans le corps du template HTML, utilisez ces variables :

```html
{{ params.activation_code }}
{{ params.support_email }}
{{ params.privacy_policy_url }}
{{ params.terms_url }}
{{ params.unsubscribe_url }}
```

**Exemple de template HTML minimal :**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1>Activez votre compte</h1>
    <p>Utilisez le code ci-dessous pour finaliser votre inscription :</p>
    <div style="border: 2px dashed #ccc; padding: 20px; text-align: center; margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">VOTRE CODE D'ACTIVATION</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 10px 0;">
        {{ params.activation_code }}
      </p>
    </div>
    <p style="background: #fff3cd; padding: 15px; border-radius: 5px;">
      ⏰ Ce code est valide pendant <strong>15 minutes</strong>
    </p>
    <p style="font-size: 12px; color: #666;">
      Support : {{ params.support_email }}<br>
      <a href="{{ params.privacy_policy_url }}">Politique de confidentialité</a> | 
      <a href="{{ params.terms_url }}">CGU</a> | 
      <a href="{{ params.unsubscribe_url }}">Désabonnement</a>
    </p>
  </div>
</body>
</html>
```

#### D. Noter l'ID du template

Une fois le template créé :
1. L'ID est visible dans l'URL : `https://app.brevo.com/email/templates/edit/[ID]`
2. Ou dans les paramètres du template
3. **Notez cet ID** (ex: `2`, `5`, `10`, etc.)

### 3. Mettre à jour le code

Dans `server/services/email/templates.ts`, mettez à jour l'ID du template :

```typescript
account_activation: {
  brevoTemplateId: VOTRE_ID_REEL, // ← Remplacer par l'ID réel du template Brevo
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

**Actuellement configuré** : `brevoTemplateId: 2`

### 4. Vérifier le domaine d'envoi

Si vous utilisez `noreply@duerpilot.fr` :

1. **Dans Brevo** : **Paramètres** → **Domains**
2. **Vérifiez** que le domaine `duerpilot.fr` est :
   - Ajouté
   - Vérifié (DKIM, SPF configurés)
   - Actif

Si le domaine n'est pas vérifié :
- Utilisez temporairement l'adresse par défaut de Brevo
- Ou configurez les enregistrements DNS (DKIM, SPF, DMARC)

## 🧪 Tester la Configuration

### Test 1 : Script de test automatique

```bash
pnpm exec tsx scripts/test-activation-email.ts votre-email@test.com
```

Ce script va :
- ✅ Vérifier que `BREVO_API_KEY` est configuré
- ✅ Vérifier la configuration du template
- ✅ Générer un code de test
- ✅ Envoyer un email de test
- ✅ Afficher les erreurs détaillées si échec

### Test 2 : Test manuel dans Brevo

1. Dans Brevo, ouvrez le template `account_activation`
2. Cliquez sur **"Send a test email"**
3. Remplissez les variables :
   ```
   activation_code: 123456
   support_email: support@duerpilot.fr
   privacy_policy_url: https://duerpilot.fr/legal/privacy
   terms_url: https://duerpilot.fr/legal/terms
   unsubscribe_url: https://duerpilot.fr/settings/notifications
   ```
4. Envoyez à votre email de test
5. Vérifiez que toutes les variables sont remplacées

### Test 3 : Vérifier les logs

Après une tentative d'inscription, vérifiez :

**Logs du serveur Next.js** :
```
📧 [Email account_activation] Envoi à user@example.com via template Brevo #2
```

**Logs Brevo** :
1. Dans Brevo : **Statistics** → **Email Logs**
2. Recherchez l'email envoyé
3. Vérifiez le statut : `sent`, `failed`, `blocked`
4. Vérifiez les erreurs éventuelles

**Base de données** :
```bash
pnpm db:studio
```
Puis vérifiez la table `EmailLog` pour voir les tentatives d'envoi.

## 🐛 Erreurs Courantes et Solutions

### Erreur : "BREVO_API_KEY non configuré"

**Solution** :
1. Vérifiez que `BREVO_API_KEY` est dans `.env`
2. Redémarrez le serveur Next.js après modification de `.env`

### Erreur : "Brevo API error: 401"

**Solution** :
- La clé API est invalide ou expirée
- Générez une nouvelle clé dans Brevo
- Mettez à jour `BREVO_API_KEY` dans `.env`

### Erreur : "Brevo API error: 400"

**Causes possibles** :
1. **Template ID incorrect** : L'ID dans `templates.ts` ne correspond pas au template Brevo
2. **Variables manquantes** : Toutes les variables requises ne sont pas dans le template Brevo
3. **Format des variables incorrect** : Les variables doivent être `{{ params.variable_name }}`

**Solution** :
1. Vérifiez l'ID du template dans Brevo
2. Vérifiez que toutes les variables sont présentes dans le template
3. Vérifiez le format : `{{ params.activation_code }}` (pas `{{ activation_code }}`)

### Erreur : "Template invalide"

**Solution** :
- Vérifiez que `account_activation` existe dans `EMAIL_TEMPLATES`
- Vérifiez que le template est actif dans Brevo

### Email bloqué (status: 'blocked')

**Causes possibles** :
- Domaine non vérifié
- Adresse email dans liste noire
- Préférences utilisateur bloquant les emails

**Solution** :
1. Vérifiez que le domaine est vérifié dans Brevo
2. Vérifiez les logs Brevo pour plus de détails
3. Testez avec une autre adresse email

## 📋 Format des Variables dans Brevo

**IMPORTANT** : Dans les templates Brevo, les variables doivent être référencées avec `{{ params.variable_name }}` :

- ✅ Correct : `{{ params.activation_code }}`
- ❌ Incorrect : `{{ activation_code }}`
- ❌ Incorrect : `{{params.activation_code}}` (espaces requis)

## 🔄 Après Configuration

1. **Redémarrez le serveur Next.js** :
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   pnpm dev
   ```

2. **Testez l'inscription** :
   - Allez sur `/auth/signin`
   - Créez un compte test
   - Vérifiez les logs du serveur
   - Vérifiez votre boîte email (et spams)

3. **Vérifiez les logs Brevo** :
   - Allez dans **Statistics** → **Email Logs**
   - Vérifiez que l'email a été envoyé

## 📞 Support

Si le problème persiste après ces vérifications :
1. Exécutez le script de test : `pnpm exec tsx scripts/test-activation-email.ts votre-email@test.com`
2. Partagez les logs d'erreur
3. Vérifiez les logs Brevo pour plus de détails
