'use client';

import { api } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Building2, Users, Briefcase, FileText, Zap } from 'lucide-react';
import { PLAN_NAMES, PLAN_PRICES, PLAN_DESCRIPTIONS, type Plan } from '@/lib/plans';
import { PlanUsageSummary } from '@/components/plans';
import { PlanQuotaWarning } from '@/components/plans';
import { cn } from '@/lib/utils';

export default function BillingPage() {
  const { data: planInfo } = api.plans.getCurrentPlan.useQuery();
  const { data: allPlans } = api.plans.getAllPlans.useQuery();

  if (!planInfo || !allPlans) {
    return <div>Chargement...</div>;
  }

  const currentPlan = planInfo.plan;
  const currentPlanIndex = allPlans.findIndex((p) => p.key === currentPlan);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Facturation et Plans</h1>
        <p className="mt-2 text-gray-600">
          Gérez votre abonnement et consultez votre utilisation
        </p>
      </div>

      {/* Avertissement quota */}
      <PlanQuotaWarning />

      {/* Résumé d'utilisation */}
      <PlanUsageSummary />

      {/* Comparaison des plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Plans disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {allPlans.map((plan) => {
            const isCurrent = plan.key === currentPlan;
            const isUpgrade = currentPlanIndex < allPlans.findIndex((p) => p.key === plan.key);

            return (
              <Card
                key={plan.key}
                className={cn(
                  'relative',
                  isCurrent && 'border-2 border-primary',
                  isUpgrade && 'border-dashed'
                )}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Plan actuel</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {isCurrent && <Check className="h-5 w-5 text-primary" />}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">
                      {plan.price.monthly}€
                      <span className="text-sm font-normal text-muted-foreground">/mois</span>
                    </div>
                    {plan.price.annual !== plan.price.monthly && (
                      <div className="text-sm text-muted-foreground">
                        ou {plan.price.annual}€/mois en annuel (-20%)
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">IA :</span>
                      </div>
                      <div className="ml-6 space-y-1 text-xs">
                        {plan.features.maxAISuggestionsRisks === 0 && plan.features.maxAISuggestionsActions === 0 && !plan.features.hasAIReformulation ? (
                          <span>Aucune IA</span>
                        ) : (
                          <>
                            {plan.features.maxAISuggestionsRisks > 0 && (
                              <div>• {plan.features.maxAISuggestionsRisks === Infinity ? 'Illimité' : `${plan.features.maxAISuggestionsRisks}/mois`} suggestions risques</div>
                            )}
                            {plan.features.maxAISuggestionsActions > 0 && (
                              <div>• {plan.features.maxAISuggestionsActions === Infinity ? 'Illimité' : `${plan.features.maxAISuggestionsActions}/mois`} suggestions actions</div>
                            )}
                            {plan.features.hasAIReformulation && (
                              <div>• Reformulation illimitée</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {plan.features.maxCompanies === Infinity
                          ? 'Entreprises illimitées'
                          : `${plan.features.maxCompanies} entreprise(s)`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {plan.features.maxWorkUnits === 0
                          ? 'Pas d\'unités de travail'
                          : plan.features.maxWorkUnits === Infinity
                            ? 'Unités illimitées'
                            : `${plan.features.maxWorkUnits} unités max`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {plan.features.maxUsers === Infinity
                          ? 'Utilisateurs illimités'
                          : `${plan.features.maxUsers} utilisateur(s)`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {plan.features.maxExportsPerMonth === Infinity
                          ? 'Exports illimités'
                          : `${plan.features.maxExportsPerMonth} export(s)/mois`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="text-xs font-medium">Modes d'évaluation :</div>
                    <div className="space-y-1">
                      {plan.features.methods.map((method) => (
                        <div key={method} className="flex items-center gap-2 text-xs">
                          <Check className="h-3 w-3 text-green-600" />
                          <span>
                            {method === 'duerp_generique'
                              ? 'DUERP générique'
                              : 'INRS structuré'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isCurrent ? (
                    <Button disabled className="w-full" variant="outline">
                      Plan actuel
                    </Button>
                  ) : isUpgrade ? (
                    <Button className="w-full">
                      <Zap className="mr-2 h-4 w-4" />
                      Passer à {plan.name}
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      Downgrade non disponible
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

