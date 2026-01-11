# 🎯 Plan d'Action - Prochaines Étapes

**Date :** Janvier 2026  
**Statut actuel :** Configuration email et MinIO terminés

---

## ✅ Ce qui vient d'être terminé

1. **Configuration Email Professionnelle** (100%)
   - Service centralisé avec FROM/REPLY-TO/CONTACT
   - Intégration Brevo automatique
   - Documentation complète

2. **Service MinIO/S3 Storage** (100%)
   - Service centralisé avec 6 buckets
   - Tests complets (86.7% réussis)
   - Documentation complète

---

## 🎯 Priorités Immédiates (Cette Semaine)

### 1. Finaliser Backend Admin (2-3 jours)

**Objectif :** Rendre l'interface admin complètement opérationnelle

**Actions :**
- [ ] Vérifier si la migration Prisma a été appliquée
  ```bash
  pnpm prisma db push
  ```
- [ ] Créer le super admin si pas encore fait
  ```bash
  pnpm tsx scripts/create-super-admin.ts
  ```
- [ ] Tester l'accès à `/admin` avec le super admin
- [ ] Compléter les pages admin manquantes :
  - [ ] AI Management (suivi des coûts IA)
  - [ ] Import Monitoring
  - [ ] Audit Logs

**Fichiers concernés :**
- `PROCHAINES_ETAPES_ADMIN.md` (détails complets)

---

### 2. Finaliser Import DUERP - Création automatique (3-4 jours)

**Objectif :** Permettre la création automatique des entités depuis les données importées

**Actions :**
- [ ] Implémenter la création automatique dans `validateImport`
  - Entreprises
  - Sites
  - Unités de travail
  - Risques
  - Mesures existantes
- [ ] Gérer les relations entre entités
- [ ] Gérer les erreurs et rollback
- [ ] Tester avec un import réel

**Fichiers concernés :**
- `server/api/routers/imports.ts` → `validateImport`
- `PROCHAINES_ETAPES_IMPORT.md` (détails complets)

---

### 3. Corrections des Limites de Plans (1 jour)

**Objectif :** S'assurer que toutes les limites v2 sont correctement appliquées

**Actions :**
- [ ] Vérifier `workUnits.ts` (FREE = 3 unités)
- [ ] Vérifier `sites.ts` (STARTER = 3 sites)
- [ ] Vérifier `companies.ts` (PRO = 3 entreprises)
- [ ] Vérifier `oiraResponses.ts` (méthode classique dès Starter)
- [ ] Tester chaque plan avec ses limites

**Fichiers concernés :**
- `server/api/routers/workUnits.ts`
- `server/api/routers/sites.ts`
- `server/api/routers/companies.ts`
- `server/api/routers/oiraResponses.ts`

---

## 📅 Planning Recommandé

### Semaine 1 (Cette semaine)
- **Jour 1-2 :** Finaliser Backend Admin
- **Jour 3-4 :** Création automatique Import DUERP
- **Jour 5 :** Corrections limites de plans

### Semaine 2
- **Jour 1-2 :** Interface d'édition Import DUERP
- **Jour 3-4 :** Tests end-to-end Import
- **Jour 5 :** Corrections et optimisations

### Semaine 3
- **Jour 1-2 :** Quotas plans d'action et observations
- **Jour 3-4 :** Export Word
- **Jour 5 :** Tests et documentation

---

## 🔧 Actions Techniques Détaillées

### Backend Admin - Checklist

```bash
# 1. Vérifier migration Prisma
pnpm prisma db push

# 2. Créer super admin
pnpm tsx scripts/create-super-admin.ts
# Email: ddwinsolutions@gmail.com

# 3. Tester l'accès admin
# Se connecter avec le super admin
# Accéder à /admin
# Vérifier CEO Dashboard, Companies, Users, Billing
```

### Import DUERP - Création automatique

**Fichier :** `server/api/routers/imports.ts`

**Fonction à compléter :** `validateImport`

**Structure attendue de `validatedData` :**
```typescript
{
  company: {
    name: string;
    siret?: string;
    sector?: string;
    staff?: number;
  };
  sites: Array<{
    name: string;
    address?: string;
  }>;
  workUnits: Array<{
    name: string;
    siteId?: string; // Référence au site
    staff?: number;
  }>;
  risks: Array<{
    workUnitId: string;
    hazard: string;
    risk: string;
    frequency?: number;
    probability?: number;
    gravity?: number;
    mastery?: number;
    existingMeasures?: string[];
  }>;
}
```

**Ordre de création :**
1. Company
2. Sites (liés à Company)
3. WorkUnits (liés à Site)
4. RiskAssessments (liés à WorkUnit)
5. ActionPlans (si mesures existantes)

---

## 🧪 Tests à Effectuer

### Tests Backend Admin
- [ ] Accès super admin à `/admin`
- [ ] CEO Dashboard affiche les KPIs
- [ ] Gestion des companies fonctionne
- [ ] Gestion des users fonctionne
- [ ] Billing affiche les marges

### Tests Import DUERP
- [ ] Upload d'un PDF simple
- [ ] Extraction IA fonctionne
- [ ] Validation des données extraites
- [ ] Création automatique des entités
- [ ] Vérification des relations

### Tests Limites Plans
- [ ] FREE : 3 unités max
- [ ] STARTER : 3 sites max, méthode classique disponible
- [ ] PRO : 3 entreprises max
- [ ] EXPERT : Illimité

---

## 📚 Documentation à Mettre à Jour

- [x] `STATUT_PROJET.md` - Vue d'ensemble
- [x] `PROCHAINES_ETAPES.md` - Plan général
- [x] `PROCHAINES_ETAPES_ADMIN.md` - Backend admin
- [x] `PROCHAINES_ETAPES_IMPORT.md` - Import DUERP
- [ ] Guide utilisateur Import (à créer)
- [ ] Guide admin (à créer)

---

## 🚨 Points d'Attention

1. **Migration Prisma :** S'assurer que toutes les migrations sont appliquées avant de continuer
2. **Super Admin :** Créer le super admin avant de tester l'interface admin
3. **Tests MinIO :** Les 2 erreurs restantes (avatar) sont non bloquantes mais à investiguer
4. **Configuration Email :** Vérifier que les templates Brevo utilisent bien les bonnes adresses

---

## ✅ Checklist Rapide

### Aujourd'hui
- [ ] Lire `STATUT_PROJET.md` pour vue d'ensemble
- [ ] Vérifier migration Prisma
- [ ] Créer super admin si nécessaire
- [ ] Tester accès `/admin`

### Cette Semaine
- [ ] Finaliser Backend Admin
- [ ] Implémenter création automatique Import
- [ ] Corriger limites de plans

### Ce Mois
- [ ] Interface d'édition Import
- [ ] Quotas et exports
- [ ] Tests complets

---

## 📞 Support

Pour toute question ou blocage :
- Consulter les fichiers MD de suivi
- Vérifier les logs serveur
- Tester les endpoints avec curl ou Postman

---

**Dernière mise à jour :** Janvier 2026  
**Prochaine révision :** Après finalisation Backend Admin

