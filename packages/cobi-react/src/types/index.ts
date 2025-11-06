/**
 * COBI Type Definitions
 * Types for Data Mapping, Data Source Configuration, and Data Chaining
 */

// ============================================================================
// Data Mapping Types
// ============================================================================

export type DataType = 'JSON' | 'XML' | 'BINARY_DOC' | 'CSV';

export interface MappingConfigDto {
  '@bean': 'com.cyoda.plugins.mapping.core.dtos.DataMappingConfigDto';
  id: string | null;
  sampleContent: string;
  dataType: DataType;
  name: string;
  description: string;
  entityMappings: EntityMappingConfigDto[];
  metadata: string;
  parserParameters: ParserParametersDto;
  virtual?: Virtual;
  lastUpdated?: number;
}

export interface EntityMappingConfigDto {
  id: EntityMappingIdDto;
  name: string;
  entityClass: string | null;
  entityRelationConfigs: ParentRelationConfigDto[];
  columns: ColumnMappingConfigDto[];
  functionalMappings: FunctionalMappingConfigDto[];
  columnPathsForUniqueCheck: string[];
  metadata: MetadataConfigDto[];
  entityFilter: any;
  // Custom fields
  isShowNoneMappingFields: boolean;
  isPolymorphicList: boolean;
  cobiCoreMetadata: CobiCoreMetadataConfigDto[];
  cobiPathsRelations: CobiPathsRelationsDto[];
  script: ScriptMappingConfigDto;
}

export interface ScriptMappingConfigDto {
  inputSrcPaths: string[];
  inputMetaPaths: string[];
  reusableScripts: string[];
  body: string;
}

export interface CobiPathsRelationsDto {
  jsonPath: string;
  srcColumnPath: string;
  dstColumnPath: string;
}

export interface CobiCoreMetadataConfigDto {
  name: string;
  dstCyodaColumnPath: string;
}

export interface EntityMappingIdDto {
  id: string | null;
  uiId: number | null;
}

export interface ParentRelationConfigDto {
  parentId?: EntityMappingIdDto;
  srcRelativeRootPath: string | null;
  currentEntityIdPath?: string | null;
  parentEntityIdPath?: string | null;
}

export interface ParserParametersDto {
  '@bean': 'com.cyoda.plugins.mapping.core.dtos.CSVParserParametersDto';
  withHeader: boolean;
  headers: string[];
  delimiter: string | null;
  quoteChar: string | null;
}

export interface FunctionalMappingConfigDto {
  '@bean': 'com.cyoda.plugins.mapping.core.dtos.functional.FunctionalMappingConfigDto';
  name: string | null;
  srcPaths: string[];
  statements: FunctionalStatementConfigDto[];
  dstPath: string;
  collectElemsSetModes: CollectionElementSetModeConfigDto[];
  metaPaths: string[];
}

export interface FunctionalStatementConfigDto {
  type: TypeFunctionalStatementConfigDto;
  variableName?: string;
  dstPath?: string;
  expression: FunctionalExpressionConfigDto;
  collectElemsSetModes: CollectionElementSetModeConfigDto[];
}

export interface FunctionalExpressionConfigDto {
  '@bean': string;
  value?: string;
  name?: string;
  functionClass?: string;
  variableName?: string;
  srcPath?: string;
  metaPath?: string;
  constantSource: 'INPUT' | 'DICTIONARY';
  args: FunctionalExpressionConfigDto[];
}

export type TypeFunctionalStatementConfigDto = 'ASSIGN_VAR' | 'RETURN' | 'SET_DST_VALUE';

export interface ColumnMappingConfigDto {
  srcColumnPath: string;
  dstCyodaColumnPath: string;
  transformer: {
    children: ValueTransformerConfigDto[];
    type: 'COMPOSITE' | 'SINGLE';
  };
  dstCyodaColumnPathType: string;
  dstCollectionElementSetModes: CollectionElementSetModeConfigDto[];
}

export interface CollectionElementSetModeConfigDto {
  type: CollectionElementSetModeConfigTypeDto;
  mergeConditionKey?: string;
}

export type CollectionElementSetModeConfigTypeDto = 'OVERRIDE' | 'APPEND' | 'MERGE';

export interface ValueTransformerConfigDto {
  type: string;
  transformerKey: string;
  parameters: any;
}

export interface MetadataConfigDto {
  name: string;
  dstCyodaColumnPath: string;
  dstCyodaColumnPathType: string;
  transformer: {
    children: ValueTransformerConfigDto[];
    type: 'COMPOSITE' | 'SINGLE';
  };
}

export interface CobiCoreMetadataParameterDto {
  displayName: string;
  name: string;
}

export interface CobiConfigVersionDto {
  '@bean': string;
  transactionId: string;
  timeId: string;
  userId: string;
}

