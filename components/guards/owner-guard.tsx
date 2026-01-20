'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/trpc/client';
import { Loader2, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OwnerGuardProps {
  children: React.ReactNode;
}

/**
 * Composant de garde pour protéger les routes réservées au propriétaire
 * Vérifie que l'utilisateur est owner avant d'afficher le contenu
 */
export function OwnerGuard({ children }: OwnerGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: userProfile, isLoading } = api.auth.getCurrentUser.useQuery(undefined, {
    enabled: status === 'authenticated',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && !isLoading && userProfile) {
      if (!userProfile.isOwner) {
        router.push('/dashboard');
      }
    }
  }, [status, isLoading, userProfile, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  if (!userProfile.isOwner) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Accès refusé. Cette fonctionnalité est réservée au propriétaire de l'organisation.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
