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
import { Plus, FileText, Calendar, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface VersionListProps {
  initialData: any[];
}

export function VersionList({ initialData }: VersionListProps) {
  const { data: versions, refetch } = api.duerpVersions.getAll.useQuery(
    undefined,
    {
      initialData,
    }
  );

  const generateMutation = api.duerpVersions.create.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleGenerate = () => {
    // TODO: Ouvrir un dialog pour sélectionner l'entreprise et l'année
    // Pour l'instant, on génère avec les valeurs par défaut
    if (versions && versions.length > 0) {
      const firstCompany = versions[0]?.company;
      if (firstCompany) {
        generateMutation.mutate({
          companyId: firstCompany.id,
          year: new Date().getFullYear(),
          generationMode: 'humain',
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Versions DUERP</CardTitle>
          <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
            <Plus className="mr-2 h-4 w-4" />
            {generateMutation.isPending ? 'Génération...' : 'Nouvelle version'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {versions && versions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entreprise</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Statistiques</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      {version.company.legalName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {version.year}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">v{version.versionNumber}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{version.generationMode}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{version.workUnitCount} unités</div>
                      <div>{version.riskCount} risques</div>
                      <div>{version.priorityActionCount} actions prioritaires</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {version.pdfUrl ? (
                      <a
                        href={version.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/historique/${version.id}`}>
                      <Button variant="ghost" size="sm">
                        Voir
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              Aucune version
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Générez votre première version DUERP.
            </p>
            <div className="mt-6">
              <Button onClick={handleGenerate}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle version
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

