'use client';

import { WorkUnitForm } from './work-unit-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WorkUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workUnit?: any;
  onSuccess: () => void;
}

export function WorkUnitDialog({
  open,
  onOpenChange,
  workUnit,
  onSuccess,
}: WorkUnitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {workUnit ? 'Modifier l\'unité de travail' : 'Nouvelle unité de travail'}
          </DialogTitle>
          <DialogDescription>
            {workUnit
              ? 'Modifiez les informations de l\'unité de travail'
              : 'Remplissez les informations pour créer une nouvelle unité de travail'}
          </DialogDescription>
        </DialogHeader>
        <WorkUnitForm workUnit={workUnit} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}

