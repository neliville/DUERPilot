/**
 * Webhook Brevo pour le tracking des emails
 * 
 * Reçoit les événements Brevo (delivered, opened, clicked, bounced, unsubscribed)
 * et met à jour les logs email pour traçabilité RGPD.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Structure des événements Brevo
    // https://developers.brevo.com/docs/webhooks#section-email-events
    const { event, email, 'message-id': messageId } = payload;

    if (!event || !email || !messageId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Mettre à jour EmailLog avec le statut de l'événement
    const updateData: any = {
      status: event,
    };

    // Ajouter les timestamps selon l'événement
    switch (event) {
      case 'delivered':
        updateData.deliveredAt = new Date();
        break;
      case 'opened':
        updateData.openedAt = new Date();
        break;
      case 'clicked':
        updateData.clickedAt = new Date();
        break;
      case 'unsubscribed':
        updateData.unsubscribedAt = new Date();
        break;
      case 'bounced':
      case 'hard_bounce':
      case 'soft_bounce':
        updateData.error = `Email bounced: ${event}`;
        break;
      case 'blocked':
        updateData.error = 'Email blocked by Brevo';
        break;
      case 'spam':
        updateData.error = 'Email marked as spam';
        break;
    }

    // Mettre à jour tous les logs avec ce messageId
    await prisma.emailLog.updateMany({
      where: { brevoMessageId: String(messageId) },
      data: updateData,
    });

    // Si unsubscribe, mettre à jour les préférences utilisateur
    if (event === 'unsubscribed') {
      const user = await prisma.userProfile.findUnique({
        where: { email },
      });

      if (user) {
        await prisma.emailPreferences.upsert({
          where: { userId: user.id },
          update: {
            marketingEmails: false,
            // Ne pas mettre unsubscribedAll à true car l'utilisateur
            // peut vouloir recevoir les emails transactionnels légaux
          },
          create: {
            userId: user.id,
            marketingEmails: false,
            productUpdates: true,
            monthlyDigest: true,
            aiInsights: true,
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erreur webhook Brevo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET pour vérification (Brevo peut tester l'endpoint)
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'Brevo webhook' });
}

