# Résumé des Changements - Plans Tarifaires 2026

**Date :** Janvier 2026  
**Version :** 2.0  
**Statut :** ✅ Implémenté dans le code

---

## 🎯 Changements Principaux

### 1. Migration Majeure : Renommage et Nouveaux Prix

**Renommage des plans (breaking change) :**
- `essentiel` → `starter` (29€ → 59€, +103%)
- `pro` → `business` (79€ → 149€, +89%)
- `expert` → `premium` (149€ → 349€, +134%)
- `free` et `entreprise` inchangés

**Justifications des hausses :**
- **STARTER** : Méthode INRS reconnue, conservation 40 ans, rappels automatiques
- **BUSINESS** : IA guidée (gain 60-80%), quotas généreux, import/export avancés
- **PREMIUM** : PAPRIPACT obligatoire, IA avancée, multi-sites, audits internes

### 2. Nouveaux Quotas Massifs (PATCH_QUOTAS_PLANS.md)

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

### 3. Nouveau Plan ENTREPRISE

**Ajout d'un 5ème plan :**
- **Cible :** Groupes 250+ salariés, besoins sur mesure
- **Prix :** Sur devis
- **Différenciateur :** Solution 100% personnalisée

**Fonctionnalités exclusives :**
- SSO / LDAP
- White-label
- Intégrations ERP
- Account Manager dédié
- SLA 2h
- Formation personnalisée
- Hébergement dédié (optionnel)

---

### 4. Plan PREMIUM - Limites Réalistes (ex EXPERT)

**Changement de philosophie :**
- ❌ Avant : Limites "illimitées" (Infinity)
- ✅ Après : Limites généreuses mais réalistes

**Nouvelles limites PREMIUM :**

| Dimension | Avant | Après | Rationale |
|-----------|-------|-------|-----------|
| Entreprises | ♾️ | **10** | PME multi-sites |
| Sites | ♾️ | **20** | Organisations complexes |
| Unités de travail | ♾️ | **200** | PME 100-250 salariés |
| Utilisateurs | ♾️ | **30** | Équipes QSE + managers |
| Risques/mois | ♾️ | **500** | Révision complète possible |
| Exports/an | ♾️ | **50** | Usage professionnel normal |
| Imports/mois | ♾️ | **20** | Migration + mises à jour |

**Pourquoi ce changement ?**
1. **Transparence :** Limites claires et prévisibles
2. **Viabilité économique :** Coûts maîtrisés (IA, infrastructure)
3. **Conformité juridique :** Pas d'illimité trompeur
4. **Qualification commerciale :** Chemin clair vers ENTREPRISE
5. **Couverture réelle :** 95% des PME de 100-250 salariés

---

### 5. Parcours d'Upgrade Complet

**Nouveau parcours :**

```
FREE (0€)
  ↓ Méthode INRS
STARTER (59€)
  ↓ IA + Import + API
BUSINESS (149€)
  ↓ Scale + IA avancée + PAPRIPACT
PREMIUM (349€)
  ↓ Custom + Accompagnement
ENTREPRISE (Sur devis)
```

**Messages d'upgrade contextuels :**
- Déclencheurs automatiques selon les dépassements
- CTAs adaptés à chaque situation
- Formulaire de contact ENTREPRISE dédié

---

## 📊 Tableau Comparatif Avant/Après

### Plan FREE (inchangé)
| Dimension | Valeur |
|-----------|--------|
| Prix | 0€/mois |
| Unités de travail | 3 |
| Utilisateurs | 1 |
| Méthode INRS | ❌ |
| IA | ❌ |

### Plan STARTER (ex ESSENTIEL - modifié)
| Dimension | Avant | Après |
|-----------|-------|-------|
| Prix | 29€/mois | **59€/mois** (+103%) |
| Risques/mois | 20 | **30** |
| Exports/an | 2 | **3** |
| Plans d'action/mois | 30 | **150** (+400%) |
| Observations/mois | 20 | **300** (+1400%) |
| Unités de travail | 10 | 10 |
| Utilisateurs | 3 | 3 |
| Méthode INRS | ✅ | ✅ |
| IA | ❌ | ❌ |

### Plan BUSINESS (ex PRO - modifié)
| Dimension | Avant | Après |
|-----------|-------|-------|
| Prix | 79€/mois | **149€/mois** (+89%) |
| Risques/mois | 100 | **150** |
| Exports/an | 12 | **24** |
| Imports/mois | 5 | **10** |
| Plans d'action/mois | 200 | **600** (+200%) |
| Observations/mois | 100 | **1000** (+900%) |
| Suggestions IA risques | 50 | **100** |
| Unités de travail | 50 | 50 |
| Utilisateurs | 10 | 10 |
| IA | ✅ | ✅ |
| Import | ✅ | ✅ |
| API | ✅ | ✅ |

