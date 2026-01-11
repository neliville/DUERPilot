'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanUpgradeDialog } from './plan-upgrade-dialog';
import { Sparkles, Lock, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PLAN_NAMES, type Plan } from '@/lib/plans';
import { cn } from '@/lib/utils';

interface PlanBlockMessageProps {
  currentPlan: Plan;
  requiredPlan: Plan;
  type: 'ia' | 'method' | 'feature' | 'quota' | 'limit';
  featureName?: string;
  className?: string;
  onContinue?: () => void;
}

const MESSAGES: Record<
  Plan,
  Record<string, { title: string; description: string; benefits: string[]; icon: any }>
> = {
  free: {
    ia: {
      title: 'Fonctionnalité avancée',
      description:
        'Cette fonctionnalité utilise l\'assistance intelligente pour vous faire gagner du temps. Avec le plan Free, vous pouvez réaliser votre DUERP de manière autonome et conforme, mais sans assistance automatique.',
      benefits: [
        'Suggestions d\'actions de prévention',
        'Cotation indicative des risques',
        'Accompagnement pas à pas adapté à votre activité',
      ],
      icon: Sparkles,
    },
    method: {
      title: 'Méthode guidée indisponible',
      description:
        'La méthode guidée vous permet d\'être accompagné à partir de votre secteur d\'activité. Elle est disponible à partir du plan Starter, conçu pour les TPE souhaitant gagner du temps sans expertise QSE.',
      benefits: [
        'Questions guidées par secteur d\'activité',
        'Référentiels OiRA complets',
        'Assistance IA pour suggestions',
      ],
      icon: Lock,
    },
  },
  starter: {
    feature: {
      title: 'Structuration avancée requise',
      description:
        'Les unités de travail permettent une évaluation plus fine et mieux défendable en cas de contrôle ou d\'audit. Cette fonctionnalité est disponible dans le plan Pro, pensé pour les PME souhaitant structurer leur démarche QSE.',
      benefits: [
        'Évaluation par unité de travail',
        'Cotation F×P×G×M complète',
        'Structuration défendable en audit',
      ],
      icon: Lock,
    },
    quota: {
      title: 'Quota d\'assistance atteint',
      description:
        'Vous avez utilisé l\'ensemble des suggestions intelligentes incluses dans votre plan Starter.',
      benefits: [
        'Quota d\'assistance étendu',
        'Analyses plus détaillées',
        'Structuration par unité de travail',
      ],
      icon: AlertTriangle,
    },
  },
  pro: {
    quota: {
      title: 'Capacité d\'assistance atteinte',
      description:
        'Votre plan Pro inclut une assistance avancée, mais limitée afin de garantir des performances optimales.',
      benefits: [
        'Utilisation libre des deux méthodes d\'évaluation',
        'Analyses transverses approfondies',
        'Accompagnement prioritaire',
      ],
      icon: AlertTriangle,
    },
    feature: {
      title: 'Fonctionnalité Expert',
      description:
        'La gestion multi-sites et l\'historique long terme sont conçus pour les organisations matures avec des exigences d\'audit élevées.',
      benefits: [
        'Multi-entreprises et multi-sites',
        'Historique long terme illimité',
        'Support prioritaire et coaching',
      ],
      icon: Lock,
    },
  },
  expert: {
    usage: {
      title: 'Usage intensif détecté',
      description:
        'Vous utilisez fortement l\'assistance intelligente ce mois-ci. Toutes les fonctionnalités restent disponibles. Un suivi est assuré pour garantir la qualité du service.',
      benefits: [],
      icon: Info,
    },
  },
};

// Messages spécifiques pour les limites par ressource
const LIMIT_MESSAGES: Record<string, Record<Plan, { title: string; description: string; benefits: string[] }>> = {
  companies: {
    free: {
      title: 'Limite d\'entreprise atteinte',
      description: 'Votre plan Free inclut une entreprise, ce qui permet de réaliser un DUERP conforme pour une structure unique. Pour gérer plusieurs entreprises, passez au plan supérieur.',
      benefits: [
        'Gérer plusieurs entreprises si nécessaire',
        'Accéder à des fonctionnalités avancées',
        'Bénéficier d\'un accompagnement renforcé',
      ],
    },
    starter: {
      title: 'Limite d\'entreprise atteinte',
      description: 'Votre plan Starter inclut une entreprise. Pour gérer plusieurs entreprises, passez au plan Pro.',
      benefits: [
        'Gérer plusieurs entreprises',
        'Structuration avancée par entreprise',
        'Historique et versioning complet',
      ],
    },
    pro: {
      title: 'Limite d\'entreprise atteinte',
      description: 'Votre plan Pro inclut une entreprise. Pour gérer plusieurs entreprises, passez au plan Expert.',
      benefits: [
        'Gérer un nombre illimité d\'entreprises',
        'Multi-sites et multi-établissements',
        'Accompagnement prioritaire',
      ],
    },
    expert: {
      title: 'Limite d\'entreprise atteinte',
      description: 'Contactez le support pour discuter d\'une extension personnalisée.',
      benefits: [],
    },
  },
  sites: {
    free: {
      title: 'Gestion multi-sites disponible',
      description: 'La gestion de plusieurs sites est disponible à partir du plan Expert, conçue pour les organisations matures.',
      benefits: [
        'Gérer plusieurs sites et établissements',
        'Structurer votre DUERP par site',
        'Accéder à un accompagnement prioritaire',
      ],
    },
    starter: {
      title: 'Gestion multi-sites disponible',
      description: 'La gestion de plusieurs sites est disponible à partir du plan Expert, conçue pour les organisations matures.',
      benefits: [
        'Gérer plusieurs sites et établissements',
        'Structurer votre DUERP par site',
        'Accéder à un accompagnement prioritaire',
      ],
    },
    pro: {
      title: 'Gestion multi-sites disponible',
      description: 'La gestion de plusieurs sites est disponible à partir du plan Expert, conçue pour les organisations matures.',
      benefits: [
        'Gérer un nombre illimité de sites',
        'Multi-établissements et multi-sites',
        'Accompagnement prioritaire',
      ],
    },
    expert: {
      title: 'Limite de sites atteinte',
      description: 'Contactez le support pour discuter d\'une extension personnalisée.',
      benefits: [],
    },
  },
};

