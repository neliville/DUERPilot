'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  AlertTriangle,
  ClipboardList,
  History,
  Settings,
  LogOut,
} from 'lucide-react';
import { PlanQuotaIndicator } from '@/components/plans';

interface SidebarProps {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    [key: string]: any;
  };
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Entreprises', href: '/dashboard/entreprises', icon: Building2 },
  { name: 'Unités de Travail', href: '/dashboard/work-units', icon: Users },
  { name: 'Référentiel', href: '/dashboard/referentiel', icon: FileText },
  { name: 'Évaluations', href: '/dashboard/evaluations', icon: AlertTriangle },
  { name: 'Actions', href: '/dashboard/actions', icon: ClipboardList },
  { name: 'Observations', href: '/dashboard/observations', icon: AlertTriangle },
  { name: 'Historique', href: '/dashboard/historique', icon: History },
  { name: 'Facturation', href: '/dashboard/settings/billing', icon: Settings },
  { name: 'Utilisateurs', href: '/dashboard/utilisateurs', icon: Users },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex w-64 flex-col bg-white shadow-lg">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-bold text-gray-900">DUERP AI</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4 space-y-4">
        {/* Indicateur de quota IA */}
        <PlanQuotaIndicator />

        <div className="flex items-center px-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-sm font-semibold">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || 'Utilisateur'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email || 'Non défini'}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

