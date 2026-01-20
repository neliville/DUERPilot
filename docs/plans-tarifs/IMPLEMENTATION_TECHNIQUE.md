# Implémentation Technique - Plans Tarifaires

Guide technique pour l'implémentation et la maintenance du système de plans tarifaires.

---

## 📋 Checklist de Mise en Œuvre

### ✅ Complété

- [x] Migration complète vers v2.0 : renommage plans (essentiel→starter, pro→business, expert→premium)
- [x] Mise à jour `lib/plans.ts` avec nouveaux quotas et prix
- [x] Ajout du plan ENTREPRISE dans le type `Plan`
- [x] Configuration `PLAN_FEATURES.entreprise`
- [x] Configuration `PLAN_PRICES.entreprise`
- [x] Mise à jour `getUpgradePlan()` pour inclure PREMIUM → ENTREPRISE
- [x] Mise à jour des commentaires dans `prisma/schema.prisma`
- [x] Documentation complète dans `docs/plans-tarifs/`

### 🔲 À Faire

#### Backend

- [ ] **Middlewares de vérification des limites**
  - [ ] Créer `checkPlanLimit()` dans `server/api/trpc.ts`
  - [ ] Implémenter les checks pour chaque limite (unités, users, risques, etc.)
  - [ ] Ajouter les logs de dépassement

- [ ] **Notifications de dépassement**
  - [ ] Créer `server/services/plan-monitoring.ts`
  - [ ] Implémenter la détection de dépassement (80%, 90%, 100%)
  - [ ] Créer les templates d'emails de notification
  - [ ] Ajouter un cron job pour vérifier les quotas quotidiennement

- [ ] **API de gestion des plans**
  - [ ] Route `plans.getCurrent` : Récupérer le plan actuel et les quotas
  - [ ] Route `plans.getUsage` : Récupérer l'utilisation actuelle
  - [ ] Route `plans.requestUpgrade` : Demander un upgrade
  - [ ] Route `plans.requestEnterprise` : Demander un devis ENTREPRISE

- [ ] **Tracking d'utilisation**
  - [ ] Créer `PlanUsage` model dans Prisma
  - [ ] Tracker les créations (unités, risques, actions, etc.)
  - [ ] Agrégation mensuelle des quotas
  - [ ] Dashboard admin pour monitoring

#### Frontend

- [ ] **Composants UI**
  - [ ] `<PlanQuotaIndicator />` : Afficher les quotas restants
  - [ ] `<PlanUpgradeDialog />` : Dialog d'upgrade contextuel
  - [ ] `<PlanFeatureBlock />` : Bloquer une fonctionnalité avec upgrade CTA
  - [ ] `<PlanUsageDashboard />` : Dashboard d'utilisation (admin)

- [ ] **Pages**
  - [ ] `/dashboard/settings/plan` : Page de gestion du plan
  - [ ] `/plans` : Page publique de présentation des plans
  - [ ] `/contact/enterprise` : Formulaire de contact ENTREPRISE

- [ ] **Intégration dans les formulaires**
  - [ ] Bloquer la création d'unités si limite atteinte
  - [ ] Bloquer la création de risques si limite atteinte
  - [ ] Afficher les quotas dans les headers de sections

#### Commercial & Marketing

- [ ] **Page de contact ENTREPRISE**
  - [ ] Formulaire enrichi (taille, sites, users, besoins)
  - [ ] Qualification automatique
  - [ ] Notification à l'équipe sales

- [ ] **Emails transactionnels**
  - [ ] Email de bienvenue par plan
  - [ ] Email de dépassement de limite
  - [ ] Email d'upgrade réussi
  - [ ] Email de contact ENTREPRISE (accusé de réception)

- [ ] **Documentation publique**
  - [ ] Page FAQ sur les plans
  - [ ] Comparatif détaillé des plans
  - [ ] Cas d'usage par plan

#### Juridique

- [ ] **CGU**
  - [ ] Ajouter l'article sur les limites d'utilisation
  - [ ] Ajouter la clause d'usage équitable
  - [ ] Faire valider par un avocat (optionnel)

