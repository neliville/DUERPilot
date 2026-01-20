# 📋 Configuration Brevo - Formulaire Waitlist

## ✅ Intégration Effectuée

Le formulaire Brevo a été intégré dans la landing page via **HTML Embed** (pas d'iframe) aux emplacements suivants :
- **Section Hero** : Formulaire principal (#waitlist)
- **Section CTA Finale** : Formulaire simplifié

## 🔗 Action URL du Formulaire

**Action POST du formulaire Brevo :**
```
https://3f52143d.sibforms.com/serve/MUIFAHuBZ1XGIR_yeKO1CiKendPo-3V-mL24MOcL9yheEaj-uwOi7wJS8k8UTLRohmpxKVwhrSvhXjg9tE4endABu7odgIKcFTHCEkPrtotEM4kyc-hnZwHX-Oj7-32tOZOKab-rALPVCaFrkJkKQPgn3QizWXQgtDM5hrXHwEYFmYN5Ifz-oogrRqbNh5C3XO1TIjsA3k4VbP8hXA==
```

**reCAPTCHA v3 Site Key :**
```
6LckP0YsAAAAAK6GB8NoRBC7WiDfAK-qf71Q9h9g
```

## ⚙️ Configuration Brevo (Côté Serveur)

Pour que la redirection vers la page de confirmation fonctionne après soumission du formulaire, configurez dans votre **dashboard Brevo** :

### 1. Accéder aux Paramètres du Formulaire

1. Connectez-vous à votre compte Brevo
2. Allez dans **Marketing > Formulaires**
3. Trouvez votre formulaire de waitlist
4. Cliquez sur **Paramètres** ou **Modifier**

### 2. Configurer la Page de Redirection

Dans les paramètres du formulaire, trouvez la section **"Page de remerciement"** ou **"Redirection après soumission"** :

**Option 1 : URL de redirection (recommandé)**
```
https://duerpilot.fr/confirmation
```

ou

```
https://duerpilot.fr/waitlist-confirmed
```

**Option 2 : URL de redirection avec variables (optionnel)**
Si vous voulez passer des paramètres (email, etc.) :
```
https://duerpilot.fr/confirmation?email={EMAIL}&source=brevo
```

### 3. Sauvegarder la Configuration

Après avoir configuré l'URL de redirection, cliquez sur **Enregistrer** ou **Publier**.

## 📍 Pages de Confirmation Disponibles

Les pages suivantes sont disponibles pour la redirection :

1. **`/confirmation`** (recommandé)
   - Page Next.js statique
   - Design cohérent avec la landing page
   - URL propre et professionnelle

2. **`/waitlist-confirmed`**
   - Redirection automatique vers `/confirmation`
   - URL alternative pour compatibilité

3. **`/landing/confirmation.html`**
   - Version HTML statique (backup)
   - Accessible directement

## ✅ Vérification

Pour vérifier que la configuration fonctionne :

1. **Tester le formulaire** :
   - Remplissez le formulaire sur la landing page
   - Soumettez-le
   - Vérifiez que vous êtes redirigé vers `/confirmation`

2. **Vérifier dans Brevo** :
   - Allez dans **Contacts > Liste de contacts**
   - Vérifiez que le contact a bien été ajouté
   - Vérifiez que les attributs sont correctement renseignés

## 🎨 Responsive Design

Le formulaire HTML est responsive et s'adapte automatiquement :
- **Desktop** : Largeur maximale 540px, centré
- **Tablet** : Largeur 100%, padding adapté
- **Mobile** : Largeur 100%, padding réduit

Les styles CSS suivants sont appliqués dans `landing/assets/css/styles.css` :
```css
#sib-container,
#sib-container-final {
  margin: 0 auto;
  max-width: 540px;
}

@media (max-width: 768px) {
  #sib-container,
  #sib-container-final {
    max-width: 100%;
  }
  
  .sib-form-container {
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  #sib-container,
  #sib-container-final {
    max-width: 100%;
    border-radius: 0.5rem;
  }
  
  .sib-form-block {
    padding: 12px 8px !important;
  }
}
```

## 📝 Notes Importantes

### ✅ Avantages du HTML Embed Brevo

1. **Gestion automatique** : Brevo gère la soumission, validation et stockage
2. **RGPD conforme** : Brevo gère automatiquement les consentements
3. **Tracking intégré** : Suivi des conversions et ouvertures
4. **Meilleure intégration** : Le formulaire est directement dans le HTML, pas d'iframe
5. **Meilleures performances** : Pas de chargement d'iframe supplémentaire
6. **Meilleur SEO** : Le formulaire est directement indexable par les moteurs de recherche
7. **Personnalisation facile** : Styles CSS directement applicables
8. **reCAPTCHA v3** : Protection anti-spam intégrée

### ⚠️ Points d'Attention

1. **Configuration Brevo** : Assurez-vous que l'URL de redirection est bien configurée dans Brevo (CRITIQUE)
2. **HTTPS** : Vérifiez que votre site est en HTTPS pour que reCAPTCHA fonctionne correctement
3. **Scripts Brevo** : Les scripts doivent être chargés avant `</body>`
4. **IDs uniques** : Si plusieurs formulaires sur la même page, utilisez des IDs différents (déjà fait : `sib-form` et `sib-form-final`)

## 🔧 Ajustements Possibles

Si vous devez modifier le style du formulaire :

1. **Dans le CSS** (`landing/assets/css/styles.css`) :
   ```css
   #sib-container,
   #sib-container-final {
     /* Vos styles personnalisés */
   }
   ```

2. **Dans le HTML** (styles inline) :
   ```html
   <div id="sib-container" style="/* vos styles */">
   ```

## 📝 Champs du Formulaire

Le formulaire inclut les champs suivants :

1. **EMAIL** (requis, type email)
   - Placeholder : "votre@email.com"
   - Validation automatique par Brevo

2. **TYPE_ENTREPRISE** (radio, requis)
   - TPE (1–10 salariés) - value: "1"
   - PME (11–250 salariés) - value: "2"
   - Consultant / Indépendant - value: "3"
   - Autre - value: "4"

3. **ROLE_CONTACT** (radio, requis)
   - Dirigeant - value: "1"
   - Responsable QSE / HSE - value: "2"
   - Ressource Humaine - value: "3"
   - Autre - value: "4"

4. **OPT_IN** (checkbox, requis)
   - Consentement RGPD avec liens vers politique de confidentialité et mentions légales
   - Texte : "J'accepte de recevoir des emails concernant le lancement de DUERPilot..."

5. **reCAPTCHA v3** (invisible)
   - Site key : `6LckP0YsAAAAAK6GB8NoRBC7WiDfAK-qf71Q9h9g`
   - Protection anti-spam automatique

## 📚 Ressources

- [Documentation Brevo - Formulaires](https://help.brevo.com/hc/fr/articles/209467485)
- [Documentation Brevo - Redirections](https://help.brevo.com/hc/fr/articles/360001469787)

---

**Dernière mise à jour :** Janvier 2026  
**Statut :** ✅ Intégration complète

