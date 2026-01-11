# 📋 Prochaines Étapes - Configuration Emails Brevo

## ✅ Ce qui a été fait

1. ✅ Code corrigé (`brevo-service.ts`, `config.ts`)
2. ✅ Reply-To retiré du code (laissé à Brevo)
3. ✅ Logs améliorés
4. ✅ Validation Gmail ajoutée
5. ✅ Documentation créée

## 🎯 Prochaines Actions Requises

### 1. Configuration dans Brevo Dashboard (OBLIGATOIRE)

#### A. Vérifier/Créer les templates transactionnels

Pour chaque template (account_activation, password_reset, etc.) :

1. **Se connecter à Brevo** : https://app.brevo.com
2. **Aller dans** : Marketing > Email > Templates
3. **Pour chaque template** :
   - Ouvrir le template (ou le créer s'il n'existe pas)
   - **Dans les paramètres du template** :
     - **Expéditeur (FROM)** : `noreply@duerpilot.fr`
     - **Nom expéditeur** : `DUERPilot`
     - **Répondre à (REPLY_TO)** : `support@duerpilot.fr`
     - **Nom répondre à** : `Support DUERPilot`

#### B. Vérifier les IDs des templates

Assurez-vous que les IDs dans `server/services/email/templates.ts` correspondent aux IDs réels dans Brevo :

```typescript
account_activation: { brevoTemplateId: 2, ... }
password_reset: { brevoTemplateId: 3, ... }
// etc.
```

**Comment trouver l'ID d'un template dans Brevo** :
1. Ouvrir le template
2. L'ID est visible dans l'URL : `https://app.brevo.com/email/templates/edit/[ID]`
3. Ou dans les paramètres du template

#### C. Configurer les variables dans les templates Brevo

Vérifiez que chaque template utilise bien les variables passées via `params` :

- **account_activation** : `{{params.activation_code}}`, `{{params.support_email}}`, etc.
- **password_reset** : `{{params.firstName}}`, `{{params.resetLink}}`, etc.

### 2. Vérifier les Variables d'Environnement

#### A. Vérifier `.env`

Assurez-vous que votre fichier `.env` contient :

```bash
# API Brevo (OBLIGATOIRE)
BREVO_API_KEY=votre_clé_api_brevo_ici

# Configuration email (optionnel, valeurs par défaut si non défini)
EMAIL_FROM=noreply@duerpilot.fr
EMAIL_REPLY_TO=support@duerpilot.fr
EMAIL_CONTACT=contact@duerpilot.fr
EMAIL_SENDER_NAME=DUERPilot
```

#### B. Redémarrer le serveur

Après modification des variables d'environnement :

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
pnpm dev
```

### 3. Authentifier le Domaine (IMPORTANT pour la délivrabilité)

Pour éviter que les emails arrivent en spam, authentifiez le domaine `duerpilot.fr` dans Brevo :

1. **Se connecter à Brevo**
2. **Aller dans** : Settings > Senders & IP > Domains
3. **Ajouter le domaine** : `duerpilot.fr`
4. **Configurer les enregistrements DNS** :
   - **DKIM** : Ajouter l'enregistrement TXT fourni par Brevo
   - **SPF** : Ajouter `include:spf.brevo.com` à votre enregistrement SPF
   - **DMARC** : Configurer un enregistrement DMARC (optionnel mais recommandé)

**Important** : La propagation DNS peut prendre jusqu'à 48h.

### 4. Tester l'Envoi d'Emails

#### A. Test d'inscription

1. **Lancer l'application** : `pnpm dev`
2. **S'inscrire avec un email de test** : https://localhost:3000/auth/signin
3. **Vérifier les logs** dans le terminal :
   ```
   📧 [Email account_activation] Envoi à test@example.com via template Brevo #2
      FROM (configuré dans Brevo): noreply@duerpilot.fr
      REPLY_TO (configuré dans Brevo): support@duerpilot.fr
   ✅ [Email account_activation] Email envoyé avec succès à test@example.com (messageId: xxxxx)
   ```
4. **Vérifier la réception** de l'email dans la boîte de test
5. **Vérifier le FROM** : doit être `noreply@duerpilot.fr`
6. **Vérifier le REPLY_TO** : cliquer sur "Répondre" doit pré-remplir `support@duerpilot.fr`

#### B. Vérifier les logs dans la base de données

```bash
# Ouvrir Prisma Studio
pnpm db:studio

