-- Migration manuelle pour DUERP AI
-- À exécuter directement sur PostgreSQL si Prisma Migrate ne fonctionne pas

-- Note: Cette migration crée toutes les tables nécessaires
-- Exécutez ce script avec: psql -h 46.224.147.210 -U postgres -d postgres -f scripts/create-migration-manually.sql

BEGIN;

-- ============================================
-- MULTI-TENANCY
-- ============================================

CREATE TABLE IF NOT EXISTS "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "tenants_slug_key" ON "tenants"("slug");
CREATE INDEX IF NOT EXISTS "tenants_slug_idx" ON "tenants"("slug");

-- ============================================
-- ENTREPRISE & STRUCTURE
-- ============================================

CREATE TABLE IF NOT EXISTS "companies" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "siret" TEXT,
    "activity" TEXT,
    "sector" TEXT,
    "employeeCount" INTEGER,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'France',
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "hasCSE" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "companies_siret_key" ON "companies"("siret");
CREATE INDEX IF NOT EXISTS "companies_tenantId_idx" ON "companies"("tenantId");
CREATE INDEX IF NOT EXISTS "companies_siret_idx" ON "companies"("siret");

CREATE TABLE IF NOT EXISTS "sites" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'France',
    "employeeCount" INTEGER,
    "isMainSite" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sites_companyId_idx" ON "sites"("companyId");

CREATE TABLE IF NOT EXISTS "work_units" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "exposedCount" INTEGER,
    "responsibleName" TEXT,
    "responsibleEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_units_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "work_units_siteId_idx" ON "work_units"("siteId");

-- ============================================
-- RÉFÉRENTIEL DES DANGERS
-- ============================================

CREATE TABLE IF NOT EXISTS "hazard_refs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "category" TEXT NOT NULL,
    "shortLabel" TEXT NOT NULL,
    "description" TEXT,
    "examples" TEXT,
    "keywords" TEXT[],
    "normativeRefs" TEXT[],
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hazard_refs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "hazard_refs_tenantId_idx" ON "hazard_refs"("tenantId");
CREATE INDEX IF NOT EXISTS "hazard_refs_category_idx" ON "hazard_refs"("category");
CREATE INDEX IF NOT EXISTS "hazard_refs_shortLabel_idx" ON "hazard_refs"("shortLabel");

-- ============================================
-- ÉVALUATION DES RISQUES
-- ============================================

