# 🔧 Solution : Rôle "postgres" n'existe pas

## Problème Identifié

Les logs PostgreSQL montrent clairement :
```
FATAL:  role "postgres" does not exist
```

Le rôle utilisateur `postgres` n'existe pas sur votre serveur PostgreSQL hébergé sur Coolify/Hetzner.

## Solutions

### Solution 1 : Créer le rôle "postgres" (Recommandé)

Connectez-vous au conteneur PostgreSQL dans Coolify et exécutez :

```sql
-- Se connecter en tant qu'utilisateur superuser (généralement le premier utilisateur créé)
-- Dans Coolify, cela pourrait être l'utilisateur par défaut du conteneur

-- Créer le rôle postgres
CREATE ROLE postgres WITH LOGIN PASSWORD 'VSnEZSVTtG1tXdKBLrvHfqMOFnzbT0wsHbPshpEoFlfNETKWmrZFywfrfg9uqAzF';

-- Donner tous les privilèges
ALTER ROLE postgres WITH SUPERUSER CREATEDB CREATEROLE;

-- Ou si vous préférez des privilèges limités :
-- GRANT ALL PRIVILEGES ON DATABASE postgres TO postgres;
```

### Solution 2 : Utiliser un utilisateur existant

Si un autre utilisateur existe déjà, vous pouvez :

1. **Identifier les utilisateurs existants** :
```sql
SELECT usename FROM pg_user;
```

2. **Mettre à jour votre `.env`** avec le bon utilisateur :
```env
DATABASE_URL="postgres://UTILISATEUR_EXISTANT:MOT_DE_PASSE@46.224.147.210:5432/postgres?sslmode=require"
```

### Solution 3 : Via Coolify Dashboard

1. Allez dans votre dashboard Coolify
2. Ouvrez le service PostgreSQL
3. Accédez à la console/terminal du conteneur
4. Exécutez les commandes SQL ci-dessus

## Commandes SQL Complètes

```sql
-- 1. Vérifier les utilisateurs existants
SELECT usename, usesuper FROM pg_user;

-- 2. Créer le rôle postgres avec le mot de passe fourni
CREATE ROLE postgres WITH 
  LOGIN 
  PASSWORD 'VSnEZSVTtG1tXdKBLrvHfqMOFnzbT0wsHbPshpEoFlfNETKWmrZFywfrfg9uqAzF'
  SUPERUSER
  CREATEDB
  CREATEROLE;

-- 3. Vérifier que le rôle a été créé
\du

-- 4. Tester la connexion
\c postgres postgres
```

## Mise à Jour du Fichier .env

Une fois le rôle créé, votre `.env` actuel devrait fonctionner :

```env
DATABASE_URL="postgres://postgres:VSnEZSVTtG1tXdKBLrvHfqMOFnzbT0wsHbPshpEoFlfNETKWmrZFywfrfg9uqAzF@46.224.147.210:5432/postgres?sslmode=require"
```

## Test de Connexion

Après avoir créé le rôle, testez la connexion :

```bash
# Tester avec Prisma
pnpm db:generate
pnpm db:migrate --name init

# Ou avec le script de test
node scripts/test-db-connection.js
```

## Note sur Coolify

Coolify peut créer PostgreSQL avec un utilisateur par défaut différent de `postgres`. 
Vérifiez dans les variables d'environnement du service PostgreSQL dans Coolify quel utilisateur a été créé automatiquement.

