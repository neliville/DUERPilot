/**
 * Configuration des plans tarifaires v2
 * Source de vérité pour les fonctionnalités et limites par plan
 */

export type Plan = 'free' | 'essentiel' | 'pro' | 'expert';

export type EvaluationMethod = 'duerp_generique' | 'inrs';

export interface PlanFeatures {
  methods: EvaluationMethod[];
  maxCompanies: number;
  maxSites: number;
  maxWorkUnits: number;
  maxUsers: number;
  maxRisksPerMonth: number;
  maxExportsPerMonth: number; // Générations DUERP / an
  maxPlansActionPerMonth: number;
  maxImportsPerMonth: number | null; // null = illimité
  // Quotas IA
  maxAISuggestionsRisks: number; // Suggestions de risques / mois
  maxAISuggestionsActions: number; // Suggestions d'actions / mois (EXPERT uniquement)
  hasAIReformulation: boolean; // Reformulation illimitée raisonnable (300/jour technique)
  // Exports
  hasExportWord: boolean;
  hasExportExcel: boolean;
  hasAPI: boolean;
  hasMultiTenant: boolean;
  hasImportDUERP: boolean;
  hasImportIAExtraction: 'none' | 'basic' | 'advanced' | 'complete';
  // Support
  supportLevel: 'email_72h' | 'email_48h' | 'email_24h' | 'email_8h';
  supportChat: boolean;
  supportPhone: boolean;
  // Infrastructure
  hostingLocation: string;
}

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  free: {
    methods: ['duerp_generique'],
    maxCompanies: 1,
    maxSites: 1,
    maxWorkUnits: 3,
    maxUsers: 1,
    maxRisksPerMonth: 5,
    maxExportsPerMonth: 1, // 1 DUERP/an
    maxPlansActionPerMonth: 10,
    maxImportsPerMonth: 0, // Pas d'import
    // IA
    maxAISuggestionsRisks: 0,
    maxAISuggestionsActions: 0,
    hasAIReformulation: false,
    // Exports
    hasExportWord: false,
    hasExportExcel: false,
    hasAPI: false,
    hasMultiTenant: false,
    hasImportDUERP: false,
    hasImportIAExtraction: 'none',
    // Support
    supportLevel: 'email_72h',
    supportChat: false,
    supportPhone: false,
    // Infrastructure
    hostingLocation: 'Allemagne (Hetzner)',
  },
  essentiel: {
    methods: ['duerp_generique', 'inrs'],
    maxCompanies: 1,
    maxSites: 1,
    maxWorkUnits: 10,
    maxUsers: 3,
    maxRisksPerMonth: 20,
    maxExportsPerMonth: 2, // 2 DUERP/an
    maxPlansActionPerMonth: 30,
    maxImportsPerMonth: 0, // Pas d'import
    // IA - Sans IA volontairement
    maxAISuggestionsRisks: 0,
    maxAISuggestionsActions: 0,
    hasAIReformulation: false,
    // Exports
    hasExportWord: false,
    hasExportExcel: false,
    hasAPI: false,
    hasMultiTenant: false,
    hasImportDUERP: false,
    hasImportIAExtraction: 'none',
    // Support
    supportLevel: 'email_48h',
    supportChat: false,
    supportPhone: false,
    // Infrastructure
    hostingLocation: 'Allemagne (Hetzner)',
  },
  pro: {
    methods: ['duerp_generique', 'inrs'],
    maxCompanies: 3,
    maxSites: 5,
    maxWorkUnits: 50,
    maxUsers: 10,
    maxRisksPerMonth: 100,
    maxExportsPerMonth: 12, // 12 DUERP/an
    maxPlansActionPerMonth: 200,
    maxImportsPerMonth: 5, // 5 fichiers/mois
    // IA
    maxAISuggestionsRisks: 50, // /mois
    maxAISuggestionsActions: 0,
    hasAIReformulation: true, // Illimité raisonnable (300/jour technique)
    // Exports
    hasExportWord: true,
    hasExportExcel: true,
    hasAPI: true,
    hasMultiTenant: false,
    hasImportDUERP: true,
    hasImportIAExtraction: 'basic', // Extraction basique
    // Support
    supportLevel: 'email_24h',
    supportChat: false,
    supportPhone: false,
    // Infrastructure
    hostingLocation: 'Allemagne (Hetzner)',
  },
  expert: {
    methods: ['duerp_generique', 'inrs'],
    maxCompanies: Infinity,
    maxSites: Infinity,
    maxWorkUnits: Infinity,
    maxUsers: Infinity,
    maxRisksPerMonth: Infinity,
    maxExportsPerMonth: Infinity, // Illimité
    maxPlansActionPerMonth: Infinity,
    maxImportsPerMonth: null, // Illimité
    // IA
    maxAISuggestionsRisks: 200, // /mois
    maxAISuggestionsActions: 50, // /mois
    hasAIReformulation: true,
    // Exports
    hasExportWord: true,
    hasExportExcel: true,
    hasAPI: true,
    hasMultiTenant: true,
    hasImportDUERP: true,
    hasImportIAExtraction: 'advanced', // Extraction avancée
    // Support
    supportLevel: 'email_8h',
    supportChat: true,
    supportPhone: false,
    // Infrastructure
    hostingLocation: 'Allemagne (Hetzner)',
  },
};

