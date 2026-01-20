'use client';

import { useState } from 'react';
import { Check, Building2, AlertTriangle, ClipboardList, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WorkUnitsStep } from './steps/work-units-step';
import { EvaluationStep } from './steps/evaluation-step';
import { ActionPlanStep } from './steps/action-plan-step';
import { GenerationStep } from './steps/generation-step';

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  {
    id: 1 as Step,
    name: 'Unités de travail',
    icon: Building2,
    description: 'Définissez les unités de travail de votre entreprise',
  },
  {
    id: 2 as Step,
    name: 'Évaluation',
    icon: AlertTriangle,
    description: 'Évaluez les risques avec l\'assistance de l\'IA',
  },
  {
    id: 3 as Step,
    name: 'Plan d\'actions',
    icon: ClipboardList,
    description: 'Générez automatiquement votre plan d\'actions',
  },
  {
    id: 4 as Step,
    name: 'Génération',
    icon: FileText,
    description: 'Générez et exportez votre DUERP',
  },
];

export function AssistantDUERPWizard() {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleStepClick = (step: Step) => {
    setCurrentStep(step);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assistant DUERP</h1>
        <p className="text-gray-600 mt-2">Évaluation des risques professionnels</p>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isClickable = true; // Permettre de naviguer entre les étapes

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <button
                  onClick={() => isClickable && handleStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-full transition-all',
                    isCompleted && 'bg-blue-600 text-white',
                    isCurrent && 'bg-blue-600 text-white ring-4 ring-blue-100',
                    !isCompleted && !isCurrent && 'bg-gray-200 text-gray-500',
                    isClickable && 'cursor-pointer hover:scale-105'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </button>

                {/* Step Label */}
                <div className="ml-3 flex-1">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-blue-600',
                      isCompleted && 'text-gray-900',
                      !isCompleted && !isCurrent && 'text-gray-500'
                    )}
                  >
                    {step.name}
                  </p>
                </div>

                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-1 flex-1 mx-4 rounded-full transition-all',
                      isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning Banner */}
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertDescription className="text-yellow-900 text-sm">
          ⚠️ Ce document a été généré avec l'assistance d'un outil numérique. La responsabilité de l'évaluation et des décisions reste celle de l'employeur.
        </AlertDescription>
      </Alert>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {currentStep === 1 && (
          <WorkUnitsStep onNext={handleNext} onPrevious={handlePrevious} />
        )}
        {currentStep === 2 && (
          <EvaluationStep onNext={handleNext} onPrevious={handlePrevious} />
        )}
        {currentStep === 3 && (
          <ActionPlanStep onNext={handleNext} onPrevious={handlePrevious} />
        )}
        {currentStep === 4 && (
          <GenerationStep onPrevious={handlePrevious} />
        )}
      </div>
    </div>
  );
}
