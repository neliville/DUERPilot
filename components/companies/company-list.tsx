'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Building2, MapPin } from 'lucide-react';
import { CompanyDialog } from './company-dialog';
import { Badge } from '@/components/ui/badge';

interface CompanyListProps {
  initialData: any[];
}

export function CompanyList({ initialData }: CompanyListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const { data: companies, refetch } = api.companies.getAll.useQuery(
    undefined,
    {
      initialData,
    }
  );

  const handleCreate = () => {
    setSelectedCompany(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (company: any) => {
    setSelectedCompany(company);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedCompany(null);
    refetch();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liste des entreprises</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle entreprise
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {companies && companies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Raison sociale</TableHead>
                  <TableHead>SIRET</TableHead>
                  <TableHead>Secteur</TableHead>
                  <TableHead>Effectif</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Sites</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {company.legalName}
                      </div>
                    </TableCell>
                    <TableCell>
                      {company.siret ? (
                        <code className="text-sm">{company.siret}</code>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {company.sector || (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {company.employeeCount ? (
                        <Badge variant="secondary">
                          {company.employeeCount} employés
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {company.city ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {company.city}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {company._count?.sites || 0} site(s)
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(company)}
                      >
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Aucune entreprise
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par créer une nouvelle entreprise.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle entreprise
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CompanyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        company={selectedCompany}
        onSuccess={handleSuccess}
      />
    </>
  );
}

