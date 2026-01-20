'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur pour le débogage
    console.error('Error:', error);
  }, [error]);

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
            Une erreur est survenue
          </CardTitle>
          <CardDescription className="text-center">
            Désolé, une erreur inattendue s'est produite.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.message && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600 break-words">
                {error.message}
              </p>
            </div>
          )}
          {process.env.NODE_ENV === 'development' && error.digest && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-500 font-mono">
                Digest: {error.digest}
              </p>
            </div>
          )}
          <div className="flex flex-col space-y-2">
            <Button onClick={reset} className="w-full">
              Réessayer
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
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