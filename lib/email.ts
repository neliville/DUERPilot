/**
 * Utilitaires email
 * 
 * NOTE: L'envoi d'emails est maintenant géré par le service Brevo
 * via server/services/email/brevo-service.ts et les templates Brevo.
 * 
 * Ce fichier conserve uniquement les fonctions utilitaires.
 */

/**
 * Génère un code de vérification à 6 chiffres
 * 
 * Utilisé pour la vérification d'email via code OTP.
 * L'envoi de l'email se fait via le système Brevo (templates).
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

