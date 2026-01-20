import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testUserFlow(email: string) {
  console.log('\n🔍 Test du flux d\'inscription et de connexion\n');
  console.log('📧 Email:', email);
  
  // 1. Vérifier si l'utilisateur existe
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
    console.log('❌ Utilisateur non trouvé dans la base de données');
    console.log('➡️  L\'utilisateur doit d\'abord s\'inscrire via /auth/signin\n');
    await prisma.$disconnect();
    return;
  }
  
  console.log('\n✅ Utilisateur trouvé:');
  console.log('   - ID:', userProfile.id);
  console.log('   - Nom:', userProfile.firstName, userProfile.lastName);
  console.log('   - Email vérifié:', userProfile.emailVerified ? '✅ Oui' : '❌ Non');
  console.log('   - Tenant:', userProfile.tenant.name, '(' + userProfile.tenant.slug + ')');
  console.log('   - Nombre d\'entreprises:', userProfile.tenant.companies.length);
  
  // 2. Vérifier l'état de vérification de l'email
  if (!userProfile.emailVerified) {
    console.log('\n⚠️  Email non vérifié');
    console.log('   - L\'utilisateur doit vérifier son email avant de se connecter');
    console.log('   - Token de vérification:', userProfile.emailVerificationToken || 'Non défini');
    console.log('   - Expiration:', userProfile.emailVerificationExpiry || 'Non défini');
    await prisma.$disconnect();
    return;
  }
  
  // 3. Vérifier les entreprises
  console.log('\n📊 Analyse de la redirection:');
  if (userProfile.tenant.companies.length === 0) {
    console.log('   ✅ Aucune entreprise → L\'utilisateur devrait être redirigé vers /onboarding');
  } else {
    console.log('   ✅ Entreprises existantes → L\'utilisateur devrait être redirigé vers /dashboard');
    console.log('\n   Entreprises:');
    userProfile.tenant.companies.forEach((company: any) => {
      console.log('   -', company.legalName, '(ID:', company.id + ')');
    });
  }
  
  // 4. Vérifier l'utilisateur NextAuth
  const nextAuthUser = await prisma.user.findUnique({
    where: { email },
  });
  
  console.log('\n🔐 Utilisateur NextAuth:');
  if (nextAuthUser) {
    console.log('   ✅ Existe');
    console.log('   - ID:', nextAuthUser.id);
    console.log('   - Email vérifié:', nextAuthUser.emailVerified ? '✅ Oui' : '❌ Non');
  } else {
    console.log('   ❌ N\'existe pas (problème potentiel)');
  }
  
  console.log('\n✅ Test terminé\n');
  await prisma.$disconnect();
}

const email = process.argv[2] || 'neliddk@gmail.com';
testUserFlow(email);
