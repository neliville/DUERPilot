# Accès aux Pages d'Administration

## 🔐 Créer un compte Super Admin

### 1. Créer le compte super admin via script

Un script existe pour créer automatiquement un compte super admin :

```bash
# Depuis le répertoire racine du projet
cd /home/neliville/dev/LAB/PROJECTS/duerpilot
tsx scripts/create-super-admin.ts
```

Ce script crée un compte avec les identifiants suivants :

- **Email** : `ddwinsolutions@gmail.com`
- **Mot de passe** : `Admin123!`
- **Rôle** : `super_admin`
- **Nom** : Admin DUERPilot

Si l'utilisateur existe déjà, le script le mettra à jour avec le rôle `super_admin`.

### 2. Vérifier le compte super admin

Vous pouvez vérifier que le compte existe dans la base de données :

```bash
# Ouvrir Prisma Studio
pnpm db:studio
```

Puis rechercher l'utilisateur avec l'email `ddwinsolutions@gmail.com` et vérifier que :
- `isSuperAdmin` = `true`
- `roles` contient `super_admin`

## 🚀 Accéder aux pages d'administration

### 1. Démarrer le serveur de développement

```bash
cd /home/neliville/dev/LAB/PROJECTS/duerpilot
pnpm dev
```

Le serveur démarre sur **http://localhost:3000**

### 2. Se connecter

1. Accéder à la page de connexion : **http://localhost:3000/auth/signin**
2. Entrer les identifiants :
   - **Email** : `ddwinsolutions@gmail.com`
   - **Mot de passe** : `Admin123!`
3. Cliquer sur "Se connecter"

### 3. Redirection automatique

Après connexion, les super admins sont **automatiquement redirigés** vers :
- **Dashboard Admin** : **http://localhost:3000/admin**

⚠️ **Important** : Les super admins **bypassent l'onboarding** et sont redirigés directement vers `/admin`.

## 📋 Pages d'administration disponibles

Une fois connecté en tant que super admin, vous avez accès aux pages suivantes :

### Dashboard Admin (page principale)
- **URL** : http://localhost:3000/admin
- **Description** : Vue d'ensemble des KPIs essentiels (CEO Dashboard)
  - Clients actifs par plan
  - MRR (Monthly Recurring Revenue)
  - Marge nette
  - Coûts IA et infrastructure
  - Taux de conversion Free → Starter

### Gestion des entreprises
- **URL** : http://localhost:3000/admin/companies
- **Description** : Liste et gestion de toutes les entreprises

### Gestion des utilisateurs
- **URL** : http://localhost:3000/admin/users
- **Description** : Liste et gestion de tous les utilisateurs

### Gestion de la facturation
- **URL** : http://localhost:3000/admin/billing
- **Description** : Gestion des abonnements et facturation

## 🔒 Protection des pages admin

Toutes les pages d'administration sont protégées par :

1. **Authentification obligatoire** : Vous devez être connecté
2. **Vérification du rôle** : Vous devez avoir le rôle `super_admin`
3. **Redirection automatique** : Si vous n'êtes pas super admin, vous êtes redirigé vers `/dashboard`

## ⚙️ Créer un autre compte super admin

Si vous souhaitez créer un autre compte super admin avec un email différent, vous pouvez :

### Option 1 : Modifier le script

Modifier le fichier `scripts/create-super-admin.ts` :

```typescript
const email = 'votre-email@example.com';
const password = 'VotreMotDePasse123!';
const firstName = 'Votre';
const lastName = 'Nom';
```

Puis exécuter :
```bash
tsx scripts/create-super-admin.ts
```

### Option 2 : Via Prisma Studio

1. Ouvrir Prisma Studio :
```bash
pnpm db:studio
```

2. Créer un nouvel utilisateur dans la table `UserProfile` avec :
   - `email` : Votre email
   - `password` : Hash bcrypt du mot de passe (utiliser un script pour hasher)
   - `roles` : `['super_admin']`
   - `isSuperAdmin` : `true`
   - `emailVerified` : `true`
   - `tenantId` : ID d'un tenant existant

### Option 3 : Via une mutation tRPC (si disponible)

Si une mutation admin existe pour créer des utilisateurs, vous pouvez l'utiliser via l'interface d'administration.

## 🔍 Vérifier vos permissions

Pour vérifier que vous êtes bien super admin :

1. Connectez-vous à l'application
2. Allez sur http://localhost:3000/admin
3. Si vous êtes redirigé vers `/dashboard`, c'est que vous n'êtes pas super admin
4. Si vous accédez au dashboard admin, c'est que vous êtes bien super admin

## 📝 Notes importantes

### Redirections automatiques

Les super admins sont automatiquement redirigés vers `/admin` dans les cas suivants :
- Après connexion (page `/auth/signin`)
- Accès à la page d'accueil (`/`)
- Tentative d'accès à `/onboarding` (bypass de l'onboarding)
- Accès à `/dashboard` (redirection vers `/admin`)

### Sécurité

- ⚠️ Le mot de passe par défaut (`Admin123!`) doit être changé en production
- ⚠️ Les identifiants par défaut sont à des fins de développement uniquement
- ⚠️ En production, utilisez des identifiants forts et uniques

## 🐛 Dépannage

### Je ne peux pas accéder à `/admin`

1. Vérifiez que vous êtes bien connecté :
   - Allez sur http://localhost:3000/auth/signin
   - Connectez-vous avec les identifiants super admin

2. Vérifiez que votre compte a bien le rôle `super_admin` :
```bash
pnpm db:studio
# Rechercher votre utilisateur et vérifier isSuperAdmin = true
```

3. Vérifiez les logs du serveur pour voir les erreurs éventuelles

### Le script de création ne fonctionne pas

1. Vérifiez que la base de données est accessible :
```bash
pnpm db:generate
```

2. Vérifiez que `tsx` est installé :
```bash
pnpm add -D tsx
```

3. Exécutez le script avec les logs :
```bash
tsx scripts/create-super-admin.ts
```

### Erreur "UNAUTHORIZED" ou "FORBIDDEN"

1. Déconnectez-vous et reconnectez-vous pour rafraîchir la session
2. Vérifiez que votre session contient bien le rôle `super_admin`
3. Vérifiez que le serveur est bien démarré et la base de données accessible

## 🎯 URLs importantes

- **Connexion** : http://localhost:3000/auth/signin
- **Dashboard Admin** : http://localhost:3000/admin
- **Gestion entreprises** : http://localhost:3000/admin/companies
- **Gestion utilisateurs** : http://localhost:3000/admin/users
- **Facturation** : http://localhost:3000/admin/billing

