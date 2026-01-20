'use client';

import { Clock, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ActionPlanStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function ActionPlanStep({ onNext, onPrevious }: ActionPlanStepProps) {
  const { data: actionPlans, isLoading } = api.actionPlans.getAll.useQuery();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'Terminée';
      case 'in_progress':
        return 'En cours';
      case 'pending':
        return 'À faire';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plan d'actions</h2>
          <p className="text-gray-600 mt-1">
            Aperçu des actions de prévention générées à partir de vos évaluations
          </p>
        </div>
        <Link href="/dashboard/actions">
          <Button variant="outline">
            Voir toutes les actions →
          </Button>
        </Link>
      </div>

      {/* Action Plans List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Chargement...</p>
            </CardContent>
          </Card>
        ) : actionPlans && actionPlans.length > 0 ? (
          actionPlans.slice(0, 10).map((action) => (
            <Card key={action.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn('text-xs', getStatusColor(action.status))}>
                        {getStatusLabel(action.status)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {action.type}
                      </Badge>
                      <span className={cn('text-xs font-medium', getPriorityColor(action.priority))}>
                        {action.priority === 'high' && '🔴 Haute'}
                        {action.priority === 'medium' && '🟠 Moyenne'}
                        {action.priority === 'low' && '🟢 Basse'}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-2">{action.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {action.responsibleName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {action.responsibleName}
                        </span>
                      )}
                      {action.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(action.dueDate).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium text-gray-900 mb-2">Aucune action définie</h3>
              <p className="text-sm text-gray-500 mb-4">
                Les actions seront générées automatiquement à partir de vos évaluations de risques
              </p>
              <Button variant="outline" onClick={onPrevious}>
                ← Retour aux évaluations
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button onClick={onPrevious} variant="outline" size="lg">
          ← Retour
        </Button>
        <Button onClick={onNext} size="lg">
          Suivant →
        </Button>
      </div>
    </div>
  );
}
