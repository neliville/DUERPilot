/**
 * Configuration des plans tarifaires v2
 * Source de vérité pour les fonctionnalités et limites par plan
 */

import type { UserRole } from '@/types';

export type Plan = 'free' | 'starter' | 'business' | 'premium' | 'entreprise';

export type EvaluationMethod = 'duerp_generique' | 'inrs' | 'assistance_ia';

export interface PlanFeatures {
  methods: EvaluationMethod[];
  maxCompanies: number;
  maxSites: number;
  maxWorkUnits: number;
  maxUsers: number;
  maxRisksPerMonth: number;
  maxExportsPerMonth: number; // Générations DUERP / an
  maxPlansActionPerMonth: number;
  maxObservationsPerMonth: number; // Observations terrain / mois
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
    maxPlansActionPerMonth: 25, // Ratio 5:1 avec risques
    maxObservationsPerMonth: 50, // Ratio 10:1 avec risques
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
  starter: {
    methods: ['duerp_generique', 'inrs'],
    maxCompanies: 1,
    maxSites: 1,
    maxWorkUnits: 10,
    maxUsers: 3,
    maxRisksPerMonth: 30, // Augmenté de 20 à 30 selon NOUVELLE_GRILLE
    maxExportsPerMonth: 3, // Augmenté de 2 à 3 selon NOUVELLE_GRILLE
    maxPlansActionPerMonth: 150, // Ratio 5:1 avec risques (PATCH)
    maxObservationsPerMonth: 300, // Ratio 10:1 avec risques (PATCH)
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
  business: {
    methods: ['duerp_generique', 'inrs', 'assistance_ia'],
    maxCompanies: 3,
    maxSites: 5,
    maxWorkUnits: 50,
    maxUsers: 10,
    maxRisksPerMonth: 150, // Augmenté de 100 à 150 selon NOUVELLE_GRILLE
    maxExportsPerMonth: 24, // Augmenté de 12 à 24 selon NOUVELLE_GRILLE
    maxPlansActionPerMonth: 600, // Ratio 4:1 avec risques (PATCH)
    maxObservationsPerMonth: 1000, // Ratio 6.7:1 avec risques (PATCH)
    maxImportsPerMonth: 10, // Augmenté de 5 à 10 selon NOUVELLE_GRILLE
    // IA
    maxAISuggestionsRisks: 100, // Augmenté de 50 à 100 selon NOUVELLE_GRILLE
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
  premium: {
    methods: ['duerp_generique', 'inrs', 'assistance_ia'],
    maxCompanies: 10, // PME 100-250 salariés
    maxSites: 20,
    maxWorkUnits: 200,
    maxUsers: 30,
    maxRisksPerMonth: 500,
    maxExportsPerMonth: 100, // Augmenté de 50 à 100 selon NOUVELLE_GRILLE
    maxPlansActionPerMonth: 2000, // Ratio 4:1 avec risques (PATCH)
    maxObservationsPerMonth: 3000, // Ratio 6:1 avec risques (PATCH)
    maxImportsPerMonth: 30, // Augmenté de 20 à 30 selon NOUVELLE_GRILLE
    // IA
    maxAISuggestionsRisks: 300, // Augmenté de 200 à 300 selon NOUVELLE_GRILLE
    maxAISuggestionsActions: 100, // Augmenté de 50 à 100 selon NOUVELLE_GRILLE
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
  entreprise: {
    methods: ['duerp_generique', 'inrs', 'assistance_ia'],
    maxCompanies: Infinity, // Sur mesure
    maxSites: Infinity,
    maxWorkUnits: Infinity,
    maxUsers: Infinity,
    maxRisksPerMonth: Infinity,
    maxExportsPerMonth: Infinity,
    maxPlansActionPerMonth: Infinity,
    maxObservationsPerMonth: Infinity,
    maxImportsPerMonth: null, // Illimité
    // IA
    maxAISuggestionsRisks: Infinity, // Custom
    maxAISuggestionsActions: Infinity, // Custom
    hasAIReformulation: true,
    // Exports
    hasExportWord: true,
    hasExportExcel: true,
    hasAPI: true,
    hasMultiTenant: true,
    hasImportDUERP: true,
    hasImportIAExtraction: 'complete', // Extraction complète
    // Support
    supportLevel: 'email_8h', // SLA 2h en réalité (custom)
    supportChat: true,
    supportPhone: true, // Account Manager dédié
    // Infrastructure
    hostingLocation: 'Allemagne (Hetzner)', // Peut être dédié
  },
};

export const PLAN_PRICES: Record<Plan, { monthly: number; annual: number; annualTotal: number }> = {
  free: { monthly: 0, annual: 0, annualTotal: 0 },
  starter: { monthly: 59, annual: 590, annualTotal: 590 }, // 10 mois = 2 mois offerts
  business: { monthly: 149, annual: 1490, annualTotal: 1490 }, // 10 mois = 2 mois offerts
  premium: { monthly: 349, annual: 3490, annualTotal: 3490 }, // 10 mois = 2 mois offerts
  entreprise: { monthly: 0, annual: 0, annualTotal: 0 }, // Sur devis
};

export const PLAN_NAMES: Record<Plan, string> = {
  free: 'FREE',
  starter: 'STARTER',
  business: 'BUSINESS',
  premium: 'PREMIUM',
  entreprise: 'ENTREPRISE',
};

export const PLAN_DESCRIPTIONS: Record<Plan, string> = {
  free: 'Découverte',
  starter: 'TPE Conforme',
  business: 'PME avec IA',
  premium: 'PME Structurée',
  entreprise: 'Sur mesure',
};

/**
 * Rôles disponibles par plan
 * Selon la matrice de permissions (docs/matrice-permissions-roles-duerpilot.md)
 */
export const PLAN_AVAILABLE_ROLES: Record<Plan, UserRole[]> = {
  free: ['owner', 'admin'], // Mode découverte - owner peut agir comme admin
  starter: ['owner', 'admin', 'representative', 'observer'],
  business: ['owner', 'admin', 'qse', 'site_manager', 'representative', 'observer', 'auditor'],
  premium: ['owner', 'admin', 'qse', 'site_manager', 'representative', 'observer', 'auditor'],
  entreprise: ['owner', 'admin', 'qse', 'site_manager', 'representative', 'observer', 'auditor'],
};

/**
 * Vérifie si un rôle est disponible dans un plan
 */
export function isRoleAvailableInPlan(plan: Plan, role: UserRole): boolean {
  return PLAN_AVAILABLE_ROLES[plan].includes(role);
}

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
    inrs: 'starter', // Méthode INRS disponible dès STARTER
    duerp_generique: 'free',
    work_units: 'free', // 3 unités dès Free
    maxWorkUnits: 'free',
    workUnits: 'free',
    multiple_companies: 'business', // 3 entreprises en BUSINESS
    api: 'business',
    multi_tenant: 'premium', // Illimité uniquement en PREMIUM
    export_word: 'business',
    export_excel: 'business',
    import_duerp: 'business',
    import_ia: 'business',
    ai_suggestions_risks: 'business',
    ai_suggestions_actions: 'premium',
    ai_reformulation: 'business',
    support_chat: 'premium',
    support_phone: 'premium',
  };
  
  return featureMap[feature] || 'free';
}

/**
 * Retourne le plan supérieur recommandé
 */
export function getUpgradePlan(currentPlan: Plan): Plan | null {
  const upgradeMap: Record<Plan, Plan | null> = {
    free: 'starter',
    starter: 'business',
    business: 'premium',
    premium: 'entreprise',
    entreprise: null,
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
      starter: {},
      business: {},
      premium: {},
      entreprise: {},
    };
    
    return messages[currentPlan]?.[method] || 
      `La méthode "${method}" n'est pas disponible dans le plan ${PLAN_NAMES[currentPlan]}. Passez au plan ${PLAN_NAMES[requiredPlan]} pour y accéder.`;
  },
  
