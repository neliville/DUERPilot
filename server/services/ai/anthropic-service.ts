/**
 * Service Anthropic (Claude) pour extraction complète et précise
 */

import Anthropic from '@anthropic-ai/sdk';
import { logAIUsageWithCost } from '@/server/services/admin/ai-logger';

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY n\'est pas définie dans les variables d\'environnement');
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

/**
 * Extrait la structure DUERP avec Claude Sonnet (extraction complète)
 */
export async function extractDuerpStructureWithClaude(
  text: string,
  format: 'pdf' | 'word' | 'excel' | 'csv',
  loggingContext?: {
    tenantId: string;
    userId: string;
    companyId?: string;
  }
): Promise<any> {
  const client = getAnthropicClient();

  const prompt = `Tu es un expert en sécurité au travail et en évaluation des risques professionnels. 
Tu dois extraire de manière COMPLÈTE et PRÉCISE la structure d'un document DUERP (Document Unique d'Évaluation des Risques Professionnels) depuis le texte suivant.

FORMAT DU DOCUMENT: ${format.toUpperCase()}

TEXTE À ANALYSER:
${text.substring(0, 100000)}${text.length > 100000 ? '\n\n[... texte tronqué ...]' : ''}

INSTRUCTIONS DÉTAILLÉES:

1. ENTREPRISE:
   - Nom/Raison sociale (recherche: "raison sociale", "entreprise", "société", "établissement")
   - SIRET (format: 14 chiffres, peut être avec espaces)
   - Adresse complète (rue, code postal, ville)
   - Effectif (nombre de salariés)

2. UNITÉS DE TRAVAIL:
   - Identifie TOUTES les unités de travail mentionnées
   - Pour chaque unité: nom, description, nombre de personnes exposées
   - Recherche: "unité de travail", "poste de travail", "atelier", "service", "département"

3. RISQUES PROFESSIONNELS:
   - Identifie TOUS les risques mentionnés
   - Pour chaque risque, extrais:
     * Danger (ex: "chute", "coupure", "brûlure", "TMS")
     * Situation dangereuse (description détaillée)
     * Personnes exposées
     * Cotation F×P×G×M (Fréquence, Probabilité, Gravité, Maîtrise) - valeurs 1 à 5
     * Mesures existantes
   - Associe chaque risque à une unité de travail si possible

4. MESURES DE PRÉVENTION:
   - Identifie toutes les mesures mentionnées
   - Classe-les par type: technique, organisationnelle, humaine
   - Associe-les aux risques concernés si possible

5. COTATIONS:
   - Si les cotations sont manquantes mais que tu peux les estimer à partir du contexte, propose-les
   - Sinon, laisse null

Retourne UNIQUEMENT un JSON valide avec cette structure exacte:
{
  "company": {
    "legalName": "string ou null",
    "siret": "string ou null",
    "address": "string ou null",
    "city": "string ou null",
    "postalCode": "string ou null",
    "employeeCount": "number ou null"
  },
  "workUnits": [
    {
      "name": "string",
      "description": "string ou null",
      "exposedCount": "number ou null"
    }
  ],
  "risks": [
    {
      "workUnitName": "string ou null",
      "hazard": "string",
      "dangerousSituation": "string ou null",
      "exposedPersons": "string ou null",
      "frequency": "number (1-5) ou null",
      "probability": "number (1-5) ou null",
      "severity": "number (1-5) ou null",
      "control": "number (1-5) ou null",
      "existingMeasures": "string ou null"
    }
  ],
  "measures": [
    {
      "description": "string",
      "type": "technique|organisationnelle|humaine ou null",
      "relatedRisk": "string ou null"
    }
  ],
  "confidence": "number (0-100)"
}

IMPORTANT: 
- Retourne UNIQUEMENT le JSON, sans texte avant ou après
- Sois EXHAUSTIF: identifie TOUS les éléments présents dans le document
- Si une information n'est pas trouvée, utilise null
- Le confidence doit refléter ta confiance dans l'extraction (0-100)
- Pour les cotations manquantes, essaie de les déduire du contexte si possible`;

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Réponse Claude invalide');
    }

    // Extraire le JSON de la réponse (peut contenir du texte avant/après)
    const text = content.text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Aucun JSON trouvé dans la réponse Claude');
    }

    const structure = JSON.parse(jsonMatch[0]);
    
    // Logger l'utilisation IA si contexte fourni
    if (loggingContext) {
      // Anthropic retourne les tokens dans usage
      const inputTokens = message.usage.input_tokens || 0;
      const outputTokens = message.usage.output_tokens || 0;
      
      await logAIUsageWithCost({
        tenantId: loggingContext.tenantId,
        userId: loggingContext.userId,
        companyId: loggingContext.companyId,
        function: 'import',
        provider: 'anthropic',
        model: 'claude-3-5-sonnet',
        inputTokens,
        outputTokens,
        confidence: typeof structure.confidence === 'number' ? Math.min(100, Math.max(0, structure.confidence)) : undefined,
      }).catch((err) => {
        console.error('Erreur lors du logging IA:', err);
      });
    }
    
    // Valider et nettoyer la structure
    return {
      company: structure.company || null,
      workUnits: Array.isArray(structure.workUnits) ? structure.workUnits : [],
      risks: Array.isArray(structure.risks) ? structure.risks : [],
      measures: Array.isArray(structure.measures) ? structure.measures : [],
      confidence: typeof structure.confidence === 'number' ? Math.min(100, Math.max(0, structure.confidence)) : 50,
    };
  } catch (error) {
    console.error('Erreur lors de l\'extraction Claude:', error);
    throw new Error(`Erreur extraction Claude: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

