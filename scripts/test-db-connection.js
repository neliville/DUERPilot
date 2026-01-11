const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Test de connexion à la base de données...');
    console.log('URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    
    // Test de connexion simple
    await prisma.$connect();
    console.log('✅ Connexion réussie !');
    
    // Test d'une requête simple
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Requête SQL réussie');
    console.log('Version PostgreSQL:', result[0]?.version?.substring(0, 50) || 'N/A');
    
    // Vérifier si le schéma public existe
    const schemas = await prisma.$queryRaw`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'public'
    `;
    console.log('✅ Schéma public trouvé');
    
    await prisma.$disconnect();
    console.log('✅ Déconnexion réussie');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('Code:', error.code);
    console.error('Détails:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();

