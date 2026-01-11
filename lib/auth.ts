import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import { UserRole } from '@/types';
import bcrypt from 'bcryptjs';

export const authConfig: NextAuthConfig = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Chercher dans UserProfile (notre modèle métier)
        const userProfile = await prisma.userProfile.findUnique({
          where: {
            email: email,
          },
        });

        if (!userProfile) {
          return null;
        }

        // Vérifier que l'email est vérifié
        if (!userProfile.emailVerified) {
          // Retourner null pour indiquer que l'authentification a échoué
          // L'erreur sera gérée par la page de connexion qui redirigera vers la vérification
          return null;
        }

        // Vérifier que l'utilisateur existe aussi dans User (NextAuth)
        let user = await prisma.user.findUnique({
          where: { email: email },
        });

        // Créer l'utilisateur NextAuth s'il n'existe pas
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: userProfile.email,
              name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || userProfile.email || '',
              emailVerified: new Date(), // Marquer l'email comme vérifié par défaut
            },
          });
        } else if (!user.emailVerified) {
          // Si l'utilisateur existe mais l'email n'est pas vérifié, le marquer comme vérifié
          user = await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() },
          });
        }

        if (!user) {
          return null;
        }

        // Vérifier le mot de passe
        if (userProfile.password) {
          // Vérifier avec bcrypt si un hash est stocké
          const isValid = await bcrypt.compare(password, userProfile.password);
          if (!isValid) {
            return null;
          }
        } else {
          // Fallback pour le super admin (mot de passe en clair temporaire)
          if (email === 'ddwinsolutions@gmail.com') {
            const superAdminPassword = 'Admin123!';
            if (password !== superAdminPassword) {
              return null;
            }
          } else {
            // Si pas de mot de passe hashé, refuser la connexion
            return null;
          }
        }

        return {
          id: userProfile.id,
          email: userProfile.email,
          name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || userProfile.email || '',
          roles: userProfile.roles as UserRole[],
          tenantId: userProfile.tenantId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as UserRole[];
        session.user.tenantId = token.tenantId as string;
      }
      return session;
    },
  },
};

