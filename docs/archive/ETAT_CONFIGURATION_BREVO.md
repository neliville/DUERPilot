# État de la Configuration Brevo

## ✅ Configuration .env vérifiée

Votre fichier `.env` contient toutes les variables nécessaires :

- ✅ `BREVO_API_KEY` - Présent
- ✅ `EMAIL_FROM` - Présent
- ✅ `EMAIL_REPLY_TO` - Présent
- ✅ `EMAIL_CONTACT` - Présent
- ✅ `EMAIL_SENDER_NAME` - Présent
- ✅ `NEXTAUTH_URL` - Présent
- ✅ `DATABASE_URL` - Présent

## ⚠️ Problème détecté

**`BREVO_API_KEY` n'est pas chargé au runtime**

Cela signifie que :
- ✅ La variable est bien dans le fichier `.env`
- ❌ Mais elle n'est pas chargée par Next.js au démarrage

**Cause** : Le serveur Next.js n'a pas été redémarré après l'ajout de `BREVO_API_KEY` dans `.env`, ou le serveur n'est pas en cours d'exécution.

## 🔧 Solution : Redémarrer le serveur

### Étape 1 : Vérifier si le serveur est en cours d'exécution

```bash
# Vérifier les processus Next.js
ps aux | grep "next dev"

# Vérifier le port 3000
lsof -ti:3000
```

### Étape 2 : Arrêter le serveur (si en cours)

**Option A : Via Ctrl+C** (recommandé)
- Dans le terminal où `pnpm dev` est lancé
- Appuyer sur `Ctrl+C`

**Option B : Via commande**
```bash
# Tuer les processus Next.js
pkill -f "next dev"

# Ou tuer un processus spécifique sur le port 3000
lsof -ti:3000 | xargs kill -9
```

### Étape 3 : Redémarrer le serveur

```bash
cd /home/neliville/dev/LAB/PROJECTS/duerpilot
pnpm dev
```

### Étape 4 : Vérifier que BREVO_API_KEY est chargé

Après redémarrage, dans un **nouveau terminal**, exécutez :

```bash
cd /home/neliville/dev/LAB/PROJECTS/duerpilot
pnpm exec tsx scripts/check-email-config.ts
```

Vous devriez maintenant voir :

```
✅ BREVO_API_KEY est chargé
✅ Configuration OK - Les emails devraient être envoyés
```

## ✅ Vérifications supplémentaires

### 1. Template Brevo

Vérifier que le template `account_activation` existe dans Brevo :

1. Aller sur https://app.brevo.com
2. **Campaigns** → **Email Templates**
3. Rechercher un template nommé `account_activation`
4. Noter l'**ID du template** (visible dans l'URL : `/templates/1` → ID = 1)

### 2. ID du template dans le code

Vérifier dans `server/services/email/templates.ts` ligne 21 :

```typescript
account_activation: {
  brevoTemplateId: 1, // ← Doit correspondre à l'ID dans Brevo
  // ...
}
```

**Si l'ID est différent**, mettre à jour le fichier avec le bon ID.

### 3. Variables du template Brevo

Le template Brevo doit contenir ces variables :
- ✅ `{{ activation_code }}`
- ✅ `{{ support_email }}`
- ✅ `{{ privacy_policy_url }}`
- ✅ `{{ terms_url }}`
- ✅ `{{ unsubscribe_url }}`

## 🧪 Test après redémarrage

Une fois le serveur redémarré :

1. **Aller sur** : http://localhost:3000/auth/signin
2. **Passer en mode inscription**
3. **Créer un compte test** avec un email valide
4. **Vérifier** :
   - ✅ Message "Inscription réussie" dans l'interface
   - ✅ Email reçu avec un code à 6 chiffres
   - ✅ Logs serveur : "Email envoyé" (pas d'erreur)

## 📋 Checklist finale

- [x] `BREVO_API_KEY` présent dans `.env` ✅
- [x] Variables email configurées dans `.env` ✅
- [ ] **Serveur redémarré** ⚠️ **À FAIRE MAINTENANT**
- [ ] Template `account_activation` existe dans Brevo ⚠️ **À VÉRIFIER**
- [ ] ID du template correct dans `templates.ts` ⚠️ **À VÉRIFIER**
- [ ] Toutes les variables présentes dans le template Brevo ⚠️ **À VÉRIFIER**
- [ ] Test d'inscription effectué ⚠️ **À FAIRE**

## 🎯 Action immédiate

**Redémarrer le serveur maintenant** :

```bash
# Si le serveur est en cours, arrêter avec Ctrl+C
# Puis redémarrer :
pnpm dev
```

Une fois redémarré, les emails devraient fonctionner ! 🚀