### Plan PREMIUM (ex EXPERT - modifié)
| Dimension | Avant | Après |
|-----------|-------|-------|
| Prix | 149€/mois | **349€/mois** (+134%) |
| Unités de travail | ♾️ | **200** |
| Utilisateurs | ♾️ | **30** |
| Entreprises | ♾️ | **10** |
| Sites | ♾️ | **20** |
| Risques/mois | ♾️ | **500** |
| Exports/an | ♾️ | **100** |
| Imports/mois | ♾️ | **30** |
| Plans d'action/mois | 1000 | **2000** (+100%) |
| Observations/mois | 500 | **3000** (+500%) |
| Suggestions IA risques | 200 | **300** |
| Suggestions IA actions | 50 | **100** |
| IA avancée | ✅ | ✅ |
| Multi-tenant | ✅ | ✅ |
| Support Chat | ✅ | ✅ |
| PAPRIPACT | ❌ | **✅** 🆕 |
| Audits internes | ❌ | **✅** 🆕 |

### Plan ENTREPRISE (nouveau)
| Dimension | Valeur |
|-----------|--------|
| Prix | Sur devis |
| Toutes les limites | **Sur mesure** |
| SSO / LDAP | ✅ |
| White-label | ✅ |
| Intégrations ERP | ✅ |
| Account Manager | ✅ |
| SLA | 2h |
| Formation | ✅ |

---

## 💰 Impact Commercial

### Positionnement Tarifaire

**Grille actuelle (v2.0) :**
- FREE : 0€
- STARTER : 59€ (+59€, +103% vs ancien ESSENTIEL)
- BUSINESS : 149€ (+90€, +89% vs ancien PRO)
- PREMIUM : 349€ (+200€, +134% vs ancien EXPERT)
- ENTREPRISE : Sur devis (min. 500€)

**Ratios :**
- STARTER = FREE × ∞ (valeur ajoutée INRS)
- BUSINESS = STARTER × 2,5 (IA + Import + API)
- PREMIUM = BUSINESS × 2,3 (Scale + IA avancée + PAPRIPACT)
- ENTREPRISE = PREMIUM × 1,5+ (Custom)

### Qualification des Leads

**Critères pour ENTREPRISE :**
- Volume > limites PREMIUM (200 unités, 30 users, etc.)
- Besoins spécifiques (SSO, white-label, ERP)
- Budget > 300€/mois
- Décideur identifié
- Timing < 6 mois

**Processus de vente :**
1. Contact initial (24h)
2. RDV découverte (30 min)
3. Audit & cadrage (1-2 semaines)
4. Proposition commerciale
5. Négociation & closing (2-4 semaines)
6. Mise en œuvre (6-12 semaines)

---

## 🔧 Implémentation Technique

### Fichiers Modifiés

**Code :**
- ✅ `lib/plans.ts` : Migration complète v2.0 (renommage, nouveaux quotas, nouveaux prix)
- ✅ `types/index.ts` : Type Plan mis à jour
- ✅ Tous les routers tRPC : Enum et références mis à jour
- ✅ Tous les composants frontend : Noms et prix mis à jour
- ✅ Scripts de migration BDD créés
- ✅ `prisma/schema.prisma` : Commentaires mis à jour
- ✅ `README.md` : Tableau des plans
- ✅ `docs/architecture/README.md` : Référence aux plans

**Documentation :**
- ✅ `docs/plans-tarifs/README.md` : Documentation complète
- ✅ `docs/plans-tarifs/CHANGELOG.md` : Historique des changements
- ✅ `docs/plans-tarifs/JURIDIQUE_ET_COMMERCIAL.md` : Clauses CGU + processus commercial
- ✅ `docs/plans-tarifs/IMPLEMENTATION_TECHNIQUE.md` : Guide d'implémentation

### Prochaines Étapes Techniques

**Backend :**
- [ ] Middlewares de vérification des limites
- [ ] Service de monitoring des quotas
- [ ] Notifications de dépassement
- [ ] API de gestion des plans

**Frontend :**
- [ ] Composants UI (indicateurs, dialogs, blocages)
- [ ] Page de gestion du plan
- [ ] Formulaire de contact ENTREPRISE

**Commercial :**
- [ ] Page publique des plans
- [ ] Emails transactionnels
- [ ] CRM pour leads ENTREPRISE

---

## 📋 Checklist de Validation

### ✅ Complété

