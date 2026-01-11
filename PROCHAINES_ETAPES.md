# 🚀 Prochaines Étapes - Plan d'Action Priorisé

**Date :** Janvier 2026  
**Dernière mise à jour :** Janvier 2026  
**Statut :** ✅ Grille tarifaire v2 définie dans `lib/plans.ts`  
**✅ Configuration Email :** Terminée  
**✅ Service MinIO/S3 :** Terminé et testé

---

## ✅ Réalisations Récentes

### Configuration Email Professionnelle (Terminé)
- ✅ Service centralisé avec FROM/REPLY-TO/CONTACT
- ✅ Intégration Brevo automatique
- ✅ Validation et documentation complète
- **Voir :** `CONFIGURATION_EMAIL.md`

### Service MinIO/S3 Storage (Terminé)
- ✅ Service centralisé avec 6 buckets
- ✅ URLs présignées, métadonnées, nettoyage
- ✅ Tests complets (86.7% réussis)
- **Voir :** `MINIO_STORAGE.md`

---

## 🎯 Priorité 1 : Corrections Immédiates (1-2 jours)

### ⚠️ Corrections critiques des vérifications de limites

Ces corrections sont **urgentes** car elles bloquent actuellement les fonctionnalités pour les utilisateurs FREE et Starter.

#### 1.1 Correction `workUnits.ts` - FREE a maintenant 3 unités

**Fichier :** `server/api/routers/workUnits.ts` (ligne 138)

**Problème actuel :**
```typescript
if (planFeatures.maxWorkUnits === 0) {
  // Bloque FREE alors qu'il a maintenant 3 unités
}
```

**À corriger :**
```typescript
// Supprimer cette vérification ou la changer en :
if (planFeatures.maxWorkUnits === 0) {
  // Seulement si vraiment 0 (plus aucun plan n'a 0)
  // Sinon, laisser passer et vérifier la limite après
}
```

**Action :** Supprimer le blocage `maxWorkUnits === 0` car FREE a maintenant 3 unités.

---

#### 1.2 Correction `oiraResponses.ts` - Méthode classique dès Starter

**Fichier :** `server/api/routers/oiraResponses.ts`

**Problème actuel :**
- Vérifie seulement `guided_ia` mais pas `classic`
- La méthode classique est maintenant disponible dès Starter

**À vérifier :**
- Si des vérifications bloquent la méthode classique pour Starter, les supprimer
- S'assurer que `riskAssessments.ts` permet la méthode classique dès Starter

---

#### 1.3 Mise à jour vérifications sites et entreprises

**Fichiers :**
- `server/api/routers/sites.ts` : STARTER = 3 sites (au lieu de 1)
- `server/api/routers/companies.ts` : PRO = 3 entreprises (au lieu de 1)

**Action :** Vérifier que les limites sont bien appliquées selon la v2.

---

## 🎯 Priorité 2 : Fonctionnalité Import DUERP (2 mois)

### Phase 1 : Backend (3-4 semaines)

#### 2.1 Modèle Prisma Import

**Fichier :** `prisma/schema.prisma`

**À ajouter :**
```prisma
model Import {
  id            String   @id @default(cuid())
  userId        String
  tenantId      String
  fileName      String
  fileSize      Int
  format        String   // pdf, word, excel, csv
  fileUrl       String?  // URL S3
  status        String   // uploading, analyzing, validated, completed, failed
  extractionData Json?   // Données extraites par IA
  validatedData Json?    // Données validées par utilisateur
  errorMessage  String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id])
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  
  @@index([userId, createdAt])
  @@index([tenantId])
  @@map("imports")
}
```

**Action :**
1. Ajouter le modèle dans `schema.prisma`
2. Exécuter `pnpm prisma db push`
3. Exécuter `pnpm prisma generate`

---

#### 2.2 Router tRPC Imports

**Fichier :** `server/api/routers/imports.ts` (à créer)

