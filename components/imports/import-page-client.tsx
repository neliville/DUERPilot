'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportDuerpForm } from './import-duerp-form';
import { ImportValidation } from './import-validation';
import { ImportList } from './import-list';
import { api } from '@/lib/trpc/client';
import { Loader2 } from 'lucide-react';

export function ImportPageClient() {
  const [selectedImportId, setSelectedImportId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');

  const { data: importData, isLoading } = api.imports.getImportStatus.useQuery(
    { importId: selectedImportId! },
    { enabled: !!selectedImportId }
  );

  const handleImportComplete = (importId: string) => {
    setSelectedImportId(importId);
    setActiveTab('upload'); // Rester sur l'onglet upload pour voir la validation
  };

  const handleValidationComplete = () => {
    setSelectedImportId(null);
    setActiveTab('history');
  };

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'history')}>
      <TabsList>
        <TabsTrigger value="upload">Nouvel import</TabsTrigger>
        <TabsTrigger value="history">Historique</TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="space-y-6">
        <ImportDuerpForm onImportComplete={handleImportComplete} />

        {selectedImportId && (
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : importData && importData.status === 'validated' && importData.extractionData ? (
              <ImportValidation
                importId={selectedImportId}
                extractionData={importData.extractionData}
                onValidationComplete={handleValidationComplete}
              />
            ) : importData?.status === 'analyzing' ? (
              <div className="border rounded-lg p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="font-medium">Extraction en cours...</p>
                <p className="text-sm text-gray-500 mt-2">
                  L'analyse de votre document peut prendre quelques minutes
                </p>
              </div>
            ) : importData?.status === 'failed' ? (
              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <p className="font-medium text-red-900">Erreur lors de l'extraction</p>
                <p className="text-sm text-red-700 mt-2">{importData.errorMessage}</p>
              </div>
            ) : null}
          </div>
        )}
      </TabsContent>

      <TabsContent value="history">
        <ImportList />
      </TabsContent>
    </Tabs>
  );
}

