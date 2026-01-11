/**
 * Utilitaires pour la gestion des erreurs avec distinction
 * entre erreurs réelles et limitations de plan
 */

import { TRPCClientErrorLike } from '@trpc/client';

/**
 * Détermine si une erreur est liée à une limitation de plan
 * (et donc ne doit pas être affichée comme une "erreur" destructive)
 */
export function isPlanLimitError(error: TRPCClientErrorLike<any> | Error | null): boolean {
  if (!error) return false;

  const errorMessage = error.message || '';
  const errorCode = 'code' in error ? error.code : null;

  // Codes d'erreur liés aux plans
  if (errorCode === 'FORBIDDEN' || errorCode === 'QUOTA_EXCEEDED') {
    return true;
  }

  // Mots-clés dans le message indiquant une limitation de plan
  const planKeywords = [
    'limite',
    'atteint',
    'plan',
    'quota',
    'méthode guidée',
    'méthode classique',
    'unité de travail',
    'entreprises',
    'sites',
    'assistance',
    'IA',
    'guided_ia',
    'classic',
  ];

  return planKeywords.some(keyword => 
    errorMessage.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * Détermine le titre approprié pour un toast selon le type d'erreur
 */
export function getErrorToastTitle(error: TRPCClientErrorLike<any> | Error | null): string {
  if (isPlanLimitError(error)) {
    return 'Information';
  }
  return 'Erreur';
}

/**
 * Détermine si un toast doit être destructif (rouge) ou informatif (bleu)
 */
export function shouldUseDestructiveVariant(error: TRPCClientErrorLike<any> | Error | null): boolean {
  return !isPlanLimitError(error);
}