- [ ] **Contrat ENTREPRISE**
  - [ ] Template de contrat sur mesure
  - [ ] Annexe technique (SLA, limites, fonctionnalités)
  - [ ] Conditions générales de vente

---

## 🏗️ Architecture Technique

### Structure des Fichiers

```
lib/
  plans.ts                    # ✅ Configuration des plans (source de vérité)

server/
  api/
    routers/
      plans.ts                # 🔲 Router API pour les plans
    trpc.ts                   # 🔲 Middlewares de vérification
  services/
    plan-monitoring.ts        # 🔲 Service de monitoring des quotas
    email/
      templates/
        plan-limit-warning.ts # 🔲 Template email dépassement

components/
  plans/
    plan-quota-indicator.tsx  # 🔲 Indicateur de quotas
    plan-upgrade-dialog.tsx   # 🔲 Dialog d'upgrade
    plan-feature-block.tsx    # 🔲 Blocage de fonctionnalité
    plan-usage-dashboard.tsx  # 🔲 Dashboard d'utilisation

app/
  (dashboard)/
    dashboard/
      settings/
        plan/
          page.tsx            # 🔲 Page de gestion du plan
  (public)/
    plans/
      page.tsx                # 🔲 Page publique des plans
    contact/
      enterprise/
        page.tsx              # 🔲 Formulaire contact ENTREPRISE

prisma/
  schema.prisma               # 🔲 Ajouter PlanUsage model
```

---

## 🔧 Implémentation Détaillée

### 1. Middleware de Vérification des Limites

**Fichier :** `server/api/trpc.ts`

```typescript
import { PLAN_FEATURES } from '~/lib/plans';
import type { Plan } from '~/lib/plans';

export const checkPlanLimit = (feature: keyof typeof PLAN_FEATURES['free']) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
      select: { plan: true },
    });

    const plan = (userProfile?.plan || 'free') as Plan;
    const planFeatures = PLAN_FEATURES[plan];
    const limit = planFeatures[feature];

    // Vérifier la limite
    if (typeof limit === 'number' && limit !== Infinity) {
      const currentUsage = await getCurrentUsage(ctx.tenantId, feature);
      
      if (currentUsage >= limit) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Limite du plan ${plan.toUpperCase()} atteinte pour ${feature}`,
          cause: {
            feature,
            limit,
            currentUsage,
            upgradePlan: getUpgradePlan(plan),
          },
        });
      }
    }

    return next();
  });

async function getCurrentUsage(
  tenantId: string,
  feature: string
): Promise<number> {
  // Implémenter la logique de comptage selon la feature
  switch (feature) {
    case 'maxWorkUnits':
      return await prisma.workUnit.count({ where: { tenantId } });
    case 'maxUsers':
      return await prisma.userProfile.count({ where: { tenantId } });
    case 'maxRisksPerMonth':
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      return await prisma.riskEvaluation.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth },
        },
      });
    // ... autres features
    default:
      return 0;
  }
}
```

**Utilisation dans un router :**

```typescript
export const workUnitsRouter = createTRPCRouter({
  create: protectedProcedure
    .use(checkPlanLimit('maxWorkUnits'))
    .input(createWorkUnitSchema)
    .mutation(async ({ ctx, input }) => {
      // Créer l'unité de travail
    }),
});
```

---

### 2. Service de Monitoring des Quotas

**Fichier :** `server/services/plan-monitoring.ts`

```typescript
import { prisma } from '~/server/db';
import { PLAN_FEATURES } from '~/lib/plans';
import type { Plan } from '~/lib/plans';
import { sendEmail } from './email/sender';

interface QuotaStatus {
  feature: string;
  limit: number;
  current: number;
  percentage: number;
  exceeded: boolean;
}