**Endpoints à implémenter :**
```typescript
export const importsRouter = createTRPCRouter({
  // 1. Upload document
  uploadDocument: authenticatedProcedure
    .input(z.object({
      file: z.string(), // Base64
      fileName: z.string(),
      format: z.enum(['pdf', 'word', 'excel', 'csv']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Vérifier quota import (maxImportsPerMonth)
      // Vérifier hasImportDUERP
      // Upload vers S3
      // Créer enregistrement Import
      // Lancer extraction IA (job asynchrone)
    }),

  // 2. Récupérer statut extraction
  getImportStatus: authenticatedProcedure
    .input(z.object({ importId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Retourner statut + données extraites
    }),

  // 3. Valider données importées
  validateImport: authenticatedProcedure
    .input(z.object({
      importId: z.string(),
      validatedData: z.any(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Créer entreprises, sites, unités, risques
    }),

  // 4. Enrichissement IA
  enrichImport: authenticatedProcedure
    .input(z.object({ importId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Suggestions risques manquants, mesures
    }),
});
```

**Action :**
1. Créer le fichier `server/api/routers/imports.ts`
2. Implémenter les endpoints
3. Ajouter dans `server/api/routers/_app.ts`

---

#### 2.3 Services IA Extraction

**Fichiers à créer :**
- `server/services/import/pdf-extractor.ts`
- `server/services/import/word-extractor.ts`
- `server/services/import/excel-extractor.ts`
- `server/services/import/ia-extractor.ts`

**Dépendances à installer :**
```bash
pnpm add pdf-parse mammoth xlsx tesseract.js
pnpm add -D @types/pdf-parse
```

**Action :**
1. Installer les dépendances
2. Créer les services d'extraction
3. Intégrer avec GPT-4/Claude pour extraction structure

---

### Phase 2 : Frontend (2-3 semaines)

#### 2.4 Composants Import

**Fichiers à créer :**
- `components/imports/import-duerp-form.tsx` : Formulaire upload
- `components/imports/import-validation.tsx` : Interface validation
- `components/imports/import-enrichment.tsx` : Enrichissement IA

**Page à créer :**
- `app/(dashboard)/dashboard/import/page.tsx` : Page principale import

**Action :**
1. Créer les composants
2. Créer la page
3. Ajouter menu dans sidebar

---

## 🎯 Priorité 3 : Vérifications Quotas (1 semaine)

### 3.1 Quotas Plans d'Action

**Fichier :** `server/api/routers/actionPlans.ts`

**À ajouter :**
```typescript
// Vérifier maxPlansActionPerMonth avant création
const planFeatures = PLAN_FEATURES[userPlan];
if (planFeatures.maxPlansActionPerMonth !== Infinity) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const count = await ctx.prisma.actionPlan.count({
    where: {
      workUnit: {
        site: {
          company: { tenantId: ctx.tenantId },
        },
      },
      createdAt: { gte: monthStart },
    },
  });
  
  if (count >= planFeatures.maxPlansActionPerMonth) {
    // Erreur quota atteint
  }
}
```

---

### 3.2 Quotas Observations

**Fichier :** `server/api/routers/observations.ts` (à créer ou vérifier)

**À ajouter :** Même logique que plans d'action pour `maxObservationsPerMonth`

---

## 🎯 Priorité 4 : Export Word (1 semaine)

### 4.1 Backend Export Word

**Fichier :** `server/api/routers/exports.ts` (à créer ou étendre)

**Dépendance :**
```bash
pnpm add docx
```

**Action :**
1. Créer fonction export Word
2. Vérifier `hasExportWord` avant export
3. Template Word avec logo (si Starter+)

---

### 4.2 Frontend Export Word

**Fichier :** Page DUERP ou composant export

**Action :**
1. Ajouter bouton "Exporter en Word"
2. Vérifier `hasExportWord` avant affichage

---

## 🎯 Priorité 5 : Support Chat/Phone (2 semaines)

### 5.1 Support Chat (Pro+)

**Options :**
- Intégration Intercom
- Intégration Crisp
- Chat custom

**Action :**
1. Choisir solution
2. Intégrer widget
3. Vérifier `supportChat` avant affichage

---

### 5.2 Support Téléphone (Expert)