- [x] Définition de la stratégie tarifaire
- [x] Dimensionnement des limites EXPERT
- [x] Création du plan ENTREPRISE
- [x] Mise à jour du code (`lib/plans.ts`)
- [x] Mise à jour du schéma Prisma
- [x] Documentation complète
- [x] Clauses juridiques (CGU)
- [x] Processus commercial
- [x] Grille tarifaire interne ENTREPRISE

### 🔲 À Faire

**Technique :**
- [ ] Implémenter les vérifications de limites
- [ ] Créer le service de monitoring
- [ ] Développer les composants UI
- [ ] Créer les pages (plan, contact ENTREPRISE)
- [ ] Tests unitaires et d'intégration

**Commercial :**
- [ ] Créer la page publique des plans
- [ ] Configurer l'email sales@duerpilot.fr
- [ ] Créer le pitch deck ENTREPRISE
- [ ] Former l'équipe sales

**Juridique :**
- [ ] Mettre à jour les CGU officielles
- [ ] Créer le template de contrat ENTREPRISE
- [ ] Validation avocat (optionnel)

**Marketing :**
- [ ] Annoncer les changements (blog, newsletter)
- [ ] Mettre à jour le site web
- [ ] Créer les assets (infographies, comparatifs)

---

## 🎯 Objectifs et KPIs

### Objectifs Q1 2026

**Acquisition :**
- 5-10 leads ENTREPRISE/mois
- Taux de conversion lead → client : 50%
- 2-3 clients ENTREPRISE signés

**Revenus :**
- MRR ENTREPRISE : 1500€ (3 clients × 500€)
- ACV moyen : 6000€

**Satisfaction :**
- NPS > 50
- Taux de renouvellement > 90%

### KPIs à Suivre

**Par Plan :**
- Nombre d'utilisateurs par plan
- Taux de conversion entre plans
- Churn rate par plan
- MRR par plan

**Quotas :**
- % d'utilisateurs approchant les limites (80%+)
- Nombre de dépassements/mois
- Taux de conversion après dépassement

**ENTREPRISE :**
- Leads qualifiés/mois
- Temps de closing moyen
- ACV moyen
- Taux de renouvellement

---

## ❓ FAQ - Changements

### "Pourquoi renommer les plans ?"

Le renommage permet de :
1. **Mieux positionner** chaque plan (STARTER = TPE conforme, BUSINESS = PME avec IA, PREMIUM = PME structurée)
2. **Justifier les hausses de prix** avec de nouveaux noms
3. **Clarifier la proposition de valeur** pour chaque segment
4. **Éviter la confusion** avec les anciens prix

### "Que se passe-t-il pour les clients actuels ?"

**Migration automatique :**
- Les clients `essentiel` → `starter` (migration BDD)
- Les clients `pro` → `business` (migration BDD)
- Les clients `expert` → `premium` (migration BDD)
- **Nouveaux prix appliqués** selon la nouvelle grille
- **Nouveaux quotas bénéficiés** automatiquement

**Communication :**
- Email de préavis 30 jours avant application des nouveaux prix
- Explication des hausses et justifications
- Proposition d'upgrade si besoin

### "Pourquoi augmenter les prix de 89% à 134% ?"

Les hausses reflètent :
1. **Valeur réelle** : Méthode INRS, IA guidée, PAPRIPACT
2. **Coûts IA** : Quotas généreux nécessitent une tarification juste
3. **Positionnement marché** : Solution premium vs concurrents
4. **ROI client** : Économie de 200-700€ vs consultant (STARTER)
5. **Investissement** : Développement continu, support qualité, conformité réglementaire

### "Comment est tarifé le plan ENTREPRISE ?"

**Tarification sur mesure :**
- Base : 1,5× plan PREMIUM (500€ minimum)
- + Volume supplémentaire (unités, users, sites)
- + Fonctionnalités custom (SSO, white-label, etc.)
- + Accompagnement (Account Manager, formation)

**Exemples :**
- 500 unités, 50 users : ~850€/mois
- White-label pour consultant : ~600€/mois
- Groupe industriel 1000 salariés : ~2000€/mois

### "Peut-on négocier les limites du plan PREMIUM ?"

Non, les limites du plan PREMIUM sont fixes. Pour des besoins supérieurs, le plan ENTREPRISE offre une flexibilité totale avec une tarification adaptée.

---

## 📞 Contact

**Questions techniques :**
- dev@duerpilot.fr

**Questions commerciales :**
- sales@duerpilot.fr

**Demande de devis ENTREPRISE :**
- https://duerpilot.fr/contact/enterprise
- sales@duerpilot.fr

---

**Dernière mise à jour :** Janvier 2026  
**Maintenu par :** Équipe DUERPilot  
**Version :** 2.0
