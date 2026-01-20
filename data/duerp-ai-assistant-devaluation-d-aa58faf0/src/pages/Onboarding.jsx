import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { 
  Shield, 
  Building2, 
  MapPin, 
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, title: 'Entreprise', icon: Building2 },
  { id: 2, title: 'Site principal', icon: MapPin },
  { id: 3, title: 'Confirmation', icon: Check }
];

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

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [tenantId, setTenantId] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [companyData, setCompanyData] = useState({
    legal_name: '',
    siret: '',
    activity: '',
    sector: '',
    workforce_total: '',
    has_cse: false,
    address: '',
    contact_email: '',
    contact_phone: ''
  });
  const [siteData, setSiteData] = useState({
    name: 'Site principal',
    address: '',
    city: '',
    postal_code: '',
    workforce: '',
    is_main_site: true
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        setCompanyData(prev => ({ ...prev, contact_email: u.email }));
        
        // Check if user already has a tenant_id (onboarding completed)
        const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
        if (profiles.length > 0 && profiles[0].tenant_id) {
          // User already has a profile with tenant, redirect to dashboard
          window.location.href = createPageUrl('Dashboard');
          return;
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadUser();
  }, []);

  // Complete onboarding via backend function
  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('completeOnboarding', {
        tenantData: {
          name: companyData.legal_name
        },
        companyData: {
          ...companyData,
          workforce_total: parseInt(companyData.workforce_total) || 0
        },
        siteData: {
          ...siteData,
          workforce: parseInt(siteData.workforce) || 0
        }
      });
      return response.data;
    }
  });

  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Validate company data
      if (!companyData.legal_name || !companyData.activity || !companyData.workforce_total) {
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate site data
      if (!siteData.name) {
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleFinish = async () => {
    try {
      console.log('Starting onboarding process...');
      
      // Call backend function to create all entities with service role
      const result = await completeOnboardingMutation.mutateAsync();
      console.log('Onboarding completed:', result);
      
      // Wait a bit for session to refresh, then redirect
      setTimeout(() => {
        window.location.href = createPageUrl('Dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error during onboarding:', error);
      alert('Erreur lors de la création de votre espace : ' + (error.response?.data?.error || error.message));
    }
  };

  const isLoading = completeOnboardingMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">DUERP AI</h1>
              <p className="text-slate-400 text-sm">Évaluation des risques</p>
            </div>
          </div>
          <p className="text-slate-300">Configuration de votre espace</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <React.Fragment key={step.id}>
                {index > 0 && (
                  <div className={cn(
                    "w-12 h-0.5",
                    isCompleted ? "bg-blue-500" : "bg-slate-600"
                  )} />
                )}
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                  isActive && "bg-blue-600 text-white",
                  isCompleted && "bg-blue-600/20 text-blue-400",
                  !isActive && !isCompleted && "bg-slate-700 text-slate-400"
                )}>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium hidden md:inline">{step.title}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Content */}
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            {/* Step 1: Company */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Informations entreprise</h2>
                  <p className="text-slate-500 mt-1">Renseignez les informations de votre entreprise</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Raison sociale *</Label>
                    <Input
                      value={companyData.legal_name}
                      onChange={(e) => setCompanyData({ ...companyData, legal_name: e.target.value })}
                      placeholder="Nom de l'entreprise"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SIRET</Label>
                    <Input
                      value={companyData.siret}
                      onChange={(e) => setCompanyData({ ...companyData, siret: e.target.value })}
                      placeholder="14 chiffres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Effectif total *</Label>
                    <Input
                      type="number"
                      value={companyData.workforce_total}
                      onChange={(e) => setCompanyData({ ...companyData, workforce_total: e.target.value })}
                      placeholder="Nombre de salariés"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Activité principale *</Label>
                    <Input
                      value={companyData.activity}
                      onChange={(e) => setCompanyData({ ...companyData, activity: e.target.value })}
                      placeholder="Décrivez l'activité"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secteur</Label>
                    <Select
                      value={companyData.sector}
                      onValueChange={(v) => setCompanyData({ ...companyData, sector: v })}
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
                    <Label>Téléphone</Label>
                    <Input
                      value={companyData.contact_phone}
                      onChange={(e) => setCompanyData({ ...companyData, contact_phone: e.target.value })}
                      placeholder="01 23 45 67 89"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={companyData.has_cse}
                    onCheckedChange={(c) => setCompanyData({ ...companyData, has_cse: c })}
                  />
                  <Label>L'entreprise dispose d'un CSE (Comité Social et Économique)</Label>
                </div>
              </div>
            )}

            {/* Step 2: Site */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Site principal</h2>
                  <p className="text-slate-500 mt-1">Configurez votre site principal</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Nom du site *</Label>
                    <Input
                      value={siteData.name}
                      onChange={(e) => setSiteData({ ...siteData, name: e.target.value })}
                      placeholder="Ex: Siège social, Usine..."
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Adresse</Label>
                    <Textarea
                      value={siteData.address}
                      onChange={(e) => setSiteData({ ...siteData, address: e.target.value })}
                      placeholder="Adresse complète"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ville</Label>
                    <Input
                      value={siteData.city}
                      onChange={(e) => setSiteData({ ...siteData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Code postal</Label>
                    <Input
                      value={siteData.postal_code}
                      onChange={(e) => setSiteData({ ...siteData, postal_code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Effectif du site</Label>
                    <Input
                      type="number"
                      value={siteData.workforce}
                      onChange={(e) => setSiteData({ ...siteData, workforce: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Récapitulatif</h2>
                  <p className="text-slate-500 mt-1">Vérifiez vos informations avant de continuer</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Entreprise
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-slate-500">Nom:</span> {companyData.legal_name}</p>
                      <p><span className="text-slate-500">Activité:</span> {companyData.activity}</p>
                      <p><span className="text-slate-500">Effectif:</span> {companyData.workforce_total} salariés</p>
                      <p><span className="text-slate-500">Secteur:</span> {sectors.find(s => s.value === companyData.sector)?.label || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Site principal
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-slate-500">Nom:</span> {siteData.name}</p>
                      <p><span className="text-slate-500">Ville:</span> {siteData.city || '-'}</p>
                      <p><span className="text-slate-500">Effectif:</span> {siteData.workforce || '-'}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 text-center">
                  En validant, vous créez votre espace DUERP AI et acceptez les conditions d'utilisation.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              ) : (
                <div />
              )}
              
              {currentStep < 3 ? (
                <Button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700">
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleFinish} 
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Créer mon espace
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}