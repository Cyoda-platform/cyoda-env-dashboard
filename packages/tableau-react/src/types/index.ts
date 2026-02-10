/**
 * Tableau React - Type Definitions
 * Migrated from: .old_project/packages/tableau
 */

export interface ReportHistoryData {
  id: string;
  configName: string;
  createTime: string;
  finishTime: string;
  type: string;
  user: {
    username: string;
  };
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

// Tableau Web Data Connector types
export interface TableauColumn {
  id: string;
  alias: string;
  dataType: any; // tableau.dataTypeEnum.string
}

export interface TableauConnectionData {
  tableauColumns: TableauColumn[];
  tableauData: any[];
  tableauTableAlias: string;
}

// Window extension for Tableau
declare global {
  interface Window {
    tableau: {
      makeConnector: () => any;
      connectionData: string;
      connectionName: string;
      submit: () => void;
      dataTypeEnum: {
        string: any;
        int: any;
        float: any;
        bool: any;
        date: any;
        datetime: any;
      };
      registerConnector: (connector: any) => void;
    };
  }
}

export {};

