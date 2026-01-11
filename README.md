# DUERPilot - Solution DUERP conforme au Code du travail

Application SaaS moderne pour la création, la gestion et la mise à jour du Document Unique d'Évaluation des Risques Professionnels (DUERP) conforme au Code du travail français, avec intégration d'intelligence artificielle.

**Référentiel propriétaire** : Basé sur le Code du travail (Articles R4121-1 à R4121-4) et la circulaire DRT n°6 du 18 avril 2002. Indépendant d'OiRA. Contenu propriétaire.

## 🚀 Stack Technologique

- **Frontend** : Next.js 14+ (App Router), React 18+, TypeScript
- **Styling** : Tailwind CSS, shadcn/ui
- **Backend** : Next.js API Routes + tRPC
- **Base de données** : PostgreSQL + Prisma ORM
- **Authentification** : NextAuth.js v5
- **IA** : OpenAI API / Anthropic Claude
- **PWA** : next-pwa
- **PDF** : Puppeteer

Voir [STACK_PROPOSAL.md](./STACK_PROPOSAL.md) pour plus de détails.

## 📋 Prérequis

- Node.js 18+ 
- pnpm 8+
- PostgreSQL 15+
- (Optionnel) Redis pour le cache

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd duerpilot
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

4. **Configurer la base de données**
```bash
# Générer le client Prisma
pnpm db:generate

# Créer la base de données et appliquer les migrations
pnpm db:migrate

# Peupler le référentiel avec les données initiales (catégories, secteurs, situations)
pnpm db:seed
```

5. **Lancer le serveur de développement**
```bash
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
duerpilot/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Routes d'authentification
│   ├── (dashboard)/       # Routes du dashboard
│   ├── api/               # API Routes
│   └── layout.tsx         # Layout principal
├── components/            # Composants React réutilisables
│   ├── ui/               # Composants UI (shadcn/ui)
│   └── ...
├── lib/                   # Utilitaires et helpers
│   ├── db/               # Client Prisma
│   ├── auth/             # Configuration NextAuth
│   └── ...
├── server/                # Code serveur (tRPC, API)
│   ├── api/              # Routers tRPC
│   └── ...
├── types/                 # Types TypeScript
├── prisma/                # Schéma Prisma et migrations
│   └── schema.prisma
├── public/                # Fichiers statiques
└── data/                  # Designs et ressources
```

## 🧪 Tests

```bash
# Tests unitaires (85+ tests)
pnpm test

# Tests E2E
pnpm test:e2e
```

**Couverture des tests** :
- ✅ Logique métier PAPRIPACT (éligibilité, seuils)
- ✅ Validation des schémas Zod (CRUD complet)
- ✅ Participation des travailleurs (types, validation)
- ✅ Messages légaux (structure, références réglementaires)
- ✅ Mapping NAF → Secteur

## 📦 Scripts disponibles

- `pnpm dev` - Lancer le serveur de développement
- `pnpm build` - Construire pour la production
- `pnpm start` - Lancer le serveur de production
- `pnpm lint` - Linter le code
- `pnpm type-check` - Vérifier les types TypeScript
- `pnpm db:generate` - Générer le client Prisma
- `pnpm db:push` - Synchroniser le schéma (développement)
- `pnpm db:migrate` - Créer/appliquer les migrations
- `pnpm db:seed` - Peupler la base avec les données initiales
- `pnpm db:studio` - Ouvrir Prisma Studio

## 🔐 Sécurité

- Authentification sécurisée avec NextAuth.js
- RBAC (Role-Based Access Control)
- Validation des données avec Zod
- Protection CSRF intégrée
- Headers de sécurité configurés

## 📄 Licence

[À définir]

## 👥 Équipe

[À compléter]

