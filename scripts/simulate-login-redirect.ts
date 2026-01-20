import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simulateLoginRedirect(email: string) {
  console.log('\n🔍 Simulation du flux de connexion (app/page.tsx)\n');
  
  try {
    // Simuler exactement ce qui se passe dans app/page.tsx
    
    // 1. Vérifier si l'utilisateur existe et est authentifié
    const userProfile = await prisma.userProfile.findUnique({
      where: { email },
      select: { 
        isSuperAdmin: true, 
        roles: true, 
        tenantId: true,
        email: true,
        emailVerified: true,
      },
    });
    
    if (!userProfile) {
      console.log('❌ UserProfile non trouvé → Redirection vers /landing/index.html');
      return;
    }
    
    console.log('✅ UserProfile trouvé:');
    console.log('   - Email:', userProfile.email);
    console.log('   - Email vérifié:', userProfile.emailVerified);
    console.log('   - Super Admin:', userProfile.isSuperAdmin);
    console.log('   - Rôles:', userProfile.roles);
    console.log('   - TenantId:', userProfile.tenantId);
    
    // 2. Vérifier si super admin
    const isSuperAdmin = userProfile.isSuperAdmin || 
        (userProfile.roles && userProfile.roles.includes('super_admin'));
    
    if (isSuperAdmin) {
      console.log('\n➡️  REDIRECTION: /admin (super admin)');
      return;
    }
    
    console.log('\n✅ Utilisateur normal (pas super admin)');
    
    // 3. Vérifier les entreprises
    console.log('🔍 Vérification des entreprises...');
    
    const companies = await prisma.company.findMany({
      where: {
        tenantId: userProfile.tenantId,
      },
      select: {
        id: true,
        legalName: true,
      },
    });
    
    console.log('📊 Nombre d\'entreprises trouvées:', companies.length);
    
    if (companies.length > 0) {
      console.log('   Entreprises:');
      companies.forEach((c) => {
        console.log('   -', c.legalName, '(ID:', c.id + ')');
      });
    }
    
    // 4. Décider de la redirection
    if (companies.length === 0) {
      console.log('\n➡️  REDIRECTION ATTENDUE: /onboarding (aucune entreprise)');
    } else {
      console.log('\n➡️  REDIRECTION ATTENDUE: /dashboard (entreprises existantes)');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des entreprises:', error);
    console.log('\n➡️  REDIRECTION EN CAS D\'ERREUR: /onboarding');
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2] || 'neliddk@gmail.com';
simulateLoginRedirect(email);
