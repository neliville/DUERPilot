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
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, companySize, sector, roleContact, jobTitle, consent } = body;

    // Debug: logger les valeurs reçues
    console.log('API received body:', body);
    console.log('API parsed values:', {
      email,
      companySize,
      sector,
      roleContact,
      jobTitle,
      consent,
      emailType: typeof email,
      companySizeType: typeof companySize,
      sectorType: typeof sector,
      roleContactType: typeof roleContact,
      consentType: typeof consent,
      emailEmpty: !email || email.trim() === '',
      companySizeEmpty: !companySize || companySize === '',
      sectorEmpty: !sector || sector === '',
      roleContactEmpty: !roleContact || roleContact === '',
      consentFalse: consent !== true && consent !== 'true' && consent !== 1
    });

    // Validation avec messages précis (accepter différentes représentations de consent)
    const missingFields = [];
    const normalizedConsent = consent === true || consent === 'true' || consent === 1 || consent === '1';
    
    if (!email || email.trim() === '') missingFields.push('Email');
    if (!companySize || companySize === '') missingFields.push('Taille de structure');
    if (!sector || sector === '') missingFields.push('Secteur d\'activité');
    if (!roleContact || roleContact === '') missingFields.push('Rôle dans l\'entreprise');
    if (!normalizedConsent) missingFields.push('Consentement RGPD');
    
    if (missingFields.length > 0) {
      const message = missingFields.length === 1 
        ? `Le champ "${missingFields[0]}" est obligatoire.`
        : `Les champs suivants sont obligatoires : ${missingFields.join(', ')}.`;
      console.error('Validation failed. Missing fields:', missingFields);
      return NextResponse.json(
        { error: message },
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


