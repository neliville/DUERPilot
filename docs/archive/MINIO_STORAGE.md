# Documentation - Service de Stockage MinIO

## Vue d'ensemble

Le service de stockage MinIO est un wrapper centralisé autour du SDK AWS S3 compatible MinIO. Il gère tous les uploads, téléchargements et suppressions de fichiers pour l'application DUERPilot.

## Architecture

```
Frontend → Backend tRPC → MinIO Service → MinIO Server
```

- **Frontend** : Demande URLs présignées, upload direct vers MinIO
- **Backend** : Génère URLs présignées, valide permissions, sauvegarde métadonnées
- **MinIO Service** : Wrapper S3, gestion des buckets, métadonnées
- **MinIO Server** : Stockage objet (Hetzner Object Storage)

## Buckets

| Bucket | Usage | Accès | Rétention |
|--------|-------|-------|-----------|
| `duerpilot-documents` | PDFs DUERP générés | Privé (URLs présignées) | 40 ans |
| `duerpilot-imports` | Fichiers import temporaires | Privé | 7 jours |
| `duerpilot-avatars` | Avatars utilisateurs | **Public** | Permanent |
| `duerpilot-company-logos` | Logos entreprises | Privé | Permanent |
| `duerpilot-attachments` | Pièces jointes (photos, FDS) | Privé | 10 ans |
| `duerpilot-backups` | Sauvegardes système | Privé | 90 jours |

## Structure des chemins

### Documents DUERP
```
organizations/{tenantId}/duerp/{year}/duerp-{date}-v{version}.pdf
```
Exemple : `organizations/org-123/duerp/2024/duerp-2024-01-15-v1.pdf`

### Imports temporaires
```
pending/{userId}/{uploadId}/{fileName}
```
Exemple : `pending/user-456/upload-789/file.xlsx`

### Avatars
```
users/{userId}/avatar-256x256.webp
```
Exemple : `users/user-123/avatar-256x256.webp`

### Logos entreprises
```
organizations/{tenantId}/companies/{companyId}/logo.webp
```
Exemple : `organizations/org-123/companies/comp-456/logo.webp`

### Pièces jointes
```
organizations/{tenantId}/{type}/{entityId}/{fileName}
```
Types :
- `photos-terrain` : Photos d'observations
- `action-plans` : Pièces jointes plans d'action
- `attachments` : Autres pièces jointes

Exemple : `organizations/org-123/photos-terrain/obs-789/photo-1.webp`

## Métadonnées obligatoires

Chaque fichier uploadé doit contenir ces métadonnées :

```typescript
{
  organization_id: string;    // tenantId
  user_id: string;            // userId qui a uploadé
  created_by: string;          // email ou nom utilisateur
  document_type: string;       // 'duerp', 'import', 'avatar', etc.
  created_at: string;          // ISO 8601 date
  content_type: string;        // MIME type
  retention_until?: string;    // ISO 8601 date (pour documents réglementaires)
  file_size?: number;           // Taille en octets
  original_filename?: string;   // Nom original
}
```

## Variables d'environnement

```bash
MINIO_ENDPOINT=https://<endpoint-minio>
MINIO_ACCESS_KEY=duerpilot-backend
MINIO_SECRET_KEY=**************
MINIO_REGION=eu-central-1
MINIO_USE_SSL=true
```

⚠️ **Important** : Ne jamais utiliser le compte admin MinIO dans l'application. Utiliser uniquement le compte `duerpilot-backend` avec la policy IAM appropriée.

## Utilisation

### Upload fichier (backend direct)

```typescript
import { minioService } from '@/server/services/storage/minio-service';
import { BUCKETS } from '@/server/services/storage/constants';
import { buildPath, calculateRetentionDate } from '@/server/services/storage/utils';

const path = buildPath.duerp(tenantId, 2024, '2024-01-15-v1');
const metadata = {
  organization_id: tenantId,
  user_id: userId,
  created_by: userEmail,
  document_type: 'duerp',
  created_at: new Date().toISOString(),
  content_type: 'application/pdf',
  retention_until: calculateRetentionDate('duerp').toISOString(),
};

const fileUrl = await minioService.uploadFile({
  bucket: BUCKETS.DOCUMENTS,
  path,
  buffer: pdfBuffer,
  contentType: 'application/pdf',
  metadata,
});
```