  quota_exceeded: (quota: number, limit: number, currentPlan: Plan, upgradePlan: Plan | null, quotaType: 'risks' | 'actions' | 'reformulation' = 'risks') => {
    if (quotaType === 'risks') {
      if (currentPlan === 'business') {
        return `Vous avez utilisé l'ensemble de vos suggestions IA de risques (${quota}/${limit} ce mois). Le plan ${upgradePlan ? PLAN_NAMES[upgradePlan] : 'PREMIUM'} vous permet ${PLAN_FEATURES[upgradePlan || 'premium'].maxAISuggestionsRisks} suggestions de risques/mois.`;
      }
      if (currentPlan === 'starter' || currentPlan === 'free') {
        return `Les suggestions IA de risques ne sont pas disponibles dans votre plan. Passez au plan ${upgradePlan ? PLAN_NAMES[upgradePlan] : 'BUSINESS'} pour bénéficier de l'assistance IA.`;
      }
    }
    
    if (quotaType === 'actions') {
      return `Les suggestions IA d'actions sont disponibles uniquement dans le plan ${upgradePlan ? PLAN_NAMES[upgradePlan] : 'PREMIUM'}. Vous avez utilisé ${quota}/${limit} suggestions ce mois.`;
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
        return `ℹ️ Limite d'entreprise atteinte\n\nVotre plan FREE inclut une entreprise, ce qui permet de réaliser un DUERP conforme pour une structure unique.\n\n👉 Avec le plan ${upgradePlan ? PLAN_NAMES[upgradePlan] : 'STARTER'}, vous pourrez :\n• Accéder à la méthode structurée INRS\n• Gérer jusqu'à 10 unités de travail\n• Bénéficier de fonctionnalités avancées`;
      }
      return `ℹ️ Limite atteinte\n\nVotre plan FREE vous permet de réaliser un DUERP conforme. Vous avez utilisé l'ensemble des ${resourceName} inclus dans votre plan.\n\n👉 Passez au plan ${upgradePlan ? PLAN_NAMES[upgradePlan] : 'STARTER'} pour accéder à ${limit === Infinity ? 'des limites illimitées' : 'des limites supérieures'}.`;
    }
    
