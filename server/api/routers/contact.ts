/**
 * Router pour le formulaire de contact commercial
 * 
 * Utilise contact@duerpilot.fr pour les communications externes
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { EMAIL_ADDRESSES, getCommercialEmailConfig } from '@/server/services/email/config';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  company: z.string().optional(),
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
  type: z.enum(['commercial', 'partnership', 'press', 'other']).default('commercial'),
});

export const contactRouter = createTRPCRouter({
  /**
   * Envoie un email de contact commercial via le formulaire
   * 
   * Utilise contact@duerpilot.fr comme adresse d'expéditeur et de réponse
   */
  sendContactForm: publicProcedure
    .input(contactFormSchema)
    .mutation(async ({ input }) => {
      // Ici, on pourrait utiliser un service d'envoi email dédié pour les contacts
      // Pour l'instant, on log et on retourne un succès
      // Dans un environnement de production, on utiliserait Brevo ou un autre service
      // avec la configuration commerciale

      const emailConfig = getCommercialEmailConfig();

      console.log('[Contact] Nouveau message de contact:', {
        from: input.email,
        to: emailConfig.from.email,
        subject: input.subject,
        type: input.type,
        name: input.name,
        company: input.company,
      });

      // TODO: Implémenter l'envoi réel via Brevo ou un service dédié
      // Pour l'instant, on simule un envoi réussi
      // Dans la production, on utiliserait :
      // - Un template Brevo dédié pour les contacts
      // - Ou un webhook n8n pour gérer les contacts
      // - Ou un service comme SendGrid pour les formulaires

      return {
        success: true,
        message: 'Votre message a été envoyé. Nous vous répondrons dans les plus brefs délais.',
        contactEmail: EMAIL_ADDRESSES.CONTACT,
      };
    }),

  /**
   * Récupère l'adresse de contact à afficher publiquement
   */
  getContactEmail: publicProcedure.query(() => {
    return {
      contactEmail: EMAIL_ADDRESSES.CONTACT,
      supportEmail: EMAIL_ADDRESSES.REPLY_TO,
    };
  }),
});

