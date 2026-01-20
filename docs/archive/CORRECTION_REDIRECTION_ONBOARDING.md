# Correction de la Redirection vers l'Onboarding

## Problème identifié

Après connexion, les nouveaux utilisateurs étaient redirigés vers la landing page au lieu de l'onboarding.

## Causes

### 1. Tous les utilisateurs dans le même tenant "default"
Lors de l'inscription, tous les utilisateurs étaient assignés au tenant "default", ce qui faisait qu'ils voyaient toutes les entreprises de ce tenant (y compris ACME Corp).

### 2. Erreur de redirection en cas d'échec
Dans `app/page.tsx`, en cas d'erreur lors de la récupération des entreprises, la redirection se faisait vers `/dashboard` au lieu de `/onboarding`.

## Corrections appliquées

### 1. Création d'un tenant unique par utilisateur

**Fichier** : `server/api/routers/auth.ts`

Avant :
```typescript
// Créer ou récupérer un tenant par défaut
let tenant = await prisma.tenant.findFirst({
  where: { slug: 'default' },
});

if (!tenant) {
  tenant = await prisma.tenant.create({
    data: {
      name: 'Default Tenant',
      slug: 'default',
    },
  });
}
```

Après :
```typescript
// Créer un nouveau tenant unique pour chaque nouvel utilisateur
// Chaque utilisateur doit avoir son propre espace isolé
const tenantSlug = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
const tenantName = input.firstName && input.lastName
  ? `${input.firstName} ${input.lastName}`
  : input.email.split('@')[0]; // Utiliser la partie avant @ de l'email

const tenant = await prisma.tenant.create({
  data: {
    name: tenantName,
    slug: tenantSlug,
  },
});
```

### 2. Correction de la redirection en cas d'erreur

**Fichier** : `app/page.tsx`

Avant :
```typescript
} catch (error) {
  // En cas d'erreur, rediriger vers le dashboard (l'utilisateur pourra créer une entreprise)
  console.error('Erreur lors de la récupération des entreprises:', error);
  redirect('/dashboard');
}
```

Après :
```typescript
} catch (error) {
  // En cas d'erreur, rediriger vers l'onboarding (l'utilisateur pourra créer une entreprise)
  console.error('Erreur lors de la récupération des entreprises:', error);
  redirect('/onboarding');
}
```

## Flux de connexion corrigé

```
┌─────────────────────────────────────────────────────────────┐
│                    Utilisateur se connecte                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Page d'accueil (app/page.tsx)                   │
│                                                               │
│  1. Vérifier si authentifié                                  │
│     ├─ Non → Redirection vers /landing/index.html            │
│     └─ Oui → Continuer                                       │
│                                                               │
│  2. Vérifier si super admin                                  │
│     ├─ Oui → Redirection vers /admin                         │
│     └─ Non → Continuer                                       │
│                                                               │
│  3. Vérifier si a des entreprises                            │
│     ├─ Oui (> 0) → Redirection vers /dashboard              │
│     └─ Non (= 0) → Redirection vers /onboarding             │
│                                                               │
│  4. En cas d'erreur                                          │
│     └─ Redirection vers /onboarding                          │
└─────────────────────────────────────────────────────────────┘
```

## Migration des utilisateurs existants

Pour les utilisateurs créés avant cette correction (qui sont dans le tenant "default") :

### Script de migration

```bash
pnpm exec tsx scripts/migrate-user-to-own-tenant.ts <email>
```

Exemple :
```bash
pnpm exec tsx scripts/migrate-user-to-own-tenant.ts neliddk@gmail.com
```

Ce script :
1. Trouve l'utilisateur par email
2. Crée un nouveau tenant pour lui
3. Migre l'utilisateur vers ce nouveau tenant
4. L'utilisateur devra ensuite créer sa propre entreprise via l'onboarding

## Comportement après correction

### Pour les nouveaux utilisateurs

1. **Inscription** :
   - Un nouveau tenant unique est créé automatiquement
   - L'utilisateur est assigné à ce tenant
   - Aucune entreprise n'existe dans ce tenant

2. **Première connexion** :
   - Redirection vers `/onboarding`
   - L'utilisateur crée sa première entreprise
   - Il ne voit que ses propres données

3. **Connexions suivantes** :
   - Redirection vers `/dashboard`
   - L'utilisateur voit uniquement ses entreprises

### Pour les utilisateurs existants

Si un utilisateur existant est dans le tenant "default" :
1. Exécuter le script de migration
2. L'utilisateur sera déplacé vers son propre tenant
3. À la prochaine connexion, il sera redirigé vers `/onboarding`
4. Il créera sa propre entreprise

## Isolation des données

Chaque utilisateur a maintenant :
- Son propre tenant unique
- Ses propres entreprises
- Ses propres données (sites, unités de travail, évaluations, etc.)
- Aucune visibilité sur les données des autres utilisateurs

## Test

Pour tester :
1. Créez un nouveau compte avec un email différent
2. Vérifiez votre email et activez le compte
3. Connectez-vous
4. Vous devriez être redirigé vers `/onboarding`
5. Créez votre entreprise
6. Vous ne devriez voir que votre propre entreprise

## Vérification

Pour vérifier qu'un utilisateur n'a pas d'entreprises :

```bash
pnpm exec tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.userProfile.findUnique({
    where: { email: 'votre-email@example.com' },
    include: {
      tenant: {
        include: {
          companies: true,
        },
      },
    },
  });
  
  console.log('Tenant:', user?.tenant.name);
  console.log('Nombre d\'entreprises:', user?.tenant.companies.length);
  
  await prisma.\$disconnect();
}

check();
"
```
