/**
 * Tests pour les messages légaux (conformité réglementaire)
 * 
 * Cœur métier : Messages obligatoires pour la conformité réglementaire DUERP
 */

import { describe, it, expect } from 'vitest';
import {
  LEGAL_RESPONSIBILITY_MESSAGE,
  AI_ASSISTANCE_MESSAGE,
  PAPRIPACT_REQUIREMENT_MESSAGE,
  WORKER_PARTICIPATION_MESSAGE,
  DUERP_UPDATE_REQUIREMENT_MESSAGE,
  TRACEABILITY_MESSAGE,
  REGULATORY_REFERENCES,
} from '../legal-messages';

describe('Legal Messages - Messages légaux (conformité réglementaire)', () => {
  describe('LEGAL_RESPONSIBILITY_MESSAGE', () => {
    it('devrait avoir une structure valide', () => {
      expect(LEGAL_RESPONSIBILITY_MESSAGE).toHaveProperty('title');
      expect(LEGAL_RESPONSIBILITY_MESSAGE).toHaveProperty('content');
      expect(LEGAL_RESPONSIBILITY_MESSAGE).toHaveProperty('variant');
      expect(LEGAL_RESPONSIBILITY_MESSAGE.variant).toBe('warning');
    });

    it('devrait contenir une référence au Code du travail', () => {
      expect(LEGAL_RESPONSIBILITY_MESSAGE.content).toContain('Code du travail');
      expect(LEGAL_RESPONSIBILITY_MESSAGE.content).toContain('R.4121');
    });

    it('devrait préciser que DUERPilot est un outil d\'aide', () => {
      expect(LEGAL_RESPONSIBILITY_MESSAGE.content).toContain('outil d\'aide');
    });

    it('devrait préciser la responsabilité de l\'employeur', () => {
      expect(LEGAL_RESPONSIBILITY_MESSAGE.content).toContain('employeur');
      expect(LEGAL_RESPONSIBILITY_MESSAGE.content).toContain('responsable');
    });
  });

  describe('AI_ASSISTANCE_MESSAGE', () => {
    it('devrait avoir une structure valide', () => {
      expect(AI_ASSISTANCE_MESSAGE).toHaveProperty('title');
      expect(AI_ASSISTANCE_MESSAGE).toHaveProperty('content');
      expect(AI_ASSISTANCE_MESSAGE).toHaveProperty('variant');
      expect(AI_ASSISTANCE_MESSAGE.variant).toBe('info');
    });

    it('devrait préciser que l\'IA est assistive', () => {
      expect(AI_ASSISTANCE_MESSAGE.content).toContain('assistive');
      expect(AI_ASSISTANCE_MESSAGE.content).toContain('indicatif');
    });

    it('devrait préciser que les suggestions doivent être validées', () => {
      expect(AI_ASSISTANCE_MESSAGE.content).toContain('validées');
    });
  });

  describe('PAPRIPACT_REQUIREMENT_MESSAGE', () => {
    it('devrait avoir une structure valide', () => {
      expect(PAPRIPACT_REQUIREMENT_MESSAGE).toHaveProperty('title');
      expect(PAPRIPACT_REQUIREMENT_MESSAGE).toHaveProperty('content');
      expect(PAPRIPACT_REQUIREMENT_MESSAGE).toHaveProperty('variant');
      expect(PAPRIPACT_REQUIREMENT_MESSAGE).toHaveProperty('threshold');
      expect(PAPRIPACT_REQUIREMENT_MESSAGE.variant).toBe('warning');
      expect(PAPRIPACT_REQUIREMENT_MESSAGE.threshold).toBe(50);
    });

    it('devrait contenir une référence à l\'article L.4121-3', () => {
      expect(PAPRIPACT_REQUIREMENT_MESSAGE.content).toContain('L.4121-3');
    });

    it('devrait préciser le seuil de 50 salariés', () => {
      expect(PAPRIPACT_REQUIREMENT_MESSAGE.content).toContain('50');
    });

    it('devrait contenir le terme PAPRIPACT', () => {
      expect(PAPRIPACT_REQUIREMENT_MESSAGE.content).toContain('PAPRIPACT');
    });
  });

  describe('WORKER_PARTICIPATION_MESSAGE', () => {
    it('devrait avoir une structure valide', () => {
      expect(WORKER_PARTICIPATION_MESSAGE).toHaveProperty('title');
      expect(WORKER_PARTICIPATION_MESSAGE).toHaveProperty('content');
      expect(WORKER_PARTICIPATION_MESSAGE).toHaveProperty('variant');
      expect(WORKER_PARTICIPATION_MESSAGE.variant).toBe('info');
    });

    it('devrait contenir une référence à l\'article L.4121-1', () => {
      expect(WORKER_PARTICIPATION_MESSAGE.content).toContain('L.4121-1');
    });

    it('devrait mentionner la consultation et l\'information', () => {
      expect(WORKER_PARTICIPATION_MESSAGE.content).toContain('consultation');
      expect(WORKER_PARTICIPATION_MESSAGE.content).toContain('information');
    });
  });

  describe('DUERP_UPDATE_REQUIREMENT_MESSAGE', () => {
    it('devrait avoir une structure valide', () => {
      expect(DUERP_UPDATE_REQUIREMENT_MESSAGE).toHaveProperty('title');
      expect(DUERP_UPDATE_REQUIREMENT_MESSAGE).toHaveProperty('content');
      expect(DUERP_UPDATE_REQUIREMENT_MESSAGE).toHaveProperty('variant');
      expect(DUERP_UPDATE_REQUIREMENT_MESSAGE.variant).toBe('info');
    });

    it('devrait contenir une référence à l\'article R.4121-2', () => {
      expect(DUERP_UPDATE_REQUIREMENT_MESSAGE.content).toContain('R.4121-2');
    });

    it('devrait mentionner la mise à jour annuelle', () => {
      expect(DUERP_UPDATE_REQUIREMENT_MESSAGE.content).toContain('par an');
    });

    it('devrait mentionner les cas de mise à jour obligatoire', () => {
      expect(DUERP_UPDATE_REQUIREMENT_MESSAGE.content).toContain('modification');
    });
  });

  describe('TRACEABILITY_MESSAGE', () => {
    it('devrait avoir une structure valide', () => {
      expect(TRACEABILITY_MESSAGE).toHaveProperty('title');
      expect(TRACEABILITY_MESSAGE).toHaveProperty('content');
      expect(TRACEABILITY_MESSAGE).toHaveProperty('variant');
      expect(TRACEABILITY_MESSAGE.variant).toBe('info');
    });

    it('devrait mentionner la traçabilité', () => {
      expect(TRACEABILITY_MESSAGE.content).toContain('tracées');
      expect(TRACEABILITY_MESSAGE.content).toContain('historique');
    });

    it('devrait mentionner l\'historique', () => {
      expect(TRACEABILITY_MESSAGE.content).toContain('historique');
    });
  });

  describe('REGULATORY_REFERENCES', () => {
    it('devrait contenir les références réglementaires principales', () => {
      expect(REGULATORY_REFERENCES).toHaveProperty('generalObligation');
      expect(REGULATORY_REFERENCES).toHaveProperty('duerpRequirement');
      expect(REGULATORY_REFERENCES).toHaveProperty('duerpUpdate');
      expect(REGULATORY_REFERENCES).toHaveProperty('workerParticipation');
    });

    it('devrait avoir une structure cohérente pour chaque référence', () => {
      Object.values(REGULATORY_REFERENCES).forEach((ref) => {
        expect(ref).toHaveProperty('code');
        expect(ref).toHaveProperty('title');
        expect(ref).toHaveProperty('description');
      });
    });

    it('devrait contenir les articles du Code du travail corrects', () => {
      expect(REGULATORY_REFERENCES.generalObligation.code).toContain('L.4121-1');
      expect(REGULATORY_REFERENCES.duerpRequirement.code).toContain('R.4121');
      expect(REGULATORY_REFERENCES.duerpUpdate.code).toContain('R.4121-2');
      expect(REGULATORY_REFERENCES.workerParticipation.code).toContain('L.4121-1');
    });
  });
});

