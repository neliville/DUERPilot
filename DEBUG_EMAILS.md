# Debug : Emails d'inscription non envoyés

## 🔍 Diagnostic rapide

### 1. Vérifier la configuration Brevo

```bash
# Vérifier que BREVO_API_KEY est défini
cd /home/neliville/dev/LAB/PROJECTS/duerpilot
grep BREVO_API_KEY .env || echo "❌ BREVO_API_KEY non trouvé dans .env"
```

### 2. Vérifier les logs du serveur

Lorsqu'un utilisateur s'inscrit, vérifiez les logs dans la console où vous avez lancé `pnpm dev`.

Recherchez ces messages :
- ✅ `Email envoyé` : Email envoyé avec succès
- ❌ `Erreur envoi email` : Erreur lors de l'envoi
- ❌ `BREVO_API_KEY non configuré` : Clé API manquante
- ❌ `Brevo API error` : Erreur de l'API Brevo

### 3. Vérifier les logs de la base de données

```bash
pnpm db:studio
```

Puis allez dans la table `EmailLog` et vérifiez :
- Le **statut** : `sent`, `failed`, ou `blocked`
- L'**erreur** éventuelle dans la colonne `error`
- Le **templateId** utilisé (doit être `account_activation`)
- La **date** d'envoi

## ✅ Solutions

### Solution 1 : Configurer BREVO_API_KEY

Si `BREVO_API_KEY` n'est pas configuré :

1. Obtenir la clé API Brevo :
   - Aller sur https://app.brevo.com
   - **Paramètres** → **API Keys**
   - Créer une nouvelle clé ou utiliser une existante
   - Copier la clé (format : `xkeysib-...`)

2. Ajouter à `.env` :
   ```env
   BREVO_API_KEY=xkeysib-votre-cle-api-brevo
   ```

3. Redémarrer le serveur :
   ```bash
   # Arrêter le serveur (Ctrl+C)
   pnpm dev
   ```

### Solution 2 : Créer le template Brevo

Si le template `account_activation` n'existe pas dans Brevo :

1. Dans Brevo, aller dans **Campaigns** → **Email Templates**
2. Créer un nouveau template transactionnel
3. Nommer le template : `account_activation`
4. Ajouter les variables suivantes :
   ```
   {{ activation_code }}
   {{ support_email }}
   {{ privacy_policy_url }}
   {{ terms_url }}
   {{ unsubscribe_url }}
   ```
5. Noter l'**ID du template** (visible dans l'URL ou les paramètres)
6. Mettre à jour `server/services/email/templates.ts` :
   ```typescript
   account_activation: {
     brevoTemplateId: VOTRE_ID_REEL, // ← Remplacer par l'ID réel
     // ...
   }
   ```

### Solution 3 : Vérifier le domaine d'envoi

Si le domaine d'envoi n'est pas vérifié dans Brevo :

1. Dans Brevo, aller dans **Paramètres** → **Domains**
2. Vérifier que votre domaine est vérifié
3. Ou utiliser l'adresse par défaut de Brevo (si disponible)

### Solution 4 : Mode développement - Désactiver l'envoi

Pour le développement local, vous pouvez temporairement désactiver l'envoi d'emails en modifiant `server/services/email/brevo-service.ts` :

```typescript
async function sendViaBrevo(...) {
  // Mode développement : logger au lieu d'envoyer
  if (process.env.NODE_ENV === 'development' && !process.env.BREVO_API_KEY) {
    console.log('📧 [DEV] Email simulé:', {
      templateId: params.templateId,
      to: params.to,
      variables: params.variables,
    });
    
    // Logger comme envoyé pour les tests
    await prisma.emailLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        email: params.to,
        templateId: params.templateId,
        category: template.category,
        variables: params.variables,
        status: 'sent',
        error: 'Simulé en mode développement',
      },
    });
    
    return { success: true, messageId: 'dev-simulated' };
  }
  
  // Code normal...
}
```

⚠️ **Important** : Retirer ce code en production !

## 🧪 Test rapide

Pour tester rapidement si l'envoi d'emails fonctionne :

1. **Créer un compte test** :
   - Aller sur http://localhost:3000/auth/signin
   - Mode inscription
   - Créer un compte avec un email valide

2. **Vérifier les logs** :
   ```bash
   # Dans la console du serveur, rechercher :
   # - "Email envoyé" ou "Erreur envoi email"
   ```

3. **Vérifier la base de données** :
   ```bash
   pnpm db:studio
   # Table EmailLog → Vérifier le statut et l'erreur
   ```

## 📝 Checklist de configuration

- [ ] `BREVO_API_KEY` est configuré dans `.env`
- [ ] Le template `account_activation` existe dans Brevo
- [ ] L'ID du template est correct dans `templates.ts` (ligne 21)
- [ ] Toutes les variables sont dans le template Brevo
- [ ] Le domaine d'envoi est vérifié dans Brevo
- [ ] Le serveur a été redémarré après modification de `.env`
- [ ] Les logs du serveur ne montrent pas d'erreurs
- [ ] Les logs Brevo (interface web) montrent que l'email a été envoyé

## 🔗 Documentation complète

Pour plus de détails, consultez :
- `docs/CONFIGURATION_EMAILS_INSCRIPTION.md` : Guide complet de configuration
- `GUIDE_TEMPLATES_BREVO.md` : Guide de création des templates Brevo
- `CONFIGURATION_TEMPLATE_ACTIVATION.md` : Configuration spécifique du template d'activation

