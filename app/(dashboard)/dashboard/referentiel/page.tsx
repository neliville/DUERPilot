import { getServerApi } from '@/lib/trpc/server';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';

export default async function ReferentielPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Référentiel DUERP
        </h1>
        <p className="mt-2 text-gray-600">
          Consultez les référentiels internes basés sur les exigences réglementaires françaises et les bonnes pratiques professionnelles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/dashboard/referentiels/risques"
          className="block p-6 border rounded-lg hover:shadow-lg transition"
        >
          <h3 className="font-semibold text-lg mb-2">Bibliothèque de risques</h3>
          <p className="text-sm text-gray-600">
            Consultez les risques référencés par secteur d'activité avec hiérarchisation intelligente.
          </p>
        </a>
        
        <a
          href="/dashboard/referentiels/activites"
          className="block p-6 border rounded-lg hover:shadow-lg transition"
        >
          <h3 className="font-semibold text-lg mb-2">Secteurs d'activité</h3>
          <p className="text-sm text-gray-600">
            Consultez et gérez les secteurs d'activité disponibles.
          </p>
        </a>
        
        <a
          href="/dashboard/referentiels/mesures"
          className="block p-6 border rounded-lg hover:shadow-lg transition"
        >
          <h3 className="font-semibold text-lg mb-2">Mesures de prévention</h3>
          <p className="text-sm text-gray-600">
            Consultez les mesures de prévention référencées.
          </p>
        </a>
      </div>
    </div>
  );
}

