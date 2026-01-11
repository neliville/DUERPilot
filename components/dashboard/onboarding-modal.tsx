'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/trpc/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, Building2, Users, AlertTriangle, ClipboardList } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
  route?: string;
}

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(4); // Étape 4 par défaut (Planifiez vos actions)

  // Vérifier l'état de complétion
  const { data: companies } = api.companies.getAll.useQuery();
  const { data: workUnits } = api.workUnits.getAll.useQuery();
  const { data: riskAssessments } = api.riskAssessments.getAll.useQuery();
  const { data: actionPlans } = api.actionPlans.getAll.useQuery();
  const { data: duerpVersions } = api.duerpVersions.getAll.useQuery();

  const hasCompany = Boolean(companies && companies.length > 0);
  const hasWorkUnits = Boolean(workUnits && workUnits.length > 0);
  const hasRiskAssessments = Boolean(riskAssessments && riskAssessments.length > 0);
  const hasActionPlans = Boolean(actionPlans && actionPlans.length > 0);
  const hasDuerp = Boolean(duerpVersions && duerpVersions.length > 0);

  // Déterminer l'étape active
  useEffect(() => {
    if (!hasCompany) {
      setCurrentStep(1);
    } else if (!hasWorkUnits) {
      setCurrentStep(2);
    } else if (!hasRiskAssessments) {
      setCurrentStep(3);
    } else if (!hasActionPlans) {
      setCurrentStep(4);
    } else if (!hasDuerp) {
      setCurrentStep(5);
    } else {
      // Toutes les étapes sont complétées
      onOpenChange(false);
    }
  }, [hasCompany, hasWorkUnits, hasRiskAssessments, hasActionPlans, hasDuerp, onOpenChange]);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: 'Configurez votre entreprise',
      description: 'Renseignez les informations légales et créez vos sites',
      icon: <Building2 className="h-5 w-5" />,
      completed: hasCompany,
      active: currentStep === 1,
      route: '/dashboard/entreprises',
    },
    {
      id: 2,
      title: 'Créez vos unités de travail',
      description: 'Définissez les différents secteurs d\'activité à évaluer',
      icon: <Users className="h-5 w-5" />,
      completed: hasWorkUnits,
      active: currentStep === 2,
      route: '/dashboard/work-units',
    },
    {
      id: 3,
      title: 'Évaluez les risques',
      description: 'Identifiez et cotez les dangers avec l\'aide de l\'IA',
      icon: <AlertTriangle className="h-5 w-5" />,
      completed: hasRiskAssessments,
      active: currentStep === 3,
      route: '/dashboard/evaluations',
    },
    {
      id: 4,
      title: 'Planifiez vos actions',
      description: 'Générez automatiquement un plan de prévention',
      icon: <ClipboardList className="h-5 w-5" />,
      completed: hasActionPlans,
      active: currentStep === 4,
      route: '/dashboard/actions',
    },
    {
      id: 5,
      title: 'Générez votre DUERP',
      description: 'Créez et téléchargez le document officiel',
      icon: <FileText className="h-5 w-5" />,
      completed: hasDuerp,
      active: currentStep === 5,
      route: '/dashboard/historique',
    },
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps.find((s) => s.id === currentStep);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-lg">✨</span>
            </div>
            <div>
              <DialogTitle className="text-2xl">
                Bienvenue sur DUERP AI
              </DialogTitle>
              <DialogDescription>
                Votre assistant pour la gestion du Document Unique
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Comment ça fonctionne ?</h3>
            <p className="text-gray-600">
              DUERP AI vous guide dans la création et la mise à jour de votre DUERP en 5 étapes simples.
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((step) => (
              <Card
                key={step.id}
                className={`p-4 transition-all ${
                  step.active
                    ? 'border-blue-500 bg-blue-50'
                    : step.completed
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed
                        ? 'bg-green-500 text-white'
                        : step.active
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">
                        {step.id}. {step.title}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    {step.route && (
                      <Link href={step.route}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => onOpenChange(false)}
                        >
                          Accéder →
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-600 text-sm">💡</span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Conseil :</strong> L'IA vous assiste à chaque étape pour suggérer des dangers pertinents, aider à la cotation et générer automatiquement des actions de prévention.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Précédent
            </Button>
            <div className="flex gap-2">
              {currentStepData?.route && (
                <Link href={currentStepData.route}>
                  <Button onClick={() => onOpenChange(false)}>
                    Accéder à l'étape →
                  </Button>
                </Link>
              )}
              <Button onClick={handleNext} disabled={currentStep === 5}>
                Suivant →
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

