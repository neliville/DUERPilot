'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { calculateRiskScore, getPriorityLevel } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Sparkles, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HazardCombobox } from './hazard-combobox';
import { TRPCErrorHandler } from '@/components/plans';
import { useState } from 'react';
import { TRPCClientErrorLike } from '@trpc/client';

const riskAssessmentFormSchema = z.object({
  workUnitId: z.string().cuid('L\'unité de travail est requise'),
  situationId: z.string().cuid('La situation dangereuse est requise'),
  contextDescription: z.string().min(1, 'La description contextuelle est requise'),
  exposedPersons: z.string().optional(),
  frequency: z.number().int().min(1).max(4),
  probability: z.number().int().min(1).max(4),
  severity: z.number().int().min(1).max(4),
  control: z.number().int().min(1).max(4),
  existingMeasures: z.string().optional(),
  source: z.enum(['manual', 'ai_assisted', 'imported']).optional().default('manual'),
});

type RiskAssessmentFormValues = z.infer<typeof riskAssessmentFormSchema>;

interface RiskAssessmentFormProps {
  assessment?: any;
  onSuccess: () => void;
  workUnitId?: string;
}

const cotationLabels = {
  frequency: {
    1: 'Rare (moins d\'une fois par an)',
    2: 'Occasionnelle (plusieurs fois par an)',
    3: 'Fréquente (plusieurs fois par mois)',
    4: 'Permanent (quotidienne)',
  },
  probability: {
    1: 'Très faible',
    2: 'Faible',
    3: 'Probable',
    4: 'Élevée',
  },
  severity: {
    1: 'Bénin (sans arrêt de travail)',
    2: 'Léger (arrêt de travail < 3 jours)',
    3: 'Grave (arrêt de travail > 3 jours)',
    4: 'Très grave (incapacité permanente ou décès)',
  },
  control: {
    1: 'Très bonne maîtrise',
    2: 'Bonne',
    3: 'Maîtrise partielle',
    4: 'Maîtrise insuffisante',
  },
} as const;

const cotationDescriptions = {
  frequency: 'À quelle fréquence les salariés sont-ils exposés au danger ? Évaluez la régularité de l\'exposition : rare (moins d\'une fois par an), occasionnelle (plusieurs fois par an), fréquente (plusieurs fois par mois) ou permanente (quotidienne).',
  probability: 'Quelle est la probabilité que l\'accident ou l\'incident se produise ? Évaluez la vraisemblance d\'occurrence : très faible, faible, probable ou élevée.',
  severity: 'Quelle serait la gravité des conséquences en cas d\'accident ? Évaluez la sévérité potentielle : bénin (sans arrêt de travail), léger (arrêt < 3 jours), grave (arrêt > 3 jours) ou très grave (incapacité permanente ou décès).',
  control: 'Quel est le niveau de maîtrise des mesures de prévention existantes ? Évaluez l\'efficacité des protections : très bonne maîtrise, bonne maîtrise, maîtrise partielle ou maîtrise insuffisante.',
} as const;

