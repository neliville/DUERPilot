---
name: duerpilotrules
description: This is a new rule
---

# Overview

# DUERPilot - Règles de Projet Cursor

## Architecture & Stack
- Next.js 14 App Router (pas de Pages Router)
- tRPC pour l'API type-safe
- Prisma ORM avec PostgreSQL
- NextAuth.js pour l'authentification JWT
- Tailwind CSS + shadcn/ui pour l'UI
- React Hook Form + Zod pour les formulaires

## Multi-Tenancy
- Toujours filtrer par `tenantId` dans les requêtes Prisma
- Utiliser le middleware `enforceTenant` dans les routers tRPC
- Jamais d'accès direct aux données sans vérification du tenant
- Exception : Super Admin peut accéder à tous les tenants

## Conventions de Code
- TypeScript strict mode activé
- Pas de `any`, utiliser `unknown` si type inconnu
- Nommer les fichiers en kebab-case : `risk-assessment.tsx`
- Composants en PascalCase : `RiskAssessmentForm`
- Hooks personnalisés : `useRiskAssessment`

## Structure tRPC
- Routers organisés par domaine dans `/server/api/routers/`
- Toujours valider les inputs avec Zod
- Utiliser les contextes protégés : `protectedProcedure`
- Retourner des erreurs explicites avec `TRPCError`

## Gestion des Plans
- Vérifier les quotas AVANT toute création de ressource
- Utiliser `lib/plans.ts` comme source unique de vérité
- Afficher des messages clairs pour les limites atteintes
- Proposer un upgrade vers le plan supérieur

## Base de Données
- Toujours utiliser Prisma pour les requêtes
- Créer une migration pour tout changement de schéma
- Tester les migrations sur un environnement de développement
- Inclure des index pour les champs fréquemment filtrés

## Sécurité
- Jamais de données sensibles dans les logs
- Hasher les mots de passe avec bcrypt (min 12 rounds)
- Valider et sanitizer toutes les entrées utilisateur
- Vérifier les permissions avant toute mutation

## Performance
- Utiliser `React.memo` pour les composants lourds
- Implémenter la pagination pour les listes > 50 items
- Prefetch les données avec React Query
- Optimiser les images avec Next.js Image

## Emails
- Utiliser Brevo pour tous les emails transactionnels
- Templates HTML responsive avec fallback texte
- Toujours inclure un lien de désinscription
- Logger les erreurs d'envoi pour debug

## RGPD & Conformité
- Données hébergées en Allemagne (Hetzner)
- Isolation stricte des données par tenant
- Logs d'accès pour audit
- Possibilité d'export et suppression des données

## Tests
- Tester les mutations tRPC sensibles
- Vérifier les permissions dans les tests
- Simuler les limites de plan
- Tester les cas d'erreur (tenant non trouvé, quota dépassé)

## Documentation
- Commenter les fonctions complexes avec JSDoc
- Documenter les décisions d'architecture
- Maintenir à jour `/docs/` pour les guides utilisateur
