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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getSecteurFromSIRET, getSecteurFromNAF, MESSAGE_SUGGESTION_SECTEUR, SECTEURS_DISPONIBLES } from '@/lib/naf-sector-mapping';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
const onboardingSchema = z.object({
  legalName: z.string().min(1, 'Le nom de l\'entreprise est requis'),
  siren: z.string().optional(),
  siret: z.string().optional(),
  nafCode: z.string().optional(), // Code NAF optionnel pour suggestion de secteur
  category: z.string().min(1, 'L\'activité principale est requise'),
  sector: z.string().min(1, 'Le secteur d\'activité est requis'),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export function OnboardingForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [suggestedSector, setSuggestedSector] = useState<string | null>(null);
  const [showSuggestionMessage, setShowSuggestionMessage] = useState(false);

  // Récupérer les secteurs d'activité depuis la base de données
  const { data: activitySectors = [] } = api.activitySectors.getAll.useQuery({ active: true });

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      legalName: '',
      siren: '',
      siret: '',
      nafCode: '',
      category: '',
      sector: '',
    },
  });

  const siretValue = form.watch('siret');
  const nafCodeValue = form.watch('nafCode');
  const sectorValue = form.watch('sector');

  // Suggestion automatique de secteur à partir du SIRET ou du code NAF
  useEffect(() => {
    // Ne rien faire si les secteurs ne sont pas encore chargés
    if (activitySectors.length === 0) {
      return;
    }

    let newSuggestedSector: string | null = null;

    // Priorité 1 : Code NAF explicite
    if (nafCodeValue && nafCodeValue.trim()) {
      newSuggestedSector = getSecteurFromNAF(nafCodeValue);
      setShowSuggestionMessage(true);
    }
    // Priorité 2 : SIRET (extraction automatique du code NAF)
    else if (siretValue && siretValue.trim()) {
      newSuggestedSector = getSecteurFromSIRET(siretValue);
      setShowSuggestionMessage(true);
    }
    else {
      setShowSuggestionMessage(false);
      setSuggestedSector(null);
      return;
    }

    // Ne mettre à jour la suggestion que si elle a changé
    if (newSuggestedSector !== suggestedSector) {
      setSuggestedSector(newSuggestedSector);

      // Si un secteur est suggéré (et non GENERIQUE) et qu'aucun secteur n'est encore sélectionné, pré-remplir
      if (newSuggestedSector && newSuggestedSector !== 'GENERIQUE' && !sectorValue && activitySectors.length > 0) {
        const secteurExists = activitySectors.some(s => s.code === newSuggestedSector && s.active);
        if (secteurExists) {
          form.setValue('sector', newSuggestedSector);
          // Le message pédagogique est déjà affiché dans l'Alert, pas besoin de toast
        }
      }
    }
  }, [siretValue, nafCodeValue, sectorValue, suggestedSector, form, activitySectors]);

  const createMutation = api.companies.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Entreprise créée avec succès',
      });
      // Marquer l'onboarding comme complété
      // Rediriger vers le dashboard
      router.push('/dashboard');
      router.refresh();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: OnboardingFormValues) => {
    createMutation.mutate({
      legalName: values.legalName,
      siret: values.siret || undefined,
      sector: values.sector,
      activity: values.category,
    });
  };

  const isLoading = createMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="legalName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de l'entreprise *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Mon Entreprise SARL" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="siren"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SIREN</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="123 456 789" />
                </FormControl>
                <FormDescription>
                  Numéro SIREN (9 chiffres)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="siret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SIRET</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="123 456 789 01234" />
                </FormControl>
                <FormDescription>
                  Numéro SIRET (14 chiffres) - Le secteur sera suggéré automatiquement à partir du code NAF extrait
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="nafCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code NAF (optionnel)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: 47.11A, F43, 56.10A" />
              </FormControl>
              <FormDescription>
                Code NAF pour suggérer un secteur d'activité. Peut être laissé vide si SIRET renseigné.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {showSuggestionMessage && suggestedSector && suggestedSector !== 'GENERIQUE' && activitySectors.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>
                Secteur suggéré : {activitySectors.find(s => s.code === suggestedSector && s.active)?.label || SECTEURS_DISPONIBLES[suggestedSector as keyof typeof SECTEURS_DISPONIBLES] || suggestedSector}
              </strong>
              <br />
              <span className="text-sm text-muted-foreground mt-1 block">
                {MESSAGE_SUGGESTION_SECTEUR}
              </span>
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activité principale *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Construction, Restauration, Commerce..." />
              </FormControl>
              <FormDescription>
                Description de l'activité principale de l'entreprise
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sector"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secteur d'activité *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={activitySectors.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={suggestedSector && suggestedSector !== 'GENERIQUE' 
                      ? `Suggéré : ${activitySectors.find(s => s.code === suggestedSector)?.label || suggestedSector}`
                      : "Sélectionner un secteur"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activitySectors
                    .filter(s => s.active)
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((sector) => (
                      <SelectItem key={sector.code} value={sector.code}>
                        {sector.label} {sector.code === suggestedSector && suggestedSector !== 'GENERIQUE' ? '⭐' : ''}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {showSuggestionMessage && suggestedSector && suggestedSector !== 'GENERIQUE'
                  ? 'Secteur suggéré à partir de votre code NAF. Vous pouvez le modifier.'
                  : 'Sélectionnez le secteur d\'activité principal de votre entreprise'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4">
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? 'Création...' : 'Continuer →'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

