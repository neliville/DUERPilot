'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Rediriger vers le fichier HTML statique
    window.location.href = '/landing/index.html';
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirection vers la landing page...</p>
      </div>
    </div>
  );
}
