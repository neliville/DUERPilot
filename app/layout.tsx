import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'DUERP AI - Assistant d\'évaluation des risques professionnels',
  description: 'Application moderne pour la création, la gestion et la mise à jour du Document Unique d\'Évaluation des Risques Professionnels',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}

