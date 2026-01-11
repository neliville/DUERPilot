import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { getServerApi } from '@/lib/trpc/server';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // NOTE: Les super admins peuvent accéder à l'onboarding directement
  // La redirection vers /admin se fait uniquement depuis la page d'accueil (/)
  // Cela permet aux super admins de tester le flux d'onboarding

  // Vérifier si l'utilisateur a déjà complété l'onboarding
  try {
    const api = await getServerApi();
    const companies = await api.companies.getAll();
    
    if (companies.length > 0) {
      redirect('/dashboard');
    }
  } catch (error) {
    // Si erreur, continuer vers l'onboarding
    console.error('Erreur lors de la vérification des entreprises:', error);
  }

  return <>{children}</>;
}
