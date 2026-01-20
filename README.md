# DUERPilot - Solution DUERP Conforme avec IA

Application SaaS moderne pour la création, la gestion et la mise à jour du Document Unique d'Évaluation des Risques Professionnels (DUERP) conforme au Code du travail français.

**Stack :** Next.js 14 + tRPC + Prisma + PostgreSQL + IA  
**Hébergement :** Hetzner (Allemagne) - Conforme RGPD  
**Statut :** ✅ Production

## 🆕 Nouveauté : Assistant DUERP (IA)

Parcours guidé en 4 étapes avec assistance IA pour créer votre DUERP complet :
- ✅ **Étape 1** : Gestion des unités de travail
- ✅ **Étape 2** : Évaluation avec suggestions IA de dangers
- ✅ **Étape 3** : Génération automatique du plan d'actions
- ✅ **Étape 4** : Export PDF et CSV

👉 [Documentation complète](./docs/ASSISTANT_DUERP_IA.md)

---

## 🚀 Démarrage Rapide

```bash
# Installation
pnpm install

# Configuration environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Configuration DB
pnpm prisma migrate dev
pnpm prisma generate

# Démarrage
pnpm dev
```

Le serveur démarre sur **http://localhost:3000**

➡️ **Guide complet :** [docs/guides/quick-start.md](docs/guides/quick-start.md)

---

## 📚 Documentation

### Points d'Entrée
- 📖 **[Documentation Complète](docs/README.md)** - Index principal
- 🚀 **[Guide de Démarrage](docs/guides/quick-start.md)** - Installation et configuration

### Documentation Technique
- 🎯 **[Plans et Tarifs](docs/plans-tarifs/README.md)** - FREE, STARTER, BUSINESS, PREMIUM, ENTREPRISE
- 🏗️ **[Architecture](docs/architecture/README.md)** - Stack technique et structure
- ⚙️ **[Configuration](docs/configuration/)** - Guides de configuration (Brevo, etc.)

---

## 🎯 Plans Tarifaires

| Plan | Prix/mois | Cible | Différenciateur |
|------|-----------|-------|-----------------|
| **FREE** | 0€ | Découverte (1-5 salariés) | Méthode générique |
| **STARTER** | 59€ | TPE (1-10 salariés) | Méthode INRS + conformité |
| **BUSINESS** | 149€ | PME (11-50 salariés) | IA + Import + API |
| **PREMIUM** | 349€ | PME structurées (51-250) | IA avancée + PAPRIPACT + Multi-sites |
| **ENTREPRISE** | Sur devis | Groupes (250+) | Solution sur mesure |

➡️ **Détails complets :** [docs/plans-tarifs/README.md](docs/plans-tarifs/README.md)

---

## 🏗️ Stack Technique

### Frontend
- **Framework :** Next.js 14 (App Router)
- **UI :** React 18 + Tailwind CSS + shadcn/ui
- **Formulaires :** React Hook Form + Zod

### Backend
- **API :** tRPC (type-safe end-to-end)
- **ORM :** Prisma
- **Base de données :** PostgreSQL
- **Auth :** NextAuth.js (JWT)

### Services
- **Email :** Brevo (transactional)
- **Hébergement :** Hetzner (Allemagne)
- **IA :** OpenAI / Anthropic (prévu)

---

## 📁 Structure du Projet

```
DUERPilot/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Pages authentification
│   ├── (dashboard)/         # Pages dashboard
│   ├── (landing)/           # Landing page
│   └── (onboarding)/        # Onboarding
├── components/              # Composants React
├── server/                  # Code serveur (tRPC)
├── lib/                     # Utilitaires
├── prisma/                  # Schéma et migrations
├── docs/                    # 📚 Documentation
│   ├── plans-tarifs/        # Plans et tarifs
│   ├── architecture/        # Architecture technique
│   ├── configuration/       # Guides configuration
│   ├── guides/              # Guides pratiques
│   └── archive/             # Fichiers obsolètes
└── types/                   # Types TypeScript
```

---

## 🔧 Commandes Utiles

### Développement
```bash
pnpm dev              # Démarrer le serveur (port 3000)
pnpm db:studio        # Ouvrir Prisma Studio (port 5555)
pnpm type-check       # Vérifier les types
pnpm lint             # Linter le code
```

### Base de Données
```bash
pnpm prisma migrate dev         # Créer une migration
pnpm prisma migrate deploy      # Appliquer les migrations
pnpm prisma generate            # Générer le client
pnpm prisma db seed             # Seed des données
```

### Production
```bash
pnpm build            # Build production
pnpm start            # Démarrer en production
```

---

## 🔐 Multi-Tenancy

- Chaque utilisateur appartient à un **Tenant** unique
- Isolation des données par `tenantId`
- Row-Level Security au niveau Prisma
- Super Admin peut accéder à tous les tenants

---

## 🎨 Conformité Réglementaire

DUERPilot est conforme au Code du travail français :
- Articles R4121-1 à R4121-4
- Circulaire DRT n°6 du 18 avril 2002
- Référentiel INRS
- Hébergement RGPD (Allemagne)

---

## 🤝 Contribution

### Workflow
1. Créer une branche depuis `main`
2. Faire vos modifications
3. Tester localement
4. Créer une Pull Request

### Standards
- **Code :** TypeScript strict
- **Style :** Prettier + ESLint
- **Commits :** Conventional Commits

---

## 📝 Changelog

### Janvier 2026
- ✅ Restructuration documentation
- ✅ Plans tarifaires consolidés (ESSENTIEL)
- ✅ Multi-tenancy implémenté
- ✅ Configuration Brevo
- ✅ Onboarding utilisateur

---

## 📞 Support

- **Documentation :** [docs/](docs/)
- **Email :** support@duerpilot.fr
- **Issues :** GitHub Issues

---

## 📄 Licence

Propriétaire - © 2026 DUERPilot

---

**Dernière mise à jour :** Janvier 2026  
**Version :** 1.0  
**Maintenu par :** Équipe DUERPilot
