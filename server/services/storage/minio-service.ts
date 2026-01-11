import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BUCKETS, PRESIGNED_URL_EXPIRY, type BucketName } from './constants';
import {
  type FileMetadata,
  type PresignedUrlOptions,
  type StorageStats,
  type UploadFileOptions,
  type ListFilesOptions,
  type ListFilesResult,
} from './types';
import {
  validateBucketName,
  isMimeTypeAllowed,
  isFileSizeAllowed,
  calculateRetentionDate,
  type DocumentType,
} from './utils';

/**
 * Service centralisé de stockage MinIO/S3
 * Singleton pour éviter les multiples instances du client
 */
class MinIOService {
  private client: S3Client | null = null;
  private initialized = false;

  /**
   * Initialise le client S3 avec les credentials MinIO
   */
  private initializeClient(): void {
    if (this.initialized && this.client) {
      return;
    }

    const endpoint = process.env.MINIO_ENDPOINT;
    const accessKey = process.env.MINIO_ACCESS_KEY;
    const secretKey = process.env.MINIO_SECRET_KEY;
    const region = process.env.MINIO_REGION || 'eu-central-1';
    const useSSL = process.env.MINIO_USE_SSL === 'true';

    if (!endpoint || !accessKey || !secretKey) {
      throw new Error(
        'Configuration MinIO manquante. Vérifiez MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY'
      );
    }

    this.client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true, // Requis pour MinIO
      tls: useSSL,
    });

    this.initialized = true;
  }

  /**
   * Obtient le client S3 (lazy initialization)
   */
  private getClient(): S3Client {
    if (!this.client) {
      this.initializeClient();
    }
    return this.client!;
  }

  /**
   * Upload un fichier vers MinIO
   */
  async uploadFile(options: UploadFileOptions): Promise<string> {
    const { bucket, path, buffer, contentType, metadata, makePublic = false } = options;

    // Validations
    if (!validateBucketName(bucket)) {
      throw new Error(`Bucket invalide: ${bucket}`);
    }

    if (!isMimeTypeAllowed(bucket, contentType)) {
      throw new Error(`Type MIME non autorisé pour le bucket ${bucket}: ${contentType}`);
    }

    if (!isFileSizeAllowed(bucket, buffer.length)) {
      throw new Error(
        `Taille de fichier dépassée pour le bucket ${bucket}: ${buffer.length} octets`
      );
    }

    // Vérifier que le bucket avatars est le seul public
    if (makePublic && bucket !== BUCKETS.AVATARS) {
      throw new Error('Seul le bucket avatars peut être public');
    }

    const client = this.getClient();

    // Convertir métadonnées en headers S3
    const metadataHeaders: Record<string, string> = {};
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        metadataHeaders[`x-amz-meta-${key}`] = String(value);
      }
    });

    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: path,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadataHeaders,
        // Note: MinIO peut ne pas supporter les ACLs selon la configuration
        // Utiliser des URLs présignées ou configurer les buckets comme publics au niveau serveur
        // ACL: makePublic ? 'public-read' : undefined,
      });

      await client.send(command);

      // Construire l'URL du fichier
      const endpoint = process.env.MINIO_ENDPOINT || '';
      const baseUrl = endpoint.replace(/\/$/, '');
      const url = makePublic
        ? `${baseUrl}/${bucket}/${path}`
        : `s3://${bucket}/${path}`;

      console.log(`[MinIO] Fichier uploadé: ${bucket}/${path} (${buffer.length} octets)`);
      return url;
    } catch (error) {
      console.error(`[MinIO] Erreur upload ${bucket}/${path}:`, error);
      throw new Error(
        `Erreur lors de l'upload vers MinIO: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    }
  }

  /**
   * Génère une URL présignée pour upload ou téléchargement
   */
  async generatePresignedUrl(options: PresignedUrlOptions): Promise<string> {
    const {
      bucket,
      path,
      expiresIn,
      method = 'GET',
      contentType,
    } = options;

    if (!validateBucketName(bucket)) {
      throw new Error(`Bucket invalide: ${bucket}`);
    }

    const client = this.getClient();

    // Durée d'expiration par défaut selon la méthode
    const defaultExpiresIn =
      method === 'PUT' ? PRESIGNED_URL_EXPIRY.UPLOAD : PRESIGNED_URL_EXPIRY.DOWNLOAD;
    const expiry = expiresIn || defaultExpiresIn;

    try {
      const command =
        method === 'PUT'
          ? new PutObjectCommand({
              Bucket: bucket,
              Key: path,
              ContentType: contentType,
            })
          : new GetObjectCommand({
              Bucket: bucket,
              Key: path,
            });

      const url = await getSignedUrl(client, command, { expiresIn: expiry });

      console.log(
        `[MinIO] URL présignée générée: ${method} ${bucket}/${path} (expire dans ${expiry}s)`
      );
      return url;
    } catch (error) {
      console.error(`[MinIO] Erreur génération URL présignée ${bucket}/${path}:`, error);
      throw new Error(
        `Erreur lors de la génération de l'URL présignée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    }
  }

  /**
   * Supprime un fichier de MinIO
   */
  async deleteFile(bucket: BucketName, path: string): Promise<void> {
    if (!validateBucketName(bucket)) {
      throw new Error(`Bucket invalide: ${bucket}`);
    }

    const client = this.getClient();

    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: path,
      });

      await client.send(command);
      console.log(`[MinIO] Fichier supprimé: ${bucket}/${path}`);
    } catch (error) {
      console.error(`[MinIO] Erreur suppression ${bucket}/${path}:`, error);
      throw new Error(
        `Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    }
  }

  /**
   * Liste les fichiers d'un bucket avec un préfixe
   */
  async listFiles(options: ListFilesOptions): Promise<ListFilesResult> {
    const { bucket, prefix, maxKeys = 1000, continuationToken } = options;

    if (!validateBucketName(bucket)) {
      throw new Error(`Bucket invalide: ${bucket}`);
    }

    const client = this.getClient();

    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
        ContinuationToken: continuationToken,
      });

      const response = await client.send(command);

      return {
        files:
          response.Contents?.map((obj) => ({
            path: obj.Key || '',
            size: obj.Size || 0,
            lastModified: obj.LastModified || new Date(),
            etag: obj.ETag,
          })) || [],
        continuationToken: response.NextContinuationToken,
        isTruncated: response.IsTruncated || false,
      };
    } catch (error) {
      console.error(`[MinIO] Erreur listing ${bucket}/${prefix}:`, error);
      throw new Error(
        `Erreur lors du listing: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    }
  }

  /**
   * Calcule l'usage de stockage par organisation
   */
  async getStorageUsage(organizationId: string): Promise<StorageStats> {
    const prefix = `organizations/${organizationId}/`;
    const stats: StorageStats = {
      organizationId,
      totalSize: 0,
      fileCount: 0,
      byBucket: {} as Record<BucketName, { size: number; count: number }>,
      byDocumentType: {},
    };

    // Initialiser les buckets
    Object.values(BUCKETS).forEach((bucket) => {
      stats.byBucket[bucket] = { size: 0, count: 0 };
    });

    // Parcourir tous les buckets (sauf avatars et backups qui ne sont pas par organisation)
    const bucketsToCheck: BucketName[] = [
      BUCKETS.DOCUMENTS,
      BUCKETS.ATTACHMENTS,
      BUCKETS.LOGOS,
    ];

    for (const bucket of bucketsToCheck) {
      try {
        let continuationToken: string | undefined;
        do {
          const result = await this.listFiles({
            bucket,
            prefix,
            maxKeys: 1000,
            continuationToken,
          });

          for (const file of result.files) {
            stats.totalSize += file.size;
            stats.fileCount++;
            stats.byBucket[bucket].size += file.size;
            stats.byBucket[bucket].count++;

            // Essayer d'extraire le type de document depuis le chemin
            const pathParts = file.path.split('/');
            if (pathParts.length >= 3) {
              const docType = pathParts[2]; // organizations/{orgId}/{type}/...
              if (!stats.byDocumentType[docType]) {
                stats.byDocumentType[docType] = { size: 0, count: 0 };
              }
              stats.byDocumentType[docType].size += file.size;
              stats.byDocumentType[docType].count++;
            }
          }

          continuationToken = result.continuationToken;
        } while (continuationToken);
      } catch (error) {
        console.error(`[MinIO] Erreur calcul usage ${bucket}:`, error);
        // Continuer avec les autres buckets
      }
    }

    return stats;
  }

  /**
   * Nettoie les imports temporaires plus anciens que X jours
   */
  async cleanupTemporaryImports(olderThanDays: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let deletedCount = 0;
    let continuationToken: string | undefined;

    try {
      do {
        const result = await this.listFiles({
          bucket: BUCKETS.IMPORTS,
          prefix: 'pending/',
          maxKeys: 1000,
          continuationToken,
        });

        for (const file of result.files) {
          // Supprimer si plus ancien que la date limite
          if (file.lastModified < cutoffDate) {
            try {
              await this.deleteFile(BUCKETS.IMPORTS, file.path);
              deletedCount++;
            } catch (error) {
              console.error(`[MinIO] Erreur suppression ${file.path}:`, error);
            }
          }
        }

        continuationToken = result.continuationToken;
      } while (continuationToken);

      console.log(`[MinIO] Nettoyage terminé: ${deletedCount} fichiers supprimés`);
      return deletedCount;
    } catch (error) {
      console.error('[MinIO] Erreur nettoyage imports:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un fichier existe
   */
  async fileExists(bucket: BucketName, path: string): Promise<boolean> {
    if (!validateBucketName(bucket)) {
      return false;
    }

    const client = this.getClient();

    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: path,
      });

      await client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Obtient les métadonnées d'un fichier
   */
  async getFileMetadata(bucket: BucketName, path: string): Promise<FileMetadata | null> {
    if (!validateBucketName(bucket)) {
      return null;
    }

    const client = this.getClient();

    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: path,
      });

      const response = await client.send(command);
      const metadata: Record<string, string> = {};

      // Extraire les métadonnées custom
      if (response.Metadata) {
        Object.entries(response.Metadata).forEach(([key, value]) => {
          const cleanKey = key.replace(/^x-amz-meta-/, '');
          metadata[cleanKey] = value;
        });
      }

      return metadata as unknown as FileMetadata;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return null;
      }
      throw error;
    }
  }
}

// Export singleton
export const minioService = new MinIOService();

