# Assistant DUERP (IA) - Guide de Démarrage Rapide

## 🎯 Vue d'ensemble

L'Assistant DUERP est un parcours guidé en 4 étapes qui aide les utilisateurs à créer leur Document Unique d'Évaluation des Risques Professionnels avec l'assistance de l'IA.

## ⚡ Accès rapide

### Prérequis
- Plan **PRO**, **EXPERT** ou **ENTREPRISE**
- Avoir au moins une entreprise et un site configurés

### Accéder à l'assistant

1. Se connecter à l'application
2. Aller sur **Évaluations**
3. Cliquer sur **Nouvelle évaluation**
4. Sélectionner **"Assistant DUERP (IA)"**
5. Vous êtes redirigé vers `/dashboard/assistance`

## 📊 Les 4 étapes

### Étape 1 : Unités de travail (5-10 min)

**Objectif** : Définir toutes les zones de travail de l'entreprise

**Actions** :
1. Cliquer sur **"+ Ajouter une UT"**
2. Remplir le formulaire :
   - Site *
   - Nom de l'unité (ex: "Zone logistique")
   - Description (utilisée par l'IA)
   - Effectif exposé
   - Responsable (nom et email)
3. **Enregistrer**
4. Répéter pour chaque zone
5. Cliquer sur **"Suivant"**

💡 **Astuce** : Plus la description est détaillée, meilleures seront les suggestions IA !

### Étape 2 : Évaluation (15-30 min par unité)

**Objectif** : Identifier et évaluer les risques de chaque unité

**Option A : Avec suggestions IA** (Recommandé)
1. Sélectionner une unité dans la liste de gauche
2. Cliquer sur **"Suggérer des dangers (IA)"**
3. Attendre 2 secondes (l'IA analyse)
4. Une card bleue affiche **5 suggestions**
5. Pour chaque suggestion pertinente :
   - Cliquer sur **"Évaluer"**
   - Le formulaire se pré-remplit automatiquement
   - Ajuster les informations si besoin
   - Cliquer sur **"Proposer une cotation (IA)"** (optionnel)
   - Ajuster les sliders (F, P, G, M)
   - **Enregistrer**

**Option B : Manuel**
1. Sélectionner une unité
2. Cliquer sur **"+ Ajouter un risque"**
3. Remplir tous les champs
4. Utiliser les sliders pour coter le risque
5. **Enregistrer**

**Comprendre les sliders** :
- **F** (Fréquence) : 1=Rare → 4=Permanent
- **P** (Probabilité) : 1=Improbable → 4=Très probable
- **G** (Gravité) : 1=Faible → 4=Très grave
- **M** (Maîtrise) : 1=Excellente → 4=Inexistante

**Score de risque** : F × P × G × M
- < 36 : 🟢 Faible
- 36-107 : 🟡 À améliorer
- ≥ 108 : 🔴 Prioritaire

💡 **Astuce** : Cliquez sur les icônes ⓘ pour voir les explications de chaque critère

### Étape 3 : Plan d'actions (2-5 min)

**Objectif** : Revoir les actions de prévention

**Actions** :
1. Consulter la liste des actions générées
2. Vérifier les statuts et priorités
3. Cliquer sur **"Voir toutes les actions"** pour la gestion détaillée
4. Cliquer sur **"Suivant"**

💡 **Astuce** : Les actions sont automatiquement liées aux risques évalués

### Étape 4 : Génération (1-2 min)

**Objectif** : Finaliser et exporter le DUERP

**Statistiques affichées** :
- ✅ Nombre d'unités de travail
- ✅ Nombre de risques évalués
- 🔴 Nombre de risques prioritaires
- ✅ Nombre d'actions définies

**Actions disponibles** :
1. **"Générer le PDF"** : Crée le DUERP officiel
2. **"Exporter CSV"** : Télécharge les données
3. **"Voir l'historique"** : Accède aux versions archivées

## 🤖 Fonctionnalités IA

### Suggestions de dangers

**Comment ça marche** :
- L'IA analyse le nom et la description de votre unité de travail
- Elle consulte le référentiel de dangers (28 situations)
- Elle propose 5 dangers pertinents avec justification
- Vous choisissez lesquels évaluer

**Exemple de suggestion** :
```
Circulation interne (déplacements)
Catégorie : Déplacements

Justification : La zone logistique implique des déplacements 
fréquents de personnes et de chariots élévateurs, ce qui peut 
provoquer des accidents ou des collisions.

[Évaluer] ←
```

### Proposition de cotation

**Comment ça marche** :
- Vous remplissez la description de la situation
- L'IA analyse le contexte et propose une cotation
- Les sliders se mettent à jour automatiquement
- Vous pouvez ajuster manuellement

**Justification affichée** :
> "Basé sur l'analyse du contexte, cette cotation semble 
> appropriée pour ce type de risque."

⚠️ **Important** : L'IA est **assistive**, pas décisionnaire. Validez toujours les suggestions !

### Génération d'actions (À venir)

Pour chaque risque, l'IA pourra suggérer :
- Actions **techniques** (équipements, aménagement)
- Actions **organisationnelles** (procédures, formation)
- Actions **humaines** (sensibilisation, EPI)

## 🎨 Interface

### Stepper horizontal
```
[✓] Unités de travail ———— [●] Évaluation ———— [ ] Plan d'actions ———— [ ] Génération
```
- ✓ = Complété
- ● = En cours
- [ ] = À faire

### Layout Étape 2
```
┌──────────────┬─────────────────────────────────────┐
│              │  Zone logistique                    │
│  Unités de   │  [Suggérer IA] [+ Ajouter risque]  │
│  travail     │─────────────────────────────────────│
│              │  ✨ Suggestions IA                  │
│  • Zone      │  ┌─────────────────────────────┐   │
│    logistique│  │ Circulation interne    [⚫] │   │
│              │  │ Justification...    [Évaluer]│   │
│  • Bureau    │  └─────────────────────────────┘   │
│    admin (1) │                                     │
│              │  📋 Risques évalués (0)             │
│              │  "Aucun risque pour cette unité"   │
└──────────────┴─────────────────────────────────────┘
```

## 🔧 Configuration

### Changer le plan d'un utilisateur

```bash
npx tsx scripts/update-user-plan.ts utilisateur@email.com expert
```

### Activer l'IA réelle (Optionnel)

1. Obtenir une clé API :
   - OpenAI : https://platform.openai.com/api-keys
   - Anthropic : https://console.anthropic.com/

2. Ajouter dans `.env.local` :
```env
OPENAI_API_KEY=sk-...
# ou
ANTHROPIC_API_KEY=sk-ant-...
```

3. Créer le router IA : `server/api/routers/ai.ts`

4. Remplacer les `setTimeout()` par de vrais appels API

## 📚 Ressources

- [Documentation technique complète](./ASSISTANT_DUERP_IA.md)
- [Architecture du projet](./architecture/README.md)
- [Plans et tarifs](./plans-tarifs/README.md)
- [Conformité réglementaire](./CONFORMITE_REGLEMENTAIRE.md)

## ❓ FAQ

### Q : Les suggestions IA sont-elles juridiquement valides ?
**R** : Non. L'IA est **assistive** uniquement. L'employeur reste seul responsable de l'évaluation et de la validation finale.

### Q : Puis-je utiliser l'assistant sans l'IA ?
**R** : Oui ! Vous pouvez cliquer sur "+ Ajouter un risque" et remplir manuellement. L'IA est optionnelle à chaque étape.

### Q : Combien de temps faut-il pour créer un DUERP ?
**R** : 
- Avec IA : 30-45 minutes pour une PME de 3-5 unités de travail
- Sans IA : 1-2 heures

### Q : Les données sont-elles sauvegardées automatiquement ?
**R** : Oui, chaque fois que vous cliquez sur "Enregistrer" dans un dialog.

### Q : Puis-je revenir en arrière dans le wizard ?
**R** : Oui ! Le stepper est cliquable. Vous pouvez naviguer librement entre les étapes.

### Q : Que se passe-t-il si je ferme le navigateur ?
**R** : Vos données sont sauvegardées en base. Vous pouvez reprendre là où vous vous êtes arrêté.

## 🐛 Problèmes connus

### Les suggestions IA ne s'affichent pas
1. Vérifier que vous avez bien sélectionné une unité de travail
2. Attendre 2 secondes (délai de simulation)
3. Recharger la page si nécessaire

### Le dialog d'évaluation ne s'ouvre pas
1. Vérifier qu'une unité de travail est sélectionnée
2. Vérifier la console pour les erreurs
3. Recharger la page

### Les sliders ne se déplacent pas
1. Cliquer et maintenir sur le slider
2. Glisser horizontalement
3. Si ça ne fonctionne pas, utiliser les touches fléchées du clavier

## 📞 Support

- **Documentation** : `/docs/`
- **Issues** : GitHub Issues
- **Email** : support@duerpilot.fr

---

**Dernière mise à jour** : 20 janvier 2026  
**Version** : 1.0.0