**Action :**
1. Intégration Calendly ou solution custom
2. Bouton "Planifier un appel" pour Expert
3. Vérifier `supportPhone` avant affichage

---

## 🎯 Priorité 6 : Documentation (1 semaine)

### 6.1 Documentation Marketing

**Fichiers à mettre à jour :**
- `STRATEGIE_PRICING_SAAS.md` : Tableaux et prix v2
- `SPECIFICATION_PLANS_TARIFAIRES.md` : Spécifications techniques v2

**Action :**
1. Mettre à jour tous les tableaux comparatifs
2. Mettre à jour les prix (Starter 69€, Expert 599€)
3. Ajouter section Import DUERP
4. Exclure webinaires et coaching

---

### 6.2 Guide Utilisateur Import

**Fichier :** `docs/guide-import-duerp.md` (à créer)

**Action :**
1. Créer guide pas à pas
2. Vidéos tutoriels (optionnel)

---

## 📅 Planning Recommandé

### Semaine 1-2 : Corrections Immédiates
- ✅ Correction vérifications limites (workUnits, sites, companies)
- ✅ Correction méthode classique Starter
- ✅ Tests vérifications

### Semaine 3-6 : Import DUERP Backend
- ✅ Modèle Prisma
- ✅ Router tRPC
- ✅ Services extraction
- ✅ Tests backend

### Semaine 7-9 : Import DUERP Frontend
- ✅ Composants upload
- ✅ Interface validation
- ✅ Enrichissement IA
- ✅ Tests frontend

### Semaine 10 : Quotas & Exports
- ✅ Quotas plans d'action
- ✅ Quotas observations
- ✅ Export Word

### Semaine 11-12 : Support
- ✅ Support Chat
- ✅ Support Téléphone

### Semaine 13 : Documentation
- ✅ Documentation marketing
- ✅ Guide utilisateur

**Total estimé : 13 semaines (3 mois)**

---

## 🧪 Tests à Effectuer

### Tests Fonctionnels
- [ ] FREE : 3 unités de travail max
- [ ] STARTER : 3 sites max, 10 unités max, méthode classique disponible
- [ ] PRO : 3 entreprises max, 10 sites max
- [ ] Import PDF simple (Starter)
- [ ] Import PDF complexe (Pro)
- [ ] Quota import (3/mois Starter)
- [ ] Export Word (Starter+)
- [ ] Support Chat (Pro+)
- [ ] Support Téléphone (Expert)

### Tests Limites
- [ ] Vérifier tous les quotas mensuels
- [ ] Vérifier limites structure (entreprises, sites, unités)
- [ ] Vérifier méthodes d'évaluation par plan

---

## 🚨 Points d'Attention

1. **Migration utilisateurs existants** :
   - Utilisateurs Starter à 99€ : Communiquer nouveau prix 69€
   - Utilisateurs FREE : Ajouter 3 unités de travail
   - Utilisateurs Pro : Ajouter 2 entreprises supplémentaires

2. **Rétrocompatibilité** :
   - Vérifier que le code existant fonctionne avec nouvelles limites
   - Migration base de données si nécessaire

3. **Communication** :
   - Email utilisateurs Starter : Nouveau prix 69€
   - Email utilisateurs FREE : Nouvelles fonctionnalités (3 unités)
   - Blog post : Fonctionnalité Import

---

## ✅ Checklist Rapide

### Immédiat (Aujourd'hui)
- [ ] Corriger `workUnits.ts` (supprimer blocage maxWorkUnits === 0)
- [ ] Vérifier `oiraResponses.ts` (méthode classique Starter)
- [ ] Vérifier `sites.ts` (STARTER = 3 sites)
- [ ] Vérifier `companies.ts` (PRO = 3 entreprises)

### Cette Semaine
- [ ] Tester toutes les vérifications de limites
- [ ] Mettre à jour documentation marketing

### Ce Mois
- [ ] Démarrer implémentation Import DUERP
- [ ] Modèle Prisma Import
- [ ] Router tRPC imports

---

**Dernière mise à jour :** Janvier 2026  
**Prochaine révision :** Après corrections immédiates

