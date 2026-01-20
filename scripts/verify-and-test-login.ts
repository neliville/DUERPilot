import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verifyAndTestLogin(email: string, code: string) {
  console.log('\n🔍 Test de vérification et connexion\n');
  
  try {
    // 1. Vérifier l'utilisateur
    const userProfile = await prisma.userProfile.findUnique({
      where: { email },
      include: {
        tenant: {
          include: {
            companies: true,
          },
        },
      },
    });
    
    if (!userProfile) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    console.log('✅ Utilisateur trouvé:', userProfile.email);
    console.log('   Token attendu:', userProfile.emailVerificationToken);
    console.log('   Token fourni:', code);
    
    // 2. Vérifier le code
    if (userProfile.emailVerificationToken !== code) {
      console.log('❌ Code incorrect');
      return;
    }
    
    // Vérifier l'expiration
    if (userProfile.emailVerificationExpiry && new Date() > userProfile.emailVerificationExpiry) {
      console.log('❌ Code expiré');
      return;
    }
    
    console.log('✅ Code valide');
    
    // 3. Marquer l'email comme vérifié
    await prisma.userProfile.update({
      where: { email },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });
    
    // Mettre à jour aussi dans User (NextAuth)
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      },
    });
    
    console.log('✅ Email vérifié avec succès\n');
    
    // 4. Vérifier l'état de l'utilisateur pour la redirection
    console.log('📊 État de l\'utilisateur après vérification:');
    console.log('   - Email vérifié: ✅ Oui');
    console.log('   - Tenant:', userProfile.tenant.name);
    console.log('   - Nombre d\'entreprises:', userProfile.tenant.companies.length);
    
    if (userProfile.tenant.companies.length === 0) {
      console.log('\n✅ RÉSULTAT ATTENDU: L\'utilisateur devrait être redirigé vers /onboarding');
    } else {
      console.log('\n✅ RÉSULTAT ATTENDU: L\'utilisateur devrait être redirigé vers /dashboard');
    }
    
    console.log('\n🔐 Vous pouvez maintenant vous connecter avec:');
    console.log('   Email:', email);
    console.log('   Mot de passe: Admin123!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2] || 'neliddk@gmail.com';
const code = process.argv[3] || '848799';

verifyAndTestLogin(email, code);
