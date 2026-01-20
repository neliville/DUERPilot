'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  FileText,
  AlertTriangle,
  ClipboardList,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Eye,
  Upload,
  MapPin,
  Users,
  CheckCircle,
  Crown,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { Badge } from '@/components/ui/badge';
import { hasPermission } from '@/lib/permissions';

interface SidebarProps {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    [key: string]: any;
  };
}

interface NavigationChild {
  name: string;
  href: string;
  description?: string;
  plan?: string;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  plan?: string;
  children?: NavigationChild[];
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { data: userProfile } = api.auth.getCurrentUser.useQuery();
  const [organizationOpen, setOrganizationOpen] = useState(
    pathname?.startsWith('/dashboard/entreprises') || 
    pathname?.startsWith('/dashboard/sites') || 
    pathname?.startsWith('/dashboard/work-units') || 
    pathname?.startsWith('/dashboard/utilisateurs')
  );
  const [settingsOpen, setSettingsOpen] = useState(
    pathname?.startsWith('/dashboard/settings')
  );

  // Fonction pour vérifier si un item doit être affiché selon les permissions
  const canAccessItem = (item: NavigationItem | NavigationChild): boolean => {
    if (!userProfile) return true; // Afficher par défaut pendant le chargement

    const userRoles = userProfile.roles || [];
    const isOwner = userProfile.isOwner || false;

    // Mapping des routes vers les permissions
    const permissionsMap: Record<string, { resource: string; action: string }> = {
      '/dashboard/entreprises': { resource: 'organization', action: 'view' },
      '/dashboard/sites': { resource: 'organization', action: 'view' },
      '/dashboard/work-units': { resource: 'organization', action: 'view' },
      '/dashboard/utilisateurs': { resource: 'users', action: 'view_all' },
      '/dashboard/referentiels': { resource: 'referentiels', action: 'view' },
      '/dashboard/evaluations': { resource: 'evaluations', action: 'view_all' },
      '/dashboard/import': { resource: 'imports', action: 'duerp' },
      '/dashboard/assistance': { resource: 'ai', action: 'suggest_risks' },
      '/dashboard/actions': { resource: 'actions', action: 'view_all' },
      '/dashboard/observations': { resource: 'observations', action: 'view_all' },
      '/dashboard/historique': { resource: 'conformite', action: 'view_all' },
      '/dashboard/settings/billing': { resource: 'facturation', action: 'view' },
    };

    const permission = permissionsMap[item.href];
    if (!permission) return true; // Si pas de permission définie, afficher par défaut

    return hasPermission(userRoles, isOwner, permission.resource, permission.action);
  };

