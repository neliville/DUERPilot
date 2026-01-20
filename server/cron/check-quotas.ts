/**
 * Script cron pour vérifier les quotas des plans
 * À exécuter quotidiennement via un cron job ou Vercel Cron
 * 
 * Usage:
 *   pnpm tsx server/cron/check-quotas.ts
 * 
 * Ou via package.json:
 *   pnpm cron:check-quotas
 */

import { runDailyQuotaCheck } from '../services/plan-monitoring';

async function main() {
  console.log('🚀 [Cron] Démarrage de la vérification des quotas...');
  console.log(`📅 [Cron] Date: ${new Date().toISOString()}`);

  try {
    await runDailyQuotaCheck();
    console.log('✅ [Cron] Vérification des quotas terminée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Cron] Erreur lors de la vérification des quotas:', error);
    process.exit(1);
  }
}

main();
