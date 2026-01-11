import { redirect } from 'next/navigation';

/**
 * Redirection vers la page de confirmation principale
 * URL alternative pour la compatibilité avec Brevo
 */
export default function WaitlistConfirmedPage() {
  redirect('/confirmation');
}


