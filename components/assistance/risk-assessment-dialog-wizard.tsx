'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, Sparkles, Loader2 } from 'lucide-react';
import { api } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const frequencyLabels = ['Rare', 'Occasionnel', 'Fréquent', 'Permanent'];
const probabilityLabels = ['Improbable', 'Peu probable', 'Probable', 'Très probable'];
const severityLabels = ['Faible', 'Moyen', 'Grave', 'Très grave'];
const controlLabels = ['Excellente', 'Bonne', 'Insuffisante', 'Inexistante'];

interface RiskAssessmentDialogWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workUnitId: string;
  editingRisk?: any;
  onSuccess: () => void;
}

export function RiskAssessmentDialogWizard({
  open,
  onOpenChange,
  workUnitId,
  editingRisk,
  onSuccess,
}: RiskAssessmentDialogWizardProps) {
  const [situationId, setSituationId] = useState('');
  const [contextDescription, setContextDescription] = useState('');
  const [exposedPersons, setExposedPersons] = useState('');
  const [existingMeasures, setExistingMeasures] = useState('');
  const [frequency, setFrequency] = useState(2);
  const [probability, setProbability] = useState(2);
  const [severity, setSeverity] = useState(2);
  const [control, setControl] = useState(2);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { data: situations } = api.dangerousSituations.getAll.useQuery();

  // Calculate risk score
  const calculateRiskScore = () => frequency * probability * severity * control;
  const riskScore = calculateRiskScore();

  const getPriorityLevel = (score: number) => {
    if (score < 36) return 'faible';
    if (score < 108) return 'à_améliorer';
    return 'prioritaire';
  };

  const priorityLevel = getPriorityLevel(riskScore);

  const getPriorityColor = () => {
    if (riskScore < 36) return 'bg-green-100 text-green-800 border-green-200';
    if (riskScore < 108) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // Initialize form when editing or prefilling from AI suggestion
  useEffect(() => {
    if (open && editingRisk) {
      // Remplir le formulaire avec les données existantes (édition) ou pré-remplissage IA
      setSituationId(editingRisk.situationId || '');
      setContextDescription(editingRisk.contextDescription || '');
      setExposedPersons(editingRisk.exposedPersons || '');
      setExistingMeasures(editingRisk.existingMeasures || '');
      setFrequency(editingRisk.frequency || 2);
      setProbability(editingRisk.probability || 2);
      setSeverity(editingRisk.severity || 2);
      setControl(editingRisk.control || 2);
      
      // Marquer si cela vient d'une suggestion IA (pas d'id = pré-remplissage)
      if (!editingRisk.id && editingRisk.contextDescription) {
        setAiSuggestion({
          fromSuggestion: true,
          justification: 'Pré-rempli à partir de la suggestion IA'
        });
      } else {
        // Réinitialiser l'indicateur IA si c'est une vraie édition
        setAiSuggestion(null);
      }
    } else if (!open) {
      resetForm();
    }
  }, [editingRisk, open]);

  const resetForm = () => {
    setSituationId('');
    setContextDescription('');
    setExposedPersons('');
    setExistingMeasures('');
    setFrequency(2);
    setProbability(2);
    setSeverity(2);
    setControl(2);
    setAiSuggestion(null);
  };

  const createMutation = api.riskAssessments.create.useMutation({
    onSuccess: () => {
      toast.success('Risque créé avec succès');
      resetForm();
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la création');
    },
  });

  const updateMutation = api.riskAssessments.update.useMutation({
    onSuccess: () => {
      toast.success('Risque modifié avec succès');
      resetForm();
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la modification');
    },
  });

  const handleSuggestCotation = async () => {
    if (!situationId || !contextDescription) {
      toast.error('Veuillez remplir le danger et la description avant de demander une suggestion');
      return;
    }

    setAiLoading(true);
    // TODO: Appeler l'endpoint IA pour suggérer une cotation
    // Pour l'instant, simulation
    setTimeout(() => {
      const suggestion = {
        frequency: Math.floor(Math.random() * 4) + 1,
        probability: Math.floor(Math.random() * 4) + 1,
        severity: Math.floor(Math.random() * 4) + 1,
        control: Math.floor(Math.random() * 4) + 1,
        justification: "Basé sur l'analyse du contexte, cette cotation semble appropriée pour ce type de risque.",
        disclaimer: "Cette suggestion est indicative. L'employeur reste seul responsable de la cotation finale."
      };
      setFrequency(suggestion.frequency);
      setProbability(suggestion.probability);
      setSeverity(suggestion.severity);
      setControl(suggestion.control);
      setAiSuggestion(suggestion);
      setAiLoading(false);
      toast.success('Suggestion IA appliquée');
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!situationId || !contextDescription) {
      toast.error('Veuillez remplir au moins le danger et la description');
      return;
    }

    const data = {
      workUnitId,
      situationId,
      contextDescription,
      exposedPersons,
      frequency,
      probability,
      severity,
      control,
      existingMeasures,
      source: aiSuggestion ? ('ai_assisted' as const) : ('manual' as const),
    };

    // Vérifier si c'est une vraie édition (avec un id) ou un simple pré-remplissage
    if (editingRisk && editingRisk.id) {
      await updateMutation.mutateAsync({ id: editingRisk.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingRisk?.id ? 'Modifier l\'évaluation' : 'Nouvelle évaluation de risque'}
          </DialogTitle>
          <DialogDescription>
            Évaluez le risque selon les critères F×P×G×M
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hazard selection */}
          <div className="space-y-2">
            <Label>Danger *</Label>
            <Select value={situationId} onValueChange={setSituationId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un danger du référentiel" />
              </SelectTrigger>
              <SelectContent>
                {situations?.map((situation) => (
                  <SelectItem key={situation.id} value={situation.id}>
                    {situation.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Situation description */}
          <div className="space-y-2">
            <Label>Description de la situation dangereuse *</Label>
            <Textarea
              value={contextDescription}
              onChange={(e) => setContextDescription(e.target.value)}
              placeholder="Décrivez précisément la situation à risque..."
              rows={3}
            />
          </div>

          {/* Exposed persons */}
          <div className="space-y-2">
            <Label>Personnes exposées</Label>
            <Input
              value={exposedPersons}
              onChange={(e) => setExposedPersons(e.target.value)}
              placeholder="Ex: Opérateurs, Manutentionnaires..."
            />
          </div>

          {/* Existing measures */}
          <div className="space-y-2">
            <Label>Mesures de prévention existantes</Label>
            <Textarea
              value={existingMeasures}
              onChange={(e) => setExistingMeasures(e.target.value)}
              placeholder="Décrivez les mesures déjà en place..."
              rows={2}
            />
          </div>

          {/* AI Suggestion button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleSuggestCotation}
            disabled={aiLoading || !situationId || !contextDescription}
            className="w-full gap-2"
          >
            {aiLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Proposer une cotation (IA)
          </Button>

          {/* Cotation */}
          <div className="space-y-6 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold">Cotation du risque</h4>

            {/* Frequency */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Fréquence d'exposition
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>À quelle fréquence les salariés sont-ils exposés ?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Badge>
                  {frequencyLabels[frequency - 1]} ({frequency})
                </Badge>
              </div>
              <Slider
                value={[frequency]}
                onValueChange={([v]) => setFrequency(v)}
                min={1}
                max={4}
                step={1}
              />
            </div>

            {/* Probability */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Probabilité d'occurrence
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Quelle est la probabilité que l'accident se produise ?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Badge>
                  {probabilityLabels[probability - 1]} ({probability})
                </Badge>
              </div>
              <Slider
                value={[probability]}
                onValueChange={([v]) => setProbability(v)}
                min={1}
                max={4}
                step={1}
              />
            </div>

            {/* Severity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Gravité potentielle
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Quelle serait la gravité des dommages ?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Badge>
                  {severityLabels[severity - 1]} ({severity})
                </Badge>
              </div>
              <Slider
                value={[severity]}
                onValueChange={([v]) => setSeverity(v)}
                min={1}
                max={4}
                step={1}
              />
            </div>

            {/* Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Niveau de maîtrise
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Les mesures de prévention sont-elles efficaces ?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Badge>
                  {controlLabels[control - 1]} ({control})
                </Badge>
              </div>
              <Slider
                value={[control]}
                onValueChange={([v]) => setControl(v)}
                min={1}
                max={4}
                step={1}
              />
            </div>

            {/* Score result */}
            <div className="pt-4 border-t flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Score de risque</p>
                <p className="text-2xl font-bold">{riskScore}</p>
              </div>
              <Badge className={cn('text-sm px-3 py-1', getPriorityColor())}>
                {priorityLevel.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* AI Justification */}
          {aiSuggestion?.justification && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <p className="font-medium text-blue-700 mb-1">Justification IA:</p>
              <p className="text-blue-600">{aiSuggestion.justification}</p>
              {aiSuggestion.disclaimer && (
                <p className="text-blue-500 text-xs mt-2 italic">{aiSuggestion.disclaimer}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : editingRisk?.id ? 'Modifier' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
