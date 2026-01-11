/**
 * Service d'extraction de contenu depuis fichiers PDF
 * Supporte PDF natifs et PDF scannés (avec OCR)
 */

// @ts-ignore - pdf-parse n'a pas de types TypeScript complets
const pdfParse = require('pdf-parse');

export interface PDFExtractionResult {
  text: string;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
    pages: number;
  };
  pages: Array<{
    pageNumber: number;
    text: string;
  }>;
}

/**
 * Extrait le texte d'un PDF natif
 */
export async function extractPDFText(buffer: Buffer): Promise<PDFExtractionResult> {
  try {
    const data = await pdfParse(buffer);

    const pages: Array<{ pageNumber: number; text: string }> = [];
    
    // Si le PDF a des pages séparées, on peut les extraire individuellement
    // Pour l'instant, on extrait tout le texte
    if (data.text) {
      pages.push({
        pageNumber: 1,
        text: data.text,
      });
    }

    return {
      text: data.text || '',
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        subject: data.info?.Subject,
        creator: data.info?.Creator,
        producer: data.info?.Producer,
        creationDate: data.info?.CreationDate ? new Date(data.info.CreationDate) : undefined,
        modificationDate: data.info?.ModDate ? new Date(data.info.ModDate) : undefined,
        pages: data.numpages || 0,
      },
      pages,
    };
  } catch (error) {
    throw new Error(`Erreur lors de l'extraction PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Détecte si un PDF est scanné (image) ou natif (texte)
 * TODO: Implémenter avec Tesseract.js pour OCR si nécessaire
 */
export async function isScannedPDF(buffer: Buffer): Promise<boolean> {
  try {
    const data = await pdfParse(buffer);
    // Si le PDF a très peu de texte par rapport au nombre de pages, c'est probablement scanné
    const textLength = data.text?.length || 0;
    const pages = data.numpages || 1;
    const avgTextPerPage = textLength / pages;
    
    // Seuil arbitraire : moins de 100 caractères par page = probablement scanné
    return avgTextPerPage < 100;
  } catch {
    return false;
  }
}

