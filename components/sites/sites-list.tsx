'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, MapPin, Plus, Search } from 'lucide-react';
import Link from 'next/link';

interface Site {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  isMainSite: boolean;
  companyName: string;
  companyId: string;
}

interface Company {
  id: string;
  legalName: string;
}

interface SitesListProps {
  initialData: Site[];
  companies: Company[];
}

export function SitesList({ initialData, companies }: SitesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');

  // Filtrer les sites
  const filteredSites = initialData.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany =
      selectedCompany === 'all' || site.companyId === selectedCompany;

    return matchesSearch && matchesCompany;
  });

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un site..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white"
            >
              <option value="all">Toutes les entreprises</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.legalName}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des sites */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Sites ({filteredSites.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSites.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Aucun site trouvé
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedCompany !== 'all'
                  ? 'Essayez de modifier vos filtres'
                  : 'Commencez par créer une entreprise avec un site'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom du site</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSites.map((site) => (
                    <TableRow key={site.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {site.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/entreprises/${site.companyId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {site.companyName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {site.city && site.postalCode ? (
                          <span className="text-sm text-gray-600">
                            {site.city}, {site.postalCode}
                          </span>
                        ) : site.city ? (
                          <span className="text-sm text-gray-600">{site.city}</span>
                        ) : (
                          <span className="text-sm text-gray-400">Non renseigné</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {site.isMainSite && (
                          <Badge variant="default">Site principal</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/dashboard/entreprises/${site.companyId}`}>
                            Voir l'entreprise
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
