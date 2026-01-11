/**
 * Mapping NAF → Secteur d'activité
 * 
 * Ce module propose automatiquement un secteur d'activité principal à partir d'un code NAF.
 * 
 * ⚠️ IMPORTANT : Le code NAF est utilisé uniquement comme aide à la structuration,
 * jamais comme validation réglementaire. Le résultat est suggestif, non décisionnaire.
 * 
 * L'utilisateur doit toujours pouvoir :
 * - Confirmer
 * - Modifier
 * - Ajouter plusieurs secteurs si nécessaire (multi-activités)
 */

/**
 * Mapping principal NAF → secteur fonctionnel
 * Les secteurs sont des catégories fonctionnelles internes DUERPilot, non des référentiels officiels.
 */
const secteursByNAF: Record<string, string> = {
  // Section F → BTP
  'F': 'BTP',
  
  // Division 56 → Restauration
  '56': 'RESTO',
  
  // Sections K, L, M, N → Bureau / Tertiaire
  'K': 'BUREAU',
  'L': 'BUREAU',
  'M': 'BUREAU',
  'N': 'BUREAU',
  
  // Division 47 → Commerce
  '47': 'COMMERCE',
  
  // Section Q → Santé
  'Q': 'SANTE',
  
  // Section C → Industrie
  'C': 'INDUSTRIE',
  
  // Section H → Logistique
  'H': 'LOGISTIQUE',
  
  // Divisions 87-88 → Services
  '87': 'SERVICES',
  '88': 'SERVICES',
  
  // Section A → Agriculture
  'A': 'AGRICULTURE',
  
  // Section P → Education
  'P': 'EDUCATION',
};

/**
 * Extrait la section (lettre) d'un code NAF
 * @param codeNAF Code NAF nettoyé
 * @returns Section (lettre unique) ou null
 */
function extractSection(codeNAF: string): string | null {
  const sectionMatch = codeNAF.match(/^([A-Z])/);
  return sectionMatch ? sectionMatch[1] : null;
}

/**
 * Extrait la division (2 premiers chiffres) d'un code NAF
 * @param codeNAF Code NAF nettoyé
 * @returns Division (2 chiffres) ou null
 */
function extractDivision(codeNAF: string): string | null {
  // Chercher 2 chiffres consécutifs après la section ou au début
  const divisionMatch = codeNAF.match(/(?:^[A-Z])?(\d{2})/);
  return divisionMatch ? divisionMatch[1] : null;
}

/**
 * Nettoie et normalise un code NAF
 * @param codeNAF Code NAF brut
 * @returns Code NAF nettoyé (majuscules, sans points, sans espaces)
 */
function cleanNAFCode(codeNAF: string): string {
  return codeNAF.trim().toUpperCase().replace(/\./g, '');
}

/**
 * Propose un secteur d'activité à partir d'un code NAF
 * 
 * Formats d'entrée gérés :
 * - "F" (section seule)
 * - "47" (division)
 * - "47.11" ou "4711" (division + sous-division)
 * - "47.11A" ou "4711A" (code complet)
 * 
 * Règles de matching (ordre strict) :
 * 1. Division exacte (56, 47, 87, 88)
 * 2. Section (F, C, Q, H, A, P, K, L, M, N)
 * 3. Fallback : GENERIQUE
 * 
 * @param codeNAF Code NAF (format libre : "F", "47", "47.11", "4711", "47.11A", etc.)
 * @returns Code secteur suggéré : "BTP" | "RESTO" | "BUREAU" | "COMMERCE" | "SANTE" | "INDUSTRIE" | "LOGISTIQUE" | "SERVICES" | "AGRICULTURE" | "EDUCATION" | "GENERIQUE"
 * 
 * @example
 * getSecteurFromNAF("F")        // "BTP"
 * getSecteurFromNAF("F43")      // "BTP"
 * getSecteurFromNAF("43.99Z")   // "BTP" (car section F)
 * getSecteurFromNAF("56.10A")   // "RESTO"
 * getSecteurFromNAF("K64")      // "BUREAU"
 * getSecteurFromNAF("47.11A")   // "COMMERCE"
 * getSecteurFromNAF("12345")    // "GENERIQUE"
 * getSecteurFromNAF("")         // "GENERIQUE"
 */
