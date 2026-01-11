/**
 * Constantes centralisées pour le service de stockage MinIO
 * Aucun hard-coding de bucket names ailleurs dans l'application
 */

export const BUCKETS = {
  DOCUMENTS: 'duerpilot-documents',
  IMPORTS: 'duerpilot-imports',
  AVATARS: 'duerpilot-avatars',
  LOGOS: 'duerpilot-company-logos',
  ATTACHMENTS: 'duerpilot-attachments',
  BACKUPS: 'duerpilot-backups',
} as const;

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS];

/**
 * Périodes de rétention en jours
 */
export const RETENTION_PERIODS = {
  DUERP: 40 * 365, // 40 ans en jours (réglementaire)
  IMPORTS: 7, // 7 jours pour imports temporaires
  ATTACHMENTS: 10 * 365, // 10 ans pour pièces jointes
  AVATARS: 0, // Pas de suppression automatique (géré manuellement)
  LOGOS: 0, // Pas de suppression automatique
} as const;

/**
 * Durées d'expiration des URLs présignées en secondes
 */
export const PRESIGNED_URL_EXPIRY = {
  UPLOAD: 15 * 60, // 15 minutes pour upload
  DOWNLOAD: 60 * 60, // 1 heure pour téléchargement
} as const;

/**
 * Types MIME autorisés par bucket
 */
export const ALLOWED_MIME_TYPES = {
  [BUCKETS.DOCUMENTS]: ['application/pdf'],
  [BUCKETS.IMPORTS]: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ],
  [BUCKETS.AVATARS]: ['image/jpeg', 'image/png', 'image/webp'],
  [BUCKETS.LOGOS]: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  [BUCKETS.ATTACHMENTS]: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  [BUCKETS.BACKUPS]: ['application/zip', 'application/x-tar', 'application/gzip'],
} as const;

/**
 * Tailles maximales par bucket (en octets)
 */
export const MAX_FILE_SIZES = {
  [BUCKETS.DOCUMENTS]: 50 * 1024 * 1024, // 50 Mo
  [BUCKETS.IMPORTS]: 200 * 1024 * 1024, // 200 Mo
  [BUCKETS.AVATARS]: 5 * 1024 * 1024, // 5 Mo
  [BUCKETS.LOGOS]: 2 * 1024 * 1024, // 2 Mo
  [BUCKETS.ATTACHMENTS]: 10 * 1024 * 1024, // 10 Mo
  [BUCKETS.BACKUPS]: 1024 * 1024 * 1024, // 1 Go
} as const;

