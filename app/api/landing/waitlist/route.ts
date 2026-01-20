import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route pour gérer les inscriptions à la liste d'attente Brevo
 * Sécurise la clé API côté serveur
 */

// Configuration CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://duerpilot.fr',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Gestion de la requête OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, companySize, sector, roleContact, jobTitle, consent } = body;

    // Validation
    if (!email || !companySize || !sector || !roleContact || !consent) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: 'Adresse email invalide' },
      { status: 400, headers: corsHeaders }
    );
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const BREVO_LIST_ID = process.env.BREVO_LIST_ID;

    if (!BREVO_API_KEY || !BREVO_LIST_ID) {
      console.error('BREVO_API_KEY ou BREVO_LIST_ID non configuré');
    return NextResponse.json(
      { error: 'Configuration Brevo manquante' },
      { status: 500, headers: corsHeaders }
    );
    }

    // Mapping des tailles de structure
    const companySizeMapping: Record<string, string> = {
      '1': 'TPE (1–10 salariés)',
      '2': 'PME (11–250 salariés)',
      '3': 'Consultant / Indépendant',
      '4': 'Autre',
    };
    const companySizeLabel = companySizeMapping[companySize] || 'Non renseigné';

    // Mapping des secteurs
    const sectorMapping: Record<string, string> = {
      '1': 'BTP',
      '2': 'Industrie',
      '3': 'Logistique / Transport',
      '4': 'Services',
      '5': 'Commerce',
      '6': 'Autre',
    };
    const sectorLabel = sectorMapping[sector] || 'Non renseigné';

    // Mapping des rôles
    const roleMapping: Record<string, string> = {
      '1': 'Dirigeant / Responsable légal',
      '2': 'Responsable QSE / HSE / Prévention',
      '3': 'Manager / Chef d\'équipe',
      '4': 'RH / Support',
      '5': 'Consultant / Cabinet',
      '6': 'Autre',
    };
    const roleLabel = roleMapping[roleContact] || 'Non renseigné';

    // Appel API Brevo
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes: {
          TAILLE_STRUCTURE: companySizeLabel,
          SECTEUR: sectorLabel,
          ROLE_CONTACT: roleLabel,
          POSTE: jobTitle || '',
        },
        listIds: [parseInt(BREVO_LIST_ID, 10)],
        updateEnabled: false,
        emailBlacklisted: false,
        smsBlacklisted: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erreur Brevo API:', errorData);
      
      // Gestion des erreurs spécifiques
      if (response.status === 400 && errorData.code === 'duplicate_parameter') {
        return NextResponse.json(
          { error: 'Cette adresse email est déjà inscrite.' },
          { status: 400, headers: corsHeaders }
        );
      }
      
      return NextResponse.json(
        { error: errorData.message || `Erreur ${response.status}` },
        { status: response.status, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Inscription réussie' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Erreur inscription waitlist:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500, headers: corsHeaders }
    );
  }
}


