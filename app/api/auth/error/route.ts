import { redirect } from 'next/navigation';

/**
 * Route API pour rediriger /api/auth/error vers /auth/error
 * NextAuth utilise parfois /api/auth/error au lieu de la page personnalisée
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error');
  
  // Rediriger vers la page d'erreur personnalisée avec le paramètre d'erreur
  const errorUrl = error 
    ? `/auth/error?error=${encodeURIComponent(error)}`
    : '/auth/error';
  
  redirect(errorUrl);
}

export async function POST(request: Request) {
  return GET(request);
}

