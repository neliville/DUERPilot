import { describe, it, expect } from 'vitest';
import { getSecteurFromNAF, extractNAFFromSIRET, getSecteurFromSIRET } from '../naf-sector-mapping';

describe('getSecteurFromNAF', () => {
  describe('Section F → BTP', () => {
    it('devrait retourner BTP pour "F"', () => {
      expect(getSecteurFromNAF('F')).toBe('BTP');
    });

    it('devrait retourner BTP pour "F43"', () => {
      expect(getSecteurFromNAF('F43')).toBe('BTP');
    });

    it('devrait retourner BTP pour "43.99Z"', () => {
      expect(getSecteurFromNAF('43.99Z')).toBe('BTP');
    });

    it('devrait retourner BTP pour "f43.99z" (case insensitive)', () => {
      expect(getSecteurFromNAF('f43.99z')).toBe('BTP');
    });
  });

  describe('Division 56 → RESTO', () => {
    it('devrait retourner RESTO pour "56.10A"', () => {
      expect(getSecteurFromNAF('56.10A')).toBe('RESTO');
    });

    it('devrait retourner RESTO pour "5610A"', () => {
      expect(getSecteurFromNAF('5610A')).toBe('RESTO');
    });

    it('devrait retourner RESTO pour "56"', () => {
      expect(getSecteurFromNAF('56')).toBe('RESTO');
    });
  });

  describe('Sections K, L, M, N → BUREAU', () => {
    it('devrait retourner BUREAU pour "K64"', () => {
      expect(getSecteurFromNAF('K64')).toBe('BUREAU');
    });

    it('devrait retourner BUREAU pour "M75"', () => {
      expect(getSecteurFromNAF('M75')).toBe('BUREAU');
    });

    it('devrait retourner BUREAU pour "L"', () => {
      expect(getSecteurFromNAF('L')).toBe('BUREAU');
    });

    it('devrait retourner BUREAU pour "N"', () => {
      expect(getSecteurFromNAF('N')).toBe('BUREAU');
    });
  });

  describe('Division 47 → COMMERCE', () => {
    it('devrait retourner COMMERCE pour "47.11A"', () => {
      expect(getSecteurFromNAF('47.11A')).toBe('COMMERCE');
    });

    it('devrait retourner COMMERCE pour "4711A"', () => {
      expect(getSecteurFromNAF('4711A')).toBe('COMMERCE');
    });

    it('devrait retourner COMMERCE pour "47"', () => {
      expect(getSecteurFromNAF('47')).toBe('COMMERCE');
    });
  });

  describe('Section Q → SANTE', () => {
    it('devrait retourner SANTE pour "Q86"', () => {
      expect(getSecteurFromNAF('Q86')).toBe('SANTE');
    });

    it('devrait retourner SANTE pour "Q"', () => {
      expect(getSecteurFromNAF('Q')).toBe('SANTE');
    });
  });

  describe('Section C → INDUSTRIE', () => {
    it('devrait retourner INDUSTRIE pour "C25"', () => {
      expect(getSecteurFromNAF('C25')).toBe('INDUSTRIE');
    });
  });

  describe('Section H → LOGISTIQUE', () => {
    it('devrait retourner LOGISTIQUE pour "H49"', () => {
      expect(getSecteurFromNAF('H49')).toBe('LOGISTIQUE');
    });
  });

  describe('Divisions 87-88 → SERVICES', () => {
    it('devrait retourner SERVICES pour "87.10A"', () => {
      expect(getSecteurFromNAF('87.10A')).toBe('SERVICES');
    });

    it('devrait retourner SERVICES pour "88"', () => {
      expect(getSecteurFromNAF('88')).toBe('SERVICES');
    });
  });

  describe('Section A → AGRICULTURE', () => {
    it('devrait retourner AGRICULTURE pour "A01"', () => {
      expect(getSecteurFromNAF('A01')).toBe('AGRICULTURE');
    });
  });

  describe('Section P → EDUCATION', () => {
    it('devrait retourner EDUCATION pour "P85"', () => {
      expect(getSecteurFromNAF('P85')).toBe('EDUCATION');
    });
  });

  describe('Cas limites et fallback', () => {
    it('devrait retourner GENERIQUE pour "12345"', () => {
      expect(getSecteurFromNAF('12345')).toBe('GENERIQUE');
    });

    it('devrait retourner GENERIQUE pour une chaîne vide', () => {
      expect(getSecteurFromNAF('')).toBe('GENERIQUE');
    });

    it('devrait retourner GENERIQUE pour une valeur null', () => {
      expect(getSecteurFromNAF(null as any)).toBe('GENERIQUE');
    });

    it('devrait retourner GENERIQUE pour une valeur undefined', () => {
      expect(getSecteurFromNAF(undefined as any)).toBe('GENERIQUE');
    });

    it('devrait gérer les espaces', () => {
      expect(getSecteurFromNAF('  F43  ')).toBe('BTP');
    });

    it('devrait gérer les points', () => {
      expect(getSecteurFromNAF('47.11.A')).toBe('COMMERCE');
    });
  });
});

describe('extractNAFFromSIRET', () => {
  it('devrait extraire le code NAF depuis un SIRET valide', () => {
    const siret = '12345678901234';
    const naf = extractNAFFromSIRET(siret);
    expect(naf).toBe('9012'); // Caractères 9-13 (index 8-12)
  });

  it('devrait retourner null pour un SIRET invalide', () => {
    expect(extractNAFFromSIRET('12345')).toBeNull();
    expect(extractNAFFromSIRET('')).toBeNull();
    expect(extractNAFFromSIRET(null as any)).toBeNull();
  });

  it('devrait gérer les espaces et points dans le SIRET', () => {
    const siret = '123 456 789 012 34';
    const naf = extractNAFFromSIRET(siret);
    expect(naf).toBe('9012');
  });
});

describe('getSecteurFromSIRET', () => {
  it('devrait retourner un secteur depuis un SIRET', () => {
    // SIRET avec NAF 5610A (Restauration)
    const siret = '1234567856101A';
    const secteur = getSecteurFromSIRET(siret);
    expect(secteur).toBe('RESTO');
  });

  it('devrait retourner GENERIQUE pour un SIRET invalide', () => {
    expect(getSecteurFromSIRET('12345')).toBe('GENERIQUE');
  });
});

