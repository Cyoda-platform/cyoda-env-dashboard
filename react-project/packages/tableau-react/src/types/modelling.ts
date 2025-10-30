/**
 * CyodaModelling Types
 * Type definitions for the modelling components
 */

export interface ReportingInfoRow {
  columnName: string;
  columnPath: string;
  type: string;
  declaredClass?: DeclaredClass;
  subClasses?: SubClass[];
  elementType?: ElementInfo;
  elementInfo?: ElementInfo;
  joinInfo?: JoinInfo;
}

export interface ElementInfo {
  columnPath: string;
  type: string;
  columnName?: string;
  declaredClass?: DeclaredClass;
  subClasses?: SubClass[];
  elementType?: ElementInfo;
  elementInfo?: ElementInfo;
}

export interface DeclaredClass {
  class: string;
  abstract: boolean;
}

export interface SubClass {
  class: string;
  abstract: boolean;
}

export interface JoinInfo {
  targetEntityClass: string;
  joinType: string;
}

export interface RequestParam {
  reportClass: string;
  columnPath: string;
  requestClass: string;
  types?: string[];
  baseColumnPath: string;
  key?: string | null;
}

export interface ColDef {
  fullPath: string;
  colType: string;
  parts?: any;
}

export interface ColDefValue {
  value: any;
  '@bean': string;
}

export interface RelatedPath {
  path: string;
  targetClass: string;
}

export interface AliasDef {
  name: string;
  aliasType: string;
  aliasPaths: {
    '@bean': string;
    value: AliasPath[];
  };
}

export interface AliasPath {
  colDef: ColDef;
  mapperClass: string;
  mapperParameters?: string;
}

export interface CatalogItem {
  id?: string;
  entityClass: string;
  name: string;
  description?: string;
  aliasDef: AliasDef;
}

export interface ModellingPopUpToggles {
  isCondenseThePaths: boolean;
  isOpenAllSelected: boolean;
}

export interface ModellingSearchResult {
  paths: string[];
}

