'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X, CheckCircle2, AlertCircle, Loader2, FileSpreadsheet } from 'lucide-react';
import { api } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { TRPCErrorHandler } from '@/components/plans/trpc-error-handler';
import { ImportSpreadsheetMapper } from './import-spreadsheet-mapper';

interface ImportDuerpFormProps {
  onImportComplete?: (importId: string) => void;
}

export function ImportDuerpForm({ onImportComplete }: ImportDuerpFormProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showMapper, setShowMapper] = useState(false);
  const [mappedData, setMappedData] = useState<any[] | null>(null);

  const uploadMutation = api.imports.uploadDocument.useMutation({
    onSuccess: (data: any) => {
      setUploading(false);
      setProgress(100);
      toast({
        title: 'Document uploadé avec succès',
        description: 'Extraction en cours...',
      });
      if (onImportComplete) {
        onImportComplete(data.id);
      }
    },
    onError: (error: any) => {
      setUploading(false);
      setProgress(0);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Vérifier la taille (max 50 Mo pour Starter, 200 Mo pour Pro, 1 Go pour Expert)
      const maxSize = 50 * 1024 * 1024; // 50 Mo par défaut
      if (selectedFile.size > maxSize) {
        toast({
          title: 'Fichier trop volumineux',
          description: `Taille maximale : ${Math.round(maxSize / 1024 / 1024)} Mo`,
          variant: 'destructive',
        });
        return;
      }

      // Vérifier le format
      const validFormats = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'csv'];
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!extension || !validFormats.includes(extension)) {
        toast({
          title: 'Format non supporté',
          description: `Formats acceptés : ${validFormats.join(', ')}`,
          variant: 'destructive',
        });
        return;
      }

      setFile(selectedFile);
      setMappedData(null);
      setShowMapper(false);
      
      // Pour Excel/CSV, proposer le mapping
      if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
        setShowMapper(true);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleMappingComplete = useCallback((data: any[]) => {
    setMappedData(data);
    setShowMapper(false);
    toast({
      title: 'Mapping terminé',
      description: 'Vous pouvez maintenant importer les données mappées',
    });
  }, [toast]);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      // Convertir le fichier en base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        // Déterminer le format
        const extension = file.name.split('.').pop()?.toLowerCase();
        let format: 'pdf' | 'word' | 'excel' | 'csv' = 'pdf';
        if (extension === 'docx' || extension === 'doc') {
          format = 'word';
        } else if (extension === 'xlsx' || extension === 'xls') {
          format = 'excel';
        } else if (extension === 'csv') {
          format = 'csv';
        }

        setProgress(30);

        // Upload et extraction
        // Si on a des données mappées, les inclure dans la requête
        const result = await uploadMutation.mutateAsync({
          file: base64,
          fileName: file.name,
          format,
          mappedData: mappedData || undefined, // Inclure les données mappées si disponibles
        });

        setProgress(80);
        
        if (onImportComplete && result.id) {
          onImportComplete(result.id);
        }
      };

      reader.onerror = () => {
        setUploading(false);
        toast({
          title: 'Erreur',
          description: 'Erreur lors de la lecture du fichier',
          variant: 'destructive',
        });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setProgress(0);
    setShowMapper(false);
    setMappedData(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' Ko';
    return (bytes / 1024 / 1024).toFixed(2) + ' Mo';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Importer votre DUERP existant</CardTitle>
          <CardDescription>
            Téléchargez votre document DUERP (PDF, Word, Excel ou CSV) pour l'extraire automatiquement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadMutation.error && (
            <TRPCErrorHandler error={uploadMutation.error} />
          )}

          {!file && !uploading && (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors
                ${isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Déposez le fichier ici' : 'Glissez-déposez votre fichier'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                ou cliquez pour parcourir
              </p>
              <p className="text-xs text-gray-400">
                Formats acceptés : PDF, Word (.docx, .doc), Excel (.xlsx, .xls), CSV
              </p>
            </div>
          )}

          {file && !uploading && !showMapper && (
            <div className="space-y-3">
              <div className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    {mappedData && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ {mappedData.length} lignes mappées
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  aria-label="Supprimer le fichier"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Bouton pour mapper si Excel/CSV et pas encore mappé */}
              {(file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) && !mappedData && (
                <Button
                  variant="outline"
                  onClick={() => setShowMapper(true)}
                  className="w-full"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Mapper les colonnes
                </Button>
              )}
            </div>
          )}

          {showMapper && file && (
            <ImportSpreadsheetMapper
              file={file}
              onMappingComplete={handleMappingComplete}
              onCancel={() => setShowMapper(false)}
            />
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <p className="text-sm font-medium">Extraction en cours...</p>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {file && !uploading && (
            <Button
              onClick={handleUpload}
              className="w-full"
              size="lg"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importer et extraire
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

