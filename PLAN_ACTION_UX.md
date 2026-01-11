# Plan d'Action - Suite des Améliorations UX/Accessibilité

## ✅ Ce qui a été fait

1. ✅ **Dashboard principal** - Responsive, accessibilité, navigation clavier
2. ✅ **Sidebar** - Menu mobile, ARIA labels, navigation clavier
3. ✅ **Page Évaluations** - Table responsive, filtres accessibles
4. ✅ **Page Évaluation générique** - Layout responsive, navigation clavier, sections sémantiques
5. ✅ **Skip links** - Navigation rapide au clavier
6. ✅ **Styles globaux** - Focus visible, classes utilitaires

---

## 🎯 Prochaines étapes prioritaires

### Phase 1 : Pages principales restantes (Priorité HAUTE)

#### 1. Page Évaluations OiRA (`/dashboard/evaluations-oira`)
**À améliorer :**
- [ ] Responsivité du formulaire OiRA
- [ ] Navigation clavier dans les onglets (Tabs)
- [ ] Labels ARIA sur les composants de formulaire
- [ ] Messages d'erreur accessibles
- [ ] Loading states avec aria-live
- [ ] Boutons avec états de chargement accessibles

**Fichiers à modifier :**
- `app/(dashboard)/dashboard/evaluations-oira/page.tsx`
- `components/oira/oira-evaluation-form.tsx`
- `components/oira/oira-synthesis.tsx`

---

#### 2. Page Entreprises (`/dashboard/entreprises`)
**À améliorer :**
- [ ] Liste responsive (cards sur mobile)
- [ ] Formulaire accessible (labels, erreurs)
- [ ] Modals avec focus trap
- [ ] Boutons d'action avec aria-labels
- [ ] Empty states accessibles

**Fichiers à modifier :**
- `app/(dashboard)/dashboard/entreprises/page.tsx`
- `components/companies/company-form.tsx`
- `components/companies/company-list.tsx` (si existe)

---

#### 3. Page Unités de travail (`/dashboard/work-units`)
**À améliorer :**
- [ ] Formulaire responsive
- [ ] Sélection d'unités accessibles
- [ ] Navigation clavier
- [ ] Messages de plan accessibles

**Fichiers à modifier :**
- `app/(dashboard)/dashboard/work-units/page.tsx`
- `components/work-units/work-unit-form.tsx`

---

#### 4. Page Facturation (`/dashboard/settings/billing`)
**À améliorer :**
- [ ] Comparaison des plans responsive
- [ ] Cartes de plan accessibles
- [ ] Boutons d'upgrade avec aria-labels
- [ ] Tableaux responsive

**Fichiers à modifier :**
- `app/(dashboard)/dashboard/settings/billing/page.tsx`

---

### Phase 2 : Composants réutilisables (Priorité MOYENNE)

#### 5. Modals et Dialogs
**À améliorer :**
- [ ] Focus trap automatique
- [ ] Fermeture avec Escape
- [ ] Retour du focus au déclencheur
- [ ] ARIA modal="true"

**Fichiers à modifier :**
- `components/ui/dialog.tsx`
- Intégrer `useFocusTrap` dans les dialogs

---

#### 6. Formulaires
**À améliorer :**
- [ ] Validation accessible (aria-invalid, aria-describedby)
- [ ] Messages d'erreur liés aux champs
- [ ] États de chargement (aria-busy)
- [ ] Labels obligatoires marqués visuellement

**Composants à vérifier :**
- Tous les formulaires dans `components/`

---

#### 7. Tables
**À améliorer :**
- [ ] Responsive (scroll horizontal ou cards)
- [ ] Navigation clavier (Tab dans les cellules)
- [ ] Headers avec scope="col"
- [ ] Captions pour contexte

**Fichiers à modifier :**
- `components/ui/table.tsx`
- Toutes les utilisations de tables

---

### Phase 3 : Optimisations avancées (Priorité BASSE)

#### 8. Toasts et Notifications
**À améliorer :**
- [ ] aria-live="polite" pour les annonces
- [ ] Fermeture au clavier (Escape)
- [ ] Contraste suffisant

**Fichiers à modifier :**
- `components/ui/toaster.tsx`
- `components/ui/toast.tsx`

---

#### 9. Loading States
**À améliorer :**
- [ ] Skeleton loaders au lieu de spinners
- [ ] aria-busy sur les zones en chargement
- [ ] Messages de chargement annoncés

---

#### 10. Empty States
**À améliorer :**
- [ ] Messages clairs avec actions
- [ ] Images avec alt text
- [ ] Navigation clavier vers les actions

---

## 📋 Checklist rapide par page

### Page Évaluations OiRA
- [ ] Formulaire responsive (mobile-first)
- [ ] Tabs accessibles (navigation clavier)
- [ ] Champs avec labels
- [ ] Messages d'erreur accessibles
- [ ] Boutons avec aria-labels

### Page Entreprises
- [ ] Liste en cards sur mobile
- [ ] Formulaire accessible
- [ ] Modals avec focus trap
- [ ] Actions avec aria-labels

### Page Unités de travail
- [ ] Formulaire responsive
- [ ] Sélecteurs accessibles
- [ ] Navigation clavier

### Page Facturation
- [ ] Plans en cards sur mobile
- [ ] Comparaison accessible
- [ ] Boutons d'upgrade clairs

---

## 🚀 Ordre d'exécution recommandé

1. **Page Évaluations OiRA** (utilisée fréquemment)
2. **Page Entreprises** (page importante)
3. **Page Facturation** (conversion)
4. **Page Unités de travail** (moins critique)
5. **Composants réutilisables** (impact global)
6. **Optimisations avancées** (polish)

---

## 📊 Métriques de succès

- ✅ 100% des pages passent les tests d'accessibilité automatiques
- ✅ Navigation clavier complète sur toutes les pages
- ✅ Responsive sur tous les breakpoints (320px à 2560px)
- ✅ Contraste WCAG AA minimum partout
- ✅ Temps de chargement < 3s sur mobile 3G
- ✅ Score Lighthouse > 90 (Accessibility, Best Practices)

---

## 🛠️ Outils de test recommandés

1. **Lighthouse** - Audit automatique
2. **axe DevTools** - Extension Chrome
3. **WAVE** - Extension navigateur
4. **Keyboard Navigation** - Test manuel Tab/Shift+Tab
5. **Screen Reader** - NVDA (Windows) ou VoiceOver (Mac)

---

## 📝 Notes importantes

- Tous les changements doivent maintenir la compatibilité existante
- Tester sur navigateurs récents (Chrome, Firefox, Safari, Edge)
- Vérifier sur mobile réel (pas seulement DevTools)
- Documenter les changements d'accessibilité dans les commits

