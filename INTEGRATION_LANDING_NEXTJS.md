# Guide d'Intégration Landing Page dans Next.js

## ✅ Intégration Terminée

La landing page a été intégrée dans le projet Next.js avec une approche hybride pragmatique.

## 📁 Structure

```
duerpilot/
├── app/
│   ├── page.tsx                    # Redirige vers /landing/index.html si pas authentifié
│   └── api/
│       └── landing/
│           └── waitlist/
│               └── route.ts        # API route sécurisée pour Brevo
├── public/
│   ├── landing/                    # Landing page HTML statique
│   │   ├── index.html              # Page principale (chemins adaptés)
│   │   ├── confirmation.html       # Page après inscription
│   │   ├── assets/
│   │   │   ├── css/styles.css      # Styles custom
│   │   │   ├── js/
│   │   │   │   ├── main.js         # Intégration Brevo via API route
│   │   │   │   └── analytics.js    # GA4 + Clarity
│   │   │   └── images/
│   │   │       ├── logo.svg        # Logo principal
│   │   │       └── favicon.svg     # Favicon
│   │   └── legal/                  # Pages légales
│   └── landing-assets/             # Assets (copiés depuis landing/assets)
│       ├── css/
│       ├── js/
│       └── images/
└── components/landing/              # Composants React (pour future migration)
```

## 🎯 Comment Accéder

### En Développement

1. **Démarrer le serveur Next.js :**
   ```bash
   pnpm dev
   ```

2. **Accéder à la landing page :**
   - **Utilisateurs non authentifiés** : `http://localhost:3000/` → redirige automatiquement vers `/landing/index.html`
   - **Accès direct** : `http://localhost:3000/landing/index.html`
   - **Page de confirmation** : `http://localhost:3000/landing/confirmation.html`
   - **Mentions légales** : `http://localhost:3000/landing/legal/mentions-legales.html`
   - **Politique de confidentialité** : `http://localhost:3000/landing/legal/politique-confidentialite.html`

### En Production

- **Landing page** : `https://duerpilot.fr/landing/index.html`
- **Application** : `https://app.duerpilot.fr/` (si configuré)

## ⚙️ Configuration Requise

### Variables d'environnement (.env.local)

```env
# Brevo Configuration (OBLIGATOIRE pour le formulaire)
BREVO_API_KEY=votre_cle_api_brevo
BREVO_LIST_ID=123

# Analytics (Optionnel)
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_ID=votre_clarity_id
```

**⚠️ IMPORTANT** : Ne jamais mettre `BREVO_API_KEY` dans le code client. Elle est utilisée uniquement côté serveur via l'API route `/api/landing/waitlist`.

## 🔧 Fonctionnement

### 1. Redirection Automatique

`app/page.tsx` vérifie l'authentification :
- **Pas authentifié** → Redirige vers `/landing/index.html`
- **Authentifié** → Redirige vers `/dashboard` ou `/onboarding`

### 2. Formulaire Liste d'Attente

Le formulaire utilise maintenant une **API route Next.js sécurisée** :

```javascript
// Avant (insecure) : Clé API dans le code client
fetch('https://api.brevo.com/v3/contacts', {
  headers: { 'api-key': 'CLÉ_API_EXPOSÉE' }
});

// Maintenant (secure) : API route Next.js
fetch('/api/landing/waitlist', {
  method: 'POST',
  body: JSON.stringify({ email, prenom, entreprise, secteur, consent })
});
```

**Avantages :**
- ✅ Clé API sécurisée côté serveur
- ✅ Validation côté serveur
- ✅ Gestion d'erreurs centralisée
- ✅ Logs serveur pour debugging

### 3. Chemins des Assets

Tous les chemins ont été adaptés pour Next.js :

