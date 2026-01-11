# Conformité Réglementaire DUERPilot

## 📋 Vue d'Ensemble

Ce document détaille l'architecture de conformité réglementaire de DUERPilot conforme au cadre légal français du DUERP (Document Unique d'Évaluation des Risques Professionnels).

## 1️⃣ CADRE LÉGAL & CHAMP D'APPLICATION

### Références Légales Intégrées

**Code du travail :**
- **Article L.4121-1** : Obligation générale de sécurité
- **Articles R.4121-1 à R.4121-4** : DUERP

**Obligation valable pour :**
- ✅ Toutes les entreprises
- ✅ Sans seuil minimal d'effectif

### Principes Reflétés dans l'Application

1. **Le DUERP est une obligation légale permanente**
2. **Il repose sur :**
   - Une démarche structurée
   - Une traçabilité complète
   - Une mise à jour régulière

3. **L'outil n'engage pas la responsabilité juridique finale**
   - La responsabilité reste celle de l'employeur
   - Message obligatoire affiché : *"DUERPilot est un outil d'aide à l'évaluation des risques. L'employeur reste responsable de la validation et de la conformité finale du DUERP."*

### Messages Légaux Obligatoires

- **Message de responsabilité légale** : Affiché dans l'interface lors de la création/modification d'un DUERP
- **Message d'aide IA** : *"Les suggestions générées par l'IA sont fournies à titre indicatif et doivent être validées par l'utilisateur."*

## 2️⃣ STRUCTURE OBLIGATOIRE DU DUERP

### A. Identification de l'Entreprise

**Champs requis (modèle `Company`) :**
- ✅ `legalName` : Raison sociale (obligatoire)
- ✅ `siret` : SIRET (optionnel mais recommandé)
- ✅ `employeeCount` : Effectif total (obligatoire pour PAPRIPACT si >= 50)
- ✅ `nafCode` : Code NAF (optionnel mais recommandé)
- ✅ `sector` : Secteur d'activité (calculé ou choisi)
- ✅ `duerpCreationDate` : Date de création du DUERP (première version)
- ✅ `duerpLastUpdateDate` : Date de dernière mise à jour
- ✅ `duerpLastUpdateReason` : Justification de la dernière mise à jour

### B. Unités de Travail (Obligatoire)

**Règles à respecter :**
- ✅ Une entreprise doit contenir au moins une unité de travail
- ✅ Chaque risque est obligatoirement rattaché à une unité
- ✅ Une entreprise peut avoir plusieurs secteurs mais le DUERP reste structuré par unités

**Implémentation :**
- Modèle `WorkUnit` existant
- Relations : `Company → Sites → WorkUnits → RiskAssessments → ActionPlans`

### C. Identification des Dangers et des Risques

**Structuration :**
- ✅ Familles de dangers (physiques, chimiques, biologiques, etc.) - `DangerCategory`
- ✅ Dangers → Risques contextualisés par unité de travail - `DangerousSituation`
- ✅ Référentiel central consolidé - `DuerpilotReference`, `DuerpilotRisk`

**Couverture obligatoire :**
- ✅ Travail normal
- ✅ Travail occasionnel
- ✅ Maintenance
- ✅ Nettoyage
- ✅ Situations dégradées

### D. Évaluation et Hiérarchisation

**Méthodes autorisées :**
- ✅ Méthode DUERP générique (fréquence, gravité, probabilité, maîtrise)
- ✅ Méthode INRS (structurée, reconnue terrain)

**Règles :**
- ✅ Méthode constante dans le temps (stockée dans `methodsUsed`)
- ✅ Critères visibles et compréhensibles
- ✅ Cotation modifiable par l'utilisateur
- ✅ IA uniquement assistive (pas de décision automatique)

## 3️⃣ PLAN D'ACTIONS & PAPRIPACT

### A. Mesures de Prévention (Toutes Entreprises)

