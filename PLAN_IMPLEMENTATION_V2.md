# Plan d'Implémentation - Grille Tarifaire v2

**Date :** Janvier 2026  
**Version :** 2.0  
**Statut :** 🚧 En cours

---

## 📋 Résumé des changements v2

### Changements majeurs

1. **Prix Starter** : 99€ → **69€/mois** (55€/mois annuel)
2. **Méthodes d'évaluation** : Toutes disponibles dès **Starter** (incluant classique)
3. **Unités de travail** : **3** dès Free (au lieu de 0)
4. **Sites** : Starter = **3**, Pro = **10** (au lieu de 1 et 3)
5. **Entreprises** : Pro = **3** (au lieu de 1)
6. **Nouvelle fonctionnalité** : **Import DUERP** dès Starter
7. **Export Word** : Disponible dès Starter
8. **Support Chat** : Disponible dès Pro
9. **Support Téléphone** : Expert uniquement
10. **Stockage** : FREE 500 Mo, STARTER 5 Go, PRO 50 Go, EXPERT 500 Go
11. **Hébergement** : Allemagne (Hetzner) pour tous
12. **SLA** : Starter 99%, Pro 99.5%, Expert 99.9%

---

## ✅ Implémenté

### Code
- ✅ `lib/plans.ts` : Interface `PlanFeatures` étendue avec toutes les nouvelles fonctionnalités
- ✅ Prix mis à jour : Starter 69€, Expert 599€
- ✅ Quotas mis à jour : FREE 5 éval/mois, EXPERT 300 IA/mois
- ✅ Fonctionnalités Import ajoutées dans l'interface
- ✅ Support Chat/Phone ajoutés
- ✅ Stockage et hébergement ajoutés

### Documentation
- ✅ `lib/plans.ts` : Source de vérité mise à jour
- ✅ `AJUSTEMENTS_PRICING_V1.1.md` : Document des ajustements précédents

---

## 🚧 À Implémenter

### 1. Fonctionnalité Import DUERP (PRIORITÉ HAUTE)

#### Backend

**Nouveau router tRPC : `server/api/routers/imports.ts`**
```typescript
export const importsRouter = createTRPCRouter({
  // Upload et analyse document
  uploadDocument: authenticatedProcedure
    .input(z.object({
      file: z.string(), // Base64 ou URL
      format: z.enum(['pdf', 'word', 'excel', 'csv']),
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. Vérifier quota import (maxImportsPerMonth)
      // 2. Upload vers S3
      // 3. Appel IA extraction (selon plan)
      // 4. Retourner structure extraite
    }),

  // Validation données importées
  validateImport: authenticatedProcedure
    .input(z.object({
      importId: z.string(),
      validatedData: z.any(), // Structure validée
    }))
    .mutation(async ({ ctx, input }) => {
      // Créer les entités (entreprises, sites, unités, risques)
    }),

  // Enrichissement IA post-import
  enrichImport: authenticatedProcedure
    .input(z.object({
      importId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Suggestions risques manquants, mesures, etc.
    }),
});
```

**Vérifications de quota :**
- Vérifier `maxImportsPerMonth` avant upload
- Vérifier `hasImportDUERP` (false pour FREE)
- Vérifier `hasImportIAExtraction` (niveau selon plan)

**Services IA :**
- **OCR** : Tesseract.js pour PDF scannés
- **Extraction PDF** : pdf-parse pour PDF natifs
- **Extraction Word** : mammoth.js
- **Extraction Excel** : xlsx
- **Extraction structure** : GPT-4 / Claude Sonnet
- **Mapping données** : GPT-4 pour détecter colonnes

**Nouveau modèle Prisma :**
```prisma
model Import {
  id            String   @id @default(cuid())
  userId        String
  tenantId      String
  fileName      String
  fileSize      Int
  format        String   // pdf, word, excel, csv
  status        String   // uploading, analyzing, validated, completed, failed
  extractionData Json?   // Données extraites par IA
  validatedData Json?    // Données validées par utilisateur
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id])
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  
  @@index([userId, createdAt])
  @@index([tenantId])
}
```

#### Frontend

**Nouveau composant : `components/imports/import-duerp-form.tsx`**
- Upload drag & drop
- Sélection format
- Affichage progression extraction
- Interface validation données
- Enrichissement IA optionnel

**Nouvelle page : `app/(dashboard)/dashboard/import/page.tsx`**
- Page principale import
- Liste imports précédents
- Tutoriel import

**Intégration dans sidebar :**
- Menu "Import DUERP" dans section Évaluations

#### Tests
- [ ] Test import PDF simple (10 pages)
- [ ] Test import PDF complexe (50 pages)
- [ ] Test import Excel maison
- [ ] Test import Word
- [ ] Test quota import (3/mois Starter)
- [ ] Test extraction IA basique vs avancée vs complète

---

### 2. Vérifications de limites mises à jour

#### Backend

**`server/api/routers/workUnits.ts`**
- ✅ Vérifier `maxWorkUnits` (FREE = 3, STARTER = 10, PRO = 50)
- ⚠️ **À mettre à jour** : FREE a maintenant 3 unités (pas 0)

**`server/api/routers/sites.ts`**
- ⚠️ **À créer** : Vérifier `maxSites` (STARTER = 3, PRO = 10)

**`server/api/routers/companies.ts`**
- ⚠️ **À mettre à jour** : PRO a maintenant 3 entreprises (pas 1)

**`server/api/routers/oiraResponses.ts`**
- ⚠️ **À mettre à jour** : Méthode classique disponible dès Starter (pas Pro)