| Ancien chemin | Nouveau chemin |
|---------------|----------------|
| `/assets/images/logo.svg` | `/landing-assets/images/logo.svg` |
| `/assets/css/styles.css` | `/landing-assets/css/styles.css` |
| `/assets/js/main.js` | `/landing-assets/js/main.js` |
| `/confirmation.html` | `/landing/confirmation.html` |
| `/legal/...` | `/landing/legal/...` |

## 📝 Prochaines Étapes (Optionnel)

### 1. Créer une API route pour le compteur

```typescript
// app/api/landing/counter/route.ts
export async function GET() {
  // Récupérer le nombre de contacts depuis Brevo
  // Retourner { count: number }
}
```

Puis adapter `main.js` :
```javascript
const response = await fetch('/api/landing/counter');
const data = await response.json();
const count = data.count || 347;
```

### 2. Migrer progressivement vers React

Au lieu d'avoir le HTML statique, vous pouvez migrer progressivement vers des composants React :
- Créer `components/landing/landing-hero.tsx`
- Créer `components/landing/landing-features.tsx`
- etc.

### 3. Configurer les Analytics

1. Créer un compte Google Analytics 4
2. Récupérer le Measurement ID (G-XXXXXXXXXX)
3. Ajouter `NEXT_PUBLIC_GA4_MEASUREMENT_ID` dans `.env.local`

4. Créer un projet Microsoft Clarity
5. Récupérer le Project ID
6. Ajouter `NEXT_PUBLIC_CLARITY_ID` dans `.env.local`

### 4. Créer les Images Manquantes

- `og-image.jpg` (1200x630px) pour Open Graph
- `twitter-card.jpg` (1200x630px) pour Twitter Card

Voir `landing/GUIDE_IMAGES.md` pour plus de détails.

## 🔒 Sécurité

### Formulaire Brevo

- ✅ Clé API côté serveur uniquement
- ✅ Validation des données côté serveur
- ✅ Gestion d'erreurs sécurisée
- ✅ Pas d'exposition de clé API dans le code client

### Analytics

- ✅ Chargement conditionnel selon consentement cookies
- ✅ Variables d'environnement pour configuration
- ✅ Respect RGPD (banner cookies)

## 🐛 Dépannage

### Le formulaire ne fonctionne pas

1. Vérifier que `BREVO_API_KEY` et `BREVO_LIST_ID` sont dans `.env.local`
2. Redémarrer le serveur Next.js (`pnpm dev`)
3. Vérifier les logs serveur pour les erreurs Brevo API
4. Vérifier la console navigateur pour les erreurs JavaScript

### Les assets ne se chargent pas

1. Vérifier que les fichiers sont dans `public/landing-assets/`
2. Vérifier les chemins dans `public/landing/index.html` (doivent être `/landing-assets/...`)
3. Vérifier que le serveur Next.js est démarré

### Redirection vers landing ne fonctionne pas

1. Vérifier `app/page.tsx` → doit rediriger vers `/landing/index.html`
2. Vérifier que le fichier existe dans `public/landing/index.html`
3. Vérifier la console serveur pour les erreurs

## 📚 Documentation

- `landing/LANDING_PAGE_GUIDE.md` - Guide complet déploiement
- `landing/DEPLOYMENT.md` - Instructions déploiement
- `landing/TEMPLATES_BREVO.md` - Templates emails Brevo
- `landing/GUIDE_IMAGES.md` - Guide création images

## ✨ Avantages de cette Approche

1. **Rapidité** : Landing page fonctionnelle immédiatement
2. **Sécurité** : Clé API Brevo côté serveur uniquement
3. **Flexibilité** : HTML statique facile à modifier
4. **Performance** : Aucun overhead React pour la landing
5. **Migration progressive** : Possible de migrer vers React plus tard

## 🚀 Prochaines Améliorations

- [ ] Créer API route pour compteur dynamique
- [ ] Ajouter rate limiting pour formulaire
- [ ] Implémenter captcha (optionnel)
- [ ] Migrer progressivement vers composants React
- [ ] Optimiser les images (WebP, lazy loading)