**Pour chaque risque (modèle `ActionPlan`) :**
- ✅ Mesures existantes (`RiskAssessment.existingMeasures`)
- ✅ Mesures à mettre en œuvre (`ActionPlan.description`)
- ✅ Responsable (`ActionPlan.responsibleName`, `responsibleEmail`)
- ✅ Échéance (`ActionPlan.dueDate`)
- ✅ Statut (`ActionPlan.status`)

**Hiérarchie à respecter (logique interne) :**
1. Suppression du risque
2. Réduction à la source
3. Protection collective
4. Organisation
5. EPI (dernier recours)

### B. PAPRIPACT — Seuil ≥ 50 Salariés

**Règle légale :**
- ✅ Obligatoire uniquement pour les entreprises **≥ 50 salariés**
- ✅ Document distinct mais issu du DUERP
- ✅ **Annuel** (un PAPRIPACT par année)

**Logique implémentée dans DUERPilot :**

```typescript
// Si employeeCount >= 50
if (company.employeeCount >= 50) {
  // Activer automatiquement PAPRIPACT
  // Structure annuelle (un par année)
  // Contenu minimal : Actions, Conditions d'exécution, Indicateurs, Responsables, Planning
}
```

**Contenu minimal du PAPRIPACT (modèles créés) :**

1. **`PAPRIPACT`** (Plan principal)
   - `year` : Année du PAPRIPACT (obligatoire)
   - `status` : brouillon, validé, en_cours, terminé
   - `validatedAt`, `validatedBy` : Validation formelle

