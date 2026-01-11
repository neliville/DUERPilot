import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CSVRow {
  category: string;
  label: string;
  description: string;
  examples: string;
  source: string;
  keywords: string;
  is_active: string;
  is_global: string;
  tenant_id: string;
  id: string;
  created_date: string;
  updated_date: string;
  created_by_id: string;
  created_by: string;
  is_sample: string;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function parseKeywords(keywordsStr: string): string[] {
  try {
    // Remove brackets and quotes, then split
    const cleaned = keywordsStr
      .replace(/^\[|\]$/g, '')
      .replace(/"/g, '')
      .trim();
    if (!cleaned) return [];
    return cleaned.split(',').map((k) => k.trim()).filter((k) => k.length > 0);
  } catch {
    return [];
  }
}

async function importHazardRefs() {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'HazardRef_export.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
      console.error('❌ Le fichier CSV est vide ou invalide');
      return;
    }

    const headers = parseCSVLine(lines[0]);
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) {
        console.warn(`⚠️  Ligne ${i + 1} ignorée (nombre de colonnes incorrect)`);
        continue;
      }

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row as CSVRow);
    }

    console.log(`📋 ${rows.length} lignes trouvées dans le CSV`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of rows) {
      try {
        // Vérifier si le danger existe déjà (par ID ou par shortLabel)
        const existing = await prisma.hazardRef.findFirst({
          where: {
            OR: [
              { id: row.id },
              { shortLabel: row.label, category: row.category },
            ],
          },
        });

        if (existing) {
          console.log(`⏭️  Danger déjà existant: ${row.label} (${row.category})`);
          skipped++;
          continue;
        }

        // Parser les keywords
        const keywords = parseKeywords(row.keywords);

        // Créer le danger
        await prisma.hazardRef.create({
          data: {
            id: row.id,
            category: row.category.toLowerCase(),
            shortLabel: row.label,
            description: row.description || null,
            examples: row.examples || null,
            keywords: keywords,
            normativeRefs: [], // Pas de données dans le CSV
            tenantId: row.tenant_id && row.tenant_id.trim() ? row.tenant_id : null,
            isCustom: row.is_global === 'true' ? false : true, // Inversé : is_global=true signifie danger global (isCustom=false)
          },
        });

        console.log(`✅ Importé: ${row.label} (${row.category})`);
        imported++;
      } catch (error: any) {
        console.error(`❌ Erreur lors de l'import de ${row.label}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Résumé de l\'import:');
    console.log(`   ✅ Importés: ${imported}`);
    console.log(`   ⏭️  Ignorés: ${skipped}`);
    console.log(`   ❌ Erreurs: ${errors}`);
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'import:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

importHazardRefs();

