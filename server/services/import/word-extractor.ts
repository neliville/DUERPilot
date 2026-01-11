/**
 * Service d'extraction de contenu depuis fichiers Word (.docx)
 */

import mammoth from 'mammoth';

export interface WordExtractionResult {
  text: string;
  html: string;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    pages?: number;
  };
}

/**
 * Extrait le texte d'un fichier Word (.docx)
 */
export async function extractWordText(buffer: Buffer): Promise<WordExtractionResult> {
  try {
    // Extraire le texte brut
    const textResult = await mammoth.extractRawText({ buffer });
    
    // Extraire le HTML (pour préserver la structure)
    const htmlResult = await mammoth.convertToHtml({ buffer });

    // TODO: Extraire les métadonnées si disponibles
    // Les métadonnées Word ne sont pas directement accessibles via mammoth
    // Il faudrait utiliser un autre package comme 'officegen' ou 'docx'

    return {
      text: textResult.value || '',
      html: htmlResult.value || '',
      metadata: {
        // Métadonnées non disponibles via mammoth
      },
    };
  } catch (error) {
    throw new Error(`Erreur lors de l'extraction Word: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

