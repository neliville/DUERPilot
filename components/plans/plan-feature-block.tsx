'use client';

import { useState } from 'react';
import { Lock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlanUpgradeDialog } from './plan-upgrade-dialog';

interface PlanFeatureBlockProps {
  feature: string;
  featureName: string;
  requiredPlan: string;
  currentPlan: string;
  description?: string;
  children?: React.ReactNode;
}

const PLAN_NAMES: Record<string, string> = {
  free: 'FREE',
  starter: 'STARTER',
  business: 'BUSINESS',
  premium: 'PREMIUM',
  entreprise: 'ENTREPRISE',
};

export function PlanFeatureBlock({
  feature,
  featureName,
  requiredPlan,
  currentPlan,
  description,
  children,
}: PlanFeatureBlockProps) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const requiredPlanName = requiredPlan 
    ? (PLAN_NAMES[requiredPlan] || requiredPlan.toUpperCase())
    : 'PREMIUM';

  return (
    <>
      <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">{featureName}</CardTitle>
          <CardDescription>
            {description || `Cette fonctionnalité nécessite le plan ${requiredPlanName}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {children && (
            <div className="rounded-lg bg-background/50 p-4 opacity-50 pointer-events-none">
              {children}
            </div>
          )}

          <div className="flex flex-col gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              Vous êtes actuellement sur le plan <strong>{PLAN_NAMES[currentPlan]}</strong>
            </p>
            <Button
              onClick={() => setShowUpgradeDialog(true)}
              className="w-full"
              size="lg"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Passer au plan {requiredPlanName}
            </Button>
          </div>
        </CardContent>
      </Card>

      <PlanUpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        currentPlan={currentPlan}
        feature={feature}
        reason={`Accès à la fonctionnalité : ${featureName}`}
      />
    </>
  );
}
