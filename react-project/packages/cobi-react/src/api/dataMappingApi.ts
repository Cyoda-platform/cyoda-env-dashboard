/**
 * Data Mapping API
 * API endpoints for data mapping operations
 * 
 * Migrated from: .old_project/packages/cobi/src/stores/platform-mapping.ts
 */

import axios from './axios';
import type { MappingConfigDto } from '../types';

/**
 * Get test endpoint
 */
export function getTest() {
  return axios.get('/platform-mapping-plugin/config/test');
}

/**
 * Get list of all data types
 */
export function getListAllDataTypes() {
  return axios.get('/platform-mapping-plugin/config/list-all-datatypes');
}

/**
 * Get list of all transformers
 */
export function getListAllTransformers() {
  return axios.get('/platform-mapping-plugin/config/list-all-transformers');
}

/**
 * Get list of all dictionaries
 */
export function getListAllDictionaries() {
  return axios.get('/platform-mapping-plugin/config/dictionaries');
}

/**
 * Get list of all data mappings
 */
export function getListAllDataMappings(withSampleContent = true) {
  return axios.get(`/platform-mapping-plugin/config/list-all-data-mappings?withSampleContent=${withSampleContent}`);
}

/**
 * Get test data mapping
 */
export function getTestDataMapping() {
  return axios.get('/platform-mapping-plugin/config/test-data-mapping');
}

/**
 * Get data mapping by ID
 */
export function getDataMapping(id: string) {
  return axios.get(`/platform-mapping-plugin/config/get-data-mapping/${id}`);
}

/**
 * Save data mapping
 */
export function postSave(data: MappingConfigDto) {
  return axios.post('/platform-mapping-plugin/config/save', data);
}

/**
 * Dry run data mapping
 */
export function dryRun(data: MappingConfigDto) {
  return axios.post('/platform-mapping-plugin/config/dry-run', data);
}

/**
 * Get list of all functions
 */
export function getListAllFunctions() {
  return axios.get('/platform-mapping-plugin/config/list-all-functions');
}

/**
 * Get list of function examples
 */
export function getListExamplesFunctions() {
  return axios.get('/platform-mapping-plugin/config/list-examples');
}

/**
 * Delete data mapping by ID
 */
export function deleteDataMapping(id: string) {
  return axios.delete(`/platform-mapping-plugin/config/delete-data-mapping/${id}`);
}

/**
 * Alias for getDataMapping (for consistency with other APIs)
 */
export function getById(id: string) {
  return getDataMapping(id);
}

/**
 * Alias for deleteDataMapping (for consistency with other APIs)
 */
export function deleteById(id: string) {
  return deleteDataMapping(id);
}

/**
 * Get entity info
 */
export function getEntityInfo(entityClass: string) {
  return axios.get(`/platform-api/entity-info/fetch?rootClass=${encodeURIComponent(entityClass)}`);
}

/**
 * Get reporting info (entity fields and types)
 */
export function getReportingInfo(
  entityClass: string,
  parentFldClass?: string,
  columnPath?: string,
  onlyRange?: boolean
) {
  const params: any = { entityClass };
  if (parentFldClass) params.parentFldClass = encodeURIComponent(parentFldClass);
  if (columnPath) params.columnPath = encodeURIComponent(columnPath);
  if (onlyRange) params.onlyRange = onlyRange;

  const query = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return axios.get(`/platform-api/entity-info/info?${query}`);
}

/**
 * Get column definitions
 */
export function getCriteriaDefs(params: { rootClass: string; colPaths: string[] }) {
  const colPaths = params.colPaths
    .map((el) => `colPath=${encodeURIComponent(el)}`)
    .join('&');
  return axios.get(`/platform-api/entity-info/fetch/coldefs?rootClass=${params.rootClass}&${colPaths}`);
}

/**
 * Get list of all COBI meta parameters
 */
export function getListAllCobiMetaParams() {
  return axios.get('/platform-mapping-plugin/config/list-all-cobi-meta-params');
}

/**
 * Get history of data mapping
 */
export function getHistory(id: string) {
  return axios.get(`/platform-mapping-plugin/config/get-data-mapping/${id}/history`);
}

/**
 * Get history by time UID
 */
export function getHistoryByTimeUid(params: { id: string; timeId: string }) {
  return axios.get(`/platform-mapping-plugin/config/get-data-mapping/${params.id}/history/${params.timeId}`);
}

/**
 * Export all COBI configurations
 */
export function exportAllCobi() {
  return axios.get('/platform-mapping-plugin/config/export-all-cobi');
}

/**
 * Export COBI for specific keys
 */
export function exportCobiForKeys(data: any) {
  return axios.post('/platform-mapping-plugin/config/export-cobi-for-keys', data);
}

/**
 * Import COBI configuration
 */
export function importCobiConfig(params: { data: any; params?: any }) {
  return axios.post('/platform-mapping-plugin/config/import-cobi-config', params.data, {
    params: params.params,
  });
}

/**
 * Get entity classes
 */
export function getEntityClasses() {
  return axios.get('/platform-api/entity/classes');
}

/**
 * Get entity schema
 */
export function getEntitySchema(entityClass: string) {
  return axios.get(`/platform-api/entity/${entityClass}/schema`);
}

/**
 * Parse sample content
 */
export function parseSampleContent(data: { dataType: string; content: string; parserParameters?: any }) {
  return axios.post('/platform-mapping-plugin/config/parse-sample-content', data);
}

/**
 * Hook to use data mapping API
 */
export function useDataMappingApi() {
  return {
    getListAllDataMappings,
    getListAllFunctions,
    getListAllTransformers,
    getListAllDictionaries,
    getById,
    postSave,
    deleteById,
    exportCobiForKeys,
    importCobiConfig,
    getEntityClasses,
    getEntitySchema,
    parseSampleContent,
  };
}
