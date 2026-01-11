import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calcule le score de risque F×P×G
 * Note: La maîtrise (M) n'est pas utilisée dans le calcul du score selon le référentiel DUERP propriétaire
 * La maîtrise est utilisée pour déterminer les mesures de prévention, pas le score initial
 */
export function calculateRiskScore(
  frequency: number,
  probability: number,
  severity: number,
  control?: number // Gardé pour compatibilité mais non utilisé dans le calcul
): number {
  return frequency * probability * severity;
}

/**
 * Détermine le niveau de priorité basé sur le score de risque (F×P×G)
 * Score max: 64 (4×4×4)
 * Seuils ajustés pour le nouveau calcul sans maîtrise
 */
export function getPriorityLevel(riskScore: number): 'faible' | 'à_améliorer' | 'prioritaire' {
  if (riskScore <= 8) {
    return 'faible';
  } else if (riskScore <= 32) {
    return 'à_améliorer';
  } else {
    return 'prioritaire';
  }
}
