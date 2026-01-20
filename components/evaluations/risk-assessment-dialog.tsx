'use client';

import { RiskAssessmentForm } from './risk-assessment-form';
import { MethodSelector } from './method-selector';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { EvaluationMethod } from '@/lib/evaluation-methods';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RiskAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment?: any;
  onSuccess: () => void;
  workUnitId?: string;
}

export function RiskAssessmentDialog({
  open,
  onOpenChange,
  assessment,
  onSuccess,
  workUnitId,
}: RiskAssessmentDialogProps) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<EvaluationMethod | null>(null);

  const handleSuccess = () => {
    setSelectedMethod(null);
    onSuccess();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Réinitialiser l'état quand le dialog se ferme
      setSelectedMethod(null);
    }
    onOpenChange(newOpen);
  };

  const handleBackToMethodSelection = () => {
    setSelectedMethod(null);
  };

  const handleMethodSelect = (method: EvaluationMethod) => {
    // Si c'est la méthode "Assistance IA", rediriger vers la page d'assistance
    if (method === 'assistance_ia') {
      onOpenChange(false);
      router.push('/dashboard/assistance');
      return;
    }
    
    // Sinon, sélectionner la méthode normalement
    setSelectedMethod(method);
  };

  // Si une méthode est sélectionnée, afficher le formulaire
  if (selectedMethod) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToMethodSelection}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
              <div>
                <DialogTitle>
                  {assessment ? 'Modifier l\'évaluation' : 'Nouvelle évaluation de risque'}
                </DialogTitle>
                <DialogDescription>
                  Méthode : {selectedMethod === 'duerp_generique' ? 'DUERP Générique' : 'INRS'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <RiskAssessmentForm 
            assessment={assessment} 
            onSuccess={handleSuccess}
            workUnitId={workUnitId || assessment?.workUnitId}
            evaluationMethod={selectedMethod}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Sinon, afficher le sélecteur de méthode
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assessment ? 'Modifier l\'évaluation' : 'Nouvelle évaluation de risque'}
          </DialogTitle>
          <DialogDescription>
            Choisissez la méthode d'évaluation adaptée à vos besoins
          </DialogDescription>
        </DialogHeader>
        <MethodSelector
          selectedMethod={selectedMethod}
          onMethodSelect={handleMethodSelect}
          showKeyMessage={true}
        />
      </DialogContent>
    </Dialog>
  );
}

