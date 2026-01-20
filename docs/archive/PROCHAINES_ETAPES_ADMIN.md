# 🎯 Prochaines étapes - Backend Admin DUERPilot

## ✅ Ce qui a été fait

- ✅ Schéma Prisma : `AIUsageLog`, `Subscription`, `AdminSettings`
- ✅ Middleware admin avec vérification `super_admin`
- ✅ Service de logging IA centralisé
- ✅ Intégration logging dans services OpenAI et Anthropic
- ✅ 10 routers admin complets
- ✅ Service de calcul des coûts et marges
- ✅ Service d'alertes automatiques
- ✅ Frontend Admin : CEO Dashboard, Companies, Users, Billing
- ✅ Configuration email professionnelle (FROM/REPLY-TO centralisés)
- ✅ Service MinIO/S3 pour stockage fichiers

---

## 📋 Étapes à suivre (dans l'ordre)

### 1️⃣ Migration Prisma (OBLIGATOIRE)

Créer et appliquer la migration pour les nouvelles tables :

```bash
# Générer la migration
pnpm prisma migrate dev --name add_admin_models

# Ou si vous préférez créer la migration manuellement
pnpm prisma migrate dev --create-only --name add_admin_models
# Puis éditer le fichier SQL généré si nécessaire
```

**Tables créées :**
- `ai_usage_logs` - Logging détaillé des appels IA
- `subscriptions` - Gestion des abonnements
- `admin_settings` - Configuration admin

**Modifications :**
- `user_profiles` - Ajout de `lastLoginAt`, `isSuperAdmin`
- `companies` - Ajout de `lastDuerpGeneration`, `lastActivity`, `methodsUsed`, `subscriptionId`

---

### 2️⃣ Mettre à jour le script de création super admin

Le script `scripts/create-super-admin.ts` doit être mis à jour pour inclure `isSuperAdmin` :

```typescript
// Dans createSuperAdmin(), modifier :
await prisma.userProfile.update({
  where: { email },
  data: {
    firstName,
    lastName,
    roles: ['super_admin'],
    isSuperAdmin: true, // ← Ajouter cette ligne
  },
});

// Et dans la création :
const userProfile = await prisma.userProfile.create({
  data: {
    email,
    firstName,
    lastName,
    roles: ['super_admin'],
    isSuperAdmin: true, // ← Ajouter cette ligne
    tenantId: tenant.id,
  },
});
```

---

### 3️⃣ Créer/Mettre à jour un super admin

```bash
# Exécuter le script (après avoir mis à jour le script)
pnpm tsx scripts/create-super-admin.ts
```

**Identifiants par défaut :**
- Email : `ddwinsolutions@gmail.com`
- Mot de passe : `Admin123!` (à changer après première connexion)

**Vérification :**
```bash
# Vérifier que l'utilisateur a bien isSuperAdmin = true
pnpm prisma studio
# Ouvrir user_profiles, chercher l'email, vérifier isSuperAdmin
```

---

### 4️⃣ Tester les routes admin

#### Test basique avec tRPC

Créer un fichier de test : `scripts/test-admin-routes.ts`

```typescript
import { appRouter } from '@/server/api/routers/_app';
import { createCallerFactory } from '@/server/api/trpc';
import { prisma } from '@/lib/db';

async function testAdminRoutes() {
  // Récupérer un super admin
  const admin = await prisma.userProfile.findFirst({
    where: { isSuperAdmin: true },
  });

  if (!admin) {
    console.error('❌ Aucun super admin trouvé');
    return;
  }

  // Créer un caller (simulation d'appel API)
  const createCaller = createCallerFactory(appRouter);
  const caller = createCaller({
    session: { user: { email: admin.email } },
    user: { email: admin.email },
    userProfile: admin,
    prisma,
    req: {} as any,
    res: undefined,
  });

  try {
    // Test vue CEO
    const ceoView = await caller.admin.dashboard.getCEOView();
    console.log('✅ Vue CEO:', ceoView);

    // Test MRR
    const mrr = await caller.admin.billing.getMRR();
    console.log('✅ MRR:', mrr);

    // Test stats IA
    const aiStats = await caller.admin.aiUsage.getStats();
    console.log('✅ Stats IA:', aiStats);

    console.log('✅ Tous les tests admin passent !');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testAdminRoutes();
```

---

### 5️⃣ Frontend Admin (Optionnel mais recommandé)

Créer les pages admin dans `/app/(dashboard)/admin/` :

#### Structure recommandée :

