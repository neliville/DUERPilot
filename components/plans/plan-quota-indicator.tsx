'use client';

import { api } from '@/lib/trpc/client';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

interface PlanQuotaIndicatorProps {
  feature: string;
  label: string;
  showUpgrade?: boolean;
}

export function PlanQuotaIndicator({ 
  feature, 
  label,
  showUpgrade = true 
}: PlanQuotaIndicatorProps) {
  const { data: usage, isLoading } = api.plans.getUsage.useQuery({ feature });

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
        <div className="h-2 w-full bg-muted rounded" />
      </div>
    );
  }

  if (!usage) return null;

  const percentage = Math.min(usage.percentage, 100);
  const isWarning = usage.isWarning;
  const isExceeded = usage.isExceeded;
  const isUnlimited = usage.limit === Infinity;

  if (isUnlimited) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="text-sm text-muted-foreground">
            {usage.current} / Illimité
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {usage.current} / {usage.limit}
        </span>
      </div>

      <Progress
        value={percentage}
        className={
          isExceeded
            ? 'bg-red-100 [&>div]:bg-red-500'
            : isWarning
            ? 'bg-orange-100 [&>div]:bg-orange-500'
            : 'bg-primary/20'
        }
      />

      {isWarning && !isExceeded && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-sm text-orange-800">
            Vous approchez de la limite ({Math.round(percentage)}%)
          </AlertDescription>
        </Alert>
      )}

      {isExceeded && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between text-sm">
            <span className="text-red-800 font-medium">Limite atteinte</span>
            {showUpgrade && (
              <Button size="sm" variant="destructive" asChild>
                <Link href="/dashboard/settings/plan">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Passer au plan supérieur
                </Link>
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
