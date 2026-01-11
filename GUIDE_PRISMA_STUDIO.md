# Guide : Trouver les Utilisateurs dans Prisma Studio

## ✅ État de la Base de Données

Les données sont **bien présentes** dans votre base de données :

- ✅ **1 Tenant** : "Default Tenant"
- ✅ **3 UserProfile** : 
  - `ddwinsolutions@gmail.com` (Super Admin)
  - `berligne@yahoo.fr`
  - `neliddk@gmail.com`
- ✅ **3 User** (NextAuth) : Correspondants aux UserProfile
- ✅ **1 Company**

## 🔍 Comment Trouver les Utilisateurs dans Prisma Studio

### Important : Noms des Modèles vs Noms des Tables

**Prisma Studio affiche les MODÈLES** (noms en PascalCase), **pas les noms des tables** (en snake_case).

| Modèle dans Prisma Studio | Table réelle dans PostgreSQL | Description |
|---------------------------|------------------------------|-------------|
| **User** | `users` | Utilisateurs NextAuth (pour l'authentification) |
| **UserProfile** | `user_profiles` | Utilisateurs de l'application (métier) |
| **Tenant** | `tenants` | Tenants (multi-tenancy) |
| **Company** | `companies` | Entreprises |
| **EmailLog** | `email_logs` | Logs d'envoi d'emails |

### Où Chercher dans Prisma Studio

1. **Pour voir les utilisateurs de l'application** :
   - Chercher le modèle **"UserProfile"** (pas "User")
   - C'est là que vous trouverez l'admin (`ddwinsolutions@gmail.com`)

2. **Pour voir les utilisateurs NextAuth** :
   - Chercher le modèle **"User"**
   - C'est la table utilisée par NextAuth pour l'authentification

3. **Pour voir les tenants** :
   - Chercher le modèle **"Tenant"**
   - Vous y trouverez "Default Tenant"

## 📋 Utilisateurs Présents dans la Base

### 1. UserProfile (Table : `user_profiles`)

Ces utilisateurs sont les utilisateurs **métier** de votre application :

1. **Admin** (`ddwinsolutions@gmail.com`)
   - ID : `cmk32f28q0002ex079rbz6w3n`
   - Super Admin : ✅ Oui
   - Rôles : `super_admin`
   - Plan : `starter`
   - Email vérifié : ✅ Oui
   - Créé le : 06/01/2026

2. **User** (`berligne@yahoo.fr`)
   - Plan : `starter`
   - Email vérifié : ✅ Oui

3. **User** (`neliddk@gmail.com`)
   - Plan : `free`
   - Email vérifié : ❌ Non

### 2. User (NextAuth) (Table : `users`)

Ces utilisateurs sont utilisés par NextAuth pour l'authentification :

- `ddwinsolutions@gmail.com` (Admin)
- `berligne@yahoo.fr`
- `neliddk@gmail.com`

### 3. Tenant (Table : `tenants`)

- **Default Tenant** (slug: `default`)
  - ID : `cmk32f2720000ex07i38q60hv`
  - 1 entreprise
  - 3 utilisateurs

## 🔧 Pourquoi Vous Ne Les Voyez Pas dans Prisma Studio

### Causes Possibles

1. **Mauvais nom de modèle recherché** :
   - ❌ Chercher "users" ou "user" (nom de la table)
   - ✅ Chercher **"UserProfile"** (nom du modèle)

2. **Prisma Studio utilise une autre base de données** :
   - Vérifier que Prisma Studio utilise bien le `DATABASE_URL` de votre `.env`
   - Vérifier que vous êtes connecté à la bonne base de données

3. **Prisma Studio n'a pas été régénéré** :
   - Exécuter `pnpm db:generate` pour régénérer le client Prisma
   - Redémarrer Prisma Studio : `pnpm db:studio`

4. **Filtres actifs dans Prisma Studio** :
   - Vérifier qu'il n'y a pas de filtres appliqués
   - Réinitialiser les filtres dans Prisma Studio

## ✅ Solution : Comment Voir les Utilisateurs

### Méthode 1 : Via Prisma Studio (Recommandé)

1. **Lancer Prisma Studio** (si pas déjà lancé) :
   ```bash
   pnpm db:studio
   ```

2. **Ouvrir dans le navigateur** : http://localhost:5555

3. **Chercher le modèle "UserProfile"** :
   - Dans la liste des modèles à gauche, chercher **"UserProfile"**
   - Cliquer sur "UserProfile"
   - Vous devriez voir les 3 utilisateurs

4. **Chercher le modèle "User"** (pour NextAuth) :
   - Chercher **"User"** (sans "Profile")
   - Cliquer sur "User"
   - Vous devriez voir les 3 utilisateurs NextAuth

5. **Chercher le modèle "Tenant"** :
   - Chercher **"Tenant"**
   - Cliquer sur "Tenant"
   - Vous devriez voir "Default Tenant"

### Méthode 2 : Via Script (Alternative)

Exécuter le script de vérification :

```bash
pnpm exec tsx scripts/check-database-users.ts
```

Ce script affiche tous les utilisateurs avec leurs détails.

### Méthode 3 : Via SQL Direct

Si vous avez accès à PostgreSQL directement :

```sql
-- Voir tous les UserProfile
SELECT id, email, "firstName", "lastName", "isSuperAdmin", roles, plan, "emailVerified" 
FROM user_profiles;

-- Voir tous les User (NextAuth)
SELECT id, email, name, "emailVerified" 
FROM users;

-- Voir tous les Tenants
SELECT id, name, slug 
FROM tenants;
```

## 📊 Liste des Tables Disponibles dans Prisma Studio

Dans Prisma Studio, vous devriez voir ces modèles :

- **Account** (comptes OAuth)
- **ActionPlan** (plans d'actions)
- **ActivitySector** (secteurs d'activité)
- **AIUsageLog** (logs d'utilisation IA)
- **AuditLog** (journal d'audit)
- **Company** (entreprises)
- **DangerCategory** (catégories de dangers)
- **DangerousSituation** (situations dangereuses)
- **DuerpilotReference** (référentiel central)
- **DuerpilotRisk** (risques du référentiel)
- **DuerpVersion** (versions DUERP)
- **EmailLog** (logs d'emails)
- **EmailPreferences** (préférences email)
- **HazardRef** (référentiel des dangers)
- **Observation** (observations)
- **PreventionMeasure** (mesures de prévention)
- **RiskAssessment** (évaluations de risques)
- **Session** (sessions NextAuth)
- **Site** (sites)
- **Tenant** (tenants) ✅ **ICI**
- **User** (NextAuth) ✅ **ICI**
- **UserProfile** ✅ **ICI** (utilisateurs de l'application)
- **VerificationToken** (tokens de vérification)
- **WorkUnit** (unités de travail)
- Et autres...

## 🎯 Recherche Rapide dans Prisma Studio

1. **Pour voir l'admin** :
   - Cliquer sur **"UserProfile"**
   - Rechercher `ddwinsolutions@gmail.com`
   - Ou filtrer par `isSuperAdmin = true`

2. **Pour voir tous les utilisateurs** :
   - Cliquer sur **"UserProfile"**
   - Tous les utilisateurs sont listés

3. **Pour voir les logs d'emails** :
   - Cliquer sur **"EmailLog"**
   - Vérifier le statut et les erreurs

## ⚠️ Vérifications si Vous Ne Voyez Toujours Rien

### 1. Vérifier la Connexion

Assurez-vous que Prisma Studio est connecté à la bonne base de données :

```bash
# Vérifier le DATABASE_URL dans .env
grep DATABASE_URL .env

# Régénérer le client Prisma
pnpm db:generate

# Relancer Prisma Studio
pnpm db:studio
```

### 2. Vérifier les Migrations

Assurez-vous que les migrations ont été appliquées :

```bash
# Vérifier les migrations
pnpm prisma migrate status

# Appliquer les migrations si nécessaire
pnpm db:migrate
```

### 3. Vérifier le Client Prisma

Le client Prisma doit être à jour :

```bash
# Régénérer le client Prisma
pnpm db:generate
```

## ✅ Résumé

- ✅ **Les données sont présentes** dans la base de données
- ✅ **3 UserProfile** trouvés (incluant l'admin)
- ✅ **3 User** (NextAuth) trouvés
- ✅ **1 Tenant** trouvé

**Dans Prisma Studio, chercher** :
- **"UserProfile"** pour voir les utilisateurs de l'application
- **"User"** pour voir les utilisateurs NextAuth
- **"Tenant"** pour voir les tenants

Si vous ne voyez toujours rien, vérifiez que Prisma Studio est bien connecté à la bonne base de données avec `DATABASE_URL` dans `.env`.

