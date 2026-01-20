'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Brain,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Shield,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Database,
} from 'lucide-react';

interface AdminSidebarProps {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    [key: string]: any;
  };
  userProfile: {
    id: string;
    email: string;
    isSuperAdmin: boolean;
    roles: string[];
    [key: string]: any;
  };
}

interface AdminNavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  external?: boolean;
}

const adminNavigation: AdminNavigationItem[] = [
  {
    name: 'Dashboard CEO',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble avec KPIs essentiels',
  },
  {
    name: 'Entreprises',
    href: '/admin/companies',
    icon: Building2,
    description: 'Gestion des entreprises et abonnements',
  },
  {
    name: 'Utilisateurs',
    href: '/admin/users',
    icon: Users,
    description: 'Gestion des utilisateurs et droits',
  },
  {
    name: 'Facturation',
    href: '/admin/billing',
    icon: CreditCard,
    description: 'MRR, ARR, marges, churn',
  },
  {
    name: 'Consommation IA',
    href: '/admin/ai-usage',
    icon: Brain,
    description: 'Coûts IA, top consommateurs, alertes',
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Analytics produit et adoption',
  },
  {
    name: 'Imports',
    href: '/admin/imports',
    icon: FileText,
    description: 'Monitoring des imports DUERP',
  },
  {
    name: 'Audit',
    href: '/admin/audit',
    icon: Shield,
    description: 'Journal d\'audit global',
  },
  {
    name: 'Support',
    href: '/admin/support',
    icon: AlertTriangle,
    description: 'Tickets et clients à risque',
  },
  {
    name: 'Référentiels',
    href: '/admin/referentials',
    icon: Settings,
    description: 'Gestion des référentiels risques',
  },
  {
    name: 'Documents Légaux',
    href: '/admin/legal-documents',
    icon: FileText,
    description: 'CGU, Mentions légales, Politique de confidentialité',
  },
  {
    name: 'Prisma Studio',
    href: 'http://localhost:5555',
    icon: Database,
    description: 'Ouvrir Prisma Studio (base de données)',
    external: true, // Lien externe
  },
];

export function AdminSidebar({ user, userProfile }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex w-64 flex-col bg-white shadow-lg border-r border-gray-200">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Admin</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {adminNavigation.map((item) => {
          const active = isActive(item.href);
          const isExternal = item.external === true;
          
          if (isExternal) {
            return (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
                title={item.description}
                onClick={(e) => {
                  // Vérifier si Prisma Studio est accessible
                  if (item.href === 'http://localhost:5555') {
                    e.preventDefault();
                    const studioWindow = window.open(item.href, '_blank', 'noopener,noreferrer');
                    if (!studioWindow) {
                      alert('⚠️ Prisma Studio n\'est pas accessible. Assurez-vous qu\'il est lancé avec : pnpm db:studio');
                    }
                  }
                }}
              >
                <item.icon
                  className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
                <span>{item.name}</span>
                <span className="ml-auto text-xs text-gray-400">↗</span>
              </a>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
              title={item.description}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                )}
                aria-hidden="true"
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="mb-3 px-3">
          <p className="text-xs font-medium text-gray-900 truncate">
            {user.name || user.email}
          </p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
          <p className="text-xs text-blue-600 font-semibold mt-1">Super Admin</p>
        </div>
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            title="Accéder au dashboard utilisateur pour tester les fonctionnalités"
          >
            <LayoutDashboard className="mr-3 h-4 w-4" />
            Vue utilisateur
          </Link>
          <Link
            href="/onboarding"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            title="Tester le flux d'onboarding"
          >
            <Users className="mr-3 h-4 w-4" />
            Tester onboarding
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}

