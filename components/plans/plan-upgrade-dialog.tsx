'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, TrendingUp, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface PlanUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
  feature?: string;
  reason?: string;
}

const PLAN_NAMES: Record<string, string> = {
  free: 'FREE',
  starter: 'STARTER',
  business: 'BUSINESS',
  premium: 'PREMIUM',
  entreprise: 'ENTREPRISE',
};

const PLAN_PRICES: Record<string, { monthly: number; annual: number }> = {
  free: { monthly: 0, annual: 0 },
  starter: { monthly: 59, annual: 590 },
  business: { monthly: 149, annual: 1490 },
  premium: { monthly: 349, annual: 3490 },
  entreprise: { monthly: 0, annual: 0 },
};

const PLAN_FEATURES: Record<string, string[]> = {
  starter: [
    'Méthode INRS',
    '10 unités de travail',
    '3 utilisateurs',
    '30 risques/mois',
    '150 plans d\'action/mois',
    '300 observations/mois',
  ],
  business: [
    'IA assistive (100 suggestions/mois)',
    'Import DUERP (10/mois)',
    'Exports avancés (Word, Excel)',
    'API REST',
    '50 unités de travail',
    '10 utilisateurs',
    '150 risques/mois',
    '600 plans d\'action/mois',
    '1000 observations/mois',
  ],
  premium: [
    'IA avancée (300 suggestions risques, 100 actions)',
    'Multi-tenant',
    'Support prioritaire + Chat',
    '200 unités de travail',
    '30 utilisateurs',
    '500 risques/mois',
    '2000 plans d\'action/mois',
    '3000 observations/mois',
    'Module PAPRIPACT',
  ],
  entreprise: [
    'Limites sur mesure',
    'SSO / LDAP',
    'White-label',
    'Intégrations ERP',
    'Account Manager dédié',
    'SLA 2h',
  ],
};

export function PlanUpgradeDialog({
  open,
  onOpenChange,
  currentPlan,
  feature,
  reason,
}: PlanUpgradeDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { data: planData } = api.plans.getCurrent.useQuery();
  const requestUpgrade = api.plans.requestUpgrade.useMutation();

  const upgradePlan = planData?.upgradePlan?.plan || 'starter';
  const upgradePlanName = PLAN_NAMES[upgradePlan] || upgradePlan.toUpperCase();
  const upgradePlanPrice = PLAN_PRICES[upgradePlan];
  const upgradePlanFeatures = PLAN_FEATURES[upgradePlan] || [];

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      if (upgradePlan === 'entreprise') {
        // Rediriger vers le formulaire de contact ENTREPRISE
        router.push('/contact/enterprise');
        onOpenChange(false);
      } else {
        // Demander l'upgrade
        await requestUpgrade.mutateAsync({
          targetPlan: upgradePlan as 'starter' | 'business' | 'premium',
          reason: reason || feature,
        });

        toast({
          title: 'Demande d\'upgrade envoyée',
          description: 'Notre équipe va vous contacter sous peu.',
        });

        onOpenChange(false);
        router.push('/dashboard/settings/plan');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la demande d\'upgrade.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Passer au plan {upgradePlanName}
          </DialogTitle>
          <DialogDescription>
            Débloquez de nouvelles fonctionnalités et augmentez vos limites
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Prix */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {upgradePlanPrice.monthly > 0 ? `${upgradePlanPrice.monthly}€` : 'Sur devis'}
            </span>
            {upgradePlanPrice.monthly > 0 && (
              <span className="text-muted-foreground">/mois</span>
            )}
          </div>

          {/* Badge du plan actuel */}
          <div className="flex items-center gap-2">
            <Badge variant="outline">Plan actuel : {PLAN_NAMES[currentPlan]}</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="default">{upgradePlanName}</Badge>
          </div>

          {/* Fonctionnalités */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Fonctionnalités incluses :</p>
            <ul className="space-y-2">
              {upgradePlanFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Raison de l'upgrade */}
          {reason && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                <strong>Raison :</strong> {reason}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Plus tard
          </Button>
          <Button onClick={handleUpgrade} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {upgradePlan === 'entreprise' ? 'Nous contacter' : 'Passer à ce plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