export async function checkAllTenantsQuotas() {
  const tenants = await prisma.tenant.findMany({
    include: {
      userProfiles: {
        take: 1,
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  for (const tenant of tenants) {
    const plan = (tenant.userProfiles[0]?.plan || 'free') as Plan;
    const quotas = await checkTenantQuotas(tenant.id, plan);
    
    // Envoyer des notifications si nécessaire
    for (const quota of quotas) {
      if (quota.percentage >= 80 && quota.percentage < 90) {
        await sendQuotaWarning(tenant.id, quota, 80);
      } else if (quota.percentage >= 90 && quota.percentage < 100) {
        await sendQuotaWarning(tenant.id, quota, 90);
      } else if (quota.exceeded) {
        await sendQuotaExceeded(tenant.id, quota);
      }
    }
  }
}

async function checkTenantQuotas(
  tenantId: string,
  plan: Plan
): Promise<QuotaStatus[]> {
  const features = PLAN_FEATURES[plan];
  const quotas: QuotaStatus[] = [];

  // Vérifier chaque limite
  const checks = [
    { feature: 'maxWorkUnits', current: await prisma.workUnit.count({ where: { tenantId } }) },
    { feature: 'maxUsers', current: await prisma.userProfile.count({ where: { tenantId } }) },
    // ... autres features
  ];

  for (const check of checks) {
    const limit = features[check.feature as keyof typeof features];
    
    if (typeof limit === 'number' && limit !== Infinity) {
      quotas.push({
        feature: check.feature,
        limit,
        current: check.current,
        percentage: (check.current / limit) * 100,
        exceeded: check.current > limit,
      });
    }
  }

  return quotas;
}

async function sendQuotaWarning(
  tenantId: string,
  quota: QuotaStatus,
  threshold: number
) {
  // Récupérer les admins du tenant
  const admins = await prisma.userProfile.findMany({
    where: {
      tenantId,
      roles: { has: 'admin_tenant' },
    },
    include: { user: true },
  });

  for (const admin of admins) {
    await sendEmail({
      to: admin.user.email,
      templateId: 'plan-limit-warning',
      params: {
        feature: quota.feature,
        limit: quota.limit,
        current: quota.current,
        percentage: Math.round(quota.percentage),
        threshold,
      },
    });
  }
}
```

**Cron Job :** Ajouter dans `package.json` ou utiliser Vercel Cron

```json
{
  "scripts": {
    "cron:check-quotas": "tsx server/cron/check-quotas.ts"
  }
}
```

---

### 3. Composant Indicateur de Quotas

**Fichier :** `components/plans/plan-quota-indicator.tsx`

```typescript
'use client';

import { api } from '~/trpc/react';
import { Progress } from '~/components/ui/progress';
import { Button } from '~/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface PlanQuotaIndicatorProps {
  feature: string;
  label: string;
}

export function PlanQuotaIndicator({ feature, label }: PlanQuotaIndicatorProps) {
  const { data: usage } = api.plans.getUsage.useQuery({ feature });

  if (!usage) return null;

  const percentage = (usage.current / usage.limit) * 100;
  const isWarning = percentage >= 80;
  const isExceeded = percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {usage.current} / {usage.limit}
        </span>
      </div>
      
      <Progress 
        value={Math.min(percentage, 100)} 
        className={isExceeded ? 'bg-red-200' : isWarning ? 'bg-orange-200' : ''}
      />
      
      {isWarning && (
        <div className="flex items-center gap-2 text-sm text-orange-600">
          <AlertCircle className="h-4 w-4" />
          <span>Vous approchez de la limite de votre plan</span>
        </div>
      )}
      
      {isExceeded && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-red-600">Limite atteinte</span>
          <Button size="sm" variant="default">
            Passer au plan supérieur
          </Button>
        </div>
      )}
    </div>
  );
}
```

---

### 4. Model Prisma pour le Tracking

**Fichier :** `prisma/schema.prisma`

```prisma
model PlanUsage {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Période de tracking
  month     Int      // 1-12
  year      Int      // 2026
  
  // Compteurs
  workUnitsCreated        Int @default(0)
  usersCreated            Int @default(0)
  risksCreated            Int @default(0)
  actionsCreated          Int @default(0)
  observationsCreated     Int @default(0)
  exportsGenerated        Int @default(0)
  importsProcessed        Int @default(0)
  aiSuggestionsRisks      Int @default(0)
  aiSuggestionsActions    Int @default(0)
  aiReformulations        Int @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([tenantId, month, year])
  @@index([tenantId])
}
```

**Migration :**

```bash
pnpm prisma migrate dev --name add_plan_usage
```

---

### 5. Router API Plans

**Fichier :** `server/api/routers/plans.ts`

```typescript
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { PLAN_FEATURES, PLAN_PRICES, getUpgradePlan } from '~/lib/plans';
import type { Plan } from '~/lib/plans';

export const plansRouter = createTRPCRouter({
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const userProfile = await ctx.prisma.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
      select: { plan: true, tenantId: true },
    });

    const plan = (userProfile?.plan || 'free') as Plan;
    const features = PLAN_FEATURES[plan];
    const prices = PLAN_PRICES[plan];
    const upgradePlan = getUpgradePlan(plan);

    return {
      current: plan,
      features,
      prices,
      upgradePlan,
    };
  }),

  getUsage: protectedProcedure
    .input(z.object({ feature: z.string() }))
    .query(async ({ ctx, input }) => {
      const userProfile = await ctx.prisma.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
        select: { plan: true, tenantId: true },
      });

      const plan = (userProfile?.plan || 'free') as Plan;
      const features = PLAN_FEATURES[plan];
      const limit = features[input.feature as keyof typeof features];

      // Calculer l'utilisation actuelle
      const current = await getCurrentUsage(
        userProfile?.tenantId || '',
        input.feature
      );

      return {
        feature: input.feature,
        limit: typeof limit === 'number' ? limit : Infinity,
        current,
      };
    }),

  requestUpgrade: protectedProcedure
    .input(z.object({ targetPlan: z.enum(['starter', 'business', 'premium', 'entreprise']) }))
    .mutation(async ({ ctx, input }) => {
      // Logique de demande d'upgrade
      // - Créer une demande dans la DB
      // - Envoyer un email à l'équipe sales
      // - Rediriger vers Stripe (si automatique)
      
      return { success: true };
    }),

  requestEnterprise: protectedProcedure
    .input(z.object({
      companySize: z.number(),
      numberOfSites: z.number(),
      numberOfUsers: z.number(),
      specificNeeds: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Créer une demande de contact ENTREPRISE
      await ctx.prisma.enterpriseRequest.create({
        data: {
          userId: ctx.session.user.id,
          tenantId: ctx.tenantId,
          ...input,
        },
      });

      // Envoyer un email à l'équipe sales
      await sendEmail({
        to: 'sales@duerpilot.fr',
        templateId: 'enterprise-request',
        params: {
          userName: ctx.session.user.name,
          userEmail: ctx.session.user.email,
          ...input,
        },
      });

      return { success: true };
    }),
});
```

---

## 🧪 Tests

### Tests Unitaires

**Fichier :** `lib/__tests__/plans.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { PLAN_FEATURES, getUpgradePlan, hasMethodAccess } from '../plans';

