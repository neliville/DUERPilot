'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      id="header"
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-all duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image
            src="/landing-assets/images/logo.svg"
            alt="DUERPilot"
            width={120}
            height={32}
            className="h-8 w-auto"
          />
          <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full animate-pulse">
            Lancement : Mai 2025
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <a
            href="#about"
            onClick={(e) => handleAnchorClick(e, '#about')}
            className="text-gray-700 hover:text-blue-600 transition"
          >
            À propos
          </a>
          <a
            href="#features"
            onClick={(e) => handleAnchorClick(e, '#features')}
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Fonctionnalités
          </a>
          <a
            href="#pricing"
            onClick={(e) => handleAnchorClick(e, '#pricing')}
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Tarifs
          </a>
          <a
            href="#faq"
            onClick={(e) => handleAnchorClick(e, '#faq')}
            className="text-gray-700 hover:text-blue-600 transition"
          >
            FAQ
          </a>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 hidden lg:block">
            Déjà <span id="counter" className="font-bold text-blue-600">347</span> inscrits
          </span>
          <Link
            href="/auth/signin"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Essayer gratuitement
          </Link>
          <a
            href="#waitlist"
            onClick={(e) => handleAnchorClick(e, '#waitlist')}
            className="bg-amber-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-600 transition ml-2"
          >
            Rejoindre liste d&apos;attente
          </a>
        </div>
      </nav>
    </header>
  );
}


