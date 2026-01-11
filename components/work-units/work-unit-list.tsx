'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Building2, AlertTriangle, ClipboardList } from 'lucide-react';
import { WorkUnitDialog } from './work-unit-dialog';
import { Badge } from '@/components/ui/badge';

interface WorkUnitListProps {
  initialData: any[];
}

export function WorkUnitList({ initialData }: WorkUnitListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWorkUnit, setSelectedWorkUnit] = useState<any>(null);

  const { data: workUnits, refetch } = api.workUnits.getAll.useQuery(
    undefined,
    {
      initialData,
    }
  );

  const handleCreate = () => {
    setSelectedWorkUnit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (workUnit: any) => {
    setSelectedWorkUnit(workUnit);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedWorkUnit(null);
    refetch();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liste des unités de travail</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle unité
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {workUnits && workUnits.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Site / Entreprise</TableHead>
                  <TableHead>Effectif exposé</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Statistiques</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workUnits.map((workUnit) => (
                  <TableRow key={workUnit.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        {workUnit.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 className="h-3 w-3 text-gray-400" />
                          {workUnit.site.name}
                        </div>
                        <span className="text-xs text-gray-500">
                          {workUnit.site.company.legalName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {workUnit.exposedCount ? (
                        <Badge variant="secondary">
                          {workUnit.exposedCount} personnes
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {workUnit.responsibleName ? (
                        <div className="text-sm">
                          <p>{workUnit.responsibleName}</p>
                          {workUnit.responsibleEmail && (
                            <p className="text-xs text-gray-500">
                              {workUnit.responsibleEmail}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {workUnit._count?.riskAssessments || 0}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <ClipboardList className="h-3 w-3" />
                          {workUnit._count?.actionPlans || 0}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(workUnit)}
                      >
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Aucune unité de travail
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par créer une nouvelle unité de travail.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle unité
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <WorkUnitDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        workUnit={selectedWorkUnit}
        onSuccess={handleSuccess}
      />
    </>
  );
}

