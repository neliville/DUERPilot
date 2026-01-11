# Mapping NAF → Secteur d'Activité

## 🎯 Objectif

Proposer automatiquement un secteur d'activité principal à partir d'un code NAF pour :
- ✅ Accélérer l'onboarding
- ✅ Pré-charger des familles de dangers pertinentes
- ✅ Sans jamais verrouiller le choix utilisateur

⚠️ **Le code NAF est utilisé uniquement comme aide à la structuration, jamais comme validation réglementaire.**

## 📋 Principe fondamental

Le mapping NAF → secteur est :
- ✅ **Suggestif** : propose un secteur basé sur le code NAF
- ❌ **Non décisionnaire** : l'utilisateur peut toujours modifier ou ajouter plusieurs secteurs

L'utilisateur doit toujours pouvoir :
- Confirmer la suggestion
- Modifier le secteur proposé
- Ajouter plusieurs secteurs si nécessaire (multi-activités)

Le DUERP reste basé sur :
- Les unités de travail réelles
- Les situations de travail effectives

## 🏢 Secteurs fonctionnels disponibles

Ces secteurs sont des catégories fonctionnelles internes DUERPilot, non des référentiels officiels :

| Code | Libellé | Description |
|------|---------|-------------|
| `BTP` | Bâtiment et travaux publics | Construction, rénovation, travaux publics |
| `RESTO` | Restauration et hôtellerie | Restaurants, hôtels, traiteurs |
| `BUREAU` | Travail de bureau / tertiaire | Administratif, comptabilité, services |
| `COMMERCE` | Commerce de détail | Commerce de détail, gros, e-commerce |
| `SANTE` | Santé, médico-social | Hôpitaux, cliniques, EHPAD, soins à domicile |
| `INDUSTRIE` | Industrie manufacturière | Production, transformation, maintenance |
| `LOGISTIQUE` | Transport, entreposage, livraison | Transport, entreposage, livraison |
| `SERVICES` | Services à la personne | Coiffure, esthétique, ménage, garde d'enfants |
| `AGRICULTURE` | Agriculture, élevage | Exploitations agricoles, transformation alimentaire |
| `EDUCATION` | Enseignement, formation | Écoles, centres de formation, garderies |
| `GENERIQUE` | Référentiel transversal (fallback) | Risques transversaux applicables à tous les secteurs |

## 🔗 Mapping NAF → Secteur

### Règles de mapping (ordre d'évaluation)

1. **Division exacte** (prioritaire)
   - `56` → `RESTO`
   - `47` → `COMMERCE`
   - `87` ou `88` → `SERVICES`

2. **Section** (si pas de division)
   - `F` → `BTP`
   - `C` → `INDUSTRIE`
   - `Q` → `SANTE`
   - `H` → `LOGISTIQUE`
   - `A` → `AGRICULTURE`
   - `P` → `EDUCATION`
   - `K`, `L`, `M`, `N` → `BUREAU`

3. **Fallback**
   - Code non reconnu → `GENERIQUE`

### Exemples de mapping

```typescript
getSecteurFromNAF("F")        // "BTP"
getSecteurFromNAF("F43")      // "BTP"
getSecteurFromNAF("43.99Z")   // "BTP" (car section F)

getSecteurFromNAF("56.10A")   // "RESTO"
getSecteurFromNAF("5610A")    // "RESTO"

getSecteurFromNAF("K64")      // "BUREAU"
getSecteurFromNAF("M75")      // "BUREAU"

getSecteurFromNAF("47.11A")   // "COMMERCE"
getSecteurFromNAF("Q86")      // "SANTE"

getSecteurFromNAF("87.10A")   // "SERVICES"
getSecteurFromNAF("88")       // "SERVICES"

getSecteurFromNAF("12345")    // "GENERIQUE"
getSecteurFromNAF("")         // "GENERIQUE"
```

## 💻 Implémentation technique

### Module de mapping

**Fichier** : `lib/naf-sector-mapping.ts`

**Fonctions principales** :
- `getSecteurFromNAF(codeNAF: string): string` - Map un code NAF vers un secteur
- `extractNAFFromSIRET(siret: string): string | null` - Extrait le code NAF d'un SIRET
- `getSecteurFromSIRET(siret: string): string` - Map un SIRET vers un secteur

### Formats d'entrée gérés

La fonction `getSecteurFromNAF` gère tous ces formats :
- `"F"` (section seule)
- `"47"` (division)
- `"47.11"` ou `"4711"` (division + sous-division)
- `"47.11A"` ou `"4711A"` (code complet)
- Avec ou sans espaces, points, majuscules/minuscules

### Traitement des valeurs invalides

- Chaîne vide → `"GENERIQUE"`
- Code non reconnu → `"GENERIQUE"`
- Format invalide → `"GENERIQUE"`
- La fonction ne lève jamais d'erreur, elle retourne toujours `"GENERIQUE"` en fallback

## 🔄 Intégration dans le formulaire d'onboarding

### Suggestion automatique

Le formulaire d'onboarding (`components/onboarding/onboarding-form.tsx`) :

1. **Lors de la saisie du SIRET** :
   - Extrait automatiquement le code NAF (caractères 9-13)
   - Propose un secteur correspondant
   - Pré-remplit le champ secteur (si aucun secteur n'est déjà sélectionné)

2. **Lors de la saisie du code NAF** :
   - Priorité sur le SIRET si les deux sont renseignés
   - Propose un secteur correspondant
   - Pré-remplit le champ secteur

3. **Message pédagogique affiché** :
   ```
   Le secteur proposé est basé sur votre code NAF à titre indicatif.
   Vous pouvez le modifier ou en ajouter d'autres selon vos unités de travail.
   ```

4. **Indicateur visuel** :
   - Le secteur suggéré est marqué d'une étoile (⭐) dans la liste déroulante
   - Le placeholder du select affiche "Suggéré : [Nom du secteur]"
   - Une alerte informative apparaît avec le message pédagogique

### Sélection du secteur

Le champ secteur utilise les `ActivitySector` de la base de données :
- Chargement depuis `api.activitySectors.getAll.useQuery({ active: true })`
- Tri par ordre défini (`order`)
- Filtrage des secteurs actifs uniquement
- Affichage du label du secteur avec indication visuelle si suggéré

## 📝 Usage dans l'application

### Formulaire d'onboarding

```tsx
// Suggestion automatique à partir du SIRET
const siretValue = form.watch('siret');
const suggestedSector = getSecteurFromSIRET(siretValue);

// Suggestion à partir du code NAF explicite
const nafCodeValue = form.watch('nafCode');
const suggestedSector = getSecteurFromNAF(nafCodeValue);
```

### Création d'unités de travail

Le secteur suggéré peut également être utilisé pour :
- Pré-sélectionner des risques pertinents lors de la création d'une unité de travail
- Filtrer les familles de dangers disponibles
- Proposer des mesures de prévention adaptées

## ✅ Tests

Les tests unitaires sont disponibles dans :
- `lib/__tests__/naf-sector-mapping.test.ts`

Exécution des tests :
```bash
pnpm test lib/__tests__/naf-sector-mapping.test.ts
```

## 🔐 Conformité et sécurité

### Limitations

- ⚠️ Le mapping NAF → secteur est **approximatif** et basé sur des règles générales
- ⚠️ Un même code NAF peut correspondre à plusieurs secteurs selon le contexte
- ⚠️ Le secteur suggéré ne doit jamais être considéré comme une validation réglementaire

### Messages utilisateur

Tous les messages doivent rappeler :
- "Le secteur proposé est basé sur votre code NAF à titre indicatif"
- "Vous pouvez le modifier ou en ajouter d'autres selon vos unités de travail"
- "Aucune promesse de conformité automatique"

## 🎯 Objectif final

Accélérer l'identification des familles de risques pertinentes, tout en laissant le contrôle total à l'utilisateur.

