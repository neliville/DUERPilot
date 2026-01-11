# Templates Email Brevo - Liste d'Attente DUERPilot

## Template 1 : Bienvenue Liste d'Attente

**ID Template :** À créer dans Brevo  
**Déclencheur :** Contact ajouté à la liste "Waitlist DUERPilot"  
**Catégorie :** Transactionnel

### Variables Disponibles

- `{{ params.PRENOM }}` - Prénom de l'utilisateur
- `{{ params.ENTREPRISE }}` - Nom de l'entreprise
- `{{ params.SECTEUR }}` - Secteur d'activité
- `{{ unsubscribe }}` - Lien désabonnement (automatique Brevo)

### Structure Email Recommandée

```
Objet : ✅ Bienvenue sur la liste DUERPilot !

Bonjour {{ params.PRENOM }},

Merci de votre inscription à la liste d'attente DUERPilot !

🎁 Votre offre Early Adopter :
✅ -30% pendant 3 mois (économie 83€)
✅ Onboarding offert (valeur 200€)
✅ Accès prioritaire beta privée

📅 Prochaines étapes :
1. Vous recevrez des mises à jour régulières sur le développement
2. Vous serez prévenu(e) en priorité au lancement (Mai 2025)
3. Vous recevrez votre code promo -30% le jour J

🚀 Lancement prévu : Mai 2025

Questions ? Répondez simplement à cet email ou contactez-nous à contact@duerpilot.fr

À bientôt,
L'équipe DUERPilot

---
DUERPilot - DDWIN Solutions
contact@duerpilot.fr
{{ unsubscribe }}
```

---

## Template 2 : Update Développement (J+7, J+14, J+21)

**ID Template :** À créer dans Brevo  
**Déclencheur :** Workflow automatisé (hebdomadaire)  
**Catégorie :** Product

### Variables Disponibles

- `{{ params.PRENOM }}`
- `{{ params.ENTREPRISE }}`
- `{{ params.UPDATE_TITLE }}` - Titre de la mise à jour
- `{{ params.UPDATE_CONTENT }}` - Contenu de la mise à jour
- `{{ params.BLOG_LINK }}` - Lien vers l'article blog
- `{{ unsubscribe }}`

### Structure Email Recommandée

```
Objet : 🚀 DUERPilot : {{ params.UPDATE_TITLE }}

Bonjour {{ params.PRENOM }},

{{ params.UPDATE_CONTENT }}

📖 Lire l'article complet : {{ params.BLOG_LINK }}

💡 Vous avez une suggestion ? Répondez à cet email !

À bientôt,
L'équipe DUERPilot

---
DUERPilot - DDWIN Solutions
contact@duerpilot.fr
{{ unsubscribe }}
```

---

## Template 3 : Invitation Beta Privée

**ID Template :** À créer dans Brevo  
**Déclencheur :** Sélection manuelle (20 testeurs)  
**Catégorie :** Product

### Variables Disponibles

- `{{ params.PRENOM }}`
- `{{ params.BETA_LINK }}` - Lien d'accès beta
- `{{ params.BETA_CODE }}` - Code d'accès beta
- `{{ unsubscribe }}`

### Structure Email Recommandée

```
Objet : 🎉 Vous êtes sélectionné(e) pour la beta privée DUERPilot !

Bonjour {{ params.PRENOM }},

Félicitations ! Vous avez été sélectionné(e) pour tester DUERPilot en avant-première.

🔑 Votre accès beta :
Lien : {{ params.BETA_LINK }}
Code : {{ params.BETA_CODE }}

📋 Ce que nous attendons de vous :
- Tester les fonctionnalités principales
- Créer votre premier DUERP
- Nous faire un retour constructif

⏱️ Beta disponible jusqu'au : [Date]

Merci de votre engagement !
L'équipe DUERPilot

---
DUERPilot - DDWIN Solutions
contact@duerpilot.fr
{{ unsubscribe }}
```

---

## Template 4 : J-7 Avant Lancement

**ID Template :** À créer dans Brevo  
**Déclencheur :** Workflow automatisé (7 jours avant lancement)  
**Catégorie :** Transactionnel

### Variables Disponibles

