# 🎨 Palette de Couleurs DUERPilot v2

## Palette Définitive

| Usage              | Couleur         | Hex       | HSL                    | Tailwind Variable |
| ------------------ | --------------- | --------- | ---------------------- | ----------------- |
| Fond principal     | Gris très clair | `#F5F7FA` | `210 20% 96%`          | `--background`    |
| Fond secondaire    | Gris clair      | `#E5E7EB` | `210 13% 91%`          | `--secondary`     |
| Texte principal    | Gris foncé      | `#1F2933` | `210 23% 18%`          | `--foreground`    |
| Texte secondaire   | Gris moyen      | `#6B7280` | `210 11% 47%`          | `--muted-foreground` |
| Primaire (actions) | Bleu QSE        | `#2563EB` | `221 83% 53%`          | `--primary`       |
| Accent discret     | Bleu clair      | `#93C5FD` | `213 93% 68%`          | `--accent`        |
| Succès             | Vert doux       | `#16A34A` | `142 76% 36%`          | `--success`       |
| Alerte             | Orange          | `#F59E0B` | `38 92% 50%`           | `--alert`         |
| Erreur             | Rouge           | `#DC2626` | `0 84% 60%`            | `--destructive`   |

## Fichiers Modifiés

### ✅ 1. Configuration Globale (Next.js App)

