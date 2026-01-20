/**
 * Script de test pour vérifier l'envoi d'emails d'activation
 * 
 * Usage: pnpm exec tsx scripts/test-activation-email.ts <email>
 */

import { PrismaClient } from '@prisma/client';
import { sendTransactionalEmail } from '../server/services/email/brevo-service';
import { getTemplateConfig } from '../server/services/email/templates';

const prisma = new PrismaClient();

async function testActivationEmail(email: string) {
  console.log('🧪 Test d\'envoi d\'email d\'activation\n');
  
  // 1. Vérifier les variables d'environnement
  console.log('1️⃣ Vérification des variables d\'environnement...');
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  if (!BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY non configuré dans .env');
    console.log('\n💡 Solution: Ajoutez BREVO_API_KEY=xkeysib-... dans votre fichier .env');
    process.exit(1);
  }
  console.log('✅ BREVO_API_KEY configuré');
  console.log(`✅ NEXTAUTH_URL: ${NEXTAUTH_URL}\n`);
  
  // 2. Vérifier la configuration du template
  console.log('2️⃣ Vérification de la configuration du template...');
  try {
    const templateConfig = getTemplateConfig('account_activation');
    console.log('✅ Template account_activation trouvé');
    console.log(`   ID Brevo: ${templateConfig.brevoTemplateId}`);
    console.log(`   Variables requises: ${templateConfig.variables.join(', ')}\n`);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du template:', error);
    process.exit(1);
  }
  
  // 3. Générer un code de test
  const testCode = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('3️⃣ Génération d\'un code de test...');
  console.log(`   Code généré: ${testCode}\n`);
  
  // 4. Préparer les variables
  const baseUrl = NEXTAUTH_URL;
  const supportEmail = process.env.EMAIL_REPLY_TO || 'support@duerpilot.fr';
  const privacyPolicyUrl = process.env.PRIVACY_POLICY_URL || `${baseUrl}/legal/privacy`;
  const termsUrl = process.env.TERMS_URL || `${baseUrl}/legal/terms`;
  const unsubscribeUrl = `${baseUrl}/settings/notifications`;
  
  console.log('4️⃣ Variables préparées:');
  console.log(`   activation_code: ${testCode}`);
  console.log(`   support_email: ${supportEmail}`);
  console.log(`   privacy_policy_url: ${privacyPolicyUrl}`);
  console.log(`   terms_url: ${termsUrl}`);
  console.log(`   unsubscribe_url: ${unsubscribeUrl}\n`);
  
  // 5. Tester l'envoi
  console.log('5️⃣ Tentative d\'envoi de l\'email...');
  try {
    const result = await sendTransactionalEmail({
      templateId: 'account_activation',
      to: email,
      userId: 'test-user-id',
      tenantId: 'test-tenant-id',
      variables: {
        activation_code: testCode,
        support_email: supportEmail,
        privacy_policy_url: privacyPolicyUrl,
        terms_url: termsUrl,
        unsubscribe_url: unsubscribeUrl,
      },
    });
    
    console.log('✅ Email envoyé avec succès!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Status: ${result.status}\n`);
    
    console.log('📧 Vérifiez votre boîte de réception (et les spams)');
    console.log(`   Code de test: ${testCode}\n`);
    
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'envoi:', error.message);
    console.error('\n🔍 Détails de l\'erreur:');
    console.error(error);
    
    if (error.message.includes('BREVO_API_KEY')) {
      console.log('\n💡 Solution: Vérifiez que BREVO_API_KEY est correctement configuré dans .env');
    } else if (error.message.includes('401')) {
      console.log('\n💡 Solution: La clé API Brevo est invalide ou expirée. Générez une nouvelle clé dans Brevo.');
    } else if (error.message.includes('400')) {
      console.log('\n💡 Solution:');
      console.log('   - Vérifiez que le template ID est correct dans templates.ts');
      console.log('   - Vérifiez que toutes les variables sont présentes dans le template Brevo');
      console.log('   - Vérifiez que le template est actif dans Brevo');
    } else if (error.message.includes('template')) {
      console.log('\n💡 Solution:');
      console.log('   - Vérifiez que le template account_activation existe dans Brevo');
      console.log('   - Vérifiez que l\'ID du template correspond à brevoTemplateId dans templates.ts');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer l'email depuis les arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Usage: pnpm exec tsx scripts/test-activation-email.ts <email>');
  console.log('\nExemple: pnpm exec tsx scripts/test-activation-email.ts test@example.com');
  process.exit(1);
}

// Valider le format email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error(`❌ Email invalide: ${email}`);
  process.exit(1);
}

testActivationEmail(email)
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
