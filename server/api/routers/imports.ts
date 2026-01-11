import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { PLAN_FEATURES, getUpgradePlan, type Plan } from '@/lib/plans';
import { minioService } from '@/server/services/storage/minio-service';
import { BUCKETS } from '@/server/services/storage/constants';
import { buildPath, getMimeType, calculateRetentionDate } from '@/server/services/storage/utils';

/**
 * Transforme les données mappées depuis React Spreadsheet Import en structure DUERP
 */
function transformMappedDataToStructure(mappedData: any[]): any {
  // Grouper par entreprise et unité de travail
  const companies = new Map<string, any>();
  const workUnitsMap = new Map<string, any>();
  const risks: any[] = [];
  const measures: any[] = [];

  mappedData.forEach((row) => {
    // Entreprise
    const companyKey = row.company?.siret || row.company?.legalName || 'default';
    if (!companies.has(companyKey)) {
      companies.set(companyKey, {
        legalName: row.company?.legalName || null,
        siret: row.company?.siret || null,
      });
    }

    // Unité de travail
    const workUnitKey = `${companyKey}_${row.workUnit?.name || 'default'}`;
    if (!workUnitsMap.has(workUnitKey)) {
      workUnitsMap.set(workUnitKey, {
        name: row.workUnit?.name || 'Unité non nommée',
        description: null,
        exposedCount: row.workUnit?.exposedCount || null,
      });
    }

    // Risque
    if (row.risk?.hazard) {
      risks.push({
        workUnitName: row.workUnit?.name || null,
        hazard: row.risk.hazard,
        dangerousSituation: row.risk.dangerousSituation || null,
        exposedPersons: row.risk.exposedPersons || null,
        frequency: row.risk.frequency || null,
        probability: row.risk.probability || null,
        severity: row.risk.severity || null,
        control: row.risk.control || null,
        existingMeasures: row.risk.existingMeasures || null,
      });
    }

    // Mesures
    if (row.risk?.existingMeasures) {
      measures.push({
        description: row.risk.existingMeasures,
        type: null,
      });
    }
  });

  return {
    company: companies.size > 0 ? Array.from(companies.values())[0] : null,
    workUnits: Array.from(workUnitsMap.values()),
    risks,
    measures,
    confidence: 95, // Haute confiance car mappé manuellement
  };
}

const uploadDocumentSchema = z.object({
  file: z.string(), // Base64 ou URL
  fileName: z.string(),
  format: z.enum(['pdf', 'word', 'excel', 'csv']),
  mappedData: z.array(z.any()).optional(), // Données mappées depuis React Spreadsheet Import
});

const validateImportSchema = z.object({
  importId: z.string().cuid(),
  validatedData: z.any(), // Structure validée par l'utilisateur
});

