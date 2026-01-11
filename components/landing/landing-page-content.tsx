'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function LandingPageContent() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la landing page statique dans public/
    router.replace('/landing/index.html');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Redirection vers la landing page...</p>
      </div>
    </div>
  );
}

