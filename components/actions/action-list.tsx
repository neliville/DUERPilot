'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ClipboardList, AlertTriangle, Calendar, User } from 'lucide-react';
import { ActionDialog } from './action-dialog';
import { Badge } from '@/components/ui/badge';
import { ActionKanban } from './action-kanban';

interface ActionListProps {
  initialData: any[];
}

export function ActionList({ initialData }: ActionListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const { data: actions, refetch } = api.actionPlans.getAll.useQuery(
    {
      status:
        statusFilter !== 'all'
          ? (statusFilter as 'à_faire' | 'en_cours' | 'bloqué' | 'terminé')
          : undefined,
    },
    {
      initialData,
    }
  );

  const handleCreate = () => {
    setSelectedAction(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (action: any) => {
    setSelectedAction(action);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedAction(null);
    refetch();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      à_faire: 'secondary',
      en_cours: 'default',
      bloqué: 'destructive',
      terminé: 'outline',
    };
    const labels: Record<string, string> = {
      à_faire: 'À faire',
      en_cours: 'En cours',
      bloqué: 'Bloqué',
      terminé: 'Terminé',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      basse: 'secondary',
      moyenne: 'default',
      haute: 'default',
      critique: 'destructive',
    };
    return <Badge variant={variants[priority] || 'secondary'}>{priority}</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liste des actions</CardTitle>
            <div className="flex gap-4">
              <Select value={viewMode} onValueChange={(v: 'table' | 'kanban') => setViewMode(v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Vue tableau</SelectItem>
                  <SelectItem value="kanban">Vue Kanban</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="à_faire">À faire</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="bloqué">Bloqué</SelectItem>
                  <SelectItem value="terminé">Terminé</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle action
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'kanban' ? (
            <ActionKanban
              actions={actions || []}
              onEdit={handleEdit}
              onStatusChange={() => refetch()}
            />
          ) : actions && actions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="max-w-md">
                      <p className="text-sm line-clamp-2">{action.description}</p>
                      {action.riskAssessment && (
                        <p className="text-xs text-gray-500 mt-1">
                          Risque: {action.riskAssessment.priorityLevel}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{action.type}</Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(action.priority)}</TableCell>
                    <TableCell>{getStatusBadge(action.status)}</TableCell>
                    <TableCell>
                      {action.responsibleName ? (
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-400" />
                            {action.responsibleName}
                          </div>
                          {action.responsibleEmail && (
                            <p className="text-xs text-gray-500">
                              {action.responsibleEmail}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {action.dueDate ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {new Date(action.dueDate).toLocaleDateString('fr-FR')}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(action)}
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
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Aucune action
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par créer une nouvelle action.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle action
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ActionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        action={selectedAction}
        onSuccess={handleSuccess}
      />
    </>
  );
}

