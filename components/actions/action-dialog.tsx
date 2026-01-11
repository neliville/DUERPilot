'use client';

import { ActionForm } from './action-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: any;
  onSuccess: () => void;
}

export function ActionDialog({
  open,
  onOpenChange,
  action,
  onSuccess,
}: ActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {action ? 'Modifier l\'action' : 'Nouvelle action'}
          </DialogTitle>
          <DialogDescription>
            {action
              ? 'Modifiez les informations de l\'action'
              : 'Remplissez les informations pour créer une nouvelle action'}
          </DialogDescription>
        </DialogHeader>
        <ActionForm action={action} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}

