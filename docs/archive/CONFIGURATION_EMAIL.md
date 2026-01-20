# 📧 Configuration Email - DUERPilot

## 🎯 Vue d'ensemble

L'application utilise **3 adresses email** de manière stricte et professionnelle pour garantir une communication cohérente et conforme aux bonnes pratiques SaaS.

## 📋 Adresses Email

### 1️⃣ `noreply@duerpilot.fr` - Email Système

**Rôle :** Adresse d'expéditeur (FROM) pour tous les emails automatiques

**Utilisation :**
- ✅ Activation de compte
- ✅ Réinitialisation de mot de passe
- ✅ Notifications automatiques (actions, échéances, exports)
- ✅ Alertes système (quota atteint, expiration, etc.)

**⚠️ Règles strictes :**
- Aucune réponse utilisateur ne doit être attendue sur cette adresse
- Les emails doivent indiquer clairement "Ne pas répondre à cet email"
- Utilisée uniquement comme adresse d'expéditeur

### 2️⃣ `support@duerpilot.fr` - Support Utilisateur

**Rôle :** Adresse de réponse (REPLY-TO) pour tous les emails

**Utilisation :**
- ✅ Adresse de réponse par défaut (REPLY-TO) pour tous les emails système
- ✅ Support produit et fonctionnel
- ✅ Affichée dans l'interface de l'application
- ✅ Affichée dans les signatures email
- ✅ Support client

**⚠️ Règles strictes :**
- Toujours utilisée comme REPLY-TO
- Jamais utilisée comme FROM
- Adresse principale de support affichée aux utilisateurs

### 3️⃣ `contact@duerpilot.fr` - Commercial / Relation Externe

**Rôle :** Contact commercial et relation externe uniquement

**Utilisation :**
- ✅ Formulaire de contact du site vitrine
- ✅ Demandes commerciales
- ✅ Partenariats
- ✅ Presse / organismes externes

**⚠️ Règles strictes :**
- Ne jamais utiliser pour des emails automatiques
- Ne pas utiliser pour le support technique
- Utilisée uniquement pour les communications externes/commerciales

## ⚙️ Configuration

### Variables d'environnement

```env
# Adresse d'expéditeur (FROM) pour tous les emails automatiques
EMAIL_FROM=noreply@duerpilot.fr

# Adresse de réponse (REPLY-TO) pour tous les emails
EMAIL_REPLY_TO=support@duerpilot.fr

# Adresse de contact commercial
EMAIL_CONTACT=contact@duerpilot.fr

# Nom d'affichage pour l'expéditeur
EMAIL_SENDER_NAME=DUERPilot
```

### Valeurs par défaut

Si les variables d'environnement ne sont pas définies, les valeurs par défaut sont :
- `EMAIL_FROM`: `noreply@duerpilot.fr`
- `EMAIL_REPLY_TO`: `support@duerpilot.fr`
- `EMAIL_CONTACT`: `contact@duerpilot.fr`
- `EMAIL_SENDER_NAME`: `DUERPilot`

## 🏗️ Architecture

### Service de configuration

Le service `server/services/email/config.ts` centralise toute la configuration email :

```typescript
import { EMAIL_ADDRESSES, getStandardEmailConfig } from '@/server/services/email/config';

// Configuration standard pour tous les emails automatiques
const config = getStandardEmailConfig();
// {
//   from: { email: 'noreply@duerpilot.fr', name: 'DUERPilot' },
//   replyTo: { email: 'support@duerpilot.fr', name: 'Support DUERPilot' }
// }
```

### Service Brevo

Le service `server/services/email/brevo-service.ts` utilise automatiquement la configuration standard :

- **FROM** : `noreply@duerpilot.fr`
- **REPLY-TO** : `support@duerpilot.fr`

Tous les emails envoyés via Brevo utilisent cette configuration par défaut.

### Triggers email

Le service `server/services/email/triggers.ts` utilise `EMAIL_ADDRESSES.REPLY_TO` pour les variables de template (comme `support_email`).

## 📝 Utilisation dans le code

### Envoi d'email standard (automatique)

```typescript
import { sendTransactionalEmail } from '@/server/services/email/brevo-service';

await sendTransactionalEmail({
  templateId: 'account_activation',
  to: user.email,
  userId: user.id,
  tenantId: user.tenantId,
  variables: {
    activation_code: code,
    support_email: EMAIL_ADDRESSES.REPLY_TO, // support@duerpilot.fr
    // ...
  },
});
```

### Contact commercial

```typescript
import { getCommercialEmailConfig } from '@/server/services/email/config';

const config = getCommercialEmailConfig();
// {
//   from: { email: 'contact@duerpilot.fr', name: 'DUERPilot - Contact' },
//   replyTo: { email: 'contact@duerpilot.fr', name: 'DUERPilot - Contact' }
// }
```

## ✅ Validation

Le service de configuration valide automatiquement que :
- `EMAIL_FROM` contient "noreply" ou "no-reply"
- `EMAIL_REPLY_TO` contient "support"
- Toutes les adresses sont des emails valides

Un avertissement est affiché au démarrage si la configuration est non conforme.

## 🔒 Sécurité et Conformité

### RGPD

- Tous les emails respectent les préférences utilisateur
- Les emails transactionnels légaux ne peuvent pas être désactivés
- Traçabilité complète via `EmailLog`

### Bonnes pratiques

- ✅ Configuration centralisée (pas de hardcoding)
- ✅ Séparation claire des rôles (FROM vs REPLY-TO)
- ✅ Validation automatique de la configuration
- ✅ Compatible environnement local et production
- ✅ Prêt pour la montée en charge

## 🚫 Interdictions

- ❌ Pas de logique email directement dans les controllers
- ❌ Pas d'adresses email en dur disséminées dans le code
- ❌ Pas de gestion d'envoi côté frontend
- ❌ Ne pas laisser Brevo décider des adresses
- ❌ Ne jamais utiliser `contact@duerpilot.fr` pour les emails automatiques

## 📌 Récapitulatif

| Adresse | Rôle | Utilisation |
|---------|------|-------------|
| `noreply@duerpilot.fr` | FROM | Tous les emails automatiques |
| `support@duerpilot.fr` | REPLY-TO | Support, réponses utilisateurs |
| `contact@duerpilot.fr` | FROM/REPLY-TO | Contact commercial uniquement |

**Brevo** = outil d'envoi uniquement  
**Application** = cerveau de la logique email

