'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Filter, MoreVertical, Eye, Edit, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCompaniesPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    plan: undefined as 'free' | 'starter' | 'pro' | 'expert' | undefined,
    status: undefined as 'active' | 'trial' | 'suspended' | 'cancelled' | undefined,
    sector: '',
    search: '',
  });
  const [page, setPage] = useState(0);
  const limit = 50;

  const { data, isLoading, refetch } = api.admin.companies.getAll.useQuery({
    plan: filters.plan,
    status: filters.status,
    sector: filters.sector || undefined,
    limit,
    offset: page * limit,
  });

  const updateStatusMutation = api.admin.companies.updateStatus.useMutation({
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Statut mis à jour avec succès',
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updatePlanMutation = api.admin.companies.updatePlan.useMutation({
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Plan mis à jour avec succès',
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleStatusChange = (companyId: string, status: 'active' | 'trial' | 'suspended' | 'cancelled') => {
    const company = data?.companies.find((c) => c.id === companyId);
    if (!company || !company.tenantId) {
      toast({
        title: 'Erreur',
        description: 'Entreprise non trouvée',
        variant: 'destructive',
      });
      return;
    }
    updateStatusMutation.mutate({ tenantId: company.tenantId, status });
  };

  const handlePlanChange = (companyId: string, plan: 'free' | 'starter' | 'pro' | 'expert') => {
    const company = data?.companies.find((c) => c.id === companyId);
    if (!company || !company.tenantId) {
      toast({
        title: 'Erreur',
        description: 'Entreprise non trouvée',
        variant: 'destructive',
      });
      return;
    }
    updatePlanMutation.mutate({ tenantId: company.tenantId, plan });
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'expert':
        return 'default';
      case 'pro':
        return 'secondary';
      case 'starter':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'trial':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Entreprises</h1>
        <p className="mt-2 text-gray-600">
          Vue centralisée avec toutes les données nécessaires par entreprise
        </p>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Recherche</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nom, SIRET..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="plan">Plan</Label>
              <Select
                value={filters.plan || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, plan: value === 'all' ? undefined : (value as any) })
                }
              >
                <SelectTrigger id="plan" className="mt-1">
                  <SelectValue placeholder="Tous les plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value === 'all' ? undefined : (value as any) })
                }
              >
                <SelectTrigger id="status" className="mt-1">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="trial">Essai</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                  <SelectItem value="cancelled">Résilié</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sector">Secteur</Label>
              <Input
                id="sector"
                placeholder="Secteur d'activité"
                value={filters.sector}
                onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Entreprises</CardTitle>
          <CardDescription className="text-base font-normal">
            {data?.total || 0} entreprise{data?.total !== 1 ? 's' : ''} au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>SIRET</TableHead>
                    <TableHead>Secteur</TableHead>
                    <TableHead>Effectif</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernière activité</TableHead>
                    <TableHead>Dernier DUERP</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.legalName}</TableCell>
                      <TableCell>{company.siret || '-'}</TableCell>
                      <TableCell>{company.sector || '-'}</TableCell>
                      <TableCell>{company.employeeCount || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={getPlanBadgeVariant(company.plan)}>
                          {company.plan.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(company.status)}>
                          {company.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {company.lastActivity
                          ? format(new Date(company.lastActivity), 'dd/MM/yyyy', { locale: fr })
                          : 'Jamais'}
                      </TableCell>
                      <TableCell>
                        {company.lastDuerpGeneration
                          ? format(new Date(company.lastDuerpGeneration), 'dd/MM/yyyy', { locale: fr })
                          : 'Jamais'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Changer plan</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handlePlanChange(company.id, 'free')}>
                              Free
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePlanChange(company.id, 'starter')}>
                              Starter
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePlanChange(company.id, 'pro')}>
                              Pro
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePlanChange(company.id, 'expert')}>
                              Expert
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Changer statut</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleStatusChange(company.id, 'active')}>
                              Actif
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(company.id, 'trial')}>
                              Essai
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(company.id, 'suspended')}>
                              Suspendu
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(company.id, 'cancelled')}>
                              Résilié
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {data && data.total > limit && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-base text-muted-foreground font-normal">
                Page {page + 1} sur {Math.ceil(data.total / limit)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * limit >= data.total}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

