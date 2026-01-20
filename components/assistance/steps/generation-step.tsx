'use client';

import { FileText, Download, History, Building2, AlertTriangle, ClipboardList, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/trpc/client';
import Link from 'next/link';
import { toast } from 'sonner';

interface GenerationStepProps {
  onPrevious: () => void;
}

export function GenerationStep({ onPrevious }: GenerationStepProps) {
  const { data: workUnits } = api.workUnits.getAll.useQuery();
  const { data: riskAssessments } = api.riskAssessments.getAll.useQuery();
  const { data: actionPlans } = api.actionPlans.getAll.useQuery();

  const workUnitsCount = workUnits?.length || 0;
  const risksCount = riskAssessments?.length || 0;
  const priorityRisksCount = riskAssessments?.filter(
    (r) => r.priorityLevel === 'Prioritaire' || r.priorityLevel === 'Critique'
  ).length || 0;
  const actionsCount = actionPlans?.length || 0;

  const generateMutation = api.duerpVersions.generate.useMutation({
    onSuccess: () => {
      toast.success('DUERP généré avec succès !');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleGeneratePDF = async () => {
    try {
      await generateMutation.mutateAsync({});
    } catch (error) {
      console.error('Error generating DUERP:', error);
    }
  };

  const handleExportCSV = () => {
    toast.info('Export CSV en cours de développement');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Génération</h2>
        <p className="text-gray-600 mt-1">
          Résumé de votre évaluation et génération du DUERP
        </p>
      </div>

      {/* Summary Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Résumé de l'évaluation</h3>
        <p className="text-sm text-gray-600 mb-4">
          Vérifiez les données avant de générer le DUERP
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-600">{workUnitsCount}</p>
                  <p className="text-sm text-gray-600 mt-1">Unités de travail</p>
                </div>
                <Building2 className="w-10 h-10 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-600">{risksCount}</p>
                  <p className="text-sm text-gray-600 mt-1">Risques évalués</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-red-600">{priorityRisksCount}</p>
                  <p className="text-sm text-gray-600 mt-1">Risques prioritaires</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-purple-600">{actionsCount}</p>
                  <p className="text-sm text-gray-600 mt-1">Actions définies</p>
                </div>
                <ClipboardList className="w-10 h-10 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generation Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <CardTitle>Générer le DUERP</CardTitle>
          </div>
          <CardDescription>
            Le Document Unique sera généré au format PDF et archivé dans l'historique. Une nouvelle version sera créée pour l'année en cours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription className="text-sm">
              ⚠️ Ce document a été généré avec l'assistance d'un outil numérique. La responsabilité de l'évaluation et des décisions reste celle de l'employeur.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              onClick={handleGeneratePDF}
              disabled={generateMutation.isPending || workUnitsCount === 0 || risksCount === 0}
              size="lg"
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              {generateMutation.isPending ? 'Génération en cours...' : 'Générer le PDF'}
            </Button>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>

          {(workUnitsCount === 0 || risksCount === 0) && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">
                Vous devez avoir au moins une unité de travail et un risque évalué pour générer le DUERP.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* History Link */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Historique des DUERP</p>
                <p className="text-sm text-gray-600">
                  Consultez toutes les versions générées
                </p>
              </div>
            </div>
            <Link href="/dashboard/historique">
              <Button variant="outline">
                Voir l'historique →
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button onClick={onPrevious} variant="outline" size="lg">
          ← Retour
        </Button>
        <Link href="/dashboard">
          <Button size="lg" variant="default">
            <CheckCircle className="w-4 h-4 mr-2" />
            Terminer
          </Button>
        </Link>
      </div>
    </div>
  );
}
