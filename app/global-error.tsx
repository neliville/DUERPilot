'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur pour le débogage
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="fr">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#dc2626',
            }}>
              Erreur critique
            </h1>
            <p style={{
              color: '#6b7280',
              marginBottom: '1.5rem',
            }}>
              Une erreur critique s'est produite. Veuillez réessayer ou contacter le support.
            </p>
            {error.message && (
              <div style={{
                background: '#f3f4f6',
                padding: '1rem',
                borderRadius: '4px',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                color: '#4b5563',
                wordBreak: 'break-word',
              }}>
                {error.message}
              </div>
            )}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
            }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Réessayer
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  color: '#2563eb',
                  border: '1px solid #2563eb',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Accueil
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}