**`server/api/routers/riskAssessments.ts`**
- ✅ Vérifier `maxRisksPerMonth` (FREE = 5)
- ⚠️ **À ajouter** : Vérifier `maxPlansActionPerMonth`
- ⚠️ **À ajouter** : Vérifier `maxObservationsPerMonth`

**Nouveaux routers à créer :**
- `server/api/routers/plansAction.ts` : Gestion plans d'action avec quota
- `server/api/routers/observations.ts` : Gestion observations avec quota

---

### 3. Export Word (Starter+)

**Backend :**
- ⚠️ **À implémenter** : Export Word (.docx) pour Starter+
- Utiliser `docx` library pour générer documents Word
- Template Word avec logo (si Starter+)

**Frontend :**
- ⚠️ **À ajouter** : Bouton "Exporter en Word" dans page DUERP
- Vérifier `hasExportWord` avant affichage

---

### 4. Support Chat (Pro+)

**Backend :**
- ⚠️ **À implémenter** : Système de chat en ligne
- Intégration avec service chat (Intercom, Crisp, ou custom)
- Vérifier `supportChat` pour afficher chat

**Frontend :**
- ⚠️ **À ajouter** : Widget chat dans interface Pro+
- Vérifier `supportChat` avant affichage

---

### 5. Support Téléphone (Expert)

**Backend :**
- ⚠️ **À implémenter** : Système de rendez-vous téléphonique
- Intégration calendrier (Calendly ou custom)
- Vérifier `supportPhone` pour afficher option

**Frontend :**
- ⚠️ **À ajouter** : Bouton "Planifier un appel" pour Expert
- Vérifier `supportPhone` avant affichage

---

### 6. Gestion Stockage

**Backend :**
- ⚠️ **À implémenter** : Compteur stockage utilisé
- Vérifier `storageGB` avant upload documents
- Calculer taille documents (DUERP, imports, exports)

**Frontend :**
- ⚠️ **À ajouter** : Indicateur stockage utilisé / limite
- Afficher dans page Paramètres

---

### 7. SLA et Monitoring

**Backend :**
- ⚠️ **À implémenter** : Monitoring uptime
- Intégration UptimeRobot ou Datadog
- Calcul SLA réel vs contractuel

**Frontend :**
- ⚠️ **À ajouter** : Page Status / Uptime
- Afficher SLA selon plan

---

### 8. Hébergement Allemagne

**Infrastructure :**
- ⚠️ **À configurer** : Migration vers Hetzner Allemagne
- Configuration Coolify
- Backup automatique
- Conformité RGPD

**Documentation :**
- ⚠️ **À créer** : Page "Hébergement et sécurité"
- Mentionner localisation Allemagne
- Conformité RGPD

---

## 📊 Priorités d'implémentation

### Phase 1 : Core Import (2 mois) - PRIORITÉ HAUTE
1. ✅ Backend router imports
2. ✅ Services IA extraction
3. ✅ Frontend upload + validation
4. ✅ Tests formats courants

### Phase 2 : Vérifications limites (1 mois) - PRIORITÉ MOYENNE
1. ✅ Mise à jour workUnits (FREE = 3)
2. ✅ Mise à jour sites (STARTER = 3, PRO = 10)
3. ✅ Mise à jour companies (PRO = 3)
4. ✅ Mise à jour méthodes (classique dès Starter)
5. ✅ Quotas plans d'action et observations

### Phase 3 : Exports et Support (1 mois) - PRIORITÉ MOYENNE
1. ✅ Export Word (Starter+)
2. ✅ Support Chat (Pro+)
3. ✅ Support Téléphone (Expert)

### Phase 4 : Infrastructure (2 mois) - PRIORITÉ BASSE
1. ✅ Gestion stockage
2. ✅ Monitoring SLA
3. ✅ Migration Hetzner Allemagne

---

## 🧪 Tests à effectuer

### Tests fonctionnels
- [ ] Import PDF simple (Starter)
- [ ] Import PDF complexe (Pro)
- [ ] Import Excel (Starter)
- [ ] Quota import (3/mois Starter)
- [ ] Extraction IA basique vs avancée
- [ ] Export Word (Starter+)
- [ ] Support Chat (Pro+)
- [ ] Support Téléphone (Expert)
- [ ] Limite stockage (FREE 500 Mo)

### Tests limites
- [ ] FREE : 3 unités de travail max
- [ ] STARTER : 3 sites max, 10 unités max
- [ ] PRO : 3 entreprises max, 10 sites max
- [ ] Méthode classique disponible dès Starter

### Tests migration
- [ ] Migration données existantes (FREE → 3 unités)
- [ ] Migration prix (Starter 99€ → 69€)
- [ ] Communication utilisateurs existants

---

## 📝 Documentation à mettre à jour

- [ ] `STRATEGIE_PRICING_SAAS.md` : Grille tarifaire v2 complète
- [ ] `SPECIFICATION_PLANS_TARIFAIRES.md` : Spécifications v2
- [ ] `IMPLEMENTATION_PLANS.md` : Plan d'implémentation (ce fichier)
- [ ] Guide utilisateur : Fonctionnalité Import
- [ ] Page pricing : Mise à jour prix et fonctionnalités

---

## 🚨 Points d'attention

1. **Migration utilisateurs existants** :
   - Utilisateurs Starter à 99€ : Communiquer changement prix
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

## 📅 Planning estimé

- **Phase 1 (Import)** : 2 mois
- **Phase 2 (Limites)** : 1 mois
- **Phase 3 (Exports/Support)** : 1 mois
- **Phase 4 (Infrastructure)** : 2 mois

**Total : 6 mois** pour implémentation complète v2

---

**Dernière mise à jour :** Janvier 2026  
**Prochaine révision :** Après Phase 1 (Import)

