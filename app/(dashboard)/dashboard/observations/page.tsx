import { getServerApi } from '@/lib/trpc/server';
import { ObservationList } from '@/components/observations/observation-list';

export default async function ObservationsPage() {
  const api = await getServerApi();
  const observations = await api.observations.getAll();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Observations</h1>
        <p className="mt-2 text-gray-600">
          Gérez les observations de sécurité
        </p>
      </div>

      <ObservationList initialData={observations} />
    </div>
  );
}

