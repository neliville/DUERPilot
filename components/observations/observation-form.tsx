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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const observationFormSchema = z.object({
  workUnitId: z.string().cuid('L\'unité de travail est requise'),
  description: z.string().min(1, 'La description est requise'),
  photoUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  location: z.string().optional(),
  latitude: z.number().optional().or(z.literal('')),
  longitude: z.number().optional().or(z.literal('')),
  status: z.enum(['nouvelle', 'en_analyse', 'intégrée', 'rejetée']),
  riskAssessmentId: z.string().cuid().optional().or(z.literal('')),
});

type ObservationFormValues = z.infer<typeof observationFormSchema>;

interface ObservationFormProps {
  observation?: any;
  onSuccess: () => void;
}

export function ObservationForm({
  observation,
  onSuccess,
}: ObservationFormProps) {
  const { toast } = useToast();
  const utils = api.useUtils();

  // Récupérer les données nécessaires
  const { data: workUnits } = api.workUnits.getAll.useQuery();
  const { data: riskAssessments } = api.riskAssessments.getAll.useQuery();

  const form = useForm<ObservationFormValues>({
    resolver: zodResolver(observationFormSchema),
    defaultValues: observation
      ? {
          workUnitId: observation.workUnitId || '',
          description: observation.description || '',
          photoUrl: observation.photoUrl || '',
          location: observation.location || '',
          latitude: observation.latitude || '',
          longitude: observation.longitude || '',
          status: observation.status || 'nouvelle',
          riskAssessmentId: observation.riskAssessmentId || '',
        }
      : {
          workUnitId: '',
          description: '',
          photoUrl: '',
          location: '',
          latitude: '',
          longitude: '',
          status: 'nouvelle',
          riskAssessmentId: '',
        },
  });

  const createMutation = api.observations.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Observation créée avec succès',
      });
      utils.observations.getAll.invalidate();
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

  const updateMutation = api.observations.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Observation modifiée avec succès',
      });
      utils.observations.getAll.invalidate();
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

  const onSubmit = (values: ObservationFormValues) => {
    const data = {
      ...values,
      photoUrl: values.photoUrl === '' ? undefined : values.photoUrl,
      riskAssessmentId:
        values.riskAssessmentId === '' || values.riskAssessmentId === 'none' 
          ? undefined 
          : values.riskAssessmentId,
      latitude:
        values.latitude === '' ? undefined : Number(values.latitude),
      longitude:
        values.longitude === '' ? undefined : Number(values.longitude),
    };

    if (observation) {
      updateMutation.mutate({ id: observation.id, ...data });
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Décrivez l'observation de sécurité"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de la photo</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="url"
                  placeholder="https://exemple.com/photo.jpg"
                />
              </FormControl>
              <FormDescription>
                URL de l'image illustrant l'observation
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localisation</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Atelier 3, Zone A" />
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
                    <SelectItem value="nouvelle">Nouvelle</SelectItem>
                    <SelectItem value="en_analyse">En analyse</SelectItem>
                    <SelectItem value="intégrée">Intégrée</SelectItem>
                    <SelectItem value="rejetée">Rejetée</SelectItem>
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
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="any"
                    placeholder="48.8566"
                    value={field.value === '' ? '' : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="any"
                    placeholder="2.3522"
                    value={field.value === '' ? '' : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="riskAssessmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Évaluation de Risque associée (optionnel)</FormLabel>
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
                Lier cette observation à une évaluation de risque
              </FormDescription>
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
              : observation
                ? 'Modifier'
                : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

