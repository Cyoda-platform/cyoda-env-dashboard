/**
 * Shared Type Definitions
 * Report-related types used across multiple packages
 */

export interface ReportColumn {
  '@bean': string;
  name: string;
  alias?: string;
  type?: string;
  typeShort?: string;
  fullPath?: string;
  [key: string]: any;
}

// Column Definition
export interface ColDef {
  '@bean'?: string;
  fullPath: string;
  colType?: string;
  parts?: {
    '@meta': string;
    value: Array<{
      rootClass: string;
      path: string;
      type: string;
    }>;
  };
  [key: string]: any;
}

// Alias Definition
export interface AliasDef {
  '@bean'?: string;
  name: string;
  aliasType?: 'SIMPLE' | 'COMPLEX';
  aliasPaths?: {
    '@bean'?: string;
    value: Array<{
      '@bean'?: string;
      fullPath: string;
      colType?: string;
      mapperClass?: string;
      mapperParameters?: string;
    }>;
  };
  [key: string]: any;
}

export interface ReportDefinition {
  '@bean'?: string;
  id?: string;
  name?: string;
  description?: string;
  requestClass?: string;
  entityClass?: string;
  columns?: ReportColumn[];
  colDefs?: ColDef[];
  aliasDefs?: AliasDef[];
  sorting?: Array<{
    column: ReportColumn;
    reverse: boolean;
  }>;
  grouping?: ReportColumn[];
  summary?: Array<[ReportColumn, string[]]>;
  condition?: any;
  hierarhyEnable?: boolean;
  reportVersion?: number;
  singletonReport?: boolean;
  pointTime?: string;
  [key: string]: any;
}

