'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, Camera, MapPin } from 'lucide-react';
import { ObservationDialog } from './observation-dialog';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface ObservationListProps {
  initialData: any[];
}

export function ObservationList({ initialData }: ObservationListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: observations, refetch } = api.observations.getAll.useQuery(
    {
      status:
        statusFilter !== 'all'
          ? (statusFilter as 'nouvelle' | 'en_analyse' | 'intégrée' | 'rejetée')
          : undefined,
    },
    {
      initialData,
    }
  );

  const handleCreate = () => {
    setSelectedObservation(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (observation: any) => {
    setSelectedObservation(observation);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedObservation(null);
    refetch();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      nouvelle: 'secondary',
      en_analyse: 'default',
      intégrée: 'outline',
      rejetée: 'destructive',
    };
    const labels: Record<string, string> = {
      nouvelle: 'Nouvelle',
      en_analyse: 'En analyse',
      intégrée: 'Intégrée',
      rejetée: 'Rejetée',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liste des observations</CardTitle>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="nouvelle">Nouvelle</SelectItem>
                  <SelectItem value="en_analyse">En analyse</SelectItem>
                  <SelectItem value="intégrée">Intégrée</SelectItem>
                  <SelectItem value="rejetée">Rejetée</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle observation
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {observations && observations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Unité de Travail</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {observations.map((observation) => (
                  <TableRow key={observation.id}>
                    <TableCell className="max-w-md">
                      <p className="text-sm line-clamp-2">{observation.description}</p>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">Unité de travail</p>
                        <p className="text-xs text-gray-500">Voir détails</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {observation.photoUrl ? (
                        <div className="relative w-16 h-16 rounded overflow-hidden">
                          <Image
                            src={observation.photoUrl}
                            alt="Observation"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <Camera className="h-8 w-8 text-gray-300" />
                      )}
                    </TableCell>
                    <TableCell>
                      {observation.location ? (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {observation.location}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(observation.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(observation.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(observation)}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Eye className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Aucune observation
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par créer une nouvelle observation.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle observation
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ObservationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        observation={selectedObservation}
        onSuccess={handleSuccess}
      />
    </>
  );
}

