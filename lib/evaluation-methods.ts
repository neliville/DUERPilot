/**
 * Descriptions détaillées des 3 méthodes d'évaluation
 * Source de vérité pour les descriptions affichées aux utilisateurs
 */

import type { EvaluationMethod as PlanEvaluationMethod } from './plans';

export type EvaluationMethod = PlanEvaluationMethod;

export interface MethodDescription {
  id: EvaluationMethod;
  name: string;
  subtitle: string;
  purpose: string;
  howItWorks: string[];
  targetUsers: string[];
  aiUsage: 'none' | 'assisted' | 'optional';
  advantages: string[];
  limitations: string[];
  complexity: 'Très faible' | 'Faible' | 'Élevée';
}

export const EVALUATION_METHODS: Record<EvaluationMethod, MethodDescription> = {
  duerp_generique: {
    id: 'duerp_generique',
    name: 'Méthode DUERP générique',
    subtitle: 'Adaptée aux TPE – conformité essentielle',
    purpose: 'Permettre à toute entreprise, même très petite, d\'identifier ses risques, les évaluer, définir des actions, et prouver qu\'elle a fait le travail. Conforme juridiquement, suffisant pour inspection du travail.',
    howItWorks: [
      "Définir les unités de travail",
      'Identifier les situations dangereuses',
      'Évaluer le risque (logique simple : F × P × G)',
      'Définir des mesures de prévention',
      'Formaliser dans un DUERP traçable',
    ],
    targetUsers: [
      'TPE (1-10 salariés)',
      'Dirigeants seuls',
      'Découverte du DUERP',
      'Besoin de conformité essentielle',
    ],
    aiUsage: 'none',
    advantages: [
      'Conforme juridiquement',
      'Suffisant pour inspection du travail',
      'Adapté aux TPE',
      'Très simple',
    ],
    limitations: [
      'Moins structurant pour démarches avancées',
      'Pas de guidage spécialisé',
      'Pas d\'assistance IA',
    ],
    complexity: 'Faible',
  },
  inrs: {
    id: 'inrs',
    name: 'Méthode structurée (inspirée INRS)',
    subtitle: 'Pour une évaluation plus approfondie et pilotable',
    purpose: 'Apporter plus de rigueur, une logique reconnue, une méthode appréciée par les inspecteurs, CARSAT, consultants et démarches ISO. On applique la logique INRS, pas un copier-coller.',
    howItWorks: [
      'Découpage fin des unités de travail',
      'Identification systématique des dangers',
      'Analyse des situations d\'exposition',
      'Évaluation selon critères hiérarchisés (F × P × G)',
      'Priorisation des actions',
      'Suivi dans le temps',
    ],
    targetUsers: [
      'PME structurées',
      'Responsables QSE / HSE',
      'Consultants',
      'Entreprises auditées',
    ],
    aiUsage: 'optional',
    advantages: [
      'Structuration avancée',
      'Reconnaissance terrain',
      'Appréciée par inspecteurs et CARSAT',
      'Adaptée démarches ISO',
    ],
    limitations: [
      'Plus longue',
      'Plus technique',
      'Moins accessible aux TPE',
    ],
    complexity: 'Moyenne',
  },
};

/**
 * Phrase clé à afficher dans l'app
 */
export const METHOD_SELECTION_KEY_MESSAGE = 
  'Vous choisissez la méthode. Vous restez responsable. L\'outil s\'adapte à votre niveau.';

/**
 * Obtient la description d'une méthode d'évaluation
 */
export function getMethodDescription(method: EvaluationMethod): MethodDescription {
  return EVALUATION_METHODS[method];
}

/**
 * Obtient tous les symboles pour l'usage IA
 */
export function getAISymbol(method: EvaluationMethod): string {
  const symbols: Record<EvaluationMethod, string> = {
    duerp_generique: '❌',
    inrs: '⚠️',
  };
  return symbols[method];
}

/**
 * Obtient la description de l'usage IA
 */
export function getAIDescription(method: EvaluationMethod): string {
  const descriptions: Record<EvaluationMethod, string> = {
    duerp_generique: 'Aucune',
    inrs: 'Optionnelle et assistive (plan PRO/EXPERT). Aide à la reformulation ou à la suggestion. Jamais décisionnaire.',
  };
  return descriptions[method];
}

