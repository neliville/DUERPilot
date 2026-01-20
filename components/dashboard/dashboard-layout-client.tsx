'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar-new';
import { MobileSidebar } from '@/components/dashboard/mobile-sidebar';
import { Navbar } from '@/components/dashboard/navbar';
import { SkipLinks } from '@/components/accessibility/skip-links';
import { cn } from '@/lib/utils';

interface DashboardLayoutClientProps {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    [key: string]: any;
  };
  tenantName?: string;
  children: React.ReactNode;
}

export function DashboardLayoutClient({ user, tenantName, children }: DashboardLayoutClientProps) {
  const pathname = usePathname();
  
  // Pages qui nécessitent un layout plein écran (sans padding)
  const fullScreenPages: string[] = [
    // Aucune page plein écran pour l'instant
  ];
  
  const isFullScreen = fullScreenPages.some(page => pathname?.startsWith(page));

  return (
    <>
      <SkipLinks />
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar desktop - cachée sur mobile */}
        <aside 
          id="main-navigation"
          className="hidden lg:flex w-64 flex-col bg-white shadow-lg"
          aria-label="Navigation principale"
        >
          <Sidebar user={user} />
        </aside>

        {/* Sidebar mobile */}
        <MobileSidebar user={user} />

        {/* Contenu principal avec navbar */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar tenantName={tenantName} />

          {/* Contenu */}
          <main 
            id="main-content"
            className={cn(
              'flex-1 overflow-hidden lg:ml-0',
              !isFullScreen && 'overflow-y-auto'
            )}
            role="main"
          >
            {isFullScreen ? (
              children
            ) : (
              <div className="p-4 sm:p-6">{children}</div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

