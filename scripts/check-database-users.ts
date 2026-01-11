/**
 * Script de vérification des utilisateurs dans la base de données
 * 
 * Vérifie les données dans les tables User, UserProfile, Tenant
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseUsers() {
  try {
    console.log('🔍 Vérification des utilisateurs dans la base de données...\n');

    // 1. Vérifier les tenants
    console.log('1️⃣ Table Tenant :');
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            companies: true,
            users: true, // Relation UserProfile dans Tenant s'appelle "users"
          },
        },
      },
    });

    if (tenants.length === 0) {
      console.log('  ❌ Aucun tenant trouvé');
    } else {
      console.log(`  ✅ ${tenants.length} tenant(s) trouvé(s) :\n`);
      tenants.forEach((tenant) => {
        console.log(`    - ID: ${tenant.id}`);
        console.log(`      Nom: ${tenant.name}`);
        console.log(`      Slug: ${tenant.slug}`);
        console.log(`      Entreprises: ${tenant._count.companies}`);
        console.log(`      Utilisateurs: ${tenant._count.users}`);
        console.log('');
      });
    }

    // 2. Vérifier les UserProfile
    console.log('2️⃣ Table UserProfile :');
    const userProfiles = await prisma.userProfile.findMany({
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (userProfiles.length === 0) {
      console.log('  ❌ Aucun UserProfile trouvé');
    } else {
      console.log(`  ✅ ${userProfiles.length} UserProfile trouvé(s) :\n`);
      userProfiles.forEach((profile) => {
        console.log(`    - ID: ${profile.id}`);
        console.log(`      Email: ${profile.email}`);
        console.log(`      Nom: ${profile.firstName} ${profile.lastName}`);
        console.log(`      Tenant: ${profile.tenant.name} (${profile.tenant.slug})`);
        console.log(`      Super Admin: ${profile.isSuperAdmin ? '✅ Oui' : '❌ Non'}`);
        console.log(`      Rôles: ${profile.roles.join(', ')}`);
        console.log(`      Plan: ${profile.plan || 'Non défini'}`);
        console.log(`      Email vérifié: ${profile.emailVerified ? '✅ Oui' : '❌ Non'}`);
        console.log(`      Créé le: ${profile.createdAt.toLocaleString('fr-FR')}`);
        console.log('');
      });
    }

    // 3. Vérifier les User (NextAuth)
    console.log('3️⃣ Table User (NextAuth) :');
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (users.length === 0) {
      console.log('  ❌ Aucun User (NextAuth) trouvé');
    } else {
      console.log(`  ✅ ${users.length} User (NextAuth) trouvé(s) :\n`);
      users.forEach((user) => {
        console.log(`    - ID: ${user.id}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Nom: ${user.name || 'Non défini'}`);
        console.log(`      Email vérifié: ${user.emailVerified ? `✅ Oui (${user.emailVerified.toLocaleString('fr-FR')})` : '❌ Non'}`);
        console.log(`      Créé le: ${user.createdAt.toLocaleString('fr-FR')}`);
        console.log('');
      });
    }

    // 4. Comparer UserProfile et User
    console.log('4️⃣ Comparaison UserProfile / User :');
    const emailsInProfile = new Set(userProfiles.map((p) => p.email));
    const emailsInUser = new Set(users.map((u) => u.email || ''));

    const profilesWithoutUser = userProfiles.filter((p) => !emailsInUser.has(p.email));
    const usersWithoutProfile = users.filter((u) => u.email && !emailsInUser.has(u.email));

    if (profilesWithoutUser.length > 0) {
      console.log(`  ⚠️  ${profilesWithoutUser.length} UserProfile sans User (NextAuth) correspondant :`);
      profilesWithoutUser.forEach((p) => {
        console.log(`    - ${p.email}`);
      });
    } else {
      console.log('  ✅ Tous les UserProfile ont un User (NextAuth) correspondant');
    }

    if (usersWithoutProfile.length > 0) {
      console.log(`  ⚠️  ${usersWithoutProfile.length} User (NextAuth) sans UserProfile correspondant :`);
      usersWithoutProfile.forEach((u) => {
        console.log(`    - ${u.email}`);
      });
    } else {
      console.log('  ✅ Tous les User (NextAuth) ont un UserProfile correspondant');
    }

    // 5. Vérifier l'utilisateur admin spécifique
    console.log('\n5️⃣ Vérification de l\'utilisateur admin (ddwinsolutions@gmail.com) :');
    const adminProfile = await prisma.userProfile.findUnique({
      where: { email: 'ddwinsolutions@gmail.com' },
      include: {
        tenant: true,
      },
    });

    if (adminProfile) {
      console.log('  ✅ UserProfile trouvé :');
      console.log(`    - ID: ${adminProfile.id}`);
      console.log(`    - Email: ${adminProfile.email}`);
      console.log(`    - Super Admin: ${adminProfile.isSuperAdmin ? '✅ Oui' : '❌ Non'}`);
      console.log(`    - Rôles: ${adminProfile.roles.join(', ')}`);
      console.log(`    - Email vérifié: ${adminProfile.emailVerified ? '✅ Oui' : '❌ Non'}`);
      console.log(`    - Tenant: ${adminProfile.tenant.name} (${adminProfile.tenant.slug})`);
    } else {
      console.log('  ❌ UserProfile admin non trouvé');
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: 'ddwinsolutions@gmail.com' },
    });

    if (adminUser) {
      console.log('  ✅ User (NextAuth) trouvé :');
      console.log(`    - ID: ${adminUser.id}`);
      console.log(`    - Email: ${adminUser.email}`);
      console.log(`    - Email vérifié: ${adminUser.emailVerified ? `✅ Oui` : '❌ Non'}`);
    } else {
      console.log('  ❌ User (NextAuth) admin non trouvé');
    }

    // 6. Résumé
    console.log('\n📊 Résumé :');
    console.log(`  - Tenants: ${tenants.length}`);
    console.log(`  - UserProfiles: ${userProfiles.length}`);
    console.log(`  - Users (NextAuth): ${users.length}`);
    console.log(`  - Admin (ddwinsolutions@gmail.com): ${adminProfile ? '✅ Trouvé' : '❌ Non trouvé'}`);

    if (userProfiles.length === 0 && users.length === 0) {
      console.log('\n⚠️  Aucun utilisateur trouvé dans la base de données.');
      console.log('   Si vous pouvez vous connecter, vérifiez :');
      console.log('   1. Que vous utilisez la bonne base de données');
      console.log('   2. Que les migrations ont été appliquées');
      console.log('   3. Que l\'utilisateur admin a été créé avec le script create-super-admin.ts');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification :', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseUsers().catch(console.error);

