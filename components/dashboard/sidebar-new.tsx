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
  History,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Eye,
  Clock,
  Upload,
} from 'lucide-react';
import { PlanQuotaIndicator } from '@/components/plans';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

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
  const [organizationOpen, setOrganizationOpen] = useState(
    pathname?.startsWith('/dashboard/entreprises') || pathname?.startsWith('/dashboard/sites') || pathname?.startsWith('/dashboard/work-units') || pathname?.startsWith('/dashboard/utilisateurs')
  );
  const [referentielsOpen, setReferentielsOpen] = useState(
    pathname?.startsWith('/dashboard/referentiel') || pathname?.startsWith('/dashboard/referentiels')
  );
  const [evaluationsOpen, setEvaluationsOpen] = useState(
    pathname?.startsWith('/dashboard/evaluations') || pathname?.startsWith('/dashboard/import')
  );
  const [actionsOpen, setActionsOpen] = useState(
    pathname?.startsWith('/dashboard/assistance') || pathname?.startsWith('/dashboard/actions') || pathname?.startsWith('/dashboard/observations')
  );
  const [historiqueOpen, setHistoriqueOpen] = useState(
    pathname?.startsWith('/dashboard/historique')
  );
  const [settingsOpen, setSettingsOpen] = useState(
    pathname?.startsWith('/dashboard/settings')
  );

  // Sections regroupées de manière logique
  const navigationSections: NavigationSection[] = [
    {
      title: 'Accueil & Pilotage',
      items: [
        {
          name: 'Tableau de bord',
          href: '/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Organisation',
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
      title: 'Référentiels',
      items: [
        {
          name: 'Référentiels',
          href: '/dashboard/referentiels',
          icon: FileText,
          children: [
            { name: 'Dangers & risques', href: '/dashboard/referentiel' },
            { name: 'Activités & métiers', href: '/dashboard/referentiels/activites' },
            { name: 'Mesures de prévention', href: '/dashboard/referentiels/mesures' },
            { name: 'Grilles de cotation', href: '/dashboard/referentiels/cotation' },
          ],
        },
      ],
    },
    {
      title: 'Évaluations des Risques',
      items: [
        {
          name: 'Évaluations',
          href: '/dashboard/evaluations',
          icon: AlertTriangle,
          children: [
            {
              name: 'Évaluation avancée',
              href: '/dashboard/evaluations',
              description: 'Analyse détaillée par unité de travail',
            },
            {
              name: 'Synthèse DUERP',
              href: '/dashboard/evaluations/synthese',
            },
          ],
        },
        {
          name: 'Importer DUERP',
          href: '/dashboard/import',
          icon: Upload,
          plan: 'starter',
        },
      ],
    },
    {
      title: 'Actions & Prévention',
      items: [
        {
          name: 'Assistance',
          href: '/dashboard/assistance',
          icon: Sparkles,
          children: [
            { name: 'Suggestions d\'actions', href: '/dashboard/assistance/suggestions' },
            { name: 'Aide à la cotation', href: '/dashboard/assistance/cotation' },
            { name: 'Reformulations', href: '/dashboard/assistance/reformulations' },
            { name: 'Historique des aides', href: '/dashboard/assistance/historique' },
          ],
        },
        {
          name: 'Plan d\'actions',
          href: '/dashboard/actions',
          icon: ClipboardList,
          children: [
            { name: 'Actions de prévention', href: '/dashboard/actions?type=prevention' },
            { name: 'Actions correctives', href: '/dashboard/actions?type=corrective' },
            { name: 'Suivi & priorités', href: '/dashboard/actions?view=suivi' },
          ],
        },
        {
          name: 'Observations',
          href: '/dashboard/observations',
          icon: Eye,
          children: [
            { name: 'Situations dangereuses', href: '/dashboard/observations?type=dangereuse' },
            { name: 'Presqu\'accidents', href: '/dashboard/observations?type=presqu-accident' },
            { name: 'Remontées terrain', href: '/dashboard/observations?type=terrain' },
          ],
        },
      ],
    },
    {
      title: 'Conformité & Historique',
      items: [
        {
          name: 'Conformité & historique',
          href: '/dashboard/historique',
          icon: Clock,
          children: [
            { name: 'Historique DUERP', href: '/dashboard/historique' },
            { name: 'Versions & mises à jour', href: '/dashboard/historique/versions' },
            { name: 'Journal de traçabilité', href: '/dashboard/historique/journal' },
          ],
        },
      ],
    },
    {
      title: 'Administration',
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
      case 'Référentiels':
        return referentielsOpen;
      case 'Évaluations':
        return evaluationsOpen;
      case 'Assistance':
      case 'Plan d\'actions':
      case 'Observations':
        return actionsOpen;
      case 'Conformité & historique':
        return historiqueOpen;
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
      case 'Référentiels':
        setReferentielsOpen(open);
        break;
      case 'Évaluations':
        setEvaluationsOpen(open);
        break;
      case 'Assistance':
      case 'Plan d\'actions':
      case 'Observations':
        setActionsOpen(open);
        break;
      case 'Conformité & historique':
        setHistoriqueOpen(open);
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
            {section.items.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const itemIsActive = isActive(item.href) || (hasChildren && item.children?.some(child => isActive(child.href)));
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
                        {item.children?.map((child) => {
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
        {/* Indicateur de quota IA */}
        <PlanQuotaIndicator />

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
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || 'Utilisateur'}
            </p>
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
