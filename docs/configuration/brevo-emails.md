# Configuration Brevo (Emails)

**Service :** Brevo (anciennement Sendinblue)  
**Statut :** ✅ Configuré et fonctionnel

---

## 📧 Templates Configurés

### Template ID 2 - Activation de Compte
**Nom :** Activation de compte DUERPilot  
**Objet :** Activez votre compte DUERPilot

**Variables :**
- `{{ params.activationCode }}` - Code d'activation à 6 chiffres
- `{{ params.userEmail }}` - Email de l'utilisateur
- `{{ params.userName }}` - Nom de l'utilisateur (optionnel)

**Format du code :** 6 chiffres (ex: 848799)

**Utilisation :**
```typescript
await sendEmail({
  to: user.email,
  templateId: 2,
  params: {
    activationCode: code,
    userEmail: user.email,
    userName: user.name || 'Utilisateur'
  }
});
```

---

## 🔑 Configuration

### Variables d'Environnement
```env
BREVO_API_KEY=xkeysib-xxxxx
BREVO_TEMPLATE_ACTIVATION_ID=2
```

### Service Email
Fichier : `server/services/email/brevo.ts`

Fonctions disponibles :
- `sendActivationEmail(email, code, name?)` - Envoie le code d'activation
- `sendEmail(to, templateId, params)` - Fonction générique

---

## ✅ Tests

### Test d'Envoi
```bash
# Via le router tRPC
pnpm exec tsx scripts/test-brevo-email.ts
```

### Vérification
1. Email reçu dans les 2-5 minutes
2. Code d'activation à 6 chiffres présent
3. Lien vers la page de login fonctionnel

---

## 🐛 Dépannage

### Email non reçu
1. Vérifier les spams
2. Vérifier la clé API Brevo
3. Vérifier le template ID (doit être 2)
4. Vérifier les logs : `EmailLog` dans la base de données

### Format de variable incorrect
- Utiliser `{{ params.variable }}` dans le template Brevo
- PAS `{{ variable }}` directement

---

**Dernière mise à jour :** Janvier 2026
