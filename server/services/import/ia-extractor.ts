/**
 * Service d'extraction IA de structure DUERP depuis texte brut
 * Utilise GPT-4 ou Claude Sonnet pour extraire la structure
 */

export interface DuerpStructure {
  company?: {
    legalName?: string;
    siret?: string;
    address?: string;
    employeeCount?: number;
  };
  workUnits?: Array<{
    name: string;
    description?: string;
    exposedCount?: number;
  }>;
  risks?: Array<{
    workUnitName?: string;
    hazard?: string;
    dangerousSituation?: string;
    exposedPersons?: string;
    frequency?: number;
    probability?: number;
    severity?: number;
    control?: number;
    existingMeasures?: string;
  }>;
  measures?: Array<{
    description: string;
    type?: string;
  }>;
  confidence: number; // 0-100 : confiance dans l'extraction
}

/**
 * Extrait la structure DUERP depuis un texte brut
 */
export async function extractDuerpStructure(
  text: string,
  format: 'pdf' | 'word' | 'excel' | 'csv',
  extractionLevel: 'basic' | 'advanced' | 'complete',
  loggingContext?: {
    tenantId: string;
    userId: string;
    companyId?: string;
  }
): Promise<DuerpStructure> {
  // Niveau basique : extraction simple avec regex (pas de logging IA)
  if (extractionLevel === 'basic') {
    return extractBasicStructure(text);
  }
  
  // Niveau avancé : GPT-4
  if (extractionLevel === 'advanced') {
    try {
      const { extractDuerpStructureWithGPT4 } = await import('@/server/services/ai/openai-service');
      return await extractDuerpStructureWithGPT4(text, format, loggingContext);
    } catch (error) {
      console.error('Erreur extraction GPT-4, fallback sur basique:', error);
      return extractBasicStructure(text);
    }
  }
  
  // Niveau complet : Claude Sonnet
  if (extractionLevel === 'complete') {
    try {
      const { extractDuerpStructureWithClaude } = await import('@/server/services/ai/anthropic-service');
      return await extractDuerpStructureWithClaude(text, format, loggingContext);
    } catch (error) {
      console.error('Erreur extraction Claude, fallback sur GPT-4:', error);
      try {
        const { extractDuerpStructureWithGPT4 } = await import('@/server/services/ai/openai-service');
        return await extractDuerpStructureWithGPT4(text, format, loggingContext);
      } catch (gptError) {
        console.error('Erreur extraction GPT-4, fallback sur basique:', gptError);
        return extractBasicStructure(text);
      }
    }
  }
  
  return {
    confidence: 0,
  };
}

/**
 * Extraction basique avec regex (pour plan Starter)
 */
function extractBasicStructure(text: string): DuerpStructure {
  const structure: DuerpStructure = {
    confidence: 50, // Faible confiance pour extraction basique
  };

  // Extraire nom entreprise (patterns courants)
  const companyNameMatch = text.match(/(?:Raison sociale|Entreprise|Société)[\s:]+([A-Z][^\n]+)/i);
  if (companyNameMatch) {
    structure.company = {
      legalName: companyNameMatch[1].trim(),
    };
  }

  // Extraire SIRET (14 chiffres)
  const siretMatch = text.match(/\b(\d{3}\s?\d{3}\s?\d{3}\s?\d{5})\b/);
  if (siretMatch && structure.company) {
    structure.company.siret = siretMatch[1].replace(/\s/g, '');
  }

  // TODO: Extraire unités de travail, risques, etc. avec regex
  // Pour l'instant, structure minimale

  return structure;
}


