'use client';

import { ParticipationForm } from './participation-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ParticipationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  participation?: any;
  onSuccess: () => void;
}

export function ParticipationDialog({
  open,
  onOpenChange,
  companyId,
  participation,
  onSuccess,
}: ParticipationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {participation ? 'Modifier la participation' : 'Nouvelle participation'}
          </DialogTitle>
          <DialogDescription>
            {participation
              ? 'Modifiez les informations de la participation'
              : 'Enregistrez une consultation, information ou association des travailleurs'}
          </DialogDescription>
        </DialogHeader>
        <ParticipationForm companyId={companyId} participation={participation} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}

