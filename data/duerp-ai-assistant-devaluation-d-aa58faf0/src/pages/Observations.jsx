import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EmptyState from '../components/common/EmptyState';
import { 
  Eye, 
  Plus, 
  MapPin,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Camera,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusConfig = {
  nouvelle: { label: 'Nouvelle', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  en_analyse: { label: 'En analyse', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: Eye },
  integree: { label: 'Intégrée', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejetee: { label: 'Rejetée', className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
};

export default function Observations() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [observationForm, setObservationForm] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');

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
  const userRole = userProfile?.app_role || 'operator';

  const { data: observations = [], isLoading } = useQuery({
    queryKey: ['observations', tenantId],
    queryFn: () => base44.entities.Observation.filter({ tenant_id: tenantId }, '-created_date'),
    enabled: !!tenantId,
  });

  const { data: workUnits = [] } = useQuery({
    queryKey: ['workUnits', tenantId],
    queryFn: () => base44.entities.WorkUnit.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Observation.create({ 
      ...data, 
      tenant_id: tenantId,
      submitted_by: user?.email,
      status: 'nouvelle'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['observations', tenantId]);
      setNewDialogOpen(false);
      setObservationForm({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Observation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['observations', tenantId]);
      setReviewDialogOpen(false);
      setSelectedObservation(null);
    },
  });

  const filteredObservations = observations.filter(obs => 
    statusFilter === 'all' || obs.status === statusFilter
  );

  const getWorkUnitName = (id) => {
    const wu = workUnits.find(w => w.id === id);
    return wu?.name || '-';
  };

  const handleSubmitObservation = () => {
    createMutation.mutate(observationForm);
  };

  const handleReview = (obs) => {
    setSelectedObservation(obs);
    setReviewDialogOpen(true);
  };

  const handleStatusChange = (newStatus) => {
    updateMutation.mutate({
      id: selectedObservation.id,
      data: {
        status: newStatus,
        reviewed_by: user?.email,
        notes: selectedObservation.notes
      }
    });
  };

  // Stats
  const newCount = observations.filter(o => o.status === 'nouvelle').length;
  const analysisCount = observations.filter(o => o.status === 'en_analyse').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Observations</h1>
          <p className="text-slate-500 mt-1">
            Signalement de situations dangereuses
          </p>
        </div>
        <Button onClick={() => setNewDialogOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Nouvelle observation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={newCount > 0 ? "border-blue-200 bg-blue-50" : ""}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Clock className={`w-5 h-5 ${newCount > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-2xl font-bold">{newCount}</p>
                <p className="text-sm text-slate-500">Nouvelles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{analysisCount}</p>
                <p className="text-sm text-slate-500">En analyse</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{observations.filter(o => o.status === 'integree').length}</p>
                <p className="text-sm text-slate-500">Intégrées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-2xl font-bold">{observations.length}</p>
                <p className="text-sm text-slate-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="nouvelle">Nouvelles</SelectItem>
              <SelectItem value="en_analyse">En analyse</SelectItem>
              <SelectItem value="integree">Intégrées</SelectItem>
              <SelectItem value="rejetee">Rejetées</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Observations List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filteredObservations.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Eye}
              title="Aucune observation"
              description="Les observations permettent de signaler des situations dangereuses"
              actionLabel="Nouvelle observation"
              action={() => setNewDialogOpen(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredObservations.map((obs) => {
            const StatusIcon = statusConfig[obs.status]?.icon || Clock;
            return (
              <Card 
                key={obs.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => ['qse', 'admin_tenant', 'manager'].includes(userRole) && handleReview(obs)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge 
                      variant="outline" 
                      className={statusConfig[obs.status]?.className}
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[obs.status]?.label}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {format(new Date(obs.created_date), 'dd/MM/yyyy', { locale: fr })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-900 mb-3 line-clamp-3">
                    {obs.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-slate-500">
                    {obs.work_unit_id && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{getWorkUnitName(obs.work_unit_id)}</span>
                      </div>
                    )}
                    {obs.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{obs.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{obs.submitted_by}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Observation Dialog */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle observation</DialogTitle>
            <DialogDescription>
              Signalez une situation dangereuse ou une amélioration potentielle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Description de la situation *</Label>
              <Textarea
                placeholder="Décrivez la situation observée..."
                value={observationForm.description || ''}
                onChange={(e) => setObservationForm({ ...observationForm, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Unité de travail</Label>
              <Select
                value={observationForm.work_unit_id}
                onValueChange={(v) => setObservationForm({ ...observationForm, work_unit_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {workUnits.map(wu => (
                    <SelectItem key={wu.id} value={wu.id}>{wu.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Localisation précise</Label>
              <Input
                placeholder="Ex: Entrepôt zone B, bureau 3..."
                value={observationForm.location || ''}
                onChange={(e) => setObservationForm({ ...observationForm, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmitObservation}
              disabled={!observationForm.description || createMutation.isPending}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Soumettre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Examiner l'observation</DialogTitle>
          </DialogHeader>
          {selectedObservation && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-900">{selectedObservation.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Soumis par</p>
                  <p className="font-medium">{selectedObservation.submitted_by}</p>
                </div>
                <div>
                  <p className="text-slate-500">Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedObservation.created_date), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
                {selectedObservation.location && (
                  <div className="col-span-2">
                    <p className="text-slate-500">Localisation</p>
                    <p className="font-medium">{selectedObservation.location}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Notes de révision</Label>
                <Textarea
                  value={selectedObservation.notes || ''}
                  onChange={(e) => setSelectedObservation({ ...selectedObservation, notes: e.target.value })}
                  placeholder="Ajoutez vos notes..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => handleStatusChange('en_analyse')}
                  disabled={updateMutation.isPending}
                >
                  En analyse
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleStatusChange('rejetee')}
                  disabled={updateMutation.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeter
                </Button>
                <Button 
                  onClick={() => handleStatusChange('integree')}
                  disabled={updateMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Intégrer au DUERP
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}