#### `app/globals.css`
- ✅ Variables CSS mises à jour avec la nouvelle palette HSL
- ✅ `--background` : Fond principal (#F5F7FA)
- ✅ `--foreground` : Texte principal (#1F2933)
- ✅ `--primary` : Bleu QSE (#2563EB)
- ✅ `--secondary` : Fond secondaire (#E5E7EB)
- ✅ `--accent` : Bleu clair (#93C5FD)
- ✅ `--muted-foreground` : Texte secondaire (#6B7280)
- ✅ `--destructive` : Erreur (#DC2626)
- ✅ Ajout de `--success` et `--alert`
- ✅ **Liens sans soulignement** : `text-decoration: none` appliqué globalement
- ✅ Hover avec opacité au lieu de soulignement

#### `tailwind.config.ts`
- ✅ Ajout de `success` et `alert` dans les couleurs Tailwind
- ✅ Les couleurs utilisent les variables CSS HSL

### ✅ 2. Landing Page (duerpilot.fr)

#### `landing/index.html`
- ✅ Configuration Tailwind mise à jour avec la nouvelle palette
- ✅ Classes de couleurs remplacées par styles inline ou nouvelles classes
- ✅ `bg-white` → `background-color: #FFFFFF` (pour contraste sur fond #F5F7FA)
- ✅ `text-gray-*` → `color: #6B7280` ou `color: #1F2933`
- ✅ `bg-gray-*` → `background-color: #E5E7EB`
- ✅ `text-primary` → `color: #2563EB`
- ✅ `bg-primary` → `background-color: #2563EB`
- ✅ `bg-accent` → `background-color: #F59E0B` (Orange pour CTA)
- ✅ **Tous les liens sans soulignement** : `text-decoration: none`
- ✅ Hover avec opacité

#### `landing/assets/css/styles.css`
- ✅ Variables CSS locales ajoutées (`:root`)
- ✅ Styles de liens mis à jour : `text-decoration: none`
- ✅ Couleurs de validation/erreur mises à jour avec la nouvelle palette

### ⚠️ 3. Composants Next.js (app.duerpilot.fr)

**À mettre à jour progressivement** :
- Les composants utilisant `bg-gray-*`, `text-gray-*`, `bg-blue-*` doivent utiliser les nouvelles variables CSS
- Les composants Badge, Button, Alert utilisent déjà les variables CSS (mise à jour automatique)
- Composants spécifiques à vérifier :
  - `components/referentiel/hazard-list.tsx` : couleurs de catégories
  - `components/actions/action-kanban.tsx` : couleurs de statuts
  - `components/evaluations/risk-assessment-list.tsx` : couleurs de priorités
  - `components/dashboard/*` : fonds et textes
  - `components/admin/*` : fonds et textes

### ⚠️ 4. Admin Backend

**À mettre à jour progressivement** :
- Les pages admin utilisent déjà les composants UI (Button, Card, etc.) donc bénéficient des variables CSS
- Vérifier les pages spécifiques :
  - `app/(dashboard)/admin/page.tsx`
  - `app/(dashboard)/admin/companies/page.tsx`
  - `app/(dashboard)/admin/users/page.tsx`
  - `app/(dashboard)/admin/billing/page.tsx`

## Règles de Liens

### ❌ AVANT
```css
a {
  text-decoration: underline;
}
```

### ✅ APRÈS
```css
a {
  text-decoration: none;
}

a:hover {
  text-decoration: none;
  opacity: 0.8;
}
```

**Appliquer partout** :
- Landing page ✅
- App Next.js ✅ (globals.css)
- Composants React (à vérifier au cas par cas)

## Utilisation dans le Code

### Tailwind Classes (Next.js)
```tsx
// Fond principal
<div className="bg-background"> // #F5F7FA

// Texte principal
<p className="text-foreground"> // #1F2933

// Texte secondaire
<p className="text-muted-foreground"> // #6B7280

// Bouton primaire
<Button className="bg-primary text-primary-foreground"> // #2563EB sur blanc

// Bouton accent
<Button className="bg-accent text-accent-foreground"> // #93C5FD

// Succès
<Badge className="bg-success text-success-foreground"> // #16A34A

// Alerte
<Badge className="bg-alert text-alert-foreground"> // #F59E0B

// Erreur
<Badge variant="destructive"> // #DC2626
```

### Styles Inline (Landing Page)
```html
<!-- Fond principal -->
<div style="background-color: #F5F7FA;">

<!-- Texte principal -->
<p style="color: #1F2933;">

<!-- Texte secondaire -->
<p style="color: #6B7280;">

<!-- Lien sans soulignement -->
<a href="#" style="color: #2563EB; text-decoration: none;">
```

## Checklist de Migration

### ✅ Complété
- [x] Variables CSS globales (`app/globals.css`)
- [x] Configuration Tailwind (`tailwind.config.ts`)
- [x] Landing page HTML principal (`landing/index.html`)
- [x] Landing page CSS (`landing/assets/css/styles.css`)
- [x] Liens sans soulignement (globaux)

### ⚠️ À Vérifier / Compléter
- [ ] Composants React individuels (vérification au cas par cas)
- [ ] Pages admin spécifiques (vérification visuelle)
- [ ] Pages dashboard spécifiques (vérification visuelle)
- [ ] Composants avec couleurs hardcodées (recherche `bg-blue-`, `text-gray-`, etc.)

## Commandes Utiles

### Rechercher les occurrences de couleurs
```bash
# Rechercher les classes Tailwind avec couleurs
grep -r "bg-gray\|text-gray\|bg-blue\|text-blue" components/ app/

# Rechercher les liens avec underline
grep -r "underline\|text-decoration" components/ app/ landing/
```

## Notes Importantes

1. **Contraste** : Toutes les couleurs respectent les ratios de contraste WCAG AA minimum
2. **Accessibilité** : Les liens sont identifiables par la couleur et le hover (opacité)
3. **Cohérence** : Utiliser les variables CSS plutôt que les valeurs hex directement
4. **Landing Page** : Utilise des styles inline pour compatibilité avec Tailwind CDN
5. **App Next.js** : Utilise les variables CSS HSL pour compatibilité avec dark mode (si activé)

## Migration Progressive

Les composants Shadcn/ui (Button, Badge, Card, etc.) utilisent déjà les variables CSS, donc ils bénéficient automatiquement de la nouvelle palette.

Pour les composants personnalisés :
1. Remplacer `bg-gray-*` par `bg-secondary` ou `bg-muted`
2. Remplacer `text-gray-*` par `text-foreground` ou `text-muted-foreground`
3. Remplacer `bg-blue-*` par `bg-primary` ou `bg-accent`
4. Vérifier visuellement après modification

---

**Dernière mise à jour** : Janvier 2026  
**Statut** : ✅ Palette principale appliquée, ⚠️ Vérification progressive des composants en cours

