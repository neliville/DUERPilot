# Guide de Démarrage Rapide

Ce guide vous permet de démarrer avec DUERPilot en moins de 10 minutes.

---

## 📋 Prérequis

- **Node.js** 18+ ([Télécharger](https://nodejs.org))
- **PostgreSQL** 14+ ([Télécharger](https://www.postgresql.org/download/))
- **pnpm** ([Installer](https://pnpm.io/installation))

---

## 🚀 Installation

### 1. Cloner le Projet

```bash
git clone <repo-url>
cd DUERPilot
```

### 2. Installer les Dépendances

```bash
pnpm install
```

### 3. Configurer les Variables d'Environnement

Créer un fichier `.env` à la racine :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/duerpilot"

# NextAuth (générer avec: openssl rand -base64 32)
NEXTAUTH_SECRET="votre-secret-aleatoire-tres-long"
NEXTAUTH_URL="http://localhost:3000"

# Brevo (emails transactionnels)
BREVO_API_KEY="xkeysib-votre-cle-api"
BREVO_TEMPLATE_ACTIVATION_ID="2"

# (Optionnel) IA
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
```

### 4. Configurer la Base de Données

```bash
# Créer la base de données et appliquer les migrations
pnpm prisma migrate dev

# Générer le client Prisma
pnpm prisma generate

# (Optionnel) Seed des données de test
pnpm prisma db seed
```

### 5. Démarrer le Serveur

```bash
pnpm dev
```

Le serveur démarre sur **http://localhost:3000** 🎉

---

## 🔧 Outils de Développement

### Prisma Studio (Interface DB)

```bash
pnpm db:studio
```

Ouvre une interface web sur **http://localhost:5555** pour explorer la base de données.

### Type Checking

```bash
pnpm type-check
```

### Linting

```bash
pnpm lint
```

### Build Production

```bash
pnpm build
pnpm start
```

---

## 👤 Créer un Utilisateur de Test

### Via l'Interface

1. Aller sur http://localhost:3000
2. Cliquer sur "S'inscrire"
3. Remplir le formulaire
4. Vérifier votre email pour le code d'activation
5. Entrer le code et se connecter

### Via Script (Super Admin)

```bash
pnpm exec tsx scripts/create-super-admin.ts
```

Crée un super admin avec :
- Email : `admin@duerpilot.fr`
- Mot de passe : `Admin123!`

---

## 📊 Accès aux Données

### Prisma Studio

```bash
pnpm db:studio
```

### Modèles Principaux

- **UserProfile** : Utilisateurs de l'application
- **Tenant** : Tenants (multi-tenancy)
- **Company** : Entreprises
- **WorkUnit** : Unités de travail
- **RiskAssessment** : Évaluations de risques
- **DangerousSituation** : Situations dangereuses

---

## 🎯 Tester les Plans

### Plan FREE (par défaut)

Tous les nouveaux utilisateurs ont le plan FREE.

### Changer de Plan

Via Prisma Studio :
1. Ouvrir **UserProfile**
2. Trouver votre utilisateur
3. Modifier le champ `plan` : `free`, `essentiel`, `pro`, `expert`
4. Sauvegarder

Ou via script :

```bash
pnpm exec tsx scripts/update-user-plan.ts <email> <plan>
```

---

## 🐛 Dépannage

### Port 3000 déjà utilisé

```bash
# Trouver le processus
lsof -ti:3000

# Tuer le processus
kill -9 <PID>
```

### Erreur de connexion PostgreSQL

Vérifier que PostgreSQL est démarré :

```bash
# Linux/Mac
sudo service postgresql status

# Ou
pg_ctl status
```

### Erreur Prisma

Régénérer le client :

```bash
pnpm prisma generate
```

### Cache Next.js corrompu

```bash
rm -rf .next
pnpm dev
```

---

## 📚 Prochaines Étapes

- 📖 Lire la [Documentation Architecture](../architecture/README.md)
- 🎯 Comprendre les [Plans et Tarifs](../plans-tarifs/README.md)
- ⚙️ Configurer [Brevo pour les emails](../configuration/brevo-emails.md)

---

## 🤝 Besoin d'Aide ?

- **Documentation :** `docs/`
- **Email :** support@duerpilot.fr
- **Issues :** GitHub Issues

---

**Dernière mise à jour :** Janvier 2026
