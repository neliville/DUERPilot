'use client';

import { useEffect, useRef } from 'react';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || !containerRef.current) return;
    loadedRef.current = true;

    // Charger le HTML via fetch pour éviter les problèmes de SSR
    fetch('/landing/index.html')
      .then(response => response.text())
      .then(htmlContent => {
        if (!containerRef.current) return;

        // Créer un document temporaire pour parser le HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // Injecter les scripts du head (GTM, Clarity, etc.) AVANT tout le reste
        const headScripts = doc.querySelectorAll('head script');
        headScripts.forEach(script => {
          const src = script.getAttribute('src');
          const scriptContent = script.textContent;
          
          // Vérifier si le script existe déjà
          const existingScript = src 
            ? document.head.querySelector(`script[src="${src}"]`)
            : document.head.querySelector(`script:not([src])`);
          
          if (!existingScript) {
            const newScript = document.createElement('script');
            if (src) {
              newScript.src = src;
              if (script.hasAttribute('async')) newScript.async = true;
              if (script.hasAttribute('defer')) newScript.defer = true;
            } else {
              newScript.textContent = scriptContent || '';
            }
            // Insérer GTM en premier dans le head
            if (src && src.includes('googletagmanager.com')) {
              document.head.insertBefore(newScript, document.head.firstChild);
            } else {
              document.head.appendChild(newScript);
            }
          }
        });

        // Injecter les liens CSS dans le head
        const links = doc.querySelectorAll('link[rel="stylesheet"], link[rel="icon"], link[rel="preconnect"]');
        links.forEach(link => {
          const existingLink = document.head.querySelector(`link[href="${link.getAttribute('href')}"]`);
          if (!existingLink) {
            const newLink = document.createElement('link');
            Array.from(link.attributes).forEach(attr => {
              newLink.setAttribute(attr.name, attr.value);
            });
            document.head.appendChild(newLink);
          }
        });

        // Injecter les styles inline dans le head
        const styles = doc.querySelectorAll('style');
        styles.forEach(style => {
          const existingStyle = document.head.querySelector('style[data-landing-style]');
          if (!existingStyle) {
            const newStyle = document.createElement('style');
            newStyle.setAttribute('data-landing-style', 'true');
            newStyle.textContent = style.textContent || '';
            document.head.appendChild(newStyle);
          }
        });

        // Injecter le noscript GTM dans le body si présent
        const noscriptGTM = doc.querySelector('body noscript');
        if (noscriptGTM && !document.body.querySelector('noscript[data-gtm]')) {
          const newNoscript = document.createElement('noscript');
          newNoscript.setAttribute('data-gtm', 'true');
          newNoscript.innerHTML = noscriptGTM.innerHTML;
          document.body.insertBefore(newNoscript, document.body.firstChild);
        }

        // Injecter le contenu du body
        const body = doc.querySelector('body');
        if (body && containerRef.current) {
          // Exclure le noscript GTM du contenu car déjà injecté
          const bodyClone = body.cloneNode(true) as HTMLElement;
          const noscriptToRemove = bodyClone.querySelector('noscript');
          if (noscriptToRemove) {
            noscriptToRemove.remove();
          }
          containerRef.current.innerHTML = bodyClone.innerHTML;

          // Exécuter les scripts inline après injection
          const scripts = doc.querySelectorAll('script:not([src])');
          scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent || '';
            containerRef.current?.appendChild(newScript);
          });

          // Charger les scripts externes
          const externalScripts = doc.querySelectorAll('script[src]');
          externalScripts.forEach(script => {
            const src = script.getAttribute('src');
            if (src && !document.querySelector(`script[src="${src}"]`)) {
              const newScript = document.createElement('script');
              newScript.src = src;
              if (script.hasAttribute('async')) newScript.async = true;
              if (script.hasAttribute('defer')) newScript.defer = true;
              document.body.appendChild(newScript);
            }
          });
        }
      })
      .catch(error => {
        console.error('Erreur lors du chargement de la landing page:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center;">
              <div style="text-align: center;">
                <h1 style="font-size: 2rem; font-weight: bold; color: #dc2626; margin-bottom: 1rem;">Erreur de chargement</h1>
                <p style="color: #6b7280;">Impossible de charger la landing page</p>
              </div>
            </div>
          `;
        }
      });
  }, []);

  return <div ref={containerRef} style={{ minHeight: '100vh' }} />;
}
