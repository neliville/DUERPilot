# Guide Landing Page DUERPilot

## Configuration Requise

### Variables d'environnement / Configuration

**Fichier :** `landing/assets/js/main.js`

À configurer avant déploiement :
```javascript
const BREVO_API_KEY = 'YOUR_BREVO_API_KEY_PUBLIC'; // Clé API publique Brevo
const BREVO_LIST_ID = 123; // ID de votre liste Brevo "Waitlist DUERPilot"
```

**Fichier :** `landing/assets/js/analytics.js`

À configurer avant déploiement :
```javascript
const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // ID Google Analytics 4
const CLARITY_ID = 'YOUR_CLARITY_ID'; // ID Microsoft Clarity
```

## Configuration Brevo

### 1. Créer la liste d'attente

1. Connectez-vous à Brevo
2. Allez dans **Contacts** → **Listes**
3. Créez une nouvelle liste : **"Waitlist DUERPilot"**
4. Notez l'**ID de la liste** (ex: 123)

### 2. Créer les champs personnalisés

Dans Brevo → **Contacts** → **Attributs** :

- `PRENOM` (Text, 50 caractères)
- `ENTREPRISE` (Text, 100 caractères)
- `SECTEUR` (Text, 50 caractères)
- `PLAN_INTERET` (Text, 20 caractères) - Optionnel

### 3. Créer une clé API publique

1. Brevo → **Paramètres** → **API Keys**
2. Créez une nouvelle clé API avec les permissions :
   - `contacts.write` (ajouter des contacts)
   - `contacts.read` (lire le nombre de contacts - optionnel pour compteur)
3. **Important** : Utilisez une clé API **publique** (restreinte) pour la landing page
4. Notez la clé API

### 4. Configurer l'email de confirmation automatique

1. Brevo → **Campaigns** → **Email Templates**
2. Créez un template transactionnel : **"Bienvenue liste d'attente"**
3. Configurez un workflow automatisé :
   - **Déclencheur** : Contact ajouté à la liste "Waitlist DUERPilot"
   - **Action** : Envoyer email template "Bienvenue liste d'attente"
4. Variables du template :
   - `{{ params.PRENOM }}` - Prénom
   - `{{ params.ENTREPRISE }}` - Entreprise
   - `{{ params.SECTEUR }}` - Secteur
   - Lien désabonnement (automatique Brevo)

## Déploiement

### Option 1 : Coolify (Recommandé)

1. **Créer un nouveau service dans Coolify :**
   - Type : **Static Site**
   - Git Repository : URL de votre repo (ou upload direct)
   - Build Command : (aucune si HTML pur)
   - Publish Directory : `/landing` ou `/`
   - Domaine : `duerpilot.fr`

2. **Configuration Nginx (si nécessaire) :**
   ```nginx
   server {
       listen 80;
       server_name duerpilot.fr;
       
       root /var/www/landing;
       index index.html;
       
       # Compression
       gzip on;
       gzip_types text/css application/javascript image/svg+xml;
       
       # Cache
       location ~* \.(jpg|jpeg|png|webp|svg|css|js)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **SSL/HTTPS :**
   - Coolify gère automatiquement Let's Encrypt
   - Vérifiez que le certificat est actif

### Option 2 : Cloudflare Pages

1. Push code vers GitHub
2. Cloudflare Pages → **Create a project**
3. Connecter le repository
4. Build settings :
   - Framework preset : None
   - Build command : (aucune)
   - Build output directory : `/landing`
5. Domaine custom : `duerpilot.fr`

### DNS Configuration

```
Type    Name    Value
A       @       [IP Serveur ou Cloudflare]
CNAME   www     duerpilot.fr
CNAME   app     [IP App Next.js]
```

## Tests Avant Mise en Ligne

### Checklist Technique

- [ ] Formulaire fonctionne (test inscription reçue dans Brevo)
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Cross-browser (Chrome, Firefox, Safari, Edge)
- [ ] SSL/HTTPS actif
- [ ] Page vitesse <3s (Lighthouse >90)
- [ ] Aucune erreur console
- [ ] Analytics tracking OK
- [ ] Lien désabonnement email fonctionne
- [ ] Cookie banner s'affiche et fonctionne
- [ ] Tous les liens fonctionnels

### Checklist Contenu

- [ ] Aucune faute orthographe
- [ ] Images chargées + alt text
- [ ] CTAs cohérents
- [ ] Date lancement cohérente partout
- [ ] Prix affichés corrects
- [ ] Mentions légales complètes (SIRET, adresse, etc.)

### Checklist SEO

- [ ] Meta tags remplis
- [ ] OG image 1200x630 créée et uploadée
- [ ] Schema.org JSON-LD présent
- [ ] Sitemap.xml accessible
- [ ] robots.txt présent

### Checklist RGPD

- [ ] Banner cookies fonctionnel
- [ ] Checkbox consentement obligatoire
- [ ] Politique confidentialité complète
- [ ] Mentions légales complètes
- [ ] Contact DPO configuré

## Maintenance

### Mettre à jour le compteur d'inscrits

**Option 1 : Automatique (API Brevo)**
- Décommenter le code dans `main.js` → `updateCounter()`
- Nécessite clé API avec permission `contacts.read`

**Option 2 : Manuel**
- Modifier la valeur dans `main.js` : `const count = 347;`
- Mettre à jour chaque semaine

### Ajouter des secteurs OiRA

Modifier le `<select name="secteur">` dans `index.html` avec les 47 secteurs complets.

### Mettre à jour la roadmap

Modifier la section `#roadmap` dans `index.html` avec les nouvelles dates/milestones.

## Support

Pour toute question :
- Email : contact@duerpilot.fr
- Documentation : Ce fichier
- Brevo Support : https://help.brevo.com