// ============================================================================
// Data Source Configuration Types
// ============================================================================

export interface DataSourceConfigDto {
  '@bean': string;
  id: string | null;
  name: string;
  description: string;
  connections: HttpConnectionDetailsDto[] | SqlConnectionDetailsDto[];
  endpoints: HttpEndpointDto[] | SqlEndpointDto[];
  active: boolean;
  virtual?: Virtual;
  lastUpdated?: number;
}

export interface ConnectionDetailsDto {
  '@bean': string;
  name: string;
}

export interface HttpConnectionDetailsDto extends ConnectionDetailsDto {
  baseUrl?: string;
  authType?: string;
  proxyConfigurationKey?: string;
  headers?: { [key: string]: string };
  authConfig?: DataSourceAuthConfigDto;
}

export interface DataSourceAuthConfigDto {
  name: string;
  authOperationConfigs: DataSourceAuthOperationConfigDto[];
  numOfRetries: number;
  cacheConfig: DataSourceAuthCacheConfigDto;
}

export interface DataSourceAuthOperationConfigDto {
  authService: string;
  authServiceName: string;
  baseUrl: string;
  query: string;
  method: Method;
  bodyTemplate: string;
  headers: { [key: string]: string };
  parameters: HttpParameterDto[];
  dataSourceAuthRespConfig: DataSourceAuthRespConfigDto;
  connectionTimeout: number;
  readWriteTimeout: number;
  proxyConfigurationKey: string;
}

export interface DataSourceAuthRespConfigDto {
  '@bean': string;
  responseParser: string;
  responseParserName: string;
  responseParamToPathMap: { [key: string]: AuthRespParamPathDto };
}

export interface AuthRespParamPathDto {
  test: any;
}

export interface DataSourceAuthCacheConfigDto {
  ttl: number;
  persistCache: boolean;
}

export interface SqlConnectionDetailsDto extends ConnectionDetailsDto {
  jdbcUrl?: string;
  username?: string;
  password?: string;
  driverClassName?: string;
  connectionProperties?: { [key: string]: string };
}

export interface WorkflowConnectionDetailsDto extends ConnectionDetailsDto {
  entityClass?: string;
}

export interface EndpointDetailsDto {
  '@bean': string;
  operation?: string;
  connectionIndex?: number;
  consumerConfig?: {
    configId: string;
    consumerType: string;
  };
}

export interface HttpEndpointDto extends EndpointDetailsDto {
  type?: string;
  query?: string;
  cache: RequestCacheDetailsDto;
  method?: Method;
  chainings?: string[];
  parameters?: HttpParameterDto[];
  bodyTemplate?: string;
  connectionTimeout?: number | null | undefined;
  readWriteTimeout?: number | null | undefined;
}

export type WorkflowEndpointDto = EndpointDetailsDto;
export type BlobStorageEndpointDto = EndpointDetailsDto;

export interface RequestCacheDetailsDto {
  parameters: string[];
  ttl: null;
}

export interface SqlEndpointDto extends EndpointDetailsDto {
  operation?: string;
  query?: string;
  parameters?: SqlParameterDto[];
  chainings?: string[];
}

export type Method = 'GET' | 'POST_FORM' | 'POST_BODY';

export interface HttpParameterDto {
  type?: 'PATH_VARIABLE' | 'REQUEST_BODY_VARIABLE' | 'REQUEST_PARAM' | 'HEADER_PARAM' | 'TEMPLATE_VARIABLE';
  name?: string;
  required?: boolean;
  defaultValue?: string;
  secure?: boolean;
  excludeFromCacheKey?: boolean;
  template?: boolean;
  templateValue?: string;
  optionValues?: string[];
}

export interface SqlParameterDto {
  name?: string;
  defaultValue?: string;
  sqlType?: 'BOOLEAN' | 'INT' | 'DOUBLE' | 'STRING';
  secure?: boolean;
  isArray?: boolean;
}

export interface BlobStorageParameterDto {
  name?: string;
  required?: boolean;
  defaultValue?: string;
  secure?: boolean;
  template?: boolean;
  templateValue?: string;
}

export interface UserParameter {
  name: string;
  value: string;
  parameterType: string;
}

// ============================================================================
// Data Chaining Types
// ============================================================================

export interface ChainingConfigDto {
  '@bean': string;
  id: string | null;
  datasourceId: string;
  name: string;
  description: string;
  nextOperation: string;
  rootRelativePaths: { [key: string]: string };
  parameters: ChainingParameterDto[];
  virtual?: Virtual;
  lastUpdated?: number;
}

export interface ChainingParameterDto {
  nextOperationParameterName: string;
  srcRelativePath: string;
}

// ============================================================================
// Common Types
// ============================================================================

export interface Virtual {
  isVirtual: boolean;
  autoSaveKey?: string;
}

export interface Page {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

