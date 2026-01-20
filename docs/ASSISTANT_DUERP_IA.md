# Assistant DUERP (IA) - Documentation Technique

## Vue d'ensemble

L'Assistant DUERP (IA) est une méthode d'évaluation guidée en 4 étapes qui accompagne l'utilisateur dans la création complète de son Document Unique d'Évaluation des Risques Professionnels avec l'assistance de l'intelligence artificielle.

## Caractéristiques

### 🎯 Objectif
Simplifier la création du DUERP pour les entreprises sans expert interne en proposant un parcours guidé avec suggestions et assistance IA à chaque étape.

### 📊 Positionnement
- **Plans disponibles** : PRO, EXPERT, ENTREPRISE
- **Type** : Méthode assistée par IA (3ème méthode d'évaluation)
- **Cible** : Débutants en prévention, PME sans expert HSE

## Architecture

### Structure du Wizard

```
/dashboard/assistance
└── AssistantDUERPWizard (components/assistance/assistant-duerp-wizard.tsx)
    ├── Stepper horizontal (4 étapes)
    └── Step Components (components/assistance/steps/)
        ├── work-units-step.tsx     (Étape 1)
        ├── evaluation-step.tsx     (Étape 2)
        ├── action-plan-step.tsx    (Étape 3)
        └── generation-step.tsx     (Étape 4)
```

### Composants clés

#### 1. **AssistantDUERPWizard** (Wrapper principal)
- Gestion du stepper
- Navigation entre étapes
- État global du wizard

#### 2. **WorkUnitsStep** (Étape 1)
- Utilise `WorkUnitDialog` (composant existant)
- Affichage en grille des unités de travail
- CRUD complet (Create, Read, Update, Delete)
- Statistiques par unité (effectif, risques)

#### 3. **EvaluationStep** (Étape 2)
- Layout 2 colonnes : liste UT / détails évaluation
- **Suggestions IA inline** (pas de modal)
- `RiskAssessmentDialogWizard` pour l'évaluation
- Gestion des risques par unité de travail

#### 4. **ActionPlanStep** (Étape 3)
- Aperçu du plan d'actions généré
- Liste des actions avec statut, type, priorité
- Lien vers la page complète `/dashboard/actions`

#### 5. **GenerationStep** (Étape 4)
- Récapitulatif des statistiques
- Génération PDF du DUERP
- Export CSV des données
- Archivage automatique

## Fonctionnalités IA

### 1. Suggestion de dangers (Implémentée)

**Emplacement** : Étape 2 - Évaluation

**Fonctionnement** :
```typescript
// components/assistance/steps/evaluation-step.tsx
const handleSuggestHazards = async () => {
  setAiLoading(true);
  
  // TODO: Remplacer par API OpenAI/Claude
  const mockSuggestions = [
    {
      hazard_label: 'Circulation interne (déplacements)',
      category: 'Déplacements',
      justification: 'La zone logistique implique...',
    },
    // ... 4 autres suggestions
  ];
  
  setAiSuggestions(mockSuggestions);
  setAiLoading(false);
};
```

**Affichage** :
- Card bleue inline (pas de modal)
- 5 suggestions contextualisées
- Bouton "Évaluer" pour pré-remplir le formulaire
- Bouton "Fermer" pour masquer

**Données requises pour l'API** :
```typescript
{
  workUnitId: string,
  workUnitName: string,
  description: string,
  existingRisks: string[]  // Pour éviter les doublons
}
```

### 2. Suggestion de cotation (Implémentée)

**Emplacement** : Dialog d'évaluation des risques

**Fonctionnement** :
```typescript
// components/assistance/risk-assessment-dialog-wizard.tsx
const handleSuggestCotation = async () => {
  // Simule une suggestion de cotation F×P×G×M
  const suggestion = {
    frequency: 2,      // 1-4
    probability: 3,    // 1-4
    severity: 2,       // 1-4
    control: 3,        // 1-4
    justification: "Basé sur l'analyse...",
    disclaimer: "L'employeur reste responsable..."
  };
  
  // Applique automatiquement aux sliders
  setFrequency(suggestion.frequency);
  // ...
};
```

**Critères de cotation** :
- **Fréquence** : Rare (1) → Permanent (4)
- **Probabilité** : Improbable (1) → Très probable (4)
- **Gravité** : Faible (1) → Très grave (4)
- **Maîtrise** : Excellente (1) → Inexistante (4)

**Calcul du score** : `F × P × G × M`

**Niveau de priorité** :
- < 36 : Faible (vert)
- 36-107 : À améliorer (jaune)
- ≥ 108 : Prioritaire (rouge)

### 3. Génération d'actions (À implémenter)

**Emplacement** : Bouton sur chaque risque évalué

**Données requises** :
```typescript
{
  riskId: string,
  hazardLabel: string,
  situationDescription: string,
  riskScore: number,
  priorityLevel: string,
  existingMeasures: string
}
```

**Réponse attendue** :
```typescript
{
  actions: [
    {
      action_type: 'technique' | 'organisationnelle' | 'humaine',
      action_label: string,
      indicator: string,
      weeks: number,      // Échéance recommandée
      priority: 'basse' | 'moyenne' | 'haute' | 'critique'
    }
  ]
}
```

## Composants UI

### RiskAssessmentDialogWizard

Dialog complet d'évaluation des risques avec :

**Champs** :
- Sélection du danger (référentiel)
- Description de la situation
- Personnes exposées
- Mesures existantes

**Sliders interactifs** :
- 4 critères de cotation (F, P, G, M)
- Tooltips explicatifs sur chaque critère
- Mise à jour en temps réel du score

**Fonctionnalités** :
- Bouton "Proposer une cotation (IA)"
- Affichage de la justification IA
- Badge de priorité dynamique
- Calcul automatique du score

### WorkUnitDialog

Dialog de création/modification d'unité de travail :

**Champs** :
- Site * (sélection avec regroupement par entreprise)
- Nom de l'UT *
- Description (utilisée par l'IA)
- Effectif exposé
- Responsable (nom)
- Responsable (email)

**Validation** :
- Utilise `react-hook-form` avec Zod
- Validation côté client et serveur
- Messages d'erreur contextuels

## Routes tRPC

### Existantes

```typescript
// Unités de travail
workUnits.getAll
workUnits.create
workUnits.update
workUnits.delete

// Évaluations de risques
riskAssessments.getAll
riskAssessments.create
riskAssessments.update
riskAssessments.delete

// Situations dangereuses
dangerousSituations.getAll
```

### À créer pour l'IA

```typescript
// server/api/routers/ai.ts
ai.suggestHazards
  Input: { workUnitId, workUnitName, description, existingRisks }
  Output: { suggestions: Array<Suggestion>, disclaimer: string }

ai.suggestRating
  Input: { hazardId, context, existingMeasures, exposedPersons }
  Output: { frequency, probability, severity, control, justification, disclaimer }

ai.generateActions
  Input: { riskId, hazardLabel, situation, score, priority, existingMeasures }
  Output: { actions: Array<Action> }
```

## Intégration OpenAI/Claude

### Configuration

```env
# .env.local
OPENAI_API_KEY=sk-...
# ou
ANTHROPIC_API_KEY=sk-ant-...
```

### Exemple d'implémentation (OpenAI)

```typescript
// server/api/routers/ai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const aiRouter = createTRPCRouter({
  suggestHazards: protectedProcedure
    .input(z.object({
      workUnitId: z.string(),
      workUnitName: z.string(),
      description: z.string(),
      existingRisks: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Tu es un expert en prévention des risques professionnels...
      
Unité de travail : ${input.workUnitName}
Description : ${input.description}
Risques déjà identifiés : ${input.existingRisks.join(', ')}

Suggère 5 dangers pertinents qui n'ont pas encore été évalués.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });
      
      const data = JSON.parse(response.choices[0].message.content);
      return data;
    }),
});
```

## Flux utilisateur complet

### 1. Accès à l'assistant

```
Utilisateur avec plan PRO/EXPERT/ENTREPRISE
  ↓
Évaluations > Nouvelle évaluation
  ↓
Sélection "Assistant DUERP (IA)"
  ↓
Redirection vers /dashboard/assistance
```

### 2. Étape 1 : Unités de travail

```
Affichage des unités existantes
  ↓
Clic sur "+ Ajouter une UT"
  ↓
Dialog avec formulaire complet
  ↓
Sauvegarde via tRPC (workUnits.create)
  ↓
Rafraîchissement de la liste
  ↓
Clic sur "Suivant" (validé si ≥ 1 UT)
```

### 3. Étape 2 : Évaluation

```
Sélection d'une UT dans la liste gauche
  ↓
Affichage des détails de l'UT
  ↓
Option A : "Suggérer des dangers (IA)"
  ↓ [Simulation 2s]
  Card bleue avec 5 suggestions
  ↓
  Clic sur "Évaluer" (suggestion)
  ↓
  Dialog pré-rempli

Option B : "+ Ajouter un risque"
  ↓
  Dialog vierge
  
Dans le dialog :
  ↓
Remplissage des champs
  ↓
(Optionnel) "Proposer une cotation (IA)"
  ↓ [Simulation 1.5s]
  Sliders mis à jour automatiquement
  ↓
Ajustement manuel si nécessaire
  ↓
"Enregistrer" → tRPC (riskAssessments.create)
  ↓
Risque ajouté à la liste
```

### 4. Étape 3 : Plan d'actions

```
Affichage des actions générées
  ↓
Statistiques : statut, type, priorité
  ↓
Lien vers /dashboard/actions (gestion complète)
  ↓
Clic sur "Suivant"
```

### 5. Étape 4 : Génération

```
Affichage des statistiques finales
  ↓
Clic sur "Générer le PDF"
  ↓
Création d'une DuerpVersion (archivage)
  ↓
Redirection vers /dashboard/historique
```

## État d'avancement

### ✅ Complété

- [x] Structure du wizard 4 étapes
- [x] Stepper horizontal avec navigation
- [x] Étape 1 : Gestion des unités de travail
- [x] Étape 2 : Interface d'évaluation avec layout 2 colonnes
- [x] Dialog d'évaluation avec sliders interactifs
- [x] Suggestions IA inline (simulation)
- [x] Pré-remplissage du formulaire depuis suggestion
- [x] Calcul automatique du score et priorité
- [x] Étape 3 : Aperçu du plan d'actions
- [x] Étape 4 : Page de génération
- [x] Intégration avec le système de plans (PRO+)

### 🚧 En cours

- [ ] Endpoints tRPC pour l'IA (nécessite clé API)
- [ ] Tests du parcours complet

### 📋 À faire

- [ ] Génération d'actions IA fonctionnelle
- [ ] Export CSV
- [ ] Génération PDF du DUERP
- [ ] Archivage des versions

## Notes importantes

### Avertissements réglementaires

Tous les textes générés par l'IA incluent systématiquement :

> "L'employeur reste seul responsable de l'évaluation et de la gestion des risques. Cette liste/suggestion ne constitue pas un avis juridique définitif."

### Responsabilité

L'IA est **assistive**, jamais **décisionnaire** :
- Les suggestions peuvent être ignorées
- Toutes les valeurs sont modifiables
- Validation humaine obligatoire
- Traçabilité des sources (AI vs Manuel)

### Traçabilité

Chaque évaluation stocke :
```typescript
{
  source: 'manual' | 'ai_assisted' | 'imported',
  aiSuggestions: JSON | null,  // Justifications IA
}
```

## Maintenance

### Mise à jour des suggestions

Pour ajuster la qualité des suggestions IA :
1. Modifier les prompts dans `server/api/routers/ai.ts`
2. Tester avec différents types d'unités de travail
3. Ajuster le nombre de suggestions (actuellement 5)
4. Affiner les critères de pertinence

### Monitoring

Métriques à surveiller :
- Taux d'utilisation des suggestions IA
- Taux d'acceptation des cotations IA
- Temps moyen de création d'un DUERP
- Nombre de modifications post-suggestion

## Ressources

- [Code source Base44](data/duerp-ai-assistant-devaluation-d-aa58faf0/)
- [Réglementation DUERP](docs/CONFORMITE_REGLEMENTAIRE.md)
- [Plans et tarifs](docs/plans-tarifs/README.md)
- [Méthodes d'évaluation](lib/evaluation-methods.ts)

---

**Dernière mise à jour** : 20 janvier 2026  
**Version** : 1.0.0  
**Statut** : En développement (80% complété)
