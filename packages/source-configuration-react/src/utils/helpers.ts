/**
 * Helper utilities for source configuration
 */

/**
 * Format date string to readable format
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

/**
 * Convert column name to valid property name
 * Removes special characters and spaces
 */
export const setColumnProp = (columnName: string): string => {
  return columnName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
};

/**
 * Extract mapper class display name from full class path
 */
export const getMapperDisplayName = (mapperClass: string): string => {
  if (!mapperClass) return '';
  const parts = mapperClass.split('$');
  return parts[parts.length - 1] || mapperClass;
};

/**
 * Validate XPath expression
 */
export const isValidXPath = (xpath: string): boolean => {
  if (!xpath) return false;
  // Basic XPath validation - starts with / or //
  return xpath.startsWith('/') || xpath.startsWith('//');
};

/**
 * Validate JDBC URL format
 */
export const isValidJdbcUrl = (url: string): boolean => {
  if (!url) return false;
  return url.startsWith('jdbc:');
};

/**
 * Parse XML to extract possible XPath options
 */
export const extractXPathOptions = (xmlData: any, prefix = ''): string[] => {
  const options: string[] = [];
  
  if (typeof xmlData !== 'object' || xmlData === null) {
    return options;
  }

  Object.keys(xmlData).forEach((key) => {
    const currentPath = prefix ? `${prefix}/${key}` : `/${key}`;
    options.push(currentPath);

    if (typeof xmlData[key] === 'object' && xmlData[key] !== null) {
      const nestedOptions = extractXPathOptions(xmlData[key], currentPath);
      options.push(...nestedOptions);
    }
  });

  return options;
};

/**
 * Generate sample CSV data structure
 */
export const generateSampleCsvData = (columnNames: string[], rows: string[][]): any[] => {
  return rows.map((row) => {
    const obj: any = {};
    columnNames.forEach((name, index) => {
      obj[setColumnProp(name)] = row[index] || '';
    });
    return obj;
  });
};

/**
 * Validate configuration before save
 */
export const validateConfig = (config: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.name || config.name.trim() === '') {
    errors.push('Configuration name is required');
  }

  if (!config.columnMappingConfigs || config.columnMappingConfigs.length === 0) {
    errors.push('At least one column mapping is required');
  }

  if (config.fileType === 'XML' && !config.xmlBaseXPath) {
    errors.push('Base XPath is required for XML configurations');
  }

  if ('srcSql' in config && !config.srcSql) {
    errors.push('SQL query is required for JDBC configurations');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

