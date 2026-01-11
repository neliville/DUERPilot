# 🎯 Grille Tarifaire v2 - Résumé des Changements

**Date :** Janvier 2026  
**Version :** 2.0  
**Statut :** ✅ Implémenté dans `lib/plans.ts`

---

## 📊 Changements Principaux

### 1. Prix

| Plan | Avant | Après | Changement |
|------|-------|-------|------------|
| **FREE** | 0€ | 0€ | ✅ Inchangé |
| **STARTER** | 99€/mois | **69€/mois** | ⬇️ -30€ (-30%) |
| **PRO** | 249€/mois | 249€/mois | ✅ Inchangé |
| **EXPERT** | 499€/mois | **599€/mois** | ⬆️ +100€ (+20%) |

**Prix annuels :**
- STARTER : 55€/mois (660€/an)
- PRO : 199€/mois (2 388€/an)
- EXPERT : 479€/mois (5 748€/an)

---

### 2. Méthodes d'Évaluation

| Plan | Avant | Après |
|------|-------|-------|
| **FREE** | Générique uniquement | Générique uniquement |
| **STARTER** | Générique + Guidée IA | **Générique + Guidée IA + Classique** ✅ |
| **PRO** | Toutes | Toutes |
| **EXPERT** | Toutes | Toutes |

**Changement majeur :** Méthode classique INRS disponible dès **Starter** (au lieu de Pro)

---

### 3. Structure & Capacités

| Ressource | FREE | STARTER | PRO | EXPERT |
|-----------|------|---------|-----|--------|
| **Entreprises** | 1 | 1 | **3** ⬆️ | ∞ |
| **Sites** | 1 | **3** ⬆️ | **10** ⬆️ | ∞ |
| **Unités de travail** | **3** ⬆️ | **10** ⬆️ | 50 | ∞ |
| **Utilisateurs** | 1 | 3 | 10 | ∞ |

**Changements :**
- FREE : 3 unités de travail (au lieu de 0)
- STARTER : 3 sites (au lieu de 1), 10 unités (au lieu de 0)
- PRO : 3 entreprises (au lieu de 1), 10 sites (au lieu de 3)

---

### 4. Quotas Évaluations

| Quota | FREE | STARTER | PRO | EXPERT |
|-------|------|---------|-----|--------|
| **Évaluations/mois** | 5 | 50 | 200 | ∞ |
| **Plans d'action/mois** | **10** ⬆️ | **50** ⬆️ | **200** ⬆️ | ∞ |
| **Observations/mois** | **20** ⬆️ | **100** ⬆️ | **500** ⬆️ | ∞ |
| **DUERP/an** | 1 | 4 | 12 | ∞ |

**Nouveaux quotas ajoutés :** Plans d'action et observations

---

### 5. IA Assistive

| Fonctionnalité IA | FREE | STARTER | PRO | EXPERT |
|-------------------|------|---------|-----|--------|
| **Suggestions cotation** | ❌ | **10/mois** ⬇️ | 100/mois | 300/mois |
| **Structuration auto** | ❌ | ❌ | 20/mois | 100/mois |
| **Génération mesures** | ❌ | ❌ | 10/mois | 50/mois |

**Changement :** STARTER = 10 suggestions IA/mois (au lieu de 15)

---

### 6. 🆕 Import DUERP (NOUVEAU)

| Fonctionnalité | FREE | STARTER | PRO | EXPERT |
|----------------|------|---------|-----|--------|
| **Import DUERP** | ❌ | ✅ | ✅ | ✅ |
| **Formats** | ❌ | PDF, Word, Excel, CSV | Tous | Tous |
| **Extraction IA** | ❌ | Basique | Avancée | Complète |
| **Imports/mois** | ❌ | 3 | 10 | ∞ |
| **Accompagnement** | ❌ | ❌ | 1h/an | 4h/an |

**Fonctionnalité différenciante majeure** disponible dès Starter

---

### 7. Export & Documentation

| Format | FREE | STARTER | PRO | EXPERT |
|--------|------|---------|-----|--------|
| **PDF Standard** | ✅ | ✅ | ✅ | ✅ |
| **PDF Personnalisé** | ❌ | ✅ | ✅ | ✅ |
| **Word (.docx)** | ❌ | **✅** ⬆️ | ✅ | ✅ |
| **Excel/CSV** | ❌ | ❌ | ✅ | ✅ |
| **API REST** | ❌ | ❌ | ✅ | ✅ |

**Changement :** Export Word disponible dès **Starter** (au lieu de Pro)

---

### 8. Support & Accompagnement

| Type | FREE | STARTER | PRO | EXPERT |
|------|------|---------|-----|--------|
| **Email** | 48h | 24h | 6h | 2h |
| **Chat en ligne** | ❌ | ❌ | **✅** ⬆️ | ✅ |
| **Téléphone** | ❌ | ❌ | ❌ | **✅** ⬆️ |
| **Documentation** | ✅ | ✅ | ✅ | ✅ |
| **Accompagnement import** | ❌ | ❌ | 1h/an | 4h/an |

