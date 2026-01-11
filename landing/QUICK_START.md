# Quick Start - Landing Page DUERPilot

## 🚀 Démarrage Rapide

### 1. Configuration (5 minutes)

**Éditer `assets/js/main.js` :**
```javascript
const BREVO_API_KEY = 'VOTRE_CLE_API_BREVO';
const BREVO_LIST_ID = 123; // ID de votre liste Brevo
```

**Éditer `assets/js/analytics.js` :**
```javascript
const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX';
const CLARITY_ID = 'VOTRE_CLARITY_ID';
```

**Éditer `legal/mentions-legales.html` :**
- Remplacer `[À compléter]` par votre SIRET
- Remplacer `[Nom à compléter]` par le nom du responsable

### 2. Images Requises

Créer et placer dans `assets/images/` :
- `logo.svg` - Logo DUERPilot
- `og-image.jpg` - Image Open Graph (1200x630px)
- `twitter-card.jpg` - Image Twitter Card (1200x630px)
- `favicon.svg` - Favicon

### 3. Configuration Brevo

1. Créer liste "Waitlist DUERPilot" dans Brevo
2. Créer champs personnalisés : PRENOM, ENTREPRISE, SECTEUR
3. Créer clé API publique (permissions : contacts.write)
4. Configurer workflow email de bienvenue automatique

**Voir :** `TEMPLATES_BREVO.md` pour les templates complets

### 4. Déploiement

**Coolify :**
1. Créer service Static Site
2. Domaine : `duerpilot.fr`
3. Publish directory : `/landing`
4. Déployer

**Voir :** `DEPLOYMENT.md` pour les détails complets

## ✅ Checklist Avant Mise en Ligne

- [ ] BREVO_API_KEY configuré
- [ ] BREVO_LIST_ID configuré
- [ ] GA4_MEASUREMENT_ID configuré (optionnel)
- [ ] CLARITY_ID configuré (optionnel)
- [ ] SIRET et adresse dans mentions légales
- [ ] Images créées (logo, og-image, favicon)
- [ ] Templates Brevo créés
- [ ] Test formulaire fonctionne
- [ ] Test cookie banner fonctionne
- [ ] SSL/HTTPS actif
- [ ] Performance Lighthouse >90

## 📚 Documentation Complète

- `LANDING_PAGE_GUIDE.md` - Guide complet déploiement et maintenance
- `DEPLOYMENT.md` - Instructions déploiement détaillées
- `TEMPLATES_BREVO.md` - Templates emails Brevo
- `README.md` - Vue d'ensemble

## 🆘 Support

- Email : contact@duerpilot.fr
- Documentation : Voir les fichiers .md dans ce dossier

