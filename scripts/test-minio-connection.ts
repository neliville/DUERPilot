#!/usr/bin/env tsx
/**
 * Script de test pour vérifier la connexion MinIO
 */

import { minioService } from '../server/services/storage/minio-service';
import { BUCKETS } from '../server/services/storage/constants';

async function testMinioConnection() {
  console.log('🔍 Test de connexion MinIO...\n');

  // 1. Vérifier les variables d'environnement
  console.log('📋 Vérification des variables d\'environnement :');
  const endpoint = process.env.MINIO_ENDPOINT;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  const region = process.env.MINIO_REGION || 'eu-central-1';
  const useSSL = process.env.MINIO_USE_SSL === 'true';

  console.log(`  • MINIO_ENDPOINT: ${endpoint ? '✅ Défini' : '❌ Manquant'}`);
  console.log(`  • MINIO_ACCESS_KEY: ${accessKey ? '✅ Défini' : '❌ Manquant'}`);
  console.log(`  • MINIO_SECRET_KEY: ${secretKey ? '✅ Défini (masqué)' : '❌ Manquant'}`);
  console.log(`  • MINIO_REGION: ${region}`);
  console.log(`  • MINIO_USE_SSL: ${useSSL}`);

  if (!endpoint || !accessKey || !secretKey) {
    console.error('\n❌ Configuration incomplète. Veuillez définir toutes les variables requises.');
    process.exit(1);
  }

  console.log('\n✅ Toutes les variables sont définies.\n');

  // 2. Tester la connexion en listant les fichiers (opération légère)
  try {
    console.log('🔌 Test de connexion au serveur MinIO...');
    await minioService.listFiles({
      bucket: BUCKETS.IMPORTS,
      prefix: 'test/',
      maxKeys: 1,
    });
    console.log('✅ Connexion réussie !\n');
  } catch (error) {
    console.error('❌ Erreur de connexion :');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      
      // Messages d'aide selon le type d'erreur
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        console.error('\n💡 Vérifiez que :');
        console.error('   • Le serveur MinIO est démarré');
        console.error('   • L\'endpoint est correct (ex: http://localhost:9000)');
        console.error('   • Le port est accessible');
      } else if (error.message.includes('InvalidAccessKeyId') || error.message.includes('SignatureDoesNotMatch')) {
        console.error('\n💡 Vérifiez que :');
        console.error('   • MINIO_ACCESS_KEY est correct');
        console.error('   • MINIO_SECRET_KEY est correct');
      } else if (error.message.includes('NoSuchBucket')) {
        console.error('\n💡 Le bucket n\'existe pas. Il sera créé automatiquement lors du premier upload.');
      }
    } else {
      console.error('   Erreur inconnue:', error);
    }
    process.exit(1);
  }

  // 3. Tester l'upload d'un fichier de test
  try {
    console.log('📤 Test d\'upload d\'un fichier de test...');
    const testContent = Buffer.from('Test de connexion MinIO - ' + new Date().toISOString());
    const testPath = `test/connection-test-${Date.now()}.txt`;

    const fileUrl = await minioService.uploadFile({
      bucket: BUCKETS.IMPORTS,
      path: testPath,
      fileBuffer: testContent,
      contentType: 'text/plain',
      metadata: {
        organization_id: 'test-org',
        user_id: 'test-user',
        created_by: 'test-script',
        document_type: 'import',
        created_at: new Date().toISOString(),
        content_type: 'text/plain',
        original_filename: 'connection-test.txt',
      },
    });

    console.log(`✅ Upload réussi ! URL: ${fileUrl}\n`);

    // 4. Tester la suppression du fichier de test
    console.log('🗑️  Test de suppression du fichier de test...');
    await minioService.deleteFile(BUCKETS.IMPORTS, testPath);
    console.log('✅ Suppression réussie !\n');

  } catch (error) {
    console.error('❌ Erreur lors du test d\'upload :');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error('   Erreur inconnue:', error);
    }
    process.exit(1);
  }

  // 5. Tester la génération d'une URL présignée
  try {
    console.log('🔗 Test de génération d\'URL présignée...');
    const presignedUrl = await minioService.generatePresignedUrl({
      bucket: BUCKETS.IMPORTS,
      path: 'test/presigned-test.txt',
      method: 'getObject',
      expiresIn: 60, // 1 minute
    });
    console.log(`✅ URL présignée générée : ${presignedUrl.substring(0, 80)}...\n`);
  } catch (error) {
    console.error('❌ Erreur lors de la génération d\'URL présignée :');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error('   Erreur inconnue:', error);
    }
    process.exit(1);
  }

  console.log('🎉 Tous les tests sont passés avec succès !');
  console.log('\n✨ Le service MinIO est opérationnel et prêt à être utilisé.\n');
}

// Exécuter le test
testMinioConnection()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale lors du test :', error);
    process.exit(1);
  });

