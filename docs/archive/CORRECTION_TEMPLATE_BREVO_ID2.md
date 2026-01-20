# Correction du Template Brevo ID 2 (account_activation)

## 🔍 Problème identifié

Le template Brevo utilise `{{ activation_code }}` mais le code envoie les variables via `params`, donc il faut utiliser `{{ params.activation_code }}`.

## ✅ Solution : Corriger les variables dans le template Brevo

### Étape 1 : Ouvrir le template dans Brevo

1. Allez sur https://app.brevo.com
2. **Campaigns** → **Email Templates** → **Transactional Templates**
3. Ouvrez le template **account_activation** (ID: 2)

### Étape 2 : Remplacer toutes les variables

Dans le corps HTML du template, remplacez **toutes** les occurrences :

#### ❌ Format actuel (incorrect) :
```
{{ activation_code }}
{{ support_email }}
{{ privacy_policy_url }}
{{ terms_url }}
{{ unsubscribe_url }}
```

#### ✅ Format correct (à utiliser) :
```
{{ params.activation_code }}
{{ params.support_email }}
{{ params.privacy_policy_url }}
{{ params.terms_url }}
{{ params.unsubscribe_url }}
```

### Étape 3 : Vérifier toutes les occurrences

Utilisez la fonction "Rechercher" dans l'éditeur Brevo pour trouver toutes les occurrences de `{{ ` et vérifiez qu'elles ont toutes le préfixe `params.`.

### Étape 4 : Sauvegarder et activer

1. Cliquez sur **"Save"** (Sauvegarder)
2. Cliquez sur **"Save & Activate"** (Sauvegarder et activer)
3. Le template doit être marqué comme **"Actif"**

## 📋 Liste complète des variables à corriger

| Variable incorrecte | Variable correcte |
|---------------------|-------------------|
| `{{ activation_code }}` | `{{ params.activation_code }}` |
| `{{ support_email }}` | `{{ params.support_email }}` |
| `{{ privacy_policy_url }}` | `{{ params.privacy_policy_url }}` |
| `{{ terms_url }}` | `{{ params.terms_url }}` |
| `{{ unsubscribe_url }}` | `{{ params.unsubscribe_url }}` |

## 🧪 Tester après correction

### Test 1 : Test manuel dans Brevo

1. Dans le template Brevo, cliquez sur **"Send a test email"**
2. Remplissez les variables de test :
   ```
   activation_code: 123456
   support_email: support@duerpilot.fr
   privacy_policy_url: https://duerpilot.fr/legal/privacy
   terms_url: https://duerpilot.fr/legal/terms
   unsubscribe_url: https://duerpilot.fr/settings/notifications
   ```
3. Envoyez à votre email de test
4. **Vérifiez que le code `123456` apparaît bien dans l'email**

### Test 2 : Test via script

```bash
pnpm exec tsx scripts/test-activation-email.ts votre-email@test.com
```

### Test 3 : Test réel d'inscription

1. Créez un nouveau compte sur l'application
2. Vérifiez que l'email d'activation arrive avec le code visible

## ⚠️ Points importants

1. **Espacement** : Utilisez `{{ params.variable }}` avec des espaces autour de `params`
2. **Case-sensitive** : Les noms de variables sont sensibles à la casse
3. **Activation** : Le template doit être **actif** pour être utilisé
4. **Sauvegarde** : N'oubliez pas de sauvegarder ET activer le template

## 🔍 Vérification post-correction

Après avoir corrigé le template, vérifiez :

- [ ] Toutes les variables utilisent `{{ params.xxx }}`
- [ ] Le template est sauvegardé
- [ ] Le template est activé (statut "Actif")
- [ ] Le test manuel dans Brevo fonctionne
- [ ] Le script de test fonctionne
- [ ] L'inscription réelle envoie bien le code

## 📞 Si ça ne fonctionne toujours pas

1. Vérifiez les logs du serveur Next.js pour les erreurs API
2. Vérifiez les logs Brevo dans **Statistics** → **Email Logs**
3. Vérifiez que `BREVO_API_KEY` est correctement configuré dans `.env`
4. Vérifiez que le template ID `2` correspond bien dans `server/services/email/templates.ts`
