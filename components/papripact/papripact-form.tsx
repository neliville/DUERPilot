'use client';

import { useState } from 'react';
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
import { Loader2 } from 'lucide-react';

const papripactFormSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  status: z.enum(['brouillon', 'validé', 'en_cours', 'terminé']).optional(),
});

type PAPRIPACTFormValues = z.infer<typeof papripactFormSchema>;

interface PAPRIPACTFormProps {
  companyId: string;
  papripact?: any;
  onSuccess: () => void;
}

export function PAPRIPACTForm({ companyId, papripact, onSuccess }: PAPRIPACTFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PAPRIPACTFormValues>({
    resolver: zodResolver(papripactFormSchema),
    defaultValues: {
      year: papripact?.year ?? new Date().getFullYear(),
      status: papripact?.status ?? 'brouillon',
    },
  });

  const createMutation = api.papripact.create.useMutation();
  const updateMutation = api.papripact.update.useMutation();

  const onSubmit = async (data: PAPRIPACTFormValues) => {
    try {
      setIsSubmitting(true);

      if (papripact) {
        await updateMutation.mutateAsync({
          id: papripact.id,
          status: data.status,
        });
        toast({
          title: 'PAPRIPACT mis à jour',
          description: 'Le PAPRIPACT a été mis à jour avec succès.',
        });
      } else {
        await createMutation.mutateAsync({
          companyId,
          year: data.year,
        });
        toast({
          title: 'PAPRIPACT créé',
          description: `Le PAPRIPACT ${data.year} a été créé avec succès.`,
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la sauvegarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Année</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  disabled={!!papripact}
                />
              </FormControl>
              <FormDescription>
                {papripact
                  ? "L'année ne peut pas être modifiée après la création"
                  : "Année du PAPRIPACT (généralement l'année en cours)"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {papripact && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="validé">Validé</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="terminé">Terminé</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Statut du PAPRIPACT. Une fois validé, la date et le validateur seront enregistrés.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {papripact ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

