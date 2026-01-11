# Guide de démarrage rapide - DUERPilot

## 🎯 Stack choisie

### Frontend
- **Next.js 14+** avec App Router
- **React 18+** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **TanStack Query** pour la gestion d'état serveur
- **Zustand** pour l'état client
- **React Hook Form** + **Zod** pour les formulaires

### Backend
- **Next.js API Routes** + **tRPC** (API type-safe)
- **Prisma ORM** + **PostgreSQL**
- **NextAuth.js v5** pour l'authentification

### IA & Services
- **OpenAI API** ou **Anthropic Claude**
- **Puppeteer** pour la génération PDF
- **next-pwa** pour les fonctionnalités PWA

---

## 🚀 Installation rapide

### 1. Prérequis
```bash
# Vérifier les versions
node --version  # >= 18.0.0
pnpm --version  # >= 8.0.0
```

### 2. Installation des dépendances
```bash
pnpm install
```

### 3. Configuration de l'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos valeurs :
# - DATABASE_URL (PostgreSQL)
# - NEXTAUTH_SECRET (générer avec: openssl rand -base64 32)
# - OPENAI_API_KEY (pour l'IA)
```

### 4. Configuration de la base de données
```bash
# Générer le client Prisma
pnpm db:generate

# Créer la base de données PostgreSQL
# Puis appliquer les migrations
pnpm db:migrate

# (Optionnel) Ouvrir Prisma Studio pour visualiser les données
pnpm db:studio
```

### 5. Lancer l'application
```bash
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

---

## 📁 Structure du projet

```
duerpilot/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Routes d'authentification
│   ├── (dashboard)/         # Routes du dashboard (protégées)
│   ├── api/                 # API Routes Next.js
│   │   ├── trpc/           # Routes tRPC
│   │   └── auth/           # Routes NextAuth
│   └── layout.tsx           # Layout racine
│
├── components/              # Composants React
│   ├── ui/                 # Composants shadcn/ui
│   ├── dashboard/          # Composants spécifiques dashboard
│   ├── forms/              # Composants de formulaires
│   └── ...
│
├── lib/                     # Utilitaires
│   ├── db/                 # Client Prisma
│   ├── auth/               # Configuration NextAuth
│   ├── trpc/               # Configuration tRPC
│   ├── ai/                 # Intégration IA
│   └── utils/              # Fonctions utilitaires
│
├── server/                  # Code serveur
│   ├── api/                # Routers tRPC
│   │   ├── routers/        # Routers par domaine
│   │   └── root.ts         # Router principal
│   └── middleware/         # Middleware personnalisé
│
├── types/                   # Types TypeScript
│   ├── database.ts         # Types générés Prisma
│   └── ...
│
├── prisma/                  # Schéma Prisma
│   ├── schema.prisma       # Schéma de base de données
│   └── migrations/         # Migrations
│
└── public/                  # Fichiers statiques
    ├── icons/              # Icônes PWA
    └── ...
```

---

## 🔑 Points clés de l'architecture

### Multi-Tenancy
- Isolation des données par `tenantId` dans toutes les tables
- Row-Level Security (RLS) possible avec PostgreSQL
- Chaque tenant a son propre espace de travail

### RBAC (Role-Based Access Control)
- Rôles : `super_admin`, `admin_tenant`, `qse`, `manager`, `operator`, `auditor`
- Permissions définies dans `UserProfile.roles`
- Middleware NextAuth pour vérifier les permissions

### Type-Safety
- TypeScript partout
- tRPC pour API type-safe end-to-end
- Prisma génère les types automatiquement
- Zod pour validation runtime

### PWA
- Service Worker avec next-pwa
- Manifest.json pour installation
- Cache intelligent pour fonctionnement hors ligne
- Notifications push (à configurer)

---

## 📝 Prochaines étapes

1. **Configurer l'authentification**
   - Créer les pages de connexion/inscription
   - Configurer NextAuth.js avec providers
   - Implémenter le RBAC

2. **Créer les pages principales**
   - Dashboard
   - Gestion des entreprises
   - Gestion des unités de travail
   - Évaluation des risques
   - Plan d'actions

3. **Intégrer l'IA**
   - Configurer l'API OpenAI/Anthropic
   - Créer les fonctions de suggestion
   - Intégrer dans les formulaires

4. **Génération PDF**
   - Créer les templates PDF
   - Configurer Puppeteer
   - Générer les versions DUERP

5. **PWA**
   - Configurer next-pwa
   - Créer le manifest.json
   - Tester l'installation

---

## 🛠️ Commandes utiles

```bash
# Développement
pnpm dev              # Lancer le serveur de dev
pnpm build            # Build de production
pnpm start            # Lancer en production

# Base de données
pnpm db:generate      # Générer le client Prisma
pnpm db:migrate       # Créer/appliquer migrations
pnpm db:push          # Push le schéma (dev uniquement)
pnpm db:studio        # Ouvrir Prisma Studio

# Qualité de code
pnpm lint             # Linter
pnpm type-check       # Vérifier les types
pnpm test             # Tests unitaires
pnpm test:e2e         # Tests E2E
```

---

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

## ⚠️ Notes importantes

1. **Sécurité** : Ne jamais commiter le fichier `.env`
2. **Migrations** : Toujours créer des migrations pour les changements de schéma
3. **Types** : Régénérer le client Prisma après chaque changement de schéma
4. **PWA** : Tester sur différents navigateurs et appareils
5. **IA** : Gérer les limites de rate et les coûts de l'API

