/**
 * Tests exhaustifs pour le router ParticipationTravailleurs
 * 
 * Cœur métier : Conformité réglementaire - Consultation et participation des travailleurs
 * Article L.4121-1 et suivants du Code du travail
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schémas de validation
const createParticipationSchema = z.object({
  companyId: z.string().cuid(),
  type: z.enum(['consultation', 'information', 'association']),
  date: z.date(),
  organizerEmail: z.string().email(),
  isRealized: z.boolean().default(false),
  participantsCount: z.number().int().min(0).optional(),
  participants: z.array(z.string()).default([]),
  subject: z.string().optional(),
  summary: z.string().optional(),
  observations: z.string().optional(),
  decisions: z.string().optional(),
  nextSteps: z.string().optional(),
  attachmentUrls: z.array(z.string()).default([]),
});

const updateParticipationSchema = z.object({
  id: z.string().cuid(),
  type: z.enum(['consultation', 'information', 'association']).optional(),
  date: z.date().optional(),
  organizerEmail: z.string().email().optional(),
  isRealized: z.boolean().optional(),
  participantsCount: z.number().int().min(0).optional().nullable(),
  participants: z.array(z.string()).optional(),
  subject: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  decisions: z.string().optional().nullable(),
  nextSteps: z.string().optional().nullable(),
  attachmentUrls: z.array(z.string()).optional(),
});

describe('ParticipationTravailleurs - Validation des schémas Zod (conformité réglementaire)', () => {
  describe('createParticipationSchema', () => {
    it('devrait valider une participation valide minimale', () => {
      const valid = createParticipationSchema.parse({
        companyId: 'cm12345678901234567890',
        type: 'consultation',
        date: new Date('2024-01-15'),
        organizerEmail: 'organisateur@example.com',
      });
      expect(valid.type).toBe('consultation');
      expect(valid.isRealized).toBe(false);
      expect(valid.participants).toEqual([]);
      expect(valid.attachmentUrls).toEqual([]);
    });

    it('devrait valider une participation complète', () => {
      const valid = createParticipationSchema.parse({
        companyId: 'cm12345678901234567890',
        type: 'consultation',
        date: new Date('2024-01-15'),
        organizerEmail: 'organisateur@example.com',
        isRealized: true,
        participantsCount: 25,
        participants: ['participant1@example.com', 'participant2@example.com'],
        subject: 'Révision DUERP annuelle',
        summary: 'Résumé des échanges',
        observations: 'Observations des travailleurs',
        decisions: 'Décisions prises',
        nextSteps: 'Prochaines étapes',
        attachmentUrls: ['https://example.com/doc1.pdf'],
      });
      expect(valid.isRealized).toBe(true);
      expect(valid.participantsCount).toBe(25);
      expect(valid.subject).toBe('Révision DUERP annuelle');
    });

    it('devrait accepter tous les types de participation', () => {
      ['consultation', 'information', 'association'].forEach((type) => {
        const valid = createParticipationSchema.parse({
          companyId: 'cm12345678901234567890',
          type: type as 'consultation' | 'information' | 'association',
          date: new Date('2024-01-15'),
          organizerEmail: 'organisateur@example.com',
        });
        expect(valid.type).toBe(type);
      });
    });

    it('devrait rejeter un type invalide', () => {
      expect(() => {
        createParticipationSchema.parse({
          companyId: 'cm12345678901234567890',
          type: 'type_invalide',
          date: new Date('2024-01-15'),
          organizerEmail: 'organisateur@example.com',
        });
      }).toThrow();
    });

    it('devrait rejeter un companyId invalide', () => {
      expect(() => {
        createParticipationSchema.parse({
          companyId: 'invalid-id',
          type: 'consultation',
          date: new Date('2024-01-15'),
          organizerEmail: 'organisateur@example.com',
        });
      }).toThrow();
    });

    it('devrait rejeter un email organisateur invalide', () => {
      expect(() => {
        createParticipationSchema.parse({
          companyId: 'cm12345678901234567890',
          type: 'consultation',
          date: new Date('2024-01-15'),
          organizerEmail: 'email-invalide',
        });
      }).toThrow();
    });

    it('devrait rejeter une date invalide', () => {
      expect(() => {
        createParticipationSchema.parse({
          companyId: 'cm12345678901234567890',
          type: 'consultation',
          date: '2024-01-15',
          organizerEmail: 'organisateur@example.com',
        });
      }).toThrow();
    });

    it('devrait avoir isRealized par défaut à false', () => {
      const valid = createParticipationSchema.parse({
        companyId: 'cm12345678901234567890',
        type: 'consultation',
        date: new Date('2024-01-15'),
        organizerEmail: 'organisateur@example.com',
      });
      expect(valid.isRealized).toBe(false);
    });

    it('devrait accepter isRealized = true', () => {
      const valid = createParticipationSchema.parse({
        companyId: 'cm12345678901234567890',
        type: 'consultation',
        date: new Date('2024-01-15'),
        organizerEmail: 'organisateur@example.com',
        isRealized: true,
      });
      expect(valid.isRealized).toBe(true);
    });

    it('devrait rejeter un participantsCount < 0', () => {
      expect(() => {
        createParticipationSchema.parse({
          companyId: 'cm12345678901234567890',
          type: 'consultation',
          date: new Date('2024-01-15'),
          organizerEmail: 'organisateur@example.com',
          participantsCount: -1,
        });
      }).toThrow();
    });

    it('devrait accepter participantsCount = 0', () => {
      const valid = createParticipationSchema.parse({
        companyId: 'cm12345678901234567890',
        type: 'consultation',
        date: new Date('2024-01-15'),
        organizerEmail: 'organisateur@example.com',
        participantsCount: 0,
      });
      expect(valid.participantsCount).toBe(0);
    });

    it('devrait accepter participantsCount non défini', () => {
      const valid = createParticipationSchema.parse({
        companyId: 'cm12345678901234567890',
        type: 'consultation',
        date: new Date('2024-01-15'),
        organizerEmail: 'organisateur@example.com',
      });
      expect(valid.participantsCount).toBeUndefined();
    });

    it('devrait avoir participants par défaut à []', () => {
      const valid = createParticipationSchema.parse({
        companyId: 'cm12345678901234567890',
        type: 'consultation',
        date: new Date('2024-01-15'),
        organizerEmail: 'organisateur@example.com',
      });
      expect(valid.participants).toEqual([]);
    });

    it('devrait accepter une liste de participants', () => {
      const valid = createParticipationSchema.parse({
        companyId: 'cm12345678901234567890',
        type: 'consultation',
        date: new Date('2024-01-15'),
        organizerEmail: 'organisateur@example.com',
        participants: ['participant1@example.com', 'participant2@example.com'],
      });
      expect(valid.participants).toHaveLength(2);
    });

    it('devrait avoir attachmentUrls par défaut à []', () => {
      const valid = createParticipationSchema.parse({
        companyId: 'cm12345678901234567890',
        type: 'consultation',
        date: new Date('2024-01-15'),
        organizerEmail: 'organisateur@example.com',
      });
      expect(valid.attachmentUrls).toEqual([]);
    });

    it('devrait accepter une liste de pièces jointes', () => {
      const valid = createParticipationSchema.parse({
        companyId: 'cm12345678901234567890',
        type: 'consultation',
        date: new Date('2024-01-15'),
        organizerEmail: 'organisateur@example.com',
        attachmentUrls: ['https://example.com/doc1.pdf', 'https://example.com/doc2.pdf'],
      });
      expect(valid.attachmentUrls).toHaveLength(2);
    });

    it('devrait rejeter un participantsCount non entier', () => {
      expect(() => {
        createParticipationSchema.parse({
          companyId: 'cm12345678901234567890',
          type: 'consultation',
          date: new Date('2024-01-15'),
          organizerEmail: 'organisateur@example.com',
          participantsCount: 25.5,
        });
      }).toThrow();
    });
  });

  describe('updateParticipationSchema', () => {
    it('devrait valider une mise à jour minimale (id seul)', () => {
      const valid = updateParticipationSchema.parse({
        id: 'cm12345678901234567890',
      });
      expect(valid.id).toBe('cm12345678901234567890');
    });

    it('devrait valider une mise à jour complète', () => {
      const valid = updateParticipationSchema.parse({
        id: 'cm12345678901234567890',
        type: 'information',
        date: new Date('2024-02-15'),
        organizerEmail: 'nouvel-organisateur@example.com',
        isRealized: true,
        participantsCount: 30,
        subject: 'Nouveau sujet',
        summary: 'Nouveau résumé',
        observations: 'Nouvelles observations',
        decisions: 'Nouvelles décisions',
        nextSteps: 'Nouvelles étapes',
      });
      expect(valid.type).toBe('information');
      expect(valid.isRealized).toBe(true);
    });

    it('devrait accepter participantsCount = null', () => {
      const valid = updateParticipationSchema.parse({
        id: 'cm12345678901234567890',
        participantsCount: null,
      });
      expect(valid.participantsCount).toBeNull();
    });

    it('devrait accepter subject = null', () => {
      const valid = updateParticipationSchema.parse({
        id: 'cm12345678901234567890',
        subject: null,
      });
      expect(valid.subject).toBeNull();
    });

    it('devrait rejeter un id invalide', () => {
      expect(() => {
        updateParticipationSchema.parse({
          id: 'invalid-id',
        });
      }).toThrow();
    });

    it('devrait rejeter un type invalide', () => {
      expect(() => {
        updateParticipationSchema.parse({
          id: 'cm12345678901234567890',
          type: 'type_invalide',
        });
      }).toThrow();
    });

    it('devrait rejeter un email organisateur invalide', () => {
      expect(() => {
        updateParticipationSchema.parse({
          id: 'cm12345678901234567890',
          organizerEmail: 'email-invalide',
        });
      }).toThrow();
    });
  });

  describe('Logique métier - Types de participation', () => {
    it('devrait distinguer consultation, information et association', () => {
      const consultation = createParticipationSchema.parse({
        companyId: 'cm12345678901234567890',
        type: 'consultation',
        date: new Date('2024-01-15'),
        organizerEmail: 'organisateur@example.com',
      });

      const information = createParticipationSchema.parse({
        companyId: 'cm12345678901234567890',
        type: 'information',
        date: new Date('2024-01-15'),
        organizerEmail: 'organisateur@example.com',
      });

      const association = createParticipationSchema.parse({
        companyId: 'cm12345678901234567890',
        type: 'association',
        date: new Date('2024-01-15'),
        organizerEmail: 'organisateur@example.com',
      });

      expect(consultation.type).toBe('consultation');
      expect(information.type).toBe('information');
      expect(association.type).toBe('association');
    });
  });
});

