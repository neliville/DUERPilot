# Utilisateurs Présents dans la Base de Données

## ✅ État de la Base de Données

Les données sont **bien présentes** dans votre base de données :

### 📊 Résumé

- ✅ **1 Tenant** : "Default Tenant" (slug: `default`)
- ✅ **3 UserProfile** : Utilisateurs de l'application
- ✅ **3 User** (NextAuth) : Utilisateurs NextAuth
- ✅ **1 Company** : "ACME"
- ✅ **1 EmailLog** : Log d'envoi d'email (pour vérifier les emails d'inscription)

## 👥 Utilisateurs Présents

### 1. UserProfile (Table : `user_profiles`)

Ces utilisateurs sont les utilisateurs **métier** de votre application :

#### ✅ Admin - Super Admin
- **Email** : `ddwinsolutions@gmail.com`
- **Nom** : Admin DUERPilot
- **Super Admin** : ✅ Oui
- **Rôles** : `super_admin`
- **Plan** : `starter`
- **Email vérifié** : ✅ Oui
- **Créé le** : 06/01/2026

#### User 1
- **Email** : `berligne@yahoo.fr`
- **Nom** : DJAWLA Dodzi
- **Super Admin** : ❌ Non
- **Rôles** : `user`
- **Plan** : `starter`
- **Email vérifié** : ✅ Oui
- **Créé le** : 08/01/2026

#### User 2
- **Email** : `neliddk@gmail.com`
- **Nom** : Black AkoumA NELIVILLE
- **Super Admin** : ❌ Non
- **Rôles** : `user`
- **Plan** : `free`
- **Email vérifié** : ❌ Non
- **Créé le** : 10/01/2026

### 2. User (NextAuth) (Table : `users`)

Ces utilisateurs sont utilisés par NextAuth pour l'authentification :

- `ddwinsolutions@gmail.com` (Admin) - Email vérifié ✅
- `berligne@yahoo.fr` - Email vérifié ✅
- `neliddk@gmail.com` - Email vérifié ❌

### 3. Tenant (Table : `tenants`)

- **Default Tenant**
  - ID : `cmk32f2720000ex07i38q60hv`
  - Nom : "Default Tenant"
  - Slug : `default`
  - Entreprises : 1
  - Utilisateurs : 3

## 🔍 Comment Voir les Utilisateurs dans Prisma Studio

### ⚠️ Important : Noms des Modèles vs Noms des Tables

**Prisma Studio affiche les MODÈLES** (noms en PascalCase), **pas les noms des tables** (en snake_case).

| Ce que vous cherchez | Modèle dans Prisma Studio | Table réelle | Description |
|---------------------|---------------------------|--------------|-------------|
| **Utilisateurs de l'application** | **UserProfile** | `user_profiles` | Utilisateurs métier (incluant l'admin) |
| Utilisateurs NextAuth | **User** | `users` | Utilisateurs NextAuth (authentification) |
| Tenants | **Tenant** | `tenants` | Tenants (multi-tenancy) |
| Entreprises | **Company** | `companies` | Entreprises |
| Logs d'emails | **EmailLog** | `email_logs` | Logs d'envoi d'emails |

### 📋 Instructions pour Prisma Studio

1. **Ouvrir Prisma Studio** :
   - Via le lien dans la sidebar admin : Cliquer sur "Prisma Studio"
   - Ou directement : http://localhost:5555

2. **Pour voir les utilisateurs de l'application** :
   - Dans la liste des modèles à gauche, chercher **"UserProfile"**
   - ⚠️ **Ne pas chercher "User"** (c'est pour NextAuth)
   - Cliquer sur **"UserProfile"**
   - Vous devriez voir les 3 utilisateurs, incluant l'admin

3. **Pour voir les utilisateurs NextAuth** :
   - Chercher **"User"** (sans "Profile")
   - Cliquer sur **"User"**
   - Vous verrez les 3 utilisateurs NextAuth

4. **Pour voir les tenants** :
   - Chercher **"Tenant"**
   - Cliquer sur **"Tenant"**
   - Vous verrez "Default Tenant"

5. **Pour voir les logs d'emails** :
   - Chercher **"EmailLog"**
   - Cliquer sur **"EmailLog"**
   - Vous verrez les logs d'envoi d'emails

## ✅ Vérification

Vous pouvez vérifier les utilisateurs avec le script :

```bash
pnpm exec tsx scripts/check-database-users.ts
```

Ou lister toutes les tables :

```bash
pnpm exec tsx scripts/list-all-tables.ts
```

## 🎯 Résumé

- ✅ **Les données sont présentes** dans la base de données
- ✅ **3 UserProfile** trouvés (incluant l'admin)
- ✅ **3 User** (NextAuth) trouvés
- ✅ **1 Tenant** trouvé

**Dans Prisma Studio, chercher** :
- **"UserProfile"** pour voir les utilisateurs de l'application (incluant l'admin)
- **"User"** pour voir les utilisateurs NextAuth
- **"Tenant"** pour voir les tenants
- **"EmailLog"** pour voir les logs d'emails

Si vous ne voyez toujours rien dans Prisma Studio, vérifiez que :
1. Prisma Studio est bien lancé (`pnpm db:studio`)
2. Vous êtes connecté à la bonne base de données (`DATABASE_URL` dans `.env`)
3. Le client Prisma est à jour (`pnpm db:generate`)

