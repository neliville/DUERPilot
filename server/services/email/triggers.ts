/**
 * Déclencheurs d'événements email
 * 
 * Centralise tous les appels d'envoi d'email depuis le backend.
 * Chaque fonction correspond à un événement métier spécifique.
 */

import { sendTransactionalEmail } from './brevo-service';
import { EMAIL_ADDRESSES } from './config';
import crypto from 'crypto';

/**
 * Génère un token d'activation sécurisé
 */
function generateActivationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Génère un token de réinitialisation de mot de passe
 */
function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Inscription utilisateur - Envoi email d'activation
 * 
 * Utilise le template Brevo avec code à 6 chiffres
 */
export async function onUserRegistered(user: {
  id: string;
  email: string;
  firstName?: string | null;
  tenantId: string;
  verificationCode?: string; // Code à 6 chiffres (requis)
}) {
  if (!user.verificationCode) {
    throw new Error('verificationCode est requis pour l\'activation de compte');
  }

  // URLs de configuration (depuis variables d'environnement ou valeurs par défaut)
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const supportEmail = EMAIL_ADDRESSES.REPLY_TO; // Utiliser l'adresse support centralisée
  const privacyPolicyUrl = process.env.PRIVACY_POLICY_URL || `${baseUrl}/legal/privacy`;
  const termsUrl = process.env.TERMS_URL || `${baseUrl}/legal/terms`;
  // unsubscribe_url est géré automatiquement par Brevo, mais on peut le passer pour cohérence
  const unsubscribeUrl = `${baseUrl}/settings/notifications`;

  return await sendTransactionalEmail({
    templateId: 'account_activation',
    to: user.email,
    userId: user.id,
    tenantId: user.tenantId,
    variables: {
      activation_code: user.verificationCode, // Code à 6 chiffres pour le template Brevo
      support_email: supportEmail,
      privacy_policy_url: privacyPolicyUrl,
      terms_url: termsUrl,
      unsubscribe_url: unsubscribeUrl,
    },
  });
}

/**
 * Réinitialisation de mot de passe
 */
export async function onPasswordReset(user: {
  id: string;
  email: string;
  firstName?: string | null;
  tenantId: string;
}) {
  const token = generateResetToken();
  const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

  return await sendTransactionalEmail({
    templateId: 'password_reset',
    to: user.email,
    userId: user.id,
    tenantId: user.tenantId,
    variables: {
      firstName: user.firstName || 'utilisateur',
      resetLink,
      expiresIn: '1 heure',
    },
  });
}

/**
 * DUERP généré - Notification de disponibilité
 */
export async function onDuerpGenerated(params: {
  companyName: string;
  duerpId: string;
  userId: string;
  email: string;
  tenantId: string;
}) {
  return await sendTransactionalEmail({
    templateId: 'duerp_generated',
    to: params.email,
    userId: params.userId,
    tenantId: params.tenantId,
    variables: {
      companyName: params.companyName,
      duerpDownloadLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/duerp/${params.duerpId}/download`,
      generatedAt: new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
  });
}

/**
 * Quota dépassé (bloquant) - Notification urgente
 */
export async function onQuotaExceeded(params: {
  userId: string;
  email: string;
  tenantId: string;
  quotaType: string;
  currentPlan: string;
}) {
  return await sendTransactionalEmail({
    templateId: 'quota_exceeded_blocking',
    to: params.email,
    userId: params.userId,
    tenantId: params.tenantId,
    variables: {
      quotaType: params.quotaType,
      currentPlan: params.currentPlan,
      upgradeLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings/billing`,
    },
  });
}

/**
 * Avertissement quota (80% atteint)
 */
export async function onQuotaWarning(params: {
  userId: string;
  email: string;
  tenantId: string;
  quotaType: string;
  percentUsed: number;
  currentPlan: string;
}) {
  return await sendTransactionalEmail({
    templateId: 'quota_warning',
    to: params.email,
    userId: params.userId,
    tenantId: params.tenantId,
    variables: {
      quotaType: params.quotaType,
      percentUsed: Math.round(params.percentUsed),
      currentPlan: params.currentPlan,
      upgradeLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings/billing`,
    },
  });
}

/**
 * Rappel annuel DUERP
 */
export async function onDuerpAnnualReminder(params: {
  userId: string;
  email: string;
  tenantId: string;
  companyName: string;
  lastUpdateDate: Date;
}) {
  return await sendTransactionalEmail({
    templateId: 'duerp_annual_reminder',
    to: params.email,
    userId: params.userId,
    tenantId: params.tenantId,
    variables: {
      companyName: params.companyName,
      lastUpdateDate: params.lastUpdateDate.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      dashboardLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard`,
    },
  });
}

/**
 * Échec de paiement
 */
