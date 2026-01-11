import { Suspense } from 'react';
import { ImportPageClient } from '@/components/imports/import-page-client';

export const dynamic = 'force-dynamic';

export default function ImportPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Importer un DUERP</h1>
        <p className="text-gray-600 mt-2">
          Importez votre document DUERP existant (PDF, Word, Excel ou CSV) pour l'extraire automatiquement
        </p>
      </div>

      <Suspense fallback={<div>Chargement...</div>}>
        <ImportPageClient />
      </Suspense>
    </div>
  );
}