export function PlanBlockMessage({
  currentPlan,
  requiredPlan,
  type,
  featureName,
  className,
  onContinue,
}: PlanBlockMessageProps) {
  const router = useRouter();
  const planMessages = MESSAGES[currentPlan];
  const message = planMessages?.[type];

  // Messages personnalisés pour les limites selon le type de ressource
  let customMessage = message;
  if (type === 'limit' && featureName) {
    const resourceKey = featureName.toLowerCase().includes('entreprise') ? 'companies' : 
                        featureName.toLowerCase().includes('site') ? 'sites' : null;
    
    if (resourceKey && LIMIT_MESSAGES[resourceKey]?.[currentPlan]) {
      const limitMessage = LIMIT_MESSAGES[resourceKey][currentPlan];
      customMessage = {
        ...limitMessage,
        icon: Info,
      };
    } else if (!message) {
      customMessage = {
        title: 'Limite atteinte',
        description: `Vous avez utilisé l'ensemble des ${featureName.toLowerCase()} inclus dans votre plan ${PLAN_NAMES[currentPlan]}. Passez au plan ${PLAN_NAMES[requiredPlan]} pour accéder à des limites supérieures.`,
        benefits: [
          'Limites étendues',
          'Fonctionnalités avancées',
          'Accompagnement renforcé',
        ],
        icon: Info,
      };
    }
  }

  if (!customMessage) {
    // Message par défaut si non défini
    return (
      <Alert className={cn('border-blue-200 bg-blue-50', className)}>
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Information</AlertTitle>
        <AlertDescription className="text-blue-800">
          Cette fonctionnalité nécessite le plan {PLAN_NAMES[requiredPlan]}.
        </AlertDescription>
      </Alert>
    );
  }

  const Icon = customMessage.icon;
  const isQuota = type === 'quota';
  const isWarning = type === 'limit';

  return (
    <Card className={cn('border-2', className)}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'rounded-full p-2',
              isWarning
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                : isQuota
                  ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
                  : 'bg-muted'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{customMessage.title}</CardTitle>
            <CardDescription className="mt-2 text-base">
              {customMessage.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      {customMessage.benefits.length > 0 && (
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-3">
              {isWarning ? 'Avec le plan supérieur, vous pourrez :' : `Avec le plan ${PLAN_NAMES[requiredPlan]}, vous bénéficiez :`}
            </p>
            <ul className="space-y-2">
              {customMessage.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <PlanUpgradeDialog
              currentPlan={currentPlan}
              requiredPlan={requiredPlan}
              reason={customMessage.description}
            >
              <Button 
                className="flex-1" 
                size="lg"
                onClick={() => router.push('/dashboard/settings/billing')}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Découvrir le plan {PLAN_NAMES[requiredPlan]}
              </Button>
            </PlanUpgradeDialog>
            {onContinue && !isWarning && (
              <Button
                variant="outline"
                size="lg"
                onClick={onContinue}
                className="flex-1"
              >
                Continuer sans assistance
              </Button>
            )}
          </div>

          {isWarning && (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                Votre conformité reste assurée avec votre plan actuel. Cette limite concerne uniquement les fonctionnalités avancées.
              </p>
            </div>
          )}
        </CardContent>
      )}
      
      {customMessage.benefits.length === 0 && (
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              className="flex-1" 
              size="lg"
              onClick={() => router.push('/dashboard/settings/billing')}
            >
              Découvrir le plan {PLAN_NAMES[requiredPlan]}
            </Button>
            {onContinue && (
              <Button
                variant="outline"
                size="lg"
                onClick={onContinue}
                className="flex-1"
              >
                Fermer
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