  // Structure simplifiée selon les spécifications
  const navigationSections: NavigationSection[] = [
    {
      title: 'ACCUEIL & PILOTAGE',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'ORGANISATION',
      items: [
        {
          name: 'Organisation',
          href: '/dashboard/organisation',
          icon: Building2,
          children: [
            { name: 'Entreprise', href: '/dashboard/entreprises' },
            { name: 'Sites / Établissements', href: '/dashboard/sites', plan: 'expert' },
            { name: 'Unités de travail', href: '/dashboard/work-units', plan: 'pro' },
            { name: 'Utilisateurs', href: '/dashboard/utilisateurs' },
          ],
        },
      ],
    },
    {
      title: 'RÉFÉRENTIELS',
      items: [
        {
          name: 'Référentiels',
          href: '/dashboard/referentiels',
          icon: FileText,
          description: 'Page avec 4 onglets/sections',
        },
      ],
    },
    {
      title: 'DUERP',
      items: [
        {
          name: 'Évaluations',
          href: '/dashboard/evaluations',
          icon: AlertTriangle,
        },
        {
          name: 'Importer DUERP',
          href: '/dashboard/import',
          icon: Upload,
          plan: 'pro',
        },
      ],
    },
    {
      title: 'ACTIONS & PRÉVENTION',
      items: [
        {
          name: 'Assistance',
          href: '/dashboard/assistance',
          icon: Sparkles,
          description: 'AI',
        },
        {
          name: 'Plan d\'actions',
          href: '/dashboard/actions',
          icon: ClipboardList,
        },
        {
          name: 'Observations',
          href: '/dashboard/observations',
          icon: Eye,
        },
      ],
    },
    {
      title: 'CONFORMITÉ',
      items: [
        {
          name: 'Conformité & historique',
          href: '/dashboard/historique',
          icon: CheckCircle,
        },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        {
          name: 'Paramètres',
          href: '/dashboard/settings',
          icon: Settings,
          children: [
            { name: 'Abonnement & facturation', href: '/dashboard/settings/billing' },
            { name: 'Quotas d\'assistance', href: '/dashboard/settings/quotas' },
            { name: 'Paramètres généraux', href: '/dashboard/settings/generaux' },
            { name: 'Notifications', href: '/dashboard/settings/notifications' },
            { name: 'Support', href: '/dashboard/settings/support' },
          ],
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const getOpenState = (itemName: string) => {
    switch (itemName) {
      case 'Organisation':
        return organizationOpen;
      case 'Paramètres':
        return settingsOpen;
      default:
        return false;
    }
  };

  const setOpenState = (itemName: string, open: boolean) => {
    switch (itemName) {
      case 'Organisation':
        setOrganizationOpen(open);
        break;
      case 'Paramètres':
        setSettingsOpen(open);
        break;
    }
  };

  return (
    <div className="flex w-full flex-col h-full">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-bold text-gray-900">DUERP AI</h1>
      </div>

      <nav className="flex-1 space-y-4 px-3 py-4 overflow-y-auto">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {/* Titre de section */}
            <div className="px-3 py-1.5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h2>
            </div>

            {/* Items de la section */}
            {section.items
              .filter((item) => {
                // Filtrer selon les permissions
                if (!canAccessItem(item)) return false;
                
                // Si l'item a des enfants, vérifier qu'au moins un enfant est accessible
                if (item.children && item.children.length > 0) {
                  const hasAccessibleChild = item.children.some((child) => canAccessItem(child));
                  return hasAccessibleChild;
                }
                
                return true;
              })
              .map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                // Filtrer les enfants selon les permissions
                const filteredChildren = hasChildren 
                  ? item.children?.filter((child) => canAccessItem(child))
                  : undefined;

                const itemIsActive = isActive(item.href) || (hasChildren && filteredChildren?.some(child => isActive(child.href)));
                const isOpen = getOpenState(item.name);

              return (
                <div key={item.name}>
                  {hasChildren ? (
                    <Collapsible
                      open={isOpen}
                      onOpenChange={(open) => setOpenState(item.name, open)}
                    >
                      <CollapsibleTrigger
                        className={cn(
                          'w-full group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                          itemIsActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        )}
                        aria-expanded={isOpen}
                        aria-controls={`submenu-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <item.icon
                            className={cn(
                              'mr-3 h-5 w-5 flex-shrink-0',
                              itemIsActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                            )}
                            aria-hidden="true"
                          />
                          <span className="flex-1 text-left truncate">{item.name}</span>
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" aria-hidden="true" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0 ml-2" aria-hidden="true" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent 
                        id={`submenu-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="space-y-1 mt-1"
                      >
                        {filteredChildren?.map((child) => {
                          const childIsActive = isActive(child.href);
                          return (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={cn(
                                'block ml-8 pl-3 py-2 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                                childIsActive
                                  ? 'bg-blue-50 text-blue-600 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              )}
                              aria-current={childIsActive ? 'page' : undefined}
                            >
                              <div className="font-medium">{child.name}</div>
                              {'description' in child && child.description && (
                                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                  {child.description}
                                </div>
                              )}
                            </Link>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        itemIsActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )}
                      aria-current={itemIsActive ? 'page' : undefined}
                    >
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          itemIsActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                        )}
                        aria-hidden="true"
                      />
                      <span className="flex-1">{item.name}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
        {/* Profil utilisateur */}
        <div className="flex items-center px-3 py-2">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-sm font-semibold">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || 'Utilisateur'}
              </p>
              {/* Badge Propriétaire */}
              {userProfile?.isOwner && (
                <Badge variant="default" className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  PROPRIÉTAIRE
                </Badge>
              )}
              {/* Badge Auditeur avec date d'expiration */}
              {userProfile?.roles?.includes('auditor') && userProfile.accessExpiry && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Auditeur
                  <Clock className="h-3 w-3" />
                  {new Date(userProfile.accessExpiry) > new Date() ? (
                    <span className="text-xs">
                      {new Date(userProfile.accessExpiry).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  ) : (
                    <span className="text-xs text-red-600">Expiré</span>
                  )}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{user.email || 'Non défini'}</p>
          </div>
        </div>

        {/* Bouton déconnexion */}
        <button
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          aria-label="Se déconnecter"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
