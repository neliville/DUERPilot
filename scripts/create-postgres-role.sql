-- Script SQL pour créer le rôle postgres sur PostgreSQL
-- À exécuter dans le conteneur PostgreSQL via Coolify ou psql

-- ============================================
-- ÉTAPE 1: Vérifier les utilisateurs existants
-- ============================================
SELECT 
    usename as "Utilisateur",
    usesuper as "Superuser",
    usecreatedb as "Peut créer DB",
    usecreaterole as "Peut créer rôles"
FROM pg_user
ORDER BY usename;

-- ============================================
-- ÉTAPE 2: Créer le rôle postgres
-- ============================================
-- Option A: Avec tous les privilèges (recommandé pour développement)
CREATE ROLE postgres WITH 
    LOGIN 
    PASSWORD 'VSnEZSVTtG1tXdKBLrvHfqMOFnzbT0wsHbPshpEoFlfNETKWmrZFywfrfg9uqAzF'
    SUPERUSER
    CREATEDB
    CREATEROLE
    INHERIT
    REPLICATION
    BYPASSRLS;

-- Option B: Avec privilèges limités (pour production)
-- CREATE ROLE postgres WITH 
--     LOGIN 
--     PASSWORD 'VSnEZSVTtG1tXdKBLrvHfqMOFnzbT0wsHbPshpEoFlfNETKWmrZFywfrfg9uqAzF'
--     CREATEDB
--     CREATEROLE;

-- ============================================
-- ÉTAPE 3: Donner les privilèges sur la base de données
-- ============================================
GRANT ALL PRIVILEGES ON DATABASE postgres TO postgres;

-- ============================================
-- ÉTAPE 4: Vérifier que le rôle a été créé
-- ============================================
\du postgres

-- ============================================
-- ÉTAPE 5: Tester la connexion (optionnel)
-- ============================================
-- \c postgres postgres
-- SELECT current_user, current_database();

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Si vous obtenez une erreur "permission denied", vous devez être connecté
--    en tant que superuser pour créer un nouveau rôle
-- 2. Dans Coolify, l'utilisateur par défaut est généralement le premier utilisateur
--    créé lors de l'initialisation du conteneur
-- 3. Si vous ne pouvez pas créer le rôle postgres, utilisez un utilisateur existant
--    et mettez à jour votre fichier .env en conséquence

