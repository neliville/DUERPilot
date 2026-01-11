import { createTRPCRouter } from '../trpc';
import { companiesRouter } from './companies';
import { workUnitsRouter } from './workUnits';
import { riskAssessmentsRouter } from './riskAssessments';
import { actionPlansRouter } from './actionPlans';
import { observationsRouter } from './observations';
import { duerpVersionsRouter } from './duerpVersions';
import { authRouter } from './auth';
import { sitesRouter } from './sites';
import { plansRouter } from './plans';
import { importsRouter } from './imports';
import { uploadsRouter } from './uploads';
import { avatarsRouter } from './avatars';
import { storageRouter } from './storage';
import { adminRouter } from './admin/_app';
import { emailPreferencesRouter } from './emailPreferences';
import { contactRouter } from './contact';
import { activitySectorsRouter } from './activitySectors';
import { dangerCategoriesRouter } from './dangerCategories';
import { dangerousSituationsRouter } from './dangerousSituations';
import { preventionMeasuresRouter } from './preventionMeasures';
import { aiUsageRouter } from './aiUsage';
import { sectorRiskReferencesRouter } from './sectorRiskReferences';
import { duerpilotReferenceRouter } from './duerpilotReference';
import { papripactRouter } from './papripact';
import { participationTravailleursRouter } from './participation-travailleurs';

/**
 * Router principal de l'application.
 * Tous les routers doivent être importés et ajoutés ici.
 */
export const appRouter = createTRPCRouter({
  companies: companiesRouter,
  sites: sitesRouter,
  workUnits: workUnitsRouter,
  riskAssessments: riskAssessmentsRouter,
  actionPlans: actionPlansRouter,
  observations: observationsRouter,
  duerpVersions: duerpVersionsRouter,
  auth: authRouter,
  plans: plansRouter,
  imports: importsRouter,
  uploads: uploadsRouter,
  avatars: avatarsRouter,
  storage: storageRouter,
  admin: adminRouter,
  emailPreferences: emailPreferencesRouter,
  contact: contactRouter,
  activitySectors: activitySectorsRouter,
  dangerCategories: dangerCategoriesRouter,
  dangerousSituations: dangerousSituationsRouter,
  preventionMeasures: preventionMeasuresRouter,
  aiUsage: aiUsageRouter,
  sectorRiskReferences: sectorRiskReferencesRouter, // LEGACY - Référentiels sectoriels individuels
  duerpilotReference: duerpilotReferenceRouter, // PRINCIPAL - Référentiel central consolidé
  papripact: papripactRouter, // PAPRIPACT (obligatoire si employeeCount >= 50)
  participationTravailleurs: participationTravailleursRouter, // Participation des travailleurs (conformité réglementaire)
});

export type AppRouter = typeof appRouter;

