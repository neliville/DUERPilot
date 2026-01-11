import { NextResponse } from 'next/server';
import { minioService } from '@/server/services/storage/minio-service';
import { BUCKETS } from '@/server/services/storage/constants';

export async function GET() {
  const results: {
    step: string;
    status: 'success' | 'error';
    message: string;
    details?: string;
  }[] = [];

  // 1. Vérifier les variables d'environnement
  const endpoint = process.env.MINIO_ENDPOINT;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  const region = process.env.MINIO_REGION || 'eu-central-1';
  const useSSL = process.env.MINIO_USE_SSL === 'true';

  results.push({
    step: 'Variables d\'environnement',
    status: endpoint && accessKey && secretKey ? 'success' : 'error',
    message: endpoint && accessKey && secretKey
      ? 'Toutes les variables sont définies'
      : 'Variables manquantes',
    details: `Endpoint: ${endpoint ? '✅' : '❌'}, AccessKey: ${accessKey ? '✅' : '❌'}, SecretKey: ${secretKey ? '✅' : '❌'}, Region: ${region}, SSL: ${useSSL}`,
  });

  if (!endpoint || !accessKey || !secretKey) {
    return NextResponse.json({
      success: false,
      results,
      error: 'Configuration incomplète',
    }, { status: 500 });
  }

  // 2. Tester la connexion
  try {
    await minioService.listFiles({
      bucket: BUCKETS.IMPORTS,
      prefix: 'test/',
      maxKeys: 1,
    });
    results.push({
      step: 'Connexion au serveur',
      status: 'success',
      message: 'Connexion réussie',
    });
  } catch (error) {
    results.push({
      step: 'Connexion au serveur',
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({
      success: false,
      results,
      error: 'Erreur de connexion',
    }, { status: 500 });
  }

  // 3. Tester l'upload (utiliser un type MIME autorisé pour le bucket IMPORTS)
  try {
    // Simuler un fichier CSV pour le test (type autorisé pour IMPORTS)
    const testContent = Buffer.from('Test de connexion MinIO - ' + new Date().toISOString());
    const testPath = `test/connection-test-${Date.now()}.csv`;

    const fileUrl = await minioService.uploadFile({
      bucket: BUCKETS.IMPORTS,
      path: testPath,
      buffer: testContent,
      contentType: 'text/csv',
      metadata: {
        organization_id: 'test-org',
        user_id: 'test-user',
        created_by: 'test-api',
        document_type: 'import',
        created_at: new Date().toISOString(),
        content_type: 'text/csv',
        original_filename: 'connection-test.csv',
        file_size: testContent.length,
      },
    });

    results.push({
      step: 'Upload de fichier',
      status: 'success',
      message: 'Upload réussi',
      details: `URL: ${fileUrl}`,
    });

    // 4. Tester la suppression
    try {
      await minioService.deleteFile(BUCKETS.IMPORTS, testPath);
      results.push({
        step: 'Suppression de fichier',
        status: 'success',
        message: 'Suppression réussie',
      });
    } catch (error) {
      results.push({
        step: 'Suppression de fichier',
        status: 'error',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  } catch (error) {
    results.push({
      step: 'Upload de fichier',
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error instanceof Error ? error.stack : undefined,
    });
  }

  // 5. Tester la génération d'URL présignée
  try {
    const presignedUrl = await minioService.generatePresignedUrl({
      bucket: BUCKETS.IMPORTS,
      path: 'test/presigned-test.txt',
      method: 'getObject',
      expiresIn: 60,
    });
    results.push({
      step: 'Génération URL présignée',
      status: 'success',
      message: 'URL présignée générée',
      details: presignedUrl.substring(0, 100) + '...',
    });
  } catch (error) {
    results.push({
      step: 'Génération URL présignée',
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }

  const allSuccess = results.every(r => r.status === 'success');

  return NextResponse.json({
    success: allSuccess,
    results,
    summary: {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      errors: results.filter(r => r.status === 'error').length,
    },
  });
}