export async function onPaymentFailed(params: {
  userId: string;
  email: string;
  tenantId: string;
  amount: number;
  nextRetryDate: Date;
}) {
  return await sendTransactionalEmail({
    templateId: 'payment_failed',
    to: params.email,
    userId: params.userId,
    tenantId: params.tenantId,
    variables: {
      amount: params.amount.toFixed(2).replace('.', ',') + ' €',
      nextRetryDate: params.nextRetryDate.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      updatePaymentLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings/billing`,
    },
  });
}

/**
 * Plan mis à niveau
 */
export async function onPlanUpgraded(params: {
  userId: string;
  email: string;
  tenantId: string;
  newPlan: string;
  newFeatures: string[];
}) {
  return await sendTransactionalEmail({
    templateId: 'plan_upgraded',
    to: params.email,
    userId: params.userId,
    tenantId: params.tenantId,
    variables: {
      newPlan: params.newPlan.charAt(0).toUpperCase() + params.newPlan.slice(1),
      newFeatures: params.newFeatures.join(', '),
      dashboardLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard`,
    },
  });
}

/**
 * Suggestions IA disponibles (via n8n)
 */
export async function onAISuggestionsAvailable(params: {
  userId: string;
  email: string;
  tenantId: string;
  suggestionsCount: number;
  riskContext: string;
  viewLink: string;
}) {
  return await sendTransactionalEmail({
    templateId: 'ai_suggestions_available',
    to: params.email,
    userId: params.userId,
    tenantId: params.tenantId,
    variables: {
      suggestionsCount: params.suggestionsCount,
      riskContext: params.riskContext,
      viewLink: params.viewLink,
    },
  });
}

/**
 * Import réussi (via n8n - séquence onboarding)
 */
export async function onImportSuccess(params: {
  userId: string;
  email: string;
  tenantId: string;
  fileName: string;
  risksImported: number;
  nextStepsLink: string;
}) {
  return await sendTransactionalEmail({
    templateId: 'import_success',
    to: params.email,
    userId: params.userId,
    tenantId: params.tenantId,
    variables: {
      fileName: params.fileName,
      risksImported: params.risksImported,
      nextStepsLink: params.nextStepsLink,
    },
  });
}

/**
 * Import nécessite validation (via n8n - relances)
 */
export async function onImportNeedsValidation(params: {
  userId: string;
  email: string;
  tenantId: string;
  fileName: string;
  pendingSince: Date;
  validateLink: string;
}) {
  const daysPending = Math.floor(
    (new Date().getTime() - params.pendingSince.getTime()) / (1000 * 60 * 60 * 24)
  );

  return await sendTransactionalEmail({
    templateId: 'import_needs_validation',
    to: params.email,
    userId: params.userId,
    tenantId: params.tenantId,
    variables: {
      fileName: params.fileName,
      pendingSince: `${daysPending} jour${daysPending > 1 ? 's' : ''}`,
      validateLink: params.validateLink,
    },
  });
}

/**
 * Insight IA avancé (via n8n - Pro/Expert uniquement)
 */
export async function onAIAdvancedInsight(params: {
  userId: string;
  email: string;
  tenantId: string;
  insightType: string;
  summary: string;
  dashboardLink: string;
}) {
  return await sendTransactionalEmail({
    templateId: 'ai_advanced_insight',
    to: params.email,
    userId: params.userId,
    tenantId: params.tenantId,
    variables: {
      insightType: params.insightType,
      summary: params.summary,
      dashboardLink: params.dashboardLink,
    },
  });
}

/**
 * Synthèse mensuelle QSE (via n8n - batch mensuel)
 */
export async function onMonthlyQSESummary(params: {
  userId: string;
  email: string;
  tenantId: string;
  month: string;
  risksCreated: number;
  actionsCompleted: number;
  reportLink: string;
}) {
  return await sendTransactionalEmail({
    templateId: 'monthly_qse_summary',
    to: params.email,
    userId: params.userId,
    tenantId: params.tenantId,
    variables: {
      month: params.month,
      risksCreated: params.risksCreated,
      actionsCompleted: params.actionsCompleted,
      reportLink: params.reportLink,
    },
  });
}

/**
 * Rappel d'inactivité (via n8n - conversion)
 */
export async function onInactivityNudge(params: {
  userId: string;
  email: string;
  tenantId: string;
  daysSinceLastLogin: number;
  featureHighlight: string;
  loginLink: string;
}) {
  return await sendTransactionalEmail({
    templateId: 'inactivity_nudge',
    to: params.email,
    userId: params.userId,
    tenantId: params.tenantId,
    variables: {
      daysSinceLastLogin: params.daysSinceLastLogin,
      featureHighlight: params.featureHighlight,
      loginLink: params.loginLink,
    },
  });
}

