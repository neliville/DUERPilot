/**
 * Script pour lister toutes les tables et leur contenu
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAllTables() {
  try {
    console.log('📋 Liste complète des tables et leur contenu :\n');

    // Liste des tables importantes
    const tables = [
      { model: 'Tenant', table: 'tenants', query: () => prisma.tenant.findMany() },
      { model: 'UserProfile', table: 'user_profiles', query: () => prisma.userProfile.findMany() },
      { model: 'User', table: 'users', query: () => prisma.user.findMany() },
      { model: 'Company', table: 'companies', query: () => prisma.company.findMany() },
      { model: 'EmailLog', table: 'email_logs', query: () => prisma.emailLog.findMany({ take: 10, orderBy: { createdAt: 'desc' } }) },
    ];

    for (const { model, table, query } of tables) {
      try {
        const data = await query();
        console.log(`📊 ${model} (table: ${table}) : ${data.length} enregistrement(s)`);
        
        if (data.length > 0) {
          // Afficher un résumé des premiers enregistrements
          if (model === 'Tenant') {
            (data as any[]).forEach((item: any) => {
              console.log(`   - ID: ${item.id}, Nom: ${item.name}, Slug: ${item.slug}`);
            });
          } else if (model === 'UserProfile') {
            (data as any[]).forEach((item: any) => {
              console.log(`   - Email: ${item.email}, Super Admin: ${item.isSuperAdmin}, Plan: ${item.plan || 'N/A'}`);
            });
          } else if (model === 'User') {
            (data as any[]).forEach((item: any) => {
              console.log(`   - Email: ${item.email}, Nom: ${item.name || 'N/A'}, Vérifié: ${item.emailVerified ? 'Oui' : 'Non'}`);
            });
          } else if (model === 'Company') {
            (data as any[]).forEach((item: any) => {
              console.log(`   - Nom: ${item.legalName}, SIRET: ${item.siret || 'N/A'}`);
            });
          } else if (model === 'EmailLog') {
            (data as any[]).forEach((item: any) => {
              console.log(`   - Template: ${item.templateId}, Email: ${item.email}, Statut: ${item.status}, Date: ${item.createdAt.toLocaleString('fr-FR')}`);
            });
          }
        }
        console.log('');
      } catch (error) {
        console.error(`❌ Erreur lors de la lecture de ${model}:`, error instanceof Error ? error.message : error);
        console.log('');
      }
    }

    console.log('✅ Vérification terminée !\n');
    console.log('💡 Dans Prisma Studio, chercher :');
    console.log('   - "UserProfile" pour voir les utilisateurs de l\'application');
    console.log('   - "User" pour voir les utilisateurs NextAuth');
    console.log('   - "Tenant" pour voir les tenants');
    console.log('   - "EmailLog" pour voir les logs d\'emails');

  } catch (error) {
    console.error('❌ Erreur générale :', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllTables().catch(console.error);

