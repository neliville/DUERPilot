/**
 * Messages légaux obligatoires pour la conformité réglementaire DUERP
 * 
 * Code du travail :
 * - Article L.4121-1 (obligation générale de sécurité)
 * - Articles R.4121-1 à R.4121-4 (DUERP)
 * - Article L.4121-3 (PAPRIPACT pour entreprises >= 50 salariés)
 */

/**
 * Message de responsabilité légale (obligatoire)
 * À afficher lors de la création/modification d'un DUERP
 */
export const LEGAL_RESPONSIBILITY_MESSAGE = {
  title: 'Responsabilité légale',
  content:
    'DUERPilot est un outil d\'aide à l\'évaluation des risques professionnels. L\'employeur reste responsable de la validation et de la conformité finale du DUERP conformément au Code du travail (articles R.4121-1 à R.4121-4).',
  icon: '⚠️',
  variant: 'warning' as const,
};

/**
 * Message d'aide IA (obligatoire)
 * À afficher lors de l'utilisation de suggestions IA
 */
export const AI_ASSISTANCE_MESSAGE = {
  title: 'Aide à la décision',
  content:
    'Les suggestions générées par l\'IA sont fournies à titre indicatif et doivent être validées par l\'utilisateur. L\'IA est strictement assistive et ne prend aucune décision à votre place.',
  icon: '🤖',
  variant: 'info' as const,
};

/**
 * Message PAPRIPACT (obligatoire si effectif >= 50)
 * À afficher pour les entreprises éligibles au PAPRIPACT
 */
export const PAPRIPACT_REQUIREMENT_MESSAGE = {
  title: 'PAPRIPACT obligatoire',
  content:
    'Conformément à l\'article L.4121-3 du Code du travail, les entreprises de 50 salariés et plus doivent établir un Plan d\'Actions de Prévention des Risques et d\'Amélioration des Conditions de Travail (PAPRIPACT) annuel.',
  icon: '📋',
  variant: 'warning' as const,
  threshold: 50,
};

/**
 * Message participation des travailleurs (obligatoire)
 * À afficher pour rappeler l'obligation de consultation
 */
export const WORKER_PARTICIPATION_MESSAGE = {
  title: 'Participation des travailleurs',
  content:
    'La consultation et l\'information des travailleurs sur les risques professionnels et leur prévention sont obligatoires (article L.4121-1 du Code du travail).',
  icon: '👥',
  variant: 'info' as const,
};

/**
 * Message de mise à jour obligatoire
 * À afficher pour rappeler les obligations de mise à jour
 */
export const DUERP_UPDATE_REQUIREMENT_MESSAGE = {
  title: 'Mise à jour obligatoire',
  content:
    'Le DUERP doit être mis à jour au moins une fois par an, et lors de toute modification importante des conditions de travail, de l\'introduction d\'un nouvel équipement, d\'un accident ou d\'une évolution réglementaire (article R.4121-2 du Code du travail).',
  icon: '🔄',
  variant: 'info' as const,
};

/**
 * Message de traçabilité
 * À afficher pour expliquer l'historique et la traçabilité
 */
export const TRACEABILITY_MESSAGE = {
  title: 'Traçabilité',
  content:
    'Toutes les modifications du DUERP sont tracées avec la date, l\'auteur et la justification. L\'historique des versions est conservé pour preuve de la démarche de prévention structurée.',
  icon: '📝',
  variant: 'info' as const,
};

/**
 * Références réglementaires (pour affichage informatif)
 */
export const REGULATORY_REFERENCES = {
  generalObligation: {
    code: 'L.4121-1',
    title: 'Obligation générale de sécurité',
    description: 'Obligation de sécurité de l\'employeur envers ses salariés',
  },
  duerpRequirement: {
    code: 'R.4121-1 à R.4121-4',
    title: 'Document Unique d\'Évaluation des Risques Professionnels',
    description: 'Obligation d\'établir et mettre à jour un DUERP pour toutes les entreprises',
  },
  duerpUpdate: {
    code: 'R.4121-2',
    title: 'Mise à jour du DUERP',
    description: 'Mise à jour obligatoire au moins une fois par an et lors de modifications importantes',
  },
  papripact: {
    code: 'L.4121-3',
    title: 'Plan d\'Actions de Prévention des Risques et d\'Amélioration des Conditions de Travail',
    description: 'PAPRIPACT obligatoire pour les entreprises de 50 salariés et plus',
    threshold: 50,
  },
  workerParticipation: {
    code: 'L.4121-1',
    title: 'Consultation et information des travailleurs',
    description: 'Obligation de consulter et d\'informer les travailleurs sur les risques professionnels',
  },
} as const;

/**
 * Fonction pour obtenir le message approprié selon le contexte
 */
export function getLegalMessage(context: {
  type: 'responsibility' | 'ai' | 'papripact' | 'participation' | 'update' | 'traceability';
  employeeCount?: number | null;
}) {
  switch (context.type) {
    case 'responsibility':
      return LEGAL_RESPONSIBILITY_MESSAGE;
    case 'ai':
      return AI_ASSISTANCE_MESSAGE;
    case 'papripact':
      if (context.employeeCount !== null && context.employeeCount !== undefined && context.employeeCount >= 50) {
        return PAPRIPACT_REQUIREMENT_MESSAGE;
      }
      return null;
    case 'participation':
      return WORKER_PARTICIPATION_MESSAGE;
    case 'update':
      return DUERP_UPDATE_REQUIREMENT_MESSAGE;
    case 'traceability':
      return TRACEABILITY_MESSAGE;
    default:
      return null;
  }
}

/**
 * Vérifie si une entreprise est éligible au PAPRIPACT
 */
export function isEligibleForPAPRIPACT(employeeCount: number | null | undefined): boolean {
  return employeeCount !== null && employeeCount !== undefined && employeeCount >= 50;
}

