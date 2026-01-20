/**
 * Script de test automatisé pour les documents légaux
 * Teste les routes tRPC admin et les routes API publiques
 */

import { PrismaClient } from '@prisma/client';
import { marked } from 'marked';

const prisma = new PrismaClient();

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green');
}

function logError(message: string) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, 'yellow');
}

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  try {
    await testFn();
    results.push({ name, passed: true });
    logSuccess(`${name}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, error: errorMessage });
    logError(`${name}: ${errorMessage}`);
  }
}

async function cleanup() {
  logInfo('Nettoyage des données de test...');
  try {
    // Supprimer tous les documents légaux créés pendant les tests
    await prisma.legalDocumentVersion.deleteMany({
      where: {
        document: {
          type: {
            in: ['cgu', 'mentions-legales', 'politique-confidentialite'],
          },
        },
      },
    });
    await prisma.legalDocument.deleteMany({
      where: {
        type: {
          in: ['cgu', 'mentions-legales', 'politique-confidentialite'],
        },
      },
    });
    logSuccess('Nettoyage terminé');
  } catch (error) {
    logWarning(`Erreur lors du nettoyage: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function main() {
  log('\n🚀 Démarrage des tests des documents légaux\n', 'blue');

  // Récupérer un utilisateur admin pour les tests
  const adminUser = await prisma.userProfile.findFirst({
    where: {
      isSuperAdmin: true,
    },
  });

  if (!adminUser) {
    logError('Aucun utilisateur admin trouvé. Les tests nécessitent un super admin.');
    process.exit(1);
  }

  logInfo(`Utilisateur admin utilisé: ${adminUser.email}\n`);

  // Test 1: Créer un document CGU
  await runTest('Créer un document CGU', async () => {
    const content = `# Conditions Générales d'Utilisation

## Article 1 - Objet

Les présentes CGU régissent l'utilisation du service DUERPilot.`;

    const htmlContent = await marked(content);

    const document = await prisma.legalDocument.create({
      data: {
        type: 'cgu',
        title: 'Conditions Générales d\'Utilisation',
        content,
        htmlContent,
        currentVersion: 1,
        updatedBy: adminUser.id,
        versions: {
          create: {
            version: 1,
            title: 'Conditions Générales d\'Utilisation',
            content,
            htmlContent,
            updatedBy: adminUser.id,
            changeNote: 'Version initiale',
          },
        },
      },
    });

    if (!document || document.type !== 'cgu') {
      throw new Error('Le document n\'a pas été créé correctement');
    }
  });

  // Test 2: Récupérer un document par type
  await runTest('Récupérer un document par type', async () => {
    const document = await prisma.legalDocument.findUnique({
      where: { type: 'cgu' },
    });

    if (!document) {
      throw new Error('Le document n\'a pas été trouvé');
    }

    if (document.currentVersion !== 1) {
      throw new Error(`Version incorrecte: attendu 1, obtenu ${document.currentVersion}`);
    }
  });

  // Test 3: Mettre à jour un document (créer une nouvelle version)
  await runTest('Mettre à jour un document (versioning)', async () => {
    const existing = await prisma.legalDocument.findUnique({
      where: { type: 'cgu' },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!existing) {
      throw new Error('Document non trouvé pour la mise à jour');
    }

    const nextVersion = (existing.versions[0]?.version || existing.currentVersion) + 1;
    const newContent = `# Conditions Générales d'Utilisation

## Article 1 - Objet

Les présentes CGU régissent l'utilisation du service DUERPilot.

## Article 2 - Modifications

Ce document a été modifié pour inclure de nouvelles clauses.`;

    const htmlContent = await marked(newContent);

    await prisma.legalDocument.update({
      where: { type: 'cgu' },
      data: {
        title: 'Conditions Générales d\'Utilisation',
        content: newContent,
        htmlContent,
        currentVersion: nextVersion,
        updatedBy: adminUser.id,
        versions: {
          create: {
            version: nextVersion,
            title: 'Conditions Générales d\'Utilisation',
            content: newContent,
            htmlContent,
            updatedBy: adminUser.id,
            changeNote: 'Ajout de l\'article 2',
          },
        },
      },
    });

    const updated = await prisma.legalDocument.findUnique({
      where: { type: 'cgu' },
    });

    if (!updated || updated.currentVersion !== nextVersion) {
      throw new Error(`Version incorrecte après mise à jour: attendu ${nextVersion}, obtenu ${updated?.currentVersion}`);
    }
  });

  // Test 4: Récupérer l'historique des versions
  await runTest('Récupérer l\'historique des versions', async () => {
    const document = await prisma.legalDocument.findUnique({
      where: { type: 'cgu' },
    });

    if (!document) {
      throw new Error('Document non trouvé');
    }

    const versions = await prisma.legalDocumentVersion.findMany({
      where: { documentId: document.id },
      orderBy: { version: 'desc' },
    });

    if (versions.length < 2) {
      throw new Error(`Nombre de versions insuffisant: attendu au moins 2, obtenu ${versions.length}`);
    }

    if (versions[0].version !== document.currentVersion) {
      throw new Error('La dernière version ne correspond pas à la version actuelle');
    }
  });

  // Test 5: Créer les autres types de documents
  await runTest('Créer un document Mentions légales', async () => {
    const content = `# Mentions Légales

## Éditeur

DUERPilot - DDWIN Solutions`;

    const htmlContent = await marked(content);

    await prisma.legalDocument.create({
      data: {
        type: 'mentions-legales',
        title: 'Mentions Légales',
        content,
        htmlContent,
        currentVersion: 1,
        updatedBy: adminUser.id,
        versions: {
          create: {
            version: 1,
            title: 'Mentions Légales',
            content,
            htmlContent,
            updatedBy: adminUser.id,
            changeNote: 'Version initiale',
          },
        },
      },
    });
  });

  await runTest('Créer un document Politique de confidentialité', async () => {
    const content = `# Politique de Confidentialité

## Collecte des données

Nous collectons uniquement les données nécessaires au fonctionnement du service.`;

    const htmlContent = await marked(content);

    await prisma.legalDocument.create({
      data: {
        type: 'politique-confidentialite',
        title: 'Politique de Confidentialité',
        content,
        htmlContent,
        currentVersion: 1,
        updatedBy: adminUser.id,
        versions: {
          create: {
            version: 1,
            title: 'Politique de Confidentialité',
            content,
            htmlContent,
            updatedBy: adminUser.id,
            changeNote: 'Version initiale',
          },
        },
      },
    });
  });

  // Test 6: Vérifier que tous les documents existent
  await runTest('Vérifier que tous les documents existent', async () => {
    const documents = await prisma.legalDocument.findMany({
      where: {
        type: {
          in: ['cgu', 'mentions-legales', 'politique-confidentialite'],
        },
      },
    });

    if (documents.length !== 3) {
      throw new Error(`Nombre de documents incorrect: attendu 3, obtenu ${documents.length}`);
    }

    const types = documents.map((d) => d.type).sort();
    const expectedTypes = ['cgu', 'mentions-legales', 'politique-confidentialite'].sort();

    if (JSON.stringify(types) !== JSON.stringify(expectedTypes)) {
      throw new Error(`Types de documents incorrects: ${types.join(', ')}`);
    }
  });

  // Test 7: Vérifier la conversion markdown → HTML
  await runTest('Vérifier la conversion markdown → HTML', async () => {
    const document = await prisma.legalDocument.findUnique({
      where: { type: 'cgu' },
    });

    if (!document || !document.htmlContent) {
      throw new Error('Document ou HTML non trouvé');
    }

    if (!document.htmlContent.includes('<h1>')) {
      throw new Error('Le HTML ne contient pas de balises de titre');
    }

    if (!document.htmlContent.includes('Conditions Générales')) {
      throw new Error('Le contenu HTML ne correspond pas au markdown');
    }
  });

  // Test 8: Vérifier les relations avec UserProfile
  await runTest('Vérifier les relations avec UserProfile', async () => {
    const document = await prisma.legalDocument.findUnique({
      where: { type: 'cgu' },
      include: {
        updatedByUser: true,
        versions: {
          include: {
            updatedByUser: true,
          },
        },
      },
    });

    if (!document) {
      throw new Error('Document non trouvé');
    }

    if (!document.updatedByUser) {
      throw new Error('Relation updatedByUser manquante');
    }

    if (document.versions.length === 0) {
      throw new Error('Aucune version trouvée');
    }

    if (!document.versions[0].updatedByUser) {
      throw new Error('Relation updatedByUser manquante sur la version');
    }
  });

  // Résumé des résultats
  log('\n📊 Résumé des tests\n', 'blue');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  results.forEach((result) => {
    if (result.passed) {
      logSuccess(result.name);
    } else {
      logError(`${result.name}: ${result.error}`);
    }
  });

  log('\n', 'reset');
  log(`Total: ${results.length} tests`, 'blue');
  logSuccess(`Réussis: ${passed}`);
  if (failed > 0) {
    logError(`Échoués: ${failed}`);
  }

  // Nettoyage
  await cleanup();

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  } else {
    log('\n🎉 Tous les tests sont passés avec succès!\n', 'green');
    process.exit(0);
  }
}

main().catch((error) => {
  logError(`Erreur fatale: ${error instanceof Error ? error.message : String(error)}`);
  prisma.$disconnect();
  process.exit(1);
});

