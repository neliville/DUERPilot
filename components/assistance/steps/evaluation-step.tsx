'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Plus, Edit, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { RiskAssessmentDialogWizard } from '../risk-assessment-dialog-wizard';

// Labels pour les cotations
const cotationLabels = {
  frequency: {
    1: 'Rare',
    2: 'Occasionnelle',
    3: 'Fréquente',
    4: 'Permanent',
  },
  probability: {
    1: 'Très faible',
    2: 'Faible',
    3: 'Moyenne',
    4: 'Élevée',
  },
  severity: {
    1: 'Bénin',
    2: 'Léger',
    3: 'Grave',
    4: 'Très grave',
  },
  control: {
    1: 'Très bonne maîtrise',
    2: 'Bonne maîtrise',
    3: 'Maîtrise partielle',
    4: 'Maîtrise insuffisante',
  },
} as const;

// Mapping des catégories vers les couleurs (style exact de l'image)
const getCategoryColor = (categoryCode?: string) => {
  if (!categoryCode) return 'bg-gray-100 text-gray-800';
  
  const code = categoryCode.toLowerCase();
  if (code.includes('machine') || code.includes('equipement') || code.includes('mécanique')) {
    return 'bg-[#FF8C00] text-white'; // Orange/marron pour Machines
  }
  if (code.includes('chimique') || code.includes('substance') || code.includes('poussière')) {
    return 'bg-[#800080] text-white'; // Violet pour Chimique
  }
  if (code.includes('physique') || code.includes('bruit') || code.includes('vibration') || code.includes('ergonomique')) {
    return 'bg-[#ADD8E6] text-[#1e40af]'; // Bleu clair pour Physique (texte bleu foncé)
  }
  return 'bg-gray-100 text-gray-800';
};

// Composant de carte de risque dans le style de l'image
function RiskCard({ 
  risk, 
  onEdit, 
  onGenerateActions, 
  isExpanded = false,
  onToggleExpand,
  isGenerating = false
}: { 
  risk: any; // Type simplifié pour éviter les conflits avec Prisma 
  onEdit: () => void; 
  onGenerateActions: (risk: any) => void | Promise<void>;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isGenerating?: boolean;
}) {
  const priorityLevel = risk.priorityLevel || '';
  const riskScore = risk.riskScore || 0;
  const categoryCode = risk.dangerousSituation?.category?.code || '';
  const categoryLabel = risk.dangerousSituation?.category?.label || 'Non catégorisé';

  // Couleurs des badges de priorité (style exact de l'image)
  const getPriorityBadgeStyle = () => {
    if (priorityLevel === 'prioritaire') {
      return 'bg-[#FF0000] text-white border-0'; // Rouge vif, texte blanc, pas de bordure
    }
    if (priorityLevel === 'à_améliorer') {
      return 'bg-[#FFD700] text-gray-900 border border-gray-300'; // Jaune/orange, texte noir, bordure grise
    }
    return 'bg-gray-200 text-gray-700 border border-gray-300';
  };

  const getPriorityIcon = () => {
    if (priorityLevel === 'prioritaire') {
      return <AlertCircle className="w-3 h-3 text-white" />;
    }
    if (priorityLevel === 'à_améliorer') {
      return <AlertCircle className="w-3 h-3 text-gray-900" />;
    }
    return null;
  };

  const getPriorityLabel = () => {
    if (priorityLevel === 'à_améliorer') return 'À améliorer';
    if (priorityLevel === 'prioritaire') return 'Prioritaire';
    return 'Faible';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 space-y-4">
      {/* En-tête avec badge, titre et tag */}
      <div className="flex items-start justify-between gap-4">
        {/* Badge de priorité à gauche (style exact de l'image) */}
        <div className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0',
          getPriorityBadgeStyle()
        )}>
          {getPriorityIcon()}
          <span>{getPriorityLabel()}</span>
          <span className={cn(
            'text-xs ml-1',
            priorityLevel === 'prioritaire' ? 'text-white/80' : 'text-gray-700'
          )}>
            ({riskScore})
          </span>
        </div>

        {/* Titre et description au centre (style exact de l'image) */}
        <div className="flex-1 min-w-0 px-2">
          <h3 className="font-bold text-base text-gray-900 mb-1.5">
            {risk.dangerousSituation?.label || 'Risque non identifié'}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {risk.contextDescription || risk.dangerousSituation?.description || 'Aucune description'}
          </p>
        </div>

        {/* Tag de catégorie à droite (style exact de l'image) - Cliquable pour déployer/replier */}
        <button
          type="button"
          onClick={onToggleExpand}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 cursor-pointer hover:opacity-90 transition-opacity',
            getCategoryColor(categoryCode)
          )}
          aria-label={isExpanded ? 'Replier la carte' : 'Déployer la carte'}
        >
          <span>{categoryLabel}</span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Détails d'évaluation (seulement si expanded) */}
      {isExpanded && (
        <>
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-600 mb-1.5">Fréquence</p>
              <p className="text-sm font-semibold text-gray-900">
                {cotationLabels.frequency[risk.frequency as keyof typeof cotationLabels.frequency] || 'N/A'} ({risk.frequency})
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1.5">Probabilité</p>
              <p className="text-sm font-semibold text-gray-900">
                {cotationLabels.probability[risk.probability as keyof typeof cotationLabels.probability] || 'N/A'} ({risk.probability})
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1.5">Gravité</p>
              <p className="text-sm font-semibold text-gray-900">
                {cotationLabels.severity[risk.severity as keyof typeof cotationLabels.severity] || 'N/A'} ({risk.severity})
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1.5">Maîtrise</p>
              <p className="text-sm font-semibold text-gray-900">
                {cotationLabels.control[risk.control as keyof typeof cotationLabels.control] || 'N/A'} ({risk.control})
              </p>
            </div>
          </div>

          {/* Mesures existantes (style exact de l'image) */}
          {risk.existingMeasures && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-600 mb-1.5">Mesures existantes</p>
              <p className="text-sm text-gray-700 leading-relaxed">{risk.existingMeasures}</p>
            </div>
          )}
        </>
      )}

      {/* Boutons d'action - TOUJOURS affichés pour tous les risques évalués */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onGenerateActions(risk)}
          disabled={isGenerating}
          className="flex items-center gap-2 border-gray-300 bg-white hover:bg-gray-50"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Générer actions (IA)
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
        >
          <Edit className="w-4 h-4" />
          Modifier
        </Button>
      </div>
    </div>
  );
}

