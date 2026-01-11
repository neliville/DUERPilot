'use client';

import { api } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardWithHelp } from '@/components/ui/card-with-help';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertTriangle,
  Brain,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const { data: ceoView, isLoading, error } = api.admin.dashboard.getCEOView.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des données : {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!ceoView) {
    return null;
  }

  const { clients, revenue, margins, conversion, alerts } = ceoView;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard CEO</h1>
        <p className="mt-2 text-gray-600">
          Vue d'ensemble des KPIs essentiels pour prise de décision rapide
        </p>
      </div>

      {/* Alertes critiques */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert
              key={index}
              variant={alert.severity === 'high' ? 'destructive' : 'default'}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Clients actifs */}
        <CardWithHelp
          title="Clients actifs"
          helpText="Nombre total de clients actifs (non suspendus, non résiliés) par plan tarifaire."
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">{clients.active}</div>
          <p className="text-base text-muted-foreground font-normal">
            {clients.free} Free, {clients.starter} Starter, {clients.pro} Pro, {clients.expert} Expert
          </p>
        </CardWithHelp>

        {/* MRR */}
        <CardWithHelp
          title="MRR"
          helpText="Monthly Recurring Revenue : Revenus récurrents mensuels générés par tous les abonnements actifs. Indicateur clé de la santé financière."
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">{revenue.mrr.toLocaleString('fr-FR')} €</div>
          <p className="text-base text-muted-foreground font-normal">
            ARR: {revenue.arr.toLocaleString('fr-FR')} €
          </p>
        </CardWithHelp>

        {/* Marge nette */}
        <CardWithHelp
          title="Marge nette"
          helpText="Marge nette après déduction des coûts d'infrastructure et d'IA. Indicateur de rentabilité réelle du SaaS."
          icon={margins.grossMargin >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        >
          <div className={cn(
            "text-2xl font-bold",
            margins.grossMargin >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {margins.grossMargin.toLocaleString('fr-FR')} €
          </div>
          <p className="text-base text-muted-foreground font-normal">
            {margins.marginPercentage.toFixed(1)}% de marge
          </p>
        </CardWithHelp>

        {/* Coût IA */}
        <CardWithHelp
          title="Coût IA (mois)"
          helpText="Coût total de l'utilisation de l'IA (OpenAI, Anthropic) pour tous les clients. Impact direct sur la marge."
          icon={<Brain className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">{margins.aiCost.toLocaleString('fr-FR')} €</div>
          <p className="text-base text-muted-foreground font-normal">
            Infra: {margins.infraCost.toLocaleString('fr-FR')} €
          </p>
        </CardWithHelp>
      </div>

      {/* Détails financiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenus */}
        <Card>
          <CardHeader>
            <CardTitle>Revenus</CardTitle>
            <CardDescription>Revenus récurrents mensuels et annuels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base text-muted-foreground font-normal">MRR</span>
              <span className="text-lg font-semibold">{revenue.mrr.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base text-muted-foreground font-normal">MRR Net (après coûts IA)</span>
              <span className="text-lg font-semibold">{revenue.mrrNet.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ARR</span>
              <span className="text-lg font-semibold">{revenue.arr.toLocaleString('fr-FR')} €</span>
            </div>
          </CardContent>
        </Card>

        {/* Coûts et marges */}
        <Card>
          <CardHeader>
            <CardTitle>Coûts & Marges</CardTitle>
            <CardDescription>Détail des coûts et marge brute</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Coût IA</span>
              <span className="text-lg font-semibold">{margins.aiCost.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Coût Infra</span>
              <span className="text-lg font-semibold">{margins.infraCost.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Coût Total</span>
              <span className="text-lg font-semibold">{margins.totalCost.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-base font-semibold">Marge brute</span>
              <span className={cn(
                "text-lg font-bold",
                margins.grossMargin >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {margins.grossMargin.toLocaleString('fr-FR')} €
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base text-muted-foreground font-normal">% de marge</span>
              <Badge variant={margins.marginPercentage >= 20 ? "default" : "destructive"}>
                {margins.marginPercentage.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion */}
      <CardWithHelp
        title="Conversion Free → Starter"
        helpText="Taux de conversion du plan Free vers Starter. Indicateur de l'efficacité du produit et du pricing."
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold">{conversion.freeToStarterRate.toFixed(2)}%</div>
            <p className="text-sm text-muted-foreground mt-1">
              {conversion.starterUsersThisMonth} conversions ce mois sur {conversion.freeUsers} utilisateurs Free
            </p>
          </div>
          {conversion.freeToStarterRate >= 2 ? (
            <ArrowUpRight className="h-8 w-8 text-green-600" />
          ) : (
            <ArrowDownRight className="h-8 w-8 text-red-600" />
          )}
        </div>
      </CardWithHelp>
    </div>
  );
}

