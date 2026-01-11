'use client';

import { RiskAssessmentForm } from './risk-assessment-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MethodAccessGuardImproved } from '@/components/plans';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assessment ? 'Modifier l\'évaluation' : 'Nouvelle évaluation de risque'}
          </DialogTitle>
          <DialogDescription>
            Évaluez le risque selon les critères F×P×G×M
          </DialogDescription>
        </DialogHeader>
        <MethodAccessGuardImproved
          method="inrs"
          onContinue={() => onOpenChange(false)}
        >
          <RiskAssessmentForm 
            assessment={assessment} 
            onSuccess={onSuccess}
            workUnitId={workUnitId || assessment?.workUnitId}
          />
        </MethodAccessGuardImproved>
      </DialogContent>
    </Dialog>
  );
}

