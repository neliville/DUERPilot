# ✅ Backend Admin - Configuration terminée

## 🎉 Statut

✅ **Migration Prisma appliquée**  
✅ **Super admin créé/mis à jour**  
✅ **Fonctionnalités d'invitation implémentées**

---

## 👤 Super Admin

**Email :** `ddwinsolutions@gmail.com`  
**isSuperAdmin :** `true`  
**Rôles :** `['super_admin']`  
**ID :** `cmk32f28q0002ex079rbz6w3n`

**Note :** Le mot de passe doit être configuré dans votre système d'authentification.

---

## 📊 Tables créées

### `ai_usage_logs`
Logging détaillé de tous les appels IA :
- Tokens (input/output/total)
- Coûts estimés
- Confiance IA
- Résultat (validated/rejected/pending)

### `subscriptions`
Gestion des abonnements :
- Plan (free/starter/pro/expert)
- Mode de facturation (monthly/annual)
- Statut (active/trial/suspended/cancelled)
- Dates (startDate, renewalDate, cancelledAt)

### `admin_settings`
Configuration admin (pour futures fonctionnalités)

---

## 🔧 Fonctionnalités d'invitation admin

### Routes disponibles

#### Créer un admin
```typescript
api.admin.users.createAdmin.mutate({
  email: 'nouvel-admin@example.com',
  firstName: 'Prénom',
  lastName: 'Nom',
  sendInvitation: true, // Envoie une invitation par email
})
```

#### Inviter un admin (email uniquement)
```typescript
api.admin.invitations.sendAdminInvitation.mutate({
  email: 'admin@example.com',
  firstName: 'Prénom',
  lastName: 'Nom',
})
```

#### Promouvoir un utilisateur existant en admin
```typescript
api.admin.users.inviteAdmin.mutate({
  userId: 'user-id',
  sendInvitation: true,
})
```

#### Retirer les droits admin
```typescript
api.admin.users.removeAdmin.mutate({
  userId: 'user-id',
})
```

#### Lister tous les admins
```typescript
api.admin.users.getAllAdmins.query()
```

#### Gérer les invitations
```typescript
// Lister les invitations en attente
api.admin.invitations.getPendingInvitations.query()

// Renvoyer une invitation
api.admin.invitations.resendInvitation.mutate({
  userId: 'user-id',
})

// Annuler une invitation
api.admin.invitations.cancelInvitation.mutate({
  userId: 'user-id',
})
```

---

## 📧 Système d'invitation

### Comment ça fonctionne

1. **Création de l'invitation**
   - Un token unique est généré
   - Un tenant temporaire est créé
   - L'utilisateur admin est créé avec `emailVerified: false`
   - Le token expire dans 7 jours

2. **Envoi de l'email** (À implémenter)
   - Actuellement, l'URL d'invitation est loggée dans la console
   - Format : `${NEXTAUTH_URL}/auth/verify-email?token=${token}`
   - **TODO :** Intégrer un service d'email (Resend, SendGrid, etc.)

3. **Acceptation de l'invitation**
   - L'utilisateur clique sur le lien
   - Le token est validé
   - L'email est marqué comme vérifié
   - L'utilisateur peut se connecter

### Exemple d'intégration email

```typescript
// server/services/email/admin-invitation.ts
import { Resend } from 'resend'; // ou autre service

export async function sendAdminInvitationEmail(
  email: string,
  firstName: string | null,
  invitationUrl: string
) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: 'DUERPilot <admin@duerpilot.fr>',
    to: email,
    subject: 'Invitation administrateur DUERPilot',
    html: `
      <h1>Invitation administrateur</h1>
      <p>Bonjour ${firstName || email},</p>
      <p>Vous avez été invité à rejoindre l'équipe d'administration de DUERPilot.</p>
      <p><a href="${invitationUrl}">Accepter l'invitation</a></p>
      <p>Ce lien expire dans 7 jours.</p>
    `,
  });
}
```

Puis dans `server/api/routers/admin/invitations.ts`, remplacer le `console.log` par :
```typescript
await sendAdminInvitationEmail(input.email, input.firstName, invitationUrl);
```

---

## 🧪 Tester les routes admin

### Exemple de test basique

```typescript
// scripts/test-admin-routes.ts
import { appRouter } from '@/server/api/routers/_app';
import { createCallerFactory } from '@/server/api/trpc';
import { prisma } from '@/lib/db';

async function testAdminRoutes() {
  const admin = await prisma.userProfile.findFirst({
    where: { isSuperAdmin: true },
  });

  if (!admin) {
    console.error('❌ Aucun super admin trouvé');
    return;
  }

  const createCaller = createCallerFactory(appRouter);
  const caller = createCaller({
    session: { user: { email: admin.email } },
    user: { email: admin.email },
    userProfile: admin,
    prisma,
    req: {} as any,
    res: undefined,
  });

  try {
    // Test vue CEO
    const ceoView = await caller.admin.dashboard.getCEOView();
    console.log('✅ Vue CEO:', ceoView);

    // Test liste admins
    const admins = await caller.admin.users.getAllAdmins();
    console.log('✅ Admins:', admins);

    // Test invitation
    const invitation = await caller.admin.invitations.sendAdminInvitation({
      email: 'test-admin@example.com',
      firstName: 'Test',
      lastName: 'Admin',
    });
    console.log('✅ Invitation créée:', invitation);

    console.log('✅ Tous les tests passent !');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminRoutes();
```

---

## 🔐 Sécurité

### Vérifications en place

1. **Middleware admin** : Vérifie `isSuperAdmin` ou `roles.includes('super_admin')`
2. **Accès global** : Les admins ont accès à tous les tenants (pas de restriction)
3. **Audit trail** : Toutes les actions admin sont tracées dans `AuditLog`

### Recommandations

- ✅ Changer le mot de passe du super admin après première connexion
- ✅ Limiter le nombre d'admins (surveiller via `getAllAdmins`)
- ✅ Implémenter 2FA pour les admins (futur)
- ✅ Logger toutes les actions sensibles (déjà fait via AuditLog)

---

## 📝 Prochaines étapes recommandées

### Immédiat
1. ✅ Tester les routes admin
2. ✅ Implémenter l'envoi d'emails d'invitation
3. ✅ Créer une page admin pour gérer les invitations

### Court terme
1. Créer le dashboard admin (frontend)
2. Ajouter des notifications pour les alertes critiques
3. Implémenter un système de logs d'audit visuel

### Moyen terme
1. Système de permissions granulaire (au-delà de super_admin)
2. 2FA pour les admins
3. Export des données admin (rapports PDF)

---

## 🔗 Ressources

- **Schéma Prisma** : `prisma/schema.prisma`
- **Routers admin** : `server/api/routers/admin/`
- **Services admin** : `server/services/admin/`
- **Documentation complète** : `PROCHAINES_ETAPES_ADMIN.md`

---

## ❓ Support

Pour toute question ou problème :
1. Vérifier les logs dans `AuditLog`
2. Consulter `PROCHAINES_ETAPES_ADMIN.md`
3. Tester les routes via tRPC

