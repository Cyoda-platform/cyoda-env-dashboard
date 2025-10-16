/**
 * Content Helper
 * Utilities for parsing and formatting content (CSV, XML, JSON)
 */

import { parse as csvParse } from 'csv-parse/sync';
import { stringify as csvStringify } from 'csv-stringify/sync';
import type { MappingConfigDto } from '../types';

/**
 * Parse CSV content
 */
export function parseCsv(config: MappingConfigDto): any[] {
  if (!config.sampleContent) return [];

  try {
    const params = config.parserParameters || {};
    const delimiter = params.delimiter || ',';
    const quoteChar = params.quoteChar || '"';
    const withHeader = params.withHeader !== false;

    const records = csvParse(config.sampleContent, {
      delimiter,
      quote: quoteChar,
      columns: withHeader,
      skip_empty_lines: true,
      relax_column_count: true,
    });

    return records;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
}

/**
 * Stringify CSV content
 */
export function stringifyCsv(config: MappingConfigDto, data: any[]): string {
  if (!data || data.length === 0) return '';

  try {
    const params = config.parserParameters || {};
    const delimiter = params.delimiter || ',';
    const quoteChar = params.quoteChar || '"';
    const withHeader = params.withHeader !== false;

    return csvStringify(data, {
      delimiter,
      quote: quoteChar,
      header: withHeader,
    });
  } catch (error) {
    console.error('Error stringifying CSV:', error);
    return '';
  }
}

/**
 * Validate CSV parsing
 */
export function validateCsv(config: MappingConfigDto): { valid: boolean; error?: string } {
  try {
    const data = parseCsv(config);
    if (!data || data.length === 0) {
      return { valid: false, error: 'No data parsed from CSV' };
    }
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

/**
 * Get CSV preview rows
 */
export function getCsvPreviewRows(content: string, maxRows: number = 5): string[] {
  if (!content) return [];
  return content.split('\n').slice(0, maxRows);
}

/**
 * Get CSV headers
 */
export function getCsvHeaders(config: MappingConfigDto): string[] {
  const data = parseCsv(config);
  if (!data || data.length === 0) return [];

  const firstRow = data[0];
  if (typeof firstRow === 'object') {
    return Object.keys(firstRow);
  }

  return [];
}

/**
 * Detect delimiter from content
 */
export function detectDelimiter(content: string): string {
  if (!content) return ',';

  const firstLine = content.split('\n')[0];
  const delimiters = [',', ';', '\t', '|'];
  const counts = delimiters.map((d) => ({
    delimiter: d,
    count: (firstLine.match(new RegExp(`\\${d}`, 'g')) || []).length,
  }));

  const max = counts.reduce((prev, current) => (current.count > prev.count ? current : prev));
  return max.count > 0 ? max.delimiter : ',';
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * Download file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get source data from sample content
 * Parses content based on data type (JSON, XML, CSV)
 */
export function getSourceData(sampleContent: string, dataMappingConfig: MappingConfigDto): any {
  if (!sampleContent || sampleContent.length === 0) {
    return {};
  }

  const dataType = dataMappingConfig.dataType;

  // Handle JSON
  if (dataType === 'JSON' || dataType === 'BINARY_DOC') {
    try {
      return JSON.parse(sampleContent);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return {};
    }
  }

  // Handle XML
  if (dataType === 'XML') {
    // For now, return empty object - XML parsing would require fast-xml-parser
    console.warn('XML parsing not yet implemented');
    return {};
  }

  // Handle CSV
  if (dataType === 'CSV') {
    const jsonArr = parseCsv(dataMappingConfig);
    const headers = dataMappingConfig.parserParameters?.headers || [];

    if (headers.length === 0) {
      return jsonArr;
    }

    // Remap headers if custom headers are provided
    const newJsonArr: any[] = [];
    jsonArr.forEach((row: any) => {
      const newRow: any = {};
      Object.keys(row).forEach((oldKey, index) => {
        const newKey = headers[index] || oldKey;
        newRow[newKey] = row[oldKey];
      });
      newJsonArr.push(newRow);
    });

    return newJsonArr;
  }

  return {};
}

