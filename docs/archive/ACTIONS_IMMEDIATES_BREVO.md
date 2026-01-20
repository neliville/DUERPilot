# Actions Immédiates : Configuration Brevo

## ✅ Ce qui est fait

- ✅ `BREVO_API_KEY` ajouté dans `.env`

## ⚠️ Action requise : Redémarrer le serveur

**IMPORTANT** : Next.js charge les variables d'environnement uniquement au démarrage. 
Vous devez **redémarrer le serveur** pour que `BREVO_API_KEY` soit pris en compte.

### Méthode 1 : Arrêter puis redémarrer

1. **Dans le terminal où `pnpm dev` est lancé** :
   - Appuyer sur `Ctrl+C` pour arrêter le serveur

2. **Redémarrer** :
   ```bash
   pnpm dev
   ```

### Méthode 2 : Tuer le processus (si méthode 1 ne fonctionne pas)

```bash
# Trouver le processus
ps aux | grep "next dev"

# Tuer le processus (remplacer PID par l'ID du processus)
kill -9 PID

# Ou tuer tous les processus Next.js
pkill -f "next dev"

# Puis redémarrer
pnpm dev
```

## ✅ Vérification après redémarrage

Une fois le serveur redémarré, exécutez :

```bash
pnpm exec tsx scripts/check-email-config.ts
```

Vous devriez maintenant voir :

```
✅ BREVO_API_KEY est chargé
✅ Configuration OK - Les emails devraient être envoyés
```

## ⚠️ Vérification du Template Brevo

Avant de tester l'inscription, **vérifiez le template Brevo** :

### 1. Vérifier que le template existe

1. Aller sur https://app.brevo.com
2. **Campaigns** → **Email Templates**
3. Rechercher un template nommé `account_activation`
4. Si le template n'existe pas → **Créer le template** (voir `CONFIGURATION_TEMPLATE_ACTIVATION.md`)

### 2. Vérifier l'ID du template

Dans Brevo, l'ID du template est visible :
- Dans l'URL : `https://app.brevo.com/camp/templates/1` → ID = 1
- Ou dans les paramètres du template

**Vérifier** que l'ID correspond à celui dans `server/services/email/templates.ts` ligne 21 :

```typescript
account_activation: {
  brevoTemplateId: 1, // ← Vérifier que c'est le bon ID
  // ...
}
```

Si l'ID est différent, mettre à jour le fichier avec le bon ID.

### 3. Vérifier les variables du template

Le template Brevo doit contenir ces variables :
- `{{ activation_code }}`
- `{{ support_email }}`
- `{{ privacy_policy_url }}`
- `{{ terms_url }}`
- `{{ unsubscribe_url }}`

## 🧪 Tester l'envoi d'email

Après avoir redémarré le serveur et vérifié le template :

1. **Aller sur** : http://localhost:3000/auth/signin
2. **Passer en mode inscription** (bouton "Créer un compte" ou similaire)
3. **Créer un compte test** :
   - Email : Utilisez un email valide où vous pouvez recevoir les emails
   - Mot de passe : Au moins 6 caractères
   - Cliquer sur "S'inscrire"

4. **Vérifier les résultats** :

   **✅ Si l'email est envoyé** :
   - Message "Inscription réussie" dans l'interface
   - Email reçu avec un code à 6 chiffres
   - Logs serveur : "Email envoyé"

   **❌ Si l'email n'est pas envoyé** :
   - Vérifier les logs du serveur pour l'erreur
   - Vérifier les logs Brevo dans l'interface web
   - Vérifier la table `EmailLog` dans la base de données

## 🐛 Dépannage rapide

### Erreur : "BREVO_API_KEY non configuré"

**Solution** : Redémarrer le serveur (variables d'environnement chargées uniquement au démarrage)

### Erreur : "Brevo API error: 401"

**Solution** : Clé API invalide
- Vérifier que la clé API est correcte dans `.env`
- Vérifier que la clé API est valide dans Brevo
- Générer une nouvelle clé si nécessaire

### Erreur : "Brevo API error: 400"

**Causes** :
- Template ID incorrect
- Variables manquantes dans le template
- Format incorrect

**Solution** :
1. Vérifier l'ID du template dans Brevo
2. Mettre à jour `templates.ts` avec le bon ID
3. Vérifier que toutes les variables sont dans le template Brevo

## 📋 Checklist

- [x] `BREVO_API_KEY` ajouté dans `.env` ✅
- [ ] Serveur **redémarré** ⚠️ **À FAIRE MAINTENANT**
- [ ] Template `account_activation` existe dans Brevo ⚠️ **À VÉRIFIER**
- [ ] ID du template correct dans `templates.ts` ⚠️ **À VÉRIFIER**
- [ ] Toutes les variables présentes dans le template Brevo ⚠️ **À VÉRIFIER**
- [ ] Test d'inscription effectué ⚠️ **À FAIRE**
- [ ] Email reçu avec code de vérification ⚠️ **À VÉRIFIER**

## 🎯 Prochaine étape

**Redémarrer le serveur maintenant** :

```bash
# Dans le terminal où pnpm dev est lancé
Ctrl+C  # Arrêter

# Puis redémarrer
pnpm dev
```

Une fois redémarré, les emails devraient être envoyés ! 🚀

