'use client';

import { api } from '@/lib/trpc/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanQuotaIndicator } from './plan-quota-indicator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const FEATURE_LABELS: Record<string, string> = {
  maxWorkUnits: 'Unités de travail',
  maxUsers: 'Utilisateurs',
  maxCompanies: 'Entreprises',
  maxSites: 'Sites',
  maxRisksPerMonth: 'Évaluations de risques (mois)',
  maxPlansActionPerMonth: 'Plans d\'action (mois)',
  maxObservationsPerMonth: 'Observations (mois)',
  maxExportsPerMonth: 'Exports DUERP (année)',
  maxImportsPerMonth: 'Imports DUERP (mois)',
  maxAISuggestionsRisks: 'Suggestions IA risques (mois)',
  maxAISuggestionsActions: 'Suggestions IA actions (mois)',
};

const PLAN_NAMES: Record<string, string> = {
  free: 'FREE',
  starter: 'STARTER',
  business: 'BUSINESS',
  premium: 'PREMIUM',
  entreprise: 'ENTREPRISE',
};

export function PlanUsageDashboard() {
  const { data: currentPlan, isLoading: isLoadingPlan } = api.plans.getCurrent.useQuery();
  const { data: allUsage, isLoading: isLoadingUsage } = api.plans.getAllUsage.useQuery();

  if (isLoadingPlan || isLoadingUsage) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!currentPlan || !allUsage) {
    return null;
  }

  const planName = PLAN_NAMES[currentPlan.current] || currentPlan.current.toUpperCase();
  const hasWarnings = allUsage.usage.some((u) => u.isWarning || u.isExceeded);

  return (
    <div className="space-y-6">
      {/* Header avec plan actuel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Utilisation de votre plan</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Plan actuel :</span>
                <Badge variant="default" className="text-base px-3 py-1">
                  {planName}
                </Badge>
              </div>
            </div>
            {currentPlan.upgradePlan && (
              <Button asChild>
                <Link href="/dashboard/settings/plan">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Passer au plan {PLAN_NAMES[currentPlan.upgradePlan.plan]}
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Alertes si warnings */}
      {hasWarnings && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">
              ⚠️ Attention aux limites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700">
              Certaines de vos limites approchent ou ont été atteintes. Pensez à passer à un
              plan supérieur pour continuer à utiliser toutes les fonctionnalités.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grille des quotas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Structure organisationnelle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PlanQuotaIndicator
              feature="maxCompanies"
              label={FEATURE_LABELS.maxCompanies}
            />
            <PlanQuotaIndicator
              feature="maxSites"
              label={FEATURE_LABELS.maxSites}
            />
            <PlanQuotaIndicator
              feature="maxWorkUnits"
              label={FEATURE_LABELS.maxWorkUnits}
            />
            <PlanQuotaIndicator
              feature="maxUsers"
              label={FEATURE_LABELS.maxUsers}
            />
          </CardContent>
        </Card>

        {/* Évaluations et actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Évaluations & Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PlanQuotaIndicator
              feature="maxRisksPerMonth"
              label={FEATURE_LABELS.maxRisksPerMonth}
            />
            <PlanQuotaIndicator
              feature="maxPlansActionPerMonth"
              label={FEATURE_LABELS.maxPlansActionPerMonth}
            />
            <PlanQuotaIndicator
              feature="maxObservationsPerMonth"
              label={FEATURE_LABELS.maxObservationsPerMonth}
            />
          </CardContent>
        </Card>

        {/* Exports et imports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exports & Imports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PlanQuotaIndicator
              feature="maxExportsPerMonth"
              label={FEATURE_LABELS.maxExportsPerMonth}
            />
            <PlanQuotaIndicator
              feature="maxImportsPerMonth"
              label={FEATURE_LABELS.maxImportsPerMonth}
            />
          </CardContent>
        </Card>

        {/* IA (si disponible) */}
        {(allUsage.usage.some((u) => u.feature === 'maxAISuggestionsRisks') ||
          allUsage.usage.some((u) => u.feature === 'maxAISuggestionsActions')) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Intelligence Artificielle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PlanQuotaIndicator
                feature="maxAISuggestionsRisks"
                label={FEATURE_LABELS.maxAISuggestionsRisks}
              />
              <PlanQuotaIndicator
                feature="maxAISuggestionsActions"
                label={FEATURE_LABELS.maxAISuggestionsActions}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
