import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DUERPilot : DUERP en 30 min avec IA | Lancement Mars 2026',
  description: 'Fini les 12 heures de rédaction manuelle. Importez votre DUERP existant ou créez-en un nouveau en 30 minutes. Inscription liste d\'attente : -30% early adopters.',
  keywords: 'duerp, logiciel duerp, évaluation risques professionnels, prévention risques',
  openGraph: {
    type: 'website',
    title: 'DUERPilot : DUERP IA | Lancement 2026',
    description: 'Fini les 12 heures de rédaction manuelle. Importez votre DUERP existant ou créez-en un nouveau en 30 minutes.',
    url: 'https://duerpilot.fr',
    images: [
      {
        url: 'https://duerpilot.fr/assets/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DUERPilot - DUERP en 30 min avec IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DUERPilot | Lancement Mars 2026',
    images: ['https://duerpilot.fr/assets/images/twitter-card.jpg'],
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style jsx global>{`
        /* Réinitialiser les styles du layout root pour la landing */
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        /* Cacher les toasters pour la landing */
        [data-sonner-toaster],
        [data-radix-toast-viewport] {
          display: none !important;
        }
      `}</style>
      <div style={{ 
        margin: 0, 
        padding: 0, 
        width: '100%', 
        minHeight: '100vh',
        overflow: 'auto'
      }}>
        {children}
      </div>
    </>
  );
}


