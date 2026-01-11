# DUERPilot — Référentiel réglementaire & fonctionnel (Base propriétaire)

## 1. Cadre réglementaire de référence (France)

### Textes principaux
- Code du travail — Article R4121-1 à R4121-4 (DUERP)
- Article L4121-1 à L4121-5 (principes généraux de prévention)
- Circulaire DRT n°6 du 18 avril 2002
- Jurisprudence constante (obligation de moyens renforcée)

### Exigences clés
- Identification de tous les risques
- Évaluation documentée
- Mise à jour annuelle minimale
- Mise à jour lors de tout changement significatif
- Conservation recommandée : 40 ans (AT/MP)

---

## 2. Structure canonique DUERP (indépendante OiRA)

### Table : secteurs_activite
| champ | description |
|------|-------------|
| id | identifiant |
| code | code interne |
| libelle | ex : Bureau |
| description | périmètre |
| actif | bool |

---

### Table : unites_travail
| champ | description |
|------|-------------|
| id | identifiant |
| secteur_id | lien secteur |
| libelle | ex : Open space |
| description | contexte |
| personnalisable | oui/non |

---

### Table : categories_danger
| id | code | libelle |
|----|------|---------|
| 1 | PHY | Physiques |
| 2 | CHI | Chimiques |
| 3 | BIO | Biologiques |
| 4 | ERG | Ergonomiques |
| 5 | PSY | Psychosociaux |
| 6 | MEC | Mécaniques |
| 7 | ELEC | Électriques |
| 8 | INC | Incendie |
| 9 | ORG | Organisationnels |

---

### Table : situations_dangereuses
| champ | description |
|------|-------------|
| id | identifiant |
| categorie_id | lien |
| libelle | situation |
| description | neutre |
| secteur_suggere | optionnel |
| obligatoire | non |

---

### Table : risques
| champ | description |
|------|-------------|
| id | identifiant |
| unite_travail_id | lien |
| situation_id | lien |
| description | contextualisation |
| gravite | 1–4 |
| probabilite | 1–4 |
| niveau_risque | calcul |
| source | auto/man |
| actif | bool |

---

### Table : mesures_prevention
| champ | description |
|------|-------------|
| id | identifiant |
| risque_id | lien |
| type | technique/org |
| description | mesure |
| existante | oui/non |

---

### Table : actions
| champ | description |
|------|-------------|
| id | identifiant |
| mesure_id | lien |
| responsable | texte |
| echeance | date |
| statut | ouvert/clos |

---

## 3. Mapping sectoriel (suggestion)

- Secteur suggère, utilisateur décide
- Ajout libre toujours possible

---

## 4. UX recommandée

1. Secteur
2. Unités
3. Suggestions
4. Ajout libre
5. Cotation
6. Mesures
7. Actions
8. DUERP
9. Historique

---

## 5. IA (assistant)

- Suggestions
- Reformulation
- Détection incohérences
- Résumés

Jamais décisionnaire.

---

## 6. Position juridique

- Indépendant OiRA
- Contenu propriétaire
- IA non certifiante

---

## 7. Implémentation technique

### Schéma Prisma

Le référentiel propriétaire est implémenté avec les modèles suivants :

- `ActivitySector` : Secteurs d'activité (BTP, Restauration, Bureau, etc.)
- `DangerCategory` : 9 catégories de dangers (PHY, CHI, BIO, ERG, PSY, MEC, ELEC, INC, ORG)
- `DangerousSituation` : Situations dangereuses types par catégorie
- `PreventionMeasure` : Mesures de prévention liées aux évaluations de risques

### Calcul du risque

**Formule** : Score = Fréquence × Probabilité × Gravité (F × P × G)

**Niveaux de priorité** :
- Faible : Score ≤ 8
- À améliorer : Score 9-32
- Prioritaire : Score > 32

**Note importante** : La maîtrise (M) n'est pas utilisée dans le calcul initial du score selon le référentiel DUERP propriétaire. Elle est utilisée pour déterminer les mesures de prévention nécessaires.

### Routers tRPC

Le référentiel expose les routers suivants :

- `activitySectors` : Gestion des secteurs d'activité (CRUD + suggestions)
- `dangerCategories` : Consultation des catégories de dangers
- `dangerousSituations` : Gestion des situations dangereuses (CRUD + recherche + suggestions)
- `preventionMeasures` : Gestion des mesures de prévention (CRUD + suggestions IA)

### Seeders

Les données initiales sont peuplées via les seeders dans `prisma/seeds/` :

- `danger-categories.ts` : 9 catégories de dangers
- `activity-sectors.ts` : ~10 secteurs d'activité principaux
- `dangerous-situations.ts` : ~30 situations dangereuses types par catégorie

### Documentation technique

Voir :
- [docs/REFERENTIEL_DUERP.md](./docs/REFERENTIEL_DUERP.md) - Documentation complète du référentiel
- [docs/MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md) - Guide de migration depuis OiRA

---

Fin du document
