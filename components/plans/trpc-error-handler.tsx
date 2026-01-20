'use client';

import { TRPCClientErrorLike } from '@trpc/client';
import { PlanBlockMessage } from './plan-block-message';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';
import { api } from '@/lib/trpc/client';
import { PLAN_NAMES, getUpgradePlan, type Plan } from '@/lib/plans';

interface TRPCErrorHandlerProps {
  error: TRPCClientErrorLike<any> | Error | null;
  currentPlan?: Plan;
  onDismiss?: () => void;
}

export function TRPCErrorHandler({ error, currentPlan, onDismiss }: TRPCErrorHandlerProps) {
  const { data: planInfo } = api.plans.getCurrent.useQuery(undefined, {
    enabled: !currentPlan,
  });

  const plan = currentPlan || planInfo?.plan || 'free';

  if (!error) {
    return null;
  }

  const errorMessage = error.message || 'Une erreur est survenue';
  const errorCode = 'code' in error ? error.code : null;

  // Détecter les erreurs de plan (qui ne sont pas vraiment des erreurs)
  if (errorCode === 'FORBIDDEN' || errorCode === 'QUOTA_EXCEEDED') {
    // Détecter les limites atteintes
    if (errorMessage.includes('limite') || errorMessage.includes('atteint') || errorMessage.includes('Limite atteinte')) {
      // Extraire les informations du message pour afficher PlanBlockMessage
      if (errorMessage.includes('entreprises') || errorMessage.includes('companies')) {
        const upgradePlan = getUpgradePlan(plan);
        return (
          <PlanBlockMessage
            currentPlan={plan}
            requiredPlan={upgradePlan || 'starter'}
            type="limit"
            featureName="Entreprises"
            onContinue={onDismiss}
          />
        );
      }
      if (errorMessage.includes('unité') || errorMessage.includes('workUnit') || errorMessage.includes('unités de travail')) {
        return (
          <PlanBlockMessage
            currentPlan={plan}
            requiredPlan="business"
            type="feature"
            featureName="Unités de travail"
            onContinue={onDismiss}
          />
        );
      }
      if (errorMessage.includes('sites')) {
        const upgradePlan = getUpgradePlan(plan);
        return (
          <PlanBlockMessage
            currentPlan={plan}
            requiredPlan={upgradePlan || 'expert'}
            type="limit"
            featureName="Sites"
            onContinue={onDismiss}
          />
        );
      }
      // Message générique pour limite
      const upgradePlan = getUpgradePlan(plan);
      return (
        <PlanBlockMessage
          currentPlan={plan}
          requiredPlan={upgradePlan || 'starter'}
          type="limit"
          onContinue={onDismiss}
        />
      );
    }

    // Essayer de détecter le type d'erreur depuis le message
    if (errorMessage.includes('méthode structurée') || errorMessage.includes('inrs') || errorMessage.includes('INRS')) {
      return (
        <PlanBlockMessage
          currentPlan={plan}
          requiredPlan="starter"
          type="method"
          featureName="Méthode structurée (inspirée INRS)"
          onContinue={onDismiss}
        />
      );
    }

    if (errorMessage.includes('méthode') || errorMessage.includes('duerp_generique')) {
      return (
        <PlanBlockMessage
          currentPlan={plan}
          requiredPlan="free"
          type="method"
          featureName="Méthode DUERP générique"
          onContinue={onDismiss}
        />
      );
    }

    if (errorMessage.includes('quota') || errorMessage.includes('IA') || errorMessage.includes('assistance')) {
      const upgradePlan = getUpgradePlan(plan);
      return (
        <PlanBlockMessage
          currentPlan={plan}
          requiredPlan={upgradePlan || 'expert'}
          type="quota"
          onContinue={onDismiss}
        />
      );
    }

    if (errorMessage.includes('unité') || errorMessage.includes('workUnit')) {
      return (
        <PlanBlockMessage
          currentPlan={plan}
          requiredPlan="pro"
          type="feature"
          featureName="Unités de travail"
          onContinue={onDismiss}
        />
      );
    }
  }

  // Message d'information générique (pas d'erreur destructive pour les limites de plan)
  if (errorMessage.includes('limite') || errorMessage.includes('plan') || errorMessage.includes('quota')) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Information</AlertTitle>
        <AlertDescription className="text-blue-800">
          <p>{errorMessage}</p>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="mt-2 text-sm underline hover:no-underline text-blue-700"
              aria-label="Fermer ce message"
            >
              Fermer
            </button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Message d'erreur réel (seulement pour les vraies erreurs)
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Erreur</AlertTitle>
      <AlertDescription>
        <p>{errorMessage}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="mt-2 text-sm underline hover:no-underline"
            aria-label="Fermer cette erreur"
          >
            Fermer
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}

