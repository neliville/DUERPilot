# 🎯 Grille Tarifaire v2 - Résumé des Changements

**Date :** Janvier 2026  
**Version :** 2.0  
**Statut :** ✅ Implémenté dans `lib/plans.ts`

---

## 📊 Changements Principaux

### 1. Prix

| Plan | Prix mensuel | Prix annuel | Total annuel |
|------|--------------|-------------|--------------|
| **FREE** | 0€ | 0€ | 0€ |
| **ESSENTIEL** | 29€ | 29€ | 290€ |
| **PRO** | 79€ | 79€ | 790€ |
| **EXPERT** | 149€ | 149€ | 1490€ |

**Note :** Pas de réduction annuelle actuellement (monthly = annual)

---

### 2. Méthodes d'Évaluation

| Plan | Méthodes disponibles |
|------|---------------------|
| **FREE** | Générique uniquement |
| **ESSENTIEL** | Générique + INRS |
| **PRO** | Générique + INRS |
| **EXPERT** | Générique + INRS |

**Note :** Méthode INRS disponible dès **ESSENTIEL**

---

### 3. Structure & Capacités

| Ressource | FREE | ESSENTIEL | PRO | EXPERT |
|-----------|------|-----------|-----|--------|
| **Entreprises** | 1 | 1 | 3 | ∞ |
| **Sites** | 1 | 1 | 5 | ∞ |
| **Unités de travail** | 3 | 10 | 50 | ∞ |
| **Utilisateurs** | 1 | 3 | 10 | ∞ |

---

### 4. Quotas Évaluations

| Quota | FREE | ESSENTIEL | PRO | EXPERT |
|-------|------|-----------|-----|--------|
| **Risques/mois** | 5 | 20 | 100 | ∞ |
| **Plans d'action/mois** | 10 | 30 | 200 | ∞ |
| **Observations/mois** | 5 | 20 | 100 | ∞ |
| **Exports DUERP/an** | 1 | 2 | 12 | ∞ |
| **Imports/mois** | 0 | 0 | 5 | ∞ |

---

### 5. IA Assistive

| Fonctionnalité IA | FREE | ESSENTIEL | PRO | EXPERT |
|-------------------|------|-----------|-----|--------|
| **Suggestions de risques/mois** | ❌ | ❌ | 50 | 200 |
| **Suggestions d'actions/mois** | ❌ | ❌ | ❌ | 50 |
| **Reformulation** | ❌ | ❌ | ✅ Illimitée | ✅ Illimitée |

**Note :** ESSENTIEL n'a volontairement aucune IA

---

### 6. Import DUERP

| Fonctionnalité | FREE | ESSENTIEL | PRO | EXPERT |
|----------------|------|-----------|-----|--------|
| **Import DUERP** | ❌ | ❌ | ✅ | ✅ |
| **Formats** | ❌ | ❌ | PDF, Word, Excel | Tous |
| **Extraction IA** | ❌ | ❌ | Basique | Avancée |
| **Imports/mois** | 0 | 0 | 5 | ∞ |

**Note :** Import disponible à partir du plan PRO

---

### 7. Export & Documentation

| Format | FREE | ESSENTIEL | PRO | EXPERT |
|--------|------|-----------|-----|--------|
| **PDF** | ✅ | ✅ | ✅ | ✅ |
| **Word (.docx)** | ❌ | ❌ | ✅ | ✅ |
| **Excel/CSV** | ❌ | ❌ | ✅ | ✅ |
| **API REST** | ❌ | ❌ | ✅ | ✅ |

**Note :** Exports avancés (Word, Excel) disponibles à partir du plan PRO

---

### 8. Support & Accompagnement

| Type | FREE | ESSENTIEL | PRO | EXPERT |
|------|------|-----------|-----|--------|
| **Email** | 72h | 48h | 24h | 8h |
| **Chat en ligne** | ❌ | ❌ | ❌ | ✅ |
| **Téléphone** | ❌ | ❌ | ❌ | ❌ |
| **Documentation** | ✅ | ✅ | ✅ | ✅ |

**Note :** Support Chat disponible uniquement pour EXPERT

---

### 9. Infrastructure

| Critère | FREE | ESSENTIEL | PRO | EXPERT |
|---------|------|-----------|-----|--------|
| **Hébergement** | 🇩🇪 Allemagne (Hetzner) | 🇩🇪 Allemagne (Hetzner) | 🇩🇪 Allemagne (Hetzner) | 🇩🇪 Allemagne (Hetzner) |
| **Conformité RGPD** | ✅ | ✅ | ✅ | ✅ |

**Note :** Tous les plans sont hébergés en Allemagne (Hetzner) et conformes RGPD

---

### 10. Résumé des Plans

| Plan | Prix | Cible | Différenciateur clé |
|------|------|-------|---------------------|
| **FREE** | 0€ | Découverte | Méthode générique uniquement |
| **ESSENTIEL** | 29€ | TPE | Méthode INRS + 10 unités de travail |
| **PRO** | 79€ | PME/Consultants | IA (50 suggestions) + Import + API |
| **EXPERT** | 149€ | PME structurées | Tout illimité + IA avancée + Support chat |

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

