import { getServerApi } from '@/lib/trpc/server';
import { CompanyList } from '@/components/companies/company-list';

export default async function CompaniesPage() {
  const api = await getServerApi();
  const companies = await api.companies.getAll();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Entreprises</h1>
        <p className="mt-2 text-gray-600">
          Gérez les entreprises et leurs informations
        </p>
      </div>

      <CompanyList initialData={companies} />
    </div>
  );
}

