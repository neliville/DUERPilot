'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, AlertTriangle, Building2, Users } from 'lucide-react';
import { RiskAssessmentDialog } from './risk-assessment-dialog';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface RiskAssessmentListProps {
  initialData: any[];
}

export function RiskAssessmentList({ initialData }: RiskAssessmentListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const { data: assessments, refetch } = api.riskAssessments.getAll.useQuery(
    {
      priorityLevel:
        priorityFilter !== 'all'
          ? (priorityFilter as 'faible' | 'à_améliorer' | 'prioritaire')
          : undefined,
    },
    {
      initialData,
    }
  );

  const handleCreate = () => {
    setSelectedAssessment(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (assessment: any) => {
    setSelectedAssessment(assessment);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedAssessment(null);
    refetch();
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      faible: 'secondary',
      'à_améliorer': 'default',
      prioritaire: 'destructive',
    };
    return (
      <Badge variant={variants[priority] || 'secondary'}>
        {priority === 'à_améliorer' ? 'À améliorer' : priority}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score <= 16) return 'text-green-600';
    if (score <= 64) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Liste des évaluations</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrer par priorité" aria-label="Filtrer les évaluations par priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  <SelectItem value="faible">Faible</SelectItem>
                  <SelectItem value="à_améliorer">À améliorer</SelectItem>
                  <SelectItem value="prioritaire">Prioritaire</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle évaluation
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {assessments && assessments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unité de Travail</TableHead>
                  <TableHead>Danger</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Cotation</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Users className="h-3 w-3 text-gray-400" />
                          {assessment.workUnit.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Building2 className="h-3 w-3" />
                          {assessment.workUnit.site.company.legalName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {assessment.dangerousSituation?.label || assessment.contextDescription || 'Non spécifié'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-bold text-lg ${getScoreColor(assessment.riskScore)}`}
                      >
                        {assessment.riskScore}
                      </span>
                    </TableCell>
                    <TableCell>{getPriorityBadge(assessment.priorityLevel)}</TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div>F: {assessment.frequency}</div>
                        <div>P: {assessment.probability}</div>
                        <div>G: {assessment.severity}</div>
                        <div>M: {assessment.control}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/evaluations/${assessment.id}`}>
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(assessment)}
                        >
                          Modifier
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {assessment.validatedAt ? (
                        <Badge variant="outline" className="text-xs">
                          Validé
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Non validé
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Aucune évaluation
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par créer une nouvelle évaluation de risque.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle évaluation
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <RiskAssessmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        assessment={selectedAssessment}
        onSuccess={handleSuccess}
      />
    </>
  );
}

