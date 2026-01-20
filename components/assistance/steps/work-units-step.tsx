'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/trpc/client';
import { WorkUnitDialog } from '@/components/work-units/work-unit-dialog';
import { toast } from 'sonner';

interface WorkUnitsStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function WorkUnitsStep({ onNext, onPrevious }: WorkUnitsStepProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWorkUnit, setSelectedWorkUnit] = useState<any>(null);

  const { data: workUnits, isLoading, refetch } = api.workUnits.getAll.useQuery();

  const deleteMutation = api.workUnits.delete.useMutation({
    onSuccess: () => {
      toast.success('Unité de travail supprimée');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (workUnit: any) => {
    setSelectedWorkUnit(workUnit);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette unité de travail ?')) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedWorkUnit(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Unités de travail</h2>
        <p className="text-gray-600 mt-1">
          Créez et gérez les unités de travail de votre entreprise
        </p>
      </div>

      {/* Work Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Chargement...
          </div>
        ) : workUnits && workUnits.length > 0 ? (
          workUnits.map((workUnit) => (
            <Card key={workUnit.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{workUnit.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4" />
                      {workUnit.exposedCount} personnes
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(workUnit)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(workUnit.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {workUnit.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {workUnit._count?.riskAssessments || 0} risques
                  </span>
                  {(workUnit._count?.riskAssessments || 0) > 0 && (
                    <Badge variant="destructive">
                      {workUnit._count?.riskAssessments} prioritaire
                      {(workUnit._count?.riskAssessments || 0) > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">Aucune unité de travail créée</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une unité de travail
            </Button>
          </div>
        )}
      </div>

      {/* Add Button */}
      {workUnits && workUnits.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={() => setIsDialogOpen(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une UT
          </Button>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-end pt-6 border-t">
        <Button onClick={onNext} size="lg">
          Suivant →
        </Button>
      </div>

      {/* Work Unit Dialog */}
      <WorkUnitDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        workUnit={selectedWorkUnit}
        onSuccess={handleDialogClose}
      />
    </div>
  );
}