    if (currentPlan === 'starter') {
      if (resource === 'workUnits') {
        return `ℹ️ Structuration avancée disponible\n\nVotre plan STARTER est conçu pour les TPE. Les unités de travail permettent une structuration plus fine et mieux défendable en cas de contrôle.\n\n👉 Avec le plan ${upgradePlan ? PLAN_NAMES[upgradePlan] : 'BUSINESS'}, vous pourrez :\n• Créer jusqu'à ${limit === Infinity ? 'un nombre illimité' : limit} d'unités de travail\n• Bénéficier de l'assistance IA\n• Importer des DUERP existants`;
      }
      return `ℹ️ Limite atteinte\n\nVotre plan STARTER vous permet de gérer efficacement votre DUERP. Vous avez utilisé l'ensemble des ${resourceName} inclus.\n\n👉 Passez au plan ${upgradePlan ? PLAN_NAMES[upgradePlan] : 'BUSINESS'} pour accéder à ${limit === Infinity ? 'des limites illimitées' : 'des limites supérieures'}.`;
    }
    
    if (currentPlan === 'business') {
      return `ℹ️ Limite atteinte\n\nVotre plan BUSINESS offre une structuration complète pour votre DUERP. Vous avez utilisé l'ensemble des ${resourceName} inclus.\n\n👉 Le plan ${upgradePlan ? PLAN_NAMES[upgradePlan] : 'PREMIUM'} vous permet ${limit === Infinity ? 'des limites illimitées' : 'd\'étendre vos limites'} et d'accéder à un support prioritaire.`;
    }
    
    // Plan Premium - pas d'upsell, juste information
    return `ℹ️ Limite atteinte\n\nVous avez utilisé l'ensemble des ${resourceName} de votre plan. Contactez le support pour discuter d'une extension personnalisée.`;
  },
  
  feature_not_available: (feature: string, currentPlan: Plan, requiredPlan: Plan) => {
    if (feature === 'ia' && (currentPlan === 'free' || currentPlan === 'starter')) {
      return `🔒 Fonctionnalité IA non disponible\n\nL'assistance IA (suggestions de risques, reformulation) n'est pas disponible dans votre plan. Avec le plan ${PLAN_NAMES[requiredPlan]}, vous pourrez bénéficier de l'assistance IA pour gagner du temps tout en restant décisionnaire.\n\n👉 Passez au plan ${PLAN_NAMES[requiredPlan]} pour bénéficier :\n• de suggestions de risques pertinentes (${PLAN_FEATURES[requiredPlan].maxAISuggestionsRisks}/mois)\n• de reformulation illimitée pour améliorer vos descriptions\n• d'une assistance intelligente non décisionnaire`;
    }
    if (feature === 'import') {
      return `🔒 Import de DUERP existant non disponible\n\nL'import de DUERP (PDF/Word/Excel) est disponible à partir du plan ${PLAN_NAMES[requiredPlan]}. Cette fonctionnalité vous permet de reprendre votre DUERP existant sans ressaisir toutes les données.\n\n👉 Passez au plan ${PLAN_NAMES[requiredPlan]} pour bénéficier de l'import avec extraction IA.`;
    }
    return `La fonctionnalité "${feature}" n'est pas disponible dans le plan ${PLAN_NAMES[currentPlan]}. Passez au plan ${PLAN_NAMES[requiredPlan]} pour y accéder.`;
  },
};

