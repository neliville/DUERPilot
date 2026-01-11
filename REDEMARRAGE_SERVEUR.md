# Instructions de Redémarrage du Serveur

## ✅ État actuel

- ✅ Votre fichier `.env` contient `BREVO_API_KEY`
- ✅ Toutes les variables email sont configurées
- ⚠️ Mais le serveur Next.js doit être **redémarré** pour charger `BREVO_API_KEY`

## 🔄 Redémarrer le serveur

### Méthode 1 : Via le terminal actuel (recommandé)

Si vous avez un terminal où `pnpm dev` est lancé :

1. **Dans ce terminal**, appuyez sur :
   ```
   Ctrl + C
   ```

2. **Attendez quelques secondes** que le serveur s'arrête complètement

3. **Redémarrez** :
   ```bash
   pnpm dev
   ```

### Méthode 2 : Via commande (si méthode 1 ne fonctionne pas)

```bash
# Arrêter tous les processus Next.js
pkill -f "next dev"

# Attendre 2-3 secondes
sleep 3

# Redémarrer
cd /home/neliville/dev/LAB/PROJECTS/duerpilot
pnpm dev
```

## ✅ Vérification après redémarrage

### 1. Vérifier que le serveur démarre correctement

Vous devriez voir dans la console :
```
✓ Ready in X seconds
○ Local:        http://localhost:3000
```

### 2. Vérifier que BREVO_API_KEY est chargé

**Dans un nouveau terminal**, exécutez :

```bash
cd /home/neliville/dev/LAB/PROJECTS/duerpilot
pnpm exec tsx scripts/check-email-config.ts
```

Vous devriez maintenant voir :
```
✅ BREVO_API_KEY est chargé
✅ Configuration OK - Les emails devraient être envoyés
```

Si vous voyez encore `❌ BREVO_API_KEY n'est pas chargé`, cela signifie que :
- Le serveur n'a pas été complètement redémarré
- Il y a un problème avec le fichier `.env`
- Le script de vérification ne peut pas accéder aux variables d'environnement du serveur

### 3. Tester l'envoi d'email

Une fois le serveur redémarré et la vérification OK :

1. **Aller sur** : http://localhost:3000/auth/signin
2. **Passer en mode inscription** (bouton "Créer un compte")
3. **Créer un compte test** :
   - Email : Utilisez un email valide où vous pouvez recevoir les emails
   - Mot de passe : Au moins 6 caractères
   - Cliquer sur "S'inscrire"

4. **Vérifier les résultats** :
   - ✅ Message "Inscription réussie" dans l'interface
   - ✅ Logs serveur : Rechercher "Email envoyé" ou "Erreur envoi email"
   - ✅ Email reçu avec un code à 6 chiffres (vérifier aussi les spams)

## ⚠️ Problèmes possibles après redémarrage

### Erreur : "BREVO_API_KEY non configuré"

**Causes possibles** :
- Le serveur n'a pas été complètement arrêté avant le redémarrage
- Le fichier `.env` n'est pas lu correctement
- La variable `BREVO_API_KEY` est mal formatée dans `.env`

**Solutions** :
1. Vérifier le format dans `.env` :
   ```env
   BREVO_API_KEY=xkeysib-...  # Pas d'espaces autour du =
   ```

2. Vérifier qu'il n'y a pas de guillemets :
   ```env
   # ✅ Correct
   BREVO_API_KEY=xkeysib-abc123
   
   # ❌ Incorrect (ne pas mettre de guillemets)
   BREVO_API_KEY="xkeysib-abc123"
   ```

3. Arrêter complètement le serveur (Ctrl+C) et attendre 5 secondes avant de redémarrer

### Erreur : "Brevo API error: 401"

**Cause** : Clé API invalide ou expirée

**Solution** :
1. Vérifier que la clé API est correcte dans `.env`
2. Vérifier que la clé API est valide dans Brevo (https://app.brevo.com → Paramètres → API Keys)
3. Générer une nouvelle clé si nécessaire

### Erreur : "Brevo API error: 400"

**Causes possibles** :
- Template ID incorrect
- Variables manquantes dans le template Brevo
- Format incorrect des variables

**Solution** :
1. Vérifier l'ID du template dans Brevo
2. Mettre à jour `server/services/email/templates.ts` avec le bon ID
3. Vérifier que toutes les variables sont présentes dans le template Brevo

## 📋 Checklist

- [x] `BREVO_API_KEY` présent dans `.env` ✅
- [x] Variables email configurées ✅
- [ ] **Serveur complètement arrêté** ⚠️ **À FAIRE**
- [ ] **Serveur redémarré** ⚠️ **À FAIRE**
- [ ] `BREVO_API_KEY` chargé au runtime ⚠️ **À VÉRIFIER**
- [ ] Template Brevo vérifié ⚠️ **À VÉRIFIER**
- [ ] Test d'inscription effectué ⚠️ **À FAIRE**

## 🎯 Action immédiate

**Redémarrer le serveur maintenant** :

```bash
# Dans le terminal où pnpm dev est lancé :
Ctrl + C

# Attendre 3-5 secondes, puis :
pnpm dev
```

Une fois redémarré, les emails devraient fonctionner ! 🚀