export function RiskAssessmentForm({
  assessment,
  onSuccess,
  workUnitId,
}: RiskAssessmentFormProps) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [error, setError] = useState<TRPCClientErrorLike<any> | Error | null>(null);

  // Récupérer les données nécessaires
  const { data: workUnits } = api.workUnits.getAll.useQuery();
  
  const form = useForm<RiskAssessmentFormValues>({
    resolver: zodResolver(riskAssessmentFormSchema),
    defaultValues: assessment
      ? {
          workUnitId: assessment.workUnitId || workUnitId || '',
          situationId: assessment.situationId || '',
          contextDescription: assessment.contextDescription || '',
          exposedPersons: assessment.exposedPersons || '',
          frequency: assessment.frequency || 1,
          probability: assessment.probability || 1,
          severity: assessment.severity || 1,
          control: assessment.control || 1,
          existingMeasures: assessment.existingMeasures || '',
          source: assessment.source || 'manual',
        }
      : {
          workUnitId: workUnitId || '',
          situationId: '',
          contextDescription: '',
          exposedPersons: '',
          frequency: 1,
          probability: 1,
          severity: 1,
          control: 1,
          existingMeasures: '',
          source: 'manual',
        },
  });
  
  // Récupérer le secteur de l'unité de travail pour suggestions du référentiel (après la création du form)
  const selectedWorkUnitId = form.watch('workUnitId');
  const selectedWorkUnit = workUnits?.find((wu) => wu.id === selectedWorkUnitId);
  const sectorCode = selectedWorkUnit?.suggestedSector?.code || null;
  
  // Charger les situations dangereuses, éventuellement filtrées par secteur
  const { data: dangerousSituations } = api.dangerousSituations.getAll.useQuery({
    sectorCode: sectorCode || undefined,
    search: undefined,
  });

  // Calculer le score en temps réel
  const frequency = form.watch('frequency');
  const probability = form.watch('probability');
  const severity = form.watch('severity');
  const control = form.watch('control');
  const currentScore = calculateRiskScore(frequency, probability, severity, control);
  const currentPriority = getPriorityLevel(currentScore);

  const createMutation = api.riskAssessments.create.useMutation({
    onSuccess: () => {
      setError(null);
      toast({
        title: 'Succès',
        description: 'Évaluation de risque créée avec succès',
      });
      utils.riskAssessments.getAll.invalidate();
      onSuccess();
    },
    onError: (error) => {
      setError(error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = api.riskAssessments.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Évaluation de risque modifiée avec succès',
      });
      utils.riskAssessments.getAll.invalidate();
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: RiskAssessmentFormValues) => {
    if (assessment) {
      updateMutation.mutate({ id: assessment.id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleSuggestRating = () => {
    // TODO: Implémenter la suggestion IA
    toast({
      title: 'Fonctionnalité à venir',
      description: 'La suggestion de cotation par IA sera disponible prochainement',
    });
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <TRPCErrorHandler error={error} onDismiss={() => setError(null)} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Champ caché pour workUnitId si fourni, sinon champ visible */}
        {workUnitId ? (
          <FormField
            control={form.control}
            name="workUnitId"
            render={({ field }) => (
              <input type="hidden" {...field} value={workUnitId} />
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="workUnitId"
            render={({ field }) => (
              <FormItem>
                <FormLabel helpText="Unité de travail dans laquelle le risque a été identifié. Chaque risque est évalué dans le contexte d'une unité spécifique.">
                  Unité de Travail *
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une unité de travail" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {workUnits?.map((wu) => (
                      <SelectItem key={wu.id} value={wu.id}>
                        {wu.name} - {wu.site.company.legalName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Situation dangereuse */}
        <FormField
          control={form.control}
          name="situationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel helpText="Sélectionnez une situation dangereuse issue du référentiel interne basé sur les exigences réglementaires françaises et les bonnes pratiques professionnelles.">
                Situation dangereuse *
              </FormLabel>
              <FormControl>
                <HazardCombobox
                  situations={(dangerousSituations || []).map((ds: any) => ({
                    id: ds.id,
                    label: ds.label,
                    description: ds.description,
                    category: ds.category,
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Sélectionner une situation dangereuse"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description contextuelle */}
        <FormField
          control={form.control}
          name="contextDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel helpText="Description précise du contexte spécifique à votre situation : circonstances, conditions de travail, particularités de votre environnement. Cette description doit être claire et factuelle, adaptée à votre réalité terrain.">
                Description contextuelle *
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Décrivez le contexte spécifique de cette situation dangereuse dans votre organisation"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Personnes exposées */}
        <FormField
          control={form.control}
          name="exposedPersons"
          render={({ field }) => (
            <FormItem>
              <FormLabel helpText="Description des personnes exposées au risque (ex: Opérateurs machine, Personnel de maintenance). Précisez le nombre si possible.">
                Personnes exposées
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: Opérateurs atelier (10 personnes)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mesures de prévention existantes */}
        <FormField
          control={form.control}
          name="existingMeasures"
          render={({ field }) => (
            <FormItem>
              <FormLabel helpText="Mesures de prévention déjà en place pour réduire le risque (EPI, formations, procédures, équipements de protection).">
                Mesures de prévention existantes
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Décrivez les mesures de prévention déjà en place"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bouton Proposer une cotation (IA) */}
        <Button
          type="button"
          variant="outline"
          onClick={handleSuggestRating}
          className="w-full"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Proposer une cotation (IA)
        </Button>

        {/* Cotation du risque */}
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold">Cotation du risque</h3>

          {/* Fréquence d'exposition */}
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel className="text-base">
                    Fréquence d'exposition
                  </FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[280px] p-3" side="left" align="start">
                        <p className="font-semibold mb-2 text-sm">Fréquence d'exposition</p>
                        <p className="text-xs leading-relaxed whitespace-normal break-words">{cotationDescriptions.frequency}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">1 - Rare</span>
                    <span className="font-medium">
                      {cotationLabels.frequency[field.value as keyof typeof cotationLabels.frequency]}
                    </span>
                    <span className="text-gray-600">4 - Permanent</span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                      min={1}
                      max={4}
                      step={1}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Probabilité d'occurrence */}
          <FormField
            control={form.control}
            name="probability"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel className="text-base">
                    Probabilité d'occurrence
                  </FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[280px] p-3" side="left" align="start">
                        <p className="font-semibold mb-2 text-sm">Probabilité d'occurrence</p>
                        <p className="text-xs leading-relaxed whitespace-normal break-words">{cotationDescriptions.probability}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">1 - Très faible</span>
                    <span className="font-medium">
                      {cotationLabels.probability[field.value as keyof typeof cotationLabels.probability]}
                    </span>
                    <span className="text-gray-600">4 - Élevée</span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                      min={1}
                      max={4}
                      step={1}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gravité potentielle */}
          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel className="text-base">
                    Gravité potentielle
                  </FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[280px] p-3" side="left" align="start">
                        <p className="font-semibold mb-2 text-sm">Gravité potentielle</p>
                        <p className="text-xs leading-relaxed whitespace-normal break-words">{cotationDescriptions.severity}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">1 - Bénin</span>
                    <span className="font-medium">
                      {cotationLabels.severity[field.value as keyof typeof cotationLabels.severity]}
                    </span>
                    <span className="text-gray-600">4 - Très grave</span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                      min={1}
                      max={4}
                      step={1}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Niveau de maîtrise */}
          <FormField
            control={form.control}
            name="control"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel className="text-base">
                    Niveau de maîtrise
                  </FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[280px] p-3" side="left" align="start">
                        <p className="font-semibold mb-2 text-sm">Niveau de maîtrise</p>
                        <p className="text-xs leading-relaxed whitespace-normal break-words">{cotationDescriptions.control}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">1 - Très bonne</span>
                    <span className="font-medium">
                      {cotationLabels.control[field.value as keyof typeof cotationLabels.control]}
                    </span>
                    <span className="text-gray-600">4 - Insuffisante</span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                      min={1}
                      max={4}
                      step={1}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Score de risque */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Score de risque</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{currentScore}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700 mb-2">Niveau de priorité</p>
              <Badge
                variant={
                  currentPriority === 'prioritaire'
                    ? 'destructive'
                    : currentPriority === 'à_améliorer'
                      ? 'default'
                      : 'secondary'
                }
                className="text-base px-4 py-2"
              >
                {currentPriority === 'à_améliorer' ? (
                  <>
                    <span className="mr-1">⚠️</span>
                    À améliorer ({currentScore})
                  </>
                ) : currentPriority === 'prioritaire' ? (
                  <>
                    <span className="mr-1">🔴</span>
                    Prioritaire ({currentScore})
                  </>
                ) : (
                  <>
                    <span className="mr-1">✅</span>
                    Faible ({currentScore})
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess()}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? 'Enregistrement...'
              : assessment
                ? 'Modifier'
                : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
    </div>
  );
}
