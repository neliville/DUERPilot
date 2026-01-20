import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EmptyState from '../components/common/EmptyState';
import { 
  Building2, 
  MapPin, 
  Users, 
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Phone,
  Mail,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const sectors = [
  { value: 'industrie', label: 'Industrie' },
  { value: 'btp', label: 'BTP' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'services', label: 'Services' },
  { value: 'transport', label: 'Transport' },
  { value: 'sante', label: 'Santé' },
  { value: 'restauration', label: 'Restauration' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'autre', label: 'Autre' }
];

export default function CompanySettings() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({});
  const [siteDialogOpen, setSiteDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [siteForm, setSiteForm] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSite, setDeletingSite] = useState(null);

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

  const { data: companies = [] } = useQuery({
    queryKey: ['companies', tenantId],
    queryFn: () => base44.entities.Company.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });
  const company = companies[0];

  const { data: sites = [] } = useQuery({
    queryKey: ['sites', tenantId],
    queryFn: () => base44.entities.Site.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const updateCompanyMutation = useMutation({
    mutationFn: (data) => base44.entities.Company.update(company.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies', tenantId]);
      setEditingCompany(false);
    },
  });

  const createSiteMutation = useMutation({
    mutationFn: (data) => base44.entities.Site.create({ ...data, tenant_id: tenantId, company_id: company?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['sites', tenantId]);
      setSiteDialogOpen(false);
      setSiteForm({});
    },
  });

  const updateSiteMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Site.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sites', tenantId]);
      setSiteDialogOpen(false);
      setEditingSite(null);
      setSiteForm({});
    },
  });

  const deleteSiteMutation = useMutation({
    mutationFn: (id) => base44.entities.Site.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['sites', tenantId]);
      setDeleteDialogOpen(false);
      setDeletingSite(null);
    },
  });

  const handleEditCompany = () => {
    setCompanyForm(company || {});
    setEditingCompany(true);
  };

  const handleSaveCompany = () => {
    updateCompanyMutation.mutate(companyForm);
  };

  const handleAddSite = () => {
    setEditingSite(null);
    setSiteForm({ is_main_site: false });
    setSiteDialogOpen(true);
  };

  const handleEditSite = (site) => {
    setEditingSite(site);
    setSiteForm(site);
    setSiteDialogOpen(true);
  };

  const handleSaveSite = () => {
    if (editingSite) {
      updateSiteMutation.mutate({ id: editingSite.id, data: siteForm });
    } else {
      createSiteMutation.mutate(siteForm);
    }
  };

  if (!company) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Building2}
              title="Aucune entreprise configurée"
              description="Commencez par configurer votre entreprise"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paramètres entreprise</h1>
        <p className="text-slate-500 mt-1">
          Gérez les informations de votre entreprise et vos sites
        </p>
      </div>

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="w-4 h-4" />
            Entreprise
          </TabsTrigger>
          <TabsTrigger value="sites" className="gap-2">
            <MapPin className="w-4 h-4" />
            Sites ({sites.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Informations entreprise</CardTitle>
                <CardDescription>Données générales de l'entreprise</CardDescription>
              </div>
              {!editingCompany && (
                <Button variant="outline" onClick={handleEditCompany} className="gap-2">
                  <Pencil className="w-4 h-4" />
                  Modifier
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingCompany ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Raison sociale *</Label>
                      <Input
                        value={companyForm.legal_name || ''}
                        onChange={(e) => setCompanyForm({ ...companyForm, legal_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SIRET</Label>
                      <Input
                        value={companyForm.siret || ''}
                        onChange={(e) => setCompanyForm({ ...companyForm, siret: e.target.value })}
                        placeholder="14 chiffres"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Activité *</Label>
                      <Input
                        value={companyForm.activity || ''}
                        onChange={(e) => setCompanyForm({ ...companyForm, activity: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Secteur</Label>
                      <Select
                        value={companyForm.sector}
                        onValueChange={(v) => setCompanyForm({ ...companyForm, sector: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectors.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Effectif total *</Label>
                      <Input
                        type="number"
                        value={companyForm.workforce_total || ''}
                        onChange={(e) => setCompanyForm({ ...companyForm, workforce_total: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Adresse siège</Label>
                      <Input
                        value={companyForm.address || ''}
                        onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email contact</Label>
                      <Input
                        type="email"
                        value={companyForm.contact_email || ''}
                        onChange={(e) => setCompanyForm({ ...companyForm, contact_email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Téléphone</Label>
                      <Input
                        value={companyForm.contact_phone || ''}
                        onChange={(e) => setCompanyForm({ ...companyForm, contact_phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={companyForm.has_cse || false}
                      onCheckedChange={(c) => setCompanyForm({ ...companyForm, has_cse: c })}
                    />
                    <Label>L'entreprise dispose d'un CSE</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditingCompany(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </Button>
                    <Button onClick={handleSaveCompany} disabled={updateCompanyMutation.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">Raison sociale</p>
                      <p className="font-medium">{company.legal_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">SIRET</p>
                      <p className="font-medium font-mono">{company.siret || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Activité</p>
                      <p className="font-medium">{company.activity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Secteur</p>
                      <Badge variant="outline">{sectors.find(s => s.value === company.sector)?.label || company.sector}</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">Effectif</p>
                      <p className="font-medium">{company.workforce_total} salariés</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">CSE</p>
                      <Badge variant={company.has_cse ? "default" : "secondary"}>
                        {company.has_cse ? 'Oui' : 'Non'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Contact</p>
                      <div className="space-y-1">
                        {company.contact_email && (
                          <p className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-slate-400" />
                            {company.contact_email}
                          </p>
                        )}
                        {company.contact_phone && (
                          <p className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-slate-400" />
                            {company.contact_phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sites" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sites</CardTitle>
                <CardDescription>Gérez les différents sites de l'entreprise</CardDescription>
              </div>
              <Button onClick={handleAddSite} className="gap-2">
                <Plus className="w-4 h-4" />
                Ajouter un site
              </Button>
            </CardHeader>
            <CardContent>
              {sites.length === 0 ? (
                <EmptyState
                  icon={MapPin}
                  title="Aucun site"
                  description="Ajoutez vos sites pour organiser votre évaluation des risques"
                  actionLabel="Ajouter un site"
                  action={handleAddSite}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Adresse</TableHead>
                      <TableHead>Effectif</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sites.map((site) => (
                      <TableRow key={site.id}>
                        <TableCell className="font-medium">{site.name}</TableCell>
                        <TableCell>{site.address || '-'}</TableCell>
                        <TableCell>{site.workforce || '-'}</TableCell>
                        <TableCell>
                          {site.is_main_site && <Badge>Principal</Badge>}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="icon" onClick={() => handleEditSite(site)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-600"
                              onClick={() => { setDeletingSite(site); setDeleteDialogOpen(true); }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Site Dialog */}
      <Dialog open={siteDialogOpen} onOpenChange={setSiteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSite ? 'Modifier le site' : 'Ajouter un site'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom du site *</Label>
              <Input
                value={siteForm.name || ''}
                onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Textarea
                value={siteForm.address || ''}
                onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input
                  value={siteForm.city || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Code postal</Label>
                <Input
                  value={siteForm.postal_code || ''}
                  onChange={(e) => setSiteForm({ ...siteForm, postal_code: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Effectif du site</Label>
              <Input
                type="number"
                value={siteForm.workforce || ''}
                onChange={(e) => setSiteForm({ ...siteForm, workforce: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={siteForm.is_main_site || false}
                onCheckedChange={(c) => setSiteForm({ ...siteForm, is_main_site: c })}
              />
              <Label>Site principal</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSiteDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveSite} disabled={createSiteMutation.isPending || updateSiteMutation.isPending}>
              {editingSite ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le site ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le site "{deletingSite?.name}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSiteMutation.mutate(deletingSite?.id)}
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