import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import StatusBadge from '../components/common/StatusBadge';
import RiskBadge from '../components/common/RiskBadge';
import EmptyState from '../components/common/EmptyState';
import Disclaimer from '../components/layout/Disclaimer';
import { 
  ClipboardList, 
  Search, 
  Filter,
  Calendar,
  User,
  Clock,
  ChevronDown,
  MoreHorizontal,
  CheckCircle2,
  PlayCircle,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format, isBefore, isAfter, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const priorityOptions = [
  { value: 'all', label: 'Toutes priorités' },
  { value: 'critique', label: 'Critique' },
  { value: 'haute', label: 'Haute' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'basse', label: 'Basse' }
];

const statusOptions = [
  { value: 'all', label: 'Tous statuts' },
  { value: 'a_faire', label: 'À faire' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'bloque', label: 'Bloqué' },
  { value: 'termine', label: 'Terminé' }
];

const typeOptions = [
  { value: 'all', label: 'Tous types' },
  { value: 'technique', label: 'Technique' },
  { value: 'organisationnelle', label: 'Organisationnelle' },
  { value: 'humaine', label: 'Humaine' }
];

export default function ActionPlans() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedAction, setSelectedAction] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  const { data: actionPlans = [], isLoading } = useQuery({
    queryKey: ['actionPlans', tenantId],
    queryFn: () => base44.entities.ActionPlan.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const { data: workUnits = [] } = useQuery({
    queryKey: ['workUnits', tenantId],
    queryFn: () => base44.entities.WorkUnit.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ActionPlan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['actionPlans', tenantId]);
      setEditDialogOpen(false);
      setSelectedAction(null);
    },
  });

  // Filter actions
  const filteredActions = actionPlans.filter(action => {
    const matchesSearch = searchTerm === '' ||
      action.action_label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || action.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || action.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || action.action_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  // Sort by due date (overdue first)
  const sortedActions = [...filteredActions].sort((a, b) => {
    const aOverdue = a.due_date && isBefore(new Date(a.due_date), new Date()) && a.status !== 'termine';
    const bOverdue = b.due_date && isBefore(new Date(b.due_date), new Date()) && b.status !== 'termine';
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  // Stats
  const overdueCount = actionPlans.filter(a => 
    a.status !== 'termine' && a.due_date && isBefore(new Date(a.due_date), new Date())
  ).length;
  const pendingCount = actionPlans.filter(a => a.status === 'a_faire').length;
  const inProgressCount = actionPlans.filter(a => a.status === 'en_cours').length;
  const completedCount = actionPlans.filter(a => a.status === 'termine').length;

  const handleStatusChange = (action, newStatus) => {
    updateMutation.mutate({
      id: action.id,
      data: { 
        status: newStatus,
        completion_date: newStatus === 'termine' ? new Date().toISOString().split('T')[0] : null
      }
    });
  };

  const getWorkUnitName = (workUnitId) => {
    const wu = workUnits.find(w => w.id === workUnitId);
    return wu?.name || '-';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critique': return 'bg-red-100 text-red-700 border-red-200';
      case 'haute': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'moyenne': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'basse': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Plan d'actions</h1>
          <p className="text-slate-500 mt-1">
            Suivi des mesures de prévention
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={overdueCount > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-5 h-5 ${overdueCount > 0 ? 'text-red-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-2xl font-bold">{overdueCount}</p>
                <p className="text-sm text-slate-500">En retard</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-slate-500">À faire</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <PlayCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-sm text-slate-500">En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-slate-500">Terminées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher une action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Disclaimer />

      {/* Actions Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : sortedActions.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Aucune action"
              description="Les actions seront générées lors de l'évaluation des risques"
              className="py-12"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Action</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Unité de travail</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedActions.map((action) => {
                    const isOverdue = action.due_date && 
                      isBefore(new Date(action.due_date), new Date()) && 
                      action.status !== 'termine';
                    
                    return (
                      <TableRow 
                        key={action.id}
                        className={isOverdue ? 'bg-red-50' : ''}
                      >
                        <TableCell>
                          <p className="font-medium text-slate-900 line-clamp-2">
                            {action.action_label}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {action.action_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {getWorkUnitName(action.work_unit_id)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">{action.owner_name || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                            <Calendar className="w-4 h-4" />
                            {action.due_date 
                              ? format(new Date(action.due_date), 'dd MMM yyyy', { locale: fr })
                              : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getPriorityColor(action.priority)}>
                            {action.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={action.status} />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusChange(action, 'en_cours')}>
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Démarrer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(action, 'termine')}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Terminer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedAction(action);
                                setEditDialogOpen(true);
                              }}>
                                Modifier
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'action</DialogTitle>
          </DialogHeader>
          {selectedAction && (
            <div className="space-y-4">
              <div>
                <Label>Action</Label>
                <Textarea 
                  value={selectedAction.action_label}
                  onChange={(e) => setSelectedAction({...selectedAction, action_label: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Responsable</Label>
                  <Input 
                    value={selectedAction.owner_name || ''}
                    onChange={(e) => setSelectedAction({...selectedAction, owner_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Échéance</Label>
                  <Input 
                    type="date"
                    value={selectedAction.due_date || ''}
                    onChange={(e) => setSelectedAction({...selectedAction, due_date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea 
                  value={selectedAction.notes || ''}
                  onChange={(e) => setSelectedAction({...selectedAction, notes: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Annuler</Button>
            <Button 
              onClick={() => updateMutation.mutate({ id: selectedAction.id, data: selectedAction })}
              disabled={updateMutation.isPending}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}