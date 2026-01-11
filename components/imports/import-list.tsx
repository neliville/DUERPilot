'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { File, Trash2, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export function ImportList() {
  const { toast } = useToast();
  const { data: imports, isLoading, refetch } = api.imports.getAll.useQuery();

  const deleteMutation = api.imports.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Import supprimé',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Terminé</Badge>;
      case 'validated':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle2 className="h-3 w-3 mr-1" />Validé</Badge>;
      case 'analyzing':
        return <Badge className="bg-yellow-100 text-yellow-800"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Analyse</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Échec</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' Ko';
    return (bytes / 1024 / 1024).toFixed(2) + ' Mo';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!imports || imports.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun import pour le moment</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Historique des imports</CardTitle>
          <CardDescription>
            Liste de tous vos imports de documents DUERP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {imports.map((importItem) => (
              <div
                key={importItem.id}
                className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <File className="h-8 w-8 text-blue-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{importItem.fileName}</p>
                      {getStatusBadge(importItem.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{formatFileSize(importItem.fileSize)}</span>
                      <span className="uppercase">{importItem.format}</span>
                      <span>
                      {formatDistanceToNow(new Date(importItem.createdAt), {
                        addSuffix: true,
                      })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {importItem.status === 'validated' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Ouvrir modal de validation
                        toast({
                          title: 'Information',
                          description: 'Validation à venir',
                        });
                      }}
                    >
                      Valider
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer cet import ?')) {
                        deleteMutation.mutate({ importId: importItem.id });
                      }
                    }}
                    aria-label="Supprimer l'import"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

