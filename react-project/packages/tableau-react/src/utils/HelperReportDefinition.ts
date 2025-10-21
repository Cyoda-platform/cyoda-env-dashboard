/**
 * HelperReportDefinition Utility
 * Migrated from: .old_project/packages/http-api/src/helpers/HelperReportDefinition.ts
 */

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
  /**
   * Get default report definition structure
   */
  public static reportDefinition(): ReportDefinition {
    return {
      '@bean': '',
      description: '',
      requestClass: '',
      condition: {
        '@bean': '',
        operator: '',
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
   * Build column list from report definition colDefs and aliasDefs
   */
  public static buildCols(configDefinition: any): any[] {
    const SIMPLE_COLUMN = 'com.cyoda.core.reports.columns.ReportSimpleColumn';
    const ALIAS_COLUMN = 'com.cyoda.core.reports.columns.ReportAliasColumn';

    let cols: any[] = [];

    if (configDefinition && configDefinition.colDefs && configDefinition.colDefs.length > 0) {
      const colDefs = configDefinition.colDefs
        .filter((el: any) => el && el.fullPath) // Filter out null/undefined items
        .map((el: any) => {
          return {
            colType: 'colDef',
            alias: el.fullPath,
            name: el.fullPath,
            typeShort: el.colType.split('.').pop() || '',
            type: el.colType,
            '@bean': SIMPLE_COLUMN,
          };
        });
      cols = cols.concat(colDefs);
    }

    if (configDefinition && configDefinition.aliasDefs && configDefinition.aliasDefs.length > 0) {
      const aliasDefs = configDefinition.aliasDefs
        .filter((el: any) => el && el.name) // Filter out null/undefined items
        .map((el: any) => {
          return {
            colType: 'aliasDef',
            alias: el.name,
            name: el.name,
            typeShort: el.aliasType.split('.').pop() || '',
            type: el.aliasType,
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

