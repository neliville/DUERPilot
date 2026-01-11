'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const errorMessages: Record<string, string> = {
  Configuration: 'Il y a un problème avec la configuration du serveur.',
  AccessDenied: 'Vous n\'avez pas la permission d\'accéder à cette page.',
  Verification: 'Le lien de vérification a expiré ou a déjà été utilisé.',
  Default: 'Une erreur est survenue lors de la connexion.',
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  const errorMessage = error && error in errorMessages 
    ? errorMessages[error] 
    : errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Erreur d'authentification
          </CardTitle>
          <CardDescription className="text-center">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Code d'erreur:</span> {error}
              </p>
            </div>
          )}
          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => router.push('/auth/signin')}
              className="w-full"
            >
              Retour à la connexion
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}

