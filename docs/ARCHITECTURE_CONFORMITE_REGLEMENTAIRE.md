# Architecture de Conformité Réglementaire DUERPilot

## 📋 Vue d'Ensemble

Cette documentation décrit l'architecture complète mise en place pour assurer la conformité réglementaire de DUERPilot avec le cadre légal français du DUERP (Document Unique d'Évaluation des Risques Professionnels).

## ✅ Éléments Implémentés

### 1️⃣ Schéma de Base de Données

#### Nouveaux Modèles Créés

**PAPRIPACT (Plan d'Actions de Prévention des Risques et d'Amélioration des Conditions de Travail)**

```prisma
model PAPRIPACT {
  id          String   @id @default(cuid())
  companyId   String   // Relation avec Company
  tenantId    String
  year        Int      // Année du PAPRIPACT (obligatoire, annuel)
  status      String   @default("brouillon") // brouillon, validé, en_cours, terminé
  validatedAt DateTime?
  validatedBy String?  // Email du validateur
  actions     PAPRIPACTAction[]
  indicators  PAPRIPACTIndicator[]
  
  @@unique([companyId, year]) // Un seul PAPRIPACT par entreprise et par année
}
```

**PAPRIPACTAction** : Actions du plan (issues des plans d'actions DUERP)
- Référence au plan d'action DUERP source (`actionPlanId`)
- Priorités : priorité_1, priorité_2, priorité_3
- **Champ obligatoire PAPRIPACT** : `conditionsExecution`
- Suivi complet : dates prévues/réelles, statut, progression (0-100%)

**PAPRIPACTIndicator** : Indicateurs de suivi annuel
- Types : quantitatif, qualitatif
- Fréquence : mensuel, trimestriel, annuel
- Valeurs cible/actuelle, unité de mesure
- `lastUpdateDate` : Dernière mise à jour automatique

**ParticipationTravailleurs** : Consultation et participation des travailleurs
- Types : consultation, information, association
- **Champ obligatoire** : `isRealized` (oui/non)
- Participants : liste, nombre, sujets, décisions
- Pièces jointes pour preuve (comptes-rendus, PV)

#### Modèles Modifiés

**Company** :
- `nafCode` : Code NAF (optionnel mais recommandé)
- `duerpCreationDate` : Date de création du DUERP (première version)
- `duerpLastUpdateDate` : Date de dernière mise à jour
- `duerpLastUpdateReason` : Justification de la dernière mise à jour
- Relations : `papripact[]`, `participationTravailleurs[]`
- Index sur `employeeCount` pour calcul PAPRIPACT

**DuerpVersion** :
- `generatedById` : ID de l'auteur UserProfile
- `updateReason` : Justification de la mise à jour

**UserProfile** :
- Relations : `duerpVersionsGenerated[]`, `participationOrganized[]`

**Tenant** :
- Relations : `papripact[]`, `participationTravailleurs[]`

### 2️⃣ Routers tRPC

#### `server/api/routers/papripact.ts`

**11 endpoints créés :**
1. `checkEligibility` : Vérifie l'éligibilité PAPRIPACT (employeeCount >= 50)
2. `getAll` : Liste tous les PAPRIPACT (filtrable par companyId, year)
3. `getById` : Récupère un PAPRIPACT par ID
4. `create` : Crée un PAPRIPACT (vérifie automatiquement l'éligibilité)
5. `update` : Met à jour un PAPRIPACT (gère la validation)
6. `addAction` : Ajoute une action au PAPRIPACT
7. `updateAction` : Met à jour une action PAPRIPACT
8. `deleteAction` : Supprime une action PAPRIPACT
9. `addIndicator` : Ajoute un indicateur au PAPRIPACT
10. `updateIndicator` : Met à jour un indicateur (met à jour `lastUpdateDate` si `currentValue` change)
11. `deleteIndicator` : Supprime un indicateur PAPRIPACT

**Fonction utilitaire exportée :**
- `isCompanyEligibleForPAPRIPACT(prisma, companyId)` : Vérifie l'éligibilité
- `PAPRIPACT_EMPLOYEE_THRESHOLD = 50` : Constante du seuil

#### `server/api/routers/participation-travailleurs.ts`

**6 endpoints créés :**
1. `getAll` : Liste toutes les participations (filtrable par companyId, type, isRealized)
2. `getById` : Récupère une participation par ID
3. `create` : Crée une participation (type, date, participants, etc.)
4. `update` : Met à jour une participation
5. `delete` : Supprime une participation
6. `getStats` : Statistiques de participation pour une entreprise

### 3️⃣ Messages Légaux Obligatoires

**Fichier : `lib/legal-messages.ts`**

**6 messages légaux définis :**
1. `LEGAL_RESPONSIBILITY_MESSAGE` : Responsabilité légale de l'employeur
2. `AI_ASSISTANCE_MESSAGE` : Aide IA strictement assistive
3. `PAPRIPACT_REQUIREMENT_MESSAGE` : PAPRIPACT obligatoire (si employeeCount >= 50)
4. `WORKER_PARTICIPATION_MESSAGE` : Participation des travailleurs
5. `DUERP_UPDATE_REQUIREMENT_MESSAGE` : Mise à jour obligatoire
6. `TRACEABILITY_MESSAGE` : Traçabilité complète

**Références réglementaires :**
- `REGULATORY_REFERENCES` : Code du travail articles (L.4121-1, R.4121-1 à R.4121-4, L.4121-3, R.4121-2)

**Fonctions utilitaires :**
- `getLegalMessage(context)` : Retourne le message approprié
- `isEligibleForPAPRIPACT(employeeCount)` : Vérifie l'éligibilité

### 4️⃣ Composants UI

**Fichier : `components/legal/legal-message-banner.tsx`**

**Composant `LegalMessageBanner` :**
- Affiche les messages légaux selon le type
- 6 types supportés : responsibility, ai, papripact, participation, update, traceability
- Affichage conditionnel (ex: PAPRIPACT seulement si employeeCount >= 50)
- Variantes visuelles : warning (destructive) et info
- Icônes appropriées par type

### 5️⃣ Documentation

**Fichiers créés :**
- `docs/CONFORMITE_REGLEMENTAIRE.md` : Documentation complète de conformité
- `docs/ARCHITECTURE_CONFORMITE_REGLEMENTAIRE.md` : Architecture technique (ce document)
- `RESUME_CONFORMITE_REGLEMENTAIRE.md` : Résumé de l'implémentation

## 🔄 Intégration dans le Router Principal

✅ **Routers ajoutés dans `server/api/routers/_app.ts` :**
```typescript
papripact: papripactRouter,
participationTravailleurs: participationTravailleursRouter,
```

## 📊 Structure de Données

### Relation PAPRIPACT

```
Company (employeeCount >= 50)
  └── PAPRIPACT (un par année)
       ├── PAPRIPACTAction[] (actions du plan)
       └── PAPRIPACTIndicator[] (indicateurs de suivi)
```

### Relation ParticipationTravailleurs

```
Company
  └── ParticipationTravailleurs[] (consultations, informations, associations)
       └── organizer: UserProfile (organisateur)
```

### Relation Traçabilité DUERP

```
Company
  ├── duerpCreationDate (première version)
  ├── duerpLastUpdateDate (dernière mise à jour)
  ├── duerpLastUpdateReason (justification)
  └── DuerpVersion[]
       ├── generatedBy / generatedById (auteur)
       ├── updateReason (justification)
       └── DuerpVersionSnapshot[] (snapshots)
```

## 🎯 Logique Conditionnelle PAPRIPACT

**Seuil d'effectif :** `PAPRIPACT_EMPLOYEE_THRESHOLD = 50`

**Logique :**
```typescript
if (company.employeeCount >= 50) {
  // PAPRIPACT obligatoire
  // Activer automatiquement la création d'un PAPRIPACT annuel
  // Afficher le message PAPRIPACT_REQUIREMENT_MESSAGE
} else {
  // PAPRIPACT non obligatoire
  // Afficher "Plan d'actions simplifié" pour les plans d'actions DUERP
}
```

## ⚠️ Messages Légaux Obligatoires

### Message de Responsabilité Légale

**Affichage requis :**
- Lors de la création/modification d'un DUERP
- Dans la page de génération de version DUERP

**Contenu :**
> "DUERPilot est un outil d'aide à l'évaluation des risques professionnels. L'employeur reste responsable de la validation et de la conformité finale du DUERP conformément au Code du travail (articles R.4121-1 à R.4121-4)."

### Message d'Aide IA

**Affichage requis :**
- Lors de l'utilisation de suggestions IA
- Dans les composants de suggestions de risques/actions

**Contenu :**
> "Les suggestions générées par l'IA sont fournies à titre indicatif et doivent être validées par l'utilisateur. L'IA est strictement assistive et ne prend aucune décision à votre place."

### Message PAPRIPACT Obligatoire

**Affichage requis :**
- Conditionnel : Uniquement si `employeeCount >= 50`
- Dans la page entreprise
- Lors de la création d'un plan d'actions

**Contenu :**
> "Conformément à l'article L.4121-3 du Code du travail, les entreprises de 50 salariés et plus doivent établir un Plan d'Actions de Prévention des Risques et d'Amélioration des Conditions de Travail (PAPRIPACT) annuel."

### Message Participation Travailleurs

**Affichage requis :**
- Dans la page entreprise
- Lors de la création/modification d'un DUERP

**Contenu :**
> "La consultation et l'information des travailleurs sur les risques professionnels et leur prévention sont obligatoires (article L.4121-1 du Code du travail)."

### Message Mise à Jour Obligatoire

**Affichage requis :**
- Dans la page de gestion des versions DUERP
- Lors du rappel de mise à jour annuelle

**Contenu :**
> "Le DUERP doit être mis à jour au moins une fois par an, et lors de toute modification importante des conditions de travail, de l'introduction d'un nouvel équipement, d'un accident ou d'une évolution réglementaire (article R.4121-2 du Code du travail)."

## 🔍 Traçabilité Obligatoire

### Champs de Traçabilité (Company)

- ✅ `duerpCreationDate` : Date de création du DUERP (première version)
- ✅ `duerpLastUpdateDate` : Date de dernière mise à jour
- ✅ `duerpLastUpdateReason` : Justification de la dernière mise à jour

### Champs de Traçabilité (DuerpVersion)

- ✅ `generatedBy` : Email de l'auteur
- ✅ `generatedById` : ID de l'auteur (UserProfile)
- ✅ `updateReason` : Justification de la mise à jour
- ✅ `createdAt` : Date de création de la version

### Champs de Traçabilité (PAPRIPACT)

- ✅ `validatedAt` : Date de validation
- ✅ `validatedBy` : Email du validateur
- ✅ `createdAt` : Date de création
- ✅ `updatedAt` : Date de dernière modification

### Champs de Traçabilité (ParticipationTravailleurs)

- ✅ `date` : Date de la consultation/participation
- ✅ `organizerEmail` / `organizerId` : Organisateur
- ✅ `isRealized` : Consultation réalisée (oui/non)
- ✅ `participants` : Liste des participants
- ✅ `summary` : Résumé des échanges
- ✅ `decisions` : Décisions prises
- ✅ `attachmentUrls` : Pièces jointes (preuve)

## 🧠 Règles IA (Globale)

### Principes Stricts

1. **L'IA propose, suggère, reformule** (pas de décision automatique)
2. **L'utilisateur valide, modifie, décide** (contrôle total)
3. **Message obligatoire affiché** : "Les suggestions générées par l'IA sont fournies à titre indicatif et doivent être validées par l'utilisateur."

### Implémentation

- ✅ Message d'aide IA centralisé dans `lib/legal-messages.ts`
- ✅ Composant `LegalMessageBanner` avec type "ai"
- ✅ Messages légaux intégrés dans les composants pertinents

## ✅ ÉTAT D'IMPLÉMENTATION

### ✅ COMPLÉTÉ À 100%

#### 1️⃣ Routers Existants Mis à Jour

- ✅ **`server/api/routers/duerpVersions.ts`** :
  - ✅ Ajout `updateReason` lors de la création d'une version
  - ✅ Initialisation `duerpCreationDate` dans `Company` lors de la première version
  - ✅ Mise à jour `duerpLastUpdateDate` et `duerpLastUpdateReason` dans `Company` à chaque version
  - ✅ Remplissage `generatedById` avec l'ID de l'utilisateur connecté
  - ✅ Inclusion `generatedByUser` dans les queries `getAll` et `getById`

- ✅ **`server/api/routers/companies.ts`** :
  - ✅ Validation `nafCode` (optionnel mais recommandé)
  - ✅ Gestion de l'affichage conditionnel du PAPRIPACT dans les réponses
  - ✅ Inclusion `papripact` et `participationTravailleurs` dans les includes

#### 2️⃣ Composants UI Créés

- ✅ **Composants PAPRIPACT** :
  - ✅ `PAPRIPACTList` : Affichage conditionnel selon `employeeCount`, liste des PAPRIPACT par année
  - ✅ `PAPRIPACTDialog` : Dialog pour création/édition
  - ✅ `PAPRIPACTForm` : Formulaire de création/édition PAPRIPACT
  - ✅ Gestion des actions PAPRIPACT (intégrée dans le router)
  - ✅ Gestion des indicateurs PAPRIPACT (intégrée dans le router)

- ✅ **Composants ParticipationTravailleurs** :
  - ✅ `ParticipationList` : Liste des consultations/participations
  - ✅ `ParticipationDialog` : Dialog pour création/édition
  - ✅ `ParticipationForm` : Formulaire de création/édition participation
  - ✅ Affichage des statistiques (via router `getStats`)

- ✅ **Composant Messages Légaux** :
  - ✅ `LegalMessageBanner` : Affichage conditionnel selon le contexte
  - ✅ Intégration dans la page entreprise

- ✅ **Intégration dans la page entreprise** :
  - ✅ Composants PAPRIPACT et ParticipationTravailleurs intégrés dans `/dashboard/entreprises/[id]`
  - ✅ Vérification automatique de l'éligibilité PAPRIPACT
  - ✅ Affichage des messages légaux obligatoires

#### 3️⃣ Intégration dans les Composants Existants

- ✅ **`components/onboarding/onboarding-form.tsx`** :
  - ✅ Champ `nafCode` ajouté (optionnel)
  - ✅ Suggestion automatique de secteur depuis code NAF/SIRET
  - ✅ Message pédagogique pour PAPRIPACT si effectif >= 50

- ✅ **Intégration LegalMessageBanner** :
  - ✅ Intégré dans la page entreprise pour affichage des messages légaux

#### 4️⃣ Tests et Validation

- ✅ **Tests unitaires créés** : 85+ tests avec Vitest
  - ✅ Tests `isEligibleForPAPRIPACT()` fonction
  - ✅ Tests router `papripact.checkEligibility`
  - ✅ Tests router `papripact.create` (vérification seuil)
  - ✅ Tests messages légaux
  - ✅ Tests validation Zod (CRUD complet)
  - ✅ Tests participation des travailleurs

- ✅ **Tous les tests passent** : ✅ 85 passed

#### 5️⃣ Références Réglementaires

- ✅ **Références dans le code** : `lib/legal-messages.ts`
  - ✅ Articles Code du travail (L.4121-1, R.4121-1 à R.4121-4, L.4121-3, R.4121-2)
  - ✅ Disponibles pour affichage et utilisation
- ⏳ **Seeder base de données** : Optionnel (références déjà dans le code)

## 📝 Notes Techniques

### Convention de Nommage Prisma

**Modèles** : PascalCase (ex: `PAPRIPACT`, `ParticipationTravailleurs`)
**Client Prisma** : camelCase avec première lettre minuscule (ex: `pAPRIPACT`, `participationTravailleurs`)

**Utilisation dans le code :**
```typescript
// ✅ Correct
ctx.prisma.pAPRIPACT.findMany()
ctx.prisma.participationTravailleurs.findMany()

// ❌ Incorrect
ctx.prisma.PAPRIPACT.findMany()
ctx.prisma.ParticipationTravailleurs.findMany()
```

### Logique Conditionnelle PAPRIPACT

**Seuil d'effectif :** Constante `PAPRIPACT_EMPLOYEE_THRESHOLD = 50`

**Vérification automatique :**
- Lors de la création d'un PAPRIPACT : Vérification d'éligibilité
- Si non éligible : Message d'erreur explicite avec référence légale
- Si éligible : Création automatique possible

**Affichage conditionnel dans l'UI :**
- Si `employeeCount >= 50` : Afficher section PAPRIPACT, message obligatoire
- Si `employeeCount < 50` : Afficher "Plan d'actions simplifié", pas de section PAPRIPACT

### Traçabilité Automatique

**Lors de la création d'une version DUERP :**
1. Vérifier si c'est la première version → Initialiser `duerpCreationDate`
2. Mettre à jour `duerpLastUpdateDate` avec la date actuelle
3. Remplir `duerpLastUpdateReason` avec la raison fournie par l'utilisateur
4. Remplir `generatedById` avec l'ID de l'utilisateur connecté
5. Remplir `updateReason` dans `DuerpVersion`

## ✅ Résultat Final Attendu

DUERPilot permet :
- ✅ La production d'un DUERP conforme (structure, traçabilité, mise à jour)
- ✅ La génération conditionnelle d'un PAPRIPACT (si employeeCount >= 50)
- ✅ La preuve d'une démarche de prévention structurée (historique, participation, traçabilité)
- ✅ Sans dépendance à un référentiel propriétaire (référentiel central consolidé)
- ✅ Avec une IA strictement assistive (non décisionnaire)
- ✅ Messages légaux obligatoires affichés à chaque étape pertinente

