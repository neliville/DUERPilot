# Documentation DUERPilot

Bienvenue dans la documentation technique de DUERPilot.

---

## 📚 Table des Matières

### 🎯 [Plans et Tarifs](./plans-tarifs/README.md)
Documentation complète des plans tarifaires, fonctionnalités et positionnement.

**Contenu :**
- Plans actuels (FREE, ESSENTIEL, PRO, EXPERT)
- Tableau comparatif des fonctionnalités
- Messages d'upgrade et positionnement
- Implémentation technique

### 🏗️ [Architecture](./architecture/README.md)
Architecture technique du projet, stack et structure.

**Contenu :**
- Stack technique (Next.js, tRPC, Prisma)
- Structure du projet
- Multi-tenancy
- Authentification
- Base de données

### 🤖 [Assistant DUERP (IA)](./ASSISTANT_DUERP_IA.md)
Documentation complète de l'Assistant DUERP avec intelligence artificielle.

**Contenu :**
- Parcours guidé en 4 étapes
- Fonctionnalités IA (suggestions, cotations, actions)
- Architecture et composants
- Intégration OpenAI/Claude
- Guide d'implémentation

### ⚙️ [Configuration](./configuration/)
Guides de configuration des services externes.

**Fichiers :**
- `brevo-emails.md` - Configuration Brevo pour les emails transactionnels

### 📖 [Guides](./guides/)
Guides pratiques pour les développeurs.

**À venir :**
- Guide de démarrage rapide
- Guide de contribution
- Guide de déploiement

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- pnpm

### Installation

```bash
# Cloner le projet
git clone <repo-url>
cd DUERPilot

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Configurer la base de données
pnpm prisma migrate dev
pnpm prisma generate

# (Optionnel) Seed des données
pnpm prisma db seed

# Démarrer le serveur de développement
pnpm dev
```

Le serveur démarre sur http://localhost:3000

### Outils de Développement

```bash
# Prisma Studio (interface DB)
pnpm db:studio

# Type checking
pnpm type-check

# Linting
pnpm lint

# Build production
pnpm build
```

---

## 📁 Structure de la Documentation

```
docs/
├── README.md                    # Ce fichier
├── ASSISTANT_DUERP_IA.md       # Documentation Assistant DUERP (IA)
├── CONFORMITE_REGLEMENTAIRE.md # Conformité réglementaire DUERP
├── plans-tarifs/
│   └── README.md               # Plans et tarifs complets
├── configuration/
│   └── brevo-emails.md         # Configuration Brevo
├── architecture/
│   └── README.md               # Architecture technique
├── guides/
│   └── quick-start.md          # Guide de démarrage rapide
└── archive/
    └── (fichiers obsolètes)
```

---

## 🔗 Liens Utiles

### Code Source
- **Source de vérité Plans :** `lib/plans.ts`
- **Configuration Auth :** `lib/auth-config.ts`
- **Schéma DB :** `prisma/schema.prisma`
- **API tRPC :** `server/api/`

### Services Externes
- [Brevo](https://www.brevo.com) - Emails transactionnels
- [Hetzner](https://www.hetzner.com) - Hébergement

### Documentation Externe
- [Next.js](https://nextjs.org/docs)
- [tRPC](https://trpc.io/docs)
- [Prisma](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

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
- **Tests :** À venir

---

## 📝 Changelog

### Janvier 2026
- ✅ **Assistant DUERP (IA)** - Parcours guidé en 4 étapes avec assistance IA
- ✅ Méthode d'évaluation "assistance_ia" (plans PRO+)
- ✅ Suggestions de dangers IA inline
- ✅ Dialog d'évaluation avec sliders interactifs
- ✅ Proposition de cotation IA
- ✅ Restructuration complète de la documentation
- ✅ Consolidation des plans tarifaires (ESSENTIEL au lieu de STARTER)
- ✅ Documentation architecture
- ✅ Configuration Brevo

---

## 📞 Support

Pour toute question :
- **Email :** support@duerpilot.fr
- **Issues :** GitHub Issues (si applicable)

---

**Dernière mise à jour :** Janvier 2026  
**Version :** 1.0  
**Maintenu par :** Équipe DUERPilot
