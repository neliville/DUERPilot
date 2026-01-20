/**
 * Configuration des templates email Brevo
 * 
 * Chaque template est identifié par un ID unique dans Brevo
 * et contient la configuration de routage (Brevo direct ou n8n)
 */

export interface EmailTemplateConfig {
  brevoTemplateId: number;
  category: 'transactional' | 'marketing' | 'system' | 'product';
  alwaysSend: boolean; // Légalement requis (ne peut pas être désactivé)
  useN8n: boolean; // Si true, route vers n8n au lieu de Brevo direct
  n8nWebhookUrl?: string; // URL webhook n8n si useN8n = true
  variables: string[]; // Liste des variables attendues
  planRequired?: string[]; // Plans autorisés (si défini)
}

export const EMAIL_TEMPLATES: Record<string, EmailTemplateConfig> = {
  // P0 - CRITIQUES (Brevo direct)
  account_activation: {
    brevoTemplateId: 2, // ID du template Brevo pour account_activation
    category: 'transactional',
    alwaysSend: true, // Légalement requis
    useN8n: false,
    variables: [
      'activation_code', // Code à 6 chiffres
      'support_email', // Email support
      'privacy_policy_url', // URL politique confidentialité
      'terms_url', // URL CGU
      'unsubscribe_url', // URL désabonnement (géré par Brevo)
    ],
  },
  password_reset: {
    brevoTemplateId: 3, // TODO: Mettre à jour avec l'ID réel du template password_reset dans Brevo
    category: 'transactional',
    alwaysSend: true,
    useN8n: false,
    variables: ['firstName', 'resetLink', 'expiresIn'],
  },
  duerp_generated: {
    brevoTemplateId: 4, // Décalé car password_reset utilise maintenant 3
    category: 'transactional',
    alwaysSend: false,
    useN8n: false,
    variables: ['companyName', 'duerpDownloadLink', 'generatedAt'],
  },
  quota_exceeded_blocking: {
    brevoTemplateId: 5, // Décalé car duerp_generated utilise maintenant 4
    category: 'transactional',
    alwaysSend: true,
    useN8n: false,
    variables: ['quotaType', 'currentPlan', 'upgradeLink'],
  },
  plan_limit_warning: {
    brevoTemplateId: 8, // Warning 80% ou 90%
    category: 'system',
    alwaysSend: false,
    useN8n: false,
    variables: [
      'userName',
      'featureName',
      'feature',
      'limit',
      'current',
      'percentage',
      'threshold',
    ],
  },
  plan_limit_exceeded: {
    brevoTemplateId: 9, // Dépassement 100%
    category: 'transactional',
    alwaysSend: true,
    useN8n: false,
    variables: [
      'userName',
      'featureName',
      'feature',
      'limit',
      'current',
    ],
  },
  
  // P1 - BUSINESS (Brevo direct)
  duerp_annual_reminder: {
    brevoTemplateId: 6, // Décalé
    category: 'transactional',
    alwaysSend: false,
    useN8n: false,
    variables: ['companyName', 'lastUpdateDate', 'dashboardLink'],
  },
  quota_warning: {
    brevoTemplateId: 7, // Décalé
    category: 'system',
    alwaysSend: false,
    useN8n: false,
    variables: ['quotaType', 'percentUsed', 'currentPlan', 'upgradeLink'],
  },
  payment_failed: {
    brevoTemplateId: 8, // Décalé
    category: 'transactional',
    alwaysSend: true,
    useN8n: false,
    variables: ['amount', 'nextRetryDate', 'updatePaymentLink'],
  },
  plan_upgraded: {
    brevoTemplateId: 9, // Décalé
    category: 'transactional',
    alwaysSend: false,
    useN8n: false,
    variables: ['newPlan', 'newFeatures', 'dashboardLink'],
  },
  
  // P2 - ADOPTION (n8n orchestration)
  ai_suggestions_available: {
    brevoTemplateId: 9,
    category: 'product',
    alwaysSend: false,
    useN8n: true,
    n8nWebhookUrl: process.env.N8N_WEBHOOK_AI_SUGGESTIONS,
    variables: ['suggestionsCount', 'riskContext', 'viewLink'],
  },
  import_success: {
    brevoTemplateId: 10,
    category: 'product',
    alwaysSend: false,
    useN8n: true,
    n8nWebhookUrl: process.env.N8N_WEBHOOK_IMPORT_ONBOARDING,
    variables: ['fileName', 'risksImported', 'nextStepsLink'],
  },
  import_needs_validation: {
    brevoTemplateId: 11,
    category: 'system',
    alwaysSend: false,
    useN8n: true,
    n8nWebhookUrl: process.env.N8N_WEBHOOK_IMPORT_VALIDATION,
    variables: ['fileName', 'pendingSince', 'validateLink'],
  },
  
  // P3 - AVANCÉ (n8n orchestration + conditions)
  ai_advanced_insight: {
    brevoTemplateId: 12,
    category: 'product',
    alwaysSend: false,
    useN8n: true,
    n8nWebhookUrl: process.env.N8N_WEBHOOK_AI_INSIGHTS,
    variables: ['insightType', 'summary', 'dashboardLink'],
    planRequired: ['pro', 'expert'], // Vérifier dans n8n
  },
  monthly_qse_summary: {
    brevoTemplateId: 13,
    category: 'product',
    alwaysSend: false,
    useN8n: true,
    n8nWebhookUrl: process.env.N8N_WEBHOOK_MONTHLY_DIGEST,
    variables: ['month', 'risksCreated', 'actionsCompleted', 'reportLink'],
    planRequired: ['essentiel', 'pro', 'expert'],
  },
  inactivity_nudge: {
    brevoTemplateId: 14,
    category: 'marketing',
    alwaysSend: false,
    useN8n: true,
    n8nWebhookUrl: process.env.N8N_WEBHOOK_INACTIVITY,
    variables: ['daysSinceLastLogin', 'featureHighlight', 'loginLink'],
  },
} as const;

export type EmailTemplate = keyof typeof EMAIL_TEMPLATES;

/**
 * Vérifie si un template existe
 */
export function isValidTemplate(templateId: string): templateId is EmailTemplate {
  return templateId in EMAIL_TEMPLATES;
}

/**
 * Récupère la configuration d'un template
 */
export function getTemplateConfig(templateId: EmailTemplate): EmailTemplateConfig {
  const config = EMAIL_TEMPLATES[templateId];
  if (!config) {
    throw new Error(`Template ${templateId} not found`);
  }
  return config;
}

