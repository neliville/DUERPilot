import { notFound } from 'next/navigation';
import { getServerApi } from '@/lib/trpc/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Phone, Mail, Globe, Users } from 'lucide-react';
import { PAPRIPACTList } from '@/components/papripact/papripact-list';
import { ParticipationList } from '@/components/participation-travailleurs/participation-list';

export default async function CompanyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const api = await getServerApi();
  const company = await api.companies.getById({ id: params.id });

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{company.legalName}</h1>
        <p className="mt-2 text-gray-600">Détails de l'entreprise</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Raison sociale</p>
              <p className="text-sm">{company.legalName}</p>
            </div>
            {company.siret && (
              <div>
                <p className="text-sm font-medium text-gray-500">SIRET</p>
                <code className="text-sm">{company.siret}</code>
              </div>
            )}
            {company.nafCode && (
              <div>
                <p className="text-sm font-medium text-gray-500">Code NAF</p>
                <code className="text-sm">{company.nafCode}</code>
              </div>
            )}
            {company.activity && (
              <div>
                <p className="text-sm font-medium text-gray-500">Activité</p>
                <p className="text-sm">{company.activity}</p>
              </div>
            )}
            {company.sector && (
              <div>
                <p className="text-sm font-medium text-gray-500">Secteur</p>
                <p className="text-sm">{company.sector}</p>
              </div>
            )}
            {company.employeeCount !== null && company.employeeCount !== undefined && (
              <div>
                <p className="text-sm font-medium text-gray-500">Effectif</p>
                <Badge variant="secondary">
                  <Users className="mr-1 h-3 w-3" />
                  {company.employeeCount} employés
                </Badge>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">CSE</p>
              <Badge variant={company.hasCSE ? 'default' : 'secondary'}>
                {company.hasCSE ? 'Présent' : 'Absent'}
              </Badge>
            </div>
            {company.duerpCreationDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Date création DUERP</p>
                <p className="text-sm">
                  {new Date(company.duerpCreationDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
            {company.duerpLastUpdateDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Dernière mise à jour DUERP</p>
                <p className="text-sm">
                  {new Date(company.duerpLastUpdateDate).toLocaleDateString('fr-FR')}
                </p>
                {company.duerpLastUpdateReason && (
                  <p className="text-sm text-gray-600 mt-1">
                    Raison : {company.duerpLastUpdateReason}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.address && (
              <div>
                <p className="text-sm font-medium text-gray-500">Adresse</p>
                <p className="text-sm">{company.address}</p>
                {(company.city || company.postalCode) && (
                  <p className="text-sm">
                    {company.postalCode} {company.city}
                  </p>
                )}
                {company.country && <p className="text-sm">{company.country}</p>}
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <p className="text-sm">{company.phone}</p>
              </div>
            )}
            {company.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <p className="text-sm">{company.email}</p>
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {company.website}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {company.sites && company.sites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sites ({company.sites.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {company.sites.map((site: any) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{site.name}</p>
                    {site.isMainSite && (
                      <Badge variant="default" className="mt-1">
                        Site principal
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PAPRIPACT - Affiché uniquement si effectif >= 50 */}
      <PAPRIPACTList
        companyId={company.id}
        employeeCount={company.employeeCount}
        initialData={company.papripact || []}
      />

      {/* Participation des travailleurs */}
      <ParticipationList
        companyId={company.id}
        initialData={company.participationTravailleurs || []}
      />
    </div>
  );
}