### Générer URL présignée (upload frontend)

```typescript
// Backend
const uploadUrl = await minioService.generatePresignedUrl({
  bucket: BUCKETS.AVATARS,
  path: buildPath.avatar(userId),
  method: 'PUT',
  contentType: 'image/webp',
});

// Frontend
const response = await fetch(uploadUrl, {
  method: 'PUT',
  body: fileBuffer,
  headers: { 'Content-Type': 'image/webp' },
});
```

### Générer URL présignée (téléchargement)

```typescript
const downloadUrl = await minioService.generatePresignedUrl({
  bucket: BUCKETS.DOCUMENTS,
  path: 'organizations/org-123/duerp/2024/duerp-2024-01-15-v1.pdf',
  method: 'GET',
});
```

### Supprimer fichier

```typescript
await minioService.deleteFile(BUCKETS.IMPORTS, 'pending/user-123/upload-456/file.xlsx');
```

### Calculer usage stockage

```typescript
const stats = await minioService.getStorageUsage(organizationId);
console.log(`Usage total: ${stats.totalSizeGB} Go`);
console.log(`Nombre de fichiers: ${stats.fileCount}`);
```

## Cas d'usage

### 1. Upload avatar utilisateur

1. Frontend demande URL présignée PUT via `api.uploads.generateUploadUrl`
2. Backend génère URL présignée (15 min) pour `duerpilot-avatars`
3. Frontend upload direct vers MinIO
4. Frontend appelle `api.avatars.uploadAvatar` pour confirmer
5. Backend resize + convertit en WebP avec Sharp
6. Backend sauvegarde URL publique dans `UserProfile.avatarUrl`

### 2. Génération DUERP PDF

1. Backend génère PDF (Puppeteer - à implémenter)
2. Backend upload vers `duerpilot-documents` avec structure :
   ```
   organizations/{tenantId}/duerp/{year}/duerp-{date}-v{num}.pdf
   ```
3. Métadonnées : `retention_until` = now + 40 ans
4. URL sauvegardée dans `DuerpVersion.pdfUrl`
5. Téléchargement via URL présignée GET (1h)

### 3. Import Excel temporaire

1. Frontend upload vers `duerpilot-imports/pending/{userId}/{uploadId}/file.xlsx`
2. Backend traite l'import
3. Si validé : fichier gardé 7 jours puis cleanup auto
4. Si échoué/annulé : suppression immédiate

### 4. Photo terrain (observation)

1. Upload vers `duerpilot-attachments/organizations/{tenantId}/photos-terrain/{observationId}/photo-{n}.webp`
2. URLs sauvegardées dans `Observation.photoUrls[]`
3. Accès via URLs présignées GET

## Sécurité

### Validations

- ✅ Vérifier `tenantId` correspond à l'utilisateur
- ✅ Vérifier quotas stockage selon plan (`PLAN_FEATURES.storageGB`)
- ✅ Vérifier types MIME autorisés par bucket
- ✅ Sanitiser noms de fichiers (pas de `../`)

### URLs présignées

- **PUT** : 15 minutes (upload)
- **GET** : 1 heure (téléchargement)
- ❌ Pas de credentials exposés au frontend

### Buckets publics

- ✅ Seul `duerpilot-avatars` est public
- ❌ Tous les autres buckets sont privés (URLs présignées uniquement)

## Nettoyage automatique

Le job de nettoyage (`cleanup-job.ts`) s'exécute quotidiennement :

- **Imports temporaires** : Suppression après 7 jours
- **Avatars orphelins** : Suppression des avatars des utilisateurs supprimés

Exemple d'intégration avec node-cron :

