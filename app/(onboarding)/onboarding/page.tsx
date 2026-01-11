'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';
import { Building2, MapPin, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
// Secteurs d'activité (seront récupérés depuis ActivitySector via API)
const SECTORS: string[] = [
  'Commerce',
  'Industrie',
  'Santé et aide à la personne',
  'Restauration et hôtellerie',
  'Transports',
  'Bâtiment et travaux publics',
  'Services',
];

interface CompanyData {
  legalName: string;
  siret: string;
  employeeCount: number | '';
  activity: string;
  sector: string;
  phone: string;
  hasCSE: boolean;
}

interface SiteData {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  employeeCount: number | '';
}

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [companyData, setCompanyData] = useState<CompanyData>({
    legalName: '',
    siret: '',
    employeeCount: '',
    activity: '',
    sector: '',
    phone: '',
    hasCSE: false,
  });

  const [siteData, setSiteData] = useState<SiteData>({
    name: 'Site principal',
    address: '',
    city: '',
    postalCode: '',
    employeeCount: '',
  });

  const createMutation = api.companies.createWithMainSite.useMutation({
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Votre espace a été créé avec succès',
      });
      router.push('/dashboard');
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
      setIsLoading(false);
    },
  });

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyData.legalName || !companyData.employeeCount) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep(2);
  };

  const handleSiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteData.name) {
      toast({
        title: 'Erreur',
        description: 'Le nom du site est requis',
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep(3);
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      await createMutation.mutateAsync({
        legalName: companyData.legalName,
        siret: companyData.siret || undefined,
        employeeCount: typeof companyData.employeeCount === 'number' ? companyData.employeeCount : undefined,
        activity: companyData.activity || undefined,
        sector: companyData.sector || undefined,
        phone: companyData.phone || undefined,
        hasCSE: companyData.hasCSE,
        siteName: siteData.name,
        siteAddress: siteData.address || undefined,
        siteCity: siteData.city || undefined,
        sitePostalCode: siteData.postalCode || undefined,
        siteEmployeeCount: typeof siteData.employeeCount === 'number' ? siteData.employeeCount : undefined,
      });
    } catch (error) {
      // L'erreur est gérée dans onError
    }
  };

  const steps = [
    { id: 1, label: 'Entreprise', icon: Building2 },
    { id: 2, label: 'Site principal', icon: MapPin },
    { id: 3, label: 'Confirmation', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 rounded-full p-3">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DUERP AI</h1>
          <p className="text-blue-200">Évaluation des risques</p>
          <p className="text-white text-lg mt-2">Configuration de votre espace</p>
        </div>

        {/* Steps indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentStep === 1 && 'Informations entreprise'}
              {currentStep === 2 && 'Site principal'}
              {currentStep === 3 && 'Récapitulatif'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Renseignez les informations de votre entreprise'}
              {currentStep === 2 && 'Configurez votre site principal'}
              {currentStep === 3 && 'Vérifiez vos informations avant de continuer'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <form onSubmit={handleCompanySubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="legalName">
                    Raison sociale <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="legalName"
                    placeholder="Nom de l'entreprise"
                    value={companyData.legalName}
                    onChange={(e) => setCompanyData({ ...companyData, legalName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET</Label>
                  <Input
                    id="siret"
                    placeholder="14 chiffres"
                    value={companyData.siret}
                    onChange={(e) => setCompanyData({ ...companyData, siret: e.target.value })}
                    maxLength={14}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeCount">
                    Effectif total <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    placeholder="Nombre de salariés"
                    value={companyData.employeeCount}
                    onChange={(e) =>
                      setCompanyData({
                        ...companyData,
                        employeeCount: e.target.value ? parseInt(e.target.value) : '',
                      })
                    }
                    required
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity">
                    Activité principale <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="activity"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Décrivez l'activité"
                    value={companyData.activity}
                    onChange={(e) => setCompanyData({ ...companyData, activity: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sector">Secteur</Label>
                  <select
                    id="sector"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={companyData.sector}
                    onChange={(e) => setCompanyData({ ...companyData, sector: e.target.value })}
                  >
                    <option value="">Sélectionner</option>
                    {SECTORS.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    placeholder="01 23 45 67 89"
                    value={companyData.phone}
                    onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasCSE"
                    checked={companyData.hasCSE}
                    onCheckedChange={(checked) => setCompanyData({ ...companyData, hasCSE: checked })}
                  />
                  <Label htmlFor="hasCSE" className="cursor-pointer">
                    L'entreprise dispose d'un CSE (Comité Social et Économique)
                  </Label>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Suivant <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {currentStep === 2 && (
              <form onSubmit={handleSiteSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">
                    Nom du site <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="siteName"
                    placeholder="Site principal"
                    value={siteData.name}
                    onChange={(e) => setSiteData({ ...siteData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteAddress">Adresse</Label>
                  <Input
                    id="siteAddress"
                    placeholder="Rue Roger Salengro"
                    value={siteData.address}
                    onChange={(e) => setSiteData({ ...siteData, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteCity">Ville</Label>
                    <Input
                      id="siteCity"
                      placeholder="Fontenay-sous-Bois"
                      value={siteData.city}
                      onChange={(e) => setSiteData({ ...siteData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sitePostalCode">Code postal</Label>
                    <Input
                      id="sitePostalCode"
                      placeholder="94120"
                      value={siteData.postalCode}
                      onChange={(e) => setSiteData({ ...siteData, postalCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteEmployeeCount">Effectif du site</Label>
                  <Input
                    id="siteEmployeeCount"
                    type="number"
                    placeholder="5"
                    value={siteData.employeeCount}
                    onChange={(e) =>
                      setSiteData({
                        ...siteData,
                        employeeCount: e.target.value ? parseInt(e.target.value) : '',
                      })
                    }
                    min={1}
                  />
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Suivant <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 rounded-full p-4">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Entreprise</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Nom:</span> {companyData.legalName}</p>
                      <p><span className="font-medium">Activité:</span> {companyData.activity || 'Non renseigné'}</p>
                      <p><span className="font-medium">Effectif:</span> {companyData.employeeCount} salariés</p>
                      <p><span className="font-medium">Secteur:</span> {companyData.sector || 'Non renseigné'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Site principal</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Nom:</span> {siteData.name}</p>
                      <p><span className="font-medium">Ville:</span> {siteData.city || 'Non renseigné'}</p>
                      <p><span className="font-medium">Effectif:</span> {siteData.employeeCount || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 text-center">
                  En validant, vous créez votre espace DUERP AI et acceptez les conditions d'utilisation.
                </p>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                  </Button>
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? 'Création...' : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Créer mon espace
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
