-- Script pour lister tous les utilisateurs/rôles PostgreSQL
-- Utile pour identifier quel utilisateur utiliser si postgres n'existe pas

-- Lister tous les rôles
SELECT 
    rolname as "Nom du rôle",
    rolsuper as "Superuser",
    rolcreatedb as "Peut créer DB",
    rolcreaterole as "Peut créer rôles",
    rolcanlogin as "Peut se connecter",
    rolreplication as "Réplication"
FROM pg_roles
ORDER BY rolname;

-- Lister uniquement les utilisateurs qui peuvent se connecter
SELECT 
    usename as "Utilisateur",
    usesuper as "Superuser",
    usecreatedb as "Peut créer DB",
    usecreaterole as "Peut créer rôles"
FROM pg_user
WHERE usename NOT IN ('pg_monitor', 'pg_read_all_settings', 'pg_read_all_stats', 'pg_stat_scan_tables', 'pg_read_server_files', 'pg_write_server_files', 'pg_execute_server_program', 'pg_signal_backend')
ORDER BY usename;

-- Vérifier les bases de données et leurs propriétaires
SELECT 
    datname as "Base de données",
    pg_get_userbyid(datdba) as "Propriétaire"
FROM pg_database
WHERE datistemplate = false
ORDER BY datname;

