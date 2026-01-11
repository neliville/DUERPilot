'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ReactSpreadsheetImport } from 'react-spreadsheet-import';

interface ImportSpreadsheetMapperProps {
  file: File;
  onMappingComplete: (mappedData: any[]) => void;
  onCancel: () => void;
}

// Type pour les clés de champs DUERP
type DuerpFieldKey = 
  | 'companyName'
  | 'siret'
  | 'workUnitName'
  | 'hazard'
  | 'dangerousSituation'
  | 'exposedPersons'
  | 'frequency'
  | 'probability'
  | 'severity'
  | 'control'
  | 'existingMeasures'
  | 'exposedCount';

// Types pour React Spreadsheet Import (basés sur la structure de la bibliothèque)
type Field<T extends string> = {
  label: string;
  key: T;
  description?: string;
  alternateMatches?: string[];
  validations?: Array<{
    rule: 'required' | 'unique' | 'regex';
    value?: string;
    errorMessage?: string;
    level?: 'info' | 'warning' | 'error';
  }>;
  fieldType: {
    type: 'input' | 'select' | 'checkbox';
    options?: Array<{ label: string; value: string }>;
  };
  example?: string;
};

type Result<T extends string> = {
  validData: Array<{ [key in T]: string | boolean | undefined }>;
  invalidData: Array<{ [key in T]: string | boolean | undefined }>;
  all: Array<{ [key in T]: string | boolean | undefined } & { __index?: number }>;
};

// Définition des champs pour le mapping DUERP
// Note: Utilisation de types inline car les types de la bibliothèque ne sont pas exportés
const duerpFields: Array<{
  label: string;
  key: DuerpFieldKey;
  fieldType: { type: 'input' };
  example?: string;
  validations?: Array<{
    rule: 'required' | 'regex';
    value?: string;
    errorMessage?: string;
  }>;
}> = [
  {
    label: 'Nom entreprise',
    key: 'companyName',
    fieldType: {
      type: 'input',
    },
    example: 'Restaurant Le Gourmet',
    validations: [
      {
        rule: 'required',
        errorMessage: 'Le nom de l\'entreprise est requis',
      },
    ],
  },
  {
    label: 'SIRET',
    key: 'siret',
    fieldType: {
      type: 'input',
    },
    example: '12345678900012',
    validations: [
      {
        rule: 'regex',
        value: '^[0-9]{14}$',
        errorMessage: 'Le SIRET doit contenir 14 chiffres',
      },
    ],
  },
  {
    label: 'Unité de travail',
    key: 'workUnitName',
    fieldType: {
      type: 'input',
    },
    example: 'Cuisine',
    validations: [
      {
        rule: 'required',
        errorMessage: 'L\'unité de travail est requise',
      },
    ],
  },
  {
    label: 'Danger / Risque',
    key: 'hazard',
    fieldType: {
      type: 'input',
    },
    example: 'Brûlure',
    validations: [
      {
        rule: 'required',
        errorMessage: 'Le danger est requis',
      },
    ],
  },
  {
    label: 'Situation dangereuse',
    key: 'dangerousSituation',
    fieldType: {
      type: 'input',
    },
    example: 'Contact avec surface chaude du four',
  },
  {
    label: 'Personnes exposées',
    key: 'exposedPersons',
    fieldType: {
      type: 'input',
    },
    example: 'Cuisiniers',
  },
  {
    label: 'Fréquence (F)',
    key: 'frequency',
    fieldType: {
      type: 'input',
    },
    example: '4',
    validations: [
      {
        rule: 'regex',
        value: '^[1-5]$',
        errorMessage: 'La fréquence doit être entre 1 et 5',
      },
    ],
  },
  {
    label: 'Probabilité (P)',
    key: 'probability',
    fieldType: {
      type: 'input',
    },
    example: '3',
    validations: [
      {
        rule: 'regex',
        value: '^[1-5]$',
        errorMessage: 'La probabilité doit être entre 1 et 5',
      },
    ],
  },
  {
    label: 'Gravité (G)',
    key: 'severity',
    fieldType: {
      type: 'input',
    },
    example: '3',
    validations: [
      {
        rule: 'regex',
        value: '^[1-5]$',
        errorMessage: 'La gravité doit être entre 1 et 5',
      },
    ],
  },
  {
    label: 'Maîtrise (M)',
    key: 'control',
    fieldType: {
      type: 'input',
    },
    example: '2',
    validations: [
      {
        rule: 'regex',
        value: '^[1-5]$',
        errorMessage: 'La maîtrise doit être entre 1 et 5',
      },
    ],
  },
  {
    label: 'Mesures existantes',
    key: 'existingMeasures',
    fieldType: {
      type: 'input',
    },
    example: 'Gants anti-chaleur, formation incendie',
  },
  {
    label: 'Effectif unité',
    key: 'exposedCount',
    fieldType: {
      type: 'input',
    },
    example: '8',
    validations: [
      {
        rule: 'regex',
        value: '^[0-9]+$',
        errorMessage: 'L\'effectif doit être un nombre',
      },
    ],
  },
];

