import { getServerApi } from '@/lib/trpc/server';
import { SitesList } from '@/components/sites/sites-list';

export default async function SitesPage() {
  const api = await getServerApi();
  
  // Récupérer toutes les entreprises pour avoir accès à leurs sites
  const companies = await api.companies.getAll();
  
  // Extraire tous les sites de toutes les entreprises
  const allSites = companies.flatMap((company) => 
    (company.sites || []).map((site: any) => ({
      ...site,
      companyName: company.legalName,
      companyId: company.id,
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sites</h1>
        <p className="mt-2 text-gray-600">
          Gérez tous les sites de vos entreprises
        </p>
      </div>

      <SitesList initialData={allSites} companies={companies} />
    </div>
  );
}
