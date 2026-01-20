/**
 * Script pour mettre à jour le plan d'un utilisateur
 * Usage: npx tsx scripts/update-user-plan.ts <email> <plan>
 * Exemple: npx tsx scripts/update-user-plan.ts ddwinsolutions@gmail.com expert
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const plan = process.argv[3] as 'free' | 'starter' | 'business' | 'premium' | 'entreprise';

  if (!email || !plan) {
    console.error('❌ Usage: npx tsx scripts/update-user-plan.ts <email> <plan>');
    console.error('Plans disponibles: free, starter, business, premium, entreprise');
    process.exit(1);
  }

  if (!['free', 'starter', 'business', 'premium', 'entreprise'].includes(plan)) {
    console.error(`❌ Plan invalide: ${plan}`);
    console.error('Plans disponibles: free, starter, business, premium, entreprise');
    process.exit(1);
  }

  console.log(`\n🔄 Mise à jour du plan de l'utilisateur ${email} vers ${plan.toUpperCase()}...\n`);

  // Vérifier si l'utilisateur existe
  const user = await prisma.userProfile.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ Utilisateur introuvable: ${email}`);
    process.exit(1);
  }

  console.log(`✅ Utilisateur trouvé: ${user.firstName} ${user.lastName}`);
  console.log(`   Plan actuel: ${user.plan.toUpperCase()}`);

  // Mettre à jour le plan
  const updatedUser = await prisma.userProfile.update({
    where: { email },
    data: { plan },
  });

  console.log(`\n✅ Plan mis à jour avec succès !`);
  console.log(`   Nouveau plan: ${updatedUser.plan.toUpperCase()}`);
  console.log(`\n✨ L'utilisateur ${email} a maintenant accès aux fonctionnalités du plan ${plan.toUpperCase()}.`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