CREATE TABLE IF NOT EXISTS "risk_assessments" (
    "id" TEXT NOT NULL,
    "workUnitId" TEXT NOT NULL,
    "hazardRefId" TEXT NOT NULL,
    "dangerousSituation" TEXT NOT NULL,
    "exposedPersons" TEXT,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "probability" INTEGER NOT NULL DEFAULT 1,
    "severity" INTEGER NOT NULL DEFAULT 1,
    "control" INTEGER NOT NULL DEFAULT 1,
    "riskScore" INTEGER NOT NULL,
    "priorityLevel" TEXT NOT NULL,
    "existingMeasures" TEXT,
    "aiSuggestions" JSONB,
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_assessments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "risk_assessments_workUnitId_idx" ON "risk_assessments"("workUnitId");
CREATE INDEX IF NOT EXISTS "risk_assessments_hazardRefId_idx" ON "risk_assessments"("hazardRefId");
CREATE INDEX IF NOT EXISTS "risk_assessments_priorityLevel_idx" ON "risk_assessments"("priorityLevel");
CREATE INDEX IF NOT EXISTS "risk_assessments_riskScore_idx" ON "risk_assessments"("riskScore");

-- ============================================
-- PLAN D'ACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS "action_plans" (
    "id" TEXT NOT NULL,
    "riskAssessmentId" TEXT,
    "workUnitId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "responsibleName" TEXT,
    "responsibleEmail" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'à_faire',
    "completedAt" TIMESTAMP(3),
    "proofUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "action_plans_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "action_plans_workUnitId_idx" ON "action_plans"("workUnitId");
CREATE INDEX IF NOT EXISTS "action_plans_riskAssessmentId_idx" ON "action_plans"("riskAssessmentId");
CREATE INDEX IF NOT EXISTS "action_plans_status_idx" ON "action_plans"("status");
CREATE INDEX IF NOT EXISTS "action_plans_priority_idx" ON "action_plans"("priority");
CREATE INDEX IF NOT EXISTS "action_plans_dueDate_idx" ON "action_plans"("dueDate");

-- ============================================
-- VERSIONS DU DUERP
-- ============================================

CREATE TABLE IF NOT EXISTS "duerp_versions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "generationMode" TEXT NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "summary" TEXT,
    "workUnitCount" INTEGER NOT NULL DEFAULT 0,
    "riskCount" INTEGER NOT NULL DEFAULT 0,
    "priorityActionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "duerp_versions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "duerp_versions_companyId_year_versionNumber_key" ON "duerp_versions"("companyId", "year", "versionNumber");
CREATE INDEX IF NOT EXISTS "duerp_versions_tenantId_idx" ON "duerp_versions"("tenantId");
CREATE INDEX IF NOT EXISTS "duerp_versions_companyId_idx" ON "duerp_versions"("companyId");
CREATE INDEX IF NOT EXISTS "duerp_versions_year_idx" ON "duerp_versions"("year");

CREATE TABLE IF NOT EXISTS "duerp_version_snapshots" (
    "id" TEXT NOT NULL,
    "duerpVersionId" TEXT NOT NULL,
    "snapshotType" TEXT NOT NULL,
    "snapshotData" JSONB NOT NULL,
    "entityId" TEXT,

    CONSTRAINT "duerp_version_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "duerp_version_snapshots_duerpVersionId_idx" ON "duerp_version_snapshots"("duerpVersionId");
CREATE INDEX IF NOT EXISTS "duerp_version_snapshots_snapshotType_idx" ON "duerp_version_snapshots"("snapshotType");

-- ============================================
-- UTILISATEURS
-- ============================================

CREATE TABLE IF NOT EXISTS "user_profiles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "function" TEXT,
    "roles" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_email_key" ON "user_profiles"("email");
CREATE INDEX IF NOT EXISTS "user_profiles_tenantId_idx" ON "user_profiles"("tenantId");
CREATE INDEX IF NOT EXISTS "user_profiles_email_idx" ON "user_profiles"("email");

-- Table de liaison pour les assignations d'unités de travail
CREATE TABLE IF NOT EXISTS "_WorkUnitAssignments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "_WorkUnitAssignments_AB_unique" ON "_WorkUnitAssignments"("A", "B");
CREATE INDEX IF NOT EXISTS "_WorkUnitAssignments_B_index" ON "_WorkUnitAssignments"("B");

-- ============================================
-- AUDIT & TRAÇABILITÉ
-- ============================================

CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "actorId" TEXT,
    "actorRole" TEXT,
    "ipAddress" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");
CREATE INDEX IF NOT EXISTS "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "audit_logs_actorEmail_idx" ON "audit_logs"("actorEmail");
CREATE INDEX IF NOT EXISTS "audit_logs_actorId_idx" ON "audit_logs"("actorId");
CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- ============================================
-- OBSERVATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS "observations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workUnitId" TEXT NOT NULL,
    "submittedByEmail" TEXT NOT NULL,
    "submittedById" TEXT,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "photoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'nouvelle',
    "reviewerEmail" TEXT,
    "reviewerNotes" TEXT,
    "integratedRiskAssessmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "observations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "observations_tenantId_idx" ON "observations"("tenantId");
CREATE INDEX IF NOT EXISTS "observations_workUnitId_idx" ON "observations"("workUnitId");
CREATE INDEX IF NOT EXISTS "observations_status_idx" ON "observations"("status");
CREATE INDEX IF NOT EXISTS "observations_submittedByEmail_idx" ON "observations"("submittedByEmail");
CREATE INDEX IF NOT EXISTS "observations_submittedById_idx" ON "observations"("submittedById");

-- ============================================
-- CONTRAINTES DE CLÉS ÉTRANGÈRES
-- ============================================

-- Companies
ALTER TABLE "companies" ADD CONSTRAINT IF NOT EXISTS "companies_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sites
ALTER TABLE "sites" ADD CONSTRAINT IF NOT EXISTS "sites_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Work Units
ALTER TABLE "work_units" ADD CONSTRAINT IF NOT EXISTS "work_units_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Hazard Refs
ALTER TABLE "hazard_refs" ADD CONSTRAINT IF NOT EXISTS "hazard_refs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Risk Assessments
ALTER TABLE "risk_assessments" ADD CONSTRAINT IF NOT EXISTS "risk_assessments_workUnitId_fkey" FOREIGN KEY ("workUnitId") REFERENCES "work_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "risk_assessments" ADD CONSTRAINT IF NOT EXISTS "risk_assessments_hazardRefId_fkey" FOREIGN KEY ("hazardRefId") REFERENCES "hazard_refs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Action Plans
ALTER TABLE "action_plans" ADD CONSTRAINT IF NOT EXISTS "action_plans_riskAssessmentId_fkey" FOREIGN KEY ("riskAssessmentId") REFERENCES "risk_assessments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "action_plans" ADD CONSTRAINT IF NOT EXISTS "action_plans_workUnitId_fkey" FOREIGN KEY ("workUnitId") REFERENCES "work_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Duerp Versions
ALTER TABLE "duerp_versions" ADD CONSTRAINT IF NOT EXISTS "duerp_versions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "duerp_versions" ADD CONSTRAINT IF NOT EXISTS "duerp_versions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Duerp Version Snapshots
ALTER TABLE "duerp_version_snapshots" ADD CONSTRAINT IF NOT EXISTS "duerp_version_snapshots_duerpVersionId_fkey" FOREIGN KEY ("duerpVersionId") REFERENCES "duerp_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- User Profiles
ALTER TABLE "user_profiles" ADD CONSTRAINT IF NOT EXISTS "user_profiles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Work Unit Assignments
ALTER TABLE "_WorkUnitAssignments" ADD CONSTRAINT IF NOT EXISTS "_WorkUnitAssignments_A_fkey" FOREIGN KEY ("A") REFERENCES "work_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_WorkUnitAssignments" ADD CONSTRAINT IF NOT EXISTS "_WorkUnitAssignments_B_fkey" FOREIGN KEY ("B") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Audit Logs
ALTER TABLE "audit_logs" ADD CONSTRAINT IF NOT EXISTS "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT IF NOT EXISTS "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Observations
ALTER TABLE "observations" ADD CONSTRAINT IF NOT EXISTS "observations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "observations" ADD CONSTRAINT IF NOT EXISTS "observations_workUnitId_fkey" FOREIGN KEY ("workUnitId") REFERENCES "work_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "observations" ADD CONSTRAINT IF NOT EXISTS "observations_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "observations" ADD CONSTRAINT IF NOT EXISTS "observations_integratedRiskAssessmentId_fkey" FOREIGN KEY ("integratedRiskAssessmentId") REFERENCES "risk_assessments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;

