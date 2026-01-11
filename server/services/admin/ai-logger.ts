/**
 * Service centralisé pour logger tous les appels IA
 * PRIORITÉ ABSOLUE : Suivi des coûts IA pour pilotage business
 */

import { prisma } from '@/lib/db';

export interface AIUsageLogData {
  tenantId: string;
  userId: string;
  companyId?: string;
  function: 'import' | 'cotation' | 'actions' | 'reformulation' | 'structuration' | 'enrichment';
  provider: 'openai' | 'anthropic';
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  confidence?: number;
  result?: 'validated' | 'rejected' | 'pending';
  metadata?: Record<string, any>;
}

/**
 * Coûts par token pour chaque modèle (en USD, convertis en EUR)
 * Taux de change approximatif : 1 USD = 0.92 EUR
 */
const AI_COSTS = {
  'openai': {
    'gpt-4o': {
      input: 2.50 / 1_000_000 * 0.92, // € par token
      output: 10.00 / 1_000_000 * 0.92,
    },
    'gpt-4-turbo': {
      input: 10.00 / 1_000_000 * 0.92,
      output: 30.00 / 1_000_000 * 0.92,
    },
  },
  'anthropic': {
    'claude-3-5-sonnet': {
      input: 3.00 / 1_000_000 * 0.92,
      output: 15.00 / 1_000_000 * 0.92,
    },
    'claude-3-opus': {
      input: 15.00 / 1_000_000 * 0.92,
      output: 75.00 / 1_000_000 * 0.92,
    },
  },
} as const;

/**
 * Calcule le coût estimé d'un appel IA
 */
export function calculateAICost(
  provider: 'openai' | 'anthropic',
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const providerCosts = AI_COSTS[provider];
  if (!providerCosts) {
    console.warn(`Provider ${provider} non reconnu, coût estimé à 0`);
    return 0;
  }

  const modelCosts = providerCosts[model as keyof typeof providerCosts] as { input: number; output: number } | undefined;
  if (!modelCosts) {
    console.warn(`Modèle ${model} non reconnu pour ${provider}, coût estimé à 0`);
    return 0;
  }

  const inputCost = (inputTokens || 0) * modelCosts.input;
  const outputCost = (outputTokens || 0) * modelCosts.output;
  return inputCost + outputCost;
}

/**
 * Log un appel IA dans la base de données
 */
export async function logAIUsage(data: AIUsageLogData): Promise<void> {
  try {
    await prisma.aIUsageLog.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        companyId: data.companyId || null,
        function: data.function,
        provider: data.provider,
        model: data.model,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        totalTokens: data.totalTokens,
        estimatedCost: data.estimatedCost,
        confidence: data.confidence || null,
        result: data.result || 'pending',
        metadata: data.metadata ? (data.metadata as any) : undefined,
      },
    });
  } catch (error) {
    // Ne pas faire échouer l'appel IA si le logging échoue
    console.error('Erreur lors du logging IA:', error);
  }
}

/**
 * Log un appel IA avec calcul automatique du coût
 */
export async function logAIUsageWithCost(
  data: Omit<AIUsageLogData, 'estimatedCost' | 'totalTokens'> & {
    totalTokens?: number;
  }
): Promise<void> {
  const totalTokens = data.totalTokens || (data.inputTokens + data.outputTokens);
  const estimatedCost = calculateAICost(
    data.provider,
    data.model,
    data.inputTokens,
    data.outputTokens
  );

  await logAIUsage({
    ...data,
    totalTokens,
    estimatedCost,
  });
}

/**
 * Met à jour le résultat d'un log IA (validated/rejected)
 */
export async function updateAIUsageResult(
  logId: string,
  result: 'validated' | 'rejected'
): Promise<void> {
  try {
    await prisma.aIUsageLog.update({
      where: { id: logId },
      data: { result },
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du résultat IA:', error);
  }
}

