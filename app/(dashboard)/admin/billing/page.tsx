'use client';

import { api } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Users, Brain, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminBillingPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { data: mrr, isLoading: mrrLoading } = api.admin.billing.getMRR.useQuery();
  const { data: arr, isLoading: arrLoading } = api.admin.billing.getARR.useQuery();
  const { data: churn, isLoading: churnLoading } = api.admin.billing.getChurnRate.useQuery({
    startDate: monthStart,
    endDate: monthEnd,
  });
  const { data: margins, isLoading: marginsLoading } = api.admin.billing.getMargins.useQuery({ plan: undefined });
  const { data: costs, isLoading: costsLoading } = api.admin.billing.getCosts.useQuery({});

  const isLoading = mrrLoading || arrLoading || churnLoading || marginsLoading || costsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Facturation & Marges</h1>
        <p className="mt-2 text-gray-600">
          MRR, ARR, churn, marges pour pilotage business
        </p>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* MRR Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">MRR Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {mrr?.totalMRR.toLocaleString('fr-FR')} €
                </div>
                <p className="text-base text-muted-foreground font-normal mt-1">
                  Revenus récurrents mensuels
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* ARR Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">ARR Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {arr?.totalARR.toLocaleString('fr-FR')} €
                </div>
                <p className="text-base text-muted-foreground font-normal mt-1">
                  Revenus récurrents annuels
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Churn Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Taux de Churn</CardTitle>
            {churn && churn.totalChurnRate > 5 ? (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ) : (
              <TrendingUp className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div
                  className={cn(
                    'text-2xl font-bold',
                    churn && churn.totalChurnRate > 5 ? 'text-red-600' : 'text-green-600'
                  )}
                >
                  {churn?.totalChurnRate.toFixed(2)}%
                </div>
                <p className="text-base text-muted-foreground font-normal mt-1">
                  {churn?.totalChurn} résiliations ce mois
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Marge Nette */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Marge Nette</CardTitle>
            {margins && getAverageMargin(margins) >= 20 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div
                  className={cn(
                    'text-2xl font-bold',
                    margins && getAverageMargin(margins) >= 20
                      ? 'text-green-600'
                      : 'text-red-600'
                  )}
                >
                  {margins ? getAverageMargin(margins).toFixed(1) : '0'}%
                </div>
                <p className="text-base text-muted-foreground font-normal mt-1">
                  Marge moyenne par plan
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertes */}
      {churn && churn.totalChurnRate > 5 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Taux de churn élevé ({churn.totalChurnRate.toFixed(2)}%). Action requise.
          </AlertDescription>
        </Alert>
      )}

      {margins && getAverageMargin(margins) < 20 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Marge nette faible ({getAverageMargin(margins).toFixed(1)}%). Vérifier les coûts IA.
          </AlertDescription>
        </Alert>
      )}

      {/* MRR par Plan */}
      <Card>
        <CardHeader>
          <CardTitle>MRR par Plan</CardTitle>
          <CardDescription>Répartition des revenus récurrents mensuels</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {mrr?.byPlan &&
                Object.entries(mrr.byPlan).map(([plan, value]) => (
                  <div key={plan} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getPlanBadgeVariant(plan)}>
                        {plan.toUpperCase()}
                      </Badge>
                      <span className="text-base text-muted-foreground font-normal">
                        {getPlanClientCount(plan)} clients
                      </span>
                    </div>
                    <div className="text-lg font-semibold">
                      {value.toLocaleString('fr-FR')} €
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coûts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coûts IA</CardTitle>
            <CardDescription>Coûts IA du mois en cours</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base text-muted-foreground font-normal">Coût total IA</span>
                  <span className="text-2xl font-bold">
                    {costs?.aiCost.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base text-muted-foreground font-normal">Coût moyen / client</span>
                  <span className="text-lg font-semibold">
                    {costs && costs.aiCost > 0 ? (costs.aiCost / (mrr?.byPlan ? Object.values(mrr.byPlan).reduce((a, b) => a + b, 0) / 69 : 1)).toLocaleString('fr-FR') : '0'} €
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coûts Infrastructure</CardTitle>
            <CardDescription>Coûts infrastructure mensuels</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base text-muted-foreground font-normal">Coût total infra</span>
                  <span className="text-2xl font-bold">
                    {costs?.infraCost.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base text-muted-foreground font-normal">Coût total</span>
                  <span className="text-lg font-semibold">
                    {costs?.totalCost.toLocaleString('fr-FR')} €
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Marges par Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Marges par Plan</CardTitle>
          <CardDescription>Marge brute moyenne par plan</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {margins?.byPlan &&
                Object.entries(margins.byPlan).map(([plan, margin]) => (
                  <div key={plan} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getPlanBadgeVariant(plan)}>
                        {plan.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-base text-muted-foreground font-normal">
                        {margin.averageMarginPercentage?.toFixed(1) || '0'}% de marge
                      </span>
                      <span
                        className={cn(
                          'text-lg font-semibold',
                          margin.averageGrossMargin >= 0 ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {margin.averageGrossMargin?.toLocaleString('fr-FR') || '0'} €
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

function getPlanBadgeVariant(plan: string) {
  switch (plan) {
    case 'expert':
      return 'default';
    case 'pro':
      return 'secondary';
    case 'starter':
      return 'outline';
    default:
      return 'outline';
  }
}

function getPlanClientCount(plan: string): number {
  // TODO: Récupérer depuis les données
  return 0;
}

function getAverageMargin(margins: { byPlan: Record<string, any> }): number {
  if (!margins?.byPlan) return 0;
  const plans = Object.values(margins.byPlan);
  if (plans.length === 0) return 0;
  const total = plans.reduce((sum, plan) => sum + (plan.averageMarginPercentage || 0), 0);
  return total / plans.length;
}

