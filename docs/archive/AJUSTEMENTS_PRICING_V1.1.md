# 🎯 Pricing Actuel - Plans Tarifaires

**Date :** Janvier 2026  
**Statut :** ✅ IMPLÉMENTÉ dans `lib/plans.ts`

---

## Plans et Tarifs Actuels

| Plan | Prix mensuel | Prix annuel | Cible |
|------|--------------|-------------|-------|
| **FREE** | 0€ | 0€ | Découverte (1-5 salariés) |
| **ESSENTIEL** | 29€ | 290€ | TPE (5-20 salariés) |
| **PRO** | 79€ | 790€ | PME/Consultants (20-100 salariés) |
| **EXPERT** | 149€ | 1490€ | PME structurées (100+ salariés) |

**Note :** Pas de réduction annuelle actuellement (monthly × 10 mois = annuel)

---

## Détail des Plans

### Plan FREE (0€/mois)

**Fonctionnalités :**
- 1 entreprise, 1 site, 3 unités de travail
- 1 utilisateur
- Méthode générique uniquement
- 5 risques/mois
- 1 export DUERP/an
- 10 plans d'action/mois
- 5 observations/mois
- ❌ Aucune IA
- Support email 72h

**Cible :** Découverte du DUERP, TPE 1-5 salariés

---

### Plan ESSENTIEL (29€/mois)

**Fonctionnalités :**
- 1 entreprise, 1 site, 10 unités de travail
- 3 utilisateurs
- Méthode générique + INRS
- 20 risques/mois
- 2 exports DUERP/an
- 30 plans d'action/mois
- 20 observations/mois
- ❌ Aucune IA (volontaire)
- Support email 48h

**Cible :** TPE 5-20 salariés, besoin de structuration INRS

**Différenciateur :** Accès à la méthode INRS structurée

---

### Plan PRO (79€/mois)

**Fonctionnalités :**
- 3 entreprises, 5 sites, 50 unités de travail
- 10 utilisateurs
- Méthode générique + INRS
- 100 risques/mois
- 12 exports DUERP/an
- 200 plans d'action/mois
- 100 observations/mois
- 5 imports/mois
- ✅ IA : 50 suggestions de risques/mois + Reformulation illimitée
- Exports : PDF + Word + Excel
- API REST
- Support email 24h

**Cible :** PME 20-100 salariés, consultants

**Différenciateur :** IA assistive + Import + API

---

### Plan EXPERT (149€/mois)

**Fonctionnalités :**
- ♾️ Tout illimité (entreprises, sites, unités, utilisateurs, risques, exports, imports)
- Méthode générique + INRS
- ✅ IA avancée :
  - 200 suggestions de risques/mois
  - 50 suggestions d'actions/mois
  - Reformulation illimitée
- Exports : PDF + Word + Excel
- API REST
- Multi-tenant
- Support email 8h + Chat

**Cible :** PME structurées 100+ salariés, groupes

**Différenciateur :** Illimité + IA avancée + Support prioritaire

---

## Fichiers modifiés

### Code
- ✅ `lib/plans.ts` : Mise à jour `PLAN_FEATURES` et `PLAN_PRICES`

### Documentation
- ✅ `STRATEGIE_PRICING_SAAS.md` : Mise à jour des prix et limites
- ✅ `SPECIFICATION_PLANS_TARIFAIRES.md` : Mise à jour version 1.1

---

## Validation

**Ces ajustements ont été validés et implémentés le :** Janvier 2026

**Prochaine révision :** Après 3 mois de production (analyse conversion réelle)

---

## Notes importantes

1. **Plan STARTER** : Le test A/B 69€ vs 99€ n'est pas encore implémenté. À décider après analyse des conversions.

2. **Plan EXPERT** : L'alternative (499€ avec IA limitée à 300) a été choisie plutôt que 599€ avec IA illimitée.

3. **Plan FREE** : La réduction de 10 à 5 évaluations doit être communiquée clairement aux utilisateurs existants.