**Changements :**
- Support Chat disponible dès **Pro**
- Support Téléphone disponible pour **Expert**
- **Exclu :** Webinaires mensuels et Coaching personnalisé (non inclus dans v2)

---

### 9. Infrastructure

| Critère | FREE | STARTER | PRO | EXPERT |
|---------|------|---------|-----|--------|
| **Stockage** | **500 Mo** ⬆️ | **5 Go** ⬆️ | **50 Go** ⬆️ | **500 Go** ⬆️ |
| **Hébergement** | 🇩🇪 Allemagne | 🇩🇪 Allemagne | 🇩🇪 Allemagne | 🇩🇪 Allemagne |
| **SLA uptime** | - | **99%** ⬆️ | **99.5%** ⬆️ | **99.9%** ⬆️ |
| **Conformité RGPD** | ✅ | ✅ | ✅ | ✅ |

**Nouveaux :** Stockage, hébergement Allemagne, SLA

---

### 10. Référentiels OiRA

| Plan | Avant | Après |
|------|-------|-------|
| **FREE** | 1 (générique) | 1 (générique) |
| **STARTER** | Tous | **3 secteurs** ⬇️ |
| **PRO** | Tous | **Tous (47)** ✅ |
| **EXPERT** | Tous | **Tous (47)** ✅ |

**Changement :** STARTER limité à 3 secteurs OiRA (au lieu de tous)

---

## 🚀 Fonctionnalités Nouvelles

### Import DUERP
- Upload PDF, Word, Excel, CSV
- Extraction IA automatique (structure, risques, cotations)
- Validation manuelle
- Enrichissement IA post-import
- Migration depuis concurrents (Piloteo, QSE Manager)

### Export Word
- Export DUERP en format Word éditable
- Personnalisation logo (Starter+)

### Support Chat
- Chat en ligne pour Pro+
- Réponse sous 6h (Pro) ou 2h (Expert)

### Support Téléphone
- Rendez-vous téléphonique pour Expert
- Support prioritaire 2h

---

## 📝 Fichiers Modifiés

### Code
- ✅ `lib/plans.ts` : Interface `PlanFeatures` étendue, prix mis à jour, nouvelles fonctionnalités

### Documentation
- ✅ `PLAN_IMPLEMENTATION_V2.md` : Plan d'implémentation détaillé
- ✅ `GRILLE_TARIFAIRE_V2_RESUME.md` : Ce document
- ⚠️ `STRATEGIE_PRICING_SAAS.md` : À mettre à jour
- ⚠️ `SPECIFICATION_PLANS_TARIFAIRES.md` : À mettre à jour

---

## 🚧 Reste à Faire

### Développement (Priorité)
1. **Import DUERP** (2 mois)
   - Backend router imports
   - Services IA extraction
   - Frontend upload + validation
   - Tests formats

2. **Vérifications limites** (1 mois)
   - Mise à jour workUnits (FREE = 3)
   - Mise à jour sites (STARTER = 3, PRO = 10)
   - Mise à jour companies (PRO = 3)
   - Méthode classique dès Starter

3. **Exports et Support** (1 mois)
   - Export Word (Starter+)
   - Support Chat (Pro+)
   - Support Téléphone (Expert)

### Infrastructure (Priorité basse)
4. **Gestion stockage** (1 mois)
   - Compteur stockage utilisé
   - Vérification limites

5. **Monitoring SLA** (1 mois)
   - Intégration UptimeRobot/Datadog
   - Calcul SLA réel

6. **Migration Hetzner** (1 mois)
   - Configuration Coolify
   - Backup automatique

---

## 📊 Impact Business

### Revenus
- **STARTER** : -30€/mois par client = -360€/an
- **EXPERT** : +100€/mois par client = +1 200€/an
- **Impact net** : Dépend du ratio Starter/Expert

### Conversion
- **FREE → STARTER** : Prix réduit devrait augmenter conversion
- **Import DUERP** : Barrière switch concurrent abaissée
- **Méthode classique Starter** : Valeur perçue augmentée

### Coûts
- **Import IA** : +2€/mois (Starter), +5€/mois (Pro), +10€/mois (Expert)
- **Stockage** : Coûts marginaux (Hetzner)
- **Support Chat** : Coût service externe (Intercom/Crisp)

---

## ✅ Validation

**Implémenté dans le code :**
- ✅ `lib/plans.ts` : Toutes les fonctionnalités v2
- ✅ Prix mis à jour
- ✅ Quotas mis à jour
- ✅ Nouvelles fonctionnalités ajoutées

**Documentation :**
- ✅ Plan d'implémentation créé
- ⚠️ Documentation marketing à mettre à jour

---

**Dernière mise à jour :** Janvier 2026