export const importsRouter = createTRPCRouter({
  /**
   * Upload un document et lance l'extraction IA
   */
  uploadDocument: authenticatedProcedure
    .input(uploadDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le plan permet l'import
      const userPlan = (ctx.userProfile?.plan || 'free') as Plan;
      const planFeatures = PLAN_FEATURES[userPlan];
      
      if (!planFeatures.hasImportDUERP) {
        const { PLAN_ERROR_MESSAGES } = await import('@/lib/plans');
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: PLAN_ERROR_MESSAGES.feature_not_available('import_duerp', userPlan, 'starter'),
        });
      }

      // Vérifier le quota mensuel d'imports
      if (planFeatures.maxImportsPerMonth !== null && planFeatures.maxImportsPerMonth !== Infinity) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const importsCount = await ctx.prisma.duerpImport.count({
          where: {
            userId: ctx.userProfile!.id,
            createdAt: {
              gte: monthStart,
            },
          },
        });
        
        if (importsCount >= planFeatures.maxImportsPerMonth) {
          const { PLAN_ERROR_MESSAGES } = await import('@/lib/plans');
          const upgradePlan = getUpgradePlan(userPlan);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: PLAN_ERROR_MESSAGES.limit_exceeded(
              'imports',
              importsCount,
              planFeatures.maxImportsPerMonth,
              userPlan,
              upgradePlan
            ),
          });
        }
      }

      // Calculer la taille du fichier (approximative depuis base64)
      const fileSize = Math.round((input.file.length * 3) / 4);

      // Convertir base64 en Buffer
      const fileBuffer = Buffer.from(input.file, 'base64');

      // Construire le chemin MinIO
      const path = buildPath.import(ctx.userId, ctx.userId, input.fileName);

      // Créer les métadonnées
      const contentType = getMimeType(input.format);
      const retentionDate = calculateRetentionDate('import');
      const metadata = {
        organization_id: ctx.tenantId,
        user_id: ctx.userId,
        created_by: ctx.userProfile?.email || ctx.userId,
        document_type: 'import',
        created_at: new Date().toISOString(),
        content_type: contentType,
        file_size: fileSize,
        original_filename: input.fileName,
        retention_until: retentionDate.toISOString(),
      };

      // Upload vers MinIO
      let fileUrl: string;
      try {
        fileUrl = await minioService.uploadFile({
          bucket: BUCKETS.IMPORTS,
          path,
          buffer: fileBuffer,
          contentType,
          metadata,
        });
      } catch (error) {
        console.error('[Imports] Erreur upload MinIO:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erreur lors de l'upload vers MinIO: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        });
      }

      // Créer l'enregistrement Import
      const importRecord = await ctx.prisma.duerpImport.create({
        data: {
          userId: ctx.userProfile!.id,
          tenantId: ctx.tenantId,
          fileName: input.fileName,
          fileSize,
          format: input.format,
          status: 'uploading',
          fileUrl, // URL MinIO
        },
      });

      // Mettre à jour le statut à "analyzing"
      await ctx.prisma.duerpImport.update({
        where: { id: importRecord.id },
        data: { status: 'analyzing' },
      });

      try {
        // Le fichier est déjà en Buffer depuis l'upload MinIO
        
        // Extraire le texte selon le format
        let extractedText = '';
        let extractionData: any = {};

        if (input.format === 'pdf') {
          const { extractPDFText } = await import('@/server/services/import/pdf-extractor');
          const pdfResult = await extractPDFText(fileBuffer);
          extractedText = pdfResult.text;
          extractionData = {
            format: 'pdf',
            text: pdfResult.text,
            metadata: pdfResult.metadata,
            pages: pdfResult.pages,
          };
        } else if (input.format === 'word') {
          const { extractWordText } = await import('@/server/services/import/word-extractor');
          const wordResult = await extractWordText(fileBuffer);
          extractedText = wordResult.text;
          extractionData = {
            format: 'word',
            text: wordResult.text,
            html: wordResult.html,
            metadata: wordResult.metadata,
          };
        } else if (input.format === 'excel' || input.format === 'csv') {
          const { extractExcelData, extractCSVData } = await import('@/server/services/import/excel-extractor');
          if (input.format === 'excel') {
            const excelResult = await extractExcelData(fileBuffer);
            extractionData = {
              format: 'excel',
              sheets: excelResult.sheets,
              metadata: excelResult.metadata,
            };
            // Convertir en texte pour extraction IA
            extractedText = excelResult.sheets.map(s => s.data.map(row => row.join(' | ')).join('\n')).join('\n\n');
          } else {
            const csvResult = await extractCSVData(fileBuffer);
            extractionData = {
              format: 'csv',
              data: csvResult.data,
              headers: csvResult.headers,
              metadata: csvResult.metadata,
            };
            extractedText = csvResult.data.map(row => row.join(' | ')).join('\n');
          }
        }

        // Extraction IA de la structure DUERP
        let structure: any = { confidence: 0 };
        if (planFeatures.hasImportIAExtraction !== 'none') {
          const { extractDuerpStructure } = await import('@/server/services/import/ia-extractor');
          
          // Récupérer companyId si disponible (depuis mappedData ou extraction)
          let companyId: string | undefined;
          if (input.mappedData && input.mappedData.length > 0) {
            // Essayer de trouver l'entreprise depuis les données mappées
            const firstRow = input.mappedData[0];
            if (firstRow?.company?.siret) {
              const existingCompany = await ctx.prisma.company.findFirst({
                where: {
                  tenantId: ctx.tenantId,
                  siret: firstRow.company.siret,
                },
                select: { id: true },
              });
              companyId = existingCompany?.id;
            }
          }
          
          structure = await extractDuerpStructure(
            extractedText,
            input.format,
            planFeatures.hasImportIAExtraction,
            {
              tenantId: ctx.tenantId,
              userId: ctx.userId,
              companyId,
            }
          );
        }

        // Mettre à jour avec les données extraites
        await ctx.prisma.duerpImport.update({
          where: { id: importRecord.id },
          data: {
            status: 'validated', // Prêt pour validation utilisateur
            extractionData: {
              ...extractionData,
              structure,
            },
          },
        });

        return {
          id: importRecord.id,
          status: 'validated',
          message: 'Extraction terminée, veuillez valider les données',
          extractionData: {
            ...extractionData,
            structure,
          },
        };
      } catch (error) {
        // En cas d'erreur, mettre à jour le statut
        await ctx.prisma.duerpImport.update({
          where: { id: importRecord.id },
          data: {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'extraction',
          },
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erreur lors de l'extraction: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        });
      }
    }),

  /**
   * Récupère le statut d'un import et les données extraites
   */
  getImportStatus: authenticatedProcedure
    .input(z.object({ importId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const importRecord = await ctx.prisma.duerpImport.findFirst({
        where: {
          id: input.importId,
          tenantId: ctx.tenantId,
        },
      });

      if (!importRecord) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Import non trouvé',
        });
      }

      return {
        id: importRecord.id,
        status: importRecord.status,
        fileName: importRecord.fileName,
        format: importRecord.format,
        extractionData: importRecord.extractionData,
        validatedData: importRecord.validatedData,
        errorMessage: importRecord.errorMessage,
        createdAt: importRecord.createdAt,
        updatedAt: importRecord.updatedAt,
      };
    }),

  /**
   * Valide les données importées et crée les entités
   */
  validateImport: authenticatedProcedure
    .input(validateImportSchema)
    .mutation(async ({ ctx, input }) => {
      const importRecord = await ctx.prisma.duerpImport.findFirst({
        where: {
          id: input.importId,
          tenantId: ctx.tenantId,
        },
      });

      if (!importRecord) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Import non trouvé',
        });
      }

      if (importRecord.status !== 'analyzing' && importRecord.status !== 'validated') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Impossible de valider un import avec le statut: ${importRecord.status}`,
        });
      }

      // Récupérer le plan utilisateur et ses limites
      const userPlan = (ctx.userProfile?.plan || 'free') as Plan;
      const planFeatures = PLAN_FEATURES[userPlan];

      // Parser la structure validée
      const structure = input.validatedData?.structure || (input.validatedData as any);
      if (!structure) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Aucune structure validée trouvée',
        });
      }

      // Statistiques de création
      const stats = {
        companies: 0,
        sites: 0,
        workUnits: 0,
        risks: 0,
        actionPlans: 0,
        errors: [] as string[],
      };

      try {
        // ============================================
        // 1. CRÉER OU RÉCUPÉRER L'ENTREPRISE
        // ============================================
        let company = null;
        if (structure.company) {
          // Vérifier la limite d'entreprises
          if (planFeatures.maxCompanies !== Infinity) {
            const companiesCount = await ctx.prisma.company.count({
              where: { tenantId: ctx.tenantId },
            });
            
            if (companiesCount >= planFeatures.maxCompanies) {
              const { PLAN_ERROR_MESSAGES, getUpgradePlan } = await import('@/lib/plans');
              const upgradePlan = getUpgradePlan(userPlan);
              throw new TRPCError({
                code: 'FORBIDDEN',
                message: PLAN_ERROR_MESSAGES.limit_exceeded(
                  'companies',
                  companiesCount,
                  planFeatures.maxCompanies,
                  userPlan,
                  upgradePlan
                ),
              });
            }
          }

          // Chercher une entreprise existante par SIRET ou nom
          if (structure.company.siret) {
            company = await ctx.prisma.company.findFirst({
              where: {
                tenantId: ctx.tenantId,
                siret: structure.company.siret,
              },
            });
          }

          if (!company && structure.company.legalName) {
            company = await ctx.prisma.company.findFirst({
              where: {
                tenantId: ctx.tenantId,
                legalName: structure.company.legalName,
              },
            });
          }

          // Créer l'entreprise si elle n'existe pas
          if (!company) {
            company = await ctx.prisma.company.create({
              data: {
                tenantId: ctx.tenantId,
                legalName: structure.company.legalName || 'Entreprise importée',
                siret: structure.company.siret || null,
                address: structure.company.address || null,
                employeeCount: structure.company.employeeCount || null,
                country: 'France',
              },
            });
            stats.companies++;
          }
        } else {
          // Si pas d'entreprise dans la structure, utiliser la première du tenant
          company = await ctx.prisma.company.findFirst({
            where: { tenantId: ctx.tenantId },
          });

          if (!company) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Aucune entreprise trouvée et aucune entreprise à créer',
            });
          }
        }

        // ============================================
        // 2. CRÉER OU RÉCUPÉRER LE SITE
        // ============================================
        let site = null;
        
        // Vérifier la limite de sites
        if (planFeatures.maxSites !== Infinity) {
          const sitesCount = await ctx.prisma.site.count({
            where: {
              company: { tenantId: ctx.tenantId },
            },
          });
          
          if (sitesCount >= planFeatures.maxSites) {
            const { PLAN_ERROR_MESSAGES, getUpgradePlan } = await import('@/lib/plans');
            const upgradePlan = getUpgradePlan(userPlan);
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: PLAN_ERROR_MESSAGES.limit_exceeded(
                'sites',
                sitesCount,
                planFeatures.maxSites,
                userPlan,
                upgradePlan
              ),
            });
          }
        }

        // Chercher le site principal ou créer un site par défaut
        site = await ctx.prisma.site.findFirst({
          where: {
            companyId: company.id,
            isMainSite: true,
          },
        });

        if (!site) {
          // Créer un site principal par défaut
          site = await ctx.prisma.site.create({
            data: {
              companyId: company.id,
              name: 'Site principal',
              isMainSite: true,
              country: 'France',
            },
          });
          stats.sites++;
        }

        // ============================================
        // 3. CRÉER LES UNITÉS DE TRAVAIL
        // ============================================
        const workUnitsMap = new Map<string, string>(); // name -> id

        if (structure.workUnits && Array.isArray(structure.workUnits)) {
          // Vérifier la limite d'unités de travail
          const currentWorkUnitsCount = await ctx.prisma.workUnit.count({
            where: {
              site: {
                company: { tenantId: ctx.tenantId },
              },
            },
          });

          const newWorkUnitsCount = structure.workUnits.length;
          if (planFeatures.maxWorkUnits !== Infinity) {
            if (currentWorkUnitsCount + newWorkUnitsCount > planFeatures.maxWorkUnits) {
              const { PLAN_ERROR_MESSAGES, getUpgradePlan } = await import('@/lib/plans');
              const upgradePlan = getUpgradePlan(userPlan);
              throw new TRPCError({
                code: 'FORBIDDEN',
                message: PLAN_ERROR_MESSAGES.limit_exceeded(
                  'workUnits',
                  currentWorkUnitsCount,
                  planFeatures.maxWorkUnits,
                  userPlan,
                  upgradePlan
                ),
              });
            }
          }

          // Créer les unités de travail
          for (const workUnitData of structure.workUnits) {
            if (!workUnitData.name) continue;

            // Vérifier si l'unité existe déjà
            let workUnit = await ctx.prisma.workUnit.findFirst({
              where: {
                siteId: site.id,
                name: workUnitData.name,
              },
            });

            if (!workUnit) {
              workUnit = await ctx.prisma.workUnit.create({
                data: {
                  siteId: site.id,
                  name: workUnitData.name,
                  description: workUnitData.description || null,
                  exposedCount: workUnitData.exposedCount || null,
                },
              });
              stats.workUnits++;
            }

            workUnitsMap.set(workUnitData.name, workUnit.id);
          }
        }

        // ============================================
        // 4. FONCTION HELPER : TROUVER OU CRÉER HAZARDREF
        // ============================================
        const findOrCreateHazardRef = async (hazardName: string): Promise<string> => {
          if (!hazardName) {
            throw new Error('Nom de danger requis');
          }

          // Chercher un danger existant par libellé
          let hazard = await ctx.prisma.hazardRef.findFirst({
            where: {
              OR: [
                { tenantId: null }, // Dangers globaux
                { tenantId: ctx.tenantId }, // Dangers du tenant
              ],
              shortLabel: {
                contains: hazardName,
                mode: 'insensitive',
              },
            },
          });

          // Si pas trouvé, chercher par mot-clé
          if (!hazard) {
            hazard = await ctx.prisma.hazardRef.findFirst({
              where: {
                OR: [
                  { tenantId: null },
                  { tenantId: ctx.tenantId },
                ],
                keywords: {
                  has: hazardName.toLowerCase(),
                },
              },
            });
          }

          // Si toujours pas trouvé, créer un danger personnalisé
          if (!hazard) {
            hazard = await ctx.prisma.hazardRef.create({
              data: {
                tenantId: ctx.tenantId,
                category: 'autre',
                shortLabel: hazardName,
                description: `Danger importé: ${hazardName}`,
                keywords: [hazardName.toLowerCase()],
                isCustom: true,
              },
            });
          }

          return hazard.id;
        };

        // ============================================
        // 5. CRÉER LES RISQUES (RISK ASSESSMENTS)
        // ============================================
        const risksMap = new Map<string, string>(); // workUnitName-hazard -> riskId

        if (structure.risks && Array.isArray(structure.risks)) {
          // Vérifier le quota mensuel de risques
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const currentRisksCount = await ctx.prisma.riskAssessment.count({
            where: {
              workUnit: {
                site: {
                  company: { tenantId: ctx.tenantId },
                },
              },
              createdAt: {
                gte: monthStart,
              },
            },
          });

          const newRisksCount = structure.risks.length;
          if (planFeatures.maxRisksPerMonth !== Infinity) {
            if (currentRisksCount + newRisksCount > planFeatures.maxRisksPerMonth) {
              const { PLAN_ERROR_MESSAGES, getUpgradePlan } = await import('@/lib/plans');
              const upgradePlan = getUpgradePlan(userPlan);
              throw new TRPCError({
                code: 'FORBIDDEN',
                message: PLAN_ERROR_MESSAGES.limit_exceeded(
                  'risks',
                  currentRisksCount,
                  planFeatures.maxRisksPerMonth,
                  userPlan,
                  upgradePlan
                ),
              });
            }
          }

          // Créer les risques
          for (const riskData of structure.risks) {
            if (!riskData.hazard || !riskData.workUnitName) {
              stats.errors.push(`Risque ignoré: danger ou unité de travail manquant`);
              continue;
            }

            const workUnitId = workUnitsMap.get(riskData.workUnitName);
            if (!workUnitId) {
              stats.errors.push(`Risque ignoré: unité de travail "${riskData.workUnitName}" non trouvée`);
              continue;
            }

            try {
              // Trouver ou créer le HazardRef
              const hazardRefId = await findOrCreateHazardRef(riskData.hazard);

              // Calculer le score de risque et le niveau de priorité
              const frequency = riskData.frequency || 1;
              const probability = riskData.probability || 1;
              const severity = riskData.severity || 1;
              const control = riskData.control || 1;
              const riskScore = frequency * probability * severity * control;

              let priorityLevel = 'faible';
              if (riskScore >= 50) {
                priorityLevel = 'prioritaire';
              } else if (riskScore >= 20) {
                priorityLevel = 'à_améliorer';
              }

              // Créer le RiskAssessment
              const riskAssessment = await ctx.prisma.riskAssessment.create({
                data: {
                  workUnitId,
                  hazardRefId,
                  dangerousSituation: riskData.dangerousSituation || riskData.hazard,
                  exposedPersons: riskData.exposedPersons || null,
                  frequency: Math.max(1, Math.min(5, frequency)),
                  probability: Math.max(1, Math.min(5, probability)),
                  severity: Math.max(1, Math.min(5, severity)),
                  control: Math.max(1, Math.min(5, control)),
                  riskScore,
                  priorityLevel,
                  existingMeasures: riskData.existingMeasures || null,
                },
              });

              stats.risks++;
              risksMap.set(`${riskData.workUnitName}-${riskData.hazard}`, riskAssessment.id);
            } catch (error) {
              stats.errors.push(`Erreur création risque "${riskData.hazard}": ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
            }
          }
        }

        // ============================================
        // 6. CRÉER LES PLANS D'ACTION
        // ============================================
        if (structure.measures && Array.isArray(structure.measures)) {
          // Vérifier le quota mensuel de plans d'action
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const currentPlansCount = await ctx.prisma.actionPlan.count({
            where: {
              workUnit: {
                site: {
                  company: { tenantId: ctx.tenantId },
                },
              },
              createdAt: {
                gte: monthStart,
              },
            },
          });

          const newPlansCount = structure.measures.length;
          if (planFeatures.maxPlansActionPerMonth !== Infinity) {
            if (currentPlansCount + newPlansCount > planFeatures.maxPlansActionPerMonth) {
              const { PLAN_ERROR_MESSAGES, getUpgradePlan } = await import('@/lib/plans');
              const upgradePlan = getUpgradePlan(userPlan);
              throw new TRPCError({
                code: 'FORBIDDEN',
                message: PLAN_ERROR_MESSAGES.limit_exceeded(
                  'plansAction',
                  currentPlansCount,
                  planFeatures.maxPlansActionPerMonth,
                  userPlan,
                  upgradePlan
                ),
              });
            }
          }

          // Créer les plans d'action
          for (const measureData of structure.measures) {
            if (!measureData.description) continue;

            // Associer à la première unité de travail disponible
            const firstWorkUnitId = Array.from(workUnitsMap.values())[0];
            if (!firstWorkUnitId) {
              stats.errors.push(`Plan d'action ignoré: aucune unité de travail disponible`);
              continue;
            }

            try {
              await ctx.prisma.actionPlan.create({
                data: {
                  workUnitId: firstWorkUnitId,
                  type: measureData.type || 'préventive',
                  description: measureData.description,
                  priority: 'moyenne',
                  status: 'à_faire',
                },
              });
              stats.actionPlans++;
            } catch (error) {
              stats.errors.push(`Erreur création plan d'action: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
            }
          }
        }

        // Mettre à jour le statut de l'import
        await ctx.prisma.duerpImport.update({
          where: { id: input.importId },
          data: {
            status: 'completed',
            validatedData: input.validatedData,
          },
        });

        return {
          success: true,
          message: 'Import validé et entités créées',
          stats: {
            companies: stats.companies,
            sites: stats.sites,
            workUnits: stats.workUnits,
            risks: stats.risks,
            actionPlans: stats.actionPlans,
            errors: stats.errors.length > 0 ? stats.errors : undefined,
          },
        };
      } catch (error) {
        // En cas d'erreur, mettre à jour le statut de l'import
        await ctx.prisma.duerpImport.update({
          where: { id: input.importId },
          data: {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Erreur inconnue lors de la création des entités',
          },
        });

        throw error;
      }
    }),

  /**
   * Enrichissement IA post-import (suggestions risques manquants, mesures, etc.)
   */
  enrichImport: authenticatedProcedure
    .input(z.object({ importId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const importRecord = await ctx.prisma.duerpImport.findFirst({
        where: {
          id: input.importId,
          tenantId: ctx.tenantId,
        },
      });

      if (!importRecord) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Import non trouvé',
        });
      }

      if (importRecord.status !== 'completed') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'L\'import doit être complété avant l\'enrichissement',
        });
      }

      const userPlan = (ctx.userProfile?.plan || 'free') as Plan;
      const planFeatures = PLAN_FEATURES[userPlan];

      // Vérifier le niveau d'extraction IA selon le plan
      if (planFeatures.hasImportIAExtraction === 'none') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'L\'enrichissement IA n\'est pas disponible dans votre plan',
        });
      }

      // Appeler service IA pour enrichissement
      try {
        const { enrichDuerpWithGPT4 } = await import('@/server/services/ai/openai-service');
        
        // Récupérer la structure validée
        const extractionData = importRecord.extractionData as any;
        const validatedData = importRecord.validatedData as any;
        const structure = validatedData?.structure || extractionData?.structure;
        if (!structure) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Aucune structure disponible pour l\'enrichissement',
          });
        }

        // Récupérer le secteur de l'entreprise si disponible
        const company = await ctx.prisma.company.findFirst({
          where: {
            tenantId: ctx.tenantId,
          },
          select: {
            id: true,
            sector: true,
          },
        });

        const enrichments = await enrichDuerpWithGPT4(
          structure,
          company?.sector || undefined,
          {
            tenantId: ctx.tenantId,
            userId: ctx.userId,
            companyId: company?.id,
          }
        );

        return {
          success: true,
          message: 'Enrichissement IA terminé',
          suggestions: enrichments,
        };
      } catch (error) {
        console.error('Erreur enrichissement IA:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erreur lors de l'enrichissement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        });
      }
    }),

  /**
   * Liste tous les imports du tenant
   */
  getAll: authenticatedProcedure
    .query(async ({ ctx }) => {
      const imports = await ctx.prisma.duerpImport.findMany({
        where: {
          tenantId: ctx.tenantId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          fileName: true,
          format: true,
          status: true,
          fileSize: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return imports;
    }),

  /**
   * Supprime un import
   */
  delete: authenticatedProcedure
    .input(z.object({ importId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const importRecord = await ctx.prisma.duerpImport.findFirst({
        where: {
          id: input.importId,
          tenantId: ctx.tenantId,
        },
      });

      if (!importRecord) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Import non trouvé',
        });
      }

      // Supprimer le fichier MinIO si existe
      if (importRecord.fileUrl) {
        try {
          // Extraire le chemin depuis l'URL (format: s3://bucket/path ou https://endpoint/bucket/path)
          let path = importRecord.fileUrl;
          if (path.startsWith('s3://')) {
            path = path.replace(`s3://${BUCKETS.IMPORTS}/`, '');
          } else if (path.includes(`/${BUCKETS.IMPORTS}/`)) {
            path = path.split(`/${BUCKETS.IMPORTS}/`)[1] || '';
          }

          if (path) {
            await minioService.deleteFile(BUCKETS.IMPORTS, path);
          }
        } catch (error) {
          console.error('[Imports] Erreur suppression MinIO:', error);
          // Continuer même si la suppression échoue
        }
      }

      await ctx.prisma.duerpImport.delete({
        where: { id: input.importId },
      });

      return { success: true };
    }),
});
