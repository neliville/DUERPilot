# 🎯 Ajustements Pricing v1.1

**Date :** Janvier 2026  
**Statut :** ✅ IMPLÉMENTÉ

---

## Résumé des changements

| Plan | Avant | Après | Raison |
|------|-------|-------|--------|
| **FREE** | 10 éval/mois | **5 éval/mois** | Pousser conversion vers Starter plus rapidement |
| **STARTER** | 99€/mois | **99€/mois** | Test A/B possible avec 69€/mois (à décider après 3 mois) |
| **PRO** | 249€/mois | **249€/mois** | ✅ Prix cohérent pour PME structurées + coûts IA |
| **EXPERT** | 499€/mois, 200 IA | **599€/mois, 300 IA** | Marge positive indispensable |

---

## Détail des ajustements

### Plan FREE

**Changement :**
- `maxRisksPerMonth` : 20 → **5**

**Raison :**
- Pousser la conversion vers Starter plus rapidement
- Limite plus restrictive incite à l'upgrade
- 5 évaluations suffisantes pour démontrer la valeur

**Impact :**
- Notification d'upsell à 4/5 évaluations utilisées
- Message de conversion plus précoce

---

### Plan STARTER

**Changement :**
- Prix : **99€/mois** (inchangé pour l'instant)
- **Note :** Test A/B recommandé avec 69€/mois pendant 3 mois

**Raison :**
- Mesurer la sensibilité au prix des TPE 10-50 salariés
- Décision finale basée sur la meilleure conversion

**Implémentation :**
- Prix actuel : 99€/mois
- Test A/B : À implémenter ultérieurement si décidé

---

### Plan PRO

**Changement :**
- **Aucun changement** - Prix maintenu à 249€/mois

**Raison :**
- Prix cohérent pour PME structurées
- Couvre les coûts IA (40-60 appels/mois)
- Marge acceptable

---

### Plan EXPERT

**Changement :**
- Prix : 499€ → **599€/mois** (+100€)
- IA : 200 → **300 appels/mois** (limité pour marge positive)

**Raison :**
- Marge négative de -200€/mois à 499€
- Augmentation à 599€ + limitation IA à 300 = marge positive
- Alternative : Garder 499€ mais limiter IA à 300 (choix actuel)

**Impact financier :**
- Coût IA : ~500€/mois (300 suggestions × 0,50€ + structurations + mesures)
- Prix : 599€/mois
- Marge nette : ~0€/mois (équilibrée)

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

