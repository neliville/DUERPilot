import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route pour gérer les inscriptions à la liste d'attente Brevo
 * Sécurise la clé API côté serveur
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, prenom, entreprise, secteur, consent } = body;

    // Validation
    if (!email || !consent) {
      return NextResponse.json(
        { error: 'Email et consentement sont requis' },
        { status: 400 }
      );
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const BREVO_LIST_ID = process.env.BREVO_LIST_ID;

    if (!BREVO_API_KEY || !BREVO_LIST_ID) {
      console.error('BREVO_API_KEY ou BREVO_LIST_ID non configuré');
      return NextResponse.json(
        { error: 'Configuration Brevo manquante' },
        { status: 500 }
      );
    }

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
          PRENOM: prenom || '',
          ENTREPRISE: entreprise || '',
          SECTEUR: secteur || '',
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
      return NextResponse.json(
        { error: errorData.message || `Erreur ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: 'Inscription réussie' });
  } catch (error) {
    console.error('Erreur inscription waitlist:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}


