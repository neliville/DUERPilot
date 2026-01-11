import { BucketName } from './constants';

/**
 * Métadonnées obligatoires pour chaque fichier uploadé
 */
export interface FileMetadata {
  organization_id: string; // tenantId
  user_id: string; // userId qui a uploadé
  created_by: string; // email ou nom de l'utilisateur
  document_type: string; // 'duerp', 'import', 'avatar', 'logo', 'attachment', 'backup'
  created_at: string; // ISO 8601 date
  content_type: string; // MIME type
  retention_until?: string; // ISO 8601 date (pour documents réglementaires)
  file_size?: number; // Taille en octets
  original_filename?: string; // Nom original du fichier
}

/**
 * Options pour générer une URL présignée
 */
export interface PresignedUrlOptions {
  bucket: BucketName;
  path: string;
  expiresIn?: number; // En secondes, défaut selon type (UPLOAD ou DOWNLOAD)
  method?: 'GET' | 'PUT';
  contentType?: string; // Requis pour PUT
}

/**
 * Statistiques de stockage par organisation
 */
export interface StorageStats {
  organizationId: string;
  totalSize: number; // En octets
  fileCount: number;
  byBucket: Record<BucketName, { size: number; count: number }>;
  byDocumentType: Record<string, { size: number; count: number }>;
}

/**
 * Options d'upload de fichier
 */
export interface UploadFileOptions {
  bucket: BucketName;
  path: string;
  buffer: Buffer;
  contentType: string;
  metadata: FileMetadata;
  makePublic?: boolean; // Uniquement pour bucket avatars
}

/**
 * Options de listing de fichiers
 */
export interface ListFilesOptions {
  bucket: BucketName;
  prefix: string;
  maxKeys?: number;
  continuationToken?: string;
}

/**
 * Résultat d'un listing de fichiers
 */
export interface ListFilesResult {
  files: Array<{
    path: string;
    size: number;
    lastModified: Date;
    etag?: string;
  }>;
  continuationToken?: string;
  isTruncated: boolean;
}

/**
 * Types de documents
 */
export type DocumentType =
  | 'duerp'
  | 'import'
  | 'avatar'
  | 'logo'
  | 'attachment'
  | 'backup'
  | 'observation_photo'
  | 'action_plan_attachment';

