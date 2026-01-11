import { BUCKETS, ALLOWED_MIME_TYPES, MAX_FILE_SIZES, type BucketName } from './constants';
import { DocumentType } from './types';

/**
 * Valide qu'un nom de bucket est valide
 */
export function validateBucketName(bucket: string): bucket is BucketName {
  return Object.values(BUCKETS).includes(bucket as BucketName);
}

/**
 * Calcule la date de rétention selon le type de document
 */
export function calculateRetentionDate(documentType: DocumentType): Date {
  const now = new Date();
  const retentionDays = {
    duerp: 40 * 365, // 40 ans
    import: 7, // 7 jours
    attachment: 10 * 365, // 10 ans
    observation_photo: 10 * 365, // 10 ans
    action_plan_attachment: 10 * 365, // 10 ans
    avatar: 0, // Pas de suppression auto
    logo: 0, // Pas de suppression auto
    backup: 90, // 90 jours
  };

  const days = retentionDays[documentType] || 0;
  if (days === 0) {
    return new Date('2099-12-31'); // Date très lointaine = pas de suppression
  }

  const retentionDate = new Date(now);
  retentionDate.setDate(retentionDate.getDate() + days);
  return retentionDate;
}

/**
 * Nettoie et sécurise un nom de fichier
 */
export function sanitizeFileName(fileName: string): string {
  // Supprimer les caractères dangereux
  let sanitized = fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Remplacer caractères spéciaux
    .replace(/\.\./g, '_') // Empêcher path traversal
    .replace(/^\.+/, '') // Supprimer points en début
    .replace(/\.+$/, ''); // Supprimer points en fin

  // Limiter la longueur
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    sanitized = sanitized.substring(0, 255 - ext.length) + ext;
  }

  return sanitized || 'file';
}

/**
 * Obtient le type MIME depuis l'extension de fichier
 */
export function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    gif: 'image/gif',
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    // Archives
    zip: 'application/zip',
    tar: 'application/x-tar',
    gz: 'application/gzip',
  };

  const ext = extension.toLowerCase().replace(/^\./, '');
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Vérifie si un type MIME est autorisé pour un bucket
 */
export function isMimeTypeAllowed(bucket: BucketName, mimeType: string): boolean {
  const allowed = ALLOWED_MIME_TYPES[bucket];
  return allowed.includes(mimeType as any);
}

/**
 * Vérifie si la taille du fichier est dans les limites du bucket
 */
export function isFileSizeAllowed(bucket: BucketName, size: number): boolean {
  const maxSize = MAX_FILE_SIZES[bucket];
  return size <= maxSize;
}

/**
 * Génère un chemin de fichier selon la structure définie
 */
export interface PathBuilder {
  duerp: (orgId: string, year: number, version: string) => string;
  import: (userId: string, uploadId: string, fileName: string) => string;
  avatar: (userId: string) => string;
  companyLogo: (orgId: string, companyId: string) => string;
  attachment: (
    orgId: string,
    type: string,
    entityId: string,
    fileName: string
  ) => string;
}

export const buildPath: PathBuilder = {
  duerp: (orgId: string, year: number, version: string) =>
    `organizations/${orgId}/duerp/${year}/duerp-${version}.pdf`,

  import: (userId: string, uploadId: string, fileName: string) => {
    const sanitized = sanitizeFileName(fileName);
    return `pending/${userId}/${uploadId}/${sanitized}`;
  },

  avatar: (userId: string) => `users/${userId}/avatar-256x256.webp`,

  companyLogo: (orgId: string, companyId: string) =>
    `organizations/${orgId}/companies/${companyId}/logo.webp`,

  attachment: (orgId: string, type: string, entityId: string, fileName: string) => {
    const sanitized = sanitizeFileName(fileName);
    return `organizations/${orgId}/${type}/${entityId}/${sanitized}`;
  },
};

/**
 * Extrait les informations d'un chemin MinIO
 */
export function parsePath(path: string): {
  organizationId?: string;
  userId?: string;
  type?: string;
  entityId?: string;
} {
  const parts = path.split('/');
  const result: {
    organizationId?: string;
    userId?: string;
    type?: string;
    entityId?: string;
  } = {};

  if (parts[0] === 'organizations' && parts[1]) {
    result.organizationId = parts[1];
    if (parts[2] && parts[3]) {
      result.type = parts[2];
      result.entityId = parts[3];
    }
  } else if (parts[0] === 'users' && parts[1]) {
    result.userId = parts[1];
  } else if (parts[0] === 'pending' && parts[1]) {
    result.userId = parts[1];
  }

  return result;
}

