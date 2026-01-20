# 🚀 Prochaines étapes - Import DUERP

## ✅ Ce qui est terminé

### Backend
- ✅ Modèle Prisma `DuerpImport`
- ✅ Router tRPC `imports.ts` avec 5 endpoints
- ✅ Services extraction : PDF, Word, Excel, CSV
- ✅ Services IA : OpenAI (GPT-4o) et Anthropic (Claude 3.5 Sonnet)
- ✅ Extraction basique/avancée/complète selon plan
- ✅ Vérification quotas et plans
- ✅ Intégration MinIO pour stockage fichiers importés
- ✅ Suppression automatique des fichiers temporaires

### Frontend
- ✅ Composant upload drag & drop
- ✅ Interface validation données extraites
- ✅ Historique des imports
- ✅ Page `/dashboard/import`
- ✅ Menu Import dans sidebar

---

## 🔨 À implémenter (par ordre de priorité)

### Priorité 1 : Création automatique des entités (CRITIQUE)

**Objectif** : Créer automatiquement les entreprises, sites, unités de travail et risques depuis `validatedData`

**Fichier** : `server/api/routers/imports.ts` → `validateImport`

**À faire** :
1. Parser `validatedData` pour extraire :
   - Entreprise (company)
   - Sites (sites)
   - Unités de travail (workUnits)
   - Risques (risks)
   - Mesures existantes (measures)

2. Créer les entités dans l'ordre :
   ```
   Company → Site → WorkUnit → RiskAssessment → ActionPlan
   ```

3. Gérer les relations :
   - Associer les risques aux unités de travail
   - Créer les plans d'action depuis les mesures

4. Gestion d'erreurs :
   - Rollback en cas d'échec partiel
   - Messages d'erreur clairs
   - Logs pour debugging

**Code à ajouter** :
```typescript
// Dans validateImport mutation
const structure = input.validatedData.structure;

// 1. Créer ou récupérer l'entreprise
let company = await ctx.prisma.company.findFirst({
  where: { tenantId: ctx.tenantId, siret: structure.company?.siret }
});

if (!company && structure.company) {
  company = await ctx.prisma.company.create({
    data: {
      tenantId: ctx.tenantId,
      legalName: structure.company.legalName,
      siret: structure.company.siret,
      // ... autres champs
    }
  });
}

// 2. Créer les sites
// 3. Créer les unités de travail
// 4. Créer les risques
// 5. Créer les mesures/plans d'action
```

---

### Priorité 2 : Upload S3 pour stockage fichiers

**Objectif** : Stocker les fichiers uploadés dans S3 (Hetzner Object Storage)

**À faire** :
1. Configurer client S3 (AWS SDK ou compatible)
2. Créer bucket/container
3. Upload fichier lors de `uploadDocument`
4. Sauvegarder URL dans `fileUrl`
5. Supprimer fichier lors de `delete`

**Variables d'env** :
```bash
S3_ENDPOINT=https://nbg1.your-objectstorage.com
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=duerp-imports
```

---

### Priorité 3 : Interface d'édition des données extraites

**Objectif** : Permettre à l'utilisateur de modifier les données avant validation

**Fichier** : `components/imports/import-validation.tsx`

**À faire** :
1. Créer formulaire éditable pour :
   - Entreprise
   - Unités de travail (ajouter/supprimer/modifier)
   - Risques (ajouter/supprimer/modifier cotations)
   - Mesures

2. Sauvegarder modifications dans `validatedData`
3. Validation avant création entités

---

### Priorité 4 : Enrichissement IA dans l'interface

**Objectif** : Afficher et appliquer les suggestions IA

**Fichier** : `components/imports/import-enrichment.tsx` (à créer)

**À faire** :
1. Appeler `enrichImport` après validation
2. Afficher suggestions :
   - Risques manquants (avec bouton "Ajouter")
   - Mesures préventives (avec bouton "Ajouter")
   - Mises à jour réglementaires
3. Permettre application sélective

---

### Priorité 5 : Migration depuis concurrents

**Objectif** : Support formats Piloteo, QSE Manager, etc.

**À faire** :
1. Créer parsers spécifiques :
   - `piloteo-parser.ts` (XML/CSV)
   - `qse-manager-parser.ts` (Excel)
2. Mapping automatique des structures
3. Conservation historique si possible

---

### Priorité 6 : Tests et validation

**À faire** :
1. Tests unitaires services extraction
2. Tests intégration router imports
3. Tests E2E flux complet
4. Tests avec vrais documents DUERP

---

## 📋 Checklist rapide

### Backend
- [ ] Implémenter création entités dans `validateImport`
- [ ] Configurer S3 pour stockage fichiers
- [ ] Gérer rollback en cas d'erreur
- [ ] Ajouter logs détaillés

### Frontend
- [ ] Interface édition données extraites
- [ ] Composant enrichissement IA
- [ ] Améliorer UX validation
- [ ] Gestion erreurs utilisateur

### Tests
- [ ] Tests unitaires extraction
- [ ] Tests intégration
- [ ] Tests E2E
- [ ] Tests avec documents réels

---

## 🎯 Prochaine étape recommandée

**Commencer par la Priorité 1** : Création automatique des entités

C'est la fonctionnalité la plus critique car sans elle, l'import ne crée rien dans la base de données. Une fois cela fait, l'import sera pleinement fonctionnel.

Souhaitez-vous que je commence par implémenter la création automatique des entités ?

