'use client';

import { useState } from 'react';
import { RiskAssessmentList } from '@/components/evaluations/risk-assessment-list';
import { MethodSelector } from '@/components/evaluations/method-selector';
import { Button } from '@/components/ui/button';
import { EVALUATION_METHODS, type EvaluationMethod } from '@/lib/evaluation-methods';

interface EvaluationsPageClientProps {
  initialData: any[];
}

export function EvaluationsPageClient({ initialData }: EvaluationsPageClientProps) {
  const [selectedMethod, setSelectedMethod] = useState<EvaluationMethod | null>(null);
  const [showMethodSelector, setShowMethodSelector] = useState(false);

  const handleMethodSelect = (method: EvaluationMethod) => {
    setSelectedMethod(method);
    setShowMethodSelector(false);
  };

  return (
    <div className="space-y-6">
      {showMethodSelector ? (
        <div className="space-y-6">
          <MethodSelector
            selectedMethod={selectedMethod}
            onMethodSelect={handleMethodSelect}
            showKeyMessage={true}
          />
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedMethod(null);
                setShowMethodSelector(false);
              }}
            >
              Continuer avec les évaluations existantes
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              {selectedMethod && (
                <p className="text-sm text-gray-600">
                  Méthode sélectionnée : <span className="font-medium">{EVALUATION_METHODS[selectedMethod]?.name}</span>
                </p>
              )}
              {!selectedMethod && (
                <p className="text-sm text-gray-600">
                  Consultez les méthodes d'évaluation disponibles ci-dessous
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMethodSelector(true)}
            >
              Voir les méthodes disponibles
            </Button>
          </div>

          {/* Affichage rapide des 3 méthodes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {(['duerp_generique', 'inrs'] as EvaluationMethod[]).map((method) => {
              const methodDesc = EVALUATION_METHODS[method];
              return (
                <button
                  key={method}
                  type="button"
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => setShowMethodSelector(true)}
                  aria-label={`Voir les détails de la méthode ${methodDesc.name}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{methodDesc.name}</h3>
                    {selectedMethod === method && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Sélectionnée
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{methodDesc.subtitle}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium">IA:</span>
                    <span className="text-gray-600">
                      {methodDesc.aiUsage === 'none' && '❌ Aucune'}
                      {methodDesc.aiUsage === 'assisted' && '✅ Après validation'}
                      {methodDesc.aiUsage === 'optional' && '⚠️ Optionnelle'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Complexité: {methodDesc.complexity}
                  </p>
                </button>
              );
            })}
          </div>

          <RiskAssessmentList initialData={initialData} />
        </div>
      )}
    </div>
  );
}

