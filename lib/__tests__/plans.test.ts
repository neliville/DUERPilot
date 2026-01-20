import { describe, it, expect } from 'vitest';
import {
  PLAN_FEATURES,
  PLAN_PRICES,
  PLAN_NAMES,
  PLAN_DESCRIPTIONS,
  getUpgradePlan,
  getRequiredPlan,
  hasMethodAccess,
  type Plan,
} from '../plans';

describe('Plans Configuration v2.0', () => {
  describe('Type Plan', () => {
    it('devrait inclure tous les plans v2.0', () => {
      const plans: Plan[] = ['free', 'starter', 'business', 'premium', 'entreprise'];
      plans.forEach((plan) => {
        expect(PLAN_FEATURES[plan]).toBeDefined();
        expect(PLAN_PRICES[plan]).toBeDefined();
        expect(PLAN_NAMES[plan]).toBeDefined();
        expect(PLAN_DESCRIPTIONS[plan]).toBeDefined();
      });
    });

    it('ne devrait plus inclure les anciens plans', () => {
      // @ts-expect-error - anciens plans ne doivent plus exister
      const oldPlans: Plan[] = ['essentiel', 'pro', 'expert'];
      oldPlans.forEach((plan) => {
        // Ces plans ne devraient plus être dans le type Plan
        expect(PLAN_FEATURES[plan as Plan]).toBeUndefined();
      });
    });
  });

  describe('PLAN_FEATURES', () => {
    it('devrait avoir les bons quotas pour FREE', () => {
      const free = PLAN_FEATURES.free;
      expect(free.maxPlansActionPerMonth).toBe(25);
      expect(free.maxObservationsPerMonth).toBe(50);
      expect(free.maxRisksPerMonth).toBe(5);
    });

    it('devrait avoir les bons quotas pour STARTER', () => {
      const starter = PLAN_FEATURES.starter;
      expect(starter.maxPlansActionPerMonth).toBe(150);
      expect(starter.maxObservationsPerMonth).toBe(300);
      expect(starter.maxRisksPerMonth).toBe(30);
      expect(starter.maxExportsPerMonth).toBe(3);
      expect(starter.maxAISuggestionsRisks).toBe(0); // Pas d'IA
    });

    it('devrait avoir les bons quotas pour BUSINESS', () => {
      const business = PLAN_FEATURES.business;
      expect(business.maxPlansActionPerMonth).toBe(600);
      expect(business.maxObservationsPerMonth).toBe(1000);
      expect(business.maxRisksPerMonth).toBe(150);
      expect(business.maxExportsPerMonth).toBe(24);
      expect(business.maxImportsPerMonth).toBe(10);
      expect(business.maxAISuggestionsRisks).toBe(100);
    });

    it('devrait avoir les bons quotas pour PREMIUM', () => {
      const premium = PLAN_FEATURES.premium;
      expect(premium.maxPlansActionPerMonth).toBe(2000);
      expect(premium.maxObservationsPerMonth).toBe(3000);
      expect(premium.maxRisksPerMonth).toBe(500);
      expect(premium.maxExportsPerMonth).toBe(100);
      expect(premium.maxImportsPerMonth).toBe(30);
      expect(premium.maxAISuggestionsRisks).toBe(300);
      expect(premium.maxAISuggestionsActions).toBe(100);
    });
  });

  describe('PLAN_PRICES', () => {
    it('devrait avoir les nouveaux prix pour STARTER', () => {
      expect(PLAN_PRICES.starter.monthly).toBe(59);
      expect(PLAN_PRICES.starter.annual).toBe(590);
      expect(PLAN_PRICES.starter.annualTotal).toBe(590);
    });

    it('devrait avoir les nouveaux prix pour BUSINESS', () => {
      expect(PLAN_PRICES.business.monthly).toBe(149);
      expect(PLAN_PRICES.business.annual).toBe(1490);
      expect(PLAN_PRICES.business.annualTotal).toBe(1490);
    });

    it('devrait avoir les nouveaux prix pour PREMIUM', () => {
      expect(PLAN_PRICES.premium.monthly).toBe(349);
      expect(PLAN_PRICES.premium.annual).toBe(3490);
      expect(PLAN_PRICES.premium.annualTotal).toBe(3490);
    });
  });

  describe('PLAN_NAMES', () => {
    it('devrait avoir les nouveaux noms', () => {
      expect(PLAN_NAMES.starter).toBe('STARTER');
      expect(PLAN_NAMES.business).toBe('BUSINESS');
      expect(PLAN_NAMES.premium).toBe('PREMIUM');
    });
  });

  describe('PLAN_DESCRIPTIONS', () => {
    it('devrait avoir les nouvelles descriptions', () => {
      expect(PLAN_DESCRIPTIONS.starter).toBe('TPE Conforme');
      expect(PLAN_DESCRIPTIONS.business).toBe('PME avec IA');
      expect(PLAN_DESCRIPTIONS.premium).toBe('PME Structurée');
    });
  });

  describe('getUpgradePlan', () => {
    it('devrait retourner le bon plan supérieur', () => {
      expect(getUpgradePlan('free')).toBe('starter');
      expect(getUpgradePlan('starter')).toBe('business');
      expect(getUpgradePlan('business')).toBe('premium');
      expect(getUpgradePlan('premium')).toBe('entreprise');
      expect(getUpgradePlan('entreprise')).toBeNull();
    });
  });

  describe('getRequiredPlan', () => {
    it('devrait retourner starter pour inrs', () => {
      expect(getRequiredPlan('inrs')).toBe('starter');
    });

    it('devrait retourner business pour multiple_companies', () => {
      expect(getRequiredPlan('multiple_companies')).toBe('business');
    });

    it('devrait retourner premium pour multi_tenant', () => {
      expect(getRequiredPlan('multi_tenant')).toBe('premium');
    });
  });

  describe('hasMethodAccess', () => {
    it('devrait vérifier l\'accès aux méthodes correctement', () => {
      expect(hasMethodAccess('free', 'duerp_generique')).toBe(true);
      expect(hasMethodAccess('free', 'inrs')).toBe(false);
      expect(hasMethodAccess('starter', 'inrs')).toBe(true);
      expect(hasMethodAccess('starter', 'assistance_ia')).toBe(false);
      expect(hasMethodAccess('business', 'assistance_ia')).toBe(true);
      expect(hasMethodAccess('premium', 'assistance_ia')).toBe(true);
    });
  });

  describe('Ratios Quotas', () => {
    it('devrait respecter le ratio 4-5× pour plans d\'action', () => {
      // FREE: 5 risques → 25 actions (ratio 5:1)
      expect(PLAN_FEATURES.free.maxPlansActionPerMonth / PLAN_FEATURES.free.maxRisksPerMonth).toBeCloseTo(5, 0);
      
      // STARTER: 30 risques → 150 actions (ratio 5:1)
      expect(PLAN_FEATURES.starter.maxPlansActionPerMonth / PLAN_FEATURES.starter.maxRisksPerMonth).toBeCloseTo(5, 0);
      
      // BUSINESS: 150 risques → 600 actions (ratio 4:1)
      expect(PLAN_FEATURES.business.maxPlansActionPerMonth / PLAN_FEATURES.business.maxRisksPerMonth).toBeCloseTo(4, 0);
      
      // PREMIUM: 500 risques → 2000 actions (ratio 4:1)
      expect(PLAN_FEATURES.premium.maxPlansActionPerMonth / PLAN_FEATURES.premium.maxRisksPerMonth).toBeCloseTo(4, 0);
    });

    it('devrait respecter le ratio 6-10× pour observations', () => {
      // FREE: 5 risques → 50 observations (ratio 10:1)
      expect(PLAN_FEATURES.free.maxObservationsPerMonth / PLAN_FEATURES.free.maxRisksPerMonth).toBeCloseTo(10, 0);
      
      // STARTER: 30 risques → 300 observations (ratio 10:1)
      expect(PLAN_FEATURES.starter.maxObservationsPerMonth / PLAN_FEATURES.starter.maxRisksPerMonth).toBeCloseTo(10, 0);
      
      // BUSINESS: 150 risques → 1000 observations (ratio ~6.7:1)
      expect(PLAN_FEATURES.business.maxObservationsPerMonth / PLAN_FEATURES.business.maxRisksPerMonth).toBeCloseTo(6.67, 1);
      
      // PREMIUM: 500 risques → 3000 observations (ratio 6:1)
      expect(PLAN_FEATURES.premium.maxObservationsPerMonth / PLAN_FEATURES.premium.maxRisksPerMonth).toBeCloseTo(6, 0);
    });
  });
});
