import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { Sidebar } from '@/components/dashboard/sidebar-new';
import { DashboardLayoutClient } from '@/components/dashboard/dashboard-layout-client';
import { prisma } from '@/lib/db';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Récupérer le nom du tenant
  let tenantName = 'Mon Entreprise';
  try {
    const userProfile = await prisma.userProfile.findUnique({
      where: { email: session.user.email! },
      select: {
        tenantId: true,
        tenant: {
          select: {
            name: true,
          },
        },
      },
    });

    if (userProfile?.tenant?.name) {
      tenantName = userProfile.tenant.name;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du tenant:', error);
  }

  return (
    <DashboardLayoutClient user={session.user} tenantName={tenantName}>
      {children}
    </DashboardLayoutClient>
  );
}
