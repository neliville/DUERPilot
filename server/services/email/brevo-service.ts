/**
 * Service central d'envoi d'emails via Brevo
 * 
 * Ce service gère :
 * - L'envoi direct via Brevo API (templates transactionnels)
 * - Le routage vers n8n (workflows avancés)
 * - Le logging de tous les envois
 * - Le respect des préférences utilisateur (RGPD)
 */

import { prisma } from '@/lib/db';
import { EmailTemplate, EMAIL_TEMPLATES, getTemplateConfig, isValidTemplate } from './templates';
import { getStandardEmailConfig } from './config';

export interface SendEmailParams {
  templateId: EmailTemplate;
  to: string;
  variables: Record<string, any>;
  tenantId?: string;
  userId?: string;
  scheduledAt?: Date; // Pour emails différés
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  workflow?: string;
  blocked?: boolean;
  reason?: string;
  error?: string;
}

/**
 * Fonction principale d'envoi d'email transactionnel
 * 
 * Vérifie les préférences utilisateur, route vers Brevo ou n8n,
 * et log tous les envois pour traçabilité RGPD.
 */
export async function sendTransactionalEmail(
  params: SendEmailParams
): Promise<SendEmailResult> {
  // Validation du template
  if (!isValidTemplate(params.templateId)) {
    throw new Error(`Template invalide: ${params.templateId}`);
  }

  const template = getTemplateConfig(params.templateId);

  // 1. Vérifier préférences utilisateur (RGPD)
  if (params.userId) {
    const prefs = await prisma.emailPreferences.findUnique({
      where: { userId: params.userId },
    });

    // Si désabonné de tout (sauf transactionnels légaux)
    if (prefs?.unsubscribedAll && !template.alwaysSend) {
      console.log(`Email ${params.templateId} bloqué (unsubscribed)`);
      
      // Logger le blocage
      await prisma.emailLog.create({
        data: {
          tenantId: params.tenantId,
          userId: params.userId,
          email: params.to,
          templateId: params.templateId,
          category: template.category,
          variables: params.variables,
          status: 'blocked',
          error: 'User unsubscribed from all emails',
        },
      });

      return { success: false, blocked: true, reason: 'unsubscribed' };
    }

    // Vérifier catégorie spécifique
    if (template.category === 'marketing' && !prefs?.marketingEmails) {
      await prisma.emailLog.create({
        data: {
          tenantId: params.tenantId,
          userId: params.userId,
          email: params.to,
          templateId: params.templateId,
          category: template.category,
          variables: params.variables,
          status: 'blocked',
          error: 'Marketing emails disabled',
        },
      });

      return { success: false, blocked: true, reason: 'marketing_disabled' };
    }

    if (template.category === 'product' && !prefs?.productUpdates) {
      await prisma.emailLog.create({
        data: {
          tenantId: params.tenantId,
          userId: params.userId,
          email: params.to,
          templateId: params.templateId,
          category: template.category,
          variables: params.variables,
          status: 'blocked',
          error: 'Product updates disabled',
        },
      });

      return { success: false, blocked: true, reason: 'product_updates_disabled' };
    }

    // Vérifier plan requis (si défini)
    if (template.planRequired) {
      const user = await prisma.userProfile.findUnique({
        where: { id: params.userId },
        select: { plan: true },
      });

      if (!user || !template.planRequired.includes(user.plan)) {
        await prisma.emailLog.create({
          data: {
            tenantId: params.tenantId,
            userId: params.userId,
            email: params.to,
            templateId: params.templateId,
            category: template.category,
            variables: params.variables,
            status: 'blocked',
            error: `Plan required: ${template.planRequired.join(', ')}`,
          },
        });

        return { success: false, blocked: true, reason: 'plan_required' };
      }
    }
  }

  // 2. Router vers Brevo ou n8n
  if (template.useN8n) {
    return await triggerN8nWorkflow(params, template);
  } else {
    return await sendViaBrevo(params, template);
  }
}

/**
 * Envoi direct via Brevo API (Templates transactionnels)
 * 
 * Utilise l'API Brevo pour envoyer des emails transactionnels via templates.
 * Le FROM et REPLY_TO doivent être configurés dans les templates Brevo.
 * 
 * IMPORTANT : Pour garantir la délivrabilité :
 * - FROM doit être configuré dans Brevo : noreply@duerpilot.fr
 * - REPLY_TO doit être configuré dans Brevo : support@duerpilot.fr
 * - Ne pas surcharger ces valeurs dans le code (laisser Brevo les gérer)
 */
