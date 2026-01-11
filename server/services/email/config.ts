/**
 * Configuration centralisée des adresses email
 * 
 * Ce module définit de manière stricte et professionnelle :
 * - FROM : Adresse d'expéditeur pour tous les emails automatiques
 * - REPLY_TO : Adresse de réponse pour tous les emails
 * - CONTACT : Adresse pour les communications commerciales/externes
 * 
 * RÈGLES MÉTIER :
 * 1. noreply@duerpilot.fr → FROM pour tous les emails automatiques
 * 2. support@duerpilot.fr → REPLY_TO pour tous les emails, adresse de support
 * 3. contact@duerpilot.fr → Contact commercial uniquement (formulaires, partenariats)
 */

/**
 * Adresses email de l'application
 */
export const EMAIL_ADDRESSES = {
  /**
   * Adresse d'expéditeur (FROM) pour tous les emails automatiques
   * 
   * Utilisée pour :
   * - Activation de compte
   * - Réinitialisation de mot de passe
   * - Notifications automatiques
   * - Alertes système
   * 
   * ⚠️ Aucune réponse utilisateur ne doit être attendue sur cette adresse
   */
  FROM: process.env.EMAIL_FROM || 'noreply@duerpilot.fr',

  /**
   * Adresse de réponse (REPLY-TO) pour tous les emails
   * 
   * Utilisée comme :
   * - Adresse de réponse par défaut
   * - Adresse de support affichée dans l'application
   * - Adresse dans les signatures email
   * - Support client et fonctionnel
   */
  REPLY_TO: process.env.EMAIL_REPLY_TO || 'support@duerpilot.fr',

  /**
   * Adresse de contact commercial et relation externe
   * 
   * Utilisée uniquement pour :
   * - Formulaire de contact du site vitrine
   * - Demandes commerciales
   * - Partenariats
   * - Presse / organismes externes
   * 
   * ⚠️ Ne jamais utiliser pour les emails automatiques
   * ⚠️ Ne pas utiliser pour le support technique
   */
  CONTACT: process.env.EMAIL_CONTACT || 'contact@duerpilot.fr',
} as const;

/**
 * Nom d'affichage pour l'expéditeur
 */
export const EMAIL_SENDER_NAME = process.env.EMAIL_SENDER_NAME || 'DUERPilot';

/**
 * Configuration complète pour l'envoi d'emails
 */
export interface EmailConfig {
  from: {
    email: string;
    name: string;
  };
  replyTo: {
    email: string;
    name: string;
  };
}

/**
 * Retourne la configuration email standard pour tous les emails automatiques
 * 
 * FROM = noreply@duerpilot.fr
 * REPLY_TO = support@duerpilot.fr
 */
export function getStandardEmailConfig(): EmailConfig {
  return {
    from: {
      email: EMAIL_ADDRESSES.FROM,
      name: EMAIL_SENDER_NAME,
    },
    replyTo: {
      email: EMAIL_ADDRESSES.REPLY_TO,
      name: 'Support DUERPilot',
    },
  };
}

/**
 * Retourne la configuration email pour les communications commerciales
 * 
 * FROM = contact@duerpilot.fr
 * REPLY_TO = contact@duerpilot.fr
 */
export function getCommercialEmailConfig(): EmailConfig {
  return {
    from: {
      email: EMAIL_ADDRESSES.CONTACT,
      name: 'DUERPilot - Contact',
    },
    replyTo: {
      email: EMAIL_ADDRESSES.CONTACT,
      name: 'DUERPilot - Contact',
    },
  };
}

/**
 * Valide que les adresses email sont correctement configurées
 */
export function validateEmailConfig(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Vérifier que FROM est une adresse noreply
  if (!EMAIL_ADDRESSES.FROM.includes('noreply') && !EMAIL_ADDRESSES.FROM.includes('no-reply')) {
    errors.push(
      `EMAIL_FROM doit être une adresse noreply (actuel: ${EMAIL_ADDRESSES.FROM})`
    );
  }

  // Vérifier que REPLY_TO est une adresse support
  if (!EMAIL_ADDRESSES.REPLY_TO.includes('support')) {
    errors.push(
      `EMAIL_REPLY_TO doit être une adresse support (actuel: ${EMAIL_ADDRESSES.REPLY_TO})`
    );
  }

  // Vérifier qu'aucune adresse Gmail n'est utilisée
  if (EMAIL_ADDRESSES.FROM.includes('gmail.com')) {
    errors.push(
      `EMAIL_FROM ne doit PAS être une adresse Gmail (actuel: ${EMAIL_ADDRESSES.FROM}). Utilisez noreply@duerpilot.fr`
    );
  }
  if (EMAIL_ADDRESSES.REPLY_TO.includes('gmail.com')) {
    errors.push(
      `EMAIL_REPLY_TO ne doit PAS être une adresse Gmail (actuel: ${EMAIL_ADDRESSES.REPLY_TO}). Utilisez support@duerpilot.fr`
    );
  }

  // Vérifier que les adresses sont des emails valides
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(EMAIL_ADDRESSES.FROM)) {
    errors.push(`EMAIL_FROM n'est pas une adresse email valide: ${EMAIL_ADDRESSES.FROM}`);
  }
  if (!emailRegex.test(EMAIL_ADDRESSES.REPLY_TO)) {
    errors.push(`EMAIL_REPLY_TO n'est pas une adresse email valide: ${EMAIL_ADDRESSES.REPLY_TO}`);
  }
  if (!emailRegex.test(EMAIL_ADDRESSES.CONTACT)) {
    errors.push(`EMAIL_CONTACT n'est pas une adresse email valide: ${EMAIL_ADDRESSES.CONTACT}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Affiche un avertissement si la configuration n'est pas conforme
 */
export function warnIfInvalidConfig(): void {
  const validation = validateEmailConfig();
  if (!validation.valid) {
    console.warn('⚠️  Configuration email non conforme:');
    validation.errors.forEach((error) => {
      console.warn(`  - ${error}`);
    });
    console.warn('\n💡 Utilisez les variables d\'environnement pour configurer:');
    console.warn('  - EMAIL_FROM=noreply@duerpilot.fr');
    console.warn('  - EMAIL_REPLY_TO=support@duerpilot.fr');
    console.warn('  - EMAIL_CONTACT=contact@duerpilot.fr\n');
  }
}

// Avertir au chargement du module si la configuration est invalide
if (process.env.NODE_ENV !== 'test') {
  warnIfInvalidConfig();
}

