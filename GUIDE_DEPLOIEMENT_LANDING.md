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

1. Ouvrez votre navigateur : `http://VOTRE_IP_HETZNER:8000` ou votre domaine Coolify
2. Connectez-vous à Coolify
3. Accédez au dashboard
4. Sélectionnez votre projet (ou créez-en un nouveau)

### Étape 2 : Créer une nouvelle application

1. **Cliquez sur "New Resource"** → **"Application"**
2. **Remplissez les informations initiales :**
   - **Repository URL**: `https://github.com/neliville/DUERPilot`
   - **Branch**: `main`
   - **Build Pack**: `Static` ⚠️ **IMPORTANT : Sélectionnez "Static"**
   - **Base Directory**: `/landing` ⚠️ **IMPORTANT : Doit pointer vers le dossier landing**

3. **Cliquez sur "Continue"**

### Étape 3 : Configuration générale

Dans l'onglet **"General"** :

- **Name**: `duerpilot-landing` (généré automatiquement, peut être modifié)
- **Build Pack**: `Static` (déjà sélectionné)
- **Base Directory**: `/landing` ✅
- **Static Image**: `nginx:alpine` (par défaut, laisser tel quel)
- **Custom Nginx Configuration**: Laisser vide (configuration par défaut utilisée)

### Étape 4 : Configuration du domaine

Dans la section **"Domains"** :

1. **Remplacez le domaine temporaire sslip.io** par :
   - **Domain**: `duerpilot.fr`
   - **Domain (www)**: `www.duerpilot.fr` (optionnel)

2. **Direction**: `Allow www & non-www.` (recommandé)

3. **SSL/TLS** :
   - ✅ Cochez "Generate SSL Certificate"
   - Coolify générera automatiquement un certificat Let's Encrypt
   - ✅ Activez "Redirect HTTP to HTTPS"

### Étape 5 : Configuration réseau (Network)

Dans l'onglet **"Network"** :

- **Ports Exposes**: `80` ✅ (port HTTP standard pour nginx)
- **Ports Mappings**: Laisser vide ou supprimer `3000:3000` si présent
- **Network Aliases**: Laisser vide

### Étape 6 : Configuration Health Check

Dans l'onglet **"Health Check"** :

⚠️ **IMPORTANT : Activez le health check** (recommandé par Coolify)

- ✅ **Enable Health Check**: Cocher
- **Path**: `/` ou `/index.html`
- **Port**: `80`
- **Interval**: `30` (secondes)
- **Timeout**: `5` (secondes)
- **Retries**: `3`

**Pourquoi activer le health check ?**
- Coolify détecte si le conteneur nginx ne répond plus
- Traefik ne route pas le trafic vers un conteneur down (évite erreurs 404)
- Monitoring automatique de la santé du service

### Étape 7 : Configuration Pre/Post Deployment

Dans l'onglet **"Pre/Post Deployment Commands"** :

⚠️ **IMPORTANT : Vider ces champs pour une landing statique**

- **Pre-deployment**: Laisser vide (pas de `php artisan migrate` ou autres commandes)
- **Post-deployment**: Laisser vide

**Pourquoi ?** Une landing page statique n'a pas besoin de commandes de déploiement.

### Étape 8 : Configuration avancée (Optionnel - Nginx personnalisé)

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

Si vous souhaitez une configuration Nginx personnalisée, ajoutez-la dans **"Custom Nginx Configuration"** :

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

**Note** : La configuration par défaut de Coolify est généralement suffisante pour une landing statique.

### Étape 9 : Variables d'environnement

⚠️ **IMPORTANT : Pas de variables d'environnement nécessaires**

Pour une landing page statique avec formulaire Brevo intégré :
- ✅ **Aucune variable d'environnement requise**
- Le formulaire Brevo fonctionne directement avec le script intégré dans le HTML
- Les valeurs sont hardcodées dans les fichiers JS (ou via le script Brevo)

**Si vous avez un build process** (non recommandé pour une landing statique simple), vous pourriez ajouter :
```
SITE_URL=https://duerpilot.fr
```

Mais ce n'est **pas nécessaire** pour une landing statique standard.

---

## 🚀 Déploiement

### Étape 1 : Vérification avant déploiement

Avant de cliquer sur "Deploy", vérifiez :

- [ ] Repository URL : `https://github.com/neliville/DUERPilot`
- [ ] Branch : `main`
- [ ] Build Pack : `Static` ✅
- [ ] Base Directory : `/landing` ✅
- [ ] Domaine : `duerpilot.fr` (pas le domaine sslip.io temporaire)
- [ ] SSL/TLS : Activé avec Let's Encrypt
- [ ] Health Check : Activé (Path: `/`, Port: `80`)
- [ ] Pre/Post Deployment : Vides ✅
- [ ] Ports Exposes : `80` ✅

### Étape 2 : Déclencher le déploiement

1. **Dans Coolify, cliquez sur "Deploy"** (ou "Save & Deploy")
2. **Coolify va automatiquement :**
   - Cloner le dépôt Git depuis GitHub
   - Copier le contenu du dossier `landing/` dans le conteneur nginx
   - Démarrer le conteneur nginx:alpine
   - Configurer Traefik/Caddy comme reverse proxy
   - Générer le certificat SSL Let's Encrypt
   - Configurer le health check
   - Router le trafic vers le conteneur

### Étape 3 : Surveiller le déploiement

Dans l'interface Coolify, surveillez :

- **Logs** : Consultez les logs en temps réel
  - Vérifiez qu'il n'y a pas d'erreurs
  - Le conteneur nginx devrait démarrer rapidement
- **Status** : Vérifiez que le statut passe à **"Running"** ✅
- **Health Check** : Vérifiez que le health check passe au vert (Healthy)
- **URLs** : Vérifiez que `https://duerpilot.fr` est accessible

**Temps de déploiement estimé** : 1-3 minutes pour une landing statique

### Étape 4 : Vérifier les logs

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

---

## 📋 Résumé de la Configuration Coolify

### Configuration minimale requise

```
Repository URL: https://github.com/neliville/DUERPilot
Branch: main
Build Pack: Static
Base Directory: /landing
Static Image: nginx:alpine (par défaut)
Domain: duerpilot.fr
SSL/TLS: Activé (Let's Encrypt)
Health Check: Activé (Path: /, Port: 80)
Ports Exposes: 80
Pre/Post Deployment: Vides
Variables d'environnement: Aucune
```

### Points critiques à vérifier

1. ✅ **Build Pack = "Static"** (pas "Dockerfile" ou autre)
2. ✅ **Base Directory = "/landing"** (pas "/" ou autre)
3. ✅ **Domaine = "duerpilot.fr"** (pas le domaine sslip.io temporaire)
4. ✅ **Health Check activé** (recommandé par Coolify)
5. ✅ **Pre/Post Deployment vides** (pas de commandes PHP/Laravel)

---

**Date de création** : 2026-01-11
**Dernière mise à jour** : 2026-01-11
**Version** : 2.0 (Conforme documentation Coolify)
**Auteur** : Équipe DUERPilot

