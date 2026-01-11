const { PrismaClient } = require('@prisma/client');

// Variantes d'URL à tester
const urlVariants = [
  // Original avec sslmode=require
  'postgres://postgres:VSnEZSVTtG1tXdKBLrvHfqMOFnzbT0wsHbPshpEoFlfNETKWmrZFywfrfg9uqAzF@46.224.147.210:5432/postgres?sslmode=require',
  
  // Avec sslmode=prefer
  'postgres://postgres:VSnEZSVTtG1tXdKBLrvHfqMOFnzbT0wsHbPshpEoFlfNETKWmrZFywfrfg9uqAzF@46.224.147.210:5432/postgres?sslmode=prefer',
  
  // Sans SSL
  'postgres://postgres:VSnEZSVTtG1tXdKBLrvHfqMOFnzbT0wsHbPshpEoFlfNETKWmrZFywfrfg9uqAzF@46.224.147.210:5432/postgres',
  
  // Avec ssl=true au lieu de sslmode
  'postgres://postgres:VSnEZSVTtG1tXdKBLrvHfqMOFnzbT0wsHbPshpEoFlfNETKWmrZFywfrfg9uqAzF@46.224.147.210:5432/postgres?ssl=true',
];

async function testVariant(url, index) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url,
      },
    },
  });

  try {
    console.log(`\n🔍 Test ${index + 1}/${urlVariants.length}: ${url.includes('sslmode') ? url.split('?')[1] : 'sans paramètres SSL'}`);
    await prisma.$connect();
    console.log('✅ Connexion réussie avec cette URL !');
    
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Requête SQL réussie');
    console.log('📌 URL fonctionnelle:', url.replace(/:[^:@]+@/, ':****@'));
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log(`❌ Échec: ${error.message.split('\n')[0]}`);
    await prisma.$disconnect().catch(() => {});
    return false;
  }
}

async function testAllVariants() {
  console.log('🧪 Test de différentes configurations de connexion...\n');
  
  for (let i = 0; i < urlVariants.length; i++) {
    const success = await testVariant(urlVariants[i], i);
    if (success) {
      console.log(`\n✅ URL fonctionnelle trouvée ! Utilisez cette configuration dans votre .env`);
      process.exit(0);
    }
    // Attendre un peu entre les tentatives
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n❌ Aucune configuration n\'a fonctionné.');
  console.log('\nVérifications à faire :');
  console.log('1. Vérifier que les identifiants sont corrects');
  console.log('2. Vérifier que votre IP est autorisée sur le serveur PostgreSQL');
  console.log('3. Vérifier que le serveur PostgreSQL accepte les connexions externes');
  console.log('4. Vérifier les règles de firewall');
  process.exit(1);
}

testAllVariants();

