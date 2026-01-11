# Guide de Création des Templates Brevo - DUERPilot

Ce guide détaille comment créer tous les templates email dans Brevo pour DUERPilot.

## Prérequis

1. Compte Brevo actif avec accès API
2. API Key Brevo configurée dans `.env` (`BREVO_API_KEY`)
3. Accès à l'interface Brevo pour créer les templates

---

## Structure des Templates

Chaque template doit respecter le design system DUERPilot et utiliser les variables dynamiques fournies par le backend.

### Design System

- **Couleurs principales** :
  - Gradient header : `#667eea` → `#764ba2`
  - Bouton CTA : `#667eea`
  - Texte : `#333333`
  - Texte secondaire : `#666666`

- **Police** : `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

- **Largeur max** : `600px`

---

## Template 1 : account_activation (ID: 1)

**Priorité** : P0 - CRITIQUE  
**Catégorie** : Transactionnel  
**Toujours envoyé** : Oui (légalement requis)

### Variables disponibles

- `{{ params.firstName }}` : Prénom de l'utilisateur
- `{{ params.activationLink }}` : Lien d'activation
- `{{ params.expiresIn }}` : Durée de validité (ex: "24 heures")
- `{{ params.verificationCode }}` : Code à 6 chiffres (optionnel, si système code)

### HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .cta-button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .code-box {
      background: #f9f9f9;
      border: 2px dashed #667eea;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      color: #667eea;
    }
    .footer {
      padding: 30px;
      text-align: center;
      color: #666;
      font-size: 12px;
      border-top: 1px solid #eee;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DUERPilot</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Activation de votre compte</p>
    </div>
    
    <div class="content">
      <h2>Bonjour {{ params.firstName }},</h2>
      
      <p>Merci de vous être inscrit sur DUERPilot ! Pour activer votre compte, cliquez sur le bouton ci-dessous :</p>
      
      <div style="text-align: center;">
        <a href="{{ params.activationLink }}" class="cta-button">Activer mon compte</a>
      </div>
      
      {{#if params.verificationCode}}
      <p>Ou utilisez le code de vérification suivant :</p>
      <div class="code-box">{{ params.verificationCode }}</div>
      {{/if}}
      
      <p style="color: #666; font-size: 14px;">
        Ce lien est valide pendant <strong>{{ params.expiresIn }}</strong>.
      </p>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Si vous n'avez pas demandé cette activation, vous pouvez ignorer cet email.
      </p>
    </div>
    
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      <p><a href="{{ unsubscribe }}">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>
```

### Version texte

```
DUERPilot - Activation de votre compte

Bonjour {{ params.firstName }},

Merci de vous être inscrit sur DUERPilot ! Pour activer votre compte, cliquez sur le lien suivant :

{{ params.activationLink }}

{{#if params.verificationCode}}
Ou utilisez le code : {{ params.verificationCode }}
{{/if}}

Ce lien est valide pendant {{ params.expiresIn }}.

Si vous n'avez pas demandé cette activation, vous pouvez ignorer cet email.

Cordialement,
L'équipe DUERPilot
```

---

## Template 2 : password_reset (ID: 2)

**Priorité** : P0 - CRITIQUE  
**Catégorie** : Transactionnel  
**Toujours envoyé** : Oui

### Variables disponibles

- `{{ params.firstName }}` : Prénom
- `{{ params.resetLink }}` : Lien de réinitialisation
- `{{ params.expiresIn }}` : Durée de validité

### HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    /* Même structure que account_activation */
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { padding: 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DUERPilot</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Réinitialisation de mot de passe</p>
    </div>
    
    <div class="content">
      <h2>Bonjour {{ params.firstName }},</h2>
      
      <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
      
      <div style="text-align: center;">
        <a href="{{ params.resetLink }}" class="cta-button">Réinitialiser mon mot de passe</a>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        Ce lien est valide pendant <strong>{{ params.expiresIn }}</strong>.
      </p>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.
      </p>
    </div>
    
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      <p><a href="{{ unsubscribe }}">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>
```

---

## Template 3 : duerp_generated (ID: 3)

**Priorité** : P0 - CRITIQUE  
**Catégorie** : Transactionnel  
**Toujours envoyé** : Non

### Variables disponibles

- `{{ params.companyName }}` : Nom de l'entreprise
- `{{ params.duerpDownloadLink }}` : Lien de téléchargement
- `{{ params.generatedAt }}` : Date de génération (format français)

### HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    /* Même structure de base */
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .info-box { background: #f0f7ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DUERPilot</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Votre DUERP est prêt</p>
    </div>
    
    <div class="content">
      <h2>Votre DUERP a été généré</h2>
      
      <div class="info-box">
        <strong>Entreprise :</strong> {{ params.companyName }}<br>
        <strong>Généré le :</strong> {{ params.generatedAt }}
      </div>
      
      <p>Votre Document Unique d'Évaluation des Risques Professionnels est maintenant disponible au téléchargement.</p>
      
      <div style="text-align: center;">
        <a href="{{ params.duerpDownloadLink }}" class="cta-button">Télécharger mon DUERP</a>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        Ce document est conforme à la réglementation en vigueur et peut être utilisé pour vos obligations légales.
      </p>
    </div>
    
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      <p><a href="{{ unsubscribe }}">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>
```

---

## Template 4 : quota_exceeded_blocking (ID: 4)

**Priorité** : P0 - CRITIQUE  
**Catégorie** : Transactionnel  
**Toujours envoyé** : Oui

### Variables disponibles

- `{{ params.quotaType }}` : Type de quota (ex: "Évaluations", "IA")
- `{{ params.currentPlan }}` : Plan actuel
- `{{ params.upgradeLink }}` : Lien vers la page de facturation

### HTML Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    /* Structure de base */
    .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DUERPilot</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Quota dépassé</p>
    </div>
    
    <div class="content">
      <h2>Quota {{ params.quotaType }} dépassé</h2>
      
      <div class="warning-box">
        <strong>⚠️ Attention</strong><br>
        Vous avez atteint la limite de votre plan <strong>{{ params.currentPlan }}</strong>.
        Certaines fonctionnalités sont temporairement indisponibles.
      </div>
      
      <p>Pour continuer à utiliser DUERPilot sans limitation, passez à un plan supérieur :</p>
      
      <div style="text-align: center;">
        <a href="{{ params.upgradeLink }}" class="cta-button">Voir les plans disponibles</a>
      </div>
    </div>
    
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      <p><a href="{{ unsubscribe }}">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>
```

---

## Templates P1, P2, P3

Les autres templates suivent la même structure. Voir le fichier `server/services/email/templates.ts` pour la liste complète des variables de chaque template.

---

## Instructions de Création dans Brevo

1. **Se connecter à Brevo** : https://app.brevo.com
2. **Aller dans** : Email > Templates
3. **Créer un nouveau template** : "Create a template"
4. **Choisir** : "Blank template"
5. **Copier-coller le HTML** du template correspondant
6. **Configurer** :
   - Nom : `account_activation` (ou nom du template)
   - Subject : "Activation de votre compte DUERPilot" (ou sujet approprié)
   - From : `noreply@duerpilot.fr`
7. **Tester** : Utiliser "Send a test email"
8. **Noter l'ID** : L'ID du template (visible dans l'URL ou les détails)
9. **Mettre à jour** : `server/services/email/templates.ts` avec le bon `brevoTemplateId`

---

## Variables Brevo Spéciales

- `{{ unsubscribe }}` : Lien de désabonnement automatique (toujours inclure)
- `{{ contact.EMAIL }}` : Email du destinataire
- `{{ contact.FIRSTNAME }}` : Prénom (si disponible dans Brevo)
- `{{ contact.LASTNAME }}` : Nom (si disponible)

---

## Notes Importantes

1. **Toujours inclure le lien de désabonnement** dans le footer
2. **Tester chaque template** avant mise en production
3. **Vérifier le rendu mobile** (responsive)
4. **Respecter le design system** pour la cohérence
5. **Les emails transactionnels** (P0) ne peuvent pas être désactivés par l'utilisateur

---

## Support

Pour toute question sur la création des templates, consulter :
- Documentation Brevo : https://developers.brevo.com/docs
- Fichier de configuration : `server/services/email/templates.ts`

