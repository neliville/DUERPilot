'use client';

import Link from 'next/link';

/**
 * Skip Links pour la navigation au clavier
 * Permet aux utilisateurs de clavier de sauter directement au contenu principal
 */
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-4 focus-within:left-4 focus-within:z-50">
      <nav aria-label="Liens de navigation rapide">
        <ul className="flex flex-col gap-2">
          <li>
            <Link
              href="#main-content"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Aller au contenu principal
            </Link>
          </li>
          <li>
            <Link
              href="#main-navigation"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Aller à la navigation
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

