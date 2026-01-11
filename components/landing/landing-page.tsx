'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { LandingHeader } from './landing-header';
// Components landing - TODO: Créer ces composants ou utiliser la landing statique
// import { LandingHero } from './landing-hero';
// import { LandingProblem } from './landing-problem';
// import { LandingSolution } from './landing-solution';
// Components landing - TODO: Créer ces composants ou utiliser la landing statique
// import { LandingFeatures } from './landing-features';
// import { LandingRoadmap } from './landing-roadmap';
// import { LandingPricing } from './landing-pricing';
// import { LandingSocialProof } from './landing-social-proof';
// import { LandingFAQ } from './landing-faq';
// import { LandingCTAFinal } from './landing-cta-final';
// import { LandingFooter } from './landing-footer';
// import { CookieBanner } from './cookie-banner';

export function LandingPage() {
  // useEffect(() => {
  //   // Initialiser AOS quand le composant est monté
  //   if (typeof window !== 'undefined') {
  //     import('aos/dist/aos.css');
  //     import('aos').then((AOS) => {
  //       AOS.default.init({
  //         duration: 800,
  //         easing: 'ease-in-out',
  //         once: true,
  //         offset: 100,
  //       });
  //     });
  //   }
  // }, []);

  return (
    <>
      {/* Charger les scripts nécessaires - TODO: Activer quand les composants seront créés */}
      {/* <Script src="https://unpkg.com/aos@2.3.1/dist/aos.js" strategy="lazyOnload" /> */}
      {/* <link rel="stylesheet" href="https://unpkg.com/aos@2.3.1/dist/aos.css" /> */}
      
      <div className="bg-white text-gray-900">
        <LandingHeader />
        <main>
          {/* Landing components - TODO: Implémenter ou utiliser landing statique */}
          {/* <LandingHero /> */}
          {/* <LandingProblem /> */}
          {/* <LandingSolution /> */}
          {/* <LandingFeatures /> */}
          {/* <LandingRoadmap /> */}
          {/* <LandingPricing /> */}
          {/* <LandingSocialProof /> */}
          {/* <LandingFAQ /> */}
          {/* <LandingCTAFinal /> */}
          <div className="p-8 text-center">
            <p className="text-gray-600">Landing page - En développement</p>
            <p className="text-sm text-gray-400 mt-2">Voir /landing/index.html pour la version statique</p>
          </div>
        </main>
        {/* <LandingFooter /> */}
        {/* <CookieBanner /> */}
        
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'DUERPilot',
              url: 'https://duerpilot.fr',
              description: 'Créez votre DUERP conforme en 30 minutes avec l\'IA',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'EUR',
              },
              datePublished: '2025-05-01',
            }),
          }}
        />
      </div>
    </>
  );
}
