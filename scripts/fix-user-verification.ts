import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUserVerification() {
  try {
    const email = 'berligne@yahoo.fr';
    
    // Mettre à jour l'utilisateur NextAuth pour marquer l'email comme vérifié
    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });
    
    console.log('✅ Email marqué comme vérifié pour:', email);
    console.log('   User ID:', user.id);
    console.log('   Email vérifié:', user.emailVerified);
    
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserVerification();

