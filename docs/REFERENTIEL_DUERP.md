# Référentiel DUERP Propriétaire - Documentation Technique

## Vue d'ensemble

DUERPilot utilise un référentiel DUERP propriétaire, réglementairement cohérent, modulaire et évolutif, conforme au Code du travail français (Articles R4121-1 à R4121-4).

**Position juridique** :
- Indépendant d'OiRA
- Contenu propriétaire
- IA non certifiante (assistante uniquement)
- Conforme au Code du travail français

## Structure du référentiel

### 1. Secteurs d'activité (ActivitySector)

Les secteurs d'activité permettent de suggérer des situations dangereuses pertinentes selon le secteur de l'entreprise.

**Caractéristiques** :
- Code unique (ex: "BTP", "RESTO", "BUREAU")
- Libellé (ex: "Bâtiment et travaux publics")
- Description optionnelle
- Secteurs globaux (tenantId = null) ou personnalisés par tenant
- Possibilité pour chaque tenant de créer ses propres secteurs

**Utilisation** :
- Suggestion automatique de situations dangereuses selon le secteur
- Pré-filtrage des catégories de dangers pertinentes
- Personnalisation par entreprise/tenant

### 2. Catégories de dangers (DangerCategory)

9 catégories de dangers définies selon le référentiel réglementaire :

1. **PHY** - Physiques
2. **CHI** - Chimiques
3. **BIO** - Biologiques
4. **ERG** - Ergonomiques
5. **PSY** - Psychosociaux
6. **MEC** - Mécaniques
7. **ELEC** - Électriques
8. **INC** - Incendie
9. **ORG** - Organisationnels

**Caractéristiques** :
- Code unique (3 lettres)
- Libellé descriptif
- Ordre d'affichage

**Utilisation** :
- Classification des situations dangereuses
- Filtrage et recherche
- Organisation du DUERP généré

### 3. Situations dangereuses (DangerousSituation)

Situations dangereuses types par catégorie. Permettent d'identifier les risques spécifiques.

**Caractéristiques** :
- Code unique (ex: "PHY_001_BRUIT")
- Libellé (ex: "Exposition au bruit")
- Description neutre et compréhensible
- Exemples concrets
- Mots-clés pour recherche
- Secteur suggéré (optionnel)
- Obligatoire réglementairement (flag `mandatory`)
- Situations globales ou personnalisées par tenant

**Utilisation** :
- Identification des risques dans les unités de travail
- Suggestions basées sur le secteur
- Recherche par mots-clés
- Possibilité d'ajouter ses propres situations

### 4. Mesures de prévention (PreventionMeasure)

Mesures de prévention liées à une évaluation de risque spécifique.

**Caractéristiques** :
- Type : technique, organisationnelle, humaine, collective, individuelle
- Description détaillée
- Mesure existante ou à mettre en place
- Efficacité estimée (1-4)
- Priorité (basse, moyenne, haute, critique)
- Suggérée par IA (flag `aiSuggested`)

**Utilisation** :
- Documentation des mesures de prévention
- Plan d'actions lié aux mesures
- Traçabilité des mesures suggérées vs validées

## Flux d'évaluation des risques

### Processus standard

1. **Sélection du secteur d'activité** (pour l'unité de travail)
   - Secteur suggéré automatiquement selon l'activité de l'entreprise
   - Possibilité de modifier/ajouter son propre secteur

2. **Identification des situations dangereuses**
   - Suggestions basées sur le secteur
   - Recherche par catégorie ou mots-clés
   - Possibilité d'ajouter ses propres situations

3. **Évaluation contextualisée du risque**
   - Description contextualisée par l'utilisateur
   - Cotation : Fréquence (F) × Probabilité (P) × Gravité (G)
   - Score de risque calculé : F × P × G
   - Niveau de priorité : faible, à améliorer, prioritaire

4. **Définition des mesures de prévention**
   - Suggestions IA possibles (non décisionnaires)
   - Mesures existantes ou à mettre en place
   - Type et efficacité estimée

5. **Plan d'actions**
   - Actions liées aux mesures de prévention
   - Responsables et échéances
   - Suivi de l'avancement

6. **Génération du DUERP**
   - Snapshot de toutes les évaluations
   - Versioning annuel
   - Génération PDF avec conformité réglementaire

## Calcul du risque

**Formule** : Score = Fréquence × Probabilité × Gravité

**Sans maîtrise** : La maîtrise (M) n'est pas utilisée dans le calcul initial du score, conformément au référentiel DUERP propriétaire. Elle est utilisée pour déterminer les mesures de prévention nécessaires.

**Niveaux de priorité** :
- **Faible** : Score ≤ 8
- **À améliorer** : Score 9-32
- **Prioritaire** : Score > 32

## Rôle de l'IA (Assistant uniquement)

### Ce que l'IA peut faire

- ✅ Suggérer des situations dangereuses fréquentes pour un secteur
- ✅ Reformuler des descriptions pour plus de clarté
- ✅ Proposer des mesures de prévention adaptées
- ✅ Détecter des incohérences (ex: gravité élevée sans action)
- ✅ Générer des résumés DUERP

### Ce que l'IA ne doit JAMAIS faire

- ❌ Certifier la conformité
- ❌ Décider du niveau de risque
- ❌ Imposer des mesures
- ❌ Remplacer l'analyse humaine
- ❌ Valider sans contrôle utilisateur

**Principe fondamental** : Le système propose, l'utilisateur décide, l'IA assiste mais ne valide jamais.

## Conformité réglementaire

### Base légale

- Code du travail - Articles R4121-1 à R4121-4 (DUERP)
- Articles L4121-1 à L4121-5 (principes généraux de prévention)
- Circulaire DRT n°6 du 18 avril 2002
- Jurisprudence constante (obligation de moyens renforcée)

### Exigences respectées

- ✅ Identification de tous les risques (mais pas de liste exhaustive de situations)
- ✅ Évaluation documentée et justifiable
- ✅ Mise à jour annuelle minimale + changements significatifs
- ✅ Conservation recommandée : 40 ans (AT/MP)
- ✅ Traçabilité complète (source, validateur, date)

## Multi-tenant

Le référentiel supporte la personnalisation par tenant :
- Secteurs d'activité personnalisés
- Situations dangereuses personnalisées
- Référentiel global accessible à tous

## Versioning et historique

- Snapshot complet à chaque génération DUERP
- Versioning annuel avec numéro de version
- Historique légal complet pour traçabilité
- Conservation 40 ans recommandée pour AT/MP

## Migration depuis OiRA

**Note importante** : Le référentiel OiRA a été complètement supprimé. Le nouveau référentiel est indépendant et propriétaire.

Voir [docs/MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) pour les détails techniques de migration.

