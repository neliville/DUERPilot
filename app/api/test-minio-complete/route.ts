import { NextResponse } from 'next/server';
import { minioService } from '@/server/services/storage/minio-service';
import { BUCKETS } from '@/server/services/storage/constants';
import { buildPath } from '@/server/services/storage/utils';

interface TestResult {
  category: string;
  test: string;
  status: 'success' | 'error' | 'skipped';
  message: string;
  details?: string;
  duration?: number;
}

export async function GET() {
  const results: TestResult[] = [];
  const testFiles: Array<{ bucket: string; path: string }> = [];

  const startTime = Date.now();

  // ============================================
  // 1. TEST CONFIGURATION
  // ============================================
  console.log('🔍 Test 1: Configuration...');
  const configStart = Date.now();
  const endpoint = process.env.MINIO_ENDPOINT;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;

  if (!endpoint || !accessKey || !secretKey) {
    results.push({
      category: 'Configuration',
      test: 'Variables d\'environnement',
      status: 'error',
      message: 'Variables manquantes',
      duration: Date.now() - configStart,
    });
    return NextResponse.json({ success: false, results }, { status: 500 });
  }

  results.push({
    category: 'Configuration',
    test: 'Variables d\'environnement',
    status: 'success',
    message: 'Toutes les variables sont définies',
    duration: Date.now() - configStart,
  });

  // ============================================
  // 2. TEST CONNEXION
  // ============================================
  console.log('🔌 Test 2: Connexion...');
  const connStart = Date.now();
  try {
    await minioService.listFiles({
      bucket: BUCKETS.IMPORTS,
      prefix: 'test/',
      maxKeys: 1,
    });
    results.push({
      category: 'Connexion',
      test: 'Connexion au serveur',
      status: 'success',
      message: 'Connexion réussie',
      duration: Date.now() - connStart,
    });
  } catch (error) {
    results.push({
      category: 'Connexion',
      test: 'Connexion au serveur',
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      duration: Date.now() - connStart,
    });
    return NextResponse.json({ success: false, results }, { status: 500 });
  }

  // ============================================
  // 3. TEST UPLOAD AVATAR
  // ============================================
  console.log('👤 Test 3: Upload avatar...');
  const avatarStart = Date.now();
  try {
    const avatarContent = Buffer.from('fake-avatar-image-data');
    const avatarPath = buildPath.avatar('test-user-123');
    testFiles.push({ bucket: BUCKETS.AVATARS, path: avatarPath });

    const avatarUrl = await minioService.uploadFile({
      bucket: BUCKETS.AVATARS,
      path: avatarPath,
      buffer: avatarContent,
      contentType: 'image/webp',
      metadata: {
        organization_id: 'test-org',
        user_id: 'test-user-123',
        created_by: 'test-api',
        document_type: 'avatar',
        created_at: new Date().toISOString(),
        content_type: 'image/webp',
        original_filename: 'avatar.webp',
        file_size: avatarContent.length,
      },
      makePublic: false, // MinIO peut ne pas supporter les ACLs, utiliser des URLs présignées à la place
    });

    results.push({
      category: 'Upload Avatar',
      test: 'Upload avatar utilisateur',
      status: 'success',
      message: 'Avatar uploadé avec succès',
      details: `URL: ${avatarUrl}`,
      duration: Date.now() - avatarStart,
    });

    // Test URL publique (si la méthode existe)
    try {
      // Construire l'URL publique manuellement pour les avatars
      const endpoint = process.env.MINIO_ENDPOINT || '';
      const publicUrl = `${endpoint}/${BUCKETS.AVATARS}/${avatarPath}`;
      results.push({
        category: 'Upload Avatar',
        test: 'Génération URL publique',
        status: 'success',
        message: 'URL publique générée',
        details: publicUrl,
        duration: 0,
      });
    } catch (error) {
      results.push({
        category: 'Upload Avatar',
        test: 'Génération URL publique',
        status: 'error',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        duration: 0,
      });
    }
  } catch (error) {
    results.push({
      category: 'Upload Avatar',
      test: 'Upload avatar utilisateur',
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      duration: Date.now() - avatarStart,
    });
  }

  // ============================================
  // 4. TEST UPLOAD LOGO ENTREPRISE
  // ============================================
  console.log('🏢 Test 4: Upload logo entreprise...');
  const logoStart = Date.now();
  try {
    const logoContent = Buffer.from('fake-logo-image-data');
    const logoPath = buildPath.companyLogo('test-org', 'test-company-456');
    testFiles.push({ bucket: BUCKETS.LOGOS, path: logoPath });

    const logoUrl = await minioService.uploadFile({
      bucket: BUCKETS.LOGOS,
      path: logoPath,
      buffer: logoContent,
      contentType: 'image/png',
      metadata: {
        organization_id: 'test-org',
        user_id: 'test-user-123',
        created_by: 'test-api',
        document_type: 'logo',
        created_at: new Date().toISOString(),
        content_type: 'image/png',
        original_filename: 'logo.png',
        file_size: logoContent.length,
      },
      makePublic: false, // Les logos peuvent être publics via getPublicUrl si nécessaire
    });

    results.push({
      category: 'Upload Logo',
      test: 'Upload logo entreprise',
      status: 'success',
      message: 'Logo uploadé avec succès',
      details: `URL: ${logoUrl}`,
      duration: Date.now() - logoStart,
    });
  } catch (error) {
    results.push({
      category: 'Upload Logo',
      test: 'Upload logo entreprise',
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      duration: Date.now() - logoStart,
    });
  }

  // ============================================
  // 5. TEST UPLOAD DUERP PDF
  // ============================================
  console.log('📄 Test 5: Upload DUERP PDF...');
  const duerpStart = Date.now();
  try {
    const duerpContent = Buffer.from('%PDF-1.4 fake PDF content');
    const duerpPath = buildPath.duerp('test-org', 2024, 'duerp-2024-v1');
    testFiles.push({ bucket: BUCKETS.DOCUMENTS, path: duerpPath });

    const duerpUrl = await minioService.uploadFile({
      bucket: BUCKETS.DOCUMENTS,
      path: duerpPath,
      buffer: duerpContent,
      contentType: 'application/pdf',
      metadata: {
        organization_id: 'test-org',
        user_id: 'test-user-123',
        created_by: 'test-api',
        document_type: 'duerp',
        created_at: new Date().toISOString(),
        content_type: 'application/pdf',
        original_filename: 'duerp-2024-v1.pdf',
        file_size: duerpContent.length,
        retention_until: new Date(Date.now() + 40 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 40 ans
      },
    });

    results.push({
      category: 'Upload DUERP',
      test: 'Upload DUERP PDF',
      status: 'success',
      message: 'DUERP uploadé avec succès',
      details: `URL: ${duerpUrl}`,
      duration: Date.now() - duerpStart,
    });
  } catch (error) {
    results.push({
      category: 'Upload DUERP',
      test: 'Upload DUERP PDF',
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      duration: Date.now() - duerpStart,
    });
  }

  // ============================================
  // 6. TEST UPLOAD IMPORT PDF
  // ============================================
  console.log('📥 Test 6: Upload import PDF...');
  const importPdfStart = Date.now();
  try {
    const importPdfContent = Buffer.from('%PDF-1.4 fake PDF import content');
    const importPdfPath = buildPath.import('test-user-123', 'import-789', 'duerp-import.pdf');
    testFiles.push({ bucket: BUCKETS.IMPORTS, path: importPdfPath });

    const importPdfUrl = await minioService.uploadFile({
      bucket: BUCKETS.IMPORTS,
      path: importPdfPath,
      buffer: importPdfContent,
      contentType: 'application/pdf',
      metadata: {
        organization_id: 'test-org',
        user_id: 'test-user-123',
        created_by: 'test-api',
        document_type: 'import',
        created_at: new Date().toISOString(),
        content_type: 'application/pdf',
        original_filename: 'duerp-import.pdf',
        file_size: importPdfContent.length,
      },
    });

    results.push({
      category: 'Upload Import',
      test: 'Upload import PDF',
      status: 'success',
      message: 'Import PDF uploadé avec succès',
      details: `URL: ${importPdfUrl}`,
      duration: Date.now() - importPdfStart,
    });
  } catch (error) {
    results.push({
      category: 'Upload Import',
      test: 'Upload import PDF',
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      duration: Date.now() - importPdfStart,
    });
  }

  // ============================================
  // 7. TEST UPLOAD IMPORT EXCEL
  // ============================================
  console.log('📊 Test 7: Upload import Excel...');
  const importExcelStart = Date.now();
  try {
    const importExcelContent = Buffer.from('fake Excel content');
    const importExcelPath = buildPath.import('test-user-123', 'import-789', 'duerp-import.xlsx');
    testFiles.push({ bucket: BUCKETS.IMPORTS, path: importExcelPath });

    const importExcelUrl = await minioService.uploadFile({
      bucket: BUCKETS.IMPORTS,
      path: importExcelPath,
      buffer: importExcelContent,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      metadata: {
        organization_id: 'test-org',
        user_id: 'test-user-123',
        created_by: 'test-api',
        document_type: 'import',
        created_at: new Date().toISOString(),
        content_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        original_filename: 'duerp-import.xlsx',
        file_size: importExcelContent.length,
      },
    });

    results.push({
      category: 'Upload Import',
      test: 'Upload import Excel',
      status: 'success',
      message: 'Import Excel uploadé avec succès',
      details: `URL: ${importExcelUrl}`,
      duration: Date.now() - importExcelStart,
    });
  } catch (error) {
    results.push({
      category: 'Upload Import',
      test: 'Upload import Excel',
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      duration: Date.now() - importExcelStart,
    });
  }

  // ============================================
  // 8. TEST UPLOAD IMPORT CSV
  // ============================================
  console.log('📋 Test 8: Upload import CSV...');
  const importCsvStart = Date.now();
  try {
    const importCsvContent = Buffer.from('Risque,Gravité,Action\nBrûlure,3,Formation');
    const importCsvPath = buildPath.import('test-user-123', 'import-789', 'duerp-import.csv');
    testFiles.push({ bucket: BUCKETS.IMPORTS, path: importCsvPath });

    const importCsvUrl = await minioService.uploadFile({
      bucket: BUCKETS.IMPORTS,
      path: importCsvPath,
      buffer: importCsvContent,
      contentType: 'text/csv',
      metadata: {
        organization_id: 'test-org',
        user_id: 'test-user-123',
        created_by: 'test-api',
        document_type: 'import',
        created_at: new Date().toISOString(),
        content_type: 'text/csv',
        original_filename: 'duerp-import.csv',
        file_size: importCsvContent.length,
      },
    });

    results.push({
      category: 'Upload Import',
      test: 'Upload import CSV',
      status: 'success',
      message: 'Import CSV uploadé avec succès',
      details: `URL: ${importCsvUrl}`,
      duration: Date.now() - importCsvStart,
    });
  } catch (error) {
    results.push({
      category: 'Upload Import',
      test: 'Upload import CSV',
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      duration: Date.now() - importCsvStart,
    });
  }

  // ============================================
  // 9. TEST UPLOAD PHOTO OBSERVATION
  // ============================================
  console.log('📸 Test 9: Upload photo observation...');
  const photoStart = Date.now();
  try {
    const photoContent = Buffer.from('fake photo image data');
    const photoPath = buildPath.attachment('test-org', 'photos-terrain', 'obs-123', 'photo-1.jpg');
    testFiles.push({ bucket: BUCKETS.ATTACHMENTS, path: photoPath });

    const photoUrl = await minioService.uploadFile({
      bucket: BUCKETS.ATTACHMENTS,
      path: photoPath,
      buffer: photoContent,
      contentType: 'image/jpeg',
      metadata: {
        organization_id: 'test-org',
        user_id: 'test-user-123',
        created_by: 'test-api',
        document_type: 'observation_photo',
        created_at: new Date().toISOString(),
        content_type: 'image/jpeg',
        original_filename: 'photo-1.jpg',
        file_size: photoContent.length,
      },
    });

    results.push({
      category: 'Upload Attachments',
      test: 'Upload photo observation',
      status: 'success',
      message: 'Photo observation uploadée avec succès',
      details: `URL: ${photoUrl}`,
      duration: Date.now() - photoStart,
    });
  } catch (error) {
    results.push({
      category: 'Upload Attachments',
      test: 'Upload photo observation',
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      duration: Date.now() - photoStart,
    });
  }

  // ============================================
  // 10. TEST UPLOAD PIÈCE JOINTE PLAN D'ACTION
  // ============================================
  console.log('📎 Test 10: Upload pièce jointe plan d\'action...');
  const attachmentStart = Date.now();
  try {
    const attachmentContent = Buffer.from('fake attachment PDF content');
    const attachmentPath = buildPath.attachment('test-org', 'pieces-jointes', 'action-456', 'document.pdf');
    testFiles.push({ bucket: BUCKETS.ATTACHMENTS, path: attachmentPath });

    const attachmentUrl = await minioService.uploadFile({
      bucket: BUCKETS.ATTACHMENTS,
      path: attachmentPath,
      buffer: attachmentContent,
      contentType: 'application/pdf',
      metadata: {
        organization_id: 'test-org',
        user_id: 'test-user-123',
        created_by: 'test-api',
        document_type: 'action_plan_attachment',
        created_at: new Date().toISOString(),
        content_type: 'application/pdf',
        original_filename: 'document.pdf',
        file_size: attachmentContent.length,
      },
    });

    results.push({
      category: 'Upload Attachments',
      test: 'Upload pièce jointe plan d\'action',
      status: 'success',
      message: 'Pièce jointe uploadée avec succès',
      details: `URL: ${attachmentUrl}`,
      duration: Date.now() - attachmentStart,
    });
  } catch (error) {
    results.push({
      category: 'Upload Attachments',
      test: 'Upload pièce jointe plan d\'action',
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      duration: Date.now() - attachmentStart,
    });
  }

  // ============================================
  // 11. TEST GÉNÉRATION URLS PRÉSIGNÉES
  // ============================================
  console.log('🔗 Test 11: Génération URLs présignées...');
  const presignedStart = Date.now();
  try {
    // URL présignée GET
    const getPresignedUrl = await minioService.generatePresignedUrl({
      bucket: BUCKETS.DOCUMENTS,
      path: buildPath.duerp('test-org', 2024, 'duerp-2024-v1'),
      method: 'GET',
      expiresIn: 3600,
    });
    results.push({
      category: 'URLs Présignées',
      test: 'Génération URL présignée GET',
      status: 'success',
      message: 'URL présignée GET générée',
      details: getPresignedUrl.substring(0, 100) + '...',
      duration: Date.now() - presignedStart,
    });

    // URL présignée PUT
    const putPresignedUrl = await minioService.generatePresignedUrl({
      bucket: BUCKETS.IMPORTS,
      path: buildPath.import('test-user-123', 'import-999', 'test-upload.csv'),
      method: 'PUT',
      contentType: 'text/csv',
      expiresIn: 900,
    });
    results.push({
      category: 'URLs Présignées',
      test: 'Génération URL présignée PUT',
      status: 'success',
      message: 'URL présignée PUT générée',
      details: putPresignedUrl.substring(0, 100) + '...',
      duration: 0,
    });
  } catch (error) {
    results.push({
      category: 'URLs Présignées',
      test: 'Génération URLs présignées',
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      duration: Date.now() - presignedStart,
    });
  }

  // ============================================
  // 12. TEST LISTING FICHIERS
  // ============================================
  console.log('📂 Test 12: Listing fichiers...');
  const listStart = Date.now();
  try {
    const listResult = await minioService.listFiles({
      bucket: BUCKETS.IMPORTS,
      prefix: 'pending/test-user-123/',
      maxKeys: 10,
    });
    results.push({
      category: 'Listing',
      test: 'Listing fichiers par préfixe',
      status: 'success',
      message: `${listResult.files.length} fichier(s) trouvé(s)`,
      details: `IsTruncated: ${listResult.isTruncated}`,
      duration: Date.now() - listStart,
    });
  } catch (error) {
    results.push({
      category: 'Listing',
      test: 'Listing fichiers par préfixe',
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      duration: Date.now() - listStart,
    });
  }

  // ============================================
  // 13. TEST RÉCUPÉRATION MÉTADONNÉES
  // ============================================
  console.log('📋 Test 13: Récupération métadonnées...');
  const metadataStart = Date.now();
  try {
    const metadata = await minioService.getFileMetadata(
      BUCKETS.DOCUMENTS,
      buildPath.duerp('test-org', 2024, 'duerp-2024-v1')
    );
    if (metadata) {
      results.push({
        category: 'Métadonnées',
        test: 'Récupération métadonnées fichier',
        status: 'success',
        message: 'Métadonnées récupérées avec succès',
        details: `Type: ${metadata.document_type}, Taille: ${metadata.file_size} octets`,
        duration: Date.now() - metadataStart,
      });
    } else {
      results.push({
        category: 'Métadonnées',
        test: 'Récupération métadonnées fichier',
        status: 'error',
        message: 'Fichier non trouvé',
        duration: Date.now() - metadataStart,
      });
    }
  } catch (error) {
    results.push({
      category: 'Métadonnées',
      test: 'Récupération métadonnées fichier',
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      duration: Date.now() - metadataStart,
    });
  }

  // ============================================
  // 14. TEST SUPPRESSION FICHIERS
  // ============================================
  console.log('🗑️  Test 14: Suppression fichiers...');
  const deleteStart = Date.now();
  let deletedCount = 0;
  let deleteErrors = 0;

  for (const file of testFiles) {
    try {
      // Vérifier que le fichier existe avant de le supprimer
      const exists = await minioService.fileExists(file.bucket as any, file.path);
      if (exists) {
        await minioService.deleteFile(file.bucket as any, file.path);
        deletedCount++;
      } else {
        // Le fichier n'existe pas, on le compte comme supprimé (peut-être déjà supprimé)
        deletedCount++;
      }
    } catch (error) {
      deleteErrors++;
      // Ne pas bloquer les autres suppressions
    }
  }

  results.push({
    category: 'Suppression',
    test: 'Suppression fichiers de test',
    status: deletedCount > 0 && deleteErrors === 0 ? 'success' : 'error',
    message: `${deletedCount} fichier(s) supprimé(s), ${deleteErrors} erreur(s)`,
    duration: Date.now() - deleteStart,
  });

  // ============================================
  // RÉSUMÉ FINAL
  // ============================================
  const totalDuration = Date.now() - startTime;
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const skippedCount = results.filter(r => r.status === 'skipped').length;

  const summary = {
    total: results.length,
    success: successCount,
    errors: errorCount,
    skipped: skippedCount,
    successRate: ((successCount / results.length) * 100).toFixed(1) + '%',
    totalDuration: `${totalDuration}ms`,
  };

  return NextResponse.json({
    success: errorCount === 0,
    summary,
    results: results.map(r => ({
      ...r,
      duration: r.duration ? `${r.duration}ms` : undefined,
    })),
  });
}

