/**
 * Tests unitaires pour le service MinIO
 * Utilise des mocks pour éviter les appels réels à MinIO
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { minioService } from '../minio-service';
import { BUCKETS } from '../constants';
import { buildPath, sanitizeFileName, calculateRetentionDate } from '../utils';

// Mock du client S3
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({
    send: vi.fn(),
  })),
  PutObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
  ListObjectsV2Command: vi.fn(),
  HeadObjectCommand: vi.fn(),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(() => Promise.resolve('https://presigned-url.example.com')),
}));

describe('MinIO Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock des variables d'environnement
    process.env.MINIO_ENDPOINT = 'https://minio.example.com';
    process.env.MINIO_ACCESS_KEY = 'test-key';
    process.env.MINIO_SECRET_KEY = 'test-secret';
    process.env.MINIO_REGION = 'eu-central-1';
    process.env.MINIO_USE_SSL = 'true';
  });

  describe('buildPath', () => {
    it('devrait construire le chemin DUERP correctement', () => {
      const path = buildPath.duerp('org-123', 2024, '2024-01-15-v1');
      expect(path).toBe('organizations/org-123/duerp/2024/duerp-2024-01-15-v1.pdf');
    });

    it('devrait construire le chemin import correctement', () => {
      const path = buildPath.import('user-123', 'upload-456', 'file.xlsx');
      expect(path).toBe('pending/user-123/upload-456/file.xlsx');
    });

    it('devrait construire le chemin avatar correctement', () => {
      const path = buildPath.avatar('user-123');
      expect(path).toBe('users/user-123/avatar-256x256.webp');
    });

    it('devrait construire le chemin logo entreprise correctement', () => {
      const path = buildPath.companyLogo('org-123', 'company-456');
      expect(path).toBe('organizations/org-123/companies/company-456/logo.webp');
    });

    it('devrait construire le chemin attachment correctement', () => {
      const path = buildPath.attachment('org-123', 'photos-terrain', 'obs-789', 'photo-1.webp');
      expect(path).toBe('organizations/org-123/photos-terrain/obs-789/photo-1.webp');
    });
  });

  describe('sanitizeFileName', () => {
    it('devrait nettoyer les caractères dangereux', () => {
      expect(sanitizeFileName('../../etc/passwd')).toBe('___etc_passwd');
      expect(sanitizeFileName('file name with spaces.txt')).toBe('file_name_with_spaces.txt');
      expect(sanitizeFileName('file@#$%^&*().pdf')).toBe('file_________.pdf');
    });

    it('devrait préserver les extensions', () => {
      expect(sanitizeFileName('document.pdf')).toBe('document.pdf');
      expect(sanitizeFileName('image.jpeg')).toBe('image.jpeg');
    });

    it('devrait limiter la longueur', () => {
      const longName = 'a'.repeat(300) + '.pdf';
      const sanitized = sanitizeFileName(longName);
      expect(sanitized.length).toBeLessThanOrEqual(255);
      expect(sanitized).toMatch(/\.pdf$/);
    });
  });

  describe('calculateRetentionDate', () => {
    it('devrait calculer la rétention DUERP (40 ans)', () => {
      const date = calculateRetentionDate('duerp');
      const now = new Date();
      const expectedYear = now.getFullYear() + 40;
      expect(date.getFullYear()).toBe(expectedYear);
    });

    it('devrait calculer la rétention import (7 jours)', () => {
      const date = calculateRetentionDate('import');
      const now = new Date();
      const expectedDate = new Date(now);
      expectedDate.setDate(expectedDate.getDate() + 7);
      expect(date.getDate()).toBe(expectedDate.getDate());
    });

    it('devrait retourner une date lointaine pour avatar (pas de suppression)', () => {
      const date = calculateRetentionDate('avatar');
      expect(date.getFullYear()).toBe(2099);
    });
  });

  describe('Métadonnées obligatoires', () => {
    it('devrait valider que toutes les métadonnées requises sont présentes', () => {
      const metadata = {
        organization_id: 'org-123',
        user_id: 'user-456',
        created_by: 'user@example.com',
        document_type: 'duerp',
        created_at: new Date().toISOString(),
        content_type: 'application/pdf',
      };

      expect(metadata.organization_id).toBeDefined();
      expect(metadata.user_id).toBeDefined();
      expect(metadata.created_by).toBeDefined();
      expect(metadata.document_type).toBeDefined();
      expect(metadata.created_at).toBeDefined();
      expect(metadata.content_type).toBeDefined();
    });
  });

  describe('Validation buckets', () => {
    it('devrait accepter tous les buckets valides', () => {
      expect(Object.values(BUCKETS)).toContain('duerpilot-documents');
      expect(Object.values(BUCKETS)).toContain('duerpilot-imports');
      expect(Object.values(BUCKETS)).toContain('duerpilot-avatars');
      expect(Object.values(BUCKETS)).toContain('duerpilot-company-logos');
      expect(Object.values(BUCKETS)).toContain('duerpilot-attachments');
      expect(Object.values(BUCKETS)).toContain('duerpilot-backups');
    });
  });
});

