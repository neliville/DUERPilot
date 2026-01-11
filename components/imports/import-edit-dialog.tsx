'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2 } from 'lucide-react';
import type { DuerpStructure } from '@/server/services/import/ia-extractor';

interface ImportEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  structure: DuerpStructure;
  onSave: (structure: DuerpStructure) => void;
}

export function ImportEditDialog({ open, onOpenChange, structure, onSave }: ImportEditDialogProps) {
  const [editedStructure, setEditedStructure] = useState<DuerpStructure>(structure);

  const handleSave = () => {
    onSave(editedStructure);
    onOpenChange(false);
  };

  // Entreprise
  const updateCompany = (field: string, value: any) => {
    setEditedStructure({
      ...editedStructure,
      company: {
        ...editedStructure.company,
        [field]: value,
      },
    });
  };

  // Unités de travail
  const addWorkUnit = () => {
    setEditedStructure({
      ...editedStructure,
      workUnits: [
        ...(editedStructure.workUnits || []),
        { name: '', description: '', exposedCount: undefined },
      ],
    });
  };

  const updateWorkUnit = (index: number, field: string, value: any) => {
    const workUnits = [...(editedStructure.workUnits || [])];
    workUnits[index] = {
      ...workUnits[index],
      [field]: value,
    };
    setEditedStructure({ ...editedStructure, workUnits });
  };

  const removeWorkUnit = (index: number) => {
    const workUnits = [...(editedStructure.workUnits || [])];
    workUnits.splice(index, 1);
    setEditedStructure({ ...editedStructure, workUnits });
  };

  // Risques
  const addRisk = () => {
    setEditedStructure({
      ...editedStructure,
      risks: [
        ...(editedStructure.risks || []),
        {
          hazard: '',
          dangerousSituation: '',
          exposedPersons: '',
          frequency: 1,
          probability: 1,
          severity: 1,
          control: 1,
        },
      ],
    });
  };

  const updateRisk = (index: number, field: string, value: any) => {
    const risks = [...(editedStructure.risks || [])];
    risks[index] = {
      ...risks[index],
      [field]: value,
    };
    setEditedStructure({ ...editedStructure, risks });
  };

  const removeRisk = (index: number) => {
    const risks = [...(editedStructure.risks || [])];
    risks.splice(index, 1);
    setEditedStructure({ ...editedStructure, risks });
  };

  // Mesures
  const addMeasure = () => {
    setEditedStructure({
      ...editedStructure,
      measures: [
        ...(editedStructure.measures || []),
        { description: '', type: 'préventive' },
      ],
    });
  };

  const updateMeasure = (index: number, field: string, value: any) => {
    const measures = [...(editedStructure.measures || [])];
    measures[index] = {
      ...measures[index],
      [field]: value,
    };
    setEditedStructure({ ...editedStructure, measures });
  };

  const removeMeasure = (index: number) => {
    const measures = [...(editedStructure.measures || [])];
    measures.splice(index, 1);
    setEditedStructure({ ...editedStructure, measures });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Éditer les données extraites</DialogTitle>
          <DialogDescription>
            Modifiez les données avant validation et création des entités
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company">Entreprise</TabsTrigger>
            <TabsTrigger value="workUnits">
              Unités ({editedStructure.workUnits?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="risks">
              Risques ({editedStructure.risks?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="measures">
              Mesures ({editedStructure.measures?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Onglet Entreprise */}
          <TabsContent value="company" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legalName">Raison sociale *</Label>
                <Input
                  id="legalName"
                  value={editedStructure.company?.legalName || ''}
                  onChange={(e) => updateCompany('legalName', e.target.value)}
                  placeholder="Nom de l'entreprise"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siret">SIRET</Label>
                <Input
                  id="siret"
                  value={editedStructure.company?.siret || ''}
                  onChange={(e) => updateCompany('siret', e.target.value)}
                  placeholder="12345678900012"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={editedStructure.company?.address || ''}
                  onChange={(e) => updateCompany('address', e.target.value)}
                  placeholder="Adresse"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCount">Effectif</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  value={editedStructure.company?.employeeCount || ''}
                  onChange={(e) => updateCompany('employeeCount', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  placeholder="Nombre de salariés"
                />
              </div>
            </div>
          </TabsContent>

          {/* Onglet Unités de travail */}
          <TabsContent value="workUnits" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {editedStructure.workUnits?.length || 0} unité(s) de travail
              </p>
              <Button type="button" variant="outline" size="sm" onClick={addWorkUnit}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {editedStructure.workUnits?.map((wu, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">Unité {index + 1}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorkUnit(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom *</Label>
                      <Input
                        value={wu.name || ''}
                        onChange={(e) => updateWorkUnit(index, 'name', e.target.value)}
                        placeholder="Nom de l'unité"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Effectif exposé</Label>
                      <Input
                        type="number"
                        value={wu.exposedCount || ''}
                        onChange={(e) => updateWorkUnit(index, 'exposedCount', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                        placeholder="Nombre de personnes"
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={wu.description || ''}
                        onChange={(e) => updateWorkUnit(index, 'description', e.target.value)}
                        placeholder="Description de l'unité de travail"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {(!editedStructure.workUnits || editedStructure.workUnits.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  Aucune unité de travail. Cliquez sur "Ajouter" pour en créer une.
                </div>
              )}
            </div>
          </TabsContent>

          {/* Onglet Risques */}
          <TabsContent value="risks" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {editedStructure.risks?.length || 0} risque(s) détecté(s)
              </p>
              <Button type="button" variant="outline" size="sm" onClick={addRisk}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {editedStructure.risks?.map((risk, index) => {
                const score = (risk.frequency || 1) * (risk.probability || 1) * (risk.severity || 1) * (risk.control || 1);
                return (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline">Risque {index + 1}</Badge>
                      <div className="flex items-center gap-2">
                        <Badge variant={score >= 50 ? 'destructive' : score >= 20 ? 'default' : 'secondary'}>
                          Score: {score}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRisk(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Unité de travail</Label>
                        <Input
                          value={risk.workUnitName || ''}
                          onChange={(e) => updateRisk(index, 'workUnitName', e.target.value)}
                          placeholder="Nom de l'unité"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Danger *</Label>
                        <Input
                          value={risk.hazard || ''}
                          onChange={(e) => updateRisk(index, 'hazard', e.target.value)}
                          placeholder="Type de danger"
                        />
                      </div>

                      <div className="space-y-2 col-span-2">
                        <Label>Situation dangereuse</Label>
                        <Textarea
                          value={risk.dangerousSituation || ''}
                          onChange={(e) => updateRisk(index, 'dangerousSituation', e.target.value)}
                          placeholder="Description de la situation"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Personnes exposées</Label>
                        <Input
                          value={risk.exposedPersons || ''}
                          onChange={(e) => updateRisk(index, 'exposedPersons', e.target.value)}
                          placeholder="Ex: Cuisiniers, Serveurs"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Mesures existantes</Label>
                        <Textarea
                          value={risk.existingMeasures || ''}
                          onChange={(e) => updateRisk(index, 'existingMeasures', e.target.value)}
                          placeholder="Mesures déjà en place"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-4 gap-2 col-span-2">
                        <div className="space-y-2">
                          <Label>F (1-5)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={risk.frequency || 1}
                            onChange={(e) => updateRisk(index, 'frequency', parseInt(e.target.value, 10) || 1)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>P (1-5)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={risk.probability || 1}
                            onChange={(e) => updateRisk(index, 'probability', parseInt(e.target.value, 10) || 1)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>G (1-5)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={risk.severity || 1}
                            onChange={(e) => updateRisk(index, 'severity', parseInt(e.target.value, 10) || 1)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>M (1-5)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={risk.control || 1}
                            onChange={(e) => updateRisk(index, 'control', parseInt(e.target.value, 10) || 1)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {(!editedStructure.risks || editedStructure.risks.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  Aucun risque détecté. Cliquez sur "Ajouter" pour en créer un.
                </div>
              )}
            </div>
          </TabsContent>

          {/* Onglet Mesures */}
          <TabsContent value="measures" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {editedStructure.measures?.length || 0} mesure(s) détectée(s)
              </p>
              <Button type="button" variant="outline" size="sm" onClick={addMeasure}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {editedStructure.measures?.map((measure, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">Mesure {index + 1}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMeasure(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={measure.type || 'préventive'}
                      onChange={(e) => updateMeasure(index, 'type', e.target.value)}
                    >
                      <option value="préventive">Préventive</option>
                      <option value="corrective">Corrective</option>
                      <option value="technique">Technique</option>
                      <option value="organisationnelle">Organisationnelle</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea
                      value={measure.description || ''}
                      onChange={(e) => updateMeasure(index, 'description', e.target.value)}
                      placeholder="Description de la mesure"
                      rows={3}
                    />
                  </div>
                </div>
              ))}

              {(!editedStructure.measures || editedStructure.measures.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  Aucune mesure détectée. Cliquez sur "Ajouter" pour en créer une.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Enregistrer les modifications
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

