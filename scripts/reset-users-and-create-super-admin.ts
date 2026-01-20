import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetUsersAndCreateSuperAdmin() {
  const email = 'ddwinsolutions@gmail.com';
  const password = 'Admin123!';
  const firstName = 'Admin';
  const lastName = 'DUERP AI';

  try {
    console.log('🧹 Nettoyage des utilisateurs...');

    // Supprimer tous les UserProfile (cascade supprimera les relations)
    const deletedProfiles = await prisma.userProfile.deleteMany({});
    console.log(`✅ ${deletedProfiles.count} UserProfile(s) supprimé(s)`);

    // Supprimer tous les User (NextAuth)
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✅ ${deletedUsers.count} User(s) supprimé(s)`);

    // Supprimer tous les Tenants (cascade supprimera les relations)
    const deletedTenants = await prisma.tenant.deleteMany({});
    console.log(`✅ ${deletedTenants.count} Tenant(s) supprimé(s)`);

    console.log('\n👤 Création du super admin...');

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un tenant pour le super admin (pour tester l'application)
    const tenant = await prisma.tenant.create({
      data: {
        name: 'DDWIN Solutions',
        slug: 'ddwin-solutions',
      },
    });
    console.log(`✅ Tenant créé: ${tenant.name} (${tenant.slug})`);

    // Créer l'utilisateur UserProfile (super admin)
    const userProfile = await prisma.userProfile.create({
      data: {
        email,
        firstName,
        lastName,
        roles: ['super_admin'],
        isSuperAdmin: true,
        isOwner: true, // Le super admin est propriétaire de son tenant de test
        tenantId: tenant.id,
        emailVerified: true,
        password: hashedPassword,
      },
    });
    console.log(`✅ UserProfile créé: ${userProfile.email}`);

    // Créer aussi l'utilisateur NextAuth
    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`.trim(),
        emailVerified: new Date(),
      },
    });
    console.log(`✅ User NextAuth créé: ${user.email}`);

    // Mettre à jour le tenant pour lier le propriétaire
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { ownerId: userProfile.id },
    });
    console.log(`✅ Tenant mis à jour avec le propriétaire`);

    console.log('\n🎉 Super admin créé avec succès !');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', email);
    console.log('🔑 Mot de passe:', password);
    console.log('👤 ID:', userProfile.id);
    console.log('🏢 Tenant:', tenant.name);
    console.log('🔐 Rôles:', userProfile.roles);
    console.log('✅ isSuperAdmin:', userProfile.isSuperAdmin);
    console.log('✅ isOwner:', userProfile.isOwner);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetUsersAndCreateSuperAdmin()
  .then(() => {
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });