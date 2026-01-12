# Guide de Déploiement - Landing Page DUERPilot

## Prérequis

- Compte Coolify configuré (ou Cloudflare Pages)
- Domaine `duerpilot.fr` configuré
- Clé API Brevo publique
- ID Google Analytics 4 (optionnel)
- ID Microsoft Clarity (optionnel)

## Déploiement sur Coolify

### Étape 1 : Créer l'application

1. Connectez-vous à Coolify
2. **New Resource** → **Application**
3. **Configuration initiale :**
   - Repository URL : `https://github.com/neliville/DUERPilot`
   - Branch : `main`
   - **Build Pack** : `Static` ⚠️ **IMPORTANT**
   - **Base Directory** : `/landing` ⚠️ **IMPORTANT**

### Étape 2 : Configuration générale

- **Build Pack** : `Static` (déjà sélectionné)
- **Base Directory** : `/landing` ✅
- **Static Image** : `nginx:alpine` (par défaut, laisser tel quel)
- **Custom Nginx Configuration** : Laisser vide (configuration par défaut)

### Étape 3 : Configuration Domaine

1. **Remplacez le domaine temporaire sslip.io** par :
   - Domain : `duerpilot.fr`
   - Domain (www) : `www.duerpilot.fr` (optionnel)
2. **Direction** : `Allow www & non-www.`
3. **SSL/TLS** :
   - ✅ Cochez "Generate SSL Certificate"
   - ✅ Activez "Redirect HTTP to HTTPS"

### Étape 4 : Configuration Health Check

⚠️ **IMPORTANT : Activez le health check**

- ✅ Enable Health Check : Cocher
- Path : `/` ou `/index.html`
- Port : `80`
- Interval : `30` secondes
- Timeout : `5` secondes
- Retries : `3`

### Étape 5 : Configuration Network

- **Ports Exposes** : `80` ✅
- **Ports Mappings** : Laisser vide (supprimer `3000:3000` si présent)

### Étape 6 : Pre/Post Deployment

⚠️ **IMPORTANT : Vider ces champs**

- **Pre-deployment** : Laisser vide
- **Post-deployment** : Laisser vide

### Étape 4 : Configuration Nginx (si nécessaire)

Si vous avez besoin de configuration Nginx custom, ajoutez dans Coolify :

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

### Étape 7 : Variables d'environnement

⚠️ **IMPORTANT : Pas de variables d'environnement nécessaires**

Pour une landing page statique avec formulaire Brevo intégré :
- ✅ **Aucune variable d'environnement requise**
- Le formulaire Brevo fonctionne directement avec le script intégré dans le HTML
- Les valeurs sont hardcodées dans les fichiers JS ou via le script Brevo

**Note :** Si vous avez un build process (non recommandé pour une landing statique), vous pourriez ajouter `SITE_URL=https://duerpilot.fr`, mais ce n'est **pas nécessaire**.

## Déploiement sur Cloudflare Pages

### Étape 1 : Préparer le repository

1. Push le code vers GitHub/GitLab
2. S'assurer que le dossier `landing/` est à la racine ou dans un sous-dossier

### Étape 2 : Créer le projet Cloudflare Pages

1. Cloudflare Dashboard → **Pages** → **Create a project**
2. Connecter votre repository
3. Build settings :
   - **Framework preset** : None
   - **Build command** : (laisser vide)
   - **Build output directory** : `/landing` ou `/`
   - **Root directory** : `/` (si landing est à la racine)

### Étape 3 : Configuration Domaine

1. **Custom domains** → **Set up a custom domain**
2. Domaine : `duerpilot.fr`
3. SSL : Automatique (Cloudflare)

### Étape 4 : Variables d'environnement (optionnel)

Si vous utilisez un build process, ajoutez les variables dans **Settings** → **Environment variables**

## Configuration DNS

### Enregistrements DNS à créer

```
Type    Name    Value                    TTL
A       @       [IP Serveur Coolify]     3600
CNAME   www     duerpilot.fr             3600
CNAME   app     [IP App Next.js]         3600
```

### Pour Cloudflare

```
Type    Name    Value                    Proxy
A       @       [IP Serveur]             Proxied (orange cloud)
CNAME   www     duerpilot.fr             Proxied
CNAME   app     [IP App]                 Proxied
```

## Post-Déploiement

### Checklist de Vérification

- [ ] Site accessible sur `https://duerpilot.fr`
- [ ] SSL/HTTPS actif (cadenas vert)
- [ ] Formulaire fonctionne (test inscription Brevo)
- [ ] Cookie banner s'affiche
- [ ] Analytics tracking (vérifier dans GA4)
- [ ] Tous les liens fonctionnels
- [ ] Responsive mobile/tablet/desktop
- [ ] Performance Lighthouse >90

### Tests à Effectuer

1. **Test Formulaire :**
   - Remplir le formulaire avec un email test
   - Vérifier que l'inscription apparaît dans Brevo
   - Vérifier que l'email de confirmation est reçu

2. **Test Analytics :**
   - Visiter la page
   - Vérifier dans GA4 que la page view est enregistrée
   - Tester un événement (clic CTA, scroll, etc.)

3. **Test RGPD :**
   - Vérifier que le banner cookies s'affiche
   - Accepter/refuser les cookies
   - Vérifier que les préférences sont sauvegardées

4. **Test Performance :**
   - Lighthouse audit (Chrome DevTools)
   - Vérifier score >90
   - Vérifier First Contentful Paint <1.8s

## Maintenance

### Mettre à jour le contenu

1. Modifier les fichiers HTML/CSS/JS localement
2. Commit et push vers le repository
3. Coolify/Cloudflare redéploie automatiquement

### Mettre à jour le compteur d'inscrits

**Option 1 : Automatique (API Brevo)**
- Décommenter le code dans `main.js`
- Nécessite clé API avec permission `contacts.read`

**Option 2 : Manuel**
- Modifier `const count = 347;` dans `main.js`
- Commit et push

### Ajouter des images

1. Ajouter les images dans `assets/images/`
2. Optimiser en WebP (outil : Squoosh, ImageOptim)
3. Utiliser lazy loading : `<img loading="lazy" ...>`

## Rollback

### Coolify
- **Deployments** → Sélectionner une version précédente → **Redeploy**

### Cloudflare Pages
- **Deployments** → Sélectionner un déploiement précédent → **Retry deployment**

## Support

- Documentation : `LANDING_PAGE_GUIDE.md`
- Contact : contact@duerpilot.fr
- Issues : [Repository GitHub]

