# Landing Page DUERPilot - Pré-Lancement

Landing page statique pour `duerpilot.fr` (pré-lancement), complètement séparée de l'application Next.js `app.duerpilot.fr`.

## Structure

```
landing/
├── index.html                 # Page principale
├── confirmation.html          # Page après inscription
├── assets/
│   ├── css/
│   │   └── styles.css        # Styles custom
│   ├── js/
│   │   ├── main.js           # Interactivité + Brevo
│   │   └── analytics.js      # GA4 + Clarity
│   └── images/               # Images, logos, mockups
├── legal/
│   ├── mentions-legales.html
│   └── politique-confidentialite.html
├── sitemap.xml
├── robots.txt
├── README.md                 # Ce fichier
├── LANDING_PAGE_GUIDE.md     # Guide déploiement
└── TEMPLATES_BREVO.md        # Templates emails
```

## Configuration

### 1. Brevo API

Éditer `assets/js/main.js` :
```javascript
const BREVO_API_KEY = 'YOUR_BREVO_API_KEY_PUBLIC';
const BREVO_LIST_ID = 123; // ID liste Brevo
```

### 2. Analytics

Éditer `assets/js/analytics.js` :
```javascript
const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX';
const CLARITY_ID = 'YOUR_CLARITY_ID';
```

### 3. Mentions Légales

Éditer `legal/mentions-legales.html` :
- SIRET
- Adresse complète
- Responsable publication

## Déploiement

Voir `LANDING_PAGE_GUIDE.md` pour les instructions complètes.

**Quick start Coolify :**
1. Créer service Static Site
2. Domaine : `duerpilot.fr`
3. Publish directory : `/landing`
4. Déployer

## Domaines

- `duerpilot.fr` → Landing page (ce projet)
- `app.duerpilot.fr` → Application Next.js (projet séparé)

## Séparation Stricte

⚠️ **IMPORTANT** : Cette landing page ne doit JAMAIS accéder à la logique métier de l'application.

- Pas de backend custom
- Pas d'accès à la base de données
- Formulaire → Brevo API directement
- Bouton "Essayer gratuitement" → `app.duerpilot.fr/register`

## Support

- Documentation : `LANDING_PAGE_GUIDE.md`
- Templates Brevo : `TEMPLATES_BREVO.md`
- Contact : contact@duerpilot.fr

