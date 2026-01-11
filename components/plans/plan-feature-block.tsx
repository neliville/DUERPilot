'use client';

import { api } from '@/lib/trpc/client';
import { PlanBlockMessage } from './plan-block-message';
import { hasFeatureAccess, getRequiredPlan, PLAN_FEATURES, type Plan } from '@/lib/plans';
import { Loader2 } from 'lucide-react';

interface PlanFeatureBlockProps {
  feature: keyof typeof PLAN_FEATURES[Plan];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showMessage?: boolean;
  onContinue?: () => void;
  featureName?: string;
}

const FEATURE_NAMES: Record<string, string> = {
  workUnits: 'Unités de travail',
  multiple_companies: 'Multi-entreprises',
  history: 'Historique long terme',
  api: 'API REST',
  multi_tenant: 'Multi-tenant',
  advanced_exports: 'Exports avancés',
};

export function PlanFeatureBlock({
  feature,
  children,
  fallback,
  showMessage = true,
  onContinue,
  featureName,
}: PlanFeatureBlockProps) {
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
  const hasAccess = hasFeatureAccess(currentPlan, feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  const requiredPlan = getRequiredPlan(feature);
  const displayName = featureName || FEATURE_NAMES[feature] || feature;

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showMessage) {
    return null;
  }

  return (
    <PlanBlockMessage
      currentPlan={currentPlan}
      requiredPlan={requiredPlan}
      type="feature"
      featureName={displayName}
      onContinue={onContinue}
    />
  );
}

