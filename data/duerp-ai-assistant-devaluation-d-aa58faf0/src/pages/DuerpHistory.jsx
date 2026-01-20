import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EmptyState from '../components/common/EmptyState';
import Disclaimer from '../components/layout/Disclaimer';
import { 
  FileText, 
  Download, 
  Calendar,
  User,
  Eye,
  ChevronDown,
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DuerpHistory() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
        if (profiles.length > 0) setUserProfile(profiles[0]);
      } catch (e) {
        console.error(e);
      }
    };
    loadUser();
  }, []);

  const tenantId = userProfile?.tenant_id;

  const { data: duerpVersions = [], isLoading } = useQuery({
    queryKey: ['duerpVersions', tenantId],
    queryFn: () => base44.entities.DuerpVersion.filter({ tenant_id: tenantId }, '-created_date'),
    enabled: !!tenantId,
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies', tenantId],
    queryFn: () => base44.entities.Company.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });
  const company = companies[0];

  // Group by year
  const versionsByYear = duerpVersions.reduce((acc, version) => {
    const year = version.year;
    if (!acc[year]) acc[year] = [];
    acc[year].push(version);
    return acc;
  }, {});

  const sortedYears = Object.keys(versionsByYear).sort((a, b) => b - a);

  const handleViewDetails = (version) => {
    setSelectedVersion(version);
    setDetailsOpen(true);
  };

  const handleDownload = (version) => {
    if (version.pdf_url) {
      window.open(version.pdf_url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historique DUERP</h1>
          <p className="text-slate-500 mt-1">
            Versions archivées du Document Unique
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <Disclaimer />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{duerpVersions.length}</p>
                <p className="text-sm text-slate-500">Versions générées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold">{sortedYears.length}</p>
                <p className="text-sm text-slate-500">Années couvertes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {duerpVersions[0] 
                    ? format(new Date(duerpVersions[0].created_date), 'dd/MM/yyyy', { locale: fr })
                    : '-'}
                </p>
                <p className="text-sm text-slate-500">Dernière mise à jour</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Versions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : duerpVersions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={FileText}
              title="Aucune version DUERP"
              description="Les versions seront archivées lors de la génération du PDF"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedYears.map((year) => (
            <Card key={year}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Année {year}
                  <Badge variant="secondary" className="ml-2">
                    {versionsByYear[year].length} version{versionsByYear[year].length > 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Date de génération</TableHead>
                      <TableHead>Généré par</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead>Statistiques</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versionsByYear[year].map((version) => (
                      <TableRow key={version.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">v{version.version_number || 1}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(version.created_date), 'dd MMM yyyy à HH:mm', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">{version.generated_by_user || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={version.generated_by === 'ia' ? 'default' : 'secondary'}>
                            {version.generated_by === 'ia' ? 'IA' : 'Manuel'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {version.stats && (
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                              <span>{version.stats.nb_ut || 0} UT</span>
                              <span>{version.stats.nb_risks || 0} risques</span>
                              {version.stats.nb_priority > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {version.stats.nb_priority} prioritaire{version.stats.nb_priority > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewDetails(version)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {version.pdf_url && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDownload(version)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              DUERP {selectedVersion?.year} - Version {selectedVersion?.version_number || 1}
            </DialogTitle>
          </DialogHeader>
          {selectedVersion && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Entreprise</p>
                  <p className="font-medium">{company?.legal_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date de génération</p>
                  <p className="font-medium">
                    {format(new Date(selectedVersion.created_date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Généré par</p>
                  <p className="font-medium">{selectedVersion.generated_by_user || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Méthode</p>
                  <Badge variant={selectedVersion.generated_by === 'ia' ? 'default' : 'secondary'}>
                    {selectedVersion.generated_by === 'ia' ? 'Assisté par IA' : 'Manuel'}
                  </Badge>
                </div>
              </div>

              {selectedVersion.stats && (
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="py-3 text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedVersion.stats.nb_ut || 0}</p>
                      <p className="text-xs text-slate-500">Unités de travail</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-3 text-center">
                      <p className="text-2xl font-bold text-slate-900">{selectedVersion.stats.nb_risks || 0}</p>
                      <p className="text-xs text-slate-500">Risques évalués</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-3 text-center">
                      <p className="text-2xl font-bold text-red-600">{selectedVersion.stats.nb_priority || 0}</p>
                      <p className="text-xs text-slate-500">Prioritaires</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-3 text-center">
                      <p className="text-2xl font-bold text-emerald-600">{selectedVersion.stats.nb_actions || 0}</p>
                      <p className="text-xs text-slate-500">Actions</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedVersion.summary && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Résumé</p>
                  <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                    {selectedVersion.summary}
                  </p>
                </div>
              )}

              <Disclaimer variant="pdf" />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Fermer
                </Button>
                {selectedVersion.pdf_url && (
                  <Button onClick={() => handleDownload(selectedVersion)} className="gap-2">
                    <Download className="w-4 h-4" />
                    Télécharger PDF
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}