/**
 * HelperReportDefinition Utility
 * Migrated from: .old_project/packages/http-api/src/helpers/HelperReportDefinition.ts
 */

import { HelperFormat } from '@cyoda/ui-lib-react';

export interface HistoryFilterForm {
  authors: string[];
  states: string[];
  types: string[];
  entities?: string[];
  time_custom: Date | null | string;
  search?: string;
  entityType: string;
  // Legacy fields for backward compatibility
  status?: string[];
  times?: string[];
}

export interface ReportDefinition {
  '@bean': string;
  description: string;
  requestClass: string;
  condition: {
    '@bean': string;
    operator: string;
    conditions: any[];
  };
  sorting: any[];
  grouping: any[];
  summary: any[];
  columns: any[];
  pointTime: string;
  colDefs: any[];
  aliasDefs: any[];
  valuationPointTime: string;
  singletonReport: boolean;
}

export default class HelperReportDefinition {
  // Column type constants
  public static SIMPLE_COLUMN = 'com.cyoda.core.reports.columns.ReportSimpleColumn';
  public static SIMPLE_COLUMN_SHORT = 'ReportSimpleColumn';
  public static ALIAS_COLUMN = 'com.cyoda.core.reports.columns.ReportAliasColumn';
  public static ALIAS_COLUMN_SHORT = 'ReportAliasColumn';

  /**
   * Get default report definition structure
   */
  public static reportDefinition(): ReportDefinition {
    return {
      '@bean': '',
      description: '',
      requestClass: '',
      condition: {
        '@bean': 'com.cyoda.core.conditions.GroupCondition',
        operator: 'AND',
        conditions: [],
      },
      sorting: [],
      grouping: [],
      summary: [],
      columns: [],
      pointTime: '2200-01-01T00:00:00.000+03:00',
      colDefs: [],
      aliasDefs: [],
      valuationPointTime: '2020-01-27T14:09:28.778+03:00',
      singletonReport: false,
    };
  }

  /**
   * Get default stream report definition structure
   */
  public static reportStreamDefinition(): any {
    return {
      '@bean': 'com.cyoda.core.streamdata.StreamDataConfigDef',
      streamDataDef: {
        requestClass: '',
        rangeOrder: 'ASC',
        rangeCondition: {
          '@bean': '',
          fieldName: '',
          operation: '',
          value: {
            '@type': '',
            value: '',
          },
        },
        condition: {
          '@bean': 'com.cyoda.core.conditions.GroupCondition',
          operator: 'OR',
          conditions: [],
        },
        columns: [],
        colDefs: [],
        aliasDefs: [],
      },
      name: '',
      id: '',
    };
  }

  /**
   * Expand short column names to full bean names when loading from server
   * This is needed because the server might return shortened names
   */
  public static expandColumnNames(configDefinition: any): any {
    let copyConfigDefinition = JSON.stringify(configDefinition);
    const reSimple = new RegExp(`"${this.SIMPLE_COLUMN_SHORT}"`, 'g');
    const reAlias = new RegExp(`"${this.ALIAS_COLUMN_SHORT}"`, 'g');
    copyConfigDefinition = copyConfigDefinition.replace(reSimple, `"${this.SIMPLE_COLUMN}"`);
    copyConfigDefinition = copyConfigDefinition.replace(reAlias, `"${this.ALIAS_COLUMN}"`);
    return JSON.parse(copyConfigDefinition);
  }

