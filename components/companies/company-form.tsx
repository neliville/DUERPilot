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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { getErrorToastTitle, shouldUseDestructiveVariant, isPlanLimitError } from '@/lib/error-utils';
import { TRPCErrorHandler } from '@/components/plans';
import { useState } from 'react';
import { TRPCClientErrorLike } from '@trpc/client';

const companyFormSchema = z.object({
  legalName: z.string().min(1, 'La raison sociale est requise'),
  siret: z.string().optional(),
  activity: z.string().optional(),
  sector: z.string().optional(),
  employeeCount: z.number().int().positive().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('France'),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  hasCSE: z.boolean().default(false),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

interface CompanyFormProps {
  company?: any;
  onSuccess: () => void;
}

export function CompanyForm({ company, onSuccess }: CompanyFormProps) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [error, setError] = useState<TRPCClientErrorLike<any> | Error | null>(null);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: company
      ? {
          legalName: company.legalName || '',
          siret: company.siret || '',
          activity: company.activity || '',
          sector: company.sector || '',
          employeeCount: company.employeeCount || '',
          address: company.address || '',
          city: company.city || '',
          postalCode: company.postalCode || '',
          country: company.country || 'France',
          phone: company.phone || '',
          email: company.email || '',
          website: company.website || '',
          hasCSE: company.hasCSE || false,
        }
      : {
          legalName: '',
          siret: '',
          activity: '',
          sector: '',
          employeeCount: '',
          address: '',
          city: '',
          postalCode: '',
          country: 'France',
          phone: '',
          email: '',
          website: '',
          hasCSE: false,
        },
  });

  const createMutation = api.companies.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Entreprise créée avec succès',
      });
      utils.companies.getAll.invalidate();
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

  const updateMutation = api.companies.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Entreprise modifiée avec succès',
      });
      utils.companies.getAll.invalidate();
      onSuccess();
    },
    onError: (error) => {
      setError(error);
      // Ne pas afficher de toast pour les erreurs de plan, TRPCErrorHandler s'en charge
      if (!isPlanLimitError(error)) {
        toast({
          title: getErrorToastTitle(error),
          description: error.message || 'Une erreur est survenue',
          variant: shouldUseDestructiveVariant(error) ? 'destructive' : 'default',
        });
      }
    },
  });

  const onSubmit = (values: CompanyFormValues) => {
    const data = {
      ...values,
      employeeCount:
        values.employeeCount === '' ? undefined : Number(values.employeeCount),
      email: values.email === '' ? undefined : values.email,
      website: values.website === '' ? undefined : values.website,
    };

    if (company) {
      updateMutation.mutate({ id: company.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <TRPCErrorHandler error={error} onDismiss={() => setError(null)} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="legalName"
            render={({ field }) => (
              <FormItem>
                <FormLabel helpText="Nom officiel de l'entreprise tel qu'il apparaît dans les statuts et les documents légaux.">
                  Raison sociale *
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nom de l'entreprise" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="siret"
            render={({ field }) => (
              <FormItem>
                <FormLabel helpText="Numéro SIRET à 14 chiffres (Système d'Identification du Répertoire des Entreprises). Facultatif mais recommandé pour la conformité.">
                  SIRET
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="123 456 789 01234" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activity"
            render={({ field }) => (
              <FormItem>
                <FormLabel helpText="Description de l'activité principale exercée par l'entreprise (ex: Restauration, BTP, Commerce).">
                  Activité principale
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Activité" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sector"
            render={({ field }) => (
              <FormItem>
                <FormLabel helpText="Secteur d'activité selon la nomenclature NAF (ex: 56.10Z - Restauration traditionnelle).">
                  Secteur d'activité
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Secteur" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employeeCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel helpText="Nombre total de salariés de l'entreprise. Utilisé pour déterminer les obligations réglementaires et les quotas.">
                  Effectif
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="0"
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel helpText="Numéro de téléphone de contact principal de l'entreprise.">
                  Téléphone
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="+33 1 23 45 67 89" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel helpText="Adresse email de contact principale. Utilisée pour les notifications et communications importantes.">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="contact@entreprise.fr"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel helpText="URL du site web de l'entreprise (optionnel).">
                  Site web
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://www.entreprise.fr" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Adresse complète" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ville" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code postal</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="75001" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pays</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="France" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="hasCSE"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Présence d'un CSE</FormLabel>
                <FormDescription>
                  L'entreprise dispose d'un Comité Social et Économique
                </FormDescription>
              </div>
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
              : company
                ? 'Modifier'
                : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
    </>
  );
}

