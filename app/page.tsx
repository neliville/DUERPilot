import { auth } from '@/lib/auth-config';
import { getServerApi } from '@/lib/trpc/server';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect';

export default async function HomePage() {
  try {
    const session = await auth();

    console.log('🔍 [HomePage] Session complète:', JSON.stringify(session, null, 2));
    console.log('🔍 [HomePage] Session user:', session?.user);
    console.log('🔍 [HomePage] Session user email:', session?.user?.email);

    // Si l'utilisateur n'est pas authentifié, rediriger vers la landing page
    if (!session?.user) {
      console.log('➡️  [HomePage] Redirection vers landing (non authentifié)');
      console.log('➡️  [HomePage] Raison: session =', session, ', session.user =', session?.user);
      redirect('/landing');
    }

    // Vérifier si l'utilisateur est un super admin
    // Si c'est un super admin, rediriger directement vers /admin (pas besoin d'onboarding)
    // SAUF si le paramètre userView=true est présent (pour tester les pages utilisateurs)
    if (session.user.email) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { email: session.user.email },
        select: { isSuperAdmin: true, roles: true, tenantId: true },
      });

      console.log('👤 [HomePage] UserProfile trouvé:', {
        email: session.user.email,
        isSuperAdmin: userProfile?.isSuperAdmin,
        roles: userProfile?.roles,
        tenantId: userProfile?.tenantId,
      });

      const isSuperAdmin = userProfile?.isSuperAdmin || 
          (userProfile?.roles && userProfile.roles.includes('super_admin'));
      
      // Si c'est un super admin, rediriger vers /admin (pas besoin de tenant)
      if (isSuperAdmin) {
        console.log('➡️  [HomePage] Redirection vers /admin (super admin)');
        redirect('/admin');
      }

      // Si l'utilisateur n'est pas super admin et n'a pas de tenantId, rediriger vers l'onboarding
      if (!userProfile?.tenantId) {
        console.log('➡️  [HomePage] Redirection vers /onboarding (pas de tenantId)');
        redirect('/onboarding');
      }
    }

    // Si authentifié mais pas super admin, vérifier si l'utilisateur a complété l'onboarding initial
    try {
      console.log('🔍 [HomePage] Vérification des entreprises...');
      const api = await getServerApi();
      const companies = await api.companies.getAll();
      
      console.log('📊 [HomePage] Nombre d\'entreprises trouvées:', companies.length);
      
      if (companies.length === 0) {
        console.log('➡️  [HomePage] Redirection vers /onboarding (aucune entreprise)');
        redirect('/onboarding');
      } else {
        console.log('➡️  [HomePage] Redirection vers /dashboard (entreprises existantes)');
        redirect('/dashboard');
      }
    } catch (error) {
      // Ne pas attraper les erreurs de redirection Next.js
      if (isRedirectError(error)) {
        throw error;
      }
      
      // En cas d'erreur API, rediriger vers l'onboarding (l'utilisateur pourra créer une entreprise)
      console.error('❌ [HomePage] Erreur lors de la récupération des entreprises:', error);
      console.log('➡️  [HomePage] Redirection vers /onboarding (erreur API)');
      redirect('/onboarding');
    }
  } catch (error) {
    // Ne pas attraper les erreurs de redirection Next.js
    if (isRedirectError(error)) {
      throw error;
    }
    
    // En cas d'erreur d'authentification, rediriger vers la landing page
    console.error('❌ [HomePage] Erreur d\'authentification:', error);
    console.log('➡️  [HomePage] Redirection vers landing (erreur auth)');
    redirect('/landing');
  }
}
