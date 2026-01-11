/**
 * Script pour diagnostiquer pourquoi Prisma Studio affiche 0 enregistrements
 * 
 * Ce script vérifie :
 * - Quel DATABASE_URL est utilisé
 * - Si la connexion fonctionne
 * - Le nombre réel d'enregistrements dans chaque table
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnosePrismaStudio() {
  try {
    console.log('🔍 Diagnostic Prisma Studio - Problème WSL/Windows\n');
    console.log('=' .repeat(60));
    
    // 1. Vérifier l'environnement
    console.log('\n1️⃣ Environnement :');
    console.log(`   - Node: ${process.version}`);
    console.log(`   - Platform: ${process.platform}`);
    console.log(`   - CWD: ${process.cwd()}`);
    
    // 2. Vérifier le DATABASE_URL
    console.log('\n2️⃣ Configuration DATABASE_URL :');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('   ❌ DATABASE_URL non défini dans process.env');
      console.log('   ⚠️  Prisma Studio pourrait utiliser un DATABASE_URL différent !');
      return;
    }
    
    // Masquer le mot de passe pour l'affichage
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`   ✅ DATABASE_URL trouvé : ${maskedUrl.split('?')[0]}`);
    
    // Extraire les informations de connexion
    const urlMatch = dbUrl.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
    if (urlMatch) {
      const [, user, , host, port, database] = urlMatch;
      console.log(`   - Host: ${host}`);
      console.log(`   - Port: ${port}`);
      console.log(`   - Database: ${database}`);
      console.log(`   - User: ${user}`);
    }
    
    // 3. Tester la connexion
    console.log('\n3️⃣ Test de connexion :');
    try {
      await prisma.$connect();
      console.log('   ✅ Connexion réussie');
    } catch (error) {
      console.log('   ❌ Erreur de connexion :', error instanceof Error ? error.message : error);
      return;
    }
    
    // 4. Compter les enregistrements dans chaque table importante
    console.log('\n4️⃣ Nombre d\'enregistrements par table :\n');
    
    const tables = [
      { name: 'Tenant', query: () => prisma.tenant.count() },
      { name: 'UserProfile', query: () => prisma.userProfile.count() },
      { name: 'User (NextAuth)', query: () => prisma.user.count() },
      { name: 'Company', query: () => prisma.company.count() },
      { name: 'EmailLog', query: () => prisma.emailLog.count() },
      { name: 'WorkUnit', query: () => prisma.workUnit.count() },
      { name: 'RiskAssessment', query: () => prisma.riskAssessment.count() },
    ];
    
    for (const { name, query } of tables) {
      try {
        const count = await query();
        const status = count > 0 ? '✅' : '⚠️ ';
        console.log(`   ${status} ${name.padEnd(25)} : ${count} enregistrement(s)`);
      } catch (error) {
        console.log(`   ❌ ${name.padEnd(25)} : Erreur - ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }
    
    // 5. Vérifier spécifiquement les utilisateurs
    console.log('\n5️⃣ Détail des utilisateurs :');
    const userProfiles = await prisma.userProfile.findMany({
      select: { email: true, isSuperAdmin: true, plan: true },
    });
    console.log(`   - UserProfile trouvés : ${userProfiles.length}`);
    userProfiles.forEach((up) => {
      console.log(`     • ${up.email} (Admin: ${up.isSuperAdmin ? 'Oui' : 'Non'}, Plan: ${up.plan})`);
    });
    
    const users = await prisma.user.findMany({
      select: { email: true, emailVerified: true },
    });
    console.log(`   - User (NextAuth) trouvés : ${users.length}`);
    users.forEach((u) => {
      console.log(`     • ${u.email} (Vérifié: ${u.emailVerified ? 'Oui' : 'Non'})`);
    });
    
    // 6. Diagnostic
    console.log('\n6️⃣ Diagnostic :\n');
    
    const tenantCount = await prisma.tenant.count();
    const userProfileCount = await prisma.userProfile.count();
    
    if (tenantCount === 0 && userProfileCount === 0) {
      console.log('   ❌ PROBLÈME DÉTECTÉ : Aucune donnée dans la base de données');
      console.log('   ⚠️  Causes possibles :');
      console.log('      1. Prisma Studio se connecte à une autre base de données');
      console.log('      2. Le .env utilisé par Prisma Studio est différent');
      console.log('      3. Prisma Studio est lancé depuis Windows avec un .env différent');
      console.log('      4. La base de données a été vidée');
    } else if (tenantCount > 0 || userProfileCount > 0) {
      console.log('   ✅ Données présentes dans la base de données');
      console.log('   ⚠️  Si Prisma Studio affiche "0", c\'est qu\'il se connecte à une autre base :');
      console.log('      1. Vérifier que Prisma Studio est lancé depuis WSL (pas Windows)');
      console.log('      2. Vérifier que Prisma Studio utilise le bon .env');
      console.log('      3. Relancer Prisma Studio depuis WSL : pnpm db:studio');
      console.log('      4. Vérifier que le DATABASE_URL dans .env correspond à la base de données');
    }
    
    // 7. Recommandations
    console.log('\n7️⃣ Recommandations pour WSL/Windows :\n');
    console.log('   ✅ Solution 1 : Lancer Prisma Studio depuis WSL');
    console.log('      cd /home/neliville/dev/LAB/PROJECTS/DUERPAI');
    console.log('      pnpm db:studio');
    console.log('');
    console.log('   ✅ Solution 2 : Vérifier le .env');
    console.log('      - S\'assurer que .env est dans le projet (pas dans Windows)');
    console.log('      - Vérifier que DATABASE_URL pointe vers la bonne base');
    console.log('      - Ne pas avoir plusieurs fichiers .env');
    console.log('');
    console.log('   ✅ Solution 3 : Utiliser le lien depuis l\'admin');
    console.log('      - Ouvrir http://localhost:5555 depuis le navigateur Windows');
    console.log('      - Mais s\'assurer que Prisma Studio est lancé depuis WSL');
    console.log('');
    console.log('   ⚠️  Important : Prisma Studio doit être lancé depuis WSL');
    console.log('      car il lit le .env depuis le système de fichiers WSL');
    
  } catch (error) {
    console.error('\n❌ Erreur lors du diagnostic :', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

diagnosePrismaStudio().catch(console.error);

