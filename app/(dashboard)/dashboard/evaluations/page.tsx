import { getServerApi } from '@/lib/trpc/server';
import { EvaluationsPageClient } from '@/components/evaluations/evaluations-page-client';

export default async function EvaluationsPage() {
  const api = await getServerApi();
  const assessments = await api.riskAssessments.getAll();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Évaluations des Risques
        </h1>
        <p className="mt-2 text-gray-600">
          Choisissez votre méthode d'évaluation et gérez vos évaluations de risques professionnels
        </p>
      </div>

      <EvaluationsPageClient initialData={assessments} />
    </div>
  );
}

