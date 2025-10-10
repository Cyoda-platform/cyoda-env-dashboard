import type {Virtual} from "../Virtual";

export interface MappingConfigDto {
  "@bean": "com.cyoda.plugins.mapping.core.dtos.DataMappingConfigDto";
  id: string | null;
  sampleContent: string;
  dataType: "JSON" | "XML" | "BINARY_DOC" | "CSV";
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
  columnPathsForUniqueCheck: [];
  metadata: MetadateConfigDto[];
  entityFilter: any;

  // parentEntityClass: string | null;
  // Custom
  isShowNoneMappingFields: boolean;
  isPolymorphicList: boolean;
  cobiCoreMetadata: CobiCoreMetadateConfigDto[];
  cobiPathsRelations: CobiPathsRelationsDto[];
  script: ScriptMappingConfigDto;
}

export interface ScriptMappingConfigDto{
  inputSrcPaths: string[];
  inputMetaPaths: string[];
  reusableScripts: string[];
  body: string;
}

export interface  CobiPathsRelationsDto{
  jsonPath: string;
  srcColumnPath: string;
  dstColumnPath: string;
}

export interface CobiCoreMetadateConfigDto {
  name: string;
  dstCyodaColumnPath: string;
}

export interface EntityMappingIdDto {
  id: string;
  uiId: number | null;
}

export interface ParentRelationConfigDto {
  parentId: EntityMappingIdDto;
  srcRelativeRootPath: string | null;
  currentEntityIdPath: string | null;
  parentEntityIdPath: string | null;
}

export interface ParserParametersDto {
  "@bean": "com.cyoda.plugins.mapping.core.dtos.CSVParserParametersDto";
  withHeader: boolean;
  headers: string[];
  delimiter: string | null;
  quoteChar: string | null;
}

export interface FunctionalMappingConfigDto {
  "@bean": "com.cyoda.plugins.mapping.core.dtos.functional.FunctionalMappingConfigDto";
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
  "@bean": string;
  value?: string;
  name?: string;
  functionClass?: string;
  variableName?: string;
  srcPath?: string;
  metaPath?: string;
  constantSource:  "INPUT"| "DICTIONARY";
  args: FunctionalExpressionConfigDto[];
}

export type TypeFunctionalStatementConfigDto = "ASSIGN_VAR" | "RETURN" | "SET_DST_VALUE";

export interface ColumnMappingConfigDto {
  srcColumnPath: string;
  dstCyodaColumnPath: string;
  transformer: {
    children: ValueTransformerConfigDto[];
    type: "COMPOSITE" | "SINGLE";
  };
  dstCyodaColumnPathType: string;
  dstCollectionElementSetModes: CollectionElementSetModeConfigDto[];
}

export interface CollectionElementSetModeConfigDto {
  type: CollectionElementSetModeConfigTypeDto;
  mergeConditionKey?: string;
}

export type CollectionElementSetModeConfigTypeDto = "OVERRIDE" | "APPEND" | "MERGE";

export interface ValueTransformerConfigDto {
  type: string;
  transformerKey: string;
  parameters: any;
}

export interface MetadateConfigDto {
  name: string;
  dstCyodaColumnPath: string;
  dstCyodaColumnPathType: string;
  transformer: {
    children: ValueTransformerConfigDto[];
    type: "COMPOSITE" | "SINGLE";
  };
}

export interface CobiCoreMetadataParameterDto {
  displayName: string;
  name: string;
}

export interface CobiConfigVersionDto {
  "@bean": string;
  transactionId: string;
  timeId: string;
  userId: string;
}