export const PLAN_PRICES: Record<Plan, { monthly: number; annual: number; annualTotal: number }> = {
  free: { monthly: 0, annual: 0, annualTotal: 0 },
  essentiel: { monthly: 29, annual: 29, annualTotal: 290 }, // Pas de réduction annuelle
  pro: { monthly: 79, annual: 79, annualTotal: 790 },
  expert: { monthly: 149, annual: 149, annualTotal: 1490 },
};

export const PLAN_NAMES: Record<Plan, string> = {
  free: 'FREE',
  essentiel: 'ESSENTIEL',
  pro: 'PRO',
  expert: 'EXPERT',
};

export const PLAN_DESCRIPTIONS: Record<Plan, string> = {
  free: 'Découverte',
  essentiel: 'TPE',
  pro: 'PME / Consultants',
  expert: 'PME structurées',
};

/**
 * Vérifie si un plan a accès à une méthode d'évaluation
 */
export function hasMethodAccess(plan: Plan, method: EvaluationMethod): boolean {
  return PLAN_FEATURES[plan].methods.includes(method);
}

/**
 * Vérifie si un plan a accès à une fonctionnalité
 */
export function hasFeatureAccess(plan: Plan, feature: keyof PlanFeatures): boolean {
  const planFeatures = PLAN_FEATURES[plan];
  const value = planFeatures[feature];
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'number') {
    return value > 0;
  }
  
  if (value === 'all' || value === 'none') {
    return value === 'all';
  }
  
  if (value === null) {
    return true; // null = illimité
  }
  
  if (typeof value === 'string') {
    // Pour hasImportIAExtraction: 'none' = false, autres = true
    if (value === 'none') {
      return false;
    }
    return true;
  }
  
  return true;
}

/**
 * Retourne le plan minimum requis pour une fonctionnalité
 */
export function getRequiredPlan(feature: string): Plan {
  const featureMap: Record<string, Plan> = {
    inrs: 'essentiel', // Méthode INRS disponible dès ESSENTIEL
    duerp_generique: 'free',
    work_units: 'free', // 3 unités dès Free
    maxWorkUnits: 'free',
    workUnits: 'free',
    multiple_companies: 'pro', // 3 entreprises en PRO
    api: 'pro',
    multi_tenant: 'expert', // Illimité uniquement en EXPERT
    export_word: 'pro',
    export_excel: 'pro',
    import_duerp: 'pro',
    import_ia: 'pro',
    ai_suggestions_risks: 'pro',
    ai_suggestions_actions: 'expert',
    ai_reformulation: 'pro',
    support_chat: 'expert',
    support_phone: 'expert',
  };
  
  return featureMap[feature] || 'free';
}

/**
 * Retourne le plan supérieur recommandé
 */
