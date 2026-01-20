'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/trpc/client';
import { Loader2, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { UserRole } from '@/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Composant de garde générique pour protéger les routes par rôle
 * Vérifie que l'utilisateur a l'un des rôles autorisés avant d'afficher le contenu
 */
export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
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
  }, [status, router]);

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

  // Normaliser les rôles (compatibilité ascendante)
  const userRoles = userProfile.roles || [];
  const normalizedRoles = userRoles.map((role) => {
    const mapping: Record<string, string> = {
      admin_tenant: 'admin',
      manager: 'site_manager',
      operator: 'observer',
      auditor: 'consultant',
    };
    return mapping[role] || role;
  });

  const hasRole = allowedRoles.some((role) => 
    normalizedRoles.includes(role) || userRoles.includes(role)
  );

  if (!hasRole) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Accès refusé. Rôles requis: {allowedRoles.join(', ')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
