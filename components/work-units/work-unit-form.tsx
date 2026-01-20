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
import { TRPCErrorHandler } from '@/components/plans';
import { useState, useEffect } from 'react';
import { TRPCClientErrorLike } from '@trpc/client';

const workUnitFormSchema = z.object({
  siteId: z.string().cuid('Le site est requis'),
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  exposedCount: z.number().int().positive().optional().or(z.literal('')),
  responsibleName: z.string().optional(),
  responsibleEmail: z.string().email('Email invalide').optional().or(z.literal('')),
});

type WorkUnitFormValues = z.infer<typeof workUnitFormSchema>;

interface WorkUnitFormProps {
  workUnit?: any;
  onSuccess: () => void;
}

export function WorkUnitForm({ workUnit, onSuccess }: WorkUnitFormProps) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [error, setError] = useState<TRPCClientErrorLike<any> | Error | null>(null);

  // Récupérer les entreprises et sites
  const { data: companies } = api.companies.getAll.useQuery();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Pas besoin de récupérer les sites séparément, ils sont déjà dans companies

  const form = useForm<WorkUnitFormValues>({
    resolver: zodResolver(workUnitFormSchema),
    defaultValues: workUnit
      ? {
          siteId: workUnit.siteId || '',
          name: workUnit.name || '',
          description: workUnit.description || '',
          exposedCount: workUnit.exposedCount || '',
          responsibleName: workUnit.responsibleName || '',
          responsibleEmail: workUnit.responsibleEmail || '',
        }
      : {
          siteId: '',
          name: '',
          description: '',
          exposedCount: '',
          responsibleName: '',
          responsibleEmail: '',
        },
  });

  // Initialiser le companyId si on édite
  useEffect(() => {
    if (workUnit?.site?.companyId) {
      setSelectedCompanyId(workUnit.site.companyId);
    }
  }, [workUnit]);

  const createMutation = api.workUnits.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Unité de travail créée avec succès',
      });
      utils.workUnits.getAll.invalidate();
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

  const updateMutation = api.workUnits.update.useMutation({
    onSuccess: () => {
      setError(null);
      toast({
        title: 'Succès',
        description: 'Unité de travail modifiée avec succès',
      });
      utils.workUnits.getAll.invalidate();
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

  const onSubmit = (values: WorkUnitFormValues) => {
    const data = {
      ...values,
      exposedCount:
        values.exposedCount === '' ? undefined : Number(values.exposedCount),
      responsibleEmail:
        values.responsibleEmail === '' ? undefined : values.responsibleEmail,
    };

    if (workUnit) {
      updateMutation.mutate({ id: workUnit.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Trouver tous les sites disponibles
  const allSites = companies?.flatMap((company) =>
    company.sites?.map((site: any) => ({
      ...site,
      companyName: company.legalName,
    })) || []
  ) || [];

  return (
    <div className="space-y-4">
      <TRPCErrorHandler error={error} onDismiss={() => setError(null)} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="siteId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site *</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  // Trouver le companyId du site sélectionné
                  const site = allSites.find((s: any) => s.id === value);
                  if (site) {
                    const company = companies?.find((c: any) =>
                      c.sites?.some((s: any) => s.id === value)
                    );
                    if (company) {
                      setSelectedCompanyId(company.id);
                    }
                  }
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un site" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companies?.map((company) => (
                    <div key={company.id}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                        {company.legalName}
                      </div>
                      {company.sites?.map((site: any) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name}
                          {site.isMainSite && ' (Principal)'}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de l'unité de travail *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Atelier de production" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Décrivez les activités de cette unité de travail"
                  rows={4}
                />
              </FormControl>
              <FormDescription>
                Cette description sera utilisée par l'IA pour suggérer des dangers
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="exposedCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Effectif exposé</FormLabel>
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
              : workUnit
                ? 'Modifier'
                : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
    </div>
  );
}