```typescript
import cron from 'node-cron';
import { runCleanupJobs } from '@/server/services/storage/cleanup-job';
import { prisma } from '@/lib/db';

// Exécuter tous les jours à 2h du matin
cron.schedule('0 2 * * *', async () => {
  const userIds = await prisma.userProfile.findMany({ select: { id: true } });
  const userIdsList = userIds.map(u => u.id);
  await runCleanupJobs(userIdsList);
});
```

## Gestion des erreurs

Le service wrapper toutes les erreurs MinIO :

| Erreur MinIO | Action |
|--------------|--------|
| `NoSuchBucket` | Erreur config serveur (bucket manquant) |
| `AccessDenied` | Erreur permissions (vérifier policy IAM) |
| `RequestTimeout` | Retry avec backoff exponentiel |
| `EntityTooLarge` | Quota dépassé (vérifier `PLAN_FEATURES.storageGB`) |

## Logs

Tous les opérations sont loggées avec :
- `userId`
- `tenantId`
- `bucket`
- `path`
- `fileSize` (si upload)

Format : `[MinIO] <action> <bucket>/<path> (<size> octets)`

## Maintenance

### Vérifier l'usage par organisation

```typescript
const stats = await minioService.getStorageUsage(organizationId);
```

### Lister les fichiers d'un préfixe

```typescript
const result = await minioService.listFiles({
  bucket: BUCKETS.DOCUMENTS,
  prefix: 'organizations/org-123/',
  maxKeys: 1000,
});
```

### Vérifier qu'un fichier existe

```typescript
const exists = await minioService.fileExists(BUCKETS.DOCUMENTS, path);
```

### Obtenir les métadonnées d'un fichier

```typescript
const metadata = await minioService.getFileMetadata(BUCKETS.DOCUMENTS, path);
```

## Troubleshooting

### Erreur "Configuration MinIO manquante"

Vérifier que toutes les variables d'environnement sont définies :
- `MINIO_ENDPOINT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`

### Erreur "AccessDenied"

1. Vérifier que le compte `duerpilot-backend` a les permissions IAM correctes
2. Vérifier que les buckets existent
3. Vérifier que la policy IAM est attachée

### Erreur "Type MIME non autorisé"

Vérifier que le type MIME est dans `ALLOWED_MIME_TYPES` pour le bucket utilisé.

### Erreur "Taille de fichier dépassée"

Vérifier les limites dans `MAX_FILE_SIZES` et le quota du plan utilisateur (`PLAN_FEATURES.storageGB`).

## Bonnes pratiques

1. ✅ **Jamais d'accès direct MinIO depuis routes** : toujours passer par `minio-service.ts`
2. ✅ **Pas de credentials en dur** : toujours via variables d'env
3. ✅ **Bucket avatars seul public** : tous les autres via URLs présignées
4. ✅ **Métadonnées systématiques** : obligatoires sur chaque upload
5. ✅ **Cleanup automatique** : imports temporaires après 7 jours
6. ✅ **Multi-tenant ready** : `organization_id` = `tenantId` partout

## API tRPC

### Router `uploads`

- `generateUploadUrl` : Génère URL présignée PUT
- `confirmUpload` : Confirme upload et sauvegarde métadonnées
- `generateDownloadUrl` : Génère URL présignée GET
- `deleteFile` : Supprime fichier
- `getStorageStats` : Statistiques stockage par organisation

### Router `avatars`

- `uploadAvatar` : Upload avatar (resize + WebP)
- `getAvatarUrl` : URL publique avatar
- `deleteAvatar` : Supprime avatar

### Router `duerpVersions`

- `uploadPDF` : Upload PDF DUERP vers MinIO
- `getPDFDownloadUrl` : URL présignée téléchargement PDF

## Migration

Les fichiers existants avec `pdfUrl` ou `fileUrl` null ne nécessitent pas de migration. Seuls les nouveaux uploads utiliseront MinIO.

Pour migrer des fichiers existants :
1. Récupérer le fichier depuis l'ancien stockage
2. Uploader vers MinIO avec la structure de chemins correcte
3. Mettre à jour l'URL dans la base de données

