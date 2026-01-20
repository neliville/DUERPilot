# Architecture DUERPilot

**Stack :** Next.js 14 + tRPC + Prisma + PostgreSQL  
**Hébergement :** Hetzner (Allemagne)  
**Statut :** ✅ Production

---

## 🏗️ Stack Technique

### Frontend
- **Framework :** Next.js 14 (App Router)
- **UI :** React 18 + Tailwind CSS + shadcn/ui
- **État :** React Query (via tRPC)
- **Formulaires :** React Hook Form + Zod

### Backend
- **API :** tRPC (type-safe end-to-end)
- **ORM :** Prisma
- **Base de données :** PostgreSQL
- **Auth :** NextAuth.js (JWT)

### Services Externes
- **Email :** Brevo (transactional)
- **Stockage :** MinIO / S3 (prévu)
- **IA :** OpenAI / Anthropic (prévu)

---

## 📁 Structure du Projet

```
DUERPilot/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Pages d'authentification
│   ├── (dashboard)/         # Pages dashboard (protégées)
│   ├── (landing)/           # Landing page
│   ├── (onboarding)/        # Onboarding nouvel utilisateur
│   └── api/                 # API Routes
├── components/              # Composants React
│   ├── ui/                  # Composants shadcn/ui
│   ├── dashboard/           # Composants dashboard
│   ├── evaluations/         # Composants évaluations
│   ├── plans/               # Composants plans tarifaires
│   └── ...
├── server/                  # Code serveur
│   ├── api/                 # tRPC routers
│   │   ├── routers/         # Routers par domaine
│   │   ├── trpc.ts          # Configuration tRPC
│   │   └── root.ts          # Router principal
│   └── services/            # Services métier
│       ├── email/           # Service email (Brevo)
│       └── ...
├── lib/                     # Utilitaires
│   ├── db.ts                # Client Prisma
│   ├── auth-config.ts       # Configuration NextAuth
│   ├── plans.ts             # Configuration plans tarifaires
│   └── utils.ts             # Fonctions utilitaires
├── prisma/                  # Schéma Prisma
│   ├── schema.prisma        # Schéma de base de données
│   └── migrations/          # Migrations
├── types/                   # Types TypeScript
│   └── index.ts             # Types globaux
└── docs/                    # Documentation
    ├── plans-tarifs/        # Documentation plans
    ├── configuration/       # Guides de configuration
    ├── architecture/        # Documentation architecture
    └── guides/              # Guides utilisateur
```

---

## 🔐 Multi-Tenancy

### Principe
- Chaque utilisateur appartient à un **Tenant** unique
- Les données sont isolées par `tenantId`
- Row-Level Security au niveau Prisma

### Modèles Principaux
```prisma
model Tenant {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  users     UserProfile[]
  companies Company[]
  // ... autres relations
}

model UserProfile {
  id       String @id @default(cuid())
  tenantId String
  email    String @unique
  roles    String[]
  plan     String @default("free")
  tenant   Tenant @relation(fields: [tenantId], references: [id])
  // ...
}
```

### Vérifications
- Middleware tRPC `enforceTenant` vérifie le `tenantId`
- Toutes les requêtes filtrent par `tenantId`
- Super Admin peut accéder à tous les tenants

---

## 🔑 Authentification

### NextAuth.js
- **Stratégie :** JWT (pas de session DB)
- **Provider :** Credentials (email + password)
- **Hashing :** bcrypt

### Flow d'Inscription
1. Utilisateur s'inscrit → Création `User` + `UserProfile`
2. Création d'un **Tenant unique** pour chaque utilisateur
3. Envoi email d'activation (code 6 chiffres)
4. Vérification du code → `emailVerified = true`
5. Première connexion → Redirection vers `/onboarding`

### Session JWT
```typescript
{
  user: {
    id: string,
    email: string,
    name: string,
    tenantId: string,
    plan: string,
    roles: string[],
    isSuperAdmin: boolean
  }
}
```

---

## 🎯 Plans Tarifaires

### Configuration
Fichier central : `lib/plans.ts`

### Vérifications
- **Middlewares tRPC :** Vérifient les accès avant exécution
- **Composants UI :** Bloquent l'accès aux fonctionnalités
- **Backend :** Vérifie les quotas et limites

### Plans
- FREE (0€) - Découverte
- ESSENTIEL (29€) - TPE avec INRS
- PRO (79€) - PME avec IA
- EXPERT (149€) - PME structurées (limites généreuses)
- ENTREPRISE (Sur devis) - Solution sur mesure

Voir `docs/plans-tarifs/README.md` pour plus de détails.

---

## 📊 Base de Données

### PostgreSQL
- **Version :** 14+
- **Hébergement :** Hetzner
- **ORM :** Prisma

### Modèles Principaux
- `Tenant` - Multi-tenancy
- `User` - Authentification NextAuth
- `UserProfile` - Profil utilisateur métier
- `Company` - Entreprises
- `WorkUnit` - Unités de travail
- `DangerousSituation` - Situations dangereuses
- `RiskAssessment` - Évaluations de risques
- `ActionPlan` - Plans d'action
- `Observation` - Observations terrain

### Migrations
```bash
# Créer une migration
pnpm prisma migrate dev --name nom_migration

# Appliquer les migrations
pnpm prisma migrate deploy

# Générer le client
pnpm prisma generate
```

---

## 🚀 Déploiement

### Environnements
- **Développement :** `pnpm dev` (port 3000)
- **Production :** Coolify / Docker

### Variables d'Environnement
```env
# Base de données
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://...

# Brevo
BREVO_API_KEY=...
BREVO_TEMPLATE_ACTIVATION_ID=2

# (Optionnel) IA
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
```

### Build
```bash
# Build production
pnpm build

# Démarrer
pnpm start
```

---

## 🔧 Développement

### Installation
```bash
# Installer les dépendances
pnpm install

# Configurer la base de données
pnpm prisma migrate dev
pnpm prisma generate

# Seed (optionnel)
pnpm prisma db seed

# Démarrer le serveur
pnpm dev
```

### Outils
- **Prisma Studio :** `pnpm db:studio` (port 5555)
- **Type checking :** `pnpm type-check`
- **Linting :** `pnpm lint`

---

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)

---

**Dernière mise à jour :** Janvier 2026
