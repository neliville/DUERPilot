# Accès Super Admin aux Pages Utilisateurs

## 🎯 Objectif

Permettre aux super administrateurs d'accéder aux pages utilisateurs pour tester les fonctionnalités, tout en conservant un accès rapide à l'interface d'administration.

## ✅ Solution implémentée

### 1. Redirection depuis la page d'accueil uniquement

La redirection automatique vers `/admin` se fait **uniquement depuis la page d'accueil** (`/`). 

Cela signifie que :
- ✅ Les super admins sont redirigés vers `/admin` après connexion (depuis `/`)
- ✅ Les super admins peuvent accéder directement aux pages utilisateurs en tapant l'URL
- ✅ Les super admins peuvent tester le flux d'onboarding
- ✅ Les super admins peuvent tester le dashboard utilisateur

### 2. Liens dans la sidebar admin

Deux liens ont été ajoutés dans le footer de la sidebar admin :

- **"Vue utilisateur"** → `/dashboard` : Accède au dashboard utilisateur
- **"Tester onboarding"** → `/onboarding` : Accède au flux d'onboarding

## 📋 Pages accessibles directement

En tant que super admin, vous pouvez accéder directement à ces URLs :

- **Dashboard utilisateur** : http://localhost:3000/dashboard
- **Onboarding** : http://localhost:3000/onboarding
- **Entreprises** : http://localhost:3000/dashboard/entreprises
- **Évaluations** : http://localhost:3000/dashboard/evaluations
- **Référentiels** : http://localhost:3000/dashboard/referentiels
- **Paramètres** : http://localhost:3000/dashboard/settings
- Et toutes les autres pages utilisateur

## 🔄 Navigation

### Depuis l'interface admin

1. Utiliser les liens dans le footer de la sidebar :
   - Cliquer sur **"Vue utilisateur"** pour accéder au dashboard
   - Cliquer sur **"Tester onboarding"** pour tester l'onboarding

2. Ou taper directement l'URL dans la barre d'adresse

### Retour à l'admin

Pour revenir à l'interface admin, utilisez l'une de ces méthodes :

1. **Depuis la page d'accueil** (`/`) : Redirection automatique vers `/admin`
2. **Via l'URL directe** : http://localhost:3000/admin
3. **Via le menu de navigation** : Si un bouton "Admin" existe dans l'interface utilisateur

## ⚠️ Notes importantes

### Restrictions levées

Les redirections automatiques ont été **levées** dans :
- `/dashboard/page.tsx` : Les super admins peuvent accéder au dashboard
- `/onboarding/layout.tsx` : Les super admins peuvent accéder à l'onboarding

### Redirection conservée

La redirection automatique est **conservée** uniquement dans :
- `/app/page.tsx` : Redirection vers `/admin` depuis la page d'accueil

### Test des fonctionnalités

⚠️ **Important** : Lorsque vous testez les fonctionnalités utilisateur en tant que super admin :
- Vous êtes toujours authentifié en tant que super admin
- Certaines fonctionnalités peuvent se comporter différemment (ex: limites de plan)
- Les données que vous créez sont liées à votre tenant
- Vous pouvez toujours revenir à l'interface admin

## 🧪 Tests recommandés

1. **Flux d'inscription complet** :
   - Accéder à `/auth/signin` en mode inscription
   - Créer un compte test
   - Vérifier la réception de l'email de vérification
   - Vérifier le code de vérification
   - Tester l'onboarding

2. **Flux d'onboarding** :
   - Accéder à `/onboarding`
   - Tester le formulaire d'onboarding
   - Vérifier le mapping NAF → Secteur
   - Créer une entreprise

3. **Dashboard utilisateur** :
   - Accéder à `/dashboard`
   - Créer des unités de travail
   - Créer des évaluations de risques
   - Tester les fonctionnalités métier

4. **Gestion des entreprises** :
   - Créer plusieurs entreprises
   - Tester les limites de plan
   - Tester les fonctionnalités selon le plan