export function getSecteurFromNAF(codeNAF: string): string {
  // Gestion des valeurs invalides / vides
  if (!codeNAF || typeof codeNAF !== 'string') {
    return 'GENERIQUE';
  }

  // Nettoyage : trim, uppercase, suppression des points
  const cleaned = cleanNAFCode(codeNAF);

  if (!cleaned) {
    return 'GENERIQUE';
  }

  // 1. Matching par division exacte (prioritaire)
  const division = extractDivision(cleaned);
  if (division) {
    if (division === '56') return 'RESTO';
    if (division === '47') return 'COMMERCE';
    if (division === '87' || division === '88') return 'SERVICES';
  }

  // 2. Matching par section
  const section = extractSection(cleaned);
  if (section) {
    const secteur = secteursByNAF[section];
    if (secteur) {
      return secteur;
    }
  }

  // 3. Fallback : GENERIQUE (risques transversaux)
  return 'GENERIQUE';
}

/**
 * Extrait un code NAF depuis un SIRET (14 chiffres)
 * Le code NAF est composé des caractères 9-13 du SIRET (5 caractères : 4 chiffres + 1 lettre)
 * 
 * @param siret SIRET (14 chiffres)
 * @returns Code NAF extrait ou null
 * 
 * @example
 * extractNAFFromSIRET("12345678901234")  // "9012A" (exemple)
 */
export function extractNAFFromSIRET(siret: string): string | null {
  if (!siret || typeof siret !== 'string') {
    return null;
  }

  // Nettoyer le SIRET (enlever espaces et points)
  const cleaned = siret.trim().replace(/[\s\.]/g, '');

  // Vérifier que c'est un SIRET valide (14 chiffres)
  if (!/^\d{14}$/.test(cleaned)) {
    return null;
  }

  // Extraire les caractères 9-13 (index 8-12)
  const nafCode = cleaned.substring(8, 13);

  return nafCode || null;
}

/**
 * Propose un secteur à partir d'un SIRET
 * Combine extractNAFFromSIRET et getSecteurFromNAF
 * 
 * @param siret SIRET (14 chiffres)
 * @returns Code secteur suggéré ou "GENERIQUE" si extraction impossible
 */
export function getSecteurFromSIRET(siret: string): string {
  const nafCode = extractNAFFromSIRET(siret);
  
  if (!nafCode) {
    return 'GENERIQUE';
  }

  return getSecteurFromNAF(nafCode);
}

/**
 * Objet des secteurs disponibles avec leurs codes
 */
export const SECTEURS_DISPONIBLES = {
  BTP: 'Construction et travaux',
  RESTO: 'Restauration collective et commerciale',
  BUREAU: 'Travail de bureau / tertiaire',
  COMMERCE: 'Commerce de détail',
  SANTE: 'Santé, médico-social',
  INDUSTRIE: 'Industrie manufacturière',
  LOGISTIQUE: 'Transport, entreposage, livraison',
  SERVICES: 'Services à la personne',
  AGRICULTURE: 'Agriculture, élevage',
  EDUCATION: 'Enseignement, formation',
  GENERIQUE: 'Référentiel transversal (fallback)',
} as const;

/**
 * Type des codes de secteurs disponibles
 */
export type SecteurCode = keyof typeof SECTEURS_DISPONIBLES;

/**
 * Vérifie si un code secteur est valide
 */
export function isValidSecteurCode(code: string): code is SecteurCode {
  return code in SECTEURS_DISPONIBLES;
}

/**
 * Message pédagogique à afficher lors de la suggestion de secteur
 */
export const MESSAGE_SUGGESTION_SECTEUR = 
  "Le secteur proposé est basé sur votre code NAF à titre indicatif. " +
  "Vous pouvez le modifier ou en ajouter d'autres selon vos unités de travail.";

