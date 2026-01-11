import { getServerApi } from '@/lib/trpc/server';
import { WorkUnitList } from '@/components/work-units/work-unit-list';

export default async function WorkUnitsPage() {
  const api = await getServerApi();
  const workUnits = await api.workUnits.getAll();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Unités de Travail
        </h1>
        <p className="mt-2 text-gray-600">
          Gérez les unités de travail de vos entreprises
        </p>
      </div>

      <WorkUnitList initialData={workUnits} />
    </div>
  );
}