```
app/(dashboard)/admin/
├── layout.tsx          # Layout avec sidebar admin
├── page.tsx            # Dashboard CEO (vue d'ensemble)
├── companies/
│   └── page.tsx        # Liste entreprises
├── users/
│   └── page.tsx        # Liste utilisateurs
├── billing/
│   └── page.tsx        # Facturation & marges
├── ai-usage/
│   └── page.tsx        # Pilotage IA
├── imports/
│   └── page.tsx        # Monitoring imports
├── audit/
│   └── page.tsx        # Journal d'audit
└── analytics/
    └── page.tsx        # Analytics produit
```

#### Exemple de page dashboard CEO :

```typescript
// app/(dashboard)/admin/page.tsx
'use client';

import { api } from '@/trpc/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboardPage() {
  const { data, isLoading } = api.admin.dashboard.getCEOView.useQuery();

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard CEO</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Clients actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.clients.active}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.revenue.mrr}€</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marge nette</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.margins.grossMargin}€</p>
            <p className="text-sm text-muted-foreground">
              {data?.margins.marginPercentage}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertes critiques */}
      {data?.alerts && data.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alertes critiques</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.alerts.map((alert, i) => (
                <li key={i} className="text-red-600">
                  {alert.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

### 6️⃣ Sécuriser les routes admin (Frontend)

Ajouter une vérification dans le layout admin :

```typescript
// app/(dashboard)/admin/layout.tsx
import { redirect } from 'next/navigation';
import { getServerApi } from '@/lib/trpc/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const api = await getServerApi();
  
  try {
    const user = await api.auth.getCurrentUser();
    
    if (!user?.isSuperAdmin && !user?.roles?.includes('super_admin')) {
      redirect('/dashboard');
    }
  } catch {
    redirect('/auth/signin');
  }

  return <>{children}</>;
}
```

---

### 7️⃣ Documentation API Admin

Créer un fichier `DOCUMENTATION_API_ADMIN.md` avec :
- Liste de toutes les routes admin
- Exemples d'utilisation
- Schémas de données retournées

---

## 🚨 Points d'attention

### Logging IA automatique

Le logging IA est maintenant **automatique** pour :
- ✅ `extractDuerpStructureWithGPT4` (import)
- ✅ `extractDuerpStructureWithClaude` (import)
- ✅ `enrichDuerpWithGPT4` (enrichissement)

**Vérification :**
```bash
# Vérifier que les logs sont créés
pnpm prisma studio
# Ouvrir ai_usage_logs, vérifier les entrées après un import
```

### Coûts IA

Les coûts sont calculés automatiquement selon :
- **GPT-4o** : $2.50/1M input, $10/1M output (converti en EUR)
- **Claude 3.5 Sonnet** : $3/1M input, $15/1M output (converti en EUR)

**À ajuster** dans `server/services/admin/ai-logger.ts` si les prix changent.

### Alertes automatiques

Les alertes sont disponibles via `server/services/admin/alerts.ts` :
- Quota IA > 80%
- Import massif suspect
- Churn à risque
- Marge négative

**Intégration recommandée :** Créer un cron job ou webhook pour vérifier régulièrement.

---

## 📊 Priorités

### Phase 1 (Immédiat)
1. ✅ Migration Prisma
2. ✅ Mettre à jour script super admin
3. ✅ Créer super admin
4. ✅ Tester routes admin de base

### Phase 2 (Court terme)
1. Créer dashboard CEO (frontend)
2. Créer page pilotage IA
3. Créer page facturation & marges

### Phase 3 (Moyen terme)
1. Créer toutes les pages admin
2. Implémenter système d'alertes (cron/webhook)
3. Documentation complète

---

## 🔗 Ressources

- **Schéma Prisma** : `prisma/schema.prisma`
- **Routers admin** : `server/api/routers/admin/`
- **Services admin** : `server/services/admin/`
- **Script super admin** : `scripts/create-super-admin.ts`

---

## ❓ Questions fréquentes

**Q: Comment accéder aux routes admin ?**
R: Via tRPC avec un utilisateur ayant `isSuperAdmin: true` ou `roles: ['super_admin']`

**Q: Les logs IA sont-ils créés automatiquement ?**
R: Oui, dès qu'un appel IA est fait via les services OpenAI/Anthropic

**Q: Comment calculer les marges manuellement ?**
R: Utiliser `server/services/admin/cost-calculator.ts` - fonction `calculateGrossMarginForTenant`

**Q: Les alertes sont-elles automatiques ?**
R: Non, il faut appeler `getAllAlerts()` depuis `server/services/admin/alerts.ts` (cron recommandé)