export function ImportSpreadsheetMapper({ file, onMappingComplete, onCancel }: ImportSpreadsheetMapperProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(true);
  const [mappingComplete, setMappingComplete] = useState(false);

  const handleComplete = useCallback(async (data: any, file: File) => {
    try {
      // Transformer les données mappées en structure DUERP
      const mappedData = data.validData.map((row: any) => ({
        company: {
          legalName: row.companyName as string | undefined,
          siret: row.siret as string | undefined,
        },
        workUnit: {
          name: row.workUnitName as string,
          exposedCount: row.exposedCount ? parseInt(String(row.exposedCount), 10) : null,
        },
        risk: {
          hazard: row.hazard as string,
          dangerousSituation: (row.dangerousSituation as string | undefined) || null,
          exposedPersons: (row.exposedPersons as string | undefined) || null,
          frequency: row.frequency ? parseInt(String(row.frequency), 10) : null,
          probability: row.probability ? parseInt(String(row.probability), 10) : null,
          severity: row.severity ? parseInt(String(row.severity), 10) : null,
          control: row.control ? parseInt(String(row.control), 10) : null,
          existingMeasures: (row.existingMeasures as string | undefined) || null,
        },
      }));

      setMappingComplete(true);
      onMappingComplete(mappedData);
      
      toast({
        title: 'Mapping terminé',
        description: `${mappedData.length} lignes mappées avec succès${data.invalidData.length > 0 ? `, ${data.invalidData.length} lignes invalides ignorées` : ''}`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors du mapping',
        variant: 'destructive',
      });
    }
  }, [onMappingComplete, toast]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onCancel();
  }, [onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Mapping des colonnes - {file.name}
          </CardTitle>
          <CardDescription>
            Mappez les colonnes de votre fichier Excel/CSV vers la structure DUERP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReactSpreadsheetImport<DuerpFieldKey>
            isOpen={isOpen}
            onClose={handleClose}
            fields={duerpFields}
            onSubmit={handleComplete}
            customTheme={{
              colors: {
                background: 'white',
                textColor: '#1f2937',
                subtitleColor: '#6b7280',
                inactiveColor: '#9ca3af',
                border: '#e5e7eb',
                secondaryBackground: '#f3f4f6',
                highlight: '#e5e7eb',
                rsi: {
                  50: '#eff6ff',
                  100: '#dbeafe',
                  200: '#bfdbfe',
                  300: '#93c5fd',
                  400: '#60a5fa',
                  500: '#3b82f6', // blue-500
                  600: '#2563eb',
                  700: '#1d4ed8',
                  800: '#1e40af',
                  900: '#1e3a8a',
                },
              },
            }}
            autoMapHeaders={true}
            autoMapDistance={2}
          />
        </CardContent>
      </Card>
    </div>
  );
}

