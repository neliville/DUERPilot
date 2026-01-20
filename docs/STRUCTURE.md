# Structure de la Documentation

Ce document décrit l'organisation de la documentation DUERPilot.

---

## 📁 Organisation

```
docs/
├── README.md                           # Index principal
├── STRUCTURE.md                        # Ce fichier
│
├── plans-tarifs/
│   └── README.md                       # Plans et tarifs complets
│
├── architecture/
│   └── README.md                       # Architecture technique
│
├── configuration/
│   └── brevo-emails.md                 # Configuration Brevo
│
├── guides/
│   └── quick-start.md                  # Guide de démarrage rapide
│
└── archive/                            # Fichiers obsolètes
    ├── PLANS_COHERENCE_2026.md
    ├── GRILLE_TARIFAIRE_V2_RESUME.md
    ├── AJUSTEMENTS_PRICING_V1.1.md
    ├── SPECIFICATION_PLANS_TARIFAIRES.md
    ├── IMPLEMENTATION_PLANS.md
    └── ... (88 fichiers archivés)
```

---

## 📚 Fichiers Principaux

### 1. README.md (Racine du Projet)
**Emplacement :** `/README.md`  
**Contenu :**
- Présentation du projet
- Démarrage rapide
- Liens vers la documentation
- Stack technique
- Commandes utiles

### 2. Documentation Index
**Emplacement :** `/docs/README.md`  
**Contenu :**
- Table des matières
- Liens vers toutes les sections
- Guide de navigation

### 3. Plans et Tarifs
**Emplacement :** `/docs/plans-tarifs/README.md`  
**Contenu :**
- Plans actuels (FREE, ESSENTIEL, PRO, EXPERT)
- Tableau comparatif complet
- Fonctionnalités détaillées
- Messages d'upgrade
- Implémentation technique

### 4. Architecture
**Emplacement :** `/docs/architecture/README.md`  
**Contenu :**
- Stack technique
- Structure du projet
- Multi-tenancy
- Authentification
- Base de données

### 5. Configuration Brevo
**Emplacement :** `/docs/configuration/brevo-emails.md`  
**Contenu :**
- Templates configurés
- Variables d'environnement
- Tests et dépannage

### 6. Guide de Démarrage
**Emplacement :** `/docs/guides/quick-start.md`  
**Contenu :**
- Installation pas à pas
- Configuration
- Premiers pas
- Dépannage

---

## 🗂️ Archive

L'archive contient **88 fichiers obsolètes** qui ont été consolidés :

### Catégories Archivées

**Plans et Tarifs (5 fichiers)**
- PLANS_COHERENCE_2026.md
- GRILLE_TARIFAIRE_V2_RESUME.md
- AJUSTEMENTS_PRICING_V1.1.md
- SPECIFICATION_PLANS_TARIFAIRES.md
- IMPLEMENTATION_PLANS.md

**Configuration Brevo (11 fichiers)**
- GUIDE_CONFIGURATION_BREVO_ACTIVATION.md
- CORRECTION_TEMPLATE_BREVO_ID2.md
- PROBLEME_FORMULAIRE_BREVO.md
- CONFIGURATION_BREVO_FORMULAIRE.md
- VERIFICATION_BREVO.md
- ETAT_CONFIGURATION_BREVO.md
- DEBUG_EMAILS.md
- CONFIGURATION_EMAIL.md
- CORRECTION_EMAILS_BREVO.md
- GUIDE_TEMPLATES_BREVO.md
- ACTIONS_IMMEDIATES_BREVO.md

**Debug et Statuts (15+ fichiers)**
- CORRECTION_REDIRECTION_ONBOARDING.md
- PROCHAINES_ETAPES*.md
- PLAN_ACTION*.md
- RESUME_*.md
- MISE_A_JOUR*.md
- ACCES_*.md
- GUIDE_PRISMA_STUDIO.md
- UTILISATEURS_DANS_BD.md
- DATABASE_STATUS.md
- DB_SETUP.md
- DIAGNOSTIC_RESULT.md
- ... et autres

