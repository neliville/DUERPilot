/**
 * Script de vérification de la configuration email
 * 
 * Vérifie que tous les éléments nécessaires sont configurés pour l'envoi d'emails d'inscription
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { EMAIL_TEMPLATES } from '../server/services/email/templates';

function checkEnvFile() {
  try {
    const envPath = join(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    
    const hasBrevoKey = envContent.includes('BREVO_API_KEY');
    const brevoKeyLine = envContent.split('\n').find(line => line.includes('BREVO_API_KEY'));
    
    return {
      exists: true,
      hasBrevoKey,
      brevoKeyConfigured: hasBrevoKey && brevoKeyLine && !brevoKeyLine.includes('=') === false && brevoKeyLine.split('=')[1]?.trim().length > 0,
      brevoKeyLine: brevoKeyLine ? brevoKeyLine.split('=')[0] + '=***' : null,
    };
  } catch (error) {
    return {
      exists: false,
      hasBrevoKey: false,
      brevoKeyConfigured: false,
      brevoKeyLine: null,
    };
  }
}

function checkTemplateConfig() {
  const accountActivation = EMAIL_TEMPLATES.account_activation;
  
  return {
    exists: !!accountActivation,
    brevoTemplateId: accountActivation?.brevoTemplateId || null,
    useN8n: accountActivation?.useN8n || false,
    variables: accountActivation?.variables || [],
  };
}

function checkEnvVariables() {
  return {
    BREVO_API_KEY: !!process.env.BREVO_API_KEY,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@duerpilot.fr',
    EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO || 'support@duerpilot.fr',
  };
}

async function main() {
  console.log('🔍 Vérification de la configuration email...\n');

  // 1. Vérifier le fichier .env
  console.log('1️⃣ Fichier .env :');
  const envCheck = checkEnvFile();
  if (envCheck.exists) {
    console.log('  ✅ Fichier .env existe');
  } else {
    console.log('  ❌ Fichier .env non trouvé');
  }

  if (envCheck.hasBrevoKey) {
    if (envCheck.brevoKeyConfigured) {
      console.log('  ✅ BREVO_API_KEY est configuré');
    } else {
      console.log('  ⚠️  BREVO_API_KEY est présent mais semble vide');
    }
  } else {
    console.log('  ❌ BREVO_API_KEY non trouvé dans .env');
  }
  console.log('');

  // 2. Vérifier les variables d'environnement (chargées)
  console.log('2️⃣ Variables d\'environnement (chargées) :');
  const envVars = checkEnvVariables();
  if (envVars.BREVO_API_KEY) {
    console.log('  ✅ BREVO_API_KEY est chargé');
  } else {
    console.log('  ❌ BREVO_API_KEY n\'est pas chargé (vérifier .env et redémarrer le serveur)');
  }
  console.log(`  📧 NEXTAUTH_URL: ${envVars.NEXTAUTH_URL}`);
  console.log(`  📧 EMAIL_FROM: ${envVars.EMAIL_FROM}`);
  console.log(`  📧 EMAIL_REPLY_TO: ${envVars.EMAIL_REPLY_TO}`);
  console.log('');

  // 3. Vérifier la configuration du template
  console.log('3️⃣ Configuration du template account_activation :');
  const templateConfig = checkTemplateConfig();
  if (templateConfig.exists) {
    console.log('  ✅ Template account_activation existe dans templates.ts');
    console.log(`  📋 brevoTemplateId: ${templateConfig.brevoTemplateId}`);
    if (templateConfig.brevoTemplateId === 1) {
      console.log('  ⚠️  ID = 1 (valeur par défaut - vérifier que c\'est le bon ID dans Brevo)');
    }
    console.log(`  🔄 useN8n: ${templateConfig.useN8n ? 'Oui' : 'Non (envoi direct Brevo)'}`);
    console.log(`  📝 Variables requises: ${templateConfig.variables.join(', ')}`);
  } else {
    console.log('  ❌ Template account_activation non trouvé dans templates.ts');
  }
  console.log('');

  // 4. Résumé
  console.log('📊 Résumé :');
  const allGood = envVars.BREVO_API_KEY && templateConfig.exists;
  
  if (allGood) {
    console.log('  ✅ Configuration OK - Les emails devraient être envoyés');
    console.log('');
    console.log('⚠️  À vérifier manuellement :');
    console.log('  1. Le template Brevo existe avec l\'ID correct');
    console.log('  2. Toutes les variables sont présentes dans le template Brevo');
    console.log('  3. Le domaine d\'envoi est vérifié dans Brevo');
  } else {
    console.log('  ❌ Configuration incomplète - Les emails ne seront pas envoyés');
    console.log('');
    console.log('🔧 Actions requises :');
    if (!envVars.BREVO_API_KEY) {
      console.log('  - Ajouter BREVO_API_KEY dans .env');
      console.log('  - Redémarrer le serveur (pnpm dev)');
    }
    if (!templateConfig.exists) {
      console.log('  - Vérifier que account_activation existe dans templates.ts');
    }
  }
  console.log('');
}

main().catch(console.error);

