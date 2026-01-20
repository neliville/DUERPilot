'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Briefcase, 
  Shield, 
  Grid3x3 
} from 'lucide-react';

export default function ReferentielsPage() {
  const [activeTab, setActiveTab] = useState('dangers');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Référentiels
        </h1>
        <p className="mt-2 text-gray-600">
          Gérez les référentiels de votre organisation : dangers, activités, mesures de prévention et grilles de cotation.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dangers" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Dangers & risques</span>
            <span className="sm:hidden">Dangers</span>
          </TabsTrigger>
          <TabsTrigger value="activites" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Activités & métiers</span>
            <span className="sm:hidden">Activités</span>
          </TabsTrigger>
          <TabsTrigger value="mesures" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Mesures de prévention</span>
            <span className="sm:hidden">Mesures</span>
          </TabsTrigger>
          <TabsTrigger value="cotation" className="flex items-center gap-2">
            <Grid3x3 className="h-4 w-4" />
            <span className="hidden sm:inline">Grilles de cotation</span>
            <span className="sm:hidden">Cotation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dangers" className="mt-6 space-y-4">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-xl font-semibold mb-4">Dangers & risques</h2>
            <p className="text-gray-600 mb-4">
              Consultez et gérez les situations dangereuses et les risques associés.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/dashboard/referentiel"
                className="block p-4 border rounded-lg hover:shadow-md transition hover:border-blue-500"
              >
                <h3 className="font-semibold mb-2">Situations dangereuses</h3>
                <p className="text-sm text-gray-600">
                  Liste complète des situations dangereuses par catégorie
                </p>
              </a>
              <a
                href="/dashboard/referentiels/risques"
                className="block p-4 border rounded-lg hover:shadow-md transition hover:border-blue-500"
              >
                <h3 className="font-semibold mb-2">Bibliothèque de risques</h3>
                <p className="text-sm text-gray-600">
                  Risques référencés par secteur d'activité
                </p>
              </a>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activites" className="mt-6 space-y-4">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-xl font-semibold mb-4">Activités & métiers</h2>
            <p className="text-gray-600 mb-4">
              Gérez les activités professionnelles et les métiers de votre organisation.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>À venir :</strong> Cette section permettra de définir les activités et métiers spécifiques à votre organisation, 
                avec les risques associés à chaque poste.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mesures" className="mt-6 space-y-4">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-xl font-semibold mb-4">Mesures de prévention</h2>
            <p className="text-gray-600 mb-4">
              Consultez et gérez les mesures de prévention recommandées.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>À venir :</strong> Cette section permettra de gérer un catalogue de mesures de prévention 
                (équipements de protection, formations, procédures, etc.) réutilisables dans vos évaluations.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cotation" className="mt-6 space-y-4">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-xl font-semibold mb-4">Grilles de cotation</h2>
            <p className="text-gray-600 mb-4">
              Définissez et personnalisez les grilles de cotation des risques.
            </p>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Méthode INRS</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Grille de cotation basée sur la fréquence d'exposition et la gravité potentielle (méthode officielle française).
                </p>
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <div className="font-semibold mb-1">Formule : Fréquence × Gravité</div>
                  <div className="text-gray-600">
                    Fréquence : 1 (rare) à 4 (permanent) • Gravité : 1 (mineure) à 4 (très grave)
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Méthode générique</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Grille de cotation simplifiée avec probabilité et gravité.
                </p>
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <div className="font-semibold mb-1">Formule : Probabilité × Gravité</div>
                  <div className="text-gray-600">
                    Probabilité : 1 (improbable) à 5 (certain) • Gravité : 1 (négligeable) à 5 (catastrophique)
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>À venir :</strong> Possibilité de créer vos propres grilles de cotation personnalisées 
                  adaptées aux spécificités de votre organisation.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
