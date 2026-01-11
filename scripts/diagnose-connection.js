const { PrismaClient } = require('@prisma/client');
const net = require('net');

// Parser l'URL de connexion
function parseDatabaseUrl(url) {
  try {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      port: parseInt(urlObj.port) || 5432,
      database: urlObj.pathname.slice(1) || 'postgres',
      user: urlObj.username,
      password: urlObj.password,
      ssl: urlObj.searchParams.get('sslmode') === 'require',
    };
  } catch (error) {
    return null;
  }
}

// Test de connexion TCP basique
async function testTcpConnection(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 5000;
    
    socket.setTimeout(timeout);
    
    socket.once('connect', () => {
      socket.destroy();
      resolve({ success: true, message: 'Port ouvert et accessible' });
    });
    
    socket.once('timeout', () => {
      socket.destroy();
      resolve({ success: false, message: 'Timeout - le port ne répond pas' });
    });
    
    socket.once('error', (error) => {
      resolve({ success: false, message: `Erreur: ${error.message}` });
    });
    
    socket.connect(port, host);
  });
}

// Test DNS
async function testDns(host) {
  const dns = require('dns').promises;
  try {
    const addresses = await dns.resolve4(host);
    return { success: true, addresses };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test de connexion PostgreSQL avec différents messages d'erreur
async function testPostgresConnection(url, variant) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url,
      },
    },
  });

  try {
    await prisma.$connect();
    await prisma.$disconnect();
    return { success: true, message: 'Connexion réussie' };
  } catch (error) {
    await prisma.$disconnect().catch(() => {});
    
    // Analyser le type d'erreur
    const errorCode = error.code || error.errorCode;
    const errorMessage = error.message || '';
    
    let diagnosis = {
      success: false,
      errorCode,
      errorMessage,
      possibleCauses: [],
      suggestions: [],
    };
    
    // Diagnostic basé sur le code d'erreur
    if (errorCode === 'P1000' || errorMessage.includes('Authentication failed')) {
      diagnosis.possibleCauses.push('Identifiants incorrects (utilisateur ou mot de passe)');
      diagnosis.possibleCauses.push('L\'utilisateur n\'existe pas sur le serveur PostgreSQL');
      diagnosis.possibleCauses.push('Le mot de passe a expiré ou a été modifié');
      diagnosis.suggestions.push('Vérifier les identifiants dans le fichier .env');
      diagnosis.suggestions.push('Tester la connexion avec psql ou un autre client PostgreSQL');
      diagnosis.suggestions.push('Vérifier que l\'utilisateur postgres existe sur le serveur');
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED')) {
      diagnosis.possibleCauses.push('Le serveur PostgreSQL n\'est pas accessible');
      diagnosis.possibleCauses.push('Le port 5432 est fermé dans le firewall');
      diagnosis.possibleCauses.push('Le serveur PostgreSQL n\'écoute pas sur cette interface');
      diagnosis.suggestions.push('Vérifier que le serveur PostgreSQL est démarré');
      diagnosis.suggestions.push('Vérifier les règles de firewall');
      diagnosis.suggestions.push('Vérifier la configuration de PostgreSQL (postgresql.conf, pg_hba.conf)');
    }
    
    if (errorMessage.includes('SSL') || errorMessage.includes('certificate')) {
      diagnosis.possibleCauses.push('Problème de configuration SSL');
      diagnosis.possibleCauses.push('Certificat SSL invalide ou expiré');
      diagnosis.suggestions.push('Essayer avec sslmode=prefer au lieu de require');
      diagnosis.suggestions.push('Essayer sans SSL si le serveur ne le supporte pas');
    }
    
    if (errorMessage.includes('database') && errorMessage.includes('does not exist')) {
      diagnosis.possibleCauses.push('La base de données n\'existe pas');
      diagnosis.suggestions.push('Créer la base de données sur le serveur');
    }
    
    return diagnosis;
  }
}