# Vérifier la table EmailLog
# Vous devriez voir :
# - status: 'sent'
# - brevoMessageId: [ID du message Brevo]
# - templateId: 'account_activation'
# - email: [email de test]
```

### 5. Vérifier la Délivrabilité

#### A. Vérifier que les emails arrivent en boîte principale (pas en spam)

- ✅ Email reçu dans la boîte principale
- ✅ FROM affiché correctement : `noreply@duerpilot.fr`
- ✅ REPLY_TO fonctionne : "Répondre" pointe vers `support@duerpilot.fr`
- ✅ Contenu du template affiché correctement
- ✅ Variables remplacées (`{{params.activation_code}}`, etc.)

#### B. Vérifier les métriques dans Brevo

1. **Aller dans** : Statistics > Email > Transactional
2. **Vérifier** :
   - Taux de délivrabilité (doit être > 95%)
   - Taux d'ouverture (si tracking activé)
   - Taux de clics (si tracking activé)
   - Emails en erreur (doit être 0 ou très faible)

#### C. Outils de vérification

- **MXToolbox** : https://mxtoolbox.com/SuperTool.aspx
  - Vérifier SPF, DKIM, DMARC
  - Vérifier la réputation du domaine
- **Mail-Tester** : https://www.mail-tester.com
  - Envoyer un email à l'adresse fournie
  - Obtenir un score de délivrabilité

### 6. Monitoring et Maintenance

#### A. Surveiller les logs d'erreur

Si des erreurs apparaissent dans les logs :

```
❌ [Email account_activation] Échec envoi à user@example.com: {
  status: 400,
  statusText: 'Bad Request',
  error: { message: 'Template not found', code: 'invalid_template_id' }
}
```

**Actions** :
- Vérifier que le `brevoTemplateId` est correct
- Vérifier que le template existe dans Brevo
- Vérifier que les variables du template correspondent

#### B. Surveiller les emails bloqués

Vérifier régulièrement dans la base de données (`EmailLog`) :
- `status: 'blocked'` → Préférences utilisateur
- `status: 'failed'` → Erreurs d'envoi

## 📝 Checklist de Validation

### Configuration Code
- [x] `replyTo` supprimé du code (laissé à Brevo)
- [x] `sender` configuré avec `noreply@duerpilot.fr`
- [x] Logs améliorés
- [x] Validation Gmail ajoutée

### Configuration Brevo
- [ ] Templates créés/modifiés dans Brevo
- [ ] FROM configuré : `noreply@duerpilot.fr`
- [ ] REPLY_TO configuré : `support@duerpilot.fr`
- [ ] IDs des templates vérifiés/corrigés
- [ ] Variables des templates configurées (`{{params.*}}`)

### Variables d'Environnement
- [ ] `BREVO_API_KEY` configuré
- [ ] `EMAIL_FROM` configuré (optionnel)
- [ ] `EMAIL_REPLY_TO` configuré (optionnel)
- [ ] Serveur redémarré après modification

### Authentification Domaine
- [ ] Domaine `duerpilot.fr` ajouté dans Brevo
- [ ] DKIM configuré dans DNS
- [ ] SPF configuré dans DNS
- [ ] DMARC configuré (optionnel)
- [ ] Vérification DNS réussie (48h max)

### Tests
- [ ] Test d'inscription : email reçu
- [ ] FROM correct : `noreply@duerpilot.fr`
- [ ] REPLY_TO correct : `support@duerpilot.fr`
- [ ] Variables remplacées correctement
- [ ] Email en boîte principale (pas en spam)
- [ ] Logs corrects dans le terminal
- [ ] Logs corrects dans la base de données

### Délivrabilité
- [ ] Taux de délivrabilité > 95%
- [ ] Aucun email Gmail utilisé
- [ ] Score Mail-Tester > 8/10 (optionnel)

## 🚨 En Cas de Problème

### Email non reçu

1. **Vérifier les logs** : Message d'erreur ?
2. **Vérifier Brevo** : Email dans les statistiques ?
3. **Vérifier spam** : Email en spam ?
4. **Vérifier variables** : Template ID correct ?

### Email en spam

1. **Authentifier le domaine** : DKIM, SPF configurés ?
2. **Vérifier le contenu** : Éviter mots-clés spam
3. **Vérifier la réputation** : Domaine récent ?
4. **Chauffer l'IP** : Envoyer progressivement

### REPLY_TO incorrect

1. **Vérifier Brevo** : REPLY_TO configuré dans le template ?
2. **Vérifier le code** : `replyTo` bien commenté ?
3. **Tester** : Envoyer un email et cliquer "Répondre"

## 📞 Support

- **Documentation Brevo** : https://developers.brevo.com/docs
- **Support Brevo** : https://help.brevo.com
- **Documentation interne** : `CORRECTION_EMAILS_BREVO.md`

---

**Dernière mise à jour** : Décembre 2024  
**Statut** : ⏳ En attente de configuration Brevo

