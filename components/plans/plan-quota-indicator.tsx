'use client';

import { api } from '@/lib/trpc/client';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export function PlanQuotaIndicator() {
  const { data: planInfo } = api.plans.getCurrentPlan.useQuery();

  if (!planInfo || planInfo.usage.iaa.limit === 0) {
    return null;
  }

  const { usage, upgradePlan } = planInfo;
  const { current, limit, percentage, warning } = usage.iaa;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Quota IA ce mois</span>
        <span className="font-medium">
          {current} / {limit}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      {warning && (
        <Alert variant={percentage >= 100 ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {percentage >= 100
                ? 'Quota IA atteint. Passez au plan supérieur pour continuer.'
                : `Vous avez utilisé ${percentage}% de votre quota IA ce mois.`}
            </span>
            {upgradePlan && (
              <Button asChild size="sm" variant="outline" className="ml-4">
                <Link href="/dashboard/settings/billing">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Upgrader
                </Link>
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