export function getUpgradePlan(currentPlan: Plan): Plan | null {
  const upgradeMap: Record<Plan, Plan | null> = {
    free: 'essentiel',
    essentiel: 'pro',
    pro: 'expert',
    expert: null,
  };
  
  return upgradeMap[currentPlan];
}

/**
 * Messages d'erreur standardisés (UX améliorée) - v2
 */
export const PLAN_ERROR_MESSAGES = {
  method_not_available: (method: string, currentPlan: Plan, requiredPlan: Plan) => {
    const messages: Record<Plan, Record<string, string>> = {
      free: {
        inrs: `🔒 Méthode structurée (inspirée INRS) indisponible\n\nLa méthode structurée (inspirée INRS) permet une évaluation approfondie et défendable, conforme aux attentes des inspecteurs, auditeurs et donneurs d'ordre. Elle est disponible à partir du plan ${PLAN_NAMES[requiredPlan]}, pensé pour les TPE souhaitant structurer leur démarche QSE.\n\n👉 Passez au plan ${PLAN_NAMES[requiredPlan]} pour bénéficier :\n• d'une méthode structurée et reconnue\n• d'une approche défendable en contrôle\n• de fonctionnalités avancées pour votre DUERP`,
      },
      essentiel: {},
      pro: {},
      expert: {},
    };
    
    return messages[currentPlan]?.[method] || 
      `La méthode "${method}" n'est pas disponible dans le plan ${PLAN_NAMES[currentPlan]}. Passez au plan ${PLAN_NAMES[requiredPlan]} pour y accéder.`;
  },
  
  quota_exceeded: (quota: number, limit: number, currentPlan: Plan, upgradePlan: Plan | null, quotaType: 'risks' | 'actions' | 'reformulation' = 'risks') => {
    if (quotaType === 'risks') {
      if (currentPlan === 'pro') {
        return `Vous avez utilisé l'ensemble de vos suggestions IA de risques (${quota}/${limit} ce mois). Le plan ${upgradePlan ? PLAN_NAMES[upgradePlan] : 'EXPERT'} vous permet ${PLAN_FEATURES[upgradePlan || 'expert'].maxAISuggestionsRisks} suggestions de risques/mois.`;
      }
      if (currentPlan === 'essentiel' || currentPlan === 'free') {
        return `Les suggestions IA de risques ne sont pas disponibles dans votre plan. Passez au plan ${upgradePlan ? PLAN_NAMES[upgradePlan] : 'PRO'} pour bénéficier de l'assistance IA.`;
      }
    }
    
    if (quotaType === 'actions') {
      return `Les suggestions IA d'actions sont disponibles uniquement dans le plan ${upgradePlan ? PLAN_NAMES[upgradePlan] : 'EXPERT'}. Vous avez utilisé ${quota}/${limit} suggestions ce mois.`;
    }
    
    return `Vous avez atteint votre quota mensuel (${quota}/${limit}). ${
      upgradePlan
        ? `Passez au plan ${PLAN_NAMES[upgradePlan]} pour accéder à des quotas étendus.`
        : 'Contactez le support pour un quota personnalisé.'
    }`;
  },
  
  limit_exceeded: (resource: string, current: number, limit: number, currentPlan: Plan, upgradePlan: Plan | null) => {
    const resourceNames: Record<string, string> = {
      companies: 'entreprises',
      sites: 'sites',
      workUnits: 'unités de travail',
      users: 'utilisateurs',
      risks: 'risques évalués',
      plansAction: 'plans d\'action',
      exports: 'générations DUERP',
      imports: 'imports',
    };
    
    const resourceName = resourceNames[resource] || resource;
    
    // Messages positifs et rassurants selon le plan
    if (currentPlan === 'free') {
      if (resource === 'companies') {
        return `ℹ️ Limite d'entreprise atteinte\n\nVotre plan FREE inclut une entreprise, ce qui permet de réaliser un DUERP conforme pour une structure unique.\n\n👉 Avec le plan ${upgradePlan ? PLAN_NAMES[upgradePlan] : 'ESSENTIEL'}, vous pourrez :\n• Accéder à la méthode structurée INRS\n• Gérer jusqu'à 10 unités de travail\n• Bénéficier de fonctionnalités avancées`;
      }
      return `ℹ️ Limite atteinte\n\nVotre plan FREE vous permet de réaliser un DUERP conforme. Vous avez utilisé l'ensemble des ${resourceName} inclus dans votre plan.\n\n👉 Passez au plan ${upgradePlan ? PLAN_NAMES[upgradePlan] : 'ESSENTIEL'} pour accéder à ${limit === Infinity ? 'des limites illimitées' : 'des limites supérieures'}.`;
    }
    
    if (currentPlan === 'essentiel') {
      if (resource === 'workUnits') {
        return `ℹ️ Structuration avancée disponible\n\nVotre plan ESSENTIEL est conçu pour les TPE. Les unités de travail permettent une structuration plus fine et mieux défendable en cas de contrôle.\n\n👉 Avec le plan ${upgradePlan ? PLAN_NAMES[upgradePlan] : 'PRO'}, vous pourrez :\n• Créer jusqu'à ${limit === Infinity ? 'un nombre illimité' : limit} d'unités de travail\n• Bénéficier de l'assistance IA\n• Importer des DUERP existants`;
      }
      return `ℹ️ Limite atteinte\n\nVotre plan ESSENTIEL vous permet de gérer efficacement votre DUERP. Vous avez utilisé l'ensemble des ${resourceName} inclus.\n\n👉 Passez au plan ${upgradePlan ? PLAN_NAMES[upgradePlan] : 'PRO'} pour accéder à ${limit === Infinity ? 'des limites illimitées' : 'des limites supérieures'}.`;
    }
    
    if (currentPlan === 'pro') {
      return `ℹ️ Limite atteinte\n\nVotre plan PRO offre une structuration complète pour votre DUERP. Vous avez utilisé l'ensemble des ${resourceName} inclus.\n\n👉 Le plan ${upgradePlan ? PLAN_NAMES[upgradePlan] : 'EXPERT'} vous permet ${limit === Infinity ? 'des limites illimitées' : 'd\'étendre vos limites'} et d'accéder à un support prioritaire.`;
    }
    
    // Plan Expert - pas d'upsell, juste information
    return `ℹ️ Limite atteinte\n\nVous avez utilisé l'ensemble des ${resourceName} de votre plan. Contactez le support pour discuter d'une extension personnalisée.`;
  },
  
  feature_not_available: (feature: string, currentPlan: Plan, requiredPlan: Plan) => {
    if (feature === 'ia' && (currentPlan === 'free' || currentPlan === 'essentiel')) {
      return `🔒 Fonctionnalité IA non disponible\n\nL'assistance IA (suggestions de risques, reformulation) n'est pas disponible dans votre plan. Avec le plan ${PLAN_NAMES[requiredPlan]}, vous pourrez bénéficier de l'assistance IA pour gagner du temps tout en restant décisionnaire.\n\n👉 Passez au plan ${PLAN_NAMES[requiredPlan]} pour bénéficier :\n• de suggestions de risques pertinentes (${PLAN_FEATURES[requiredPlan].maxAISuggestionsRisks}/mois)\n• de reformulation illimitée pour améliorer vos descriptions\n• d'une assistance intelligente non décisionnaire`;
    }
    if (feature === 'import') {
      return `🔒 Import de DUERP existant non disponible\n\nL'import de DUERP (PDF/Word/Excel) est disponible à partir du plan ${PLAN_NAMES[requiredPlan]}. Cette fonctionnalité vous permet de reprendre votre DUERP existant sans ressaisir toutes les données.\n\n👉 Passez au plan ${PLAN_NAMES[requiredPlan]} pour bénéficier de l'import avec extraction IA.`;
    }
    return `La fonctionnalité "${feature}" n'est pas disponible dans le plan ${PLAN_NAMES[currentPlan]}. Passez au plan ${PLAN_NAMES[requiredPlan]} pour y accéder.`;
  },
};

