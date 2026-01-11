'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { PLAN_NAMES, PLAN_PRICES, type Plan } from '@/lib/plans';

interface PlanUpgradeDialogProps {
  currentPlan: Plan;
  requiredPlan: Plan;
  reason: string;
  children: React.ReactNode;
}

export function PlanUpgradeDialog({
  currentPlan,
  requiredPlan,
  reason,
  children,
}: PlanUpgradeDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: allPlans } = api.plans.getAllPlans.useQuery();

  if (!allPlans) {
    return null;
  }

  const currentPlanIndex = allPlans.findIndex((p) => p.key === currentPlan);
  const requiredPlanIndex = allPlans.findIndex((p) => p.key === requiredPlan);
  const availablePlans = allPlans.slice(currentPlanIndex + 1);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mise à niveau requise</DialogTitle>
          <DialogDescription>{reason}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Plan actuel :</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {PLAN_NAMES[currentPlan]}
              </span>
              <Badge variant="outline">{PLAN_PRICES[currentPlan].monthly}€/mois</Badge>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">
              Plans disponibles pour la mise à niveau :
            </p>
            {availablePlans.map((plan) => {
              const isRequired = plan.key === requiredPlan;
              const isMinimum = plan.key === availablePlans[0]?.key;

              return (
                <div
                  key={plan.key}
                  className={`p-4 border rounded-lg ${
                    isRequired
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{plan.name}</h3>
                        {isRequired && (
                          <Badge variant="default">Recommandé</Badge>
                        )}
                        {isMinimum && !isRequired && (
                          <Badge variant="secondary">Minimum requis</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {PLAN_PRICES[plan.key].monthly}€
                        <span className="text-sm font-normal text-muted-foreground">
                          /mois
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ou {PLAN_PRICES[plan.key].annual}€/mois en annuel (-20%)
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>
                        {plan.features.methods.length} mode(s) d'évaluation
                      </span>
                    </div>
                    {plan.features.maxIAAUsage > 0 && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>
                          {plan.features.maxIAAUsage} appels IA/mois
                        </span>
                      </div>
                    )}
                    {plan.features.maxWorkUnits !== 0 && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>
                          {plan.features.maxWorkUnits === Infinity
                            ? 'Unités de travail illimitées'
                            : `${plan.features.maxWorkUnits} unités de travail`}
                        </span>
                      </div>
                    )}
                    {plan.features.hasHistory && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Historique complet</span>
                      </div>
                    )}
                    {plan.features.hasAPI && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>API REST</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <Button
                      className="w-full"
                      variant={isRequired ? 'default' : 'outline'}
                      onClick={() => {
                        // Rediriger vers la page de facturation
                        window.location.href = '/dashboard/settings/billing';
                      }}
                    >
                      Choisir {plan.name}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

