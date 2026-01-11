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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const participationFormSchema = z.object({
  type: z.enum(['consultation', 'information', 'association']),
  date: z.string().min(1, 'La date est requise'),
  organizerEmail: z.string().email('Email invalide'),
  isRealized: z.boolean().default(false),
  participantsCount: z.number().int().min(0).optional().nullable(),
  subject: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  decisions: z.string().optional().nullable(),
  nextSteps: z.string().optional().nullable(),
});

type ParticipationFormValues = z.infer<typeof participationFormSchema>;

interface ParticipationFormProps {
  companyId: string;
  participation?: any;
  onSuccess: () => void;
}

export function ParticipationForm({ companyId, participation, onSuccess }: ParticipationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ParticipationFormValues>({
    resolver: zodResolver(participationFormSchema),
    defaultValues: {
      type: participation?.type ?? 'consultation',
      date: participation?.date
        ? new Date(participation.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      organizerEmail: participation?.organizerEmail ?? '',
      isRealized: participation?.isRealized ?? false,
      participantsCount: participation?.participantsCount ?? null,
      subject: participation?.subject ?? null,
      summary: participation?.summary ?? null,
      observations: participation?.observations ?? null,
      decisions: participation?.decisions ?? null,
      nextSteps: participation?.nextSteps ?? null,
    },
  });

  const createMutation = api.participationTravailleurs.create.useMutation();
  const updateMutation = api.participationTravailleurs.update.useMutation();

  const onSubmit = async (data: ParticipationFormValues) => {
    try {
      setIsSubmitting(true);

      if (participation) {
        await updateMutation.mutateAsync({
          id: participation.id,
          type: data.type,
          date: new Date(data.date),
          organizerEmail: data.organizerEmail,
          isRealized: data.isRealized,
          participantsCount: data.participantsCount ?? undefined,
          subject: data.subject ?? undefined,
          summary: data.summary ?? undefined,
          observations: data.observations ?? undefined,
          decisions: data.decisions ?? undefined,
          nextSteps: data.nextSteps ?? undefined,
        });
        toast({
          title: 'Participation mise à jour',
          description: 'La participation a été mise à jour avec succès.',
        });
      } else {
        await createMutation.mutateAsync({
          companyId,
          type: data.type,
          date: new Date(data.date),
          organizerEmail: data.organizerEmail,
          isRealized: data.isRealized,
          participantsCount: data.participantsCount ?? undefined,
          subject: data.subject ?? undefined,
          summary: data.summary ?? undefined,
          observations: data.observations ?? undefined,
          decisions: data.decisions ?? undefined,
          nextSteps: data.nextSteps ?? undefined,
        });
        toast({
          title: 'Participation créée',
          description: 'La participation a été créée avec succès.',
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de participation *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="information">Information</SelectItem>
                  <SelectItem value="association">Association</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Type de participation des travailleurs au processus DUERP
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormDescription>Date de la consultation/participation</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organizerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email organisateur *</FormLabel>
                <FormControl>
                  <Input type="email" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormDescription>Email de la personne organisant la participation</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isRealized"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Participation réalisée</FormLabel>
                <FormDescription>
                  Cochez cette case si la participation a déjà été réalisée
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="participantsCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de participants</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
                  value={field.value ?? ''}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>Nombre de participants à la consultation/participation</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sujet</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  disabled={isSubmitting}
                  placeholder="Ex: Révision DUERP annuelle, Nouveau risque identifié"
                />
              </FormControl>
              <FormDescription>Sujet de la consultation/participation</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Résumé</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  disabled={isSubmitting}
                  placeholder="Résumé des échanges"
                  rows={4}
                />
              </FormControl>
              <FormDescription>Résumé des échanges et discussions</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observations</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  disabled={isSubmitting}
                  placeholder="Observations et retours des travailleurs"
                  rows={4}
                />
              </FormControl>
              <FormDescription>Observations et retours des travailleurs</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="decisions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Décisions</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  disabled={isSubmitting}
                  placeholder="Décisions prises suite à la consultation"
                  rows={4}
                />
              </FormControl>
              <FormDescription>Décisions prises suite à la consultation</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextSteps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prochaines étapes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  disabled={isSubmitting}
                  placeholder="Prochaines étapes prévues"
                  rows={4}
                />
              </FormControl>
              <FormDescription>Prochaines étapes prévues</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {participation ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

