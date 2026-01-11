'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RiskLibrary } from '@/components/referentiel/risk-library';
import { BookOpen, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RiskLibraryIntegrationProps {
  workUnitId?: string;
  onRiskSelected: (risk: {
    intitule: string;
    situationsTravail: string[];
    dangers: string[];
    dommagesPotentiels: string[];
    preventionCollective: string[];
    preventionOrga: string[];
    preventionIndividuelle: string[];
    referencesReglementaires: string[];
  }) => void;
}

/**
 * Composant d'intégration de la bibliothèque de risques dans le formulaire d'évaluation
 * Permet de sélectionner un risque depuis les référentiels sectoriels et de pré-remplir le formulaire
 */
export function RiskLibraryIntegration({
  workUnitId,
  onRiskSelected,
}: RiskLibraryIntegrationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Récupérer l'unité de travail pour déterminer le secteur
  const { data: workUnit } = api.workUnits.getById.useQuery(
    { id: workUnitId! },
    { enabled: !!workUnitId }
  );

  // Récupérer le secteur suggéré pour l'unité de travail
  const sectorCode = workUnit?.suggestedSector?.code || null;

  // Utiliser le nouveau référentiel central consolidé pour les suggestions
  const { data: suggestedRisks } = api.duerpilotReference.suggestRisksForWorkUnit.useQuery(
    {
      workUnitId: workUnitId!,
      sectorCode: sectorCode || undefined,
      limit: 20,
    },
    { enabled: !!workUnitId && !!sectorCode }
  );

  const handleRiskSelect = (risk: any) => {
    // Construire une description contextuelle à partir des situations de travail
    const contextDescription = risk.situationsTravail && risk.situationsTravail.length > 0
      ? risk.situationsTravail.join('. ') + '.'
      : risk.intitule;

    // Appeler le callback avec les données formatées
    onRiskSelected({
      intitule: risk.intitule,
      situationsTravail: risk.situationsTravail || [],
      dangers: risk.dangers || [],
      dommagesPotentiels: risk.dommagesPotentiels || [],
      preventionCollective: risk.preventionCollective || [],
      preventionOrga: risk.preventionOrga || [],
      preventionIndividuelle: risk.preventionIndividuelle || [],
      referencesReglementaires: risk.referencesReglementaires || [],
    });

    setIsOpen(false);
    toast({
      title: 'Risque sélectionné',
      description: `Le risque "${risk.intitule}" a été ajouté. Veuillez l'adapter à votre situation réelle.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          <BookOpen className="h-4 w-4 mr-2" />
          Sélectionner depuis la bibliothèque sectorielle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Bibliothèque de risques sectoriels
          </DialogTitle>
          <DialogDescription>
            Sélectionnez un risque fréquemment observé dans votre secteur d'activité.
            Les risques sont organisés selon leur prévalence dans le secteur.
            Ces références sont indicatives et doivent être adaptées à votre situation réelle avant validation.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <RiskLibrary
            sectorCode={sectorCode || undefined}
            onSelectRisk={handleRiskSelect}
            showAddButton={true}
          />
        </div>
        <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-blue-800 space-y-1">
            <p className="font-medium">Information importante :</p>
            <p>
              Les risques proposés sont basés sur le référentiel interne DUERPilot et organisés selon leur prévalence observée dans votre secteur.
              Les risques marqués comme "fréquents" ou "transverses" sont des suggestions prioritaires, mais ils doivent être validés et adaptés selon votre situation réelle avant finalisation.
            </p>
            <p className="text-xs mt-2 opacity-90">
              Aucune évaluation n'est automatique. Vous restez responsable de la validation et de l'adaptation de chaque risque à votre contexte.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

