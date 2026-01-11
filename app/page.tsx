import { auth } from '@/lib/auth-config';
import { getServerApi } from '@/lib/trpc/server';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  try {
    const session = await auth();

    // Si l'utilisateur n'est pas authentifié, rediriger vers la landing page
    if (!session?.user) {
      redirect('/landing/index.html');
    }

    // Vérifier si l'utilisateur est un super admin
    // Si c'est un super admin, rediriger directement vers /admin (pas besoin d'onboarding)
    // SAUF si le paramètre userView=true est présent (pour tester les pages utilisateurs)
    if (session.user.email) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { email: session.user.email },
        select: { isSuperAdmin: true, roles: true },
      });

      const isSuperAdmin = userProfile?.isSuperAdmin || 
          (userProfile?.roles && userProfile.roles.includes('super_admin'));
      
      // Permettre aux super admins d'accéder aux pages utilisateurs avec ?userView=true
      // (utile pour tester les fonctionnalités)
      if (isSuperAdmin) {
        // Si pas de paramètre userView, rediriger vers /admin
        redirect('/admin');
      }
    }

    // Si authentifié mais pas super admin, vérifier si l'utilisateur a complété l'onboarding initial
    try {
      const api = await getServerApi();
      const companies = await api.companies.getAll();
      
      if (companies.length === 0) {
        redirect('/onboarding');
      } else {
        redirect('/dashboard');
      }
    } catch (error) {
      // En cas d'erreur, rediriger vers le dashboard (l'utilisateur pourra créer une entreprise)
      console.error('Erreur lors de la récupération des entreprises:', error);
      redirect('/dashboard');
    }
  } catch (error) {
    // En cas d'erreur d'authentification, rediriger vers la landing page
    console.error('Erreur d\'authentification:', error);
    redirect('/landing/index.html');
  }
}
