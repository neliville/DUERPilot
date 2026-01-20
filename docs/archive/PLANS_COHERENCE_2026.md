# ✅ Cohérence des Plans Tarifaires - Janvier 2026

**Date de mise à jour :** Janvier 2026  
**Statut :** ✅ COHÉRENT - Tous les fichiers alignés

---

## 📋 Plans Actuels (Source de vérité : `lib/plans.ts`)

| Plan | Prix/mois | Prix/an | Cible | Différenciateur |
|------|-----------|---------|-------|-----------------|
| **FREE** | 0€ | 0€ | Découverte (1-5 salariés) | Méthode générique uniquement |
| **ESSENTIEL** | 29€ | 290€ | TPE (5-20 salariés) | Méthode INRS + 10 unités |
| **PRO** | 79€ | 790€ | PME/Consultants (20-100) | IA + Import + API |
| **EXPERT** | 149€ | 1490€ | PME structurées (100+) | Tout illimité + IA avancée |

---

## 🎯 Fonctionnalités Détaillées

### FREE (0€/mois)
- **Méthodes** : Générique uniquement
- **Structure** : 1 entreprise, 1 site, 3 unités de travail, 1 utilisateur
- **Quotas** : 5 risques/mois, 1 export/an, 10 actions/mois, 5 observations/mois
- **IA** : ❌ Aucune
- **Exports** : PDF uniquement
- **Import** : ❌ Non
- **Support** : Email 72h

### ESSENTIEL (29€/mois)
- **Méthodes** : Générique + **INRS**
- **Structure** : 1 entreprise, 1 site, **10 unités de travail**, 3 utilisateurs
- **Quotas** : 20 risques/mois, 2 exports/an, 30 actions/mois, 20 observations/mois
- **IA** : ❌ Aucune (volontaire)
- **Exports** : PDF uniquement
- **Import** : ❌ Non
- **Support** : Email 48h
- **🎯 Différenciateur** : Accès à la méthode INRS structurée

### PRO (79€/mois)
- **Méthodes** : Générique + INRS
- **Structure** : 3 entreprises, 5 sites, 50 unités de travail, 10 utilisateurs
- **Quotas** : 100 risques/mois, 12 exports/an, 200 actions/mois, 100 observations/mois, 5 imports/mois
- **IA** : 
  - ✅ 50 suggestions de risques/mois
  - ✅ Reformulation illimitée (300/jour technique)
  - ❌ Pas de suggestions d'actions
- **Exports** : PDF + **Word** + **Excel**
- **Import** : ✅ Extraction IA basique
- **API** : ✅ Oui
- **Support** : Email 24h
- **🎯 Différenciateur** : IA assistive + Import + API

### EXPERT (149€/mois)
- **Méthodes** : Générique + INRS
- **Structure** : ♾️ **Tout illimité**
- **Quotas** : ♾️ **Tout illimité**
- **IA** :
  - ✅ 200 suggestions de risques/mois
  - ✅ 50 suggestions d'actions/mois
  - ✅ Reformulation illimitée
- **Exports** : PDF + Word + Excel
- **Import** : ✅ Extraction IA avancée
- **API** : ✅ Oui
- **Multi-tenant** : ✅ Oui
- **Support** : Email 8h + **Chat**
- **🎯 Différenciateur** : Illimité + IA avancée + Support prioritaire

---

## 📝 Fichiers Mis à Jour

### Code Source
- ✅ `lib/plans.ts` - Configuration centrale (source de vérité)
- ✅ `prisma/schema.prisma` - Commentaire plan mis à jour
- ✅ `components/dashboard/sidebar-new.tsx` - Import DUERP → plan PRO
- ✅ `server/services/email/templates.ts` - planRequired mis à jour

