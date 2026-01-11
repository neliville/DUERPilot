'use client';

import { api } from '@/lib/trpc/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { PlanBlockMessage } from './plan-block-message';
import { PLAN_NAMES, getUpgradePlan, type Plan } from '@/lib/plans';

export function PlanQuotaWarning() {
  const { data: planInfo } = api.plans.getCurrentPlan.useQuery();

  if (!planInfo || planInfo.usage.iaa.limit === 0) {
    return null;
  }

  const { plan, usage, upgradePlan } = planInfo;
  const { current, limit, percentage, warning } = usage.iaa;

  // Afficher uniquement si on approche ou dépasse la limite
  if (!warning && percentage < 100) {
    return null;
  }

  const isExceeded = percentage >= 100;

  if (isExceeded) {
    return (
      <PlanBlockMessage
        currentPlan={plan}
        requiredPlan={upgradePlan || 'expert'}
        type="quota"
        className="mb-4"
        onContinue={() => {
          // L'utilisateur peut continuer sans IA
          // Cette fonction sera gérée par le composant parent
        }}
      />
    );
  }

  // Avertissement à 80%
  return (
    <Alert variant="default" className="mb-4 border-orange-200 bg-orange-50 dark:bg-orange-950">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-900 dark:text-orange-100">
        Quota d'assistance proche de la limite
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-orange-800 dark:text-orange-200">
              Utilisation : {current} / {limit} appels IA
            </span>
            <span className="font-semibold text-orange-900 dark:text-orange-100">
              {percentage}%
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
        <p className="text-sm text-orange-800 dark:text-orange-200">
          Vous avez utilisé {percentage}% de votre quota mensuel. Pensez à passer au plan{' '}
          {upgradePlan ? PLAN_NAMES[upgradePlan] : 'supérieur'} pour bénéficier d'un quota étendu.
        </p>
        {upgradePlan && (
          <Button asChild size="sm" variant="outline" className="border-orange-300">
            <Link href="/dashboard/settings/billing">
              <TrendingUp className="mr-2 h-4 w-4" />
              Passer au plan {PLAN_NAMES[upgradePlan]}
            </Link>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