  /**
   * Validate report configuration definition
   * Recursively checks that all conditions have a @bean property
   */
  public static validateConfigDefinition(conditions: any[]): boolean {
    if (!conditions || !Array.isArray(conditions)) {
      return true;
    }

    for (const el of conditions) {
      if (!el['@bean']) {
        return false;
      }
      if (el.conditions) {
        if (!this.validateConfigDefinition(el.conditions)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Get default filter form for report history
   */
  public static reportHistoryDefaultFilter(): HistoryFilterForm {
    return {
      authors: [],
      states: [],
      types: [],
      entities: [],
      time_custom: null,
      search: '',
      entityType: 'BUSINESS',
      status: [],
      times: [],
    };
  }

  /**
   * Convert fullPath to short path by removing @class#name parts
   * Example: "changeLog.[*]@com#cyoda#tdb#model#metadata#ModelChangeLogEntry.changes.[*]"
   *       -> "changeLog.[*].changes.[*]"
   * @deprecated Use HelperFormat.shortNamePath instead
   */
  private static fullPathToShortPath(fullPath: string): string {
    return HelperFormat.shortNamePath(fullPath);
  }

  /**
   * Build column list from report definition colDefs and aliasDefs
   */
  public static buildCols(configDefinition: any): any[] {
    const SIMPLE_COLUMN = 'com.cyoda.core.reports.columns.ReportSimpleColumn';
    const ALIAS_COLUMN = 'com.cyoda.core.reports.columns.ReportAliasColumn';

    let cols: any[] = [];

    if (configDefinition && configDefinition.colDefs && configDefinition.colDefs.length > 0) {
      const colDefs = configDefinition.colDefs.map((el: any) => {
        // Handle colType - it might be a simple string like 'LEAF' or a Java class name
        const colTypeStr = el.colType || '';
        const typeShort = colTypeStr.includes('.') ? colTypeStr.split('.').pop() || '' : colTypeStr;

        // Convert fullPath to short path
        // fullPath: "changeLog.[*]@com#cyoda#tdb#model#metadata#ModelChangeLogEntry.changes.[*]"
        // shortPath: "changeLog.[*].changes.[*]"
        const aliasValue = this.fullPathToShortPath(el.fullPath);

        return {
          colType: 'colDef',
          alias: aliasValue,
          name: aliasValue,
          typeShort,
          type: colTypeStr,
          '@bean': SIMPLE_COLUMN,
        };
      });
      cols = cols.concat(colDefs);
    }

    if (configDefinition && configDefinition.aliasDefs && configDefinition.aliasDefs.length > 0) {
      const aliasDefs = configDefinition.aliasDefs.map((el: any) => {
        // Handle aliasType - it might be undefined or a Java class name
        const aliasTypeStr = el.aliasType || '';
        const typeShort = aliasTypeStr.includes('.') ? aliasTypeStr.split('.').pop() || '' : aliasTypeStr;

        return {
          colType: 'aliasDef',
          alias: el.name,
          name: el.name,
          typeShort,
          type: aliasTypeStr,
          '@bean': ALIAS_COLUMN,
        };
      });
      cols = cols.concat(aliasDefs);
    }

    return cols;
  }

  /**
   * Capitalize first letter of a string
   */
  public static capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Apply filters to report table data
   */
  public static applyFiltersForReportTables<T extends { name?: string; description?: string; username?: string; user?: string; entity?: string }>(
    tableData: T[],
    filterForm: { search?: string; authors?: string[]; entities?: string[] }
  ): T[] {
    let filtered = [...tableData];

    // Search by name or description
    if (filterForm.search) {
      const searchLower = filterForm.search.toLowerCase();
      filtered = filtered.filter((data) => {
        return (
          (data.name && data.name.toLowerCase().includes(searchLower)) ||
          (data.description && data.description.toLowerCase().includes(searchLower))
        );
      });
    }

    // Filter by authors
    if (filterForm.authors && filterForm.authors.length > 0) {
      filtered = filtered.filter((data) => {
        return filterForm.authors!.some(
          (author) => data.username === author || data.user === author
        );
      });
    }

    // Filter by entities
    if (filterForm.entities && filterForm.entities.length > 0) {
      filtered = filtered.filter((data) => {
        return filterForm.entities!.includes(data.entity || '');
      });
    }

    return filtered;
  }
}

