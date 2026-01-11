import { NextResponse } from 'next/server';
import { EMAIL_ADDRESSES, validateEmailConfig, getStandardEmailConfig, getCommercialEmailConfig } from '@/server/services/email/config';

/**
 * Route API pour tester et valider la configuration email
 */
export async function GET() {
  const validation = validateEmailConfig();
  const standardConfig = getStandardEmailConfig();
  const commercialConfig = getCommercialEmailConfig();

  return NextResponse.json({
    success: validation.valid,
    validation,
    configuration: {
      addresses: {
        FROM: EMAIL_ADDRESSES.FROM,
        REPLY_TO: EMAIL_ADDRESSES.REPLY_TO,
        CONTACT: EMAIL_ADDRESSES.CONTACT,
      },
      standard: standardConfig,
      commercial: commercialConfig,
    },
    environment: {
      EMAIL_FROM: process.env.EMAIL_FROM || 'non défini (utilise valeur par défaut)',
      EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO || 'non défini (utilise valeur par défaut)',
      EMAIL_CONTACT: process.env.EMAIL_CONTACT || 'non défini (utilise valeur par défaut)',
      EMAIL_SENDER_NAME: process.env.EMAIL_SENDER_NAME || 'non défini (utilise valeur par défaut)',
    },
  });
}

