'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, AlertTriangle, Plus, Info, Shield, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface RiskLibraryProps {
  sectorCode?: string;
  onSelectRisk?: (risk: {
    riskId: string;
    intitule: string;
    categoriePrincipale: string;
    situationsTravail: string[];
    dangers: string[];
    dommagesPotentiels: string[];
    preventionCollective: string[];
    preventionOrga: string[];
    preventionIndividuelle: string[];
    referencesReglementaires: string[];
  }) => void;
  selectedRiskIds?: string[];
  showAddButton?: boolean;
}

export function RiskLibrary({
  sectorCode: initialSectorCode,
  onSelectRisk,
  selectedRiskIds = [],
  showAddButton = true,
}: RiskLibraryProps) {
  const [selectedSector, setSelectedSector] = useState<string>(initialSectorCode || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRiskDetail, setSelectedRiskDetail] = useState<string | null>(null);

  // Récupérer les secteurs d'activité
  const { data: sectors } = api.activitySectors.getAll.useQuery({
    active: true,
  });

  // Récupérer les catégories de risques pour le secteur sélectionné (nouveau référentiel central)
  const { data: categories } = api.duerpilotReference.getCategoriesBySector.useQuery(
    { sectorCode: selectedSector },
    { enabled: !!selectedSector }
  );

  // Récupérer les risques du référentiel central consolidé avec hiérarchisation intelligente
  const { data: risks, isLoading } = api.duerpilotReference.getRisksBySector.useQuery(
    {
      sectorCode: selectedSector,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: searchQuery || undefined,
      sortBy: 'prevalence', // Hiérarchisation basée sur la prévalence
      limit: 100,
    },
    { enabled: !!selectedSector }
  );

  // Récupérer les détails d'un risque (nouveau référentiel central)
  const { data: riskDetail } = api.duerpilotReference.getRiskById.useQuery(
    {
      riskId: selectedRiskDetail || '',
      sectorCode: selectedSector,
    },
    { enabled: !!selectedRiskDetail && !!selectedSector }
  );

  const getCriticityColor = (niveau?: string | null) => {
    if (!niveau) return 'bg-gray-100 text-gray-700';
    switch (niveau.toLowerCase()) {
      case 'critique':
        return 'bg-red-100 text-red-700';
      case 'élevé':
        return 'bg-orange-100 text-orange-700';
      case 'moyen':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSelectRisk = (risk: any) => {
    if (onSelectRisk) {
      onSelectRisk({
        riskId: risk.riskId,
        intitule: risk.intitule,
        categoriePrincipale: risk.categoriePrincipale,
        situationsTravail: risk.situationsTravail,
        dangers: risk.dangers,
        dommagesPotentiels: risk.dommagesPotentiels,
        preventionCollective: risk.preventionCollective,
        preventionOrga: risk.preventionOrga,
        preventionIndividuelle: risk.preventionIndividuelle,
        referencesReglementaires: risk.referencesReglementaires,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Sélection du secteur */}
      <Card>
        <CardHeader>
          <CardTitle>Bibliothèque de risques sectoriels</CardTitle>
          <CardDescription>
            Consultez les risques fréquemment observés dans votre secteur d'activité.
            Ces références sont basées sur le référentiel interne DUERPilot et sont indicatives.
            Vous devez les adapter à votre situation réelle avant validation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Secteur d'activité
              </label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un secteur" />
                </SelectTrigger>
                <SelectContent>
                  {sectors?.map((sector) => (
                    <SelectItem key={sector.id} value={sector.code}>
                      {sector.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {categories && categories.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Catégorie de risque
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un risque (titre, catégorie, danger)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des risques */}
      {selectedSector && (
        <div className="space-y-2">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                Chargement des risques...
              </CardContent>
            </Card>
          ) : risks && risks.length > 0 ? (
            risks.map((risk) => {
              const isSelected = selectedRiskIds.includes(risk.riskId);
              return (
                <Card
                  key={risk.id}
                  className={cn(
                    'hover:shadow-md transition-shadow',
                    isSelected && 'ring-2 ring-primary'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{risk.intitule}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {risk.categoriePrincipale}
                              </Badge>
                              {risk.sousCategorie && (
                                <Badge variant="outline" className="text-xs">
                                  {risk.sousCategorie}
                                </Badge>
                              )}
                              {risk.criticiteNiveau && (
                                <Badge className={cn('text-xs', getCriticityColor(risk.criticiteNiveau))}>
                                  {risk.criticiteNiveau}
                                </Badge>
                              )}
                              {risk.isTransversal && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  Transverse
                                </Badge>
                              )}
                            </div>
                            {/* Message pédagogique basé sur la prévalence */}
                            {risk.prevalenceNote && (
                              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                                <Info className="h-3 w-3 inline mr-1" />
                                {risk.prevalenceNote}
                              </div>
                            )}
                          </div>
                        </div>

                        {risk.situationsTravail && risk.situationsTravail.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Situations :</span>{' '}
                            {risk.situationsTravail.slice(0, 2).join(', ')}
                            {risk.situationsTravail.length > 2 && '...'}
                          </div>
                        )}

                        {risk.dangers && risk.dangers.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Dangers :</span>{' '}
                            {risk.dangers.slice(0, 2).join(', ')}
                            {risk.dangers.length > 2 && '...'}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRiskDetail(risk.riskId)}
                            >
                              <Info className="h-4 w-4 mr-1" />
                              Détails
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh]">
                            <DialogHeader>
                              <DialogTitle>{risk.intitule}</DialogTitle>
                              <DialogDescription>
                                Risque référencé dans le secteur {selectedSector}.
                                {riskDetail?.prevalenceNote && (
                                  <span className="block mt-1 text-blue-700">
                                    {riskDetail.prevalenceNote}
                                  </span>
                                )}
                              </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[70vh] pr-4">
                              {riskDetail && (
                                <div className="space-y-6">
                                  {/* Informations générales */}
                                  <div>
                                    <h4 className="font-semibold mb-2">Informations générales</h4>
                                    <div className="space-y-1 text-sm">
                                      <div>
                                        <span className="font-medium">Catégorie :</span>{' '}
                                        {riskDetail.categoriePrincipale}
                                      </div>
                                      {riskDetail.sousCategorie && (
                                        <div>
                                          <span className="font-medium">Sous-catégorie :</span>{' '}
                                          {riskDetail.sousCategorie}
                                        </div>
                                      )}
                                      {riskDetail.criticiteScore && (
                                        <div>
                                          <span className="font-medium">Criticité :</span>{' '}
                                          {riskDetail.criticiteNiveau} (score: {riskDetail.criticiteScore})
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Situations de travail */}
                                  {riskDetail.situationsTravail && riskDetail.situationsTravail.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Situations de travail
                                      </h4>
                                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                        {riskDetail.situationsTravail.map((situation, idx) => (
                                          <li key={idx}>{situation}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Dangers */}
                                  {riskDetail.dangers && riskDetail.dangers.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Dangers identifiés
                                      </h4>
                                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                        {riskDetail.dangers.map((danger, idx) => (
                                          <li key={idx}>{danger}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Dommages potentiels */}
                                  {riskDetail.dommagesPotentiels && riskDetail.dommagesPotentiels.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold mb-2">Dommages potentiels</h4>
                                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                        {riskDetail.dommagesPotentiels.map((dommage, idx) => (
                                          <li key={idx}>{dommage}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Mesures de prévention */}
                                  <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                      <Shield className="h-4 w-4" />
                                      Mesures de prévention
                                    </h4>
                                    <div className="space-y-4">
                                      {riskDetail.preventionCollective && riskDetail.preventionCollective.length > 0 && (
                                        <div>
                                          <h5 className="font-medium text-sm mb-2">Collectives</h5>
                                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                            {riskDetail.preventionCollective.map((mesure, idx) => (
                                              <li key={idx}>{mesure}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {riskDetail.preventionOrga && riskDetail.preventionOrga.length > 0 && (
                                        <div>
                                          <h5 className="font-medium text-sm mb-2">Organisationnelles</h5>
                                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                            {riskDetail.preventionOrga.map((mesure, idx) => (
                                              <li key={idx}>{mesure}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {riskDetail.preventionIndividuelle && riskDetail.preventionIndividuelle.length > 0 && (
                                        <div>
                                          <h5 className="font-medium text-sm mb-2">Individuelles</h5>
                                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                            {riskDetail.preventionIndividuelle.map((mesure, idx) => (
                                              <li key={idx}>{mesure}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Références réglementaires */}
                                  {riskDetail.referencesReglementaires && riskDetail.referencesReglementaires.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold mb-2">Références réglementaires</h4>
                                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                        {riskDetail.referencesReglementaires.map((ref, idx) => (
                                          <li key={idx}>{ref}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>

                        {showAddButton && onSelectRisk && (
                          <Button
                            variant={isSelected ? 'secondary' : 'default'}
                            size="sm"
                            onClick={() => handleSelectRisk(risk)}
                            disabled={isSelected}
                          >
                            {isSelected ? (
                              '✓ Ajouté'
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-1" />
                                Ajouter
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                Aucun risque trouvé pour ce secteur.
                {searchQuery && ' Essayez de modifier votre recherche.'}
                {!searchQuery && ' Les risques sont organisés par prévalence dans ce secteur.'}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!selectedSector && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Veuillez sélectionner un secteur d'activité pour consulter les risques référencés.
            Les risques sont organisés selon leur prévalence observée dans le secteur.
          </CardContent>
        </Card>
      )}

      {/* Message d'information sur les risques transverses */}
      {selectedSector && risks && risks.some((r: any) => r.isTransversal) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-sm text-blue-800">
                <p className="font-medium mb-1">Risques transverses identifiés</p>
                <p>
                  Certains risques sont marqués comme "transverses" car ils sont fréquemment observés dans plusieurs secteurs d'activité similaires.
                  Ils sont suggérés en priorité mais doivent être validés selon votre contexte spécifique.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