2. **`PAPRIPACTAction`** (Actions de prévention)
   - `title`, `description` : Action
   - `priority` : priorité_1, priorité_2, priorité_3
   - `responsibleName`, `responsibleEmail` : Responsable
   - `conditionsExecution` : **Obligatoire** (conditions d'exécution)
   - `plannedStartDate`, `plannedEndDate` : Planning
   - `actualStartDate`, `actualEndDate` : Suivi réel
   - `status` : planifiée, en_cours, réalisée, reportée, annulée
   - `progress` : Pourcentage de réalisation (0-100)
   - `actionPlanId` : Référence au plan d'action DUERP source

3. **`PAPRIPACTIndicator`** (Indicateurs de suivi)
   - `name` : Nom de l'indicateur (ex: "Taux de réalisation", "Nombre d'accidents")
   - `type` : quantitatif, qualitatif
   - `unit` : Unité de mesure (%, nombre, etc.)
   - `targetValue` : Valeur cible
   - `currentValue` : Valeur actuelle
   - `frequency` : mensuel, trimestriel, annuel
   - `lastUpdateDate` : Dernière mise à jour

**⚠️ Important :** Le PAPRIPACT ne remplace pas le DUERP. Il en est un complément obligatoire pour les entreprises de 50+ salariés.

## 4️⃣ TRAÇABILITÉ, PARTICIPATION & MISE À JOUR

### A. Traçabilité Obligatoire

**À stocker dans l'app (modèles existants et nouveaux) :**

1. **Historique des versions DUERP (`DuerpVersion`)**
   - ✅ `year`, `versionNumber` : Version et année
   - ✅ `generatedBy`, `generatedById` : Auteur(s) des modifications
   - ✅ `updateReason` : **Nouveau** - Justification des mises à jour
   - ✅ `createdAt` : Date de création de la version

2. **Dates de révision (`Company`)**
   - ✅ `duerpCreationDate` : **Nouveau** - Date de création du DUERP (première version)
   - ✅ `duerpLastUpdateDate` : **Nouveau** - Date de dernière mise à jour
   - ✅ `duerpLastUpdateReason` : **Nouveau** - Justification de la dernière mise à jour

3. **Snapshots (`DuerpVersionSnapshot`)**
   - ✅ `snapshotType` : Type d'entité snapshot
   - ✅ `snapshotData` : Données complètes (JSON)
   - ✅ `entityId` : ID de l'entité snapshot

### B. Mise à Jour Obligatoire

**Déclencheurs légaux (stockés dans `updateReason`) :**
- ✅ Au moins 1 fois par an (obligatoire)
- ✅ Modification des conditions de travail
- ✅ Nouvel équipement
- ✅ Accident ou incident
- ✅ Évolution réglementaire

**À implémenter :**
- ✅ Champ `updateReason` dans `DuerpVersion`
- ✅ Champ `duerpLastUpdateReason` dans `Company`
- ✅ Rappel visuel / notification simple (à implémenter dans UI)

### C. Participation des Travailleurs

**Attendu réglementairement :**
- ✅ Consultation
- ✅ Information
- ✅ Association au processus

**Implémentation (nouveau modèle `ParticipationTravailleurs`) :**

- `type` : consultation, information, association
- `date` : Date de la consultation/participation
- `organizerEmail`, `organizerId` : Organisateur
- `isRealized` : **Consultation réalisée : oui/non** (obligatoire)
- `participantsCount` : Nombre de participants
- `participants` : Liste des participants (noms/emails)
- `subject` : Sujet de la consultation (ex: "Révision DUERP annuelle", "Nouveau risque identifié")
- `summary` : Résumé des échanges
- `observations` : Observations et retours des travailleurs
- `decisions` : Décisions prises suite à la consultation
- `nextSteps` : Prochaines étapes
- `attachmentUrls` : Pièces jointes (comptes-rendus, PV, etc.)

## 5️⃣ RÈGLES IA (GLOBALE)

**L'IA :**
- ✅ Propose (suggestions de risques, actions, reformulations)
- ✅ Reformule (aide à la rédaction)
- ✅ Suggère (basé sur le référentiel central)

**L'utilisateur :**
- ✅ Valide (toutes les suggestions sont validables/modifiables)
- ✅ Modifie (contrôle total sur les données)
- ✅ Décide (responsabilité légale de l'employeur)

**Message obligatoire :**
*"Les suggestions générées par l'IA sont fournies à titre indicatif et doivent être validées par l'utilisateur."*

## ✅ RÉSULTAT ATTENDU

DUERPilot permet :
- ✅ La production d'un DUERP conforme (structure, traçabilité, mise à jour)
- ✅ La génération conditionnelle d'un PAPRIPACT (si employeeCount >= 50)
- ✅ La preuve d'une démarche de prévention structurée (historique, participation, traçabilité)
- ✅ Sans dépendance à un référentiel propriétaire (référentiel central consolidé)
- ✅ Avec une IA strictement assistive (non décisionnaire)

## 📊 Modèles de Données Créés

### Nouveaux Modèles

1. **`PAPRIPACT`** : Plan principal annuel
2. **`PAPRIPACTAction`** : Actions du plan
3. **`PAPRIPACTIndicator`** : Indicateurs de suivi
4. **`ParticipationTravailleurs`** : Consultation et participation

### Modèles Modifiés

1. **`Company`** :
   - Ajout `nafCode`
   - Ajout `duerpCreationDate`, `duerpLastUpdateDate`, `duerpLastUpdateReason`
   - Ajout relations `papripact[]`, `participationTravailleurs[]`
   - Index sur `employeeCount` pour calcul PAPRIPACT

2. **`DuerpVersion`** :
   - Ajout `generatedById` (relation UserProfile)
   - Ajout `updateReason` (justification)

3. **`UserProfile`** :
   - Ajout relations `duerpVersionsGenerated[]`, `participationOrganized[]`

4. **`Tenant`** :
   - Ajout relations `papripact[]`, `participationTravailleurs[]`

## 🔄 Prochaines Étapes

1. ✅ Schéma Prisma créé et validé
2. ⏳ Synchronisation avec la base de données (`prisma db push`)
3. ⏳ Création des routers tRPC pour PAPRIPACT et ParticipationTravailleurs
4. ⏳ Implémentation de la logique conditionnelle PAPRIPACT (employeeCount >= 50)
5. ⏳ Création des composants UI pour afficher/masquer PAPRIPACT
6. ⏳ Ajout des messages légaux obligatoires dans les composants
7. ⏳ Création des références réglementaires (Code du travail articles)
8. ⏳ Mise à jour des composants de génération DUERP avec traçabilité

