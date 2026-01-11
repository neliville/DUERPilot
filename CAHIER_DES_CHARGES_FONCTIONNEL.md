# Cahier des Charges Fonctionnel
## DUERPilot - Assistant d'Évaluation des Risques Professionnels

**Version :** 1.0  
**Date :** Janvier 2026  
**Statut :** En production

---

## 1. Vue d'ensemble

### 1.1 Présentation
DUERPilot est une application web de gestion et d'évaluation des risques professionnels permettant aux entreprises de :
- Réaliser des évaluations de risques structurées selon la méthode OiRA (Online interactive Risk Assessment)
- Gérer leurs unités de travail, sites et entreprises
- Évaluer les risques selon la méthode F×P×G×M (Fréquence × Probabilité × Gravité × Maîtrise)
- Générer des plans d'action et suivre leur mise en œuvre
- Produire des documents DUERP (Document Unique d'Évaluation des Risques Professionnels)

### 1.2 Architecture technique
- **Frontend :** Next.js 14 (React 18) avec TypeScript
- **Backend :** Next.js API Routes avec tRPC pour une API type-safe
- **Base de données :** PostgreSQL avec Prisma ORM
- **Authentification :** NextAuth.js v5 avec vérification d'email par OTP
- **UI :** Shadcn UI (Radix UI) + Tailwind CSS
- **Multi-tenancy :** Architecture multi-tenant avec isolation des données par tenant

---

## 2. Fonctionnalités principales

### 2.1 Authentification et gestion des utilisateurs

#### 2.1.1 Inscription
- **Objectif :** Permettre à un nouvel utilisateur de créer un compte
- **Processus :**
  1. Saisie des informations : email, mot de passe, prénom, nom
  2. Validation du mot de passe (confirmation, longueur minimale)
  3. Création du compte avec hashage du mot de passe (bcrypt)
  4. Génération d'un code OTP à 6 chiffres
  5. Envoi de l'OTP par email via Brevo (Sendinblue)
  6. Redirection vers la page de vérification d'email

#### 2.1.2 Vérification d'email
- **Objectif :** Vérifier la validité de l'adresse email
- **Processus :**
  1. Saisie du code OTP reçu par email
  2. Vérification du code (validité de 15 minutes)
  3. Mise à jour du statut `emailVerified` à `true`
  4. Redirection vers l'onboarding initial

#### 2.1.3 Connexion
- **Objectif :** Authentifier un utilisateur existant
- **Processus :**
  1. Saisie de l'email et du mot de passe
  2. Vérification des identifiants via NextAuth.js
  3. Vérification du statut `emailVerified`
  4. Si non vérifié : redirection vers la page de vérification
  5. Si vérifié : redirection vers le dashboard ou l'onboarding

#### 2.1.4 Gestion de session
- Sessions gérées par NextAuth.js avec cookies sécurisés
- Déconnexion avec nettoyage de la session
- Protection des routes via middleware d'authentification

---

### 2.2 Onboarding initial

#### 2.2.1 Objectif
Guider l'utilisateur lors de sa première connexion pour configurer son entreprise et son site principal.

#### 2.2.2 Processus en 3 étapes

**Étape 1 : Informations entreprise**
- Saisie des informations légales :
  - Nom légal (obligatoire)
  - SIRET (optionnel, unique)
  - Secteur d'activité
  - Nombre d'employés
  - Adresse complète
  - Coordonnées (téléphone, email, site web)
  - Présence d'un CSE (Comité Social et Économique)

**Étape 2 : Site principal**
- Création automatique du site principal :
  - Nom du site
  - Adresse (peut être différente de l'entreprise)
  - Nombre d'employés sur le site
  - Statut (actif par défaut)

**Étape 3 : Confirmation**
- Affichage récapitulatif des informations saisies
- Validation et création simultanée de l'entreprise et du site principal
- Redirection vers le dashboard

---

### 2.3 Gestion multi-tenant

#### 2.3.1 Principe
Chaque utilisateur appartient à un tenant (organisation). Toutes les données sont isolées par tenant.

#### 2.3.2 Isolation des données
- Toutes les requêtes incluent un filtre `tenantId`
- Les utilisateurs ne peuvent accéder qu'aux données de leur tenant
- Les entreprises, sites, unités de travail sont liés au tenant

---

### 2.4 Gestion des entreprises et sites

#### 2.4.1 Entreprises
- **Création :** Formulaire avec validation des champs obligatoires
- **Modification :** Édition des informations existantes
- **Liste :** Affichage tabulaire avec recherche et filtres
- **Champs :** Nom légal, SIRET, secteur, adresse, coordonnées, CSE

#### 2.4.2 Sites
- **Création :** Lié à une entreprise, peut être marqué comme "site principal"
- **Modification :** Édition des informations
- **Liste :** Affichage par entreprise avec filtres
- **Champs :** Nom, adresse, nombre d'employés, statut

---

### 2.5 Gestion des unités de travail

#### 2.5.1 Objectif
Définir les unités de travail où sont effectuées les évaluations de risques.

#### 2.5.2 Fonctionnalités
- **Création :** Liée à un site, avec nom et description
- **Informations :**
  - Nom de l'unité
  - Description
  - Nombre de personnes exposées
  - Responsable (nom et email)
- **Affectation :** Possibilité d'assigner des utilisateurs à une unité

---

### 2.6 Évaluation des risques OiRA

#### 2.6.1 Référentiels OiRA
- **Import :** Script d'import depuis fichiers JSON normalisant 3 formats différents :
  - Format A : Activité unique avec domaines
  - Format B : Risques génériques
  - Format C : Activités multiples avec thèmes
- **Structure normalisée :**
  - Niveau 0 : Secteur d'activité
  - Niveau 1 : Domaine de risque / Thème
  - Niveau 2 : Question d'évaluation
  - Niveau 3 : Mesure de prévention de référence

#### 2.6.2 Processus d'évaluation
1. **Sélection du référentiel :** Choix parmi les référentiels disponibles
2. **Navigation hiérarchique :**
   - Affichage des secteurs d'activité
   - Expansion des domaines de risque
   - Affichage des questions par domaine
3. **Réponses aux questions :**
   - 4 options : Oui / Non / Partiellement / Non applicable
   - Commentaire libre (optionnel)
   - Sélection des mesures de prévention appliquées (si réponse positive)
   - Ajout de mesures personnalisées
4. **Sauvegarde :** Enregistrement individuel ou en masse des réponses

#### 2.6.3 Synthèse des réponses
- **Statistiques globales :**
  - Nombre total de réponses
  - Répartition Oui / Non / Partiellement / Non applicable
  - Taux de conformité
- **Domaines prioritaires :** Identification automatique des domaines avec le plus de réponses négatives
- **Détail par domaine :**
  - Statistiques par domaine
  - Liste des questions nécessitant une attention
  - Mesures de prévention non appliquées

#### 2.6.4 Lien avec évaluations classiques
- Possibilité de créer une évaluation de risque classique (F×P×G×M) depuis une question OiRA
- Le champ `oiraQuestionId` lie l'évaluation à la question source
- Traçabilité complète de l'origine du risque identifié

---

### 2.7 Évaluation des risques classique (F×P×G×M)

#### 2.7.1 Principe
Évaluation quantitative des risques selon 4 critères :
- **F (Fréquence) :** À quelle fréquence les salariés sont-ils exposés ?
- **P (Probabilité) :** Quelle est la probabilité que l'accident se produise ?
- **G (Gravité) :** Quelle serait la gravité des conséquences ?
- **M (Maîtrise) :** Quel est le niveau de maîtrise des mesures existantes ?

#### 2.7.2 Interface utilisateur
- **Champ Danger :** Recherche dans le référentiel de dangers avec :
  - Recherche par label, catégorie, description
  - Affichage avec tags colorés par catégorie
  - Dropdown scrollable et sélectionnable
- **Situation dangereuse :** Texte libre décrivant la situation
- **Personnes exposées :** Description des personnes concernées
- **Mesures existantes :** Description des mesures déjà en place
- **Cotation :** 4 sliders pour F, P, G, M (valeurs 1 à 4) avec :
  - Tooltips explicatifs pour chaque critère
  - Descriptions détaillées de chaque niveau
- **Bouton IA :** "Proposer une cotation (IA)" pour suggérer une cotation automatique
- **Score de risque :** Calcul automatique (F × P × G × M) avec badge de priorité :
  - Faible (1-16)
  - À améliorer (17-32)
  - Prioritaire (33-64)

#### 2.7.3 Référentiel de dangers
- **Import CSV :** Script d'import depuis `data/HazardRef_export.csv`
- **Champs :**
  - Catégorie (avec codes couleur)
  - Label court
  - Description
  - Exemples
  - Mots-clés (recherche)
  - Références normatives
- **Multi-tenant :** Dangers globaux (tenantId null) + dangers personnalisés par tenant

---

### 2.8 Plans d'action

#### 2.8.1 Objectif
Planifier et suivre les actions correctives issues des évaluations de risques.

#### 2.8.2 Fonctionnalités
- **Création :** Liée à une évaluation de risque ou à une unité de travail
- **Informations :**
  - Type d'action
  - Description
  - Priorité (faible, moyenne, élevée)
  - Responsable (nom et email)
  - Date d'échéance
  - Statut (à faire, en cours, terminé)
- **Suivi :**
  - Date de complétion
  - Preuve (URL)
  - Notes

---

### 2.9 Observations

#### 2.9.1 Objectif
Permettre aux utilisateurs de signaler des observations de terrain.

#### 2.9.2 Fonctionnalités
- **Création :** Par n'importe quel utilisateur
- **Informations :**
  - Description
  - Localisation
  - Photo (URL)
  - Unité de travail concernée
- **Workflow :**
  - Statut : Nouvelle → En cours → Intégrée / Rejetée
  - Révision par un responsable
  - Intégration possible dans une évaluation de risque

---

### 2.10 Génération DUERP

#### 2.10.1 Objectif
Produire des documents DUERP structurés pour l'entreprise.

#### 2.10.2 Fonctionnalités
- **Création de version :** Par année et numéro de version
- **Mode de génération :** Automatique ou manuel
- **Contenu :**
  - Résumé des risques identifiés
  - Nombre d'unités de travail
  - Nombre de risques
  - Nombre d'actions prioritaires
- **Snapshots :** Sauvegarde des données à un instant T pour traçabilité
- **Export PDF :** URL vers le document généré

---

## 3. Flux utilisateur principaux

### 3.1 Premier accès
1. Inscription → Vérification email → Onboarding → Dashboard

### 3.2 Évaluation OiRA
1. Sélection référentiel → Navigation secteurs/domaines → Réponses questions → Synthèse

### 3.3 Évaluation classique
1. Sélection unité de travail → Choix danger → Saisie situation → Cotation F×P×G×M → Enregistrement

### 3.4 Plan d'action
1. Depuis évaluation ou unité → Création action → Attribution responsable → Suivi

---

## 4. Contraintes et règles métier

### 4.1 Sécurité
- Mots de passe hashés avec bcrypt
- Vérification email obligatoire avant accès
- Isolation des données par tenant
- Validation des permissions sur toutes les opérations

### 4.2 Intégrité des données
- Contraintes d'unicité (SIRET, email)
- Relations cascade (suppression en cascade)
- Validation des schémas avec Zod

### 4.3 Performance
- Requêtes optimisées avec Prisma
- Index sur les champs de recherche fréquents
- Pagination pour les grandes listes

---

## 5. Technologies et outils

### 5.1 Stack technique
- **Frontend :** Next.js 14, React 18, TypeScript
- **Backend :** Next.js API Routes, tRPC
- **Base de données :** PostgreSQL (Coolify)
- **ORM :** Prisma
- **Authentification :** NextAuth.js v5
- **Email :** Nodemailer + Brevo (Sendinblue)
- **UI :** Shadcn UI, Radix UI, Tailwind CSS
- **Validation :** Zod, React Hook Form

### 5.2 Déploiement
- **Environnement :** Coolify
- **Base de données :** PostgreSQL sur Coolify
- **Variables d'environnement :** `.env` pour configuration

---

## 6. Évolutions futures

### 6.1 Fonctionnalités prévues
- Génération automatique de cotation IA depuis réponses OiRA
- Export DUERP en PDF avec mise en forme
- Tableaux de bord analytiques
- Notifications par email
- Application mobile

### 6.2 Améliorations techniques
- Cache des requêtes fréquentes
- Optimisation des imports de données
- Tests automatisés (unitaires et E2E)
- Documentation API

---

## 7. Glossaire

- **DUERP :** Document Unique d'Évaluation des Risques Professionnels
- **OiRA :** Online interactive Risk Assessment (outil INRS)
- **OTP :** One-Time Password (mot de passe à usage unique)
- **Tenant :** Organisation cliente dans une architecture multi-tenant
- **CSE :** Comité Social et Économique
- **SIRET :** Système d'Identification du Répertoire des Établissements

---

**Document rédigé le :** Janvier 2026  
**Dernière mise à jour :** Janvier 2026