interface EvaluationStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function EvaluationStep({ onNext, onPrevious }: EvaluationStepProps) {
  const [selectedWorkUnitId, setSelectedWorkUnitId] = useState<string | null>(null);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[] | null>(null);
  const [prefilledRisk, setPrefilledRisk] = useState<any>(null);
  const [cachedSuggestions, setCachedSuggestions] = useState<Map<string, any[]>>(new Map());
  const [expandedRisks, setExpandedRisks] = useState<Set<string>>(new Set());

  const { data: workUnits, isLoading: workUnitsLoading } = api.workUnits.getAll.useQuery();
  const { data: riskAssessments, refetch: refetchRisks } = api.riskAssessments.getAll.useQuery(
    { workUnitId: selectedWorkUnitId! },
    { enabled: !!selectedWorkUnitId }
  );
  const { data: situations } = api.dangerousSituations.getAll.useQuery();

  const deleteMutation = api.riskAssessments.delete.useMutation({
    onSuccess: () => {
      toast.success('Risque supprimé');
      refetchRisks();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const selectedWorkUnit = workUnits?.find((wu) => wu.id === selectedWorkUnitId);

  // Charger les suggestions en cache quand on change d'unité de travail
  useEffect(() => {
    if (selectedWorkUnitId && cachedSuggestions.has(selectedWorkUnitId)) {
      const cached = cachedSuggestions.get(selectedWorkUnitId);
      setAiSuggestions(cached || null);
    } else {
      // Réinitialiser les suggestions si on change d'unité et pas de cache
      setAiSuggestions(null);
    }
  }, [selectedWorkUnitId, cachedSuggestions]);

  // Déployer la première carte par défaut quand les risques sont chargés
  useEffect(() => {
    if (riskAssessments && riskAssessments.length > 0 && expandedRisks.size === 0) {
      setExpandedRisks(new Set([riskAssessments[0].id]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskAssessments]);

  const handleAddRisk = () => {
    setEditingRisk(null);
    setPrefilledRisk(null);
    setRiskDialogOpen(true);
  };

  const handleEditRisk = (risk: any) => {
    setEditingRisk(risk);
    setPrefilledRisk(null);
    setRiskDialogOpen(true);
  };

  // Fonction de suppression conservée pour usage futur si nécessaire
  // const handleDeleteRisk = async (id: string) => {
  //   if (confirm('Êtes-vous sûr de vouloir supprimer ce risque ?')) {
  //     await deleteMutation.mutateAsync({ id });
  //   }
  // };

  const suggestHazardsMutation = api.riskAssessments.suggestHazards.useMutation();

  const handleSuggestHazards = async (forceRefresh = false) => {
    if (!selectedWorkUnit || !selectedWorkUnitId) {
      toast.error('Veuillez sélectionner une unité de travail');
      return;
    }

    setAiLoading(true);
    setAiSuggestions(null);

    try {
      const result = await suggestHazardsMutation.mutateAsync({
        workUnitId: selectedWorkUnitId,
        forceRefresh,
      });
      
      if (result && result.suggestions) {
        setAiSuggestions(result.suggestions);
        
        // Sauvegarder dans le cache local React pour navigation fluide
        setCachedSuggestions((prev) => {
          const newCache = new Map(prev);
          newCache.set(selectedWorkUnitId, result.suggestions);
          return newCache;
        });
        
        if (result.suggestions.length > 0) {
          const cacheMessage = result.fromCache 
            ? ' (suggestions précédentes)'
            : ' (nouvelles suggestions)';
          toast.success(`${result.suggestions.length} suggestion(s) générée(s) par l'IA${cacheMessage}`);
        } else {
          toast.info('Aucune suggestion générée pour cette unité de travail');
        }
      } else {
        toast.warning('Aucune donnée reçue de l\'IA');
      }
    } catch (error: any) {
      console.error('Erreur lors de la suggestion IA:', error);
      
      // Extraire le message d'erreur selon le format tRPC
      let errorMessage = 'Erreur lors de la génération des suggestions';
      if (error?.data?.zodError) {
        errorMessage = 'Données invalides';
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
      
      // Si c'est une erreur de quota/plan, ne pas réinitialiser complètement
      // pour permettre à l'utilisateur de voir le message d'upgrade
      if (error?.data?.code === 'FORBIDDEN') {
        // Garder l'état pour afficher le message d'erreur
        console.log('Accès IA refusé - Plan ou quota insuffisant');
      } else {
        // Réinitialiser l'état en cas d'erreur technique
        setAiSuggestions(null);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: { hazard_id?: string; hazard_label?: string; justification?: string }) => {
    // L'IA retourne maintenant l'ID exact du danger
    const situationId = suggestion.hazard_id;

    if (!situationId) {
      toast.error('ID de danger manquant dans la suggestion IA');
      return;
    }

    // Vérifier que le danger existe bien dans le référentiel
    const matchingSituation = situations?.find((s) => s.id === situationId);

    if (!matchingSituation) {
      toast.warning('Danger non trouvé. Veuillez le sélectionner manuellement.');
      // Créer un objet de pré-remplissage SANS id (indique que c'est une nouvelle évaluation)
      setPrefilledRisk({
        situationId: '',
        contextDescription: `${suggestion.hazard_label}: ${suggestion.justification}`,
      });
    } else {
      // Créer un objet de pré-remplissage SANS id (indique que c'est une nouvelle évaluation)
      setPrefilledRisk({
        situationId: matchingSituation.id,
        contextDescription: suggestion.justification,
      });
    }
    
    setEditingRisk(null); // S'assurer qu'on n'est pas en mode édition
    setAiSuggestions(null); // Fermer les suggestions après sélection
    setRiskDialogOpen(true);
  };

  const generateActionsMutation = api.riskAssessments.generateActions.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.count} action(s) générée(s) avec succès`);
      refetchRisks();
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la génération des actions');
    },
  });

  const handleGenerateActions = async (risk: any) => {
    if (!risk || !risk.id) {
      toast.error('Risque invalide');
      return;
    }

    try {
      await generateActionsMutation.mutateAsync({
        riskAssessmentId: risk.id,
      });
    } catch (error) {
      // L'erreur est déjà gérée par onError
      console.error('Erreur lors de la génération des actions:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Évaluation</h2>
        <p className="text-gray-600 mt-1">
          Sélectionnez une unité de travail pour évaluer ses risques
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Work Units List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Unités de travail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {workUnitsLoading ? (
              <p className="text-sm text-gray-500">Chargement...</p>
            ) : workUnits && workUnits.length > 0 ? (
              workUnits.map((workUnit) => (
                <button
                  key={workUnit.id}
                  onClick={() => setSelectedWorkUnitId(workUnit.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all',
                    selectedWorkUnitId === workUnit.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50 border-gray-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{workUnit.name}</span>
                    <span className="text-xs text-gray-500">
                      {workUnit._count?.riskAssessments || 0}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                Aucune unité de travail. Retournez à l'étape 1 pour en créer.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Right Panel: Selected Work Unit Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedWorkUnit ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedWorkUnit.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {selectedWorkUnit.description}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleSuggestHazards(false)}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Suggérer des dangers (IA)
                      </Button>
                      <Button size="sm" onClick={handleAddRisk}>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un risque
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* AI Suggestions Inline */}
              {(aiLoading || aiSuggestions) && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        Suggestions IA
                        {cachedSuggestions.has(selectedWorkUnitId || '') && !aiLoading && (
                          <Badge variant="outline" className="text-xs bg-white">
                            En cache
                          </Badge>
                        )}
                      </CardTitle>
                      {aiSuggestions && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuggestHazards(true)}
                            disabled={aiLoading}
                          >
                            Actualiser
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAiSuggestions(null)}
                          >
                            Fermer
                          </Button>
                        </div>
                      )}
                    </div>
                    <CardDescription>
                      L'employeur reste responsable de l'évaluation et de la gestion des risques. Cette liste ne constitue pas un avis juridique définitif.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {aiLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                          <p className="text-sm text-gray-600">Analyse en cours...</p>
                        </div>
                      </div>
                    ) : aiSuggestions && aiSuggestions.length > 0 ? (
                      <div className="space-y-3">
                        {aiSuggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-base">
                                  {suggestion.hazard_label}
                                </h4>
                                <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                                  {suggestion.confidence}% confiance
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700">
                                {suggestion.justification}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className="ml-4 shrink-0"
                            >
                              Évaluer
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              )}

              {/* Risk Assessments List */}
              <div className="space-y-4">
                {riskAssessments && riskAssessments.length > 0 ? (
                  riskAssessments.map((risk) => {
                    // Vérifier si la carte est déployée
                    const isExpanded = expandedRisks.has(risk.id);
                    
                    return (
                      <RiskCard
                        key={risk.id}
                        risk={risk}
                        isExpanded={isExpanded}
                        onEdit={() => handleEditRisk(risk)}
                        onGenerateActions={handleGenerateActions}
                        isGenerating={generateActionsMutation.isPending}
                        onToggleExpand={() => {
                          setExpandedRisks((prev) => {
                            const newSet = new Set(prev);
                            if (newSet.has(risk.id)) {
                              newSet.delete(risk.id);
                            } else {
                              newSet.add(risk.id);
                            }
                            return newSet;
                          });
                        }}
                      />
                    );
                  })
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-gray-500 mb-4">Aucun risque évalué pour cette unité</p>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={() => handleSuggestHazards(false)} variant="outline">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Suggérer des dangers (IA)
                        </Button>
                        <Button onClick={handleAddRisk}>
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter un risque
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Sélectionnez une unité de travail
                </h3>
                <p className="text-sm text-gray-500">
                  Choisissez une UT dans la liste pour évaluer ses risques
                </p>
              </CardContent>
            </Card>
          )}
        </div>
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

      {/* Risk Assessment Dialog */}
      {selectedWorkUnitId && (
        <RiskAssessmentDialogWizard
          open={riskDialogOpen}
          onOpenChange={setRiskDialogOpen}
          workUnitId={selectedWorkUnitId}
          editingRisk={editingRisk || prefilledRisk}
          onSuccess={() => {
            refetchRisks();
            setEditingRisk(null);
            setPrefilledRisk(null);
          }}
        />
      )}
    </div>
  );
}
