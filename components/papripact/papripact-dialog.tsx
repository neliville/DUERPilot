'use client';

import { useEffect } from 'react';
import { PAPRIPACTForm } from './papripact-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PAPRIPACTDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  papripact?: any;
  onSuccess: () => void;
}

export function PAPRIPACTDialog({
  open,
  onOpenChange,
  companyId,
  papripact,
  onSuccess,
}: PAPRIPACTDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {papripact ? `Modifier le PAPRIPACT ${papripact.year}` : 'Nouveau PAPRIPACT'}
          </DialogTitle>
          <DialogDescription>
            {papripact
              ? 'Modifiez les informations du PAPRIPACT'
              : 'Créez un nouveau Plan d\'Actions de Prévention des Risques et d\'Amélioration des Conditions de Travail'}
          </DialogDescription>
        </DialogHeader>
        <PAPRIPACTForm companyId={companyId} papripact={papripact} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}

