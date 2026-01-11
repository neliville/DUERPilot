# 📋 Instructions pour Coolify - Créer le rôle postgres

## Problème
Le rôle `postgres` n'existe pas sur votre serveur PostgreSQL, ce qui cause l'échec de toutes les connexions.

## Solution Rapide

### Via Coolify Dashboard

1. **Accédez à votre dashboard Coolify**
   - Ouvrez votre projet
   - Trouvez le service PostgreSQL

2. **Ouvrez la console du conteneur PostgreSQL**
   - Cliquez sur "Terminal" ou "Console" dans l'interface du service
   - Ou utilisez "Exec" pour exécuter des commandes

3. **Exécutez les commandes SQL suivantes** :

```bash
# Se connecter à PostgreSQL (utilisez l'utilisateur par défaut de Coolify)
psql -U $(whoami) -d postgres

# Ou si vous connaissez l'utilisateur par défaut :
psql -U VOTRE_UTILISATEUR_DEFAUT -d postgres
```

4. **Dans le shell psql, exécutez** :

```sql
-- Vérifier les utilisateurs existants
SELECT usename FROM pg_user;

-- Créer le rôle postgres
CREATE ROLE postgres WITH 
    LOGIN 
    PASSWORD 'VSnEZSVTtG1tXdKBLrvHfqMOFnzbT0wsHbPshpEoFlfNETKWmrZFywfrfg9uqAzF'
    SUPERUSER
    CREATEDB
    CREATEROLE;

-- Vérifier que c'est créé
\du postgres
```

### Via Coolify CLI (si disponible)

```bash
# Se connecter au conteneur PostgreSQL
coolify exec postgres

# Puis exécuter les commandes SQL ci-dessus
```

## Alternative : Utiliser un utilisateur existant

Si vous ne pouvez pas créer le rôle `postgres`, utilisez un utilisateur existant :

1. **Listez les utilisateurs** :
```sql
SELECT usename FROM pg_user;
```

2. **Mettez à jour votre `.env`** avec le bon utilisateur :
```env
DATABASE_URL="postgres://UTILISATEUR_EXISTANT:MOT_DE_PASSE@46.224.147.210:5432/postgres?sslmode=require"
```

## Vérification

Après avoir créé le rôle, testez depuis votre machine locale :

```bash
cd /home/neliville/dev/LAB/PROJECTS/duerpilot
node scripts/test-db-connection.js
```

Si ça fonctionne, vous pouvez continuer avec :

```bash
pnpm db:migrate --name init
```

## Fichiers SQL disponibles

- `scripts/create-postgres-role.sql` - Script complet pour créer le rôle
- `scripts/list-users.sql` - Script pour lister les utilisateurs existants
