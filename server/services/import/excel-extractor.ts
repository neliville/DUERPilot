/**
 * Service d'extraction de contenu depuis fichiers Excel (.xlsx, .xls) et CSV
 */

import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';

export interface ExcelExtractionResult {
  sheets: Array<{
    name: string;
    data: any[][]; // Tableau 2D : lignes × colonnes
    headers?: string[]; // Première ligne si détectée comme en-têtes
  }>;
  metadata: {
    sheetCount: number;
    totalRows: number;
  };
}

export interface CSVExtractionResult {
  data: any[][];
  headers?: string[];
  metadata: {
    rows: number;
    columns: number;
  };
}

/**
 * Extrait les données d'un fichier Excel (.xlsx, .xls)
 */
export async function extractExcelData(buffer: Buffer): Promise<ExcelExtractionResult> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    const sheets: ExcelExtractionResult['sheets'] = [];
    let totalRows = 0;

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
      
      // Convertir en tableau 2D
      const data = jsonData as any[][];
      
      // Détecter les en-têtes (première ligne non vide)
      let headers: string[] | undefined;
      if (data.length > 0 && data[0] && Array.isArray(data[0])) {
        const firstRow = data[0];
        // Si la première ligne contient principalement des strings, c'est probablement des en-têtes
        const hasHeaders = firstRow.some((cell: any) => typeof cell === 'string' && cell.trim().length > 0);
        if (hasHeaders) {
          headers = firstRow.map((cell: any) => String(cell || ''));
        }
      }

      sheets.push({
        name: sheetName,
        data,
        headers,
      });

      totalRows += data.length;
    });

    return {
      sheets,
      metadata: {
        sheetCount: workbook.SheetNames.length,
        totalRows,
      },
    };
  } catch (error) {
    throw new Error(`Erreur lors de l'extraction Excel: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Extrait les données d'un fichier CSV
 */
export async function extractCSVData(buffer: Buffer, encoding: BufferEncoding = 'utf-8'): Promise<CSVExtractionResult> {
  try {
    const text = buffer.toString(encoding);
    
    // Parser le CSV
    const records = parse(text, {
      columns: false, // On veut un tableau 2D, pas d'objets
      skip_empty_lines: true,
      relax_quotes: true,
      trim: true,
    }) as any[][];

    // Détecter les en-têtes (première ligne)
    let headers: string[] | undefined;
    if (records.length > 0 && records[0]) {
      const firstRow = records[0];
      const hasHeaders = firstRow.some((cell: any) => typeof cell === 'string' && cell.trim().length > 0);
      if (hasHeaders) {
        headers = firstRow.map((cell: any) => String(cell || ''));
      }
    }

    return {
      data: records,
      headers,
      metadata: {
        rows: records.length,
        columns: records.length > 0 ? records[0].length : 0,
      },
    };
  } catch (error) {
    throw new Error(`Erreur lors de l'extraction CSV: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