- `{{ params.PRENOM }}`
- `{{ params.LAUNCH_DATE }}` - Date de lancement
- `{{ params.PROMO_CODE }}` - Code promo -30%
- `{{ params.REGISTER_LINK }}` - Lien vers app.duerpilot.fr/register
- `{{ unsubscribe }}`

### Structure Email Recommandée

```
Objet : 🚀 DUERPilot lance dans 7 jours ! Votre code promo

Bonjour {{ params.PRENOM }},

Le grand jour approche ! DUERPilot sera disponible le {{ params.LAUNCH_DATE }}.

🎁 Votre code promo Early Adopter :
Code : {{ params.PROMO_CODE }}
Réduction : -30% pendant 3 mois

👉 Créer votre compte dès le lancement :
{{ params.REGISTER_LINK }}

💡 Astuce : Préparez vos documents DUERP existants pour l'import !

À très bientôt,
L'équipe DUERPilot

---
DUERPilot - DDWIN Solutions
contact@duerpilot.fr
{{ unsubscribe }}
```

---

## Template 5 : Jour J Lancement

**ID Template :** À créer dans Brevo  
**Déclencheur :** Workflow automatisé (jour du lancement)  
**Catégorie :** Transactionnel

### Variables Disponibles

- `{{ params.PRENOM }}`
- `{{ params.PROMO_CODE }}` - Code promo -30%
- `{{ params.REGISTER_LINK }}` - Lien vers app.duerpilot.fr/register
- `{{ params.ONBOARDING_LINK }}` - Lien vers guide onboarding
- `{{ unsubscribe }}`

### Structure Email Recommandée

```
Objet : 🎉 DUERPilot est disponible ! Créez votre compte maintenant

Bonjour {{ params.PRENOM }},

C'est le jour J ! DUERPilot est maintenant disponible.

🚀 Créez votre compte dès maintenant :
{{ params.REGISTER_LINK }}

🎁 Votre code promo Early Adopter :
Code : {{ params.PROMO_CODE }}
Réduction : -30% pendant 3 mois + Onboarding offert

📚 Guide de démarrage :
{{ params.ONBOARDING_LINK }}

💡 Besoin d'aide ? Répondez à cet email ou contactez support@duerpilot.fr

Bienvenue dans DUERPilot !
L'équipe DUERPilot

---
DUERPilot - DDWIN Solutions
support@duerpilot.fr
{{ unsubscribe }}
```

---

## Configuration Workflows Brevo

### Workflow 1 : Bienvenue Automatique

1. Brevo → **Automation** → **Workflows**
2. Créer workflow : "Waitlist Welcome"
3. Déclencheur : Contact ajouté à liste "Waitlist DUERPilot"
4. Action : Envoyer email template "Bienvenue Liste d'Attente"
5. Activer le workflow

### Workflow 2 : Updates Hebdomadaires

1. Créer workflow : "Weekly Updates"
2. Déclencheur : Contact dans liste "Waitlist DUERPilot" + Date (hebdomadaire)
3. Condition : Contact inscrit depuis 7+ jours
4. Action : Envoyer email template "Update Développement"
5. Limiter à 1 email par semaine maximum

### Workflow 3 : J-7 Lancement

1. Créer workflow : "Launch Reminder J-7"
2. Déclencheur : Date fixe (7 jours avant lancement)
3. Condition : Contact dans liste "Waitlist DUERPilot"
4. Action : Envoyer email template "J-7 Avant Lancement"
5. Activer uniquement 1 fois

### Workflow 4 : Jour J Lancement

1. Créer workflow : "Launch Day"
2. Déclencheur : Date fixe (jour du lancement)
3. Condition : Contact dans liste "Waitlist DUERPilot"
4. Action : Envoyer email template "Jour J Lancement"
5. Activer uniquement 1 fois

---

## Notes Importantes

1. **RGPD** : Tous les emails doivent inclure le lien de désabonnement (automatique Brevo)
2. **From/Reply-To** : Utiliser noreply@duerpilot.fr (FROM) et support@duerpilot.fr (REPLY-TO)
3. **Fréquence** : Ne pas envoyer plus de 1 email par semaine (sauf transactionnels)
4. **Segmentation** : Possibilité de segmenter par secteur ou plan intéressé
5. **A/B Testing** : Tester différents sujets/CTAs pour optimiser l'ouverture

