import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const email = 'berligne@yahoo.fr';
    const password = 'Admin123!';
    
    console.log('=== Test de connexion ===');
    console.log('Email:', email);
    console.log('Mot de passe:', password.replace(/./g, '*'));
    console.log('');
    
    // Étape 1: Vérifier que l'utilisateur existe
    console.log('1️⃣ Vérification de l\'utilisateur...');
    const userProfile = await prisma.userProfile.findUnique({
      where: { email },
    });
    
    if (!userProfile) {
      console.log('❌ ERREUR: L\'utilisateur n\'existe pas');
      console.log('   Solution: Créez l\'utilisateur avec scripts/check-or-create-user.ts');
      return;
    }
    
    console.log('✅ UserProfile trouvé');
    console.log('   - ID:', userProfile.id);
    console.log('   - Prénom:', userProfile.firstName);
    console.log('   - Nom:', userProfile.lastName);
    console.log('   - Rôles:', userProfile.roles);
    console.log('   - Tenant ID:', userProfile.tenantId);
    console.log('');
    
    // Étape 2: Vérifier le mot de passe
    console.log('2️⃣ Vérification du mot de passe...');
    if (!userProfile.password) {
      console.log('❌ ERREUR: Pas de mot de passe hashé');
      console.log('   Solution: Le mot de passe doit être hashé avec bcrypt');
      return;
    }
    
    const isValid = await bcrypt.compare(password, userProfile.password);
    if (!isValid) {
      console.log('❌ ERREUR: Le mot de passe ne correspond pas');
      console.log('   Solution: Vérifiez le mot de passe ou mettez à jour avec scripts/check-or-create-user.ts');
      return;
    }
    
    console.log('✅ Mot de passe valide');
    console.log('');
    
    // Étape 3: Vérifier User NextAuth
    console.log('3️⃣ Vérification User NextAuth...');
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.log('⚠️  User NextAuth manquant');
      console.log('   Création en cours...');
      await prisma.user.create({
        data: {
          email,
          name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || email,
        },
      });
      console.log('✅ User NextAuth créé');
    } else {
      console.log('✅ User NextAuth existe');
      console.log('   - ID:', user.id);
      console.log('   - Nom:', user.name);
    }
    console.log('');
    
    // Étape 4: Vérifier le tenant
    console.log('4️⃣ Vérification du tenant...');
    const tenant = await prisma.tenant.findUnique({
      where: { id: userProfile.tenantId },
    });
    
    if (!tenant) {
      console.log('❌ ERREUR: Tenant introuvable');
      return;
    }
    
    console.log('✅ Tenant trouvé');
    console.log('   - ID:', tenant.id);
    console.log('   - Nom:', tenant.name);
    console.log('   - Slug:', tenant.slug);
    console.log('');
    
    // Étape 5: Simuler la logique d'authentification
    console.log('5️⃣ Simulation de la logique d\'authentification...');
    console.log('');
    console.log('📋 Résumé de la vérification:');
    console.log('   ✅ UserProfile existe');
    console.log('   ✅ Mot de passe valide');
    console.log('   ✅ User NextAuth existe');
    console.log('   ✅ Tenant valide');
    console.log('');
    console.log('✅ Tous les tests sont passés !');
    console.log('');
    console.log('🎯 La connexion devrait fonctionner avec:');
    console.log('   Email: berligne@yahoo.fr');
    console.log('   Mot de passe: Admin123!');
    console.log('');
    console.log('💡 Si vous avez encore des erreurs:');
    console.log('   1. Vérifiez que le serveur est démarré (pnpm dev)');
    console.log('   2. Vérifiez les logs du serveur pour les erreurs');
    console.log('   3. Vérifiez que NextAuth est correctement configuré');
    console.log('   4. Vérifiez la page /auth/signin dans le navigateur');
    
  } catch (error: any) {
    console.error('❌ Erreur lors du test:', error);
    console.error('   Message:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();

