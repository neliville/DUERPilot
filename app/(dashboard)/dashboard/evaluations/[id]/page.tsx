import { notFound } from 'next/navigation';
import { getServerApi } from '@/lib/trpc/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Building2,
  Users,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { RiskMatrix } from '@/components/evaluations/risk-matrix';

export default async function RiskAssessmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const api = await getServerApi();
  const assessment = await api.riskAssessments.getById({ id: params.id });

  if (!assessment) {
    notFound();
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      faible: 'secondary',
      'à_améliorer': 'default',
      prioritaire: 'destructive',
    };
    return (
      <Badge variant={variants[priority] || 'secondary'} className="text-lg px-3 py-1">
        {priority === 'à_améliorer' ? 'À améliorer' : priority}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Évaluation de Risque
        </h1>
        <p className="mt-2 text-gray-600">Détails de l'évaluation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Situation dangereuse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{assessment.dangerousSituation?.label || 'Non spécifié'}</p>
            <Badge className="mt-2">{assessment.dangerousSituation?.category?.label || 'Non catégorisé'}</Badge>
            {assessment.dangerousSituation?.description && (
              <p className="mt-2 text-sm text-gray-600">
                {assessment.dangerousSituation.description}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contexte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Unité de Travail</p>
              <p className="text-sm">{assessment.workUnit.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Site</p>
              <p className="text-sm">{assessment.workUnit.site.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Entreprise</p>
              <p className="text-sm">{assessment.workUnit.site.company.legalName}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score et Priorité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Score de risque</p>
                <p className="text-3xl font-bold text-gray-900">
                  {assessment.riskScore}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Niveau de priorité</p>
                <div className="mt-2">{getPriorityBadge(assessment.priorityLevel)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Situation dangereuse</CardTitle>
        </CardHeader>
        <CardContent>
          {assessment.dangerousSituation && (
            <div className="space-y-2 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Référence</p>
                <p className="text-gray-900 font-semibold">{assessment.dangerousSituation.label}</p>
              </div>
              {assessment.dangerousSituation.category && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Catégorie</p>
                  <Badge variant="outline">{assessment.dangerousSituation.category.label}</Badge>
                </div>
              )}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Description contextuelle</p>
            <p className="text-gray-700 whitespace-pre-wrap">
              {assessment.contextDescription || 'Non spécifiée'}
            </p>
          </div>
          {assessment.exposedPersons && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Personnes exposées</p>
              <p className="text-gray-700 whitespace-pre-wrap">
                {assessment.exposedPersons}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matrice de cotation F×P×G×M</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium text-gray-500">Fréquence</p>
              <p className="text-2xl font-bold">{assessment.frequency}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium text-gray-500">Probabilité</p>
              <p className="text-2xl font-bold">{assessment.probability}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium text-gray-500">Gravité</p>
              <p className="text-2xl font-bold">{assessment.severity}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium text-gray-500">Maîtrise</p>
              <p className="text-2xl font-bold">{assessment.control}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {assessment.existingMeasures && (
        <Card>
          <CardHeader>
            <CardTitle>Mesures de prévention existantes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">
              {assessment.existingMeasures}
            </p>
          </CardContent>
        </Card>
      )}

      {assessment.validatedAt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <p className="text-sm">
                Validé par {assessment.validatedBy} le{' '}
                {new Date(assessment.validatedAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {assessment.actionPlans && assessment.actionPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plans d'actions associés ({assessment.actionPlans.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assessment.actionPlans.map((action: any) => (
                <div
                  key={action.id}
                  className="p-3 border rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{action.description}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{action.type}</Badge>
                      <Badge variant="outline">{action.priority}</Badge>
                      <Badge variant="outline">{action.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

