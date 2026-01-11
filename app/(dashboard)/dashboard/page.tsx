import { getServerApi } from '@/lib/trpc/server';
import { auth } from '@/lib/auth-config';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // NOTE: Les super admins peuvent accéder au dashboard directement
  // La redirection vers /admin se fait uniquement depuis la page d'accueil (/)
  // Cela permet aux super admins de tester les fonctionnalités utilisateur

  // Vérifier si l'utilisateur a une entreprise (onboarding initial complété)
  const api = await getServerApi();
  const companies = await api.companies.getAll();
  const hasCompletedInitialOnboarding = companies.length > 0;

  return (
    <DashboardContent
      user={session.user}
      hasCompletedInitialOnboarding={hasCompletedInitialOnboarding}
      initialCompanies={companies}
    />
  );
}