async function runDiagnostics() {
  console.log('🔍 Diagnostic de connexion PostgreSQL\n');
  console.log('=' .repeat(60));
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL n\'est pas défini dans .env');
    process.exit(1);
  }
  
  const config = parseDatabaseUrl(dbUrl);
  if (!config) {
    console.error('❌ URL de connexion invalide');
    process.exit(1);
  }
  
  console.log('\n📋 Configuration détectée:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Password: ${'*'.repeat(config.password?.length || 0)}`);
  console.log(`   SSL: ${config.ssl ? 'Required' : 'Not required'}`);
  
  // Test 1: Résolution DNS
  console.log('\n🌐 Test 1: Résolution DNS');
  console.log('-'.repeat(60));
  const dnsResult = await testDns(config.host);
  if (dnsResult.success) {
    console.log(`✅ DNS résolu: ${dnsResult.addresses.join(', ')}`);
  } else {
    console.log(`❌ Échec DNS: ${dnsResult.error}`);
    console.log('   → Le nom d\'hôte ne peut pas être résolu');
    process.exit(1);
  }
  
  // Test 2: Connexion TCP
  console.log('\n🔌 Test 2: Connexion TCP au port PostgreSQL');
  console.log('-'.repeat(60));
  const tcpResult = await testTcpConnection(config.host, config.port);
  if (tcpResult.success) {
    console.log(`✅ ${tcpResult.message}`);
  } else {
    console.log(`❌ ${tcpResult.message}`);
    console.log('   → Le serveur PostgreSQL n\'est pas accessible sur ce port');
    console.log('   → Vérifiez le firewall et que PostgreSQL écoute sur cette interface');
    process.exit(1);
  }
  
  // Test 3: Connexion PostgreSQL avec différentes configurations
  console.log('\n🗄️  Test 3: Connexion PostgreSQL');
  console.log('-'.repeat(60));
  
  const variants = [
    { name: 'Configuration originale (sslmode=require)', url: dbUrl },
    { name: 'sslmode=prefer', url: dbUrl.replace('sslmode=require', 'sslmode=prefer') },
    { name: 'sslmode=disable', url: dbUrl.replace('sslmode=require', 'sslmode=disable') },
    { name: 'Sans paramètres SSL', url: dbUrl.split('?')[0] },
  ];
  
  for (const variant of variants) {
    console.log(`\n   Test: ${variant.name}`);
    const result = await testPostgresConnection(variant.url, variant.name);
    
    if (result.success) {
      console.log(`   ✅ ${result.message}`);
      console.log(`\n🎉 Configuration fonctionnelle trouvée: ${variant.name}`);
      console.log(`   Utilisez cette URL dans votre .env:`);
      console.log(`   ${variant.url.replace(/:[^:@]+@/, ':****@')}`);
      process.exit(0);
    } else {
      console.log(`   ❌ Échec: ${result.errorMessage.split('\n')[0]}`);
      
      if (result.possibleCauses.length > 0) {
        console.log(`\n   Causes possibles:`);
        result.possibleCauses.forEach(cause => {
          console.log(`   • ${cause}`);
        });
      }
    }
    
    // Attendre un peu entre les tentatives
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Résumé final
  console.log('\n\n📊 Résumé du diagnostic');
  console.log('='.repeat(60));
  console.log('❌ Aucune configuration n\'a fonctionné');
  console.log('\n🔧 Actions recommandées:');
  console.log('1. Vérifier les identifiants avec l\'administrateur de la base de données');
  console.log('2. Tester la connexion avec un client PostgreSQL (psql, DBeaver, pgAdmin)');
  console.log('3. Vérifier que votre IP est autorisée dans pg_hba.conf');
  console.log('4. Vérifier que PostgreSQL écoute sur toutes les interfaces (listen_addresses = \'*\' dans postgresql.conf)');
  console.log('5. Vérifier les règles de firewall du serveur');
  console.log('6. Vérifier que le serveur PostgreSQL est démarré et accessible');
  
  process.exit(1);
}

runDiagnostics().catch(console.error);

