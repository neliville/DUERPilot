'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/trpc/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Composant de garde pour protéger les routes admin
 * Vérifie que l'utilisateur est super_admin avant d'afficher le contenu
 */
export function AdminGuard({ children }: AdminGuardProps) {
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
      const isSuperAdmin = userProfile.isSuperAdmin || 
                          (userProfile.roles && userProfile.roles.includes('super_admin'));

      if (!isSuperAdmin) {
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

  const isSuperAdmin = userProfile.isSuperAdmin || 
                      (userProfile.roles && userProfile.roles.includes('super_admin'));

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Accès refusé. Seuls les super administrateurs peuvent accéder à cette section.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

