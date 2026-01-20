# Changelog - Plans et Tarifs

Historique des modifications des plans tarifaires DUERPilot.

---

## [2.0] - Janvier 2026

### 🔄 Migration Majeure : Renommage et Nouveaux Prix

**Renommage des plans (breaking change) :**
- `essentiel` → `starter` (29€ → 59€, +103%)
- `pro` → `business` (79€ → 149€, +89%)
- `expert` → `premium` (149€ → 349€, +134%)
- `free` et `entreprise` inchangés

**Justifications des hausses :**
- **STARTER** : Méthode INRS reconnue, conservation 40 ans, rappels automatiques
- **BUSINESS** : IA guidée (gain 60-80%), quotas généreux, import/export avancés
- **PREMIUM** : PAPRIPACT obligatoire, IA avancée, multi-sites, audits internes

### 📊 Nouveaux Quotas Massifs (PATCH_QUOTAS_PLANS.md)

**Plans d'action :** Ratio 4-5× risques
- FREE: 10 → **25** (+150%)
- STARTER: 50 → **150** (+200%)
- BUSINESS: 300 → **600** (+100%)
- PREMIUM: 1000 → **2000** (+100%)

**Observations :** Ratio 6-10× risques
- FREE: 5 → **50** (+900%)
- STARTER: 20 → **300** (+1400%)
- BUSINESS: 100 → **1000** (+900%)
- PREMIUM: 500 → **3000** (+500%)

**Rationale :**
- 1 risque = 2-5 actions correctives (réalité terrain)
- Observations = remontées quotidiennes (culture sécurité)
- Pas de limitation artificielle sur l'essentiel
- Impact coûts : 0€ (stockage négligeable)

### ⬆️ Autres Améliorations

**Quotas IA augmentés :**
- BUSINESS : 100 suggestions risques/mois (était 50), 150 risques/mois (était 100)
- PREMIUM : 300 suggestions risques/mois (était 200), 100 suggestions actions/mois (était 50)

**Quotas structure augmentés :**
- STARTER : 30 risques/mois (était 20), 3 exports/an (était 2)
- BUSINESS : 24 exports/an (était 12), 10 imports/mois (était 5)
- PREMIUM : 100 exports/an (était 50), 30 imports/mois (était 20)

**Nouvelles fonctionnalités PREMIUM :**
- Module PAPRIPACT (obligatoire 50+ salariés)
- Audits internes avec checklists sectorielles
- Chat en ligne (support prioritaire)

### 📊 Impact

**Cibles mises à jour :**
- FREE : 1-5 salariés (inchangé)
- STARTER : **1-10 salariés** (était 5-20)
- BUSINESS : **11-50 salariés** (était 20-100)
- PREMIUM : **51-250 salariés** (était 100-250)
- ENTREPRISE : 250+ salariés (inchangé)

**Messages d'upgrade :**
- Tous les messages mis à jour avec nouveaux noms
- Parcours FREE → STARTER → BUSINESS → PREMIUM → ENTREPRISE
- Messages contextuels selon les dépassements de limites

### 🔧 Technique

**Fichiers modifiés :**
- `lib/plans.ts` : Renommage complet des plans, nouveaux quotas, nouveaux prix
- `types/index.ts` : Type Plan mis à jour
- Tous les routers tRPC : Enum et références mis à jour
- Tous les composants frontend : Noms et prix mis à jour
- `docs/plans-tarifs/README.md` : Documentation complète v2.0
- `docs/plans-tarifs/CHANGELOG.md` : Historique mis à jour

**Migration BDD requise :**
- Script `scripts/migrate-plans-v2.ts` créé
- Migration : `essentiel` → `starter`, `pro` → `business`, `expert` → `premium`

---

## [1.0] - Janvier 2026 (Archivé)

### ✨ Version Initiale (Avant Migration v2.0)

**Plans initiaux :**
- FREE (0€)
- ESSENTIEL (29€)
- PRO (79€)
- EXPERT (149€)

**Fonctionnalités :**
- Multi-tenancy
- Méthodes d'évaluation (Générique, INRS)
- IA assistive (PRO et EXPERT)
- Import DUERP (PRO et EXPERT)
- Exports avancés (PRO et EXPERT)
- API REST (PRO et EXPERT)

**Note :** Cette version a été migrée vers v2.0 en janvier 2026 avec renommage des plans et nouveaux quotas.

---

## Prochaines Évolutions Possibles

### Court Terme (Q1 2026)
- [ ] Implémentation des notifications de dépassement de limites
- [ ] Page de contact dédiée pour le plan ENTREPRISE
- [ ] Grille tarifaire interne pour le plan ENTREPRISE
- [ ] Processus de qualification des leads ENTREPRISE

### Moyen Terme (Q2 2026)
- [ ] Réduction annuelle (10 mois au lieu de 12)
- [ ] Offres spéciales pour consultants QSE
- [ ] Programme de parrainage

### Long Terme (Q3-Q4 2026)
- [ ] Plan intermédiaire entre PRO et EXPERT (si besoin)
- [ ] Options à la carte pour personnalisation
- [ ] Marketplace d'intégrations

---

**Dernière mise à jour :** Janvier 2026  
**Maintenu par :** Équipe DUERPilot
