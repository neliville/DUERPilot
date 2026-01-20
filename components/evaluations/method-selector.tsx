'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertCircle, Sparkles, ClipboardCheck, Lock } from 'lucide-react';
import { EVALUATION_METHODS, METHOD_SELECTION_KEY_MESSAGE } from '@/lib/evaluation-methods';
import type { EvaluationMethod } from '@/lib/evaluation-methods';
import { hasMethodAccess, getRequiredPlan, PLAN_NAMES, type Plan } from '@/lib/plans';
import { cn } from '@/lib/utils';
import { api } from '@/lib/trpc/client';
import { useRouter } from 'next/navigation';

interface MethodSelectorProps {
  selectedMethod?: EvaluationMethod | null;
  onMethodSelect: (method: EvaluationMethod) => void;
  currentPlan?: Plan;
  showKeyMessage?: boolean;
}

export function MethodSelector({
  selectedMethod,
  onMethodSelect,
  currentPlan,
  showKeyMessage = true,
}: MethodSelectorProps) {
  const router = useRouter();
  const { data: planInfo } = api.plans.getCurrent.useQuery(undefined, {
    enabled: !currentPlan,
  });

  const plan = currentPlan || planInfo?.plan || 'free';

  const methods: EvaluationMethod[] = ['duerp_generique', 'inrs', 'assistance_ia'];

  const getMethodIcon = (method: EvaluationMethod) => {
    switch (method) {
      case 'duerp_generique':
        return <ClipboardCheck className="h-6 w-6" />;
      case 'inrs':
        return <AlertCircle className="h-6 w-6" />;
      case 'assistance_ia':
        return <Sparkles className="h-6 w-6" />;
    }
  };

  const getMethodColor = (method: EvaluationMethod) => {
    switch (method) {
      case 'duerp_generique':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'inrs':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'assistance_ia':
        return 'text-purple-600 bg-purple-50 border-purple-200';
    }
  };

  const hasAccess = (method: EvaluationMethod) => {
    return hasMethodAccess(plan, method);
  };

  return (
    <div className="space-y-6">
      {showKeyMessage && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm font-medium text-blue-900 text-center">
            {METHOD_SELECTION_KEY_MESSAGE}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {methods.map((method: EvaluationMethod) => {
          const methodDesc = EVALUATION_METHODS[method];
          const accessible = hasAccess(method);
          const isSelected = selectedMethod === method;
          const Icon = getMethodIcon(method);
          const requiredPlan = getRequiredPlan(method);

          return (
            <Card
              key={method}
              className={cn(
                'transition-all hover:shadow-lg relative',
                isSelected && 'ring-2 ring-blue-500',
                !accessible && 'opacity-75',
                getMethodColor(method)
              )}
            >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn('p-2 rounded-lg', getMethodColor(method))}>
                      {Icon}
                    </div>
                         {isSelected && (
                             <Badge variant="default" className="bg-blue-600" aria-label="Méthode sélectionnée">
                               <Check className="h-3 w-3 mr-1" aria-hidden="true" />
                               Sélectionnée
                             </Badge>
                           )}
                  </div>
                  <CardTitle className="text-xl">{methodDesc.name}</CardTitle>
                  <CardDescription className="text-sm font-medium mt-1">
                    {methodDesc.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Usage IA */}
                  <div className="flex items-start gap-2 text-xs">
                    <span className="font-medium">IA :</span>
                    <span className="text-gray-600">
                      {methodDesc.aiUsage === 'none' && '❌ Aucune'}
                      {methodDesc.aiUsage === 'assisted' && '✅ Après validation humaine'}
                      {methodDesc.aiUsage === 'optional' && '⚠️ Optionnelle et assistive'}
                    </span>
                  </div>

                  {/* Complexité */}
                  <div className="flex items-start gap-2 text-xs">
                    <span className="font-medium">Complexité :</span>
                    <span className="text-gray-600">{methodDesc.complexity}</span>
                  </div>

                  {/* À quoi ça sert */}
                  <div>
                    <p className="text-xs font-medium mb-1">🎯 À quoi ça sert ?</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {methodDesc.purpose}
                    </p>
                  </div>

                  {/* Pour qui */}
                  <div>
                    <p className="text-xs font-medium mb-1">👤 Pour qui ?</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {methodDesc.targetUsers.slice(0, 2).map((user: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="mt-0.5">•</span>
                          <span>{user}</span>
                        </li>
                      ))}
                      {methodDesc.targetUsers.length > 2 && (
                        <li className="text-gray-500 italic">
                          + {methodDesc.targetUsers.length - 2} autre(s)
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Avantages */}
                  <div>
                    <p className="text-xs font-medium mb-1 text-green-700">✅ Avantages</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {methodDesc.advantages.slice(0, 2).map((adv: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1">
                          <Check className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {methodDesc.limitations.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1 text-orange-700">⚠️ Limites</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {methodDesc.limitations.slice(0, 2).map((lim: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1">
                            <X className="h-3 w-3 mt-0.5 text-orange-600 flex-shrink-0" />
                            <span>{lim}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Message d'upsell si non accessible */}
                  {!accessible && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-600" />
                        <p className="text-xs font-semibold text-blue-900">
                          Disponible dans le plan {PLAN_NAMES[requiredPlan]}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {method === 'inrs' && (
                          <>
                            <p className="text-xs text-gray-700 font-medium">
                              Méthode structurée (inspirée INRS) indisponible
                            </p>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              La méthode structurée (inspirée INRS) permet une évaluation approfondie et défendable, conforme aux attentes des inspecteurs, auditeurs et donneurs d'ordre. 
                              Elle est disponible à partir du plan {PLAN_NAMES[requiredPlan]}, pensé pour les TPE souhaitant structurer leur démarche QSE.
                            </p>
                            <ul className="text-xs text-gray-600 space-y-1 ml-4">
                              <li className="flex items-start gap-1">
                                <Check className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                                <span>Méthode structurée et reconnue</span>
                              </li>
                              <li className="flex items-start gap-1">
                                <Check className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                                <span>Cotation F × P × G experte</span>
                              </li>
                              <li className="flex items-start gap-1">
                                <Check className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                                <span>Approche défendable en contrôle</span>
                              </li>
                            </ul>
                          </>
                        )}
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Rediriger vers la page de facturation
                          router.push('/dashboard/settings/billing');
                        }}
                      >
                        Découvrir le plan {PLAN_NAMES[requiredPlan]}
                      </Button>
                    </div>
                  )}

                  {/* Bouton de sélection */}
                  {accessible && (
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      className={cn(
                        'w-full mt-4',
                        isSelected && 'bg-blue-600 hover:bg-blue-700'
                      )}
                      onClick={() => {
                        onMethodSelect(method);
                      }}
                    >
                      {isSelected ? 'Méthode sélectionnée' : 'Choisir cette méthode'}
                    </Button>
                  )}
                </CardContent>
              </Card>
          );
        })}
      </div>
    </div>
  );
}

