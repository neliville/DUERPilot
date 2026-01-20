'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FileText, Save, History, RotateCcw, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type DocumentType = 'cgu' | 'mentions-legales' | 'politique-confidentialite';

const documentLabels: Record<DocumentType, string> = {
  'cgu': 'Conditions Générales d\'Utilisation',
  'mentions-legales': 'Mentions Légales',
  'politique-confidentialite': 'Politique de Confidentialité',
};

export default function AdminLegalDocumentsPage() {
  const [activeTab, setActiveTab] = useState<DocumentType>('cgu');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [changeNote, setChangeNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<number | null>(null);
  const { toast } = useToast();

  const utils = api.useUtils();

  // Récupérer le document actuel
  const { data: currentDocument, isLoading } = api.admin.legalDocuments.getByType.useQuery(activeTab);

  // Mettre à jour les champs quand le document change
  useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.title);
      setContent(currentDocument.content);
    } else {
      setTitle(documentLabels[activeTab]);
      setContent('');
    }
  }, [currentDocument, activeTab]);

  // Récupérer l'historique des versions
  const { data: versions } = api.admin.legalDocuments.getVersions.useQuery(activeTab, {
    enabled: showHistory,
  });

  // Mutation pour sauvegarder
  const saveMutation = api.admin.legalDocuments.upsert.useMutation({
    onSuccess: () => {
      toast({
        title: 'Document sauvegardé',
        description: 'Le document a été enregistré avec succès.',
      });
      utils.admin.legalDocuments.getByType.invalidate(activeTab);
      utils.admin.legalDocuments.getVersions.invalidate(activeTab);
      setIsSaving(false);
      setChangeNote('');
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la sauvegarde.',
        variant: 'destructive',
      });
      setIsSaving(false);
    },
  });

  // Mutation pour restaurer une version
  const restoreMutation = api.admin.legalDocuments.restoreVersion.useMutation({
    onSuccess: () => {
      toast({
        title: 'Version restaurée',
        description: 'La version a été restaurée avec succès.',
      });
      utils.admin.legalDocuments.getByType.invalidate(activeTab);
      utils.admin.legalDocuments.getVersions.invalidate(activeTab);
      setShowRestoreDialog(false);
      setVersionToRestore(null);
      setChangeNote('');
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la restauration.',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Champs requis',
        description: 'Le titre et le contenu sont obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    saveMutation.mutate({
      type: activeTab,
      title: title.trim(),
      content: content.trim(),
      changeNote: changeNote.trim() || undefined,
    });
  };

  const handleRestore = () => {
    if (!versionToRestore) return;

    restoreMutation.mutate({
      type: activeTab,
      version: versionToRestore,
      changeNote: changeNote.trim() || undefined,
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as DocumentType);
    setChangeNote('');
    setShowHistory(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Documents Légaux</h1>
        <p className="mt-2 text-gray-600">
          Gestion des CGU, Mentions légales et Politique de confidentialité
        </p>
      </div>

      {/* Tabs pour les différents documents */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cgu">CGU</TabsTrigger>
          <TabsTrigger value="mentions-legales">Mentions Légales</TabsTrigger>
          <TabsTrigger value="politique-confidentialite">Politique de Confidentialité</TabsTrigger>
        </TabsList>

        {(['cgu', 'mentions-legales', 'politique-confidentialite'] as DocumentType[]).map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{documentLabels[type]}</CardTitle>
                    <CardDescription>
                      {currentDocument ? (
                        <>
                          Version {currentDocument.currentVersion} • Dernière mise à jour le{' '}
                          {format(new Date(currentDocument.updatedAt), 'PPp', { locale: fr })}
                          {currentDocument.updatedByUser && (
                            <> par {currentDocument.updatedByUser.firstName || currentDocument.updatedByUser.email}</>
                          )}
                        </>
                      ) : (
                        'Document non créé'
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      <History className="h-4 w-4 mr-2" />
                      Historique
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-96 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Titre du document"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="content">Contenu (Markdown)</Label>
                        <Badge variant="outline">Markdown</Badge>
                      </div>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Rédigez votre contenu en Markdown..."
                        className="min-h-[400px] font-mono text-sm"
                      />
                      <p className="text-sm text-muted-foreground">
                        Utilisez la syntaxe Markdown pour formater votre texte. Les modifications seront versionnées automatiquement.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="changeNote">
                        Note de changement (optionnelle)
                      </Label>
                      <Input
                        id="changeNote"
                        value={changeNote}
                        onChange={(e) => setChangeNote(e.target.value)}
                        placeholder="Ex: Correction de la section 3.2"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Historique des versions */}
            {showHistory && (
              <Card>
                <CardHeader>
                  <CardTitle>Historique des versions</CardTitle>
                  <CardDescription>
                    Consultez et restaurez les versions précédentes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {versions && versions.length > 0 ? (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {versions.map((version) => (
                          <div
                            key={version.id}
                            className="flex items-start justify-between p-4 border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge>Version {version.version}</Badge>
                                {version.version === currentDocument?.currentVersion && (
                                  <Badge variant="default">Actuelle</Badge>
                                )}
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(version.createdAt), 'PPp', { locale: fr })}
                                </span>
                              </div>
                              <p className="font-semibold mb-1">{version.title}</p>
                              {version.changeNote && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {version.changeNote}
                                </p>
                              )}
                              {version.updatedByUser && (
                                <p className="text-xs text-muted-foreground">
                                  Par {version.updatedByUser.firstName || version.updatedByUser.email}
                                </p>
                              )}
                            </div>
                            {version.version !== currentDocument?.currentVersion && (
                              <Dialog
                                open={showRestoreDialog && versionToRestore === version.version}
                                onOpenChange={(open) => {
                                  setShowRestoreDialog(open);
                                  if (!open) setVersionToRestore(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setVersionToRestore(version.version);
                                      setShowRestoreDialog(true);
                                    }}
                                  >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Restaurer
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Restaurer la version {version.version}</DialogTitle>
                                    <DialogDescription>
                                      Cette action créera une nouvelle version basée sur la version{' '}
                                      {version.version} du {format(new Date(version.createdAt), 'PP', { locale: fr })}.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="restore-changeNote">
                                        Note de changement (optionnelle)
                                      </Label>
                                      <Input
                                        id="restore-changeNote"
                                        value={changeNote}
                                        onChange={(e) => setChangeNote(e.target.value)}
                                        placeholder="Ex: Restauration suite à erreur"
                                      />
                                    </div>
                                    <Alert>
                                      <AlertTriangle className="h-4 w-4" />
                                      <AlertDescription>
                                        La version actuelle sera conservée dans l'historique.
                                      </AlertDescription>
                                    </Alert>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setShowRestoreDialog(false);
                                        setVersionToRestore(null);
                                      }}
                                    >
                                      Annuler
                                    </Button>
                                    <Button onClick={handleRestore} disabled={restoreMutation.isPending}>
                                      {restoreMutation.isPending ? 'Restauration...' : 'Restaurer'}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Aucune version enregistrée pour ce document.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

