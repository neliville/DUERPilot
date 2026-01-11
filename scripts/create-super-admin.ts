import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  const email = 'ddwinsolutions@gmail.com';
  const password = 'Admin123!'; // Mot de passe par défaut
  const firstName = 'Admin';
  const lastName = 'DUERP AI';

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.userProfile.findUnique({
      where: { email },
    });

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      console.log('⚠️  L\'utilisateur existe déjà, mise à jour...');
      // Mettre à jour l'utilisateur existant
      await prisma.userProfile.update({
        where: { email },
        data: {
          firstName,
          lastName,
          roles: ['super_admin'],
          isSuperAdmin: true,
          password: hashedPassword,
          emailVerified: true,
        },
      });
      console.log('✅ Utilisateur mis à jour avec le rôle super_admin');
      console.log('📧 Email:', email);
      console.log('🔑 Mot de passe:', password);
      console.log('👤 ID:', existingUser.id);
      await prisma.$disconnect();
      return;
    }

    // Créer ou récupérer un tenant par défaut
    let tenant = await prisma.tenant.findFirst({
      where: { slug: 'default' },
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'Default Tenant',
          slug: 'default',
        },
      });
      console.log('✅ Tenant par défaut créé');
    }

    // Créer l'utilisateur UserProfile
    const userProfile = await prisma.userProfile.create({
      data: {
        email,
        firstName,
        lastName,
        roles: ['super_admin'],
        isSuperAdmin: true,
        tenantId: tenant.id,
        emailVerified: true,
        password: hashedPassword,
      },
    });

    // Créer aussi l'utilisateur NextAuth
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: `${firstName} ${lastName}`.trim(),
        emailVerified: new Date(),
      },
    });

    // Le mot de passe a été hashé avec bcrypt et stocké dans UserProfile

    console.log('✅ Super admin créé avec succès !');
    console.log('📧 Email:', email);
    console.log('🔑 Mot de passe:', password);
    console.log('👤 ID:', userProfile.id);
    console.log('🏢 Tenant:', tenant.name);
    console.log('🔐 Rôles:', userProfile.roles);
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();