### Documentation
- ✅ `GRILLE_TARIFAIRE_V2_RESUME.md` - Grille complète mise à jour
- ✅ `AJUSTEMENTS_PRICING_V1.1.md` - Détails des plans
- ✅ `SPECIFICATION_PLANS_TARIFAIRES.md` - Spécifications officielles
- ✅ `IMPLEMENTATION_PLANS.md` - Guide d'implémentation
- ✅ `PLANS_COHERENCE_2026.md` - Ce document (nouveau)

---

## 🔄 Changements Effectués

### Renommage
- **STARTER** → **ESSENTIEL** dans tous les fichiers

### Ajustements de Prix
- ESSENTIEL : 29€/mois (au lieu de 99€ pour STARTER)
- PRO : 79€/mois (au lieu de 249€)
- EXPERT : 149€/mois (au lieu de 599€)

### Ajustements de Fonctionnalités
- **ESSENTIEL** : 
  - Accès à la méthode INRS (10 unités de travail)
  - ❌ Aucune IA (volontaire pour contrôler les coûts)
  - ❌ Pas d'import
- **PRO** :
  - Import DUERP disponible (5/mois)
  - IA : 50 suggestions de risques/mois
- **EXPERT** :
  - Tout illimité
  - IA avancée : 200 suggestions risques + 50 actions/mois

---

## ✅ Cohérence Vérifiée

### Prix
- ✅ Tous les fichiers utilisent les mêmes prix
- ✅ Pas de réduction annuelle (monthly × 10 = annual)

### Fonctionnalités
- ✅ Méthode INRS disponible dès ESSENTIEL
- ✅ IA disponible à partir de PRO uniquement
- ✅ Import disponible à partir de PRO uniquement
- ✅ Multi-tenant uniquement en EXPERT

### Nomenclature
- ✅ Utilisation cohérente de "ESSENTIEL" (pas "STARTER")
- ✅ Plans : FREE, ESSENTIEL, PRO, EXPERT

---

## 🎯 Positionnement Marketing

### FREE → ESSENTIEL
**Message** : "Passez à ESSENTIEL pour accéder à la méthode INRS structurée et créer jusqu'à 10 unités de travail"

### ESSENTIEL → PRO
**Message** : "Passez à PRO pour bénéficier de l'IA (50 suggestions/mois), importer vos DUERP existants et accéder à l'API"

### PRO → EXPERT
**Message** : "Passez à EXPERT pour des limites illimitées, l'IA avancée (suggestions d'actions) et le support prioritaire"

---

## 📊 Comparaison Rapide

| Fonctionnalité | FREE | ESSENTIEL | PRO | EXPERT |
|----------------|------|-----------|-----|--------|
| **Prix** | 0€ | 29€ | 79€ | 149€ |
| **Méthode INRS** | ❌ | ✅ | ✅ | ✅ |
| **Unités de travail** | 3 | 10 | 50 | ∞ |
| **IA** | ❌ | ❌ | ✅ | ✅✅ |
| **Import** | ❌ | ❌ | ✅ | ✅ |
| **Export Word/Excel** | ❌ | ❌ | ✅ | ✅ |
| **API** | ❌ | ❌ | ✅ | ✅ |
| **Multi-tenant** | ❌ | ❌ | ❌ | ✅ |
| **Support Chat** | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Prochaines Étapes

### À Faire
1. ✅ Mettre à jour tous les fichiers markdown
2. ✅ Vérifier la cohérence du code
3. ⏳ Tester les limites de chaque plan
4. ⏳ Mettre à jour la page de pricing (si elle existe)
5. ⏳ Mettre à jour les emails marketing

### Tests Recommandés
1. Créer un utilisateur FREE et vérifier les blocages
2. Créer un utilisateur ESSENTIEL et vérifier l'accès INRS sans IA
3. Créer un utilisateur PRO et vérifier l'IA + Import
4. Créer un utilisateur EXPERT et vérifier l'illimité

---

**Dernière mise à jour :** Janvier 2026  
**Maintenu par :** Équipe DUERPilot  
**Source de vérité :** `lib/plans.ts`
