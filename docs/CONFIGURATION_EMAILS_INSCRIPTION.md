# Configuration des Emails d'Inscription

## 🔍 Problème : Les emails ne sont pas envoyés lors de l'inscription

Lorsqu'un utilisateur s'inscrit, un email de vérification devrait être envoyé automatiquement avec un code à 6 chiffres. Si les emails ne sont pas envoyés, voici les causes possibles et les solutions.

## ⚙️ Configuration requise

### 1. Variables d'environnement

Assurez-vous d'avoir ces variables dans votre fichier `.env` :

```env
# Brevo API (obligatoire)
BREVO_API_KEY=xkeysib-votre-cle-api-brevo

# URL de base (optionnel, utilisé pour les liens dans les emails)
NEXTAUTH_URL=http://localhost:3000

# Adresses email (optionnel, valeurs par défaut utilisées)
EMAIL_FROM=noreply@duerpilot.fr
EMAIL_REPLY_TO=support@duerpilot.fr
EMAIL_CONTACT=contact@duerpilot.fr
```

### 2. Template Brevo

Un template Brevo doit être configuré avec l'ID **1** et le nom **`account_activation`**.

**Variables requises dans le template** :
- `{{ activation_code }}` : Code à 6 chiffres
- `{{ support_email }}` : Email de support
- `{{ privacy_policy_url }}` : URL politique de confidentialité
- `{{ terms_url }}` : URL CGU
- `{{ unsubscribe_url }}` : URL désabonnement

### 3. Configuration du template dans le code

**Fichier** : `server/services/email/templates.ts`

Le template `account_activation` doit avoir :
```typescript
account_activation: {
  brevoTemplateId: 1, // ← ID du template dans Brevo (à mettre à jour)
  category: 'transactional',
  alwaysSend: true,
  useN8n: false,
  variables: ['activation_code', 'support_email', 'privacy_policy_url', 'terms_url', 'unsubscribe_url'],
}
```

⚠️ **Important** : L'ID `1` est un exemple. Vous devez :
1. Créer le template dans Brevo
2. Noter l'ID du template
3. Mettre à jour `brevoTemplateId` dans `templates.ts`

## 🔧 Étapes de configuration

### Étape 1 : Obtenir la clé API Brevo

1. Connectez-vous à votre compte Brevo : https://app.brevo.com
2. Allez dans **Paramètres** → **API Keys**
3. Créez une nouvelle clé API (ou utilisez une existante)
4. Copiez la clé API (format : `xkeysib-...`)
5. Ajoutez-la à votre `.env` : `BREVO_API_KEY=xkeysib-...`

### Étape 2 : Créer le template Brevo

1. Dans Brevo, allez dans **Campaigns** → **Email Templates**
2. Créez un nouveau template transactionnel
3. Nommez-le **`account_activation`**
4. Ajoutez les variables suivantes dans le template :
   ```
   {{ activation_code }}
   {{ support_email }}
   {{ privacy_policy_url }}
   {{ terms_url }}
   {{ unsubscribe_url }}
   ```
5. Notez l'**ID du template** (visible dans l'URL ou les paramètres)

### Étape 3 : Mettre à jour le code

1. Ouvrez `server/services/email/templates.ts`
2. Mettez à jour `brevoTemplateId` avec l'ID réel de votre template :
   ```typescript
   account_activation: {
     brevoTemplateId: VOTRE_ID_REEL, // ← Remplacer par l'ID du template Brevo
     // ...
   }
   ```

### Étape 4 : Vérifier les adresses email

Assurez-vous que les adresses email sont valides et vérifiées dans Brevo :

