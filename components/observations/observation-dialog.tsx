'use client';

import { ObservationForm } from './observation-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ObservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  observation?: any;
  onSuccess: () => void;
}

export function ObservationDialog({
  open,
  onOpenChange,
  observation,
  onSuccess,
}: ObservationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {observation ? 'Modifier l\'observation' : 'Nouvelle observation'}
          </DialogTitle>
          <DialogDescription>
            {observation
              ? 'Modifiez les informations de l\'observation'
              : 'Remplissez les informations pour créer une nouvelle observation'}
          </DialogDescription>
        </DialogHeader>
        <ObservationForm observation={observation} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}

