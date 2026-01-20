/**
 * Script de migration des rôles vers le nouveau système
 * 
 * Migre les rôles de l'ancien système vers le nouveau :
 * - admin_tenant → admin
 * - manager → site_manager
 * - operator → observer
 * - auditor → consultant
 * 
 * Identifie le premier utilisateur de chaque tenant comme owner
 * Définit isOwner = true et ownerId dans Tenant
 * 
 * Usage:
 *   pnpm tsx scripts/migrate-roles-to-new-system.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Mapping des anciens rôles vers les nouveaux
 */
const ROLE_MAPPING: Record<string, string> = {
  admin_tenant: 'admin',
  manager: 'site_manager',
  operator: 'observer',
  // auditor reste auditor (pas de changement)
  // Rôles inchangés
  super_admin: 'super_admin',
  qse: 'qse',
  // Nouveaux rôles (déjà dans la bonne forme)
  owner: 'owner',
  admin: 'admin',
  site_manager: 'site_manager',
  representative: 'representative',
  observer: 'observer',
  consultant: 'consultant',
};

async function migrateRoles() {
  console.log('🚀 [Migration] Démarrage de la migration des rôles...');
  console.log('');

  try {
    // 1. Récupérer tous les tenants
    const tenants = await prisma.tenant.findMany({
      include: {
        users: {
          orderBy: {
            createdAt: 'asc', // Premier utilisateur = propriétaire
          },
        },
      },
    });

    console.log(`📊 [Migration] ${tenants.length} tenants à traiter`);

    let tenantsMigrated = 0;
    let usersMigrated = 0;

    for (const tenant of tenants) {
      console.log(`\n🏢 [Migration] Tenant: ${tenant.name} (${tenant.id})`);

      // 2. Identifier le premier utilisateur comme owner
      if (tenant.users.length > 0) {
        const firstUser = tenant.users[0];

        // Si le tenant n'a pas encore d'ownerId, définir le premier utilisateur comme owner
        if (!tenant.ownerId) {
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: { ownerId: firstUser.id },
          });
          console.log(`  ✅ Owner défini: ${firstUser.email}`);
        }

        // 3. Migrer chaque utilisateur du tenant
        for (const user of tenant.users) {
          const oldRoles = user.roles || [];
          const newRoles: string[] = [];
          let hasChanges = false;

          // Migrer les rôles
          for (const oldRole of oldRoles) {
            const newRole = ROLE_MAPPING[oldRole] || oldRole;
            
            if (newRole !== oldRole) {
              hasChanges = true;
              console.log(`  🔄 ${user.email}: ${oldRole} → ${newRole}`);
            }
            
            if (!newRoles.includes(newRole)) {
              newRoles.push(newRole);
            }
          }

          // Si c'est le premier utilisateur (owner), s'assurer qu'il a le rôle 'owner'
          if (user.id === firstUser.id && !newRoles.includes('owner')) {
            newRoles.unshift('owner'); // Ajouter au début
            hasChanges = true;
            console.log(`  👑 ${user.email}: Ajout du rôle 'owner'`);
          }

          // Si l'utilisateur est owner, définir isOwner = true
          const isOwner = user.id === firstUser.id || newRoles.includes('owner');

          // Mettre à jour l'utilisateur
          if (hasChanges || user.isOwner !== isOwner) {
            await prisma.userProfile.update({
              where: { id: user.id },
              data: {
                roles: newRoles,
                isOwner: isOwner,
              },
            });

            usersMigrated++;
            console.log(`  ✅ ${user.email} migré (isOwner: ${isOwner})`);
          } else {
            console.log(`  ⏭️  ${user.email} déjà à jour`);
          }
        }

        tenantsMigrated++;
      } else {
        console.log(`  ⚠️  Aucun utilisateur trouvé pour ce tenant`);
      }
    }

    console.log('');
    console.log('✅ [Migration] Migration terminée avec succès !');
    console.log(`📊 Statistiques:`);
    console.log(`   - Tenants traités: ${tenantsMigrated}`);
    console.log(`   - Utilisateurs migrés: ${usersMigrated}`);
    console.log('');

    // 4. Afficher un résumé des rôles après migration
    const roleCounts = await prisma.userProfile.groupBy({
      by: ['roles'],
      _count: {
        roles: true,
      },
    });

    console.log('📊 Distribution des rôles après migration:');
    for (const group of roleCounts) {
      console.log(`   - ${JSON.stringify(group.roles)}: ${group._count.roles} utilisateur(s)`);
    }

    console.log('');
    const ownerCount = await prisma.userProfile.count({
      where: { isOwner: true },
    });
    console.log(`👑 Nombre de propriétaires: ${ownerCount}`);
    console.log('');

  } catch (error) {
    console.error('❌ [Migration] Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateRoles()
  .then(() => {
    console.log('✅ Migration terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