**Configuration et Setup (20+ fichiers)**
- ADMIN_SETUP_COMPLETE.md
- AMELIORATION_UX_PLANS.md
- AUDIT_UX_ACCESSIBILITE.md
- CONFIGURATION_*.md
- CORRECTIONS_FINALES.md
- DEVELOPMENT_STATUS.md
- FIX_*.md
- INSTRUCTIONS_COOLIFY.md
- INTEGRATION_*.md
- MINIO_STORAGE.md
- PALETTE_COULEURS_V2.md
- SOLUTION_*.md
- REDEMARRAGE_SERVEUR.md
- STATUT_PROJET.md
- STRATEGIE_PRICING_SAAS.md
- PLAN_IMPLEMENTATION_V2.md
- ... et autres

---

## ✅ Avantages de la Nouvelle Structure

### Avant
- ❌ 88 fichiers markdown éparpillés à la racine
- ❌ Fichiers redondants (5+ fichiers sur les plans)
- ❌ Fichiers obsolètes mélangés avec les actuels
- ❌ Difficile de trouver l'information
- ❌ Pas de hiérarchie claire

### Après
- ✅ 6 fichiers principaux bien organisés
- ✅ Structure thématique claire
- ✅ Fichiers obsolètes archivés
- ✅ Navigation intuitive
- ✅ Information consolidée

---

## 🎯 Principes de la Documentation

### 1. Un Fichier par Thème
Chaque thème majeur a **un seul fichier** consolidé :
- Plans → `docs/plans-tarifs/README.md`
- Architecture → `docs/architecture/README.md`
- Brevo → `docs/configuration/brevo-emails.md`

### 2. Hiérarchie Claire
```
docs/
├── README.md (index)
├── [thème]/
│   └── README.md (ou fichier spécifique)
```

### 3. Archive Séparée
Les fichiers obsolètes sont dans `docs/archive/` mais **ne sont pas supprimés** (historique).

### 4. Liens Relatifs
Tous les liens utilisent des chemins relatifs pour faciliter la navigation.

---

## 📝 Maintenance

### Ajouter une Nouvelle Section

1. Créer le dossier dans `docs/` :
```bash
mkdir docs/nouvelle-section
```

2. Créer le fichier principal :
```bash
touch docs/nouvelle-section/README.md
```

3. Ajouter le lien dans `docs/README.md`

### Mettre à Jour un Document

1. Modifier le fichier concerné
2. Mettre à jour la date "Dernière mise à jour"
3. (Optionnel) Ajouter une entrée dans le Changelog

### Archiver un Document

1. Déplacer vers `docs/archive/` :
```bash
mv fichier-obsolete.md docs/archive/
```

2. Mettre à jour les liens si nécessaire

---

## 🔍 Recherche Rapide

### Par Thème
- **Plans et tarifs** → `docs/plans-tarifs/`
- **Architecture** → `docs/architecture/`
- **Configuration** → `docs/configuration/`
- **Guides** → `docs/guides/`

### Par Type
- **Installation** → `docs/guides/quick-start.md`
- **Prix** → `docs/plans-tarifs/README.md`
- **Stack** → `docs/architecture/README.md`
- **Emails** → `docs/configuration/brevo-emails.md`

---

## 📊 Statistiques

### Avant Réorganisation
- **Total fichiers :** 88 fichiers markdown
- **À la racine :** 85+ fichiers
- **Redondance :** 5+ fichiers sur les plans, 11+ sur Brevo

### Après Réorganisation
- **Fichiers actifs :** 6 fichiers principaux
- **Fichiers archivés :** 82 fichiers
- **Réduction :** ~93% de fichiers actifs
- **Gain clarté :** +++

---

**Dernière mise à jour :** Janvier 2026  
**Maintenu par :** Équipe DUERPilot
