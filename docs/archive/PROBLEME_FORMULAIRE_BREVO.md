# 🔧 Problème Formulaire Brevo - Solution

## ❌ Problème Identifié

Le formulaire Brevo sur la landing page ne fonctionne pas en localhost car **reCAPTCHA v3 bloque la soumission**.

### Symptômes :
- Remplissage du formulaire : ✅ Fonctionne
- Clic sur "Être informé du lancement" : ❌ Rien ne se passe
- Console affiche : `L'hôte local ne figure pas dans la liste des domaines acceptés pour la clé de ce site`

### Cause :
reCAPTCHA v3 nécessite que le domaine soit configuré dans Google Cloud Console. `localhost` n'est pas autorisé par défaut.

## ✅ Solutions

### Solution 1 : Ajouter localhost dans reCAPTCHA (Recommandé pour développement)

1. **Accéder à Google Cloud Console** :
   - https://console.cloud.google.com/apis/credentials
   - Connectez-vous avec votre compte Google

2. **Trouver votre clé reCAPTCHA** :
   - Clé actuelle : `6LckP0YsAAAAAK6GB8NoRBC7WiDfAK-qf71Q9h9g`
   - Cherchez la clé dans la liste des credentials

3. **Ajouter localhost aux domaines autorisés** :
   - Cliquez sur votre clé reCAPTCHA
   - Dans "Domaines autorisés", ajoutez :
     - `localhost`
     - `127.0.0.1`
     - `localhost:3000` (optionnel)

4. **Sauvegarder** :
   - Cliquez sur "Enregistrer"
   - Attendez 1-2 minutes pour la propagation

5. **Tester** :
   - Rafraîchissez la page
   - Le formulaire devrait maintenant fonctionner

### Solution 2 : Créer une clé de test reCAPTCHA

Si vous avez besoin d'une clé spécifique pour le développement :

1. **Créer une nouvelle clé reCAPTCHA v3** :
   - Dans Google Cloud Console
   - Créez une nouvelle clé pour le développement
   - Domaines autorisés : `localhost`, `127.0.0.1`

2. **Mettre à jour le HTML** :
   - Remplacez `6LckP0YsAAAAAK6GB8NoRBC7WiDfAK-qf71Q9h9g` par votre nouvelle clé de test
   - Fichier : `public/landing/index.html`
   - Ligne 257 et 879

### Solution 3 : Tester directement sur le domaine de production

Le formulaire fonctionnera automatiquement sur `duerpilot.fr` car le domaine est déjà configuré dans reCAPTCHA.

## 🔍 Vérification

Après avoir appliqué la Solution 1 ou 2 :

1. **Ouvrir la console du navigateur** (F12)
2. **Remplir le formulaire** :
   - Email
   - Type d'entreprise
   - Rôle
   - Cocher le consentement
3. **Cliquer sur "Être informé du lancement"**
4. **Vérifier dans la console** :
   - Si vous voyez `✅ Script Brevo chargé`, c'est bon
   - Si vous voyez `⚠️ reCAPTCHA token manquant`, reCAPTCHA n'est pas encore configuré

## 📝 Code de Debug Ajouté

J'ai ajouté du code de debug dans `public/landing/index.html` qui :
- ✅ Détecte automatiquement si on est en localhost
- ✅ Log des événements de soumission
- ✅ Affiche des warnings si reCAPTCHA n'est pas configuré

Ouvrez la console du navigateur (F12) pour voir les logs.

## 🚀 En Production

Le formulaire fonctionnera automatiquement en production car :
- ✅ Le domaine `duerpilot.fr` est déjà configuré dans reCAPTCHA
- ✅ reCAPTCHA v3 fonctionne sans interaction utilisateur
- ✅ Brevo gère la soumission automatiquement

## 📚 Ressources

- [Documentation reCAPTCHA - Localhost](https://cloud.google.com/recaptcha/docs/troubleshoot-recaptcha-issues#localhost-error)
- [Configuration reCAPTCHA](https://www.google.com/recaptcha/admin)
- [Documentation Brevo - Formulaires](https://help.brevo.com/hc/fr/articles/209467485)

---

**Dernière mise à jour :** Décembre 2024  
**Statut :** ✅ Solution identifiée, correction en attente de configuration reCAPTCHA

