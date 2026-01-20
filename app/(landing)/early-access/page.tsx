'use client';

import { useEffect, useRef } from 'react';

export default function EarlyAccessPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || !containerRef.current) return;
    loadedRef.current = true;

    // Charger le HTML via fetch pour éviter les problèmes de SSR
    fetch('/landing/early-access.html')
      .then(response => response.text())
      .then(htmlContent => {
        if (!containerRef.current) return;

        // Créer un document temporaire pour parser le HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

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
          const existingStyle = document.head.querySelector('style[data-early-access-style]');
          if (!existingStyle) {
            const newStyle = document.createElement('style');
            newStyle.setAttribute('data-early-access-style', 'true');
            newStyle.textContent = style.textContent || '';
            document.head.appendChild(newStyle);
          }
        });

        // Injecter le contenu du body
        const body = doc.querySelector('body');
        if (body && containerRef.current) {
          containerRef.current.innerHTML = body.innerHTML;

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
        console.error('Erreur lors du chargement de la page early-access:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="min-height: 100vh; display: flex; items-center; justify-content: center;">
              <div style="text-align: center;">
                <h1 style="font-size: 2rem; font-weight: bold; color: #dc2626; margin-bottom: 1rem;">Erreur de chargement</h1>
                <p style="color: #6b7280;">Impossible de charger la page d'accès anticipé</p>
              </div>
            </div>
          `;
        }
      });
  }, []);

  return <div ref={containerRef} style={{ minHeight: '100vh' }} />;
}