describe('Plans Configuration', () => {
  it('should have all required features for each plan', () => {
    const plans = ['free', 'starter', 'business', 'premium', 'entreprise'] as const;
    
    plans.forEach((plan) => {
      expect(PLAN_FEATURES[plan]).toBeDefined();
      expect(PLAN_FEATURES[plan].methods).toBeInstanceOf(Array);
      expect(PLAN_FEATURES[plan].maxWorkUnits).toBeGreaterThanOrEqual(0);
    });
  });

  it('should return correct upgrade path', () => {
    expect(getUpgradePlan('free')).toBe('starter');
    expect(getUpgradePlan('starter')).toBe('business');
    expect(getUpgradePlan('business')).toBe('premium');
    expect(getUpgradePlan('premium')).toBe('entreprise');
    expect(getUpgradePlan('entreprise')).toBeNull();
  });

  it('should check method access correctly', () => {
    expect(hasMethodAccess('free', 'duerp_generique')).toBe(true);
    expect(hasMethodAccess('free', 'inrs')).toBe(false);
    expect(hasMethodAccess('starter', 'inrs')).toBe(true);
  });

  it('PREMIUM plan should have realistic limits', () => {
    const premium = PLAN_FEATURES.premium;
    
    expect(premium.maxWorkUnits).toBe(200);
    expect(premium.maxUsers).toBe(30);
    expect(premium.maxCompanies).toBe(10);
    expect(premium.maxSites).toBe(20);
    expect(premium.maxRisksPerMonth).toBe(500);
    expect(premium.maxPlansActionPerMonth).toBe(2000);
    expect(premium.maxObservationsPerMonth).toBe(3000);
  });

  it('ENTREPRISE plan should have unlimited limits', () => {
    const entreprise = PLAN_FEATURES.entreprise;
    
    expect(entreprise.maxWorkUnits).toBe(Infinity);
    expect(entreprise.maxUsers).toBe(Infinity);
    expect(entreprise.maxCompanies).toBe(Infinity);
  });
});
```

### Tests d'Intégration

**Fichier :** `server/api/routers/__tests__/plans.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createInnerTRPCContext } from '~/server/api/trpc';
import { plansRouter } from '../plans';

