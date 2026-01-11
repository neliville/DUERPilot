# Guide de Déploiement de la Landing Page en Production

Ce guide décrit les étapes complètes pour déployer la landing page DUERPilot en production sur Hetzner avec Coolify.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Préparation locale](#préparation-locale)
3. [Configuration sur Hetzner](#configuration-sur-hetzner)
4. [Configuration Coolify](#configuration-coolify)
5. [Déploiement](#déploiement)
6. [Vérification post-déploiement](#vérification-post-déploiement)
7. [Optimisations et bonnes pratiques](#optimisations-et-bonnes-pratiques)

---

## 📦 Prérequis

### Sur votre machine locale
- ✅ Accès au dépôt Git
- ✅ Git configuré
- ✅ Node.js 18+ (optionnel, pour tests locaux)

### Sur Hetzner
- ✅ Serveur Hetzner configuré
- ✅ Coolify installé et fonctionnel
- ✅ Domaine configuré (duerpilot.fr)
- ✅ DNS pointant vers le serveur Hetzner
- ✅ Certificat SSL (Let's Encrypt via Coolify)

---

## 🛠️ Préparation locale

### Étape 1 : Vérifier la structure de la landing page

La landing page doit être dans le dossier `landing/` :

```
DUERPAI/
├── landing/
│   ├── index.html          # Page principale
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css  # Styles personnalisés
│   │   ├── js/
│   │   │   └── main.js     # Scripts JavaScript
│   │   └── images/         # Images et logos
│   └── legal/              # Pages légales
│       ├── politique-confidentialite.html
│       └── mentions-legales.html
```

### Étape 2 : Optimiser les assets (recommandé)

Avant le déploiement, optimisez les fichiers :

```bash
# Compresser les images (si nécessaire)
# Utiliser des outils comme ImageOptim, Squoosh, ou Sharp
# Formats recommandés : WebP avec fallback PNG/JPG

# Minifier le CSS (optionnel)
npx clean-css-cli -o landing/assets/css/styles.min.css landing/assets/css/styles.css

# Minifier le JavaScript (optionnel)
npx terser landing/assets/js/main.js -o landing/assets/js/main.min.js -c -m
```

### Étape 3 : Vérifier les chemins absolus

Vérifiez que tous les chemins dans `landing/index.html` sont corrects :

- ✅ `/assets/css/styles.css` (pas `./assets` ou `assets`)
- ✅ `/assets/js/main.js` (pas `./assets` ou `assets`)
- ✅ `/landing/legal/...` pour les pages légales
- ✅ URLs externes avec `https://`

### Étape 4 : Commit et push

```bash
# Vérifier les changements
git status

# Ajouter les fichiers
git add landing/
git add GUIDE_DEPLOIEMENT_LANDING.md

# Commit
git commit -m "feat: landing page ready for production"

# Push vers le dépôt
git push origin main
```

---

## 🖥️ Configuration sur Hetzner

### Étape 1 : Accéder au serveur Hetzner

```bash
# Se connecter au serveur
ssh root@VOTRE_IP_HETZNER

# Ou via votre utilisateur
ssh user@VOTRE_IP_HETZNER
```

### Étape 2 : Vérifier Coolify

Vérifiez que Coolify est installé et fonctionne :

```bash
# Vérifier le statut de Coolify
docker ps | grep coolify

# Vérifier les logs
docker logs coolify-app
```

### Étape 3 : Vérifier les ressources

```bash
# Vérifier l'espace disque
df -h

# Vérifier la RAM
free -h

# Vérifier les ports disponibles
netstat -tuln | grep :80
netstat -tuln | grep :443
```

---

## ⚙️ Configuration Coolify

### Étape 1 : Accéder à Coolify

1. Ouvrez votre navigateur : `http://VOTRE_IP_HETZNER:8000`
2. Connectez-vous à Coolify
3. Accédez au dashboard

### Étape 2 : Créer une nouvelle application

1. **Cliquez sur "New Resource"** (ou "Nouvelle ressource")
2. **Sélectionnez "Static Site"** (Site statique)
3. **Remplissez les informations :**
   - **Name**: `duerpilot-landing`
   - **Repository**: URL de votre dépôt Git (ex: `https://github.com/votre-org/DUERPAI.git`)
   - **Branch**: `main` (ou `master`)
   - **Build Pack**: `Static Site` ou `Custom`

### Étape 3 : Configuration du build (Option 1 - Site statique simple)

Si vous servez directement les fichiers statiques :

**Build Command** (laisser vide ou) :
```bash
# Pas de build nécessaire, fichiers statiques uniquement
echo "No build needed"
```

**Start Command** (laisser vide) :
```bash
# Coolify gérera le serveur statique automatiquement
```

**Publish Directory** :
```
landing
```

**Port** :
```
80
```

### Étape 4 : Configuration du build (Option 2 - Nginx avec fichiers statiques)

Si vous préférez utiliser Nginx :

**Dockerfile personnalisé** :

Créez un fichier `Dockerfile.landing` à la racine du projet :

```dockerfile
FROM nginx:alpine

# Copier les fichiers de la landing page
COPY landing/ /usr/share/nginx/html/

# Copier la configuration Nginx personnalisée (optionnel)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Nginx démarre automatiquement
CMD ["nginx", "-g", "daemon off;"]
```

**Configuration Nginx personnalisée** (optionnel - `nginx.conf`) :

```nginx
server {
    listen 80;
    server_name duerpilot.fr www.duerpilot.fr;
    root /usr/share/nginx/html;
    index index.html;

    # Compression Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Cache pour les assets statiques
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Page principale
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Pages légales
    location /legal/ {
        try_files $uri $uri/ =404;
    }

    # Assets
    location /assets/ {
        try_files $uri =404;
    }
}
```

Dans Coolify :
- **Dockerfile Path**: `Dockerfile.landing`
- **Port**: `80`

### Étape 5 : Configuration du domaine

1. **Dans Coolify, allez dans les settings de l'application**
2. **Ajoutez le domaine :**
   - **Domain**: `duerpilot.fr`
   - **Domain (www)**: `www.duerpilot.fr` (optionnel)
3. **Activez SSL/TLS** :
   - Cochez "Generate SSL Certificate"
   - Coolify générera automatiquement un certificat Let's Encrypt
4. **Redirect HTTP to HTTPS** : ✅ Activé

### Étape 6 : Variables d'environnement

Pour la landing page statique, généralement pas de variables d'environnement nécessaires.

Si vous avez besoin de variables (par exemple pour les analytics) :

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://duerpilot.fr
```

### Étape 7 : Configuration du port

- **Port interne** : `80`
- **Port externe** : Laisser vide (Coolify gère automatiquement)

---

## 🚀 Déploiement

### Étape 1 : Déclencher le déploiement

1. **Dans Coolify, cliquez sur "Deploy"**
2. **Coolify va :**
   - Cloner le dépôt Git
   - Construire l'image Docker (si Dockerfile)
   - Démarrer le conteneur
   - Configurer le reverse proxy
   - Configurer SSL

### Étape 2 : Surveiller le déploiement

Dans l'interface Coolify :
- **Logs** : Consultez les logs en temps réel
- **Status** : Vérifiez que le statut passe à "Running"
- **URLs** : Vérifiez les URLs générées

### Étape 3 : Vérifier les logs

```bash
# Sur le serveur Hetzner
docker logs coolify-app

# Ou via l'interface Coolify
# Allez dans l'application > Logs
```

---

## ✅ Vérification post-déploiement

### Étape 1 : Tests fonctionnels

1. **Page principale** :
   - ✅ `https://duerpilot.fr` charge correctement
   - ✅ Le design s'affiche correctement
   - ✅ Les couleurs sont bonnes
   - ✅ Le formulaire Brevo est visible

2. **Assets statiques** :
   - ✅ CSS charge : `https://duerpilot.fr/assets/css/styles.css`
   - ✅ JavaScript charge : `https://duerpilot.fr/assets/js/main.js`
   - ✅ Images chargent : `https://duerpilot.fr/assets/images/logo.svg`

3. **Pages légales** :
   - ✅ `https://duerpilot.fr/landing/legal/politique-confidentialite.html`
   - ✅ `https://duerpilot.fr/landing/legal/mentions-legales.html`

4. **Formulaire Brevo** :
   - ✅ Le formulaire s'affiche
   - ✅ Les champs sont interactifs
   - ✅ La soumission fonctionne
   - ✅ Le message de confirmation s'affiche

### Étape 2 : Tests de performance

Utilisez des outils en ligne :
- **PageSpeed Insights** : https://pagespeed.web.dev/
- **GTmetrix** : https://gtmetrix.com/
- **WebPageTest** : https://www.webpagetest.org/

Vérifiez :
- ✅ Score Performance > 90
- ✅ First Contentful Paint < 1.5s
- ✅ Largest Contentful Paint < 2.5s
- ✅ Cumulative Layout Shift < 0.1

### Étape 3 : Tests de compatibilité

Testez sur différents navigateurs :
- ✅ Chrome/Edge (dernière version)
- ✅ Firefox (dernière version)
- ✅ Safari (dernière version)
- ✅ Mobile (Chrome Mobile, Safari iOS)

### Étape 4 : Tests SSL/HTTPS

```bash
# Vérifier le certificat SSL
openssl s_client -connect duerpilot.fr:443 -servername duerpilot.fr

# Ou en ligne
# https://www.ssllabs.com/ssltest/analyze.html?d=duerpilot.fr
```

Vérifiez :
- ✅ Certificat valide
- ✅ Note A ou A+
- ✅ Redirect HTTP → HTTPS fonctionne

### Étape 5 : Tests SEO

Vérifiez les métadonnées :
- ✅ `<title>` correct
- ✅ Meta description présente
- ✅ Open Graph tags présents
- ✅ Twitter Card tags présents
- ✅ Schema.org JSON-LD présent

---

## 🎯 Optimisations et bonnes pratiques

### 1. Cache des assets statiques

Assurez-vous que les assets sont mis en cache :

**Via Nginx** (si vous utilisez Nginx) :
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**Via headers HTTP** (si Coolify le gère) :
```
Cache-Control: public, max-age=31536000, immutable
```

### 2. Compression Gzip/Brotli

Activez la compression :
- **Gzip** : Pour tous les fichiers texte (HTML, CSS, JS)
- **Brotli** : Meilleure compression (si supporté)

### 3. CDN (optionnel mais recommandé)

Pour améliorer les performances globales :
- **Cloudflare** : CDN gratuit avec SSL
- **BunnyCDN** : CDN performant et économique
- **CloudFront** : CDN AWS (payant)

### 4. Monitoring

Configurez le monitoring :
- **Uptime Robot** : Surveillance de disponibilité (gratuit)
- **Sentry** : Monitoring des erreurs JavaScript
- **Google Analytics** : Analytics des visiteurs

### 5. Backups

Configurez les backups :
- **Backup automatique** : Via Coolify ou scripts
- **Backup Git** : Tous les fichiers sont dans Git
- **Backup DNS** : Documentation des configurations DNS

---

## 🔧 Dépannage

### Problème : La page ne charge pas

**Vérifications** :
1. ✅ Le conteneur Docker est en cours d'exécution : `docker ps`
2. ✅ Les logs ne montrent pas d'erreurs : `docker logs <container-id>`
3. ✅ Le port est correctement exposé
4. ✅ Le domaine DNS pointe vers le bon IP
5. ✅ Le certificat SSL est valide

### Problème : Les assets ne chargent pas (404)

**Vérifications** :
1. ✅ Les chemins dans `index.html` sont absolus (`/assets/...`)
2. ✅ Les fichiers existent dans `landing/assets/`
3. ✅ Les permissions sont correctes
4. ✅ Le serveur web (Nginx) est configuré correctement

### Problème : Le formulaire Brevo ne fonctionne pas

**Vérifications** :
1. ✅ Le script Brevo est chargé
2. ✅ La clé reCAPTCHA est correcte
3. ✅ Le domaine est autorisé dans Brevo
4. ✅ Console JavaScript ne montre pas d'erreurs (F12)

### Problème : SSL/HTTPS ne fonctionne pas

**Vérifications** :
1. ✅ Le certificat Let's Encrypt est généré
2. ✅ Le redirect HTTP → HTTPS est activé
3. ✅ Les ports 80 et 443 sont ouverts dans le firewall
4. ✅ Le domaine DNS pointe correctement

---

## 📝 Checklist de déploiement

Avant de déployer :

- [ ] Code commité et poussé sur Git
- [ ] Tous les assets présents dans `landing/`
- [ ] Chemins absolus vérifiés dans `index.html`
- [ ] Formulaire Brevo testé localement
- [ ] Serveur Hetzner accessible
- [ ] Coolify installé et fonctionnel
- [ ] Domaine configuré (DNS)
- [ ] SSL/HTTPS configuré
- [ ] Backup effectué (optionnel)

Après le déploiement :

- [ ] Page principale accessible
- [ ] Assets chargent correctement
- [ ] Formulaire fonctionne
- [ ] SSL/HTTPS valide
- [ ] Performance acceptable
- [ ] Compatibilité navigateurs vérifiée
- [ ] Monitoring configuré
- [ ] Documentation mise à jour

---

## 📚 Ressources supplémentaires

- **Documentation Coolify** : https://coolify.io/docs
- **Documentation Hetzner** : https://docs.hetzner.com/
- **Documentation Nginx** : https://nginx.org/en/docs/
- **Let's Encrypt** : https://letsencrypt.org/docs/
- **PageSpeed Insights** : https://pagespeed.web.dev/

---

## 🆘 Support

En cas de problème :
1. Consultez les logs dans Coolify
2. Vérifiez les logs Docker : `docker logs <container-id>`
3. Consultez la documentation Coolify
4. Vérifiez les issues GitHub du projet

---

**Date de création** : 2025-01-XX
**Version** : 1.0
**Auteur** : Équipe DUERPilot

