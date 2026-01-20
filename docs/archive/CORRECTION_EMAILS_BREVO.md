# ✅ Correction Configuration Emails Brevo

## 🎯 Objectif

Corriger définitivement la configuration des emails transactionnels Brevo pour améliorer la délivrabilité et éviter le spam.

## ✅ Corrections Appliquées

### 1. Suppression du Reply-To explicite dans le code

**Avant** : Le `replyTo` était défini explicitement dans le body de la requête API, ce qui surchargeait la configuration Brevo.

**Après** : Le `replyTo` n'est plus défini dans le code. Il doit être configuré dans chaque template Brevo :
- **FROM** : `noreply@duerpilot.fr` (configuré dans le template Brevo)
- **REPLY_TO** : `support@duerpilot.fr` (configuré dans le template Brevo)

**Fichier modifié** : `server/services/email/brevo-service.ts`

### 2. Amélioration des logs

**Ajout de logs clairs** :
- ✅ Log de démarrage d'envoi avec détails (template, destinataire, templateId Brevo)
- ✅ Log de succès avec messageId Brevo
- ✅ Log d'erreur détaillé avec statut HTTP, message d'erreur, et stack trace
- ✅ Validation des variables d'environnement avec messages d'erreur explicites

**Fichier modifié** : `server/services/email/brevo-service.ts`

### 3. Validation stricte des adresses email

**Ajout de vérifications** :
- ✅ Vérification qu'aucune adresse Gmail n'est utilisée (FROM ou REPLY_TO)
- ✅ Vérification que FROM est une adresse noreply
- ✅ Vérification que REPLY_TO est une adresse support

**Fichier modifié** : `server/services/email/config.ts`

### 4. Vérification que l'email est envoyé APRÈS création utilisateur

**État actuel** : ✅ Déjà correct
- L'email d'activation est envoyé après la création de `UserProfile` et `User`
- L'envoi est non-bloquant (`.catch()` pour ne pas bloquer l'inscription)
- L'utilisateur peut demander un nouveau code via `resendVerificationCode` si l'envoi échoue

**Fichier vérifié** : `server/api/routers/auth.ts` (lignes 90-101)

## ⚠️ Configuration Requise dans Brevo

### Templates Brevo

Pour chaque template transactionnel (account_activation, password_reset, etc.), vous devez configurer dans Brevo :

1. **FROM (Expéditeur)** :
   - Email : `noreply@duerpilot.fr`
   - Nom : `DUERPilot`

2. **REPLY_TO (Adresse de réponse)** :
   - Email : `support@duerpilot.fr`
   - Nom : `Support DUERPilot`

**Comment configurer dans Brevo** :
1. Connectez-vous à votre compte Brevo
2. Allez dans **Marketing > Email > Templates**
3. Ouvrez chaque template transactionnel
4. Dans les paramètres du template, configurez :
   - **Expéditeur** : `noreply@duerpilot.fr`
   - **Répondre à** : `support@duerpilot.fr`

### Variables d'Environnement

Assurez-vous que les variables suivantes sont configurées dans votre `.env` :

```bash
# API Brevo (obligatoire)
BREVO_API_KEY=votre_clé_api_brevo

# Configuration email (optionnel, valeurs par défaut si non défini)
EMAIL_FROM=noreply@duerpilot.fr
EMAIL_REPLY_TO=support@duerpilot.fr
EMAIL_CONTACT=contact@duerpilot.fr
EMAIL_SENDER_NAME=DUERPilot
```

**Important** : Les variables `EMAIL_FROM` et `EMAIL_REPLY_TO` sont utilisées uniquement pour :
- Validation et logs
- Référence dans le code (non envoyées à Brevo si configurées dans les templates)

## 📋 Checklist de Configuration Brevo

Pour chaque template transactionnel, vérifiez :

- [ ] **FROM configuré** : `noreply@duerpilot.fr` (pas d'adresse Gmail)
- [ ] **REPLY_TO configuré** : `support@duerpilot.fr` (pas d'adresse Gmail)
- [ ] **Template ID correct** : Correspond à `brevoTemplateId` dans `server/services/email/templates.ts`
- [ ] **Variables du template** : Toutes les variables nécessaires sont définies dans le template Brevo
- [ ] **Domaine authentifié** : Le domaine `duerpilot.fr` est authentifié dans Brevo (DKIM, SPF, DMARC)

## 🔍 Vérification

### Logs de succès

Lorsqu'un email est envoyé avec succès, vous verrez dans les logs :

```
📧 [Email account_activation] Envoi à user@example.com via template Brevo #2
   FROM (configuré dans Brevo): noreply@duerpilot.fr
   REPLY_TO (configuré dans Brevo): support@duerpilot.fr
✅ [Email account_activation] Email envoyé avec succès à user@example.com (messageId: xxxxx-xxxxx-xxxxx)
```

### Logs d'erreur

En cas d'erreur, vous verrez :

```
❌ [Email account_activation] Échec envoi à user@example.com: {
  status: 400,
  statusText: 'Bad Request',
  error: { message: 'Template not found', code: 'invalid_template_id' }
}
```

## 🚨 Erreurs Courantes

### 1. "BREVO_API_KEY non configuré"

**Solution** : Vérifiez que `BREVO_API_KEY` est défini dans votre `.env` et redémarrez le serveur.

### 2. "Configuration email invalide : adresse Gmail détectée"

**Solution** : Vérifiez vos variables d'environnement :
- `EMAIL_FROM` doit être `noreply@duerpilot.fr` (pas Gmail)
- `EMAIL_REPLY_TO` doit être `support@duerpilot.fr` (pas Gmail)

### 3. "Template not found" ou "Invalid template ID"

**Solution** : Vérifiez que le `brevoTemplateId` dans `server/services/email/templates.ts` correspond à l'ID réel du template dans Brevo.

### 4. Les emails arrivent en spam

**Solutions** :
- Vérifiez que le domaine `duerpilot.fr` est authentifié dans Brevo (DKIM, SPF, DMARC)
- Vérifiez que FROM et REPLY_TO sont configurés dans les templates Brevo
- Vérifiez que le contenu des emails ne déclenche pas de filtres anti-spam
- Surveillez la réputation de votre domaine

## 📝 Notes Importantes

1. **Ne pas surcharger Reply-To dans le code** : Le `replyTo` n'est plus défini dans le code pour laisser Brevo utiliser la configuration des templates.

2. **Configuration dans Brevo obligatoire** : Le FROM et REPLY_TO doivent être configurés dans chaque template Brevo. Le code ne les définit plus explicitement.

3. **Logs améliorés** : Tous les envois sont maintenant loggés avec des messages clairs pour faciliter le debugging.

4. **Validation stricte** : Le code vérifie maintenant qu'aucune adresse Gmail n'est utilisée.

5. **Email après création utilisateur** : L'email d'activation est envoyé APRÈS la création de l'utilisateur en base (non bloquant).

## ✅ Résultat Final

- ✅ Les emails sont envoyés depuis `noreply@duerpilot.fr` (configuré dans Brevo)
- ✅ Le bouton "Répondre" pointe vers `support@duerpilot.fr` (configuré dans Brevo)
- ✅ Aucune adresse Gmail n'est utilisée
- ✅ Les logs sont clairs et détaillés
- ✅ L'email d'activation est envoyé après création utilisateur
- ✅ Configuration centralisée et maintenable

---

**Dernière mise à jour** : Décembre 2024  
**Statut** : ✅ Corrections appliquées

