'use client';

import { api } from '@/lib/trpc/client';
import { PlanUpgradeDialog } from './plan-upgrade-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
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
  const { data: planInfo } = api.plans.getCurrentPlan.useQuery();

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
        <PlanUpgradeDialog
          currentPlan={currentPlan}
          requiredPlan={requiredPlan}
          reason={reason}
        >
          <button className="text-sm font-medium text-primary hover:underline">
            Passer au plan {PLAN_NAMES[requiredPlan]} pour y accéder
          </button>
        </PlanUpgradeDialog>
      </AlertDescription>
    </Alert>
  );
}

