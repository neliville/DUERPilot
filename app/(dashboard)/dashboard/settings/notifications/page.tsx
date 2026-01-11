'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Bell, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NotificationsSettingsPage() {
  const { toast } = useToast();
  const { data: preferences, isLoading } = api.emailPreferences.get.useQuery();
  const updateMutation = api.emailPreferences.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Préférences mises à jour avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [formData, setFormData] = useState({
    marketingEmails: preferences?.marketingEmails ?? true,
    productUpdates: preferences?.productUpdates ?? true,
    monthlyDigest: preferences?.monthlyDigest ?? true,
    aiInsights: preferences?.aiInsights ?? true,
    unsubscribedAll: preferences?.unsubscribedAll ?? false,
  });

  // Mettre à jour le formulaire quand les préférences sont chargées
  useState(() => {
    if (preferences) {
      setFormData({
        marketingEmails: preferences.marketingEmails,
        productUpdates: preferences.productUpdates,
        monthlyDigest: preferences.monthlyDigest,
        aiInsights: preferences.aiInsights,
        unsubscribedAll: preferences.unsubscribedAll,
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleCheckboxChange = (field: keyof typeof formData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Préférences de notifications</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les emails que vous recevez de DUERPilot
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Les emails transactionnels (activation de compte, réinitialisation de mot de passe,
          notifications de conformité) sont toujours envoyés pour des raisons légales et de sécurité.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Préférences email
            </CardTitle>
            <CardDescription>
              Choisissez les types d'emails que vous souhaitez recevoir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="marketingEmails"
                  checked={formData.marketingEmails && !formData.unsubscribedAll}
                  disabled={formData.unsubscribedAll}
                  onCheckedChange={() => handleCheckboxChange('marketingEmails')}
                />
                <div className="space-y-1">
                  <Label htmlFor="marketingEmails" className="cursor-pointer">
                    Emails marketing et offres promotionnelles
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des informations sur nos offres, promotions et événements
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="productUpdates"
                  checked={formData.productUpdates && !formData.unsubscribedAll}
                  disabled={formData.unsubscribedAll}
                  onCheckedChange={() => handleCheckboxChange('productUpdates')}
                />
                <div className="space-y-1">
                  <Label htmlFor="productUpdates" className="cursor-pointer">
                    Mises à jour produit et nouvelles fonctionnalités
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Soyez informé des nouvelles fonctionnalités et améliorations
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="monthlyDigest"
                  checked={formData.monthlyDigest && !formData.unsubscribedAll}
                  disabled={formData.unsubscribedAll}
                  onCheckedChange={() => handleCheckboxChange('monthlyDigest')}
                />
                <div className="space-y-1">
                  <Label htmlFor="monthlyDigest" className="cursor-pointer">
                    Synthèse mensuelle QSE
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez un récapitulatif mensuel de vos activités QSE
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="aiInsights"
                  checked={formData.aiInsights && !formData.unsubscribedAll}
                  disabled={formData.unsubscribedAll}
                  onCheckedChange={() => handleCheckboxChange('aiInsights')}
                />
                <div className="space-y-1">
                  <Label htmlFor="aiInsights" className="cursor-pointer">
                    Insights IA avancés (Pro/Expert uniquement)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des analyses et suggestions avancées générées par l'IA
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="unsubscribedAll"
                  checked={formData.unsubscribedAll}
                  onCheckedChange={() => handleCheckboxChange('unsubscribedAll')}
                />
                <div className="space-y-1">
                  <Label htmlFor="unsubscribedAll" className="cursor-pointer font-semibold">
                    Me désabonner de tous les emails (sauf transactionnels légaux)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Si coché, vous ne recevrez plus aucun email marketing ou produit.
                    Les emails transactionnels (activation, sécurité, conformité) continueront
                    d'être envoyés pour des raisons légales.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer les préférences'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

