/**
 * Router principal admin
 * Regroupe tous les sous-routers admin
 */

import { createTRPCRouter } from '../../trpc';
import { companiesRouter } from './companies';
import { usersRouter } from './users';
import { billingRouter } from './billing';
import { aiUsageRouter } from './ai-usage';
import { importsRouter } from './imports';
import { auditRouter } from './audit';
import { analyticsRouter } from './analytics';
import { referentialsRouter } from './referentials';
import { supportRouter } from './support';
import { dashboardRouter } from './dashboard';
import { invitationsRouter } from './invitations';

export const adminRouter = createTRPCRouter({
  companies: companiesRouter,
  users: usersRouter,
  billing: billingRouter,
  aiUsage: aiUsageRouter,
  imports: importsRouter,
  audit: auditRouter,
  analytics: analyticsRouter,
  referentials: referentialsRouter,
  support: supportRouter,
  dashboard: dashboardRouter,
  invitations: invitationsRouter,
});

