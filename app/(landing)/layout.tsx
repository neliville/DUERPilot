import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'DUERPilot : DUERP en 30 min avec IA | Lancement Mai 2025',
  description: 'Créez votre DUERP conforme avec 3 méthodes + import existant. Inscription liste d\'attente : -30% early adopters.',
  keywords: 'duerp, logiciel duerp, inrs, évaluation risques',
  openGraph: {
    type: 'website',
    title: 'DUERPilot : DUERP IA | Lancement 2025',
    description: 'Liste d\'attente ouverte',
    url: 'https://duerpilot.fr',
    images: [
      {
        url: 'https://duerpilot.fr/landing-assets/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DUERPilot - DUERP en 30 min avec IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DUERPilot | Lancement Mai 2025',
    images: ['https://duerpilot.fr/landing-assets/images/twitter-card.jpg'],
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Charger les scripts nécessaires */}
      <Script src="https://unpkg.com/aos@2.3.1/dist/aos.js" strategy="lazyOnload" />
      {children}
    </>
  );
}


