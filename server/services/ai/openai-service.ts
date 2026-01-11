/**
 * Service OpenAI pour extraction et suggestions IA
 * 
 * IMPORTANT : L'IA est strictement assistive et non décisionnaire.
 * Toutes les suggestions doivent être validées par l'utilisateur.
 */

import OpenAI from 'openai';
import { logAIUsageWithCost } from '@/server/services/admin/ai-logger';
import { PrismaClient } from '@prisma/client';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY n\'est pas définie dans les variables d\'environnement');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Extrait la structure DUERP depuis un texte avec GPT-4
 */
export async function extractDuerpStructureWithGPT4(
  text: string,
  format: 'pdf' | 'word' | 'excel' | 'csv',
  loggingContext?: {
    tenantId: string;
    userId: string;
    companyId?: string;
  }
): Promise<any> {
  const client = getOpenAIClient();

  const prompt = `Tu es un expert en sécurité au travail et en évaluation des risques professionnels. 
Tu dois extraire la structure d'un document DUERP (Document Unique d'Évaluation des Risques Professionnels) depuis le texte suivant.

FORMAT DU DOCUMENT: ${format.toUpperCase()}

TEXTE À ANALYSER:
${text.substring(0, 15000)}${text.length > 15000 ? '\n\n[... texte tronqué ...]' : ''}

INSTRUCTIONS:
1. Identifie les informations de l'entreprise (nom, SIRET, adresse, effectif)
2. Identifie les unités de travail (nom, description, nombre de personnes exposées)
3. Identifie les risques professionnels avec leurs cotations F×P×G×M (Fréquence, Probabilité, Gravité, Maîtrise)
4. Identifie les mesures de prévention existantes
5. Pour chaque risque, associe-le à une unité de travail si possible

Retourne UNIQUEMENT un JSON valide avec cette structure exacte:
{
  "company": {
    "legalName": "string ou null",
    "siret": "string ou null",
    "address": "string ou null",
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
      "type": "string ou null"
    }
  ],
  "confidence": "number (0-100)"
}

IMPORTANT: 
- Retourne UNIQUEMENT le JSON, sans texte avant ou après
- Si une information n'est pas trouvée, utilise null
- Pour les cotations, utilise des nombres entre 1 et 5
- Le confidence doit refléter ta confiance dans l'extraction (0-100)`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en extraction de données structurées depuis des documents DUERP. Tu retournes uniquement du JSON valide.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Aucune réponse de GPT-4');
    }

    // Logger l'utilisation IA si contexte fourni
    if (loggingContext) {
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;
      
      await logAIUsageWithCost({
        tenantId: loggingContext.tenantId,
        userId: loggingContext.userId,
        companyId: loggingContext.companyId,
        function: 'import',
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens,
        outputTokens,
        confidence: undefined, // Sera calculé après parsing
      }).catch((err) => {
        console.error('Erreur lors du logging IA:', err);
        // Ne pas faire échouer l'extraction si le logging échoue
      });
    }

    // Parser le JSON
    const structure = JSON.parse(content);
    
    // Valider et nettoyer la structure
    const result = {
      company: structure.company || null,
      workUnits: Array.isArray(structure.workUnits) ? structure.workUnits : [],
      risks: Array.isArray(structure.risks) ? structure.risks : [],
      measures: Array.isArray(structure.measures) ? structure.measures : [],
      confidence: typeof structure.confidence === 'number' ? structure.confidence : 50,
    };

    // Mettre à jour la confiance dans le log si possible
    if (loggingContext && result.confidence) {
      // Note: On ne peut pas mettre à jour le log ici car on n'a pas l'ID
      // Le logging se fait avant avec confidence undefined, puis on pourrait faire un update
      // Pour simplifier, on garde le logging initial
    }

    return result;
  } catch (error) {
    console.error('Erreur lors de l\'extraction GPT-4:', error);
    throw new Error(`Erreur extraction GPT-4: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Enrichit un DUERP importé avec des suggestions IA
 */
export async function enrichDuerpWithGPT4(
  structure: any,
  sector?: string,
  loggingContext?: {
    tenantId: string;
    userId: string;
    companyId?: string;
  }
): Promise<{
  suggestedRisks: Array<{ hazard: string; description: string; workUnit?: string }>;
  suggestedMeasures: Array<{ riskId: string; description: string; type: string }>;
  regulatoryUpdates: Array<{ description: string; action: string }>;
}> {
  const client = getOpenAIClient();

  const prompt = `Tu es un expert en sécurité au travail. 
Analyse ce DUERP importé et propose des enrichissements.

STRUCTURE DUERP:
${JSON.stringify(structure, null, 2)}

SECTEUR D'ACTIVITÉ: ${sector || 'Non spécifié'}

Tâches:
1. Identifie les risques potentiellement manquants pour ce secteur
2. Propose des mesures de prévention pour les risques à haute criticité
3. Identifie les mises à jour réglementaires récentes (2023-2025) applicables

Retourne UNIQUEMENT un JSON valide avec cette structure:
{
  "suggestedRisks": [
    {
      "hazard": "string",
      "description": "string",
      "workUnit": "string ou null"
    }
  ],
  "suggestedMeasures": [
    {
      "riskId": "string (référence au risque)",
      "description": "string",
      "type": "technique|organisationnelle|humaine"
    }
  ],
  "regulatoryUpdates": [
    {
      "description": "string",
      "action": "string"
    }
  ]
}`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en sécurité au travail qui propose des enrichissements pour les DUERP.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Aucune réponse de GPT-4');
    }

    // Logger l'utilisation IA si contexte fourni
    if (loggingContext) {
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;
      
      await logAIUsageWithCost({
        tenantId: loggingContext.tenantId,
        userId: loggingContext.userId,
        companyId: loggingContext.companyId,
        function: 'enrichment',
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens,
        outputTokens,
      }).catch((err) => {
        console.error('Erreur lors du logging IA:', err);
      });
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Erreur lors de l\'enrichissement GPT-4:', error);
    return {
      suggestedRisks: [],
      suggestedMeasures: [],
      regulatoryUpdates: [],
    };
  }
}

/**
 * Suggère des risques manquants basés sur les référentiels sectoriels
 * L'IA utilise les référentiels comme contexte mais ne décide jamais
 */
export async function suggestRisksFromSectorReference(
  sectorCode: string,
  existingRisks: Array<{ intitule: string; categoriePrincipale?: string }>,
  workUnitContext?: {
    name: string;
    description?: string;
    activity?: string;
  },
  prisma?: PrismaClient,
  loggingContext?: {
    tenantId: string;
    userId: string;
    companyId?: string;
  }
): Promise<{
  suggestedRisks: Array<{
    riskId: string;
    intitule: string;
    categoriePrincipale: string;
    reasoning: string;
    confidence: number;
  }>;
}> {
  const client = getOpenAIClient();

  // Récupérer les risques du référentiel central consolidé DUERPilot
  let sectorRisks: any[] = [];
  if (prisma) {
    const reference = await prisma.duerpilotReference.findFirst({
      where: {
        isActive: true,
        tenantId: null, // Référentiel global
      },
      orderBy: { version: 'desc' },
    });

    if (reference) {
      // Récupérer les risques avec prévalence pour hiérarchisation
      const risks = await prisma.duerpilotRisk.findMany({
        where: {
          referenceId: reference.id,
          secteurCode,
        },
        include: {
          reference: {
            include: {
              prevalenceMatrix: {
                where: {
                  secteurCode,
                },
              },
            },
          },
        },
        orderBy: [
          { isTransversal: 'desc' },
          { criticiteScore: 'desc' },
        ],
        take: 50, // Limiter pour le contexte
      });

      // Récupérer les prévalences
      const risksWithPrevalence = await Promise.all(
        risks.map(async (risk) => {
          const prevalence = await prisma.riskPrevalence.findFirst({
            where: {
              referenceId: reference.id,
              riskId: risk.riskId,
              secteurCode,
            },
          });

          return {
            intitule: risk.intitule,
            categoriePrincipale: risk.categoriePrincipale,
            situationsTravail: risk.situationsTravail,
            dangers: risk.dangers,
            prevalenceLevel: prevalence?.prevalenceLevel,
            isTransversal: risk.isTransversal,
          };
        })
      );

      sectorRisks = risksWithPrevalence;
    }
  }

  const existingRisksText = existingRisks
    .map((r) => `- ${r.intitule}${r.categoriePrincipale ? ` (${r.categoriePrincipale})` : ''}`)
    .join('\n');

  const sectorRisksText = sectorRisks
    .slice(0, 30) // Limiter à 30 risques pour le contexte
    .map((r) => {
      const prevalenceInfo = r.prevalenceLevel 
        ? ` [${r.prevalenceLevel === 'tres_frequent' ? 'Très fréquent' : r.prevalenceLevel === 'frequent' ? 'Fréquent' : 'Occasionnel'}]`
        : '';
      const transversalInfo = r.isTransversal ? ' [Transverse]' : '';
      return `- ${r.intitule} (${r.categoriePrincipale})${prevalenceInfo}${transversalInfo}`;
    })
    .join('\n');

  const workUnitContextText = workUnitContext
    ? `Unité de travail : ${workUnitContext.name}${workUnitContext.description ? ` - ${workUnitContext.description}` : ''}${workUnitContext.activity ? ` - Activité : ${workUnitContext.activity}` : ''}`
    : 'Contexte non spécifié';

  const prompt = `Tu es un assistant pour l'évaluation des risques professionnels. Tu dois suggérer des risques potentiellement manquants basés sur des référentiels sectoriels.

⚠️ IMPORTANT : Tu es strictement assistif et non décisionnaire. Tes suggestions sont indicatives et doivent être validées par l'utilisateur.

CONTEXTE :
${workUnitContextText}

RISQUES DÉJÀ IDENTIFIÉS :
${existingRisksText || 'Aucun risque identifié pour le moment'}

RISQUES RÉFÉRENCÉS DANS CE SECTEUR (référentiel interne DUERPilot, à titre indicatif) :
${sectorRisksText || 'Aucun référentiel disponible'}

Les risques marqués [Fréquent] ou [Très fréquent] sont plus souvent observés dans ce secteur.
Les risques marqués [Transverse] sont présents dans plusieurs secteurs similaires.

INSTRUCTIONS :
1. Analyse les risques déjà identifiés
2. Compare avec les risques référencés dans le secteur
3. Suggère 3 à 5 risques potentiellement manquants qui semblent pertinents pour cette unité de travail
4. Pour chaque suggestion, indique pourquoi ce risque pourrait être pertinent (raisonnement basé sur le contexte)
5. Assigne un niveau de confiance (0-100) : faible si très générique, élevé si très spécifique au contexte

FORMAT DE RÉPONSE (JSON uniquement) :
{
  "suggestedRisks": [
    {
      "riskId": "ID du risque depuis le référentiel (si trouvé) ou null",
      "intitule": "Titre du risque suggéré",
      "categoriePrincipale": "Catégorie du risque",
      "reasoning": "Pourquoi ce risque pourrait être pertinent pour cette unité de travail (2-3 phrases)",
      "confidence": 75
    }
  ]
}

RÈGLES STRICTES :
- Ne garantis JAMAIS la conformité ou l'exhaustivité
- Formule tes suggestions comme des propositions conditionnelles ("pourrait être pertinent", "semble fréquent dans ce type d'activité")
- Si aucun risque pertinent n'est identifié, retourne un tableau vide
- Le niveau de confiance doit refléter l'incertitude (jamais 100%)`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini', // Utiliser mini pour les suggestions (moins coûteux)
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant strictement assistif pour l\'évaluation des risques professionnels. Tu ne décides jamais, tu suggères uniquement. Toutes tes suggestions doivent être validées par l\'utilisateur.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { suggestedRisks: [] };
    }

    // Extraire le JSON de la réponse
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { suggestedRisks: [] };
    }

    const result = JSON.parse(jsonMatch[0]);

    // Logger l'utilisation
    if (loggingContext && prisma) {
      await logAIUsageWithCost(
        {
          tenantId: loggingContext.tenantId,
          userId: loggingContext.userId,
          companyId: loggingContext.companyId,
          function: 'suggest_risks_from_reference',
          provider: 'openai',
          model: 'gpt-4o-mini',
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
        },
        prisma
      );
    }

    return {
      suggestedRisks: result.suggestedRisks || [],
    };
  } catch (error) {
    console.error('Error suggesting risks from sector reference:', error);
    return {
      suggestedRisks: [],
    };
  }
}