1. Dans Brevo, allez dans **Paramètres** → **Domains**
2. Vérifiez que votre domaine est vérifié (ou utilisez l'adresse par défaut de Brevo)
3. Si vous utilisez un domaine personnalisé, assurez-vous que les enregistrements DNS sont corrects

### Étape 5 : Tester l'envoi

1. Redémarrez le serveur de développement :
   ```bash
   pnpm dev
   ```

2. Testez l'inscription :
   - Allez sur http://localhost:3000/auth/signin
   - Créez un compte test
   - Vérifiez les logs du serveur pour les erreurs éventuelles

3. Vérifiez les logs Brevo :
   - Dans Brevo, allez dans **Statistics** → **Email Logs**
   - Vérifiez si l'email a été envoyé
   - Vérifiez les erreurs éventuelles

## 🐛 Dépannage

### Les emails ne sont toujours pas envoyés

#### 1. Vérifier la clé API Brevo

```bash
# Vérifier que BREVO_API_KEY est défini
echo $BREVO_API_KEY

# Ou vérifier dans .env
cat .env | grep BREVO_API_KEY
```

#### 2. Vérifier les logs du serveur

Les erreurs d'envoi d'email sont loggées dans la console où vous avez lancé `pnpm dev`.

Recherchez :
- `Erreur envoi email` : Erreur lors de l'envoi
- `BREVO_API_KEY non configuré` : Clé API manquante
- `Brevo API error` : Erreur de l'API Brevo

#### 3. Vérifier les logs de la base de données

Les tentatives d'envoi d'email sont loggées dans la table `EmailLog` :

```bash
pnpm db:studio
```

Puis allez dans la table `EmailLog` et vérifiez :
- Le statut : `sent`, `failed`, ou `blocked`
- L'erreur éventuelle dans la colonne `error`
- Le `templateId` utilisé
- La date d'envoi

#### 4. Tester l'API Brevo directement

Créez un script de test :

```typescript
// scripts/test-brevo-email.ts
import { sendTransactionalEmail } from '@/server/services/email/brevo-service';

async function testEmail() {
  try {
    const result = await sendTransactionalEmail({
      templateId: 'account_activation',
      to: 'votre-email@test.com',
      variables: {
        activation_code: '123456',
        support_email: 'support@duerpilot.fr',
        privacy_policy_url: 'http://localhost:3000/legal/privacy',
        terms_url: 'http://localhost:3000/legal/terms',
        unsubscribe_url: 'http://localhost:3000/settings/notifications',
      },
      userId: 'test',
      tenantId: 'test',
    });
    
    console.log('✅ Email envoyé :', result);
  } catch (error) {
    console.error('❌ Erreur :', error);
  }
}

testEmail();
```

Exécutez :
```bash
tsx scripts/test-brevo-email.ts
```

#### 5. Vérifier les préférences email

Si l'utilisateur existe déjà, vérifiez ses préférences email dans la table `EmailPreferences` :
- `unsubscribedAll` : Si `true`, les emails transactionnels peuvent quand même être envoyés (`alwaysSend: true`)
- `marketingEmails` : N'affecte pas les emails transactionnels
- `productUpdates` : N'affecte pas les emails transactionnels

#### 6. Vérifier le template Brevo

1. Dans Brevo, ouvrez le template `account_activation`
2. Vérifiez que toutes les variables sont définies
3. Testez le template manuellement depuis Brevo
4. Vérifiez que le template est actif

### Erreurs courantes

#### "BREVO_API_KEY non configuré"

**Solution** : Ajoutez `BREVO_API_KEY` à votre fichier `.env` et redémarrez le serveur.

#### "Brevo API error: 401"

**Solution** : Votre clé API est invalide ou expirée. Générez une nouvelle clé dans Brevo.

#### "Brevo API error: 400"

**Solution** : 
- Vérifiez que le template ID est correct
- Vérifiez que toutes les variables requises sont fournies
- Vérifiez que le format des variables est correct

#### "Template invalide: account_activation"

**Solution** : Vérifiez que `account_activation` existe dans `EMAIL_TEMPLATES` dans `server/services/email/templates.ts`.

#### Email bloqué (status: 'blocked')

**Causes possibles** :
- L'utilisateur a désabonné de tous les emails (mais `alwaysSend: true` devrait contourner cela)
- Les préférences email bloquent certaines catégories
- Le domaine d'envoi n'est pas vérifié dans Brevo

**Solution** :
- Vérifiez les préférences email de l'utilisateur
- Vérifiez que le domaine est vérifié dans Brevo
- Vérifiez les logs Brevo pour plus de détails

## 📝 Vérification post-configuration

### Checklist

- [ ] `BREVO_API_KEY` est configuré dans `.env`
- [ ] Le template `account_activation` existe dans Brevo
- [ ] L'ID du template est correct dans `templates.ts`
- [ ] Toutes les variables requises sont dans le template Brevo
- [ ] Le domaine d'envoi est vérifié dans Brevo
- [ ] Le serveur a été redémarré après modification de `.env`
- [ ] Les logs du serveur ne montrent pas d'erreurs
- [ ] Les logs Brevo montrent que l'email a été envoyé

### Test complet

1. **Créer un compte test** :
   - Aller sur http://localhost:3000/auth/signin
   - Passer en mode inscription
   - Créer un compte avec un email valide
   - Vérifier que le message "Inscription réussie" apparaît

2. **Vérifier l'email** :
   - Vérifier la boîte de réception (et les spams)
   - L'email devrait contenir un code à 6 chiffres
   - Vérifier que tous les liens sont présents

3. **Vérifier les logs** :
   - Vérifier les logs du serveur pour les erreurs
   - Vérifier les logs Brevo dans l'interface
   - Vérifier la table `EmailLog` dans la base de données

## 📚 Documentation complémentaire

- **Guide des templates Brevo** : `GUIDE_TEMPLATES_BREVO.md`
- **Configuration email** : `CONFIGURATION_EMAIL.md`
- **Configuration template activation** : `CONFIGURATION_TEMPLATE_ACTIVATION.md`

## 🎯 Résumé

Pour que les emails d'inscription fonctionnent :

1. ✅ **Clé API Brevo** configurée dans `.env`
2. ✅ **Template Brevo** créé avec l'ID correct dans `templates.ts`
3. ✅ **Variables du template** présentes dans le template Brevo
4. ✅ **Domaine vérifié** dans Brevo (pour les emails personnalisés)
5. ✅ **Serveur redémarré** après modification

Si les emails ne sont toujours pas envoyés après ces vérifications, consultez les logs du serveur et les logs Brevo pour identifier l'erreur spécifique.

