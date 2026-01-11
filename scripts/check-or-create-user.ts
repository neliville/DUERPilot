import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkOrCreateUser() {
  try {
    const email = 'berligne@yahoo.fr';
    const password = 'Admin123!';
    
    console.log('=== Vérification/Création utilisateur ===');
    console.log('Email:', email);
    console.log('');
    
    // Vérifier si l'utilisateur existe déjà
    const existing = await prisma.userProfile.findUnique({
      where: { email },
    });
    
    if (existing) {
      console.log('✅ L\'utilisateur existe déjà');
      console.log('  - ID:', existing.id);
      console.log('  - Prénom:', existing.firstName);
      console.log('  - Nom:', existing.lastName);
      console.log('  - Rôles:', existing.roles);
      
      // Vérifier le mot de passe
      if (existing.password) {
        const isValid = await bcrypt.compare(password, existing.password);
        console.log('  - Mot de passe valide:', isValid ? '✅' : '❌');
        if (!isValid) {
          console.log('  - ⚠️  Le mot de passe ne correspond pas. Mise à jour...');
          const hashedPassword = await bcrypt.hash(password, 10);
          await prisma.userProfile.update({
            where: { email },
            data: { password: hashedPassword },
          });
          console.log('  - ✅ Mot de passe mis à jour');
        }
      } else {
        console.log('  - ⚠️  Pas de mot de passe. Création du hash...');
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.userProfile.update({
          where: { email },
          data: { password: hashedPassword },
        });
        console.log('  - ✅ Mot de passe créé');
      }
      
      // Vérifier User (NextAuth)
      const user = await prisma.user.findUnique({
        where: { email },
      });
      
      if (!user) {
        console.log('  - ⚠️  User NextAuth manquant. Création...');
        await prisma.user.create({
          data: {
            email,
            name: `${existing.firstName || ''} ${existing.lastName || ''}`.trim() || email,
          },
        });
        console.log('  - ✅ User NextAuth créé');
      } else {
        console.log('  - ✅ User NextAuth existe');
      }
    } else {
      console.log('📝 Création de l\'utilisateur...');
      
      // Créer ou récupérer le tenant
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
        console.log('  - ✅ Tenant créé');
      }
      
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Créer UserProfile
      const userProfile = await prisma.userProfile.create({
        data: {
          email,
          firstName: 'DJAWLA',
          lastName: 'Dodzi',
          password: hashedPassword,
          roles: ['user'],
          tenantId: tenant.id,
        },
      });
      
      console.log('  - ✅ UserProfile créé');
      console.log('    ID:', userProfile.id);
      
      // Créer User (NextAuth)
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          name: 'DJAWLA Dodzi',
        },
      });
      
      console.log('  - ✅ User NextAuth créé');
      console.log('');
      console.log('✅ Utilisateur créé avec succès !');
    }
    
    console.log('');
    console.log('🎯 Vous pouvez maintenant vous connecter avec:');
    console.log('   Email: berligne@yahoo.fr');
    console.log('   Mot de passe: Admin123!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkOrCreateUser();

