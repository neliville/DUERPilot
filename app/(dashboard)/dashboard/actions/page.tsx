import { getServerApi } from '@/lib/trpc/server';
import { ActionList } from '@/components/actions/action-list';

export default async function ActionsPage() {
  const api = await getServerApi();
  const actions = await api.actionPlans.getAll();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Plans d'Actions</h1>
        <p className="mt-2 text-gray-600">
          Gérez les actions de prévention et de correction
        </p>
      </div>

      <ActionList initialData={actions} />
    </div>
  );
}

