import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import RiskBadge from '../components/common/RiskBadge';
import CategoryBadge from '../components/common/CategoryBadge';
import StatusBadge from '../components/common/StatusBadge';
import Disclaimer from '../components/layout/Disclaimer';
import EmptyState from '../components/common/EmptyState';
import { 
  Shield, 
  Building2, 
  Plus,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  Sparkles,
  Loader2,
  FileText,
  ClipboardList,
  Pencil,
  Trash2,
  Info,
  HelpCircle,
  Download,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, title: 'Unités de travail', icon: Building2 },
  { id: 2, title: 'Évaluation', icon: AlertTriangle },
  { id: 3, title: 'Plan d\'actions', icon: ClipboardList },
  { id: 4, title: 'Génération', icon: FileText }
];

const frequencyLabels = ['Rare', 'Occasionnel', 'Fréquent', 'Permanent'];
const probabilityLabels = ['Improbable', 'Peu probable', 'Probable', 'Très probable'];
const severityLabels = ['Faible', 'Moyen', 'Grave', 'Très grave'];
const controlLabels = ['Excellente', 'Bonne', 'Insuffisante', 'Inexistante'];

export default function DuerpWizard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedWorkUnit, setSelectedWorkUnit] = useState(null);
  const [workUnitDialogOpen, setWorkUnitDialogOpen] = useState(false);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [editingWorkUnit, setEditingWorkUnit] = useState(null);
  const [editingRisk, setEditingRisk] = useState(null);
  const [workUnitForm, setWorkUnitForm] = useState({});
  const [riskForm, setRiskForm] = useState({
    frequency: 2,
    probability: 2,
    severity: 2,
    control: 2
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

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
  const userRole = userProfile?.app_role;
  const canEdit = ['qse', 'admin_tenant', 'super_admin'].includes(userRole);

  // Fetch data
  const { data: companies = [] } = useQuery({
    queryKey: ['companies', tenantId],
    queryFn: () => base44.entities.Company.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });
  const company = companies[0];

  const { data: workUnits = [], isLoading: loadingWU } = useQuery({
    queryKey: ['workUnits', tenantId],
    queryFn: () => base44.entities.WorkUnit.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const { data: hazards = [] } = useQuery({
    queryKey: ['hazards'],
    queryFn: () => base44.entities.HazardRef.filter({ is_active: true }),
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

  // Mutations
  const createWorkUnitMutation = useMutation({
    mutationFn: (data) => base44.entities.WorkUnit.create({ ...data, tenant_id: tenantId, company_id: company?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['workUnits', tenantId]);
      setWorkUnitDialogOpen(false);
      setWorkUnitForm({});
    },
  });

  const updateWorkUnitMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WorkUnit.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workUnits', tenantId]);
      setWorkUnitDialogOpen(false);
      setEditingWorkUnit(null);
      setWorkUnitForm({});
    },
  });

  const deleteWorkUnitMutation = useMutation({
    mutationFn: (id) => base44.entities.WorkUnit.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['workUnits', tenantId]);
      if (selectedWorkUnit?.id === id) setSelectedWorkUnit(null);
    },
  });

  const createRiskMutation = useMutation({
    mutationFn: (data) => base44.entities.RiskAssessment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['riskAssessments', tenantId]);
      setRiskDialogOpen(false);
      setRiskForm({ frequency: 2, probability: 2, severity: 2, control: 2 });
      setEditingRisk(null);
    },
  });

  const updateRiskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RiskAssessment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['riskAssessments', tenantId]);
      setRiskDialogOpen(false);
      setEditingRisk(null);
      setRiskForm({ frequency: 2, probability: 2, severity: 2, control: 2 });
    },
  });

  const createActionMutation = useMutation({
    mutationFn: (data) => base44.entities.ActionPlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['actionPlans', tenantId]);
    },
  });

  // Calculate risk score
  const calculateRiskScore = (f, p, s, c) => f * p * s * c;
  const getPriorityLevel = (score) => {
    if (score < 36) return 'faible';
    if (score < 108) return 'a_ameliorer';
    return 'prioritaire';
  };

  // Get risks for selected work unit
  const selectedWURisks = riskAssessments.filter(r => r.work_unit_id === selectedWorkUnit?.id);
  const selectedWUActions = actionPlans.filter(a => a.work_unit_id === selectedWorkUnit?.id);

  // AI Functions
  const suggestHazards = async () => {
    if (!selectedWorkUnit || !company) return;
    setAiLoading(true);
    setAiSuggestions(null);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un assistant spécialisé en évaluation des risques professionnels (DUERP) conforme au cadre français.

Entreprise: ${company.legal_name}
Activité: ${company.activity}
Secteur: ${company.sector || 'Non précisé'}

Unité de travail: ${selectedWorkUnit.name}
Description: ${selectedWorkUnit.description || 'Non précisée'}
Effectif: ${selectedWorkUnit.workforce || 'Non précisé'}

Dangers déjà identifiés pour cette UT: ${selectedWURisks.map(r => r.hazard_label).join(', ') || 'Aucun'}

Référentiel de dangers disponible:
${hazards.map(h => `- ${h.label} (${h.category}): ${h.description}`).join('\n')}

Suggère 3 à 5 dangers pertinents pour cette unité de travail qui n'ont pas encore été évalués.
Pour chaque suggestion, indique:
1. Le danger du référentiel (utilise le label exact)
2. La catégorie
3. Une justification courte

Tu n'émets jamais d'avis juridique définitif.
Tu rappelles que l'employeur reste responsable.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  hazard_label: { type: "string" },
                  category: { type: "string" },
                  justification: { type: "string" }
                }
              }
            },
            disclaimer: { type: "string" }
          }
        }
      });
      
      setAiSuggestions(response);
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const suggestCotation = async () => {
    if (!riskForm.hazard_id || !riskForm.situation_description) return;
    setAiLoading(true);
    
    const hazard = hazards.find(h => h.id === riskForm.hazard_id);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un assistant spécialisé en évaluation des risques professionnels (DUERP) conforme au cadre français.

Danger évalué: ${hazard?.label}
Catégorie: ${hazard?.category}
Description du danger: ${hazard?.description}

Situation décrite: ${riskForm.situation_description}
Mesures existantes: ${riskForm.existing_measures || 'Aucune précisée'}
Personnes exposées: ${riskForm.exposed_persons || 'Non précisé'}

Propose une cotation indicative (à valider par l'utilisateur):
- Fréquence (F): 1=Rare, 2=Occasionnel, 3=Fréquent, 4=Permanent
- Probabilité (P): 1=Improbable, 2=Peu probable, 3=Probable, 4=Très probable
- Gravité (G): 1=Faible, 2=Moyen, 3=Grave, 4=Très grave
- Maîtrise (M): 1=Excellente, 2=Bonne, 3=Insuffisante, 4=Inexistante

Tu n'émets jamais d'avis juridique définitif. La validation finale revient à l'employeur.`,
        response_json_schema: {
          type: "object",
          properties: {
            frequency: { type: "number" },
            probability: { type: "number" },
            severity: { type: "number" },
            control: { type: "number" },
            justification: { type: "string" },
            disclaimer: { type: "string" }
          }
        }
      });
      
      if (response) {
        setRiskForm(prev => ({
          ...prev,
          frequency: response.frequency || prev.frequency,
          probability: response.probability || prev.probability,
          severity: response.severity || prev.severity,
          control: response.control || prev.control,
          ai_suggestions: response
        }));
      }
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const generateActions = async (risk) => {
    setAiLoading(true);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un assistant spécialisé en évaluation des risques professionnels (DUERP) conforme au cadre français.

Danger: ${risk.hazard_label}
Situation: ${risk.situation_description}
Score de risque: ${risk.risk_score} (${risk.priority_level})
Mesures existantes: ${risk.existing_measures || 'Aucune'}

Génère 3 actions de prévention réalistes pour une PME française:
1. Une action TECHNIQUE (équipement, aménagement)
2. Une action ORGANISATIONNELLE (procédure, formation)
3. Une action HUMAINE (sensibilisation, EPI)

Pour chaque action, propose:
- Un libellé clair et actionnable
- Un indicateur de suivi
- Une échéance recommandée (en semaines)
- Une priorité (basse, moyenne, haute, critique)

Tu n'émets jamais d'avis juridique définitif.`,
        response_json_schema: {
          type: "object",
          properties: {
            actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action_type: { type: "string" },
                  action_label: { type: "string" },
                  indicator: { type: "string" },
                  weeks: { type: "number" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      if (response?.actions) {
        for (const action of response.actions) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + (action.weeks || 4) * 7);
          
          await createActionMutation.mutateAsync({
            tenant_id: tenantId,
            risk_assessment_id: risk.id,
            work_unit_id: risk.work_unit_id,
            action_type: action.action_type,
            action_label: action.action_label,
            indicator: action.indicator,
            priority: action.priority || 'moyenne',
            due_date: dueDate.toISOString().split('T')[0],
            status: 'a_faire',
            owner_name: ''
          });
        }
      }
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!company || totalRisks === 0) return;
    
    setGeneratingPdf(true);
    
    try {
      const currentYear = new Date().getFullYear();
      
      // Create DUERP version record
      await base44.entities.DuerpVersion.create({
        tenant_id: tenantId,
        company_id: company.id,
        year: currentYear,
        version_number: 1,
        generated_by: 'humain',
        generated_by_user: user.email,
        stats: {
          nb_ut: workUnits.length,
          nb_risks: totalRisks,
          nb_priority: priorityRisks,
          nb_actions: totalActions
        },
        snapshot_data: {
          workUnits,
          riskAssessments,
          actionPlans
        }
      });
      
      // Redirect to history page
      window.location.href = createPageUrl('DuerpHistory');
    } catch (error) {
      console.error('Error generating DUERP:', error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Handle work unit save
  const handleSaveWorkUnit = () => {
    if (editingWorkUnit) {
      updateWorkUnitMutation.mutate({ id: editingWorkUnit.id, data: workUnitForm });
    } else {
      createWorkUnitMutation.mutate(workUnitForm);
    }
  };

  // Handle risk save
  const handleSaveRisk = () => {
    const hazard = hazards.find(h => h.id === riskForm.hazard_id);
    const score = calculateRiskScore(riskForm.frequency, riskForm.probability, riskForm.severity, riskForm.control);
    const priority = getPriorityLevel(score);
    
    const data = {
      ...riskForm,
      tenant_id: tenantId,
      work_unit_id: selectedWorkUnit.id,
      hazard_label: hazard?.label,
      hazard_category: hazard?.category,
      risk_score: score,
      priority_level: priority
    };
    
    if (editingRisk) {
      updateRiskMutation.mutate({ id: editingRisk.id, data });
    } else {
      createRiskMutation.mutate(data);
    }
  };

  // Open risk dialog with suggestion
  const handleSelectSuggestion = (suggestion) => {
    const hazard = hazards.find(h => h.label === suggestion.hazard_label);
    if (hazard) {
      setRiskForm({
        ...riskForm,
        hazard_id: hazard.id,
        situation_description: suggestion.justification
      });
      setAiSuggestions(null);
      setRiskDialogOpen(true);
    }
  };

  // Calculate current risk score
  const currentScore = calculateRiskScore(riskForm.frequency, riskForm.probability, riskForm.severity, riskForm.control);
  const currentPriority = getPriorityLevel(currentScore);

  // Stats for step 4
  const totalRisks = riskAssessments.length;
  const priorityRisks = riskAssessments.filter(r => r.priority_level === 'prioritaire').length;
  const totalActions = actionPlans.length;
  const completedActions = actionPlans.filter(a => a.status === 'termine').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assistant DUERP</h1>
          <p className="text-slate-500 mt-1">
            Évaluation des risques professionnels
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <React.Fragment key={step.id}>
                  {index > 0 && (
                    <div className={cn(
                      "flex-1 h-1 mx-2 rounded-full",
                      isCompleted ? "bg-blue-500" : "bg-slate-200"
                    )} />
                  )}
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 transition-colors",
                      isActive && "text-blue-600",
                      isCompleted && "text-blue-500",
                      !isActive && !isCompleted && "text-slate-400"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      isActive && "bg-blue-600 text-white",
                      isCompleted && "bg-blue-500 text-white",
                      !isActive && !isCompleted && "bg-slate-100"
                    )}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-medium hidden md:block">{step.title}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Disclaimer />

      {/* Step Content */}
      {/* Step 1: Work Units */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Unités de travail</h2>
            {canEdit && (
              <Button 
                onClick={() => {
                  setEditingWorkUnit(null);
                  setWorkUnitForm({});
                  setWorkUnitDialogOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter une UT
              </Button>
            )}
          </div>

          {loadingWU ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : workUnits.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  icon={Building2}
                  title="Aucune unité de travail"
                  description="Créez vos unités de travail pour commencer l'évaluation"
                  actionLabel="Ajouter une UT"
                  action={() => {
                    setEditingWorkUnit(null);
                    setWorkUnitForm({});
                    setWorkUnitDialogOpen(true);
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workUnits.map((wu) => {
                const wuRisks = riskAssessments.filter(r => r.work_unit_id === wu.id);
                const wuPriority = wuRisks.filter(r => r.priority_level === 'prioritaire').length;
                
                return (
                  <Card 
                    key={wu.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-lg",
                      selectedWorkUnit?.id === wu.id && "ring-2 ring-blue-500"
                    )}
                    onClick={() => setSelectedWorkUnit(wu)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{wu.name}</h3>
                          {wu.workforce && (
                            <p className="text-sm text-slate-500">{wu.workforce} personnes</p>
                          )}
                        </div>
                        {canEdit && (
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingWorkUnit(wu);
                                setWorkUnitForm(wu);
                                setWorkUnitDialogOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {wu.description && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{wu.description}</p>
                      )}
                      
                      <div className="flex items-center gap-3 text-sm">
                        <Badge variant="outline">
                          {wuRisks.length} risque{wuRisks.length !== 1 ? 's' : ''}
                        </Badge>
                        {wuPriority > 0 && (
                          <Badge variant="destructive">
                            {wuPriority} prioritaire{wuPriority !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={() => setCurrentStep(2)}
              disabled={workUnits.length === 0}
              className="gap-2"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Risk Assessment */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Work Units List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Unités de travail</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {workUnits.map((wu) => {
                  const wuRisks = riskAssessments.filter(r => r.work_unit_id === wu.id);
                  const isSelected = selectedWorkUnit?.id === wu.id;
                  
                  return (
                    <button
                      key={wu.id}
                      onClick={() => setSelectedWorkUnit(wu)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-colors",
                        isSelected 
                          ? "bg-blue-50 border border-blue-200" 
                          : "hover:bg-slate-50 border border-transparent"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{wu.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {wuRisks.length}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment Area */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedWorkUnit ? (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    icon={Building2}
                    title="Sélectionnez une unité de travail"
                    description="Choisissez une UT dans la liste pour évaluer ses risques"
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                {/* UT Header */}
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedWorkUnit.name}</h3>
                        <p className="text-sm text-slate-500">{selectedWorkUnit.description}</p>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={suggestHazards}
                            disabled={aiLoading}
                            className="gap-2"
                          >
                            {aiLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                            Suggérer des dangers (IA)
                          </Button>
                          <Button 
                            onClick={() => {
                              setEditingRisk(null);
                              setRiskForm({ frequency: 2, probability: 2, severity: 2, control: 2 });
                              setRiskDialogOpen(true);
                            }}
                            className="gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Ajouter un risque
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Suggestions */}
                {aiSuggestions && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Suggestions IA
                      </CardTitle>
                      <CardDescription>
                        {aiSuggestions.disclaimer}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {aiSuggestions.suggestions?.map((suggestion, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{suggestion.hazard_label}</span>
                                <CategoryBadge category={suggestion.category} size="sm" />
                              </div>
                              <p className="text-sm text-slate-500 mt-1">{suggestion.justification}</p>
                            </div>
                            {canEdit && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSelectSuggestion(suggestion)}
                              >
                                Évaluer
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setAiSuggestions(null)}
                        className="mt-2"
                      >
                        Fermer
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Risks List */}
                {selectedWURisks.length === 0 ? (
                  <Card>
                    <CardContent className="py-8">
                      <EmptyState
                        icon={AlertTriangle}
                        title="Aucun risque évalué"
                        description="Utilisez l'IA pour suggérer des dangers ou ajoutez manuellement"
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Accordion type="multiple" className="space-y-2">
                    {selectedWURisks.map((risk) => (
                      <AccordionItem key={risk.id} value={risk.id} className="border rounded-lg bg-white">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center gap-4 flex-1 text-left">
                            <RiskBadge level={risk.priority_level} score={risk.risk_score} showScore />
                            <div className="flex-1">
                              <p className="font-medium">{risk.hazard_label}</p>
                              <p className="text-sm text-slate-500 line-clamp-1">{risk.situation_description}</p>
                            </div>
                            <CategoryBadge category={risk.hazard_category} size="sm" />
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500">Fréquence</p>
                                <p className="font-medium">{frequencyLabels[risk.frequency - 1]} ({risk.frequency})</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Probabilité</p>
                                <p className="font-medium">{probabilityLabels[risk.probability - 1]} ({risk.probability})</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Gravité</p>
                                <p className="font-medium">{severityLabels[risk.severity - 1]} ({risk.severity})</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Maîtrise</p>
                                <p className="font-medium">{controlLabels[risk.control - 1]} ({risk.control})</p>
                              </div>
                            </div>
                            
                            {risk.existing_measures && (
                              <div>
                                <p className="text-sm text-slate-500">Mesures existantes</p>
                                <p className="text-sm">{risk.existing_measures}</p>
                              </div>
                            )}

                            {canEdit && (
                              <div className="flex gap-2 pt-2 border-t">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateActions(risk)}
                                  disabled={aiLoading}
                                  className="gap-2"
                                >
                                  {aiLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-4 h-4" />
                                  )}
                                  Générer actions (IA)
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingRisk(risk);
                                    setRiskForm(risk);
                                    setRiskDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Modifier
                                </Button>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Retour
              </Button>
              <Button onClick={() => setCurrentStep(3)} className="gap-2">
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Action Plans */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Plan d'actions</h2>
            <Link to={createPageUrl('ActionPlans')}>
              <Button variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                Voir toutes les actions
              </Button>
            </Link>
          </div>

          {actionPlans.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  icon={ClipboardList}
                  title="Aucune action définie"
                  description="Utilisez l'IA pour générer des actions à partir des risques évalués"
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {actionPlans.slice(0, 10).map((action) => (
                    <div key={action.id} className="p-4 flex items-center gap-4">
                      <StatusBadge status={action.status} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{action.action_label}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Badge variant="outline" className="capitalize text-xs">
                            {action.action_type}
                          </Badge>
                          <span>•</span>
                          <span>{action.owner_name || 'Non assigné'}</span>
                        </div>
                      </div>
                      <Badge variant={action.priority === 'critique' ? 'destructive' : 'outline'}>
                        {action.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(2)} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Retour
            </Button>
            <Button onClick={() => setCurrentStep(4)} className="gap-2">
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Generate */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Résumé de l'évaluation</CardTitle>
              <CardDescription>
                Vérifiez les données avant de générer le DUERP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{workUnits.length}</p>
                  <p className="text-sm text-slate-500">Unités de travail</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold text-slate-900">{totalRisks}</p>
                  <p className="text-sm text-slate-500">Risques évalués</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-3xl font-bold text-red-600">{priorityRisks}</p>
                  <p className="text-sm text-slate-500">Risques prioritaires</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-600">{totalActions}</p>
                  <p className="text-sm text-slate-500">Actions définies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Générer le DUERP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                Le Document Unique sera généré au format PDF et archivé dans l'historique.
                Une nouvelle version sera créée pour l'année en cours.
              </p>
              
              <Disclaimer variant="pdf" />

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleGeneratePdf}
                  disabled={generatingPdf || totalRisks === 0}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {generatingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  Générer le PDF
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Exporter CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(3)} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Retour
            </Button>
            <Link to={createPageUrl('DuerpHistory')}>
              <Button variant="outline" className="gap-2">
                Voir l'historique
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Work Unit Dialog */}
      <Dialog open={workUnitDialogOpen} onOpenChange={setWorkUnitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingWorkUnit ? 'Modifier l\'unité de travail' : 'Nouvelle unité de travail'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de l'UT *</Label>
              <Input
                value={workUnitForm.name || ''}
                onChange={(e) => setWorkUnitForm({ ...workUnitForm, name: e.target.value })}
                placeholder="Ex: Atelier mécanique, Bureau comptabilité..."
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={workUnitForm.description || ''}
                onChange={(e) => setWorkUnitForm({ ...workUnitForm, description: e.target.value })}
                placeholder="Décrivez les activités de cette unité..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Effectif</Label>
                <Input
                  type="number"
                  value={workUnitForm.workforce || ''}
                  onChange={(e) => setWorkUnitForm({ ...workUnitForm, workforce: parseInt(e.target.value) })}
                  placeholder="Nombre de personnes"
                />
              </div>
              <div className="space-y-2">
                <Label>Responsable</Label>
                <Input
                  value={workUnitForm.manager_name || ''}
                  onChange={(e) => setWorkUnitForm({ ...workUnitForm, manager_name: e.target.value })}
                  placeholder="Nom du responsable"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWorkUnitDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSaveWorkUnit}
              disabled={!workUnitForm.name || createWorkUnitMutation.isPending || updateWorkUnitMutation.isPending}
            >
              {editingWorkUnit ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Risk Assessment Dialog */}
      <Dialog open={riskDialogOpen} onOpenChange={setRiskDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRisk ? 'Modifier l\'évaluation' : 'Nouvelle évaluation de risque'}</DialogTitle>
            <DialogDescription>
              Évaluez le risque selon les critères F×P×G×M
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Hazard selection */}
            <div className="space-y-2">
              <Label>Danger *</Label>
              <Select
                value={riskForm.hazard_id}
                onValueChange={(v) => setRiskForm({ ...riskForm, hazard_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un danger du référentiel" />
                </SelectTrigger>
                <SelectContent>
                  {hazards.map(h => (
                    <SelectItem key={h.id} value={h.id}>
                      <div className="flex items-center gap-2">
                        <CategoryBadge category={h.category} size="sm" />
                        <span>{h.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Situation */}
            <div className="space-y-2">
              <Label>Description de la situation dangereuse *</Label>
              <Textarea
                value={riskForm.situation_description || ''}
                onChange={(e) => setRiskForm({ ...riskForm, situation_description: e.target.value })}
                placeholder="Décrivez précisément la situation à risque..."
                rows={3}
              />
            </div>

            {/* Exposed persons */}
            <div className="space-y-2">
              <Label>Personnes exposées</Label>
              <Input
                value={riskForm.exposed_persons || ''}
                onChange={(e) => setRiskForm({ ...riskForm, exposed_persons: e.target.value })}
                placeholder="Ex: Opérateurs, Manutentionnaires..."
              />
            </div>

            {/* Existing measures */}
            <div className="space-y-2">
              <Label>Mesures de prévention existantes</Label>
              <Textarea
                value={riskForm.existing_measures || ''}
                onChange={(e) => setRiskForm({ ...riskForm, existing_measures: e.target.value })}
                placeholder="Décrivez les mesures déjà en place..."
                rows={2}
              />
            </div>

            {/* AI Suggestion button */}
            {canEdit && (
              <Button
                variant="outline"
                onClick={suggestCotation}
                disabled={aiLoading || !riskForm.hazard_id || !riskForm.situation_description}
                className="w-full gap-2"
              >
                {aiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Proposer une cotation (IA)
              </Button>
            )}

            {/* Cotation */}
            <div className="space-y-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold">Cotation du risque</h4>
              
              {/* Frequency */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    Fréquence d'exposition
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>À quelle fréquence les salariés sont-ils exposés ?</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Badge>{frequencyLabels[riskForm.frequency - 1]} ({riskForm.frequency})</Badge>
                </div>
                <Slider
                  value={[riskForm.frequency]}
                  onValueChange={([v]) => setRiskForm({ ...riskForm, frequency: v })}
                  min={1}
                  max={4}
                  step={1}
                />
              </div>

              {/* Probability */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    Probabilité d'occurrence
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Quelle est la probabilité que l'accident se produise ?</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Badge>{probabilityLabels[riskForm.probability - 1]} ({riskForm.probability})</Badge>
                </div>
                <Slider
                  value={[riskForm.probability]}
                  onValueChange={([v]) => setRiskForm({ ...riskForm, probability: v })}
                  min={1}
                  max={4}
                  step={1}
                />
              </div>

              {/* Severity */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    Gravité potentielle
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Quelle serait la gravité des dommages ?</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Badge>{severityLabels[riskForm.severity - 1]} ({riskForm.severity})</Badge>
                </div>
                <Slider
                  value={[riskForm.severity]}
                  onValueChange={([v]) => setRiskForm({ ...riskForm, severity: v })}
                  min={1}
                  max={4}
                  step={1}
                />
              </div>

              {/* Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    Niveau de maîtrise
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Les mesures de prévention sont-elles efficaces ?</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Badge>{controlLabels[riskForm.control - 1]} ({riskForm.control})</Badge>
                </div>
                <Slider
                  value={[riskForm.control]}
                  onValueChange={([v]) => setRiskForm({ ...riskForm, control: v })}
                  min={1}
                  max={4}
                  step={1}
                />
              </div>

              {/* Score result */}
              <div className="pt-4 border-t flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Score de risque</p>
                  <p className="text-2xl font-bold">{currentScore}</p>
                </div>
                <RiskBadge level={currentPriority} score={currentScore} showScore size="lg" />
              </div>
            </div>

            {/* AI Justification */}
            {riskForm.ai_suggestions?.justification && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm">
                <p className="font-medium text-blue-700 mb-1">Justification IA:</p>
                <p className="text-blue-600">{riskForm.ai_suggestions.justification}</p>
                {riskForm.ai_suggestions.disclaimer && (
                  <p className="text-blue-500 text-xs mt-2 italic">{riskForm.ai_suggestions.disclaimer}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRiskDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSaveRisk}
              disabled={!riskForm.hazard_id || !riskForm.situation_description || createRiskMutation.isPending || updateRiskMutation.isPending}
            >
              {editingRisk ? 'Modifier' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}