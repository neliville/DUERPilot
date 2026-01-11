# Résumé : Accès Admin aux Pages Utilisateurs et Configuration Emails

## ✅ 1. Accès Super Admin aux Pages Utilisateurs

### Problème résolu

Les super admins peuvent maintenant accéder aux pages utilisateurs pour tester les fonctionnalités.

### Modifications apportées

1. **Redirections modifiées** :
   - `/app/page.tsx` : Redirection vers `/admin` **uniquement depuis la page d'accueil** (`/`)
   - `/app/(dashboard)/dashboard/page.tsx` : Redirection supprimée - les super admins peuvent accéder
   - `/app/(onboarding)/onboarding/layout.tsx` : Redirection supprimée - les super admins peuvent accéder

2. **Liens ajoutés dans la sidebar admin** :
   - **"Vue utilisateur"** → `/dashboard` : Accède au dashboard utilisateur
   - **"Tester onboarding"** → `/onboarding` : Accède au flux d'onboarding

### Comment utiliser

#### Accès depuis l'interface admin

1. Se connecter en tant que super admin : http://localhost:3000/auth/signin
   - Email : `ddwinsolutions@gmail.com`
   - Mot de passe : `Admin123!`

2. Utiliser les liens dans la sidebar admin (footer) :
   - Cliquer sur **"Vue utilisateur"** pour accéder au dashboard
   - Cliquer sur **"Tester onboarding"** pour tester l'onboarding

#### Accès direct via URL

En tant que super admin, vous pouvez accéder directement à :
- **Dashboard** : http://localhost:3000/dashboard
- **Onboarding** : http://localhost:3000/onboarding
- **Entreprises** : http://localhost:3000/dashboard/entreprises
- **Évaluations** : http://localhost:3000/dashboard/evaluations
- **Référentiels** : http://localhost:3000/dashboard/referentiels
- **Paramètres** : http://localhost:3000/dashboard/settings
- Toutes les autres pages utilisateur

### Navigation

- **Depuis `/`** : Redirection automatique vers `/admin` (comportement normal)
- **Depuis `/admin`** : Utiliser les liens dans la sidebar pour accéder aux pages utilisateurs
- **Depuis les pages utilisateurs** : Taper directement l'URL ou utiliser le menu de navigation

## ❌ 2. Emails d'inscription non envoyés

### Diagnostic effectué

Le script de diagnostic (`scripts/check-email-config.ts`) a révélé :

```
❌ Configuration incomplète - Les emails ne seront pas envoyés
🔧 Actions requises :
  - Ajouter BREVO_API_KEY dans .env
  - Redémarrer le serveur (pnpm dev)
```

### Cause identifiée

**`BREVO_API_KEY` n'est pas configuré dans `.env`**

### Solution

#### Étape 1 : Obtenir la clé API Brevo

1. Aller sur https://app.brevo.com
2. Se connecter à votre compte
3. Aller dans **Paramètres** → **API Keys**
4. Créer une nouvelle clé API (ou utiliser une existante)
5. Copier la clé API (format : `xkeysib-...`)

#### Étape 2 : Configurer dans `.env`

Ajouter cette ligne à votre fichier `.env` :

```env
BREVO_API_KEY=xkeysib-votre-cle-api-brevo
```

#### Étape 3 : Créer le template Brevo (si pas déjà fait)

1. Dans Brevo : **Campaigns** → **Email Templates**
2. Créer un nouveau template transactionnel
3. Nommer le template : **`account_activation`**
4. Ajouter ces variables dans le template :
   ```
   {{ activation_code }}
   {{ support_email }}
   {{ privacy_policy_url }}
   {{ terms_url }}
   {{ unsubscribe_url }}
   ```
5. Noter l'**ID du template** (visible dans l'URL ou les paramètres)
6. Mettre à jour `server/services/email/templates.ts` ligne 21 :
   ```typescript
   account_activation: {
     brevoTemplateId: VOTRE_ID_REEL, // ← Remplacer 1 par l'ID réel
     // ...
   }
   ```

#### Étape 4 : Redémarrer le serveur

```bash
# Arrêter le serveur (Ctrl+C)
pnpm dev
```

#### Étape 5 : Vérifier la configuration

Exécuter le script de diagnostic :

```bash
pnpm exec tsx scripts/check-email-config.ts
```

Vous devriez voir :
```
✅ Configuration OK - Les emails devraient être envoyés
```

### Vérification post-configuration

1. **Tester l'inscription** :
   - Aller sur http://localhost:3000/auth/signin
   - Passer en mode inscription
   - Créer un compte test avec un email valide
   - Vérifier que le message "Inscription réussie" apparaît

2. **Vérifier l'email** :
   - Vérifier la boîte de réception (et les spams)
   - L'email devrait contenir un code à 6 chiffres

3. **Vérifier les logs** :
   - **Logs du serveur** : Rechercher "Email envoyé" ou "Erreur envoi email"
   - **Logs Brevo** : Interface Brevo → **Statistics** → **Email Logs**
   - **Base de données** : `pnpm db:studio` → Table `EmailLog` → Vérifier statut et erreur

## 📋 Checklist finale

### Accès Admin
- [x] Les super admins peuvent accéder à `/admin`
- [x] Les super admins peuvent accéder à `/dashboard` directement
- [x] Les super admins peuvent accéder à `/onboarding` directement
- [x] Les liens "Vue utilisateur" et "Tester onboarding" sont présents dans la sidebar admin

### Emails d'inscription
- [ ] `BREVO_API_KEY` est configuré dans `.env` ⚠️ **À FAIRE**
- [x] Le template `account_activation` existe dans `templates.ts`
- [ ] L'ID du template est correct (vérifier dans Brevo et mettre à jour) ⚠️ **À VÉRIFIER**
- [ ] Le template Brevo existe avec toutes les variables ⚠️ **À VÉRIFIER**
- [ ] Le domaine d'envoi est vérifié dans Brevo ⚠️ **À VÉRIFIER**
- [ ] Le serveur a été redémarré après modification de `.env` ⚠️ **À FAIRE**
- [ ] Les emails sont bien envoyés lors d'une inscription test ⚠️ **À TESTER**

## 📚 Documentation complète

- **Accès admin aux pages utilisateurs** : `docs/ACCES_ADMIN_PAGES_UTILISATEURS.md`
- **Configuration emails d'inscription** : `docs/CONFIGURATION_EMAILS_INSCRIPTION.md`
- **Debug emails** : `DEBUG_EMAILS.md`
- **Guide templates Brevo** : `GUIDE_TEMPLATES_BREVO.md`
- **Script de diagnostic** : `scripts/check-email-config.ts`

## 🎯 Actions immédiates

### Pour accéder aux pages utilisateurs (✅ Résolu)

1. Se connecter en tant que super admin
2. Utiliser les liens dans la sidebar admin
3. Ou accéder directement aux URLs utilisateur

### Pour activer les emails d'inscription (❌ À faire)

1. **Configurer BREVO_API_KEY dans `.env`** ⚠️ **URGENT**
2. Créer/verifier le template Brevo
3. Mettre à jour l'ID du template dans `templates.ts`
4. Redémarrer le serveur
5. Tester l'inscription

## 💡 Astuce

Pour vérifier rapidement la configuration email :

```bash
pnpm exec tsx scripts/check-email-config.ts
```

Ce script vous dira exactement ce qui manque pour que les emails fonctionnent.