async function sendViaBrevo(
  params: SendEmailParams,
  template: ReturnType<typeof getTemplateConfig>
): Promise<SendEmailResult> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  
  if (!BREVO_API_KEY) {
    const error = 'BREVO_API_KEY non configuré dans les variables d\'environnement';
    console.error(`❌ [Email ${params.templateId}] ${error}`);
    throw new Error(error);
  }

  // Vérifier que les variables d'environnement sont correctement configurées
  const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@duerpilot.fr';
  const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@duerpilot.fr';

  // Validation : s'assurer qu'aucune adresse Gmail n'est utilisée
  if (EMAIL_FROM.includes('gmail.com') || EMAIL_REPLY_TO.includes('gmail.com')) {
    const error = `❌ [Email ${params.templateId}] Configuration email invalide : utilisation d'une adresse Gmail détectée (FROM: ${EMAIL_FROM}, REPLY_TO: ${EMAIL_REPLY_TO}). Utilisez uniquement noreply@duerpilot.fr et support@duerpilot.fr`;
    console.error(error);
    throw new Error('Configuration email invalide : adresse Gmail détectée');
  }

  try {
    // Configuration email standard pour référence (utilisée uniquement pour logs)
    const emailConfig = getStandardEmailConfig();

    console.log(`📧 [Email ${params.templateId}] Envoi à ${params.to} via template Brevo #${template.brevoTemplateId}`);
    console.log(`   FROM (configuré dans Brevo): ${emailConfig.from.email}`);
    console.log(`   REPLY_TO (configuré dans Brevo): ${emailConfig.replyTo.email}`);

    // Utilisation de l'API Brevo pour templates transactionnels
    // Le FROM et REPLY_TO sont configurés dans les templates Brevo, pas dans le code
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Le sender est défini dans le template Brevo (noreply@duerpilot.fr)
        // Ne pas surcharger ici pour laisser Brevo utiliser la config du template
        sender: {
          email: emailConfig.from.email,
          name: emailConfig.from.name,
        },
        // IMPORTANT : Ne pas définir replyTo ici pour laisser Brevo utiliser la config du template
        // Le REPLY_TO doit être configuré dans chaque template Brevo : support@duerpilot.fr
        // Si on définit replyTo ici, cela surcharge la config du template
        // replyTo: {
        //   email: emailConfig.replyTo.email,
        //   name: emailConfig.replyTo.name,
        // },
        to: [{ email: params.to }],
        templateId: template.brevoTemplateId,
        params: params.variables,
        // Si email différé
        ...(params.scheduledAt && {
          scheduledAt: params.scheduledAt.toISOString(),
        }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      const errorMessage = `Brevo API error ${response.status}: ${errorData.message || errorData.error || JSON.stringify(errorData)}`;
      
      console.error(`❌ [Email ${params.templateId}] Échec envoi à ${params.to}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      // Logger l'erreur dans la base
      await prisma.emailLog.create({
        data: {
          tenantId: params.tenantId,
          userId: params.userId,
          email: params.to,
          templateId: params.templateId,
          category: template.category,
          variables: params.variables,
          status: 'failed',
          error: errorMessage,
        },
      });

      throw new Error(errorMessage);
    }

    const data = await response.json();
    const messageId = data.messageId || String(data.id) || null;

    console.log(`✅ [Email ${params.templateId}] Email envoyé avec succès à ${params.to} (messageId: ${messageId})`);

    // Logger le succès
    await prisma.emailLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        email: params.to,
        templateId: params.templateId,
        category: template.category,
        variables: params.variables,
        status: 'sent',
        brevoMessageId: messageId,
      },
    });

    return { success: true, messageId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`❌ [Email ${params.templateId}] Erreur critique lors de l'envoi à ${params.to}:`, {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Logger l'erreur dans la base
    await prisma.emailLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        email: params.to,
        templateId: params.templateId,
        category: template.category,
        variables: params.variables,
        status: 'failed',
        error: errorMessage,
      },
    }).catch((logError) => {
      // Si même le log échoue, on log dans la console
      console.error('❌ Impossible de logger l\'erreur email dans la base:', logError);
    });

    return { success: false, error: errorMessage };
  }
}

/**
 * Déclenchement d'un workflow n8n
 */
async function triggerN8nWorkflow(
  params: SendEmailParams,
  template: ReturnType<typeof getTemplateConfig>
): Promise<SendEmailResult> {
  if (!template.n8nWebhookUrl) {
    throw new Error(`n8n webhook URL non configurée pour template ${params.templateId}`);
  }

  try {
    const response = await fetch(template.n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: params.templateId,
        to: params.to,
        variables: params.variables,
        tenantId: params.tenantId,
        userId: params.userId,
        scheduledAt: params.scheduledAt?.toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`n8n webhook error: ${response.status} - ${errorData}`);
    }

    // Logger le déclenchement (n8n gérera l'envoi réel)
    await prisma.emailLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        email: params.to,
        templateId: params.templateId,
        category: template.category,
        variables: params.variables,
        status: 'sent', // n8n va gérer l'envoi
        error: 'Triggered via n8n',
      },
    });

    return { success: true, workflow: 'triggered' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Logger l'erreur
    await prisma.emailLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        email: params.to,
        templateId: params.templateId,
        category: template.category,
        variables: params.variables,
        status: 'failed',
        error: `n8n trigger failed: ${errorMessage}`,
      },
    });

    console.error(`Erreur déclenchement n8n ${params.templateId} à ${params.to}:`, error);
    return { success: false, error: errorMessage };
  }
}

