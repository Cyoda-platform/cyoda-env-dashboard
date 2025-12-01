/**
 * Type definitions for Cyoda API
 * Migrated from @cyoda/ui-lib/src/types/types.ts
 */

// ============================================================================
// Common Types
// ============================================================================

export interface ItemAPILink {
  hreflang?: null;
  title?: string | null;
  type?: 'GET' | 'POST';
  deprecation?: null;
}

export interface Link {
  href: string;
  title: string;
  type: string;
}

export interface Page {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

// ============================================================================
// Report Types
// ============================================================================

type ItemHistoryKey = '/report/{id}/stats' | '/report/{id}/config' | '/report/{id}/groups';

export interface ItemHistory {
  reportHistoryFields: ReportHistoryFields;
  _links?: {
    [key in ItemHistoryKey]: Link;
  };
}

export interface ReportHistoryFields {
  configName: string;
  createTime: string;
  finishTime: string;
  id: string;
  groupingVersion: string;
  reportFailed: boolean;
  type: string;
  userId: string;
  user?: {
    username: string;
  };
  description: string;
  status: string;
  reportFailedShards: {
    [key: number]: string;
  };
  hierarhyEnable: boolean;
  regroupingPossible: boolean;
  groupingColumns: string[];
  reportId: string;
  totalRowsCount: string;
}

export interface ReportHistory {
  page: Page;
  _embedded: {
    itemHistories: ItemHistory[];
  };
  _links?: any;
}

export interface IReportStats {
  id: string;
  createTime: string;
  finishTime: string;
  reportFailed: boolean;
  secondPhaseFinished: boolean;
  groupsCount: number;
  totalRowsCount: number;
  markedAsCancelled: boolean;
  rowsCountForFinishedShards?: any;
  reportFailedShards?: any;
  user: string;
  configName: string;
  gridConfigId?: any;
  version?: any;
  pointTime: string;
  valuationPointTime: string;
  description?: any;
  _links?: any;
}

export interface IReportStatus {
  content: {
    status: 'STARTED' | 'RUNNING' | 'SUCCESSFUL' | 'CANCELLED' | 'FAILED';
    startTime: string;
    finishTime?: string;
    duration?: string;
  };
  _links?: any;
}

export interface ReportingTypes {
  page: Page;
  _embedded: {
    strings: ReportingTypesEmbeddedStrings[];
  };
}

export interface ReportingTypesEmbeddedStrings {
  content: string;
  _links: {
    '/history': {
      href: string;
      templated: boolean;
      title: string;
      type: string;
    };
  };
}

export interface ReportColumn {
  '@bean': string;
  name: string;
}

export interface ReportGroup {
  id: string;
  name: string;
  rowsCount: number;
  _links?: any;
}

export interface ReportDefinition {
  id: string;
  description: string;
  type: string;
  user: string;
  _links?: any;
}

export interface ReportMapper {
  shortName: string;
  mapperClass: string;
  inType: string;
  outType: string;
  entityClass: string;
  parametrized: boolean;
  decision: string;
}

export interface NamedParameter {
  '@bean': string;
  name: string;
  value: string;
  parameterType: string;
  oldName?: string;
}

export interface MapperParameters {
  '@bean': string;
  parameters: {
    [key: string]: NamedParameter;
  };
}

export type ReportingReportStatus = 'STARTED' | 'RUNNING' | 'SUCCESSFUL' | 'CANCELLED' | 'FAILED';

// ============================================================================
// Definition Types
// ============================================================================

export interface IDefinition {
  content: IDefinitionContent;
  _links?: any;
}

export interface IDefinitionContent {
  '@bean': string;
  description: string;
  hierarhyEnable?: boolean;
  reportVersion?: number;
  requestClass: string;
  condition: IDefinitionContentConditionGroup;
  sorting: IDefinitionContentSorting[];
  grouping: ReportColumn[];
  summary: Array<[ReportColumn, string[]]>;
  columns: IDefinitionColumn[];
  pointTime: string;
  valuations: any[];
  valuationPointTime: string;
  aliases: {
    [index: string]: AliasDefinition;
  };
  colDefs: ColDef[];
  aliasDefs: AliasDef[];
  singletonReport: boolean;
}

export interface IDefinitionColumn {
  '@bean'?: string;
  name: string;
  id?: string;
  dataType?: string;
  type?: string;
  rangeField?: boolean;
  parts?: {
    '@meta': string;
    value: any[];
  };
  withRelatedObjects?: boolean;
}

export interface IDefinitionContentCondition {
  '@bean': string;
  fieldName: string;
  operation: string;
  from?: IDefinitionContentConditionValue;
  to?: IDefinitionContentConditionValue;
  value?: IDefinitionContentConditionValue | string;
}

export interface IDefinitionContentConditionGroup {
  '@bean': string;
  operator: string;
  conditions?: Array<IDefinitionContentCondition | IDefinitionContentConditionGroup>;
}

export interface IDefinitionContentConditionValue {
  '@type': string;
  value: any;
}

export interface IDefinitionContentSorting {
  column: ReportColumn;
  reverse: boolean;
}

export type SummaryType = 'MAX' | 'MIN' | 'COUNT' | 'COUNT_UNIQUE' | 'SUM' | 'AVG' | '';

// ============================================================================
// Stream Types
// ============================================================================

export interface IDefinitionStream {
  '@bean'?: string;
  createDate?: string;
  description: string;
  id?: string;
  name: string;
  owner?: string;
  streamDataDef: StreamDataDef;
}

export interface StreamDataDef {
  aliasDefs: AliasDef[];
  colDefs: ColDef[];
  columns: IDefinitionColumn[];
  condition: IDefinitionContentConditionGroup;
  rangeCondition: IDefinitionContentCondition;
  rangeOrder: 'ASC' | 'DESC';
  requestClass: string;
}

export interface IDefinitionContentStream {
  '@bean'?: string;
  description?: string;
  requestClass: string;
  condition: IDefinitionContentConditionGroup;
  rangeCondition: IDefinitionContentCondition;
  rangeOrder: 'ASC' | 'DESC';
  columns: IDefinitionColumn[];
  pointTime?: string;
  valuations?: any[];
  valuationPointTime?: string;
  aliases?: {
    [index: string]: AliasDefinition;
  };
  colDefs: ColDef[];
  aliasDefs: AliasDef[];
}

export interface IDefinitionContentStreamRequest {
  '@bean': string;
  pointTime: number | null;
  offset: number;
  length: number;
  fromPosIndex: number;
  sdDef: IDefinitionContentStream;
}

export interface IDefinitionContentStreamResult {
  lastRowIndexPosition: number;
  offset: number;
  pageSize: number;
  pointTime: number;
  rows: Array<{
    columnsValues: {
      [key: string]: string;
    };
  }>;
}

export interface StreamDefinitionsIndex {
  [key: string]: IDefinitionStream;
}

// ============================================================================
// Alias & Column Types
// ============================================================================

export interface ColDef {
  fullPath: string;
  parts: {
    '@meta': string;
    value: ColDefValue[];
  };
  colType: string;
}

export interface ColDefValue {
  rootClass: string;
  path: string;
  type: string;
}

export interface AliasDef {
  name: string;
  aliasPaths: {
    '@meta': string;
    value: AliasDefColDef[];
  };
  aliasType: string;
}

export interface AliasDefColDef {
  colDef: ColDef;
  mapperClass: string;
  mapperParameters?: string;
}

export interface AliasDefinition {
  type: string;
  paths: AliasPath[];
}

export interface AliasPath {
  name: string;
  path: string;
  type: string;
  mapperClass: string;
}

// ============================================================================
// Entity Types
// ============================================================================

export interface Entity {
  columnInfo: ColumnInfo;
  value: string;
  type: string;
  decision: string;
  presented?: boolean;
}

export interface EntityRequest {
  entityClass: string;
  entityId: string;
  transition: string;
  transactional: boolean;
  async: boolean;
  values: EntityValueRequest[];
}

export interface EntityValueRequest {
  columnPath: string;
  value: string | number;
}

export interface EntityViewerEntity {
  from: string;
  to: string;
}

export interface ColumnInfo {
  [key: string]: any;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  legalEntityId: string;
  userId: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  username: string;
  userId: string;
  legalEntityId: string;
}

// ============================================================================
// Transaction Types
// ============================================================================

export interface Transaction {
  id: string;
  timestamp: number;
  username: string;
  entityClass: string;
  entityId: string;
  transition: string;
  _links?: any;
}

export interface TransactionDiff {
  columnPath: string;
  oldValue: any;
  newValue: any;
  type: string;
}

// ============================================================================
// Catalog Types
// ============================================================================

export interface CatalogItem {
  '@bean'?: string;
  aliasDef: AliasDef;
  createDate?: string;
  desc: string;
  entityClass: string;
  id?: string;
  state?: string;
  user?: string;
  name: string;
}

export interface CatalogItemExportImportContainer {
  '@bean'?: string;
  aliases: CatalogItem[];
}

// ============================================================================
// System Types
// ============================================================================

export interface ServerInfo {
  version: string;
  buildTime: string;
  gitCommit: string;
}

export interface VersionPlatform {
  version: string;
  buildTime: string;
}

export interface VersionClient {
  version: string;
  buildTime: string;
}

export interface NodeInfo {
  name: string;
  host: string;
  ip: string;
  version: string;
}

export interface ClusterState {
  clusterName: string;
  status: string;
  numberOfNodes: number;
  numberOfDataNodes: number;
  activePrimaryShards: number;
  activeShards: number;
  relocatingShards: number;
  initializingShards: number;
  unassignedShards: number;
}

export interface ShardsDistr {
  [key: string]: any;
}

export interface IndexConfiguration {
  [key: string]: any;
}

export interface Cache {
  [key: string]: any;
}

// ============================================================================
// Related Path Types
// ============================================================================

export interface RelatedPath {
  columnPath: string;
  decision: string;
  targetEntityClass: string;
}

// ============================================================================
// Reporting Info Types (for Entity Viewer)
// ============================================================================

export interface ReportingInfoRow {
  columnName: string;
  columnPath: string;
  columnType: string;
  elementType?: string;
  elementInfo?: string;
  joinInfo?: JoinInfo;
  subClasses?: SubClass[];
  abstract?: boolean;
}

export interface JoinInfo {
  targetEntityClass: string;
  cardinality: string;
}

export interface SubClass {
  class: string;
  abstract: boolean;
}

export interface RequestParam {
  reportClass: string;
  columnPath: string;
  requestClass: string;
  types: string[];
  baseColumnPath: string;
  key: string | null;
}

// ============================================================================
// Transfer Types
// ============================================================================

export interface TransferOption {
  label: string;
  key: string;
  type: SummaryType;
  options?: Array<{
    label: string;
    key: string;
  }>;
}

// ============================================================================
// API Query Parameter Types
// ============================================================================

export interface IGetDefinitionsQueryParams {
  user?: string;
  fields?: Array<'id' | 'description' | 'type' | 'user'>;
  size?: number;
}

export interface IGetDefinitionsArgs {
  pageUrl?: string;
  params: IGetDefinitionsQueryParams;
}

export interface IGetReportTypesArgs {
  pageUrl?: string;
  params: IGetReportTypesQueryParams;
}

export interface IGetReportTypesQueryParams {
  size?: number;
}

export interface IGetHistoryArgs {
  pageUrl?: string;
  params: IGetHistoryQueryParams;
}

export interface IGetHistoryQueryParams {
  username?: string;
  type?: string;
  fields?: string;
  size?: number;
  page?: number;
  sort?: string;
}

export interface IGetGroupsPathParams {
  reportId: string;
}

