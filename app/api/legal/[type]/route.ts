import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const legalDocumentTypes = ['cgu', 'mentions-legales', 'politique-confidentialite'] as const;
type LegalDocumentType = typeof legalDocumentTypes[number];

/**
 * Route API publique pour récupérer un document légal
 * GET /api/legal/[type]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const type = params.type as LegalDocumentType;

    // Vérifier que le type est valide
    if (!legalDocumentTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Type de document invalide' },
        { status: 400 }
      );
    }

    // Récupérer le document actuel
    const document = await prisma.legalDocument.findUnique({
      where: { type },
      select: {
        id: true,
        type: true,
        title: true,
        htmlContent: true,
        content: true, // Pour le format markdown si besoin
        currentVersion: true,
        updatedAt: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      );
    }

    // Retourner le document en HTML ou JSON selon l'en-tête Accept
    const accept = request.headers.get('accept') || '';

    if (accept.includes('application/json')) {
      return NextResponse.json({
        type: document.type,
        title: document.title,
        htmlContent: document.htmlContent,
        markdownContent: document.content,
        version: document.currentVersion,
        updatedAt: document.updatedAt,
      });
    }

    // Par défaut, retourner en HTML
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.title} - DUERPilot</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    h1 { color: #1F2933; border-bottom: 2px solid #2563EB; padding-bottom: 0.5rem; }
    h2 { color: #374151; margin-top: 2rem; }
    h3 { color: #4B5563; margin-top: 1.5rem; }
    a { color: #2563EB; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #F3F4F6; padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.9em; }
    pre { background: #F3F4F6; padding: 1rem; border-radius: 5px; overflow-x: auto; }
    blockquote { border-left: 4px solid #2563EB; padding-left: 1rem; margin-left: 0; color: #6B7280; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #E5E7EB; padding: 0.5rem; text-align: left; }
    th { background: #F3F4F6; font-weight: 600; }
  </style>
</head>
<body>
  <h1>${document.title}</h1>
  <div>
    ${document.htmlContent || '<p>Contenu non disponible</p>'}
  </div>
  <hr style="margin: 2rem 0; border: none; border-top: 1px solid #E5E7EB;">
  <p style="color: #6B7280; font-size: 0.875rem;">
    Dernière mise à jour : ${new Date(document.updatedAt).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })} (Version ${document.currentVersion})
  </p>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du document légal:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

