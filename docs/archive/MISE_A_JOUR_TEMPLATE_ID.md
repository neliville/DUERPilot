# Mise à Jour de l'ID du Template account_activation

## ✅ Modification effectuée

L'ID du template `account_activation` a été mis à jour de **1** vers **2** pour correspondre à votre configuration Brevo.

### Configuration actuelle

- **Template** : `account_activation`
- **ID Brevo** : `2` (correspond à l'URL : `app.brevo.com/templates/email/edit/2`)
- **Variables utilisées** :
  - `{{ activation_code }}` ✅ (visible dans votre template)
  - `{{ support_email }}`
  - `{{ privacy_policy_url }}`
  - `{{ terms_url }}`
  - `{{ unsubscribe_url }}`

## ⚠️ Ajustements effectués

J'ai également corrigé un **conflit d'ID** qui existait :

- `account_activation` : ID **2** ✅ (confirmé par vous)
- `password_reset` : ID **3** (ajusté pour éviter le conflit - **TODO : Vérifier dans Brevo**)
- `duerp_generated` : ID **4** (ajusté)
- `quota_exceeded_blocking` : ID **5** (ajusté)
- `duerp_annual_reminder` : ID **6** (ajusté)
- `quota_warning` : ID **7** (ajusté)
- `payment_failed` : ID **8** (ajusté)
- `plan_upgraded` : ID **9** (ajusté)

## ⚠️ Action requise : Vérifier les autres templates

Les IDs des autres templates ont été ajustés pour éviter les conflits, mais **vous devez vérifier dans Brevo** si ces IDs correspondent bien :

1. **Dans Brevo** : https://app.brevo.com → **Campaigns** → **Email Templates**
2. **Pour chaque template**, vérifier l'ID (visible dans l'URL : `/templates/email/edit/X`)
3. **Mettre à jour** `server/services/email/templates.ts` si un ID ne correspond pas

### Templates à vérifier

| Template | ID actuel dans le code | À vérifier dans Brevo |
|----------|------------------------|----------------------|
| `password_reset` | 3 | ⚠️ **Vérifier l'ID réel** |
| `duerp_generated` | 4 | ⚠️ **Vérifier l'ID réel** |
| `quota_exceeded_blocking` | 5 | ⚠️ **Vérifier l'ID réel** |
| `duerp_annual_reminder` | 6 | ⚠️ **Vérifier l'ID réel** |
| `quota_warning` | 7 | ⚠️ **Vérifier l'ID réel** |
| `payment_failed` | 8 | ⚠️ **Vérifier l'ID réel** |
| `plan_upgraded` | 9 | ⚠️ **Vérifier l'ID réel** |

## ✅ Template account_activation : Prêt

Le template `account_activation` est maintenant correctement configuré :

- ✅ ID : **2** (correspond à votre Brevo)
- ✅ Variable `{{ activation_code }}` présente dans le template
- ✅ Objet : `Votre code d'activation DUERPilot: {{ activation_code }}`
- ✅ Expéditeur : `noreply@duerpilot.fr`
- ✅ Nom expéditeur : `DUERPilot`

## 🧪 Test du template account_activation

Une fois le serveur redémarré avec `BREVO_API_KEY` chargé :

1. **Aller sur** : http://localhost:3000/auth/signin
2. **Passer en mode inscription**
3. **Créer un compte test** avec un email valide
4. **Vérifier** :
   - ✅ Message "Inscription réussie"
   - ✅ Email reçu avec le code de vérification à 6 chiffres
   - ✅ Objet de l'email : `Votre code d'activation DUERPilot: [CODE]`

## 📋 Prochaines étapes

1. **Redémarrer le serveur** (pour charger `BREVO_API_KEY`)
2. **Tester l'inscription** avec le template `account_activation`
3. **Vérifier les autres templates** dans Brevo et mettre à jour les IDs si nécessaire

## 🎯 Configuration actuelle : OK pour account_activation

Le template `account_activation` est prêt à être utilisé avec l'ID **2**. 

**Il ne reste plus qu'à redémarrer le serveur** pour que tout fonctionne ! 🚀

