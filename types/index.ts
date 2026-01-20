/**
 * Types globaux pour l'application DUERPilot
 */

// Plans tarifaires
export type Plan = 'free' | 'starter' | 'business' | 'premium' | 'entreprise';

// Méthodes d'évaluation
export type EvaluationMethod = 'duerp_generique' | 'inrs';

// Types d'usage IA
export type AIUsageType = 'suggestions_risques' | 'suggestions_actions' | 'reformulation';

// Rôles utilisateur
export type UserRole =
  | 'super_admin'      // ÉDITEUR (DDWIN Solutions)
  | 'owner'            // PROPRIÉTAIRE (souscripteur)
  | 'admin'            // ADMINISTRATEUR
  | 'qse'              // RESPONSABLE QSE
  | 'site_manager'     // RESPONSABLE DE SITE
  | 'representative'   // REPRÉSENTANT (CSE/CSSCT)
  | 'observer'         // OBSERVATEUR
  | 'auditor';         // AUDITEUR (externe temporaire : inspecteur, expert, CARSAT)

// Niveaux de priorité pour les risques
export type RiskPriorityLevel = 'faible' | 'à_améliorer' | 'prioritaire';

// Statuts des actions
export type ActionStatus = 'à_faire' | 'en_cours' | 'bloqué' | 'terminé';

// Priorités des actions
export type ActionPriority = 'basse' | 'moyenne' | 'haute' | 'critique';

// Types d'actions
export type ActionType = 'technique' | 'organisationnelle' | 'humaine';

// Statuts des observations
export type ObservationStatus = 'nouvelle' | 'en_analyse' | 'integree' | 'rejetee';

// Catégories de dangers (ancien type - conservé pour compatibilité)
export type HazardCategory =
  | 'physique'
  | 'chimique'
  | 'biologique'
  | 'ergonomique'
  | 'psychosocial'
  | 'mécanique'
  | 'électrique'
  | 'incendie'
  | 'autre';

// Catégories de dangers (code) - Référentiel DUERP propriétaire
export type DangerCategoryCode =
  | 'PHY' // Physiques
  | 'CHI' // Chimiques
  | 'BIO' // Biologiques
  | 'ERG' // Ergonomiques
  | 'PSY' // Psychosociaux
  | 'MEC' // Mécaniques
  | 'ELEC' // Électriques
  | 'INC' // Incendie
  | 'ORG'; // Organisationnels

// Types de mesures de prévention
export type PreventionMeasureType =
  | 'technique'
  | 'organisationnelle'
  | 'humaine'
  | 'collective'
  | 'individuelle';

// Source d'évaluation des risques
export type RiskSource = 'manual' | 'ai_assisted' | 'imported';

// Niveau d'efficacité des mesures
export type EffectivenessLevel = 1 | 2 | 3 | 4;

// Types d'actions d'audit
export type AuditAction =
  | 'création'
  | 'modification'
  | 'suppression'
  | 'export'
  | 'génération_pdf'
  | 'validation'
  | 'connexion';

// Matrice de cotation (valeurs 1-4)
export type CotationValue = 1 | 2 | 3 | 4;

// Interface pour la cotation d'un risque
export interface RiskCotation {
  frequency: CotationValue; // Fréquence
  probability: CotationValue; // Probabilité
  severity: CotationValue; // Gravité
  control: CotationValue; // Maîtrise
}

// Interface pour les suggestions IA (ancien format - conservé pour compatibilité)
export interface AISuggestions {
  suggestedHazards?: Array<{
    hazardId: string;
    hazardLabel: string;
    confidence: number;
    reason: string;
  }>;
  suggestedCotation?: RiskCotation & {
    reasoning: string;
  };
  suggestedActions?: Array<{
    type: ActionType;
    description: string;
    priority: ActionPriority;
    reasoning: string;
  }>;
}

// Suggestions IA pour les situations dangereuses - Référentiel DUERP propriétaire
export interface DangerousSituationSuggestion {
  situationId: string;
  label: string;
  category: string;
  categoryCode: DangerCategoryCode;
  confidence: number;
  reasoning: string;
  suggestedMeasures?: string[];
}

// Suggestions IA pour les mesures de prévention
export interface PreventionMeasureSuggestion {
  type: PreventionMeasureType;
  description: string;
  effectiveness: EffectivenessLevel;
  reasoning: string;
  estimatedCost?: string;
}

// Interface pour le suivi des quotas IA
export interface AIQuotaUsage {
  suggestions_risques: number;
  suggestions_actions: number;
  reformulations: number;
  monthStart: Date;
  tenantId: string;
}

