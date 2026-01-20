import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testAuth() {
  const email = 'ddwinsolutions@gmail.com';
  const password = 'Admin123!';
  
  console.log('🔍 Test d\'authentification pour:', email);
  
  // 1. Chercher l'utilisateur
  const userProfile = await prisma.userProfile.findUnique({
    where: { email },
  });
  
  if (!userProfile) {
    console.log('❌ Utilisateur non trouvé');
    await prisma.$disconnect();
    return;
  }
  
  console.log('✅ Utilisateur trouvé:', {
    id: userProfile.id,
    email: userProfile.email,
    tenantId: userProfile.tenantId,
    emailVerified: userProfile.emailVerified,
    hasPassword: !!userProfile.password,
  });
  
  // 2. Vérifier l'email
  if (!userProfile.emailVerified) {
    console.log('❌ Email non vérifié');
    await prisma.$disconnect();
    return;
  }
  
  console.log('✅ Email vérifié');
  
  // 3. Vérifier le mot de passe
  if (userProfile.password) {
    const isValid = await bcrypt.compare(password, userProfile.password);
    console.log('🔐 Mot de passe valide:', isValid);
    
    if (!isValid) {
      console.log('❌ Mot de passe incorrect');
      await prisma.$disconnect();
      return;
    }
  }
  
  console.log('✅ Mot de passe correct');
  
  // 4. Vérifier l'utilisateur NextAuth
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    console.log('⚠️  Utilisateur NextAuth non trouvé - devrait être créé automatiquement');
  } else {
    console.log('✅ Utilisateur NextAuth trouvé:', {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
    });
  }
  
  console.log('\n🎉 Authentification devrait réussir !');
  console.log('📊 Données de session attendues:', {
    id: userProfile.id,
    email: userProfile.email,
    roles: userProfile.roles,
    tenantId: userProfile.tenantId,
  });
  
  await prisma.$disconnect();
}

testAuth();
