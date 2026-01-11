'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, AlertTriangle } from 'lucide-react';

interface ActionKanbanProps {
  actions: any[];
  onEdit: (action: any) => void;
  onStatusChange: () => void;
}

const statusColumns = [
  { id: 'à_faire', label: 'À faire', color: 'bg-gray-100' },
  { id: 'en_cours', label: 'En cours', color: 'bg-blue-100' },
  { id: 'bloqué', label: 'Bloqué', color: 'bg-red-100' },
  { id: 'terminé', label: 'Terminé', color: 'bg-green-100' },
];

export function ActionKanban({ actions, onEdit, onStatusChange }: ActionKanbanProps) {
  const getActionsByStatus = (status: string) => {
    return actions.filter((action) => action.status === status);
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      basse: 'secondary',
      moyenne: 'default',
      haute: 'default',
      critique: 'destructive',
    };
    return <Badge variant={variants[priority] || 'secondary'} className="text-xs">{priority}</Badge>;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statusColumns.map((column) => {
        const columnActions = getActionsByStatus(column.id);
        return (
          <div key={column.id} className="space-y-2">
            <div className={`${column.color} p-3 rounded-lg`}>
              <h3 className="font-semibold text-sm">
                {column.label} ({columnActions.length})
              </h3>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {columnActions.map((action) => (
                <Card
                  key={action.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onEdit(action)}
                >
                  <CardContent className="p-4">
                    <p className="text-sm font-medium mb-2 line-clamp-2">
                      {action.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {action.type}
                      </Badge>
                      {getPriorityBadge(action.priority)}
                    </div>
                    {action.responsibleName && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <User className="h-3 w-3" />
                        {action.responsibleName}
                      </div>
                    )}
                    {action.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {new Date(action.dueDate).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                    {action.riskAssessment && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <AlertTriangle className="h-3 w-3" />
                          Risque: {action.riskAssessment.priorityLevel}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {columnActions.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400">
                  Aucune action
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

