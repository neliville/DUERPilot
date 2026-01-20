import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EmptyState from '../components/common/EmptyState';
import { 
  Users as UsersIcon, 
  Plus, 
  Pencil,
  Trash2,
  Shield,
  Mail,
  Phone,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const roleConfig = {
  super_admin: { label: 'Super Admin', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  admin_tenant: { label: 'Admin', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  qse: { label: 'QSE', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  manager: { label: 'Manager', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  operator: { label: 'Opérateur', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  auditor: { label: 'Auditeur', className: 'bg-pink-100 text-pink-700 border-pink-200' }
};

const availableRoles = [
  { value: 'admin_tenant', label: 'Admin' },
  { value: 'qse', label: 'Responsable QSE' },
  { value: 'manager', label: 'Manager' },
  { value: 'operator', label: 'Opérateur' },
  { value: 'auditor', label: 'Auditeur externe' }
];

export default function Users() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [inviteForm, setInviteForm] = useState({ email: '', app_role: 'operator' });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setCurrentUser(u);
        const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
        if (profiles.length > 0) setCurrentProfile(profiles[0]);
      } catch (e) {
        console.error(e);
      }
    };
    loadUser();
  }, []);

  const tenantId = currentProfile?.tenant_id;
  const currentRole = currentProfile?.app_role;

  const { data: userProfiles = [], isLoading } = useQuery({
    queryKey: ['userProfiles', tenantId],
    queryFn: () => base44.entities.UserProfile.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const { data: workUnits = [] } = useQuery({
    queryKey: ['workUnits', tenantId],
    queryFn: () => base44.entities.WorkUnit.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const inviteMutation = useMutation({
    mutationFn: async (data) => {
      // Invite user via base44
      await base44.users.inviteUser(data.email, 'user');
      // Create profile
      await base44.entities.UserProfile.create({
        user_email: data.email,
        tenant_id: tenantId,
        app_role: data.app_role,
        job_title: data.job_title,
        phone: data.phone,
        notifications_enabled: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfiles', tenantId]);
      setInviteDialogOpen(false);
      setInviteForm({ email: '', app_role: 'operator' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfiles', tenantId]);
      setEditDialogOpen(false);
      setSelectedProfile(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.UserProfile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfiles', tenantId]);
      setDeleteDialogOpen(false);
      setSelectedProfile(null);
    },
  });

  // Filter profiles
  const filteredProfiles = userProfiles.filter(profile => {
    const matchesSearch = searchTerm === '' ||
      profile.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || profile.app_role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleEditProfile = (profile) => {
    setSelectedProfile({ ...profile });
    setEditDialogOpen(true);
  };

  const handleDeleteProfile = (profile) => {
    setSelectedProfile(profile);
    setDeleteDialogOpen(true);
  };

  const getInitials = (email) => {
    return email?.split('@')[0]?.slice(0, 2)?.toUpperCase() || 'U';
  };

  const canManageUsers = ['super_admin', 'admin_tenant'].includes(currentRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Utilisateurs</h1>
          <p className="text-slate-500 mt-1">
            Gérez les accès à votre espace DUERP
          </p>
        </div>
        {canManageUsers && (
          <Button onClick={() => setInviteDialogOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Inviter un utilisateur
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <UsersIcon className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{userProfiles.length}</p>
                <p className="text-sm text-slate-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold">{userProfiles.filter(p => p.app_role === 'qse').length}</p>
                <p className="text-sm text-slate-500">QSE</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <UsersIcon className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-2xl font-bold">{userProfiles.filter(p => p.app_role === 'manager').length}</p>
                <p className="text-sm text-slate-500">Managers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <UsersIcon className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-2xl font-bold">{userProfiles.filter(p => p.app_role === 'operator').length}</p>
                <p className="text-sm text-slate-500">Opérateurs</p>
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
                placeholder="Rechercher par email ou fonction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                {availableRoles.map(role => (
                  <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredProfiles.length === 0 ? (
            <EmptyState
              icon={UsersIcon}
              title="Aucun utilisateur"
              description="Invitez des collaborateurs pour travailler sur votre DUERP"
              actionLabel="Inviter un utilisateur"
              action={() => setInviteDialogOpen(true)}
              className="py-12"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Fonction</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {getInitials(profile.user_email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile.user_email}</p>
                          {profile.phone && (
                            <p className="text-sm text-slate-500">{profile.phone}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleConfig[profile.app_role]?.className}>
                        {roleConfig[profile.app_role]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {profile.job_title || '-'}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {profile.last_login 
                        ? format(new Date(profile.last_login), 'dd/MM/yyyy HH:mm', { locale: fr })
                        : 'Jamais'}
                    </TableCell>
                    <TableCell>
                      {canManageUsers && profile.user_email !== currentUser?.email && (
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => handleEditProfile(profile)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-600"
                            onClick={() => handleDeleteProfile(profile)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter un utilisateur</DialogTitle>
            <DialogDescription>
              L'utilisateur recevra un email d'invitation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="email@exemple.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Rôle *</Label>
              <Select
                value={inviteForm.app_role}
                onValueChange={(v) => setInviteForm({ ...inviteForm, app_role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fonction</Label>
              <Input
                value={inviteForm.job_title || ''}
                onChange={(e) => setInviteForm({ ...inviteForm, job_title: e.target.value })}
                placeholder="Ex: Responsable maintenance"
              />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={inviteForm.phone || ''}
                onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={() => inviteMutation.mutate(inviteForm)}
              disabled={!inviteForm.email || inviteMutation.isPending}
            >
              Envoyer l'invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={selectedProfile.user_email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select
                  value={selectedProfile.app_role}
                  onValueChange={(v) => setSelectedProfile({ ...selectedProfile, app_role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fonction</Label>
                <Input
                  value={selectedProfile.job_title || ''}
                  onChange={(e) => setSelectedProfile({ ...selectedProfile, job_title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={selectedProfile.phone || ''}
                  onChange={(e) => setSelectedProfile({ ...selectedProfile, phone: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={() => updateMutation.mutate({ id: selectedProfile.id, data: selectedProfile })}
              disabled={updateMutation.isPending}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'accès de {selectedProfile?.user_email} sera révoqué. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(selectedProfile?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}