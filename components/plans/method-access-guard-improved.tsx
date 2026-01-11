'use client';

import { api } from '@/lib/trpc/client';
import { PlanBlockMessage } from './plan-block-message';
import { hasMethodAccess, getRequiredPlan, PLAN_NAMES, type Plan, type EvaluationMethod } from '@/lib/plans';
import { Loader2 } from 'lucide-react';

interface MethodAccessGuardImprovedProps {
  method: EvaluationMethod;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showMessage?: boolean;
  onContinue?: () => void;
}

const METHOD_NAMES: Record<EvaluationMethod, string> = {
  duerp_generique: 'Méthode DUERP générique',
  inrs: 'Méthode structurée (inspirée INRS)',
};

const METHOD_TYPES: Record<EvaluationMethod, 'method' | 'feature'> = {
  duerp_generique: 'method',
  inrs: 'method',
};

export function MethodAccessGuardImproved({
  method,
  children,
  fallback,
  showMessage = true,
  onContinue,
}: MethodAccessGuardImprovedProps) {
  const { data: planInfo, isLoading } = api.plans.getCurrentPlan.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!planInfo) {
    return <div>Erreur de chargement du plan</div>;
  }

  const currentPlan = planInfo.plan;
  const hasAccess = hasMethodAccess(currentPlan, method);

  if (hasAccess) {
    return <>{children}</>;
  }

  const requiredPlan = getRequiredPlan(method);
  const methodType = METHOD_TYPES[method];

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showMessage) {
    return null;
  }

  return (
    <div className="space-y-4">
      <PlanBlockMessage
        currentPlan={currentPlan}
        requiredPlan={requiredPlan}
        type={methodType}
        featureName={METHOD_NAMES[method]}
        onContinue={onContinue}
      />
      {onContinue && (
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Vous pouvez continuer avec la méthode{' '}
            {currentPlan === 'free' ? 'générique' : 'disponible dans votre plan'}.
          </p>
        </div>
      )}
    </div>
  );
}

