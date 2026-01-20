'use client';

import { api } from '@/lib/trpc/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { EvaluationMethod } from '@/lib/plans';
import { PLAN_NAMES, getRequiredPlan, hasMethodAccess } from '@/lib/plans';

interface MethodAccessGuardProps {
  method: EvaluationMethod;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function MethodAccessGuard({
  method,
  children,
  fallback,
}: MethodAccessGuardProps) {
  const { data: planInfo } = api.plans.getCurrent.useQuery();

  if (!planInfo) {
    return <div>Chargement...</div>;
  }

  const currentPlan = planInfo.plan;
  const hasAccess = hasMethodAccess(currentPlan, method);

  if (hasAccess) {
    return <>{children}</>;
  }

  const requiredPlan = getRequiredPlan(method);
  const methodNames: Record<EvaluationMethod, string> = {
    duerp_generique: 'Méthode DUERP générique',
    inrs: 'Méthode INRS',
  };

  const reason = `La ${methodNames[method]} n'est pas disponible dans le plan ${PLAN_NAMES[currentPlan]}.`;

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Fonctionnalité non disponible</AlertTitle>
      <AlertDescription>
        <p className="mb-4">{reason}</p>
        <Button asChild variant="link" className="p-0 h-auto">
          <Link href="/dashboard/settings/billing">
            Passer au plan {PLAN_NAMES[requiredPlan]} pour y accéder
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}

