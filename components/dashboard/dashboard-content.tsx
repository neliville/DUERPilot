'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingModal } from './onboarding-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardWithHelp } from '@/components/ui/card-with-help';
import { Button } from '@/components/ui/button';
import { FileText, TrendingUp, Calendar } from 'lucide-react';
import { api } from '@/lib/trpc/client';
import Link from 'next/link';
import { PlanLimitsBanner } from '@/components/plans';
import { PlanQuotaWarning } from '@/components/plans';
import { PlanUsageSummary } from '@/components/plans';

interface DashboardContentProps {
  user: any;
  hasCompletedInitialOnboarding: boolean;
  initialCompanies: any[];
}

export function DashboardContent({
  user,
  hasCompletedInitialOnboarding,
  initialCompanies,
}: DashboardContentProps) {
  const router = useRouter();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // Rediriger vers l'onboarding initial si pas complété
  useEffect(() => {
    if (!hasCompletedInitialOnboarding) {
      router.push('/onboarding');
      return;
    }
    // Afficher le modal d'onboarding après un court délai
    const timer = setTimeout(() => {
      setShowOnboardingModal(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [hasCompletedInitialOnboarding, router]);

  const { data: companies } = api.companies.getAll.useQuery(undefined, {
    initialData: initialCompanies,
  });

  const { data: workUnits } = api.workUnits.getAll.useQuery();
  const { data: riskAssessments } = api.riskAssessments.getAll.useQuery();
  const { data: actionPlans } = api.actionPlans.getAll.useQuery();
  const { data: duerpVersions } = api.duerpVersions.getAll.useQuery();

  // Calculer le taux de complétion
  const totalSteps = 5;
  let completedSteps = 0;
  if (companies && companies.length > 0) completedSteps++;
  if (workUnits && workUnits.length > 0) completedSteps++;
  if (riskAssessments && riskAssessments.length > 0) completedSteps++;
  if (actionPlans && actionPlans.length > 0) completedSteps++;
  if (duerpVersions && duerpVersions.length > 0) completedSteps++;
  const completionRate = Math.round((completedSteps / totalSteps) * 100);

  const lastDuerp = duerpVersions && duerpVersions.length > 0 ? duerpVersions[0] : null;

  return (
    <>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Bienvenue, {user.name || user.email}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Tableau de bord - DUERP AI
          </p>
        </header>

        {/* Bannière d'alerte des limites */}
        <PlanLimitsBanner />

        {/* Avertissement quota IA */}
        <PlanQuotaWarning />

        {/* Résumé d'utilisation du plan */}
        <PlanUsageSummary />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardWithHelp
            title="Taux de réalisation"
            helpText="Pourcentage de complétion de votre DUERP. Basé sur les 5 étapes clés : Entreprise, Unités, Évaluations, Actions, DUERP généré."
            icon={<TrendingUp className="h-5 w-5" aria-hidden="true" />}
          >
            <div className="text-3xl font-bold text-blue-600">{completionRate}%</div>
            <p className="text-sm text-gray-600 mt-2">
              {completedSteps} sur {totalSteps} étapes complétées
            </p>
          </CardWithHelp>

          <CardWithHelp
            title="Dernier DUERP"
            helpText="Date de la dernière génération de votre DUERP. Le DUERP doit être mis à jour annuellement minimum."
            icon={<FileText className="h-5 w-5" aria-hidden="true" />}
          >
            {lastDuerp ? (
              <div>
                <p className="font-medium">{lastDuerp.company.legalName}</p>
                <p className="text-sm text-gray-600">
                  Année {lastDuerp.year} - Version {lastDuerp.versionNumber}
                </p>
                <Link href="/dashboard/historique">
                  <Button variant="outline" size="sm" className="mt-2">
                    Voir tout →
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-2">Aucun DUERP généré</p>
                <Link href="/dashboard/historique">
                  <Button size="sm">Créer mon DUERP</Button>
                </Link>
              </div>
            )}
          </CardWithHelp>

          <CardWithHelp
            title="Actions en cours"
            helpText="Nombre d'actions de prévention en cours ou à faire. Actions prioritaires nécessitant un suivi."
            icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
          >
            <div className="text-3xl font-bold">
              {actionPlans?.filter((ap) => ap.status === 'en_cours').length || 0}
            </div>
            <p className="text-sm text-gray-600 mt-2">Actions à suivre</p>
          </CardWithHelp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Entreprises</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{companies?.length || 0}</p>
              <Link href="/dashboard/entreprises">
                <Button variant="outline" size="sm" className="mt-2">
                  Gérer →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Évaluations de risques</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{riskAssessments?.length || 0}</p>
              <Link href="/dashboard/evaluations">
                <Button variant="outline" size="sm" className="mt-2">
                  Voir tout →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <OnboardingModal
        open={showOnboardingModal}
        onOpenChange={setShowOnboardingModal}
      />
    </>
  );
}

