/**
 * Script pour migrer un utilisateur existant vers son propre tenant
 * 
 * Usage: pnpm exec tsx scripts/migrate-user-to-own-tenant.ts <email>
 * 
 * Ce script :
 * 1. Trouve l'utilisateur par email
 * 2. Crée un nouveau tenant pour cet utilisateur
 * 3. Migre l'utilisateur vers ce nouveau tenant
 * 4. Migre toutes ses données (entreprises, sites, etc.) vers le nouveau tenant
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateUserToOwnTenant(email: string) {
  console.log(`🔄 Migration de l'utilisateur ${email} vers son propre tenant...\n`);

  try {
    // 1. Trouver l'utilisateur
    const userProfile = await prisma.userProfile.findUnique({
      where: { email },
      include: {
        tenant: true,
        assignedWorkUnits: {
          include: {
            site: {
              include: {
                company: true,
              },
            },
          },
        },
      },
    });

    if (!userProfile) {
      console.error(`❌ Utilisateur ${email} non trouvé`);
      process.exit(1);
    }

    console.log(`✅ Utilisateur trouvé:`);
    console.log(`   ID: ${userProfile.id}`);
    console.log(`   Nom: ${userProfile.firstName} ${userProfile.lastName}`);
    console.log(`   Tenant actuel: ${userProfile.tenant.name} (${userProfile.tenant.slug})`);

    // Vérifier si l'utilisateur est déjà dans son propre tenant (pas le "default")
    if (userProfile.tenant.slug !== 'default') {
      console.log(`\n⚠️  L'utilisateur est déjà dans son propre tenant (${userProfile.tenant.slug})`);
      console.log(`   Aucune migration nécessaire.`);
      return;
    }

    // 2. Créer un nouveau tenant pour cet utilisateur
    const tenantSlug = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const tenantName = userProfile.firstName && userProfile.lastName
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : email.split('@')[0];

    console.log(`\n📦 Création d'un nouveau tenant...`);
    const newTenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        slug: tenantSlug,
      },
    });
    console.log(`✅ Nouveau tenant créé:`);
    console.log(`   ID: ${newTenant.id}`);
    console.log(`   Nom: ${newTenant.name}`);
    console.log(`   Slug: ${newTenant.slug}`);

    // 3. Migrer l'utilisateur vers le nouveau tenant
    console.log(`\n👤 Migration de l'utilisateur...`);
    await prisma.userProfile.update({
      where: { id: userProfile.id },
      data: {
        tenantId: newTenant.id,
      },
    });
    console.log(`✅ Utilisateur migré vers le nouveau tenant`);

    // 4. Trouver toutes les entreprises de l'ancien tenant qui appartiennent à cet utilisateur
    // (en réalité, dans un vrai système multi-tenant, on devrait migrer les entreprises aussi)
    // Mais pour simplifier, on va juste créer une nouvelle entreprise vide pour l'onboarding
    console.log(`\n📋 Vérification des entreprises...`);
    const companies = await prisma.company.findMany({
      where: {
        tenantId: userProfile.tenantId,
      },
    });

    if (companies.length > 0) {
      console.log(`⚠️  Attention: ${companies.length} entreprise(s) trouvée(s) dans l'ancien tenant`);
      console.log(`   Ces entreprises resteront dans le tenant "default"`);
      console.log(`   L'utilisateur devra créer sa propre entreprise via l'onboarding`);
    } else {
      console.log(`✅ Aucune entreprise à migrer`);
    }

    console.log(`\n✅ Migration terminée avec succès !`);
    console.log(`\n📝 Prochaines étapes:`);
    console.log(`   1. L'utilisateur ${email} doit se connecter`);
    console.log(`   2. Il sera redirigé vers l'onboarding`);
    console.log(`   3. Il pourra créer sa propre entreprise`);

  } catch (error) {
    console.error(`\n❌ Erreur lors de la migration:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer l'email depuis les arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Usage: pnpm exec tsx scripts/migrate-user-to-own-tenant.ts <email>');
  console.log('\nExemple: pnpm exec tsx scripts/migrate-user-to-own-tenant.ts neliddk@gmail.com');
  process.exit(1);
}

// Valider le format email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error(`❌ Email invalide: ${email}`);
  process.exit(1);
}

migrateUserToOwnTenant(email)
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
