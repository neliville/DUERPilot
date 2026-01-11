import { getServerApi } from '@/lib/trpc/server';
import { VersionList } from '@/components/historique/version-list';

export default async function HistoriquePage() {
  const api = await getServerApi();
  const versions = await api.duerpVersions.getAll();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Historique DUERP</h1>
        <p className="mt-2 text-gray-600">
          Consultez et gérez les versions du Document Unique
        </p>
      </div>

      <VersionList initialData={versions} />
    </div>
  );
}

