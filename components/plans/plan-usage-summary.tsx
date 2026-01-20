'use client';

import { api } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PLAN_NAMES, PLAN_PRICES, type Plan } from '@/lib/plans';
import { Building2, Users, Briefcase, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PlanUsageSummary() {
  const { data: planInfo } = api.plans.getCurrent.useQuery();

  if (!planInfo || !planInfo.usage) {
    return null;
  }

  const { plan, name, prices, usage, upgradePlan } = planInfo;
  const planName = name || PLAN_NAMES[plan] || plan.toUpperCase();
  
  // Vérifier que prices est un objet valide
  if (!prices || typeof prices !== 'object') {
    console.error('[PlanUsageSummary] prices is not a valid object:', prices);
    return null;
  }

  const usageItems = [
    {
      label: 'Entreprises',
      icon: Building2,
      current: usage.companies.current,
      limit: usage.companies.limit,
      unit: '',
    },
    {
      label: 'Sites',
      icon: Building2,
      current: usage.sites.current,
      limit: usage.sites.limit,
      unit: '',
    },
    {
      label: 'Unités de travail',
      icon: Briefcase,
      current: usage.workUnits.current,
      limit: usage.workUnits.limit,
      unit: '',
    },
    {
      label: 'Utilisateurs',
      icon: Users,
      current: usage.users.current,
      limit: usage.users.limit,
      unit: '',
    },
    {
      label: 'Risques ce mois',
      icon: FileText,
      current: usage.risks.current,
      limit: usage.risks.limit,
      unit: '',
    },
    {
      label: 'Suggestions IA risques',
      icon: Sparkles,
      current: usage.ai?.suggestions_risques?.current || 0,
      limit: usage.ai?.suggestions_risques?.limit || null,
      unit: '',
      percentage: usage.ai?.suggestions_risques?.limit 
        ? Math.round(((usage.ai.suggestions_risques.current || 0) / usage.ai.suggestions_risques.limit) * 100)
        : undefined,
      warning: usage.ai?.suggestions_risques?.warning || false,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Plan actuel
              <Badge variant="outline">{planName}</Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              Votre utilisation actuelle des ressources
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {prices.monthly ?? 0}€<span className="text-sm font-normal text-muted-foreground">/mois</span>
            </div>
            {prices.annual && prices.annual !== (prices.monthly ?? 0) * 12 && (
              <div className="text-xs text-muted-foreground">
                ou {Math.round((prices.annual ?? 0) / 12)}€/mois en annuel
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {usageItems.map((item) => {
            if (item.limit === null || item.limit === Infinity) {
              return (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-medium">{item.current} (illimité)</span>
                </div>
              );
            }

            const percentage = Math.round((item.current / item.limit) * 100);
            const isWarning = percentage >= 80;
            const isExceeded = item.current >= item.limit;

            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={cn(
                      'font-medium',
                      isExceeded && 'text-red-600',
                      isWarning && !isExceeded && 'text-orange-600'
                    )}
                  >
                    {item.current} / {item.limit}
                  </span>
                </div>
                {item.percentage !== undefined ? (
                  <Progress
                    value={item.percentage}
                    className={cn(
                      'h-2',
                      isExceeded && 'bg-red-100',
                      isWarning && !isExceeded && 'bg-orange-100'
                    )}
                  />
                ) : (
                  <Progress value={percentage} className="h-2" />
                )}
              </div>
            );
          })}
        </div>

        {upgradePlan?.plan && (
          <div className="pt-4 border-t">
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/settings/billing">
                <TrendingUp className="mr-2 h-4 w-4" />
                Passer au plan {PLAN_NAMES[upgradePlan.plan] || upgradePlan.name}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

