import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  const filePath = join(process.cwd(), 'public', 'landing', 'index.html');
  
  try {
    const htmlContent = readFileSync(filePath, 'utf-8');
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier HTML:', error);
    return new NextResponse('Erreur de chargement', { status: 500 });
  }
}
