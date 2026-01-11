'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Edit } from 'lucide-react';
import { api } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { ImportEditDialog } from './import-edit-dialog';
import type { DuerpStructure } from '@/server/services/import/ia-extractor';

interface ImportValidationProps {
  importId: string;
  extractionData: any;
  onValidationComplete?: () => void;
}

export function ImportValidation({ importId, extractionData, onValidationComplete }: ImportValidationProps) {
  const { toast } = useToast();
  const [validating, setValidating] = useState(false);
  const [validatedData, setValidatedData] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const validateMutation = api.imports.validateImport.useMutation({
    onSuccess: () => {
      toast({
        title: 'Import validé avec succès',
        description: 'Les entités ont été créées',
      });
      if (onValidationComplete) {
        onValidationComplete();
      }
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const structure = extractionData?.structure || {};
  const confidence = structure.confidence || 0;

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (editedStructure: DuerpStructure) => {
    setValidatedData({
      ...extractionData,
      structure: editedStructure,
    });
    toast({
      title: 'Modifications enregistrées',
      description: 'Les données ont été mises à jour',
    });
  };

  const handleValidate = async () => {
    const dataToValidate = validatedData || extractionData;

    setValidating(true);
    try {
      const result = await validateMutation.mutateAsync({
        importId,
        validatedData: dataToValidate,
      });

      // Afficher les statistiques de création
      if (result.stats) {
        toast({
          title: 'Import validé avec succès',
          description: `${result.stats.companies} entreprise(s), ${result.stats.workUnits} unité(s), ${result.stats.risks} risque(s), ${result.stats.actionPlans} plan(s) d'action créé(s)`,
        });
      }
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Validation des données extraites</CardTitle>
          <CardDescription>
            Vérifiez et validez les données extraites de votre document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Indicateur de confiance */}
          {confidence > 0 && (
            <Alert className={confidence >= 80 ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
              <div className="flex items-center gap-2">
                {confidence >= 80 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <AlertDescription>
                  Confiance d'extraction : <strong>{confidence}%</strong>
                  {confidence < 80 && ' - Vérification recommandée'}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Résumé de l'extraction */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {structure.company && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Entreprise</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{structure.company.legalName || 'Non détecté'}</p>
                  {structure.company.siret && (
                    <p className="text-sm text-gray-500">SIRET: {structure.company.siret}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {structure.workUnits && structure.workUnits.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Unités de travail</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{structure.workUnits.length}</p>
                  <p className="text-sm text-gray-500">détectées</p>
                </CardContent>
              </Card>
            )}

            {structure.risks && structure.risks.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Risques</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{structure.risks.length}</p>
                  <p className="text-sm text-gray-500">détectés</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Détails de l'extraction */}
          {structure.workUnits && structure.workUnits.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Unités de travail détectées</h3>
              <div className="space-y-2">
                {structure.workUnits.map((wu: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3">
                    <p className="font-medium">{wu.name}</p>
                    {wu.description && (
                      <p className="text-sm text-gray-500">{wu.description}</p>
                    )}
                    {wu.exposedCount && (
                      <Badge variant="outline" className="mt-2">
                        {wu.exposedCount} personnes exposées
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {structure.risks && structure.risks.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Risques détectés</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {structure.risks.slice(0, 10).map((risk: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{risk.hazard || 'Risque non identifié'}</p>
                        {risk.dangerousSituation && (
                          <p className="text-sm text-gray-500">{risk.dangerousSituation}</p>
                        )}
                        {risk.workUnitName && (
                          <Badge variant="outline" className="mt-1">
                            {risk.workUnitName}
                          </Badge>
                        )}
                      </div>
                      {risk.frequency && risk.probability && risk.severity && risk.control && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Score</p>
                          <p className="font-bold">
                            {risk.frequency * risk.probability * risk.severity * risk.control}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {structure.risks.length > 10 && (
                  <p className="text-sm text-gray-500 text-center">
                    ... et {structure.risks.length - 10} autres risques
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleValidate}
              disabled={validating}
              className="flex-1"
              size="lg"
            >
              {validating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validation en cours...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Valider et créer les entités
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleEdit}
              disabled={validating}
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      {structure && (
        <ImportEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          structure={structure}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

