'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Calendar, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { PAPRIPACTDialog } from './papripact-dialog';
import { LegalMessageBanner } from '@/components/legal/legal-message-banner';

interface PAPRIPACTListProps {
  companyId: string;
  employeeCount?: number | null;
  initialData?: any[];
}

export function PAPRIPACTList({ companyId, employeeCount, initialData }: PAPRIPACTListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPAPRIPACT, setSelectedPAPRIPACT] = useState<any>(null);

  // Vérifier l'éligibilité
  const { data: eligibility } = api.papripact.checkEligibility.useQuery(
    { companyId },
    {
      enabled: !!companyId,
    }
  );

  const { data: papripacts, refetch } = api.papripact.getAll.useQuery(
    { companyId },
    {
      initialData,
    }
  );

  const isEligible = eligibility?.eligible ?? (employeeCount !== null && employeeCount !== undefined && employeeCount >= 50);

  const handleCreate = () => {
    const currentYear = new Date().getFullYear();
    setSelectedPAPRIPACT(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (papripact: any) => {
    setSelectedPAPRIPACT(papripact);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedPAPRIPACT(null);
    refetch();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      brouillon: 'secondary',
      validé: 'default',
      en_cours: 'default',
      terminé: 'outline',
    };
    const labels: Record<string, string> = {
      brouillon: 'Brouillon',
      validé: 'Validé',
      en_cours: 'En cours',
      terminé: 'Terminé',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  // Si non éligible, ne pas afficher le composant
  if (!isEligible) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>PAPRIPACT</CardTitle>
            </div>
            <Button onClick={handleCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau PAPRIPACT
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <LegalMessageBanner type="papripact" employeeCount={employeeCount} />

          {papripacts && papripacts.length > 0 ? (
            <div className="space-y-3">
              {papripacts.map((papripact: any) => (
                <div
                  key={papripact.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleEdit(papripact)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">PAPRIPACT {papripact.year}</h3>
                      {getStatusBadge(papripact.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{papripact.actions?.length || 0} actions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>{papripact.indicators?.length || 0} indicateurs</span>
                      </div>
                      {papripact.validatedAt && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Validé le {new Date(papripact.validatedAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Voir détails
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium mb-2">Aucun PAPRIPACT créé</p>
              <p className="text-sm">
                Le PAPRIPACT est obligatoire pour les entreprises de 50 salariés et plus.
              </p>
              <Button onClick={handleCreate} className="mt-4" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Créer le PAPRIPACT {new Date().getFullYear()}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <PAPRIPACTDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        companyId={companyId}
        papripact={selectedPAPRIPACT}
        onSuccess={handleSuccess}
      />
    </>
  );
}

