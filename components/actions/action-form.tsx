'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { useToast } from '@/hooks/use-toast';

const actionFormSchema = z.object({
  riskAssessmentId: z.string().cuid().optional().or(z.literal('')),
  workUnitId: z.string().cuid('L\'unité de travail est requise'),
  type: z.enum(['technique', 'organisationnelle', 'humaine']),
  description: z.string().min(1, 'La description est requise'),
  priority: z.enum(['basse', 'moyenne', 'haute', 'critique']),
  responsibleName: z.string().optional(),
  responsibleEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
  status: z.enum(['à_faire', 'en_cours', 'bloqué', 'terminé']),
  proofUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type ActionFormValues = z.infer<typeof actionFormSchema>;

interface ActionFormProps {
  action?: any;
  onSuccess: () => void;
}

export function ActionForm({ action, onSuccess }: ActionFormProps) {
  const { toast } = useToast();
  const utils = api.useUtils();

  // Récupérer les données nécessaires
  const { data: workUnits } = api.workUnits.getAll.useQuery();
  const { data: riskAssessments } = api.riskAssessments.getAll.useQuery();

  const form = useForm<ActionFormValues>({
    resolver: zodResolver(actionFormSchema),
    defaultValues: action
      ? {
          riskAssessmentId: action.riskAssessmentId || '',
          workUnitId: action.workUnitId || '',
          type: action.type || 'technique',
          description: action.description || '',
          priority: action.priority || 'moyenne',
          responsibleName: action.responsibleName || '',
          responsibleEmail: action.responsibleEmail || '',
          dueDate: action.dueDate
            ? new Date(action.dueDate).toISOString().split('T')[0]
            : '',
          status: action.status || 'à_faire',
          proofUrl: action.proofUrl || '',
          notes: action.notes || '',
        }
      : {
          riskAssessmentId: '',
          workUnitId: '',
          type: 'technique',
          description: '',
          priority: 'moyenne',
          responsibleName: '',
          responsibleEmail: '',
          dueDate: '',
          status: 'à_faire',
          proofUrl: '',
          notes: '',
        },
  });

  const createMutation = api.actionPlans.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Action créée avec succès',
      });
      utils.actionPlans.getAll.invalidate();
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

  const updateMutation = api.actionPlans.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Action modifiée avec succès',
      });
      utils.actionPlans.getAll.invalidate();
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

  const onSubmit = (values: ActionFormValues) => {
    const data = {
      ...values,
      riskAssessmentId:
        values.riskAssessmentId === '' || values.riskAssessmentId === 'none'
          ? undefined
          : values.riskAssessmentId,
      responsibleEmail:
        values.responsibleEmail === '' ? undefined : values.responsibleEmail,
      proofUrl: values.proofUrl === '' ? undefined : values.proofUrl,
      dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
    };

    if (action) {
      updateMutation.mutate({ id: action.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Filtrer les évaluations de risques selon l'unité de travail sélectionnée
  const selectedWorkUnitId = form.watch('workUnitId');
  const filteredRiskAssessments = riskAssessments?.filter(
    (ra) => !selectedWorkUnitId || ra.workUnitId === selectedWorkUnitId
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="workUnitId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unité de Travail *</FormLabel>
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

          <FormField
            control={form.control}
            name="riskAssessmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Évaluation de Risque (optionnel)</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                  value={field.value || 'none'}
                  disabled={!selectedWorkUnitId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une évaluation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    {filteredRiskAssessments?.map((ra) => (
                      <SelectItem key={ra.id} value={ra.id}>
                        {ra.dangerousSituation?.label || ra.contextDescription || 'Non spécifié'} - {ra.priorityLevel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Lier cette action à une évaluation de risque spécifique
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Décrivez l'action à mettre en place"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type d'action *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="technique">Technique</SelectItem>
                    <SelectItem value="organisationnelle">Organisationnelle</SelectItem>
                    <SelectItem value="humaine">Humaine</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priorité *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="basse">Basse</SelectItem>
                    <SelectItem value="moyenne">Moyenne</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="critique">Critique</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="responsibleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsable (nom)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nom du responsable" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responsibleEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsable (email)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="responsable@entreprise.fr"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'échéance</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="à_faire">À faire</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="bloqué">Bloqué</SelectItem>
                    <SelectItem value="terminé">Terminé</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="proofUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de preuve/justificatif</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="url"
                  placeholder="https://exemple.com/preuve.pdf"
                />
              </FormControl>
              <FormDescription>
                Lien vers un document justifiant la réalisation de l'action
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Notes supplémentaires sur cette action"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoading}
          >
            Réinitialiser
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? 'Enregistrement...'
              : action
                ? 'Modifier'
                : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

