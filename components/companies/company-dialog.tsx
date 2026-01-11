'use client';

import { CompanyForm } from './company-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: any;
  onSuccess: () => void;
}

export function CompanyDialog({
  open,
  onOpenChange,
  company,
  onSuccess,
}: CompanyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {company ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
          </DialogTitle>
          <DialogDescription>
            {company
              ? 'Modifiez les informations de l\'entreprise'
              : 'Remplissez les informations pour créer une nouvelle entreprise'}
          </DialogDescription>
        </DialogHeader>
        <CompanyForm company={company} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}

