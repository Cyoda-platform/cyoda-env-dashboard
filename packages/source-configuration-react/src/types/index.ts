/**
 * Source Configuration Types
 * Types for CSV, XML, and JDBC source configuration
 */

// File types supported
export type FileType = 'CSV' | 'XML' | 'JDBC';

// Column mapping configuration for CSV files
export interface CsvColumnMapping {
  csvColumnName: string;
  dstAliasName?: string;
  mapperClass?: string;
  mapperFormatParam?: string;
}

// Column mapping configuration for XML files
export interface XmlColumnMapping {
  xmlColumnName: string;
  xmlColumnXPath: string;
  dstAliasName?: string;
  mapperClass?: string;
  mapperFormatParam?: string;
}

// Column mapping configuration for JDBC sources
export interface JdbcColumnMapping {
  srcColumnName: string;
  srcColumnType: string;
  dstAliasName?: string;
  mapperClass?: string;
  mapperFormatParam?: string;
}

// Union type for all column mappings
export type ColumnMapping = CsvColumnMapping | XmlColumnMapping | JdbcColumnMapping;

// CSV Upload Configuration
export interface CsvUploadConfig {
  id?: string;
  name: string;
  fileType: 'CSV';
  columnMappingConfigs: CsvColumnMapping[];
  creationDate?: string;
  lastUpdateTime?: string;
  creatorUser?: string;
}

// XML Upload Configuration
export interface XmlUploadConfig {
  id?: string;
  name: string;
  fileType: 'XML';
  xmlBaseXPath: string;
  columnMappingConfigs: XmlColumnMapping[];
  creationDate?: string;
  lastUpdateTime?: string;
  creatorUser?: string;
}

// JDBC Source Configuration (Wolters Kluwer)
export interface JdbcSourceConfig {
  id?: string;
  name: string;
  srcSql: string;
  columnMappingConfigs: JdbcColumnMapping[];
  creationDate?: string;
  lastUpdateTime?: string;
  creatorUser?: string;
  // Connection details
  jdbcUrl?: string;
  username?: string;
  password?: string;
  driverClassName?: string;
}

// Union type for all upload configurations
export type UploadConfig = CsvUploadConfig | XmlUploadConfig | JdbcSourceConfig;

// Sample data for CSV preview
export interface CsvSampleData {
  columnNames: string[];
  rows: {
    columns: string[];
  }[];
}

// Mapper class information
export interface MapperInfo {
  className: string;
  displayName: string;
  description?: string;
  parameters?: string[];
}

// Alias/Catalog item
export interface CatalogItem {
  id: string;
  name: string;
  entityClass: string;
  description?: string;
}

// Upload file request
export interface UploadFileRequest {
  configId: string;
  file: File;
}

// JDBC connection test request
export interface JdbcConnectionTestRequest {
  jdbcUrl: string;
  username: string;
  password: string;
  driverClassName: string;
}

// JDBC connection test response
export interface JdbcConnectionTestResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// XML parsing options
export interface XmlParseOptions {
  baseXPath: string;
  columnXPaths: {
    name: string;
    xpath: string;
  }[];
}

// Store state for source configuration
export interface SourceConfigState {
  uploadConfigSampleUploadUrl: string;
  uploadFileUploadUrl: string;
}

// Filter form
export interface ConfigFilterForm {
  filter: string;
}

// Configuration history item
export interface ConfigHistoryItem {
  id: string;
  configId: string;
  version: number;
  updatedBy: string;
  updatedAt: string;
  changes: string;
}

// File upload progress
export interface FileUploadProgress {
  configId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

