import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import StatsCard from '../components/common/StatsCard';
import RiskBadge from '../components/common/RiskBadge';
import StatusBadge from '../components/common/StatusBadge';
import Disclaimer from '../components/layout/Disclaimer';
import EmptyState from '../components/common/EmptyState';
import { 
  Shield, 
  AlertTriangle, 
  ClipboardList, 
  Calendar,
  FileText,
  Building2,
  Users,
  ChevronRight,
  Plus,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        
        const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
        if (profiles.length > 0) {
          setUserProfile(profiles[0]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadUser();
  }, []);

  const tenantId = userProfile?.tenant_id;
  const userRole = userProfile?.app_role || 'operator';

  // Fetch data
  const { data: workUnits = [] } = useQuery({
    queryKey: ['workUnits', tenantId],
    queryFn: () => base44.entities.WorkUnit.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const { data: riskAssessments = [] } = useQuery({
    queryKey: ['riskAssessments', tenantId],
    queryFn: () => base44.entities.RiskAssessment.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const { data: actionPlans = [] } = useQuery({
    queryKey: ['actionPlans', tenantId],
    queryFn: () => base44.entities.ActionPlan.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const { data: duerpVersions = [] } = useQuery({
    queryKey: ['duerpVersions', tenantId],
    queryFn: () => base44.entities.DuerpVersion.filter({ tenant_id: tenantId }, '-created_date', 5),
    enabled: !!tenantId,
  });

  // Calculate stats
  const priorityRisks = riskAssessments.filter(r => r.priority_level === 'prioritaire');
  const overdueActions = actionPlans.filter(a => 
    a.status !== 'termine' && 
    a.due_date && 
    isBefore(new Date(a.due_date), new Date())
  );
  const pendingActions = actionPlans.filter(a => a.status === 'a_faire');
  const latestDuerp = duerpVersions[0];

  // Recent activity
  const recentRisks = [...riskAssessments]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  const urgentActions = [...actionPlans]
    .filter(a => a.status !== 'termine')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  // Check if user needs to complete onboarding
  if (!tenantId && userRole !== 'super_admin') {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Building2}
              title="Configuration requise"
              description="Pour commencer à utiliser DUERP AI, vous devez d'abord configurer votre entreprise."
              actionLabel="Configurer mon entreprise"
              action={() => window.location.href = createPageUrl('Onboarding')}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">
            Vue d'ensemble de votre évaluation des risques
          </p>
        </div>
        {['qse', 'admin_tenant', 'super_admin'].includes(userRole) && (
          <Link to={createPageUrl('DuerpWizard')}>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Shield className="w-4 h-4" />
              Accéder au DUERP
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Unités de travail"
          value={workUnits.length}
          icon={Building2}
          color="blue"
        />
        <StatsCard
          title="Risques prioritaires"
          value={priorityRisks.length}
          icon={AlertTriangle}
          color={priorityRisks.length > 0 ? 'red' : 'green'}
          description={priorityRisks.length > 0 ? "Nécessitent une attention immédiate" : "Aucun risque critique"}
        />
        <StatsCard
          title="Actions en retard"
          value={overdueActions.length}
          icon={Clock}
          color={overdueActions.length > 0 ? 'amber' : 'green'}
        />
        <StatsCard
          title="Dernière version DUERP"
          value={latestDuerp ? latestDuerp.year : '-'}
          icon={FileText}
          color="purple"
          description={latestDuerp ? format(new Date(latestDuerp.created_date), 'dd MMM yyyy', { locale: fr }) : 'Aucune version'}
        />
      </div>

      {/* Disclaimer */}
      <Disclaimer />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Risks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Risques prioritaires</CardTitle>
            <Link to={createPageUrl('DuerpWizard')}>
              <Button variant="ghost" size="sm" className="text-blue-600 gap-1">
                Voir tout <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {priorityRisks.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>Aucun risque prioritaire identifié</p>
              </div>
            ) : (
              <div className="space-y-3">
                {priorityRisks.slice(0, 5).map((risk) => (
                  <div 
                    key={risk.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-red-50 border border-red-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {risk.hazard_label}
                      </p>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {risk.situation_description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <RiskBadge level={risk.priority_level} score={risk.risk_score} showScore />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Actions à venir</CardTitle>
            <Link to={createPageUrl('ActionPlans')}>
              <Button variant="ghost" size="sm" className="text-blue-600 gap-1">
                Voir tout <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {urgentActions.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <ClipboardList className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>Aucune action en attente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentActions.map((action) => {
                  const isOverdue = action.due_date && isBefore(new Date(action.due_date), new Date());
                  return (
                    <div 
                      key={action.id}
                      className={`p-3 rounded-lg border ${isOverdue ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}
                    >
                      <p className="font-medium text-sm text-slate-900 line-clamp-2">
                        {action.action_label}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <StatusBadge status={action.status} />
                        <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                          {action.due_date && format(new Date(action.due_date), 'dd MMM', { locale: fr })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* DUERP History */}
      {duerpVersions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Historique DUERP</CardTitle>
            <Link to={createPageUrl('DuerpHistory')}>
              <Button variant="ghost" size="sm" className="text-blue-600 gap-1">
                Voir l'historique <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {duerpVersions.map((version) => (
                <div 
                  key={version.id}
                  className="flex-shrink-0 w-48 p-4 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-lg">{version.year}</span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {format(new Date(version.created_date), 'dd MMM yyyy', { locale: fr })}
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Version {version.version_number || 1}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}