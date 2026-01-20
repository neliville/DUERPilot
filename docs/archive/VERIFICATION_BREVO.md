# Vérification de la Configuration Brevo

## ✅ Étape 1 : BREVO_API_KEY configuré

Vous avez ajouté `BREVO_API_KEY` dans le fichier `.env`. ✅

**Prochaine étape importante** : **Redémarrer le serveur** pour que la variable soit chargée.

## 🔄 Étape 2 : Redémarrer le serveur

Les variables d'environnement de Next.js ne sont chargées qu'au démarrage. Vous devez redémarrer le serveur :

### Si le serveur est en cours d'exécution

1. **Arrêter le serveur** :
   - Dans le terminal où vous avez lancé `pnpm dev`, appuyez sur `Ctrl+C`

2. **Redémarrer le serveur** :
   ```bash
   pnpm dev
   ```

### Si le serveur n'est pas en cours d'exécution

```bash
pnpm dev
```

## ✅ Étape 3 : Vérifier que la configuration est correcte

Après avoir redémarré le serveur, exécutez le script de vérification :

```bash
pnpm exec tsx scripts/check-email-config.ts
```

Vous devriez maintenant voir :

```
✅ BREVO_API_KEY est chargé
✅ Configuration OK - Les emails devraient être envoyés
```

## ⚠️ Étape 4 : Vérifier le Template Brevo

Le template `account_activation` utilise actuellement l'ID **1** dans le code.

**Vous devez vérifier** que le template existe dans Brevo avec cet ID :

1. **Dans Brevo** : https://app.brevo.com
2. Aller dans **Campaigns** → **Email Templates**
3. Rechercher le template nommé `account_activation`
4. Vérifier l'**ID du template** (visible dans l'URL ou les paramètres)

### Si l'ID est différent de 1

Mettre à jour `server/services/email/templates.ts` ligne 21 :

```typescript
account_activation: {
  brevoTemplateId: VOTRE_ID_REEL, // ← Remplacer 1 par l'ID réel
  // ...
}
```

### Variables requises dans le template Brevo

Le template doit contenir ces variables :
- `{{ activation_code }}` : Code à 6 chiffres
- `{{ support_email }}` : Email de support
- `{{ privacy_policy_url }}` : URL politique de confidentialité
- `{{ terms_url }}` : URL CGU
- `{{ unsubscribe_url }}` : URL désabonnement

## 🧪 Étape 5 : Tester l'envoi d'email

1. **Aller sur la page d'inscription** :
   - http://localhost:3000/auth/signin
   - Passer en mode inscription (bouton "Créer un compte" ou similaire)

2. **Créer un compte test** :
   - Email : Utilisez un email valide où vous pouvez recevoir les emails
   - Mot de passe : Au moins 6 caractères
   - Cliquer sur "S'inscrire"

3. **Vérifier les résultats** :

   **Dans la console du serveur** :
   - ✅ `Email envoyé` → Succès
   - ❌ `Erreur envoi email` → Voir l'erreur ci-dessous
   - ❌ `BREVO_API_KEY non configuré` → Le serveur n'a pas été redémarré

   **Dans la base de données** :
   ```bash
   pnpm db:studio
   # Table EmailLog → Vérifier le statut (sent/failed/blocked) et l'erreur
   ```

   **Dans Brevo** :
   - Interface Brevo → **Statistics** → **Email Logs**
   - Vérifier si l'email a été envoyé
   - Vérifier les erreurs éventuelles

   **Dans votre boîte email** :
   - Vérifier la boîte de réception (et les spams)
   - L'email devrait contenir un code à 6 chiffres

## ❌ Si les emails ne sont toujours pas envoyés

### Erreur : "BREVO_API_KEY non configuré"

**Solution** : Redémarrer le serveur (les variables d'environnement ne sont chargées qu'au démarrage)

```bash
# Arrêter le serveur (Ctrl+C)
pnpm dev
```

### Erreur : "Brevo API error: 401"

**Solution** : Votre clé API est invalide ou expirée
- Vérifier que la clé API est correcte dans `.env`
- Générer une nouvelle clé dans Brevo si nécessaire
- Redémarrer le serveur après modification

### Erreur : "Brevo API error: 400"

**Causes possibles** :
- Template ID incorrect (vérifier que l'ID dans `templates.ts` correspond au template Brevo)
- Variables manquantes dans le template Brevo
- Format des variables incorrect

**Solution** :
1. Vérifier l'ID du template dans Brevo
2. Mettre à jour `templates.ts` avec le bon ID
3. Vérifier que toutes les variables sont présentes dans le template Brevo
4. Redémarrer le serveur

### Erreur : "Template invalide: account_activation"

**Solution** : Vérifier que `account_activation` existe dans `EMAIL_TEMPLATES` dans `templates.ts`

### Email bloqué (status: 'blocked')

**Causes possibles** :
- Domaine d'envoi non vérifié dans Brevo
- Adresse email non vérifiée dans Brevo
- Problème de configuration du domaine

**Solution** :
1. Dans Brevo → **Paramètres** → **Domains**
2. Vérifier que votre domaine est vérifié
3. Ou utiliser l'adresse par défaut de Brevo

## 📋 Checklist finale

- [ ] `BREVO_API_KEY` est configuré dans `.env` ✅ (fait)
- [ ] Le serveur a été **redémarré** après modification de `.env` ⚠️ **À FAIRE**
- [ ] Le template `account_activation` existe dans Brevo ⚠️ **À VÉRIFIER**
- [ ] L'ID du template est correct dans `templates.ts` ⚠️ **À VÉRIFIER**
- [ ] Toutes les variables sont présentes dans le template Brevo ⚠️ **À VÉRIFIER**
- [ ] Le domaine d'envoi est vérifié dans Brevo ⚠️ **À VÉRIFIER**
- [ ] Test d'inscription effectué ⚠️ **À FAIRE**
- [ ] Email reçu avec le code de vérification ⚠️ **À VÉRIFIER**

## 🎯 Prochaines étapes

1. **Redémarrer le serveur** (important !)
2. **Vérifier le template Brevo** (ID et variables)
3. **Tester l'inscription** avec un compte test
4. **Vérifier les logs** (serveur, base de données, Brevo)

Une fois le serveur redémarré, les emails devraient être envoyés correctement ! 🚀

