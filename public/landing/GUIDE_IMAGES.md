# Guide Images - Landing Page DUERPilot

## Images Requises

### ✅ Images Déjà Créées

- **`logo.svg`** (434 KB) - Logo principal utilisé dans le header
- **`favicon.svg`** (434 KB) - Favicon pour l'onglet navigateur

### ⏳ Images à Créer

#### 1. OG Image (Open Graph)

**Fichier :** `assets/images/og-image.jpg`  
**Dimensions :** 1200x630px  
**Format :** JPG (optimisé, max 200 KB)  
**Usage :** Prévisualisation LinkedIn, Facebook, WhatsApp

**Contenu recommandé :**
- Logo DUERPilot (centré ou en haut à gauche)
- Texte : "DUERPilot - DUERP en 30 min avec IA"
- Sous-texte : "Lancement Mai 2025"
- Fond : Dégradé bleu (#2563EB → #10B981) ou blanc avec logo
- Style : Moderne, épuré, professionnel

**Outils recommandés :**
- Canva (template OG Image 1200x630)
- Figma (design custom)
- Photoshop/GIMP

**Référence dans le code :**
```html
<meta property="og:image" content="https://duerpilot.fr/assets/images/og-image.jpg">
```

---

#### 2. Twitter Card Image

**Fichier :** `assets/images/twitter-card.jpg`  
**Dimensions :** 1200x630px  
**Format :** JPG (optimisé, max 200 KB)  
**Usage :** Prévisualisation Twitter/X

**Contenu recommandé :**
- Même design que OG Image (ou légèrement différent)
- Logo + texte principal
- Couleurs vives pour attirer l'attention

**Référence dans le code :**
```html
<meta name="twitter:image" content="https://duerpilot.fr/assets/images/twitter-card.jpg">
```

---

## Optimisation des Images

### Format WebP (Recommandé)

Pour améliorer les performances, convertissez les images en WebP :

```bash
# Installation cwebp (si nécessaire)
# Ubuntu/Debian: sudo apt install webp
# macOS: brew install webp

# Convertir JPG en WebP
cwebp -q 80 og-image.jpg -o og-image.webp
cwebp -q 80 twitter-card.jpg -o twitter-card.webp
```

**Mise à jour du code HTML :**
```html
<picture>
  <source srcset="/assets/images/og-image.webp" type="image/webp">
  <source srcset="/assets/images/og-image.jpg" type="image/jpeg">
  <img src="/assets/images/og-image.jpg" alt="DUERPilot">
</picture>
```

### Compression

**Outils recommandés :**
- **Squoosh** (https://squoosh.app/) - Compression en ligne, excellent
- **ImageOptim** (macOS) - Compression automatique
- **TinyPNG** - Compression JPG/PNG (en ligne)

**Objectif :**
- OG Image : < 200 KB
- Twitter Card : < 200 KB
- Logo SVG : Déjà optimisé (434 KB acceptable pour SVG complexe)

---

## Lazy Loading

Les images sont chargées avec lazy loading pour améliorer les performances :

```html
<img src="/assets/images/logo.svg" alt="DUERPilot" loading="lazy">
```

**Note :** Le logo dans le header ne doit PAS avoir lazy loading car il est above-the-fold.

---

## Structure des Images

```
landing/assets/images/
├── logo.svg              ✅ Créé (434 KB)
├── favicon.svg           ✅ Créé (434 KB)
├── og-image.jpg          ⏳ À créer (1200x630px, <200 KB)
├── twitter-card.jpg      ⏳ À créer (1200x630px, <200 KB)
└── mockups/              (Pour les mockups produit si nécessaire)
    └── screenshot-*.jpg
```

---

## Checklist Images

- [x] Logo SVG créé et placé dans `assets/images/logo.svg`
- [x] Favicon SVG créé et placé dans `assets/images/favicon.svg`
- [ ] OG Image créée (1200x630px, optimisée)
- [ ] Twitter Card créée (1200x630px, optimisée)
- [ ] Images compressées (<200 KB chacune)
- [ ] Images WebP créées (optionnel mais recommandé)
- [ ] Alt text vérifié pour toutes les images

---

## Outils Recommandés

### Design
- **Canva** : Templates OG Image prêts à l'emploi
- **Figma** : Design custom professionnel
- **Photoshop/GIMP** : Retouche avancée

### Compression
- **Squoosh** : https://squoosh.app/
- **TinyPNG** : https://tinypng.com/
- **ImageOptim** : Application macOS

### Conversion WebP
- **cwebp** : Outil ligne de commande
- **Squoosh** : Conversion en ligne avec prévisualisation

---

## Notes Importantes

1. **OG Image** : Doit être attractive car c'est la première impression sur les réseaux sociaux
2. **Twitter Card** : Peut être identique à OG Image ou légèrement différente
3. **Performance** : Images <200 KB pour chargement rapide
4. **Format** : JPG pour photos/images complexes, SVG pour logo/icônes, WebP pour optimisation
5. **Alt Text** : Toujours remplir les attributs `alt` pour l'accessibilité et le SEO

