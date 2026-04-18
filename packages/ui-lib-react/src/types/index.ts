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
  // The backend enumerates 'SIMPLE' and 'COMPLEX' today, but the field is
  // typed as plain `string` on the wire (http-api-react.AliasDef). Keep the
  // known values discoverable while permitting the looser on-wire shape.
  aliasType?: 'SIMPLE' | 'COMPLEX' | (string & {});
  /**
   * On the wire each path entry wraps a `colDef` object; the mapper class
   * and parameters sit alongside it at the top level of the entry.
   * `fullPath`/`colType` are retained at the top level for compatibility
   * with the legacy flat shape (pre-colDef refactor).
   */
  aliasPaths?: {
    '@bean'?: string;
    value: Array<{
      '@bean'?: string;
      colDef?: {
        fullPath: string;
        colType?: string;
        parts?: {
          '@meta'?: string;
          value: Array<{
            rootClass?: string;
            path?: string;
            type?: string;
          }>;
        };
      };
      mapperClass?: string;
      mapperParameters?: string;
      // Legacy flat fields (pre-colDef refactor); still written by some
      // older backends. Kept optional so both shapes type-check.
      fullPath?: string;
      colType?: string;
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

