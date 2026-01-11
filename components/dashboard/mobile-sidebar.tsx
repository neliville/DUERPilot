'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from './sidebar-new';
import { cn } from '@/lib/utils';

interface MobileSidebarProps {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    [key: string]: any;
  };
}

/**
 * Sidebar mobile avec menu hamburger
 * S'affiche uniquement sur les petits écrans
 */
export function MobileSidebar({ user }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Fermer le menu lors du changement de page
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Empêcher le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Bouton hamburger - visible uniquement sur mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir le menu de navigation"
          aria-expanded={isOpen}
          aria-controls="mobile-sidebar"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar mobile */}
      <aside
        id="mobile-sidebar"
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Navigation principale"
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col h-full">
          {/* En-tête avec bouton fermer */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">DUERP AI</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le menu"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Contenu de la sidebar */}
          <div className="flex-1 overflow-y-auto">
            <Sidebar user={user} />
          </div>
        </div>
      </aside>
    </>
  );
}

