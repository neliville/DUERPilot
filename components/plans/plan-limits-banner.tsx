'use client';

import { api } from '@/lib/trpc/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export function PlanLimitsBanner() {
  const { data: planInfo } = api.plans.getCurrentPlan.useQuery();

  if (!planInfo) {
    return null;
  }

  const { plan, usage, upgradePlan } = planInfo;

  // Vérifier les limites atteintes ou proches
  const warnings: Array<{ resource: string; current: number; limit: number | null; percentage: number }> = [];

  // Quota IA
  if (usage.iaa.limit > 0) {
    const percentage = usage.iaa.percentage;
    if (percentage >= 80) {
      warnings.push({
        resource: 'Appels IA',
        current: usage.iaa.current,
        limit: usage.iaa.limit,
        percentage,
      });
    }
  }

  // Autres ressources
  const checkLimit = (
    resource: string,
    current: number,
    limit: number | null
  ) => {
    if (limit !== null && current >= limit * 0.8) {
      warnings.push({
        resource,
        current,
        limit,
        percentage: Math.round((current / limit) * 100),
      });
    }
  };

  checkLimit('Entreprises', usage.companies.current, usage.companies.limit);
  checkLimit('Sites', usage.sites.current, usage.sites.limit);
  checkLimit('Unités de travail', usage.workUnits.current, usage.workUnits.limit);
  checkLimit('Utilisateurs', usage.users.current, usage.users.limit);
  checkLimit('Risques/mois', usage.risks.current, usage.risks.limit);

  if (warnings.length === 0) {
    return null;
  }

  const criticalWarning = warnings.find((w) => w.percentage >= 100);

  return (
    <Alert
      variant={criticalWarning ? 'destructive' : 'default'}
      className="mb-4"
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        {criticalWarning
          ? 'Limite atteinte'
          : 'Attention : limites proches'}
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <div className="space-y-1">
          {warnings.map((warning) => (
            <div key={warning.resource} className="text-sm">
              <strong>{warning.resource} :</strong> {warning.current}
              {warning.limit !== null && ` / ${warning.limit}`} (
              {warning.percentage}%)
              {warning.percentage >= 100 && (
                <span className="ml-2 text-red-600 font-semibold">
                  LIMITE ATTEINTE
                </span>
              )}
            </div>
          ))}
        </div>
        {upgradePlan && (
          <div className="pt-2">
            <Button asChild size="sm" variant={criticalWarning ? 'default' : 'outline'}>
              <Link href="/dashboard/settings/billing">
                <TrendingUp className="mr-2 h-4 w-4" />
                Passer au plan {upgradePlan}
              </Link>
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

