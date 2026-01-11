/**
 * Script pour vérifier les noms réels des tables dans la base de données
 * et expliquer comment les trouver dans Prisma Studio
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTablesNames() {
  try {
    console.log('🔍 Vérification des noms de tables dans la base de données...\n');

    // Récupérer la liste de toutes les tables depuis la base de données
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log('📋 Tables trouvées dans la base de données :\n');
    
    const userRelatedTables = tables.filter(t => 
      t.tablename.includes('user') || 
      t.tablename.includes('tenant') ||
      t.tablename.includes('company')
    );

    console.log('🔑 Tables liées aux utilisateurs :');
    userRelatedTables.forEach(table => {
      console.log(`  - ${table.tablename}`);
    });

    console.log('\n📊 Toutes les tables :');
    tables.forEach(table => {
      console.log(`  - ${table.tablename}`);
    });

    // Vérifier le contenu de chaque table importante
    console.log('\n\n🔍 Contenu des tables importantes :\n');

    // Table tenants
    const tenantsCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM tenants;
    `;
    console.log(`1️⃣ Table "tenants" : ${tenantsCount[0]?.count || 0} enregistrement(s)`);

    // Table users (NextAuth)
    const usersCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM users;
    `;
    console.log(`2️⃣ Table "users" (NextAuth) : ${usersCount[0]?.count || 0} enregistrement(s)`);

    // Table user_profiles
    const userProfilesCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM user_profiles;
    `;
    console.log(`3️⃣ Table "user_profiles" : ${userProfilesCount[0]?.count || 0} enregistrement(s)`);

    // Table companies
    const companiesCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM companies;
    `;
    console.log(`4️⃣ Table "companies" : ${companiesCount[0]?.count || 0} enregistrement(s)`);

    // Table email_logs
    const emailLogsCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM email_logs;
    `;
    console.log(`5️⃣ Table "email_logs" : ${emailLogsCount[0]?.count || 0} enregistrement(s)`);

    console.log('\n\n📝 Guide pour trouver les tables dans Prisma Studio :\n');
    console.log('Dans Prisma Studio, les tables sont affichées avec les noms des MODÈLES (pas les noms réels des tables).');
    console.log('\n✅ Rechercher ces modèles dans Prisma Studio :');
    console.log('  - "User" → Table réelle : "users" (NextAuth)');
    console.log('  - "UserProfile" → Table réelle : "user_profiles" (utilisateurs de l\'application)');
    console.log('  - "Tenant" → Table réelle : "tenants"');
    console.log('  - "Company" → Table réelle : "companies"');
    console.log('  - "EmailLog" → Table réelle : "email_logs"');

    console.log('\n⚠️  Important :');
    console.log('  - Prisma Studio affiche les MODÈLES (User, UserProfile, Tenant)');
    console.log('  - Les tables réelles dans PostgreSQL sont en snake_case (users, user_profiles, tenants)');
    console.log('  - Si vous ne voyez pas les tables dans Prisma Studio, vérifiez que vous êtes connecté à la bonne base de données');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification :', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkTablesNames().catch(console.error);

