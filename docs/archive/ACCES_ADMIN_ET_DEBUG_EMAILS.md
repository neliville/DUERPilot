# Guide : Accès Admin aux Pages Utilisateurs et Debug des Emails

## 🎯 Résumé des modifications

### 1. Accès Super Admin aux Pages Utilisateurs ✅

**Problème** : Les super admins étaient automatiquement redirigés vers `/admin` et ne pouvaient pas accéder aux pages utilisateurs pour tester.

**Solution** : 
- ✅ Redirection automatique **uniquement depuis la page d'accueil** (`/`)
- ✅ Les super admins peuvent maintenant accéder directement aux pages utilisateurs en tapant l'URL
- ✅ Ajout de liens dans la sidebar admin : "Vue utilisateur" et "Tester onboarding"

**Comment accéder** :
1. **Via les liens dans la sidebar admin** :
   - Cliquer sur **"Vue utilisateur"** → `/dashboard`
   - Cliquer sur **"Tester onboarding"** → `/onboarding`

2. **Directement via l'URL** :
   - Dashboard : http://localhost:3000/dashboard
   - Onboarding : http://localhost:3000/onboarding
   - Toutes les autres pages utilisateur sont accessibles

### 2. Emails d'inscription non envoyés ❌

**Problème** : Les emails de vérification ne sont pas envoyés lors de l'inscription.

**Causes probables** :
1. ❌ `BREVO_API_KEY` non configuré dans `.env`
2. ❌ Template `account_activation` non créé dans Brevo
3. ❌ ID du template incorrect dans `templates.ts`
4. ❌ Domaine d'envoi non vérifié dans Brevo

**Solutions** :

#### Étape 1 : Configurer BREVO_API_KEY

1. Obtenir la clé API Brevo :
   - https://app.brevo.com → **Paramètres** → **API Keys**
   - Créer une nouvelle clé ou utiliser une existante
   - Format : `xkeysib-...`

2. Ajouter à `.env` :
   ```env
   BREVO_API_KEY=xkeysib-votre-cle-api-brevo
   ```

3. Redémarrer le serveur :
   ```bash
   pnpm dev
   ```

#### Étape 2 : Créer le template Brevo

1. Dans Brevo : **Campaigns** → **Email Templates**
2. Créer un template transactionnel nommé `account_activation`
3. Ajouter ces variables :
   ```
   {{ activation_code }}
   {{ support_email }}
   {{ privacy_policy_url }}
   {{ terms_url }}
   {{ unsubscribe_url }}
   ```
4. Noter l'**ID du template**
5. Mettre à jour `server/services/email/templates.ts` ligne 21 :
   ```typescript
   account_activation: {
     brevoTemplateId: VOTRE_ID_REEL, // ← Remplacer par l'ID réel
     // ...
   }
   ```

#### Étape 3 : Vérifier les logs

**Logs du serveur** :
- ✅ `Email envoyé` → Succès
- ❌ `Erreur envoi email` → Erreur à investiguer
- ❌ `BREVO_API_KEY non configuré` → Clé API manquante

**Logs de la base de données** :
```bash
pnpm db:studio
# Table EmailLog → Vérifier statut et erreur
```

**Logs Brevo** :
- Interface Brevo → **Statistics** → **Email Logs**
- Vérifier si l'email a été envoyé

## 📋 Pages accessibles en tant que Super Admin

### Pages Admin (accès normal)
- http://localhost:3000/admin
- http://localhost:3000/admin/companies
- http://localhost:3000/admin/users
- http://localhost:3000/admin/billing

### Pages Utilisateurs (maintenant accessibles)
- http://localhost:3000/dashboard
- http://localhost:3000/onboarding
- http://localhost:3000/dashboard/entreprises
- http://localhost:3000/dashboard/evaluations
- http://localhost:3000/dashboard/referentiels
- http://localhost:3000/dashboard/settings
- Toutes les autres pages utilisateur

## 🔍 Vérification rapide

### Pour les emails :

```bash
# 1. Vérifier la configuration
grep BREVO_API_KEY .env || echo "❌ BREVO_API_KEY non configuré"

# 2. Vérifier les logs du serveur lors d'une inscription
# Rechercher : "Email envoyé" ou "Erreur envoi email"

# 3. Vérifier les logs de la base de données
pnpm db:studio
# Table EmailLog → Vérifier statut et erreur
```

### Pour l'accès admin :

1. **Se connecter** : http://localhost:3000/auth/signin
   - Email : `ddwinsolutions@gmail.com`
   - Mot de passe : `Admin123!`

2. **Vérifier la redirection** :
   - Après connexion → Redirection automatique vers `/admin`

3. **Accéder aux pages utilisateurs** :
   - Via les liens dans la sidebar admin
   - Ou directement via l'URL (ex: `/dashboard`, `/onboarding`)

## 📝 Documentation complète

- **Accès admin aux pages utilisateurs** : `docs/ACCES_ADMIN_PAGES_UTILISATEURS.md`
- **Configuration emails d'inscription** : `docs/CONFIGURATION_EMAILS_INSCRIPTION.md`
- **Debug emails** : `DEBUG_EMAILS.md`
- **Guide templates Brevo** : `GUIDE_TEMPLATES_BREVO.md`

## ✅ Checklist finale

### Accès Admin
- [ ] Les super admins peuvent accéder à `/admin`
- [ ] Les super admins peuvent accéder à `/dashboard` directement
- [ ] Les super admins peuvent accéder à `/onboarding` directement
- [ ] Les liens "Vue utilisateur" et "Tester onboarding" sont présents dans la sidebar admin

### Emails d'inscription
- [ ] `BREVO_API_KEY` est configuré dans `.env`
- [ ] Le template `account_activation` existe dans Brevo
- [ ] L'ID du template est correct dans `templates.ts`
- [ ] Les variables du template sont présentes dans Brevo
- [ ] Le domaine d'envoi est vérifié dans Brevo
- [ ] Le serveur a été redémarré après modification de `.env`
- [ ] Les logs du serveur ne montrent pas d'erreurs
- [ ] Les emails sont bien envoyés lors d'une inscription test

