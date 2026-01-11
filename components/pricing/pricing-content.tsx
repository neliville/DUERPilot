'use client';

import { useState } from 'react';
import { PLAN_PRICES, PLAN_NAMES, PLAN_DESCRIPTIONS, PLAN_FEATURES, type Plan } from '@/lib/plans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles, Building2, Users, FileText, AlertTriangle, Upload, Shield, Clock, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import Link from 'next/link';

export function PricingContent() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const annualDiscount = 20; // -20% sur annuel

  const plans: Plan[] = ['free', 'essentiel', 'pro', 'expert'];

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuit';
    return `${price.toLocaleString('fr-FR')} €`;
  };

  const formatLimit = (limit: number | null | 'all' | string) => {
    if (limit === Infinity || limit === null) return 'Illimité';
    if (limit === 'all') return 'Tous (47)';
    return limit.toLocaleString('fr-FR');
  };

  const getPlanFeatures = (plan: Plan) => {
    const features = PLAN_FEATURES[plan];
    return [
      {
        label: 'Entreprises',
        value: formatLimit(features.maxCompanies),
        helpText: 'Nombre d\'entreprises que vous pouvez gérer dans votre compte.',
      },
      {
        label: 'Sites / Établissements',
        value: formatLimit(features.maxSites),
        helpText: 'Nombre de sites ou établissements par entreprise.',
      },
      {
        label: 'Unités de travail',
        value: formatLimit(features.maxWorkUnits),
        helpText: 'Nombre d\'unités de travail pour structurer vos évaluations.',
      },
      {
        label: 'Utilisateurs',
        value: formatLimit(features.maxUsers),
        helpText: 'Nombre d\'utilisateurs pouvant accéder à votre compte.',
      },
      {
        label: 'Évaluations/mois',
        value: formatLimit(features.maxRisksPerMonth),
        helpText: 'Nombre d\'évaluations de risques que vous pouvez créer par mois.',
      },
      {
        label: 'Générations DUERP/an',
        value: formatLimit(features.maxExportsPerMonth === Infinity ? Infinity : features.maxExportsPerMonth * 12),
        helpText: 'Nombre de fois que vous pouvez générer votre DUERP par an.',
      },
      {
        label: 'Suggestions IA risques/mois',
        value: formatLimit(features.maxAISuggestionsRisks),
        helpText: 'Nombre de suggestions IA pour identifier les risques manquants par mois.',
      },
      {
        label: 'Suggestions IA actions/mois',
        value: formatLimit(features.maxAISuggestionsActions),
        helpText: 'Nombre de suggestions IA pour les mesures de prévention par mois (EXPERT uniquement).',
      },
      {
        label: 'Reformulation IA',
        value: features.hasAIReformulation ? 'Illimitée' : '❌',
        helpText: 'Reformulation de texte illimitée pour améliorer vos descriptions (PRO et EXPERT).',
      },
      {
        label: 'Import DUERP',
        value: features.hasImportDUERP ? '✅' : '❌',
        helpText: 'Possibilité d\'importer un DUERP existant (PDF, Word, Excel, CSV).',
      },
      {
        label: 'Import DUERP',
        value: features.maxImportsPerMonth === 0 ? '❌' : features.maxImportsPerMonth === null ? 'Illimité' : `${formatLimit(features.maxImportsPerMonth)}/mois`,
        helpText: 'Nombre d\'imports de DUERP existants (PDF, Word, Excel) par mois.',
      },
      {
        label: 'Extraction IA import',
        value: features.hasImportIAExtraction === 'none' ? '❌' : features.hasImportIAExtraction === 'basic' ? 'Basique' : features.hasImportIAExtraction === 'advanced' ? 'Avancée' : 'Complète',
        helpText: 'Niveau d\'extraction IA lors de l\'import (PRO et EXPERT uniquement).',
      },
      {
        label: 'Support',
        value: features.supportLevel === 'email_72h' ? 'Email (72h)' : features.supportLevel === 'email_48h' ? 'Email (48h)' : features.supportLevel === 'email_24h' ? 'Email (24h)' : 'Email (8h)',
        helpText: 'Temps de réponse garanti pour le support.',
      },
      {
        label: 'Chat support',
        value: features.supportChat ? '✅' : '❌',
        helpText: 'Support par chat en temps réel (EXPERT uniquement).',
      },
    ];
  };

  const popularPlan: Plan = 'essentiel';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* En-tête */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Commencez gratuitement, évoluez en toute confiance
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Essai gratuit - Aucune carte bancaire requise
            </p>

            {/* Toggle Mensuel/Annuel */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={cn('text-base font-medium', billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500')}>
                Mensuel
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                className={cn(
                  'relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  billingPeriod === 'annual' ? 'bg-blue-600' : 'bg-gray-300'
                )}
                aria-label="Basculer entre mensuel et annuel"
              >
                <span
                  className={cn(
                    'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                    billingPeriod === 'annual' ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={cn('text-base font-medium', billingPeriod === 'annual' ? 'text-gray-900' : 'text-gray-500')}>
                  Annuel
                </span>
                {billingPeriod === 'annual' && (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    -{annualDiscount}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des forfaits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const price = billingPeriod === 'monthly' 
              ? PLAN_PRICES[plan].monthly 
              : PLAN_PRICES[plan].annual;
            const isPopular = plan === popularPlan;
            const features = getPlanFeatures(plan);

            return (
              <Card
                key={plan}
                className={cn(
                  'relative flex flex-col',
                  isPopular && 'ring-2 ring-blue-500 shadow-lg scale-105'
                )}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      Le plus populaire
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {PLAN_NAMES[plan]}
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600 mb-4">
                    {PLAN_DESCRIPTIONS[plan]}
                  </CardDescription>
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(price)}
                      </span>
                      {billingPeriod === 'annual' && price > 0 && (
                        <span className="text-base text-gray-500">
                          /mois
                        </span>
                      )}
                      {billingPeriod === 'monthly' && price > 0 && (
                        <span className="text-base text-gray-500">
                          /mois
                        </span>
                      )}
                    </div>
                    {billingPeriod === 'annual' && price > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {PLAN_PRICES[plan].annualTotal.toLocaleString('fr-FR')} €/an
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <Button
                    asChild
                    className={cn(
                      'w-full mb-6',
                      isPopular 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : plan === 'free'
                        ? 'bg-gray-900 hover:bg-gray-800'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    )}
                    size="lg"
                  >
                    <Link href={plan === 'free' ? '/auth/signin' : '/dashboard/settings/billing'}>
                      {plan === 'free' ? 'Commencer gratuitement' : 'Choisir ce plan'}
                    </Link>
                  </Button>

                  {/* Liste des fonctionnalités */}
                  <div className="space-y-3 flex-1">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="flex-1 flex items-center gap-2">
                          {feature.value === '✅' ? (
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : feature.value === '❌' ? (
                            <X className="h-5 w-5 text-gray-300 flex-shrink-0" />
                          ) : (
                            <div className="h-5 w-5 flex-shrink-0" />
                          )}
                          <span className="text-sm text-gray-700 flex-1">{feature.label}</span>
                          {feature.helpText && (
                            <HelpTooltip content={feature.helpText} side="left" />
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {feature.value !== '✅' && feature.value !== '❌' && feature.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Lien "Voir toutes les fonctionnalités" */}
                  <div className="mt-6 pt-6 border-t">
                    <Link
                      href="#features-comparison"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium text-center block"
                    >
                      Voir toutes les fonctionnalités →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Section réassurance */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ils nous font confiance
            </h2>
            <p className="text-gray-600">
              Plus de 500 entreprises utilisent DUERPilot pour gérer leur DUERP
            </p>
          </div>
          {/* Carrousel de logos (placeholder - à remplacer par de vrais logos) */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-600">Client 1</span>
            </div>
            <div className="px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-600">Client 2</span>
            </div>
            <div className="px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-600">Client 3</span>
            </div>
            <div className="px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-600">Client 4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section distinctions */}
      <div className="bg-white py-12 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">RGPD Conforme</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Hébergement Allemagne</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">SLA 99%+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section FAQ */}
      <div id="faq" className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-gray-600">
              Tout ce que vous devez savoir sur nos tarifs
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                Ai-je besoin d'une carte bancaire pour l'essai gratuit ?
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 leading-relaxed">
                Non, absolument pas. Le plan Free est entièrement gratuit et ne nécessite aucune carte bancaire. Vous pouvez commencer immédiatement et créer votre premier DUERP sans engagement.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Puis-je changer de forfait à tout moment ?
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 leading-relaxed">
                Oui, vous pouvez upgrader ou downgrader votre forfait à tout moment depuis les paramètres. Les changements sont appliqués immédiatement. En cas de downgrade, vous conservez l'accès à vos données existantes.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Quelle est la durée d'engagement ?
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 leading-relaxed">
                Aucun engagement. Vous pouvez résilier votre abonnement à tout moment. Les abonnements mensuels se renouvellent automatiquement chaque mois, et les abonnements annuels chaque année, mais vous pouvez annuler à tout moment sans frais.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Que se passe-t-il si je dépasse mes quotas ?
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 leading-relaxed">
                Vous recevrez une notification lorsque vous approchez de vos limites (80%). Une fois la limite atteinte, vous pourrez soit upgrader votre plan, soit attendre le renouvellement mensuel. Vos données sont toujours accessibles, seule la création de nouveaux éléments est limitée.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                Puis-je importer mon DUERP existant ?
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 leading-relaxed">
                Oui, l'import de DUERP est disponible à partir du plan PRO. Vous pouvez importer vos documents au format PDF, Word, Excel ou CSV. L'IA extrait automatiquement la structure et les données, vous n'avez plus qu'à valider.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                Quelle est la différence entre les méthodes d'évaluation ?
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 leading-relaxed">
                <strong>Évaluation rapide (Générique)</strong> : Simple et autonome, sans IA, pour une conformité minimale.<br />
                <strong>Évaluation guidée</strong> : Accompagnement pas à pas avec assistance IA pour suggestions.<br />
                <strong>Évaluation avancée</strong> : Méthode classique INRS, structurée par unité de travail, idéale pour audits.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left">
                Mes données sont-elles sécurisées ?
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 leading-relaxed">
                Absolument. Vos données sont hébergées en Allemagne (Hetzner) avec une conformité RGPD stricte. Nous utilisons un chiffrement de bout en bout et effectuons des sauvegardes quotidiennes. Vous pouvez exporter vos données à tout moment.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left">
                Y a-t-il des frais cachés ?
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 leading-relaxed">
                Non, aucun frais caché. Le prix affiché est le prix final. Les seuls coûts supplémentaires peuvent être liés à un dépassement volontaire de quotas (avec accord préalable) ou à des services d'accompagnement personnalisés pour les plans Expert.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Section comparaison détaillée (anchor pour le lien) */}
      <div id="features-comparison" className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comparaison détaillée des fonctionnalités
            </h2>
            <p className="text-gray-600">
              Toutes les fonctionnalités par plan - Comparez en détail
            </p>
          </div>

          {/* Tableau de comparaison détaillé */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                      Fonctionnalité
                    </th>
                    {plans.map((plan) => (
                      <th key={plan} className="px-6 py-4 text-center text-sm font-semibold text-gray-900 min-w-[150px]">
                        <div className="flex flex-col items-center gap-1">
                          <span>{PLAN_NAMES[plan]}</span>
                          {plan === popularPlan && (
                            <Badge variant="default" className="bg-blue-600 text-xs">
                              Populaire
                            </Badge>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Section : Méthodes d'évaluation */}
                  <tr className="bg-blue-50">
                    <td colSpan={5} className="px-6 py-3 text-sm font-bold text-gray-900">
                      📋 MÉTHODES D'ÉVALUATION
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Méthode DUERP générique
                        <HelpTooltip content="Méthode minimale conforme au Code du travail, sans référentiel externe imposé. Adaptée aux TPE pour une conformité essentielle." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {PLAN_FEATURES[plan].methods.includes('duerp_generique') ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Méthode structurée (inspirée INRS)
                        <HelpTooltip content="Méthode approfondie et défendable, conforme aux attentes des inspecteurs, auditeurs et donneurs d'ordre. Pour PME structurées." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {PLAN_FEATURES[plan].methods.includes('inrs') ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Bibliothèques sectorielles
                        <HelpTooltip content="Secteurs d'activité et situations dangereuses types pour identifier rapidement les risques pertinents." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {plan === 'free' ? 'Générique' : plan === 'essentiel' ? 'Générique' : plan === 'pro' ? 'Avancées' : 'Complètes'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Section : Structure & Capacités */}
                  <tr className="bg-blue-50">
                    <td colSpan={5} className="px-6 py-3 text-sm font-bold text-gray-900">
                      🏢 STRUCTURE & CAPACITÉS
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Entreprises
                        <HelpTooltip content="Nombre d'entreprises que vous pouvez gérer dans votre compte." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {formatLimit(PLAN_FEATURES[plan].maxCompanies)}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Sites / Établissements
                        <HelpTooltip content="Nombre de sites ou établissements par entreprise." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {formatLimit(PLAN_FEATURES[plan].maxSites)}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Unités de travail
                        <HelpTooltip content="Nombre d'unités de travail pour structurer vos évaluations par poste ou activité." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {formatLimit(PLAN_FEATURES[plan].maxWorkUnits)}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Utilisateurs
                        <HelpTooltip content="Nombre d'utilisateurs pouvant accéder à votre compte avec différents rôles." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {formatLimit(PLAN_FEATURES[plan].maxUsers)}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Section : Quotas Mensuels */}
                  <tr className="bg-blue-50">
                    <td colSpan={5} className="px-6 py-3 text-sm font-bold text-gray-900">
                      📊 QUOTAS MENSUELS
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Évaluations de risques
                        <HelpTooltip content="Nombre d'évaluations de risques que vous pouvez créer par mois." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {formatLimit(PLAN_FEATURES[plan].maxRisksPerMonth)}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Plans d'action
                        <HelpTooltip content="Nombre de plans d'action (prévention et correctives) que vous pouvez créer par mois." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {formatLimit(PLAN_FEATURES[plan].maxPlansActionPerMonth)}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Observations terrain
                        <HelpTooltip content="Nombre d'observations (situations dangereuses, presqu'accidents, remontées terrain) par mois." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {formatLimit(PLAN_FEATURES[plan].maxObservationsPerMonth)}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Générations DUERP/an
                        <HelpTooltip content="Nombre de fois que vous pouvez générer votre DUERP par an (PDF, Word, etc.)." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {formatLimit(PLAN_FEATURES[plan].maxExportsPerMonth === Infinity ? Infinity : PLAN_FEATURES[plan].maxExportsPerMonth * 12)}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Section : IA Assistive */}
                  <tr className="bg-blue-50">
                    <td colSpan={5} className="px-6 py-3 text-sm font-bold text-gray-900">
                      🤖 ASSISTANCE INTELLIGENTE (IA)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Suggestions IA risques/mois
                        <HelpTooltip content="Nombre de suggestions IA pour identifier les risques manquants par mois (PRO et EXPERT uniquement)." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {formatLimit(PLAN_FEATURES[plan].maxAISuggestionsRisks)}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Suggestions IA actions/mois
                        <HelpTooltip content="Nombre de suggestions IA pour les mesures de prévention par mois (EXPERT uniquement)." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {formatLimit(PLAN_FEATURES[plan].maxAISuggestionsActions)}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Reformulation illimitée
                        <HelpTooltip content="Reformulation de texte illimitée pour améliorer vos descriptions (PRO et EXPERT uniquement, limite technique 300/jour non affichée)." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {PLAN_FEATURES[plan].hasAIReformulation ? (
                          <span className="text-sm font-medium text-green-600">Illimitée</span>
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Section : Import & Migration */}
                  <tr className="bg-blue-50">
                    <td colSpan={5} className="px-6 py-3 text-sm font-bold text-gray-900">
                      📥 IMPORT & MIGRATION
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Import DUERP (PDF, Word, Excel, CSV)
                        <HelpTooltip content="Possibilité d'importer un DUERP existant depuis différents formats de fichiers." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {PLAN_FEATURES[plan].hasImportDUERP ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Extraction IA automatique
                        <HelpTooltip content="Niveau d'extraction IA : Basique (75-85%), Avancée (85-92%), Complète (92-97%)." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {PLAN_FEATURES[plan].hasImportIAExtraction === 'none' ? (
                            <span className="text-gray-400">-</span>
                          ) : PLAN_FEATURES[plan].hasImportIAExtraction === 'basic' ? (
                            'Basique'
                          ) : PLAN_FEATURES[plan].hasImportIAExtraction === 'advanced' ? (
                            'Avancée'
                          ) : (
                            'Complète'
                          )}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Imports/mois
                        <HelpTooltip content="Nombre d'imports de DUERP que vous pouvez effectuer par mois." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {formatLimit(PLAN_FEATURES[plan].maxImportsPerMonth)}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Accompagnement migration
                        <HelpTooltip content="Heures d'accompagnement personnalisé pour migrer depuis un autre logiciel ou importer des données complexes." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {PLAN_FEATURES[plan].hasImportMigrationSupport ? (
                          <span className="text-sm font-medium text-gray-900">
                            {PLAN_FEATURES[plan].importMigrationHours}h/an
                          </span>
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Section : Export & Documentation */}
                  <tr className="bg-blue-50">
                    <td colSpan={5} className="px-6 py-3 text-sm font-bold text-gray-900">
                      📄 EXPORT & DOCUMENTATION
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Export PDF standard
                        <HelpTooltip content="Export de votre DUERP au format PDF standard." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Export PDF personnalisé (logo)
                        <HelpTooltip content="Export PDF avec votre logo et personnalisation de marque." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {plan !== 'free' ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Export Word (.docx)
                        <HelpTooltip content="Export de votre DUERP au format Word éditable." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {PLAN_FEATURES[plan].hasExportWord ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Export Excel (.xlsx)
                        <HelpTooltip content="Export de vos données au format Excel pour analyses et tableaux croisés." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {PLAN_FEATURES[plan].hasExportExcel ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Export CSV
                        <HelpTooltip content="Export de données brutes au format CSV pour intégration dans d'autres systèmes." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {PLAN_FEATURES[plan].hasExportExcel ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        API REST
                        <HelpTooltip content="Accès à l'API REST pour intégrer DUERPilot dans vos systèmes existants." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {PLAN_FEATURES[plan].hasAPI ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Historique & Versions
                        <HelpTooltip content="Conservation de l'historique des versions de votre DUERP et journal de traçabilité." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {PLAN_FEATURES[plan].hasHistory ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Section : Support & Accompagnement */}
                  <tr className="bg-blue-50">
                    <td colSpan={5} className="px-6 py-3 text-sm font-bold text-gray-900">
                      🛡️ SUPPORT & ACCOMPAGNEMENT
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Support Email
                        <HelpTooltip content="Support par email avec temps de réponse garanti selon votre plan." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {PLAN_FEATURES[plan].supportLevel === 'email_48h' ? '48h' :
                           PLAN_FEATURES[plan].supportLevel === 'email_24h' ? '24h' :
                           PLAN_FEATURES[plan].supportLevel === 'email_chat_6h' ? '6h' : '2h'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Chat en ligne
                        <HelpTooltip content="Support par chat en temps réel pour résoudre rapidement vos questions." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {PLAN_FEATURES[plan].supportChat ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Support téléphonique
                        <HelpTooltip content="Support par téléphone pour assistance prioritaire et urgente." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {PLAN_FEATURES[plan].supportPhone ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        SLA Uptime
                        <HelpTooltip content="Garantie de disponibilité du service (Service Level Agreement)." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {PLAN_FEATURES[plan].slaUptime ? `${PLAN_FEATURES[plan].slaUptime}%` : '-'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Section : Fonctionnalités Avancées */}
                  <tr className="bg-blue-50">
                    <td colSpan={5} className="px-6 py-3 text-sm font-bold text-gray-900">
                      🔧 FONCTIONNALITÉS AVANCÉES
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Multi-entreprises
                        <HelpTooltip content="Gestion de plusieurs entreprises dans un même compte." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {PLAN_FEATURES[plan].maxCompanies === Infinity ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : PLAN_FEATURES[plan].maxCompanies > 1 ? (
                          <span className="text-sm font-medium text-gray-900">
                            {PLAN_FEATURES[plan].maxCompanies}
                          </span>
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Multi-tenant
                        <HelpTooltip content="Architecture multi-tenant pour organisations avec plusieurs entités indépendantes." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {PLAN_FEATURES[plan].hasMultiTenant ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Webhooks
                        <HelpTooltip content="Notifications en temps réel via webhooks pour intégrer avec vos systèmes." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {plan === 'expert' ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        SSO (SAML/OAuth)
                        <HelpTooltip content="Authentification unique (Single Sign-On) pour intégrer avec votre système d'identité." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {plan === 'expert' ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Marque blanche
                        <HelpTooltip content="Personnalisation complète avec votre logo et vos couleurs." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        {plan === 'expert' ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Stockage
                        <HelpTooltip content="Espace de stockage disponible pour vos documents et données." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {PLAN_FEATURES[plan].storageGB} Go
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        Hébergement
                        <HelpTooltip content="Localisation de l'hébergement de vos données pour conformité RGPD." />
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan} className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {PLAN_FEATURES[plan].hostingLocation}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA final */}
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-600 mb-6">
              Vous avez des questions sur les fonctionnalités ?
            </p>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/contact">
                Contactez notre équipe
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

