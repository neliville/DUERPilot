import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.userProfile.findUnique({
    where: { email: 'ddwinsolutions@gmail.com' },
    select: {
      id: true,
      email: true,
      tenantId: true,
      isSuperAdmin: true,
      roles: true,
      emailVerified: true,
      password: true,
    },
  });
  
  console.log('👤 Utilisateur trouvé:', JSON.stringify(user, null, 2));
  
  if (user) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId! },
    });
    console.log('🏢 Tenant:', JSON.stringify(tenant, null, 2));
  }
  
  await prisma.$disconnect();
}

checkUser();
