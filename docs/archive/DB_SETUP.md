# Configuration de la Base de Données - DUERPilot

## 🔍 Diagnostic de Connexion

Le test de connexion a échoué avec l'erreur d'authentification. Voici les étapes pour résoudre le problème et configurer la base de données.

## 📋 Vérifications à Faire

### 1. Vérifier les Identifiants
- ✅ L'URL de connexion est dans le fichier `.env`
- ⚠️ Vérifiez que le mot de passe est correct
- ⚠️ Vérifiez que l'utilisateur `postgres` existe sur le serveur

### 2. Vérifier les Permissions Réseau
- ⚠️ Vérifiez que votre IP est autorisée dans `pg_hba.conf`
- ⚠️ Vérifiez que le port 5432 est ouvert dans le firewall
- ⚠️ Vérifiez que PostgreSQL écoute sur toutes les interfaces (pas seulement localhost)

### 3. Vérifier la Configuration SSL
- L'URL utilise `sslmode=require`
- Si le serveur ne supporte pas SSL, essayez `sslmode=prefer` ou supprimez le paramètre

## 🚀 Méthodes de Configuration

### Méthode 1 : Prisma Migrate (Recommandée)

Une fois la connexion fonctionnelle :

```bash
# Tester la connexion
pnpm db:generate

# Créer et appliquer les migrations
pnpm db:migrate --name init

# Vérifier avec Prisma Studio
pnpm db:studio
```

### Méthode 2 : Script SQL Manuel

Si Prisma Migrate ne fonctionne pas, vous pouvez exécuter le script SQL directement :

```bash
# Avec psql
psql -h 46.224.147.210 -U postgres -d postgres -f scripts/create-migration-manually.sql

# Ou copiez le contenu de scripts/create-migration-manually.sql
# et exécutez-le dans votre client PostgreSQL préféré
```

### Méthode 3 : Script Automatique

```bash
# Exécuter le script de configuration
./scripts/setup-db.sh
```

## 🧪 Tests de Connexion

### Test avec le script Node.js
```bash
node scripts/test-db-connection.js
```

### Test avec différentes configurations SSL
```bash
node scripts/test-db-variants.js
```

### Test direct avec psql (si installé)
```bash
psql "postgres://postgres:VSnEZSVTtG1tXdKBLrvHfqMOFnzbT0wsHbPshpEoFlfNETKWmrZFywfrfg9uqAzF@46.224.147.210:5432/postgres?sslmode=require"
```

## 📊 Structure de la Base de Données

Une fois configurée, la base de données contiendra :

- **tenants** - Multi-tenancy
- **companies** - Entreprises
- **sites** - Sites physiques
- **work_units** - Unités de travail
- **hazard_refs** - Référentiel des dangers
- **risk_assessments** - Évaluations des risques
- **action_plans** - Plans d'actions
- **duerp_versions** - Versions du DUERP
- **duerp_version_snapshots** - Instantanés des versions
- **user_profiles** - Profils utilisateurs
- **audit_logs** - Journal d'audit
- **observations** - Observations de sécurité

## 🔧 Configuration Alternative : Base de Données Locale

Si vous souhaitez développer localement en attendant de résoudre le problème de connexion :

```bash
# Installer PostgreSQL localement
sudo apt install postgresql postgresql-contrib

# Créer une base de données locale
sudo -u postgres createdb duerp_ai

# Mettre à jour .env avec l'URL locale
DATABASE_URL="postgresql://postgres:password@localhost:5432/duerp_ai?schema=public"
```

## ✅ Vérification Post-Configuration

Une fois la base configurée :

```bash
# Vérifier que le client Prisma fonctionne
pnpm db:generate

# Ouvrir Prisma Studio pour visualiser les données
pnpm db:studio

# Vérifier les tables créées
psql -h 46.224.147.210 -U postgres -d postgres -c "\dt"
```

## 📝 Notes

- Le fichier `.env` contient les identifiants de connexion
- Les migrations Prisma sont dans `prisma/migrations/`
- Le schéma Prisma est dans `prisma/schema.prisma`
- Le client Prisma généré est dans `node_modules/.prisma/client`

## 🆘 Support

Si le problème persiste :
1. Vérifiez les logs du serveur PostgreSQL
2. Testez la connexion depuis un autre outil (DBeaver, pgAdmin, etc.)
3. Contactez l'administrateur de la base de données pour vérifier les permissions

