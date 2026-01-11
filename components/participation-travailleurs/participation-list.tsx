'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Calendar, AlertCircle, FileText } from 'lucide-react';
import { ParticipationDialog } from './participation-dialog';
import { LegalMessageBanner } from '@/components/legal/legal-message-banner';

interface ParticipationListProps {
  companyId: string;
  initialData?: any[];
}

export function ParticipationList({ companyId, initialData }: ParticipationListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedParticipation, setSelectedParticipation] = useState<any>(null);

  const { data: participations, refetch } = api.participationTravailleurs.getAll.useQuery(
    { companyId },
    {
      initialData,
    }
  );

  const handleCreate = () => {
    setSelectedParticipation(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (participation: any) => {
    setSelectedParticipation(participation);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedParticipation(null);
    refetch();
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      consultation: 'default',
      information: 'secondary',
      association: 'outline',
    };
    const labels: Record<string, string> = {
      consultation: 'Consultation',
      information: 'Information',
      association: 'Association',
    };
    return (
      <Badge variant={variants[type] || 'secondary'}>
        {labels[type] || type}
      </Badge>
    );
  };

  const getStatusBadge = (isRealized: boolean) => {
    return (
      <Badge variant={isRealized ? 'default' : 'secondary'}>
        {isRealized ? 'Réalisée' : 'Prévue'}
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Participation des travailleurs</CardTitle>
            </div>
            <Button onClick={handleCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle participation
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <LegalMessageBanner type="participation" />

          {participations && participations.length > 0 ? (
            <div className="space-y-3">
              {participations.map((participation: any) => (
                <div
                  key={participation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleEdit(participation)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeBadge(participation.type)}
                      {getStatusBadge(participation.isRealized)}
                      {participation.subject && (
                        <span className="font-semibold">{participation.subject}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(participation.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      {participation.participantsCount !== null && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{participation.participantsCount} participant(s)</span>
                        </div>
                      )}
                      {participation.organizer && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>
                            {participation.organizer.firstName} {participation.organizer.lastName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Voir détails
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium mb-2">Aucune participation enregistrée</p>
              <p className="text-sm mb-4">
                Enregistrez les consultations, informations et associations des travailleurs au processus DUERP.
              </p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Créer une participation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ParticipationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        companyId={companyId}
        participation={selectedParticipation}
        onSuccess={handleSuccess}
      />
    </>
  );
}

