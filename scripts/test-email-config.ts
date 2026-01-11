#!/usr/bin/env tsx
/**
 * Script de test pour valider la configuration email
 */

import { EMAIL_ADDRESSES, validateEmailConfig, getStandardEmailConfig, getCommercialEmailConfig } from '../server/services/email/config';

console.log('='.repeat(70));
console.log('📧 VALIDATION DE LA CONFIGURATION EMAIL');
console.log('='.repeat(70));
console.log();

// Validation
const validation = validateEmailConfig();

if (validation.valid) {
  console.log('✅ Configuration valide\n');
} else {
  console.log('❌ Configuration invalide\n');
  console.log('Erreurs:');
  validation.errors.forEach((error) => {
    console.log(`  • ${error}`);
  });
  console.log();
}

// Adresses configurées
console.log('📋 Adresses configurées:');
console.log(`  FROM: ${EMAIL_ADDRESSES.FROM}`);
console.log(`  REPLY_TO: ${EMAIL_ADDRESSES.REPLY_TO}`);
console.log(`  CONTACT: ${EMAIL_ADDRESSES.CONTACT}`);
console.log();

// Configuration standard
const standardConfig = getStandardEmailConfig();
console.log('📝 Configuration standard (emails automatiques):');
console.log(`  FROM: ${standardConfig.from.email} (${standardConfig.from.name})`);
console.log(`  REPLY_TO: ${standardConfig.replyTo.email} (${standardConfig.replyTo.name})`);
console.log();

// Configuration commerciale
const commercialConfig = getCommercialEmailConfig();
console.log('📝 Configuration commerciale:');
console.log(`  FROM: ${commercialConfig.from.email} (${commercialConfig.from.name})`);
console.log(`  REPLY_TO: ${commercialConfig.replyTo.email} (${commercialConfig.replyTo.name})`);
console.log();

// Variables d'environnement
console.log('🔍 Variables d\'environnement:');
console.log(`  EMAIL_FROM: ${process.env.EMAIL_FROM || 'non défini (valeur par défaut)'}`);
console.log(`  EMAIL_REPLY_TO: ${process.env.EMAIL_REPLY_TO || 'non défini (valeur par défaut)'}`);
console.log(`  EMAIL_CONTACT: ${process.env.EMAIL_CONTACT || 'non défini (valeur par défaut)'}`);
console.log(`  EMAIL_SENDER_NAME: ${process.env.EMAIL_SENDER_NAME || 'non défini (valeur par défaut)'}`);
console.log();

console.log('='.repeat(70));

if (validation.valid) {
  console.log('✨ La configuration email est prête à être utilisée !');
  process.exit(0);
} else {
  console.log('⚠️  Veuillez corriger les erreurs avant de continuer.');
  process.exit(1);
}