describe('Plans Router', () => {
  it('should return current plan for authenticated user', async () => {
    const ctx = await createInnerTRPCContext({
      session: { user: { id: 'test-user-id' } },
    });
    
    const caller = plansRouter.createCaller(ctx);
    const result = await caller.getCurrent();
    
    expect(result.current).toBeDefined();
    expect(result.features).toBeDefined();
    expect(result.prices).toBeDefined();
  });

  it('should calculate usage correctly', async () => {
    // TODO: Implémenter avec des données de test
  });
});
```

---

## 📊 Monitoring et Alertes

### Métriques à Suivre

**Datadog / Grafana :**

```typescript
// Exemple de métriques à tracker
metrics.gauge('plans.users_by_plan', count, { plan: 'free' });
metrics.gauge('plans.quota_usage', percentage, { 
  plan: 'premium', 
  feature: 'maxWorkUnits' 
});
metrics.increment('plans.limit_exceeded', { 
  plan: 'business', 
  feature: 'maxRisksPerMonth' 
});
```

### Alertes

**Sentry / Alerting :**

- Alerte si > 10 dépassements de limite par jour
- Alerte si > 50% des utilisateurs d'un plan approchent d'une limite
- Alerte si un tenant ENTREPRISE dépasse ses limites custom

---

## 🔄 Migration de Données

Si des utilisateurs EXPERT existants ont déjà dépassé les nouvelles limites :

**Script de migration :**

```typescript
// scripts/migrate-plans-v2.ts
import { prisma } from '~/server/db';
import { PLAN_FEATURES } from '~/lib/plans';

async function migratePremiumUsers() {
  const premiumUsers = await prisma.userProfile.findMany({
    where: { plan: 'premium' },
    include: {
      tenant: {
        include: {
          _count: {
            select: {
              workUnits: true,
              userProfiles: true,
            },
          },
        },
      },
    },
  });

  for (const user of premiumUsers) {
    const workUnits = user.tenant._count.workUnits;
    const users = user.tenant._count.userProfiles;

    // Si dépasse les limites, proposer ENTREPRISE
    if (
      workUnits > PLAN_FEATURES.premium.maxWorkUnits ||
      users > PLAN_FEATURES.premium.maxUsers
    ) {
      console.log(`User ${user.userId} exceeds PREMIUM limits`);
      
      // Envoyer un email
      await sendEmail({
        to: user.user.email,
        templateId: 'plan-migration-enterprise',
        params: {
          workUnits,
          users,
          limitWorkUnits: PLAN_FEATURES.premium.maxWorkUnits,
          limitUsers: PLAN_FEATURES.premium.maxUsers,
        },
      });
    }
  }
}

migratePremiumUsers();
```

---

**Dernière mise à jour :** Janvier 2026  
**Maintenu par :** Équipe DUERPilot
