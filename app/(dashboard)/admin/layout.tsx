import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { getServerApi } from '@/lib/trpc/server';
import { AdminLayoutClient } from '@/components/admin/admin-layout-client';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Vérifier que l'utilisateur est super admin
  const api = await getServerApi();
  let userProfile;
  try {
    userProfile = await api.auth.getCurrentUser();
  } catch (error) {
    redirect('/auth/signin');
  }

  if (!userProfile) {
    redirect('/auth/signin');
  }

  const isSuperAdmin = userProfile.isSuperAdmin || 
                      (userProfile.roles && userProfile.roles.includes('super_admin'));

  if (!isSuperAdmin) {
    redirect('/dashboard');
  }

  return (
    <AdminLayoutClient user={session.user} userProfile={userProfile}>
      {children}
    </AdminLayoutClient>
  );
}

