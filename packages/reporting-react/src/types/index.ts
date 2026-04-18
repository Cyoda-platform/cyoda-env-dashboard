/**
 * Reporting React - Type Definitions
 */

export interface ReportHistoryData {
  id: string;
  /**
   * Canonical name of the config run. Some older backend versions emit
   * `name` instead; both paths are handled at the component level.
   */
  configName: string;
  /** Legacy/alternate name field served by older backends. */
  name?: string;
  createTime: string;
  finishTime: string;
  type: string;
  /**
   * Embedded user record. When the backend can't resolve it (e.g. the
   * requesting principal isn't in the directory), only `userId` comes back.
   */
  user?: {
    username: string;
  };
  /** Fallback user identifier when `user` can't be resolved. */
  userId?: string;
  status: string;
  totalRowsCount: number;
  groupingColumns: string[];
  groupingVersion: string;
  hierarhyEnable: boolean;
  regroupingPossible: boolean;
}

export interface TableDataRow {
  id: string;
  groupingColumns: string[];
  groupingVersion: string;
  title: string;
  createDateTime: string;
  createDateTimeMkTime: string;
  config: string;
  type: string;
  user: string;
  status: string;
  execution: string;
  rows: string;
  totalRowsCount: number;
  hierarhyEnable: boolean;
  regroupingPossible: boolean;
}

export interface HistoryFilter {
  config: string;
  type: string;
  user: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export interface HistorySettings {
  lazyLoading: boolean;
  hideUnknownConfigs: boolean;
}

export interface ConfigDefinition {
  id?: string;
  description?: string;
  groupingVersion?: string;
  columns?: Array<{
    name: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

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

export interface ReportingReportRows {
  _embedded: {
    reportRows: Array<{
      content: Record<string, any>;
    }>;
  };
  page: {
    totalElements: number;
    [key: string]: any;
  };
}

export interface TableColumn {
  label: string;
  prop: string;
}

export interface QueryInfo {
  filters: string[];
  page: number;
  pageSize: number;
  type: string;
}


