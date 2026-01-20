# Accès au Frontend de l'Application DUERPilot

## 🚀 Démarrage rapide

### 1. Lancer le serveur de développement

```bash
# Depuis le répertoire racine du projet
pnpm dev
```

Le serveur Next.js démarre sur **http://localhost:3000** par défaut.

### 2. Accéder à l'application

Une fois le serveur démarré, ouvrez votre navigateur et accédez à :

- **Application principale** : http://localhost:3000
- **Landing page** : http://localhost:3000/landing (ou `/public/landing/index.html`)

### 3. URLs importantes

#### Application métier
- **Page d'accueil** : http://localhost:3000/
- **Connexion** : http://localhost:3000/auth/signin
- **Inscription** : http://localhost:3000/auth/signup
- **Onboarding** : http://localhost:3000/onboarding
- **Dashboard** : http://localhost:3000/dashboard
- **Admin** : http://localhost:3000/admin

#### Landing page
- **Landing principale** : http://localhost:3000/landing/index.html
- **Confirmation waitlist** : http://localhost:3000/landing/confirmation.html
- **Mentions légales** : http://localhost:3000/landing/legal/mentions-legales.html
- **Politique de confidentialité** : http://localhost:3000/landing/legal/politique-confidentialite.html

### 4. Commandes utiles

```bash
# Démarrer le serveur de développement
pnpm dev

# Build de production
pnpm build

# Démarrer le serveur de production
pnpm start

# Vérifier les types TypeScript
pnpm type-check

# Linter
pnpm lint

# Générer le client Prisma
pnpm db:generate

# Appliquer les migrations
pnpm db:push

# Seed la base de données
pnpm db:seed

# Ouvrir Prisma Studio (interface DB)
pnpm db:studio
```

## ⚙️ Configuration requise

### Variables d'environnement

Assurez-vous d'avoir configuré les variables d'environnement dans `.env` :

```env
# Base de données
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Autres variables nécessaires...
```

### Port personnalisé

Pour changer le port, modifiez le script dans `package.json` :

```json
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

Ou utilisez une variable d'environnement :

```bash
PORT=3001 pnpm dev
```

## 🔍 Dépannage

### Le serveur ne démarre pas

1. Vérifiez que le port 3000 est libre :
```bash
lsof -i :3000
# Si occupé, tuez le processus ou changez le port
```

2. Vérifiez que toutes les dépendances sont installées :
```bash
pnpm install
```

3. Vérifiez que la base de données est accessible :
```bash
pnpm db:generate
```

### Erreurs de build

```bash
# Nettoyage et rebuild
rm -rf .next node_modules
pnpm install
pnpm dev
```

### Problèmes de base de données

```bash
# Générer le client Prisma
pnpm db:generate

# Appliquer les migrations
pnpm db:push

# Vérifier la connexion
pnpm db:studio
```

## 📝 Notes

- Le serveur de développement inclut le Hot Module Replacement (HMR) pour un rechargement automatique
- Les logs sont affichés dans la console où vous avez lancé `pnpm dev`
- Pour accéder à l'application en production, utilisez `pnpm build` puis `pnpm start`

