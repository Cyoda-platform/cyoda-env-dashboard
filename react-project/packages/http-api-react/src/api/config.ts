/**
 * Configuration and Definitions API endpoints
 */

import axios from '../config/axios';
import qs from 'qs';
import type {
  IDefinition,
  IDefinitionStream,
  CatalogItem,
  CatalogItemExportImportContainer,
  ServerInfo,
  ClusterState,
  NodeInfo,
} from '../types';

const stringifyOpts = {
  addQueryPrefix: true,
  arrayFormat: 'comma' as const,
  encode: false,
  encodeValuesOnly: true,
  skipNulls: true,
};

/**
 * Get all report definitions
 */
export function getDefinitions(params?: any) {
  const query = params ? qs.stringify(params, stringifyOpts) : '';
  return axios.get<{ _embedded: { definitions: IDefinition[] } }>(`/platform-api/definitions${query}`);
}

/**
 * Get specific definition
 */
export function getDefinition(definitionId: string) {
  return axios.get<IDefinition>(`/platform-api/definitions/${definitionId}`);
}

/**
 * Create definition
 */
export function createDefinition(definition: any) {
  return axios.post('/platform-api/definitions', definition);
}

/**
 * Update definition
 */
export function updateDefinition(definitionId: string, definition: any) {
  return axios.put(`/platform-api/definitions/${definitionId}`, definition);
}

/**
 * Delete definition
 */
export function deleteDefinition(definitionId: string) {
  return axios.delete(`/platform-api/definitions/${definitionId}`);
}

/**
 * Get stream definitions
 */
export function getStreamDefinitions(params?: any) {
  const query = params ? qs.stringify(params, stringifyOpts) : '';
  return axios.get<{ _embedded: { streams: IDefinitionStream[] } }>(`/platform-api/streams${query}`);
}

/**
 * Get specific stream definition
 */
export function getStreamDefinition(streamId: string) {
  return axios.get<IDefinitionStream>(`/platform-api/streams/${streamId}`);
}

/**
 * Create stream definition
 */
export function createStreamDefinition(stream: IDefinitionStream) {
  return axios.post('/platform-api/streams', stream);
}

/**
 * Update stream definition
 */
export function updateStreamDefinition(streamId: string, stream: IDefinitionStream) {
  return axios.put(`/platform-api/streams/${streamId}`, stream);
}

/**
 * Delete stream definition
 */
export function deleteStreamDefinition(streamId: string) {
  return axios.delete(`/platform-api/streams/${streamId}`);
}

/**
 * Get catalog items (aliases)
 */
export function getCatalogItems(params?: any) {
  const query = params ? qs.stringify(params, stringifyOpts) : '';
  return axios.get<{ _embedded: { catalogItems: CatalogItem[] } }>(`/platform-api/catalog${query}`);
}

/**
 * Get specific catalog item
 */
export function getCatalogItem(itemId: string) {
  return axios.get<CatalogItem>(`/platform-api/catalog/${itemId}`);
}

/**
 * Create catalog item
 */
export function createCatalogItem(item: CatalogItem) {
  return axios.post('/platform-api/catalog', item);
}

/**
 * Update catalog item
 */
export function updateCatalogItem(itemId: string, item: CatalogItem) {
  return axios.put(`/platform-api/catalog/${itemId}`, item);
}

/**
 * Delete catalog item
 */
export function deleteCatalogItem(itemId: string) {
  return axios.delete(`/platform-api/catalog/${itemId}`);
}

/**
 * Export catalog items
 */
export function exportCatalogItems(itemIds: string[]) {
  return axios.post<CatalogItemExportImportContainer>('/platform-api/catalog/export', {
    itemIds,
  });
}

/**
 * Import catalog items
 */
export function importCatalogItems(container: CatalogItemExportImportContainer) {
  return axios.post('/platform-api/catalog/import', container);
}

/**
 * Get server info
 */
export function getServerInfo() {
  return axios.get<ServerInfo>('/platform-api/info');
}

/**
 * Get cluster state
 */
export function getClusterState() {
  return axios.get<ClusterState>('/platform-api/cluster/state');
}

/**
 * Get cluster nodes
 */
export function getClusterNodes() {
  return axios.get<NodeInfo[]>('/platform-api/cluster/nodes');
}

/**
 * Get system health
 */
export function getSystemHealth() {
  return axios.get<{ status: string; checks: any[] }>('/platform-api/health');
}

/**
 * Get system metrics
 */
export function getSystemMetrics() {
  return axios.get('/platform-api/metrics');
}

/**
 * Get available entity types/models
 */
export function getEntityTypes() {
  return axios.get<string[]>('/platform-api/models');
}

/**
 * Get entity type metadata
 */
export function getEntityTypeMetadata(entityType: string) {
  return axios.get(`/platform-api/models/${entityType}`);
}

/**
 * Get column types for entity
 */
export function getColumnTypes(entityClass: string) {
  return axios.get(`/platform-api/models/${entityClass}/columns`);
}

/**
 * Get available mappers
 */
export function getMappers() {
  return axios.get('/platform-api/mappers');
}

/**
 * Get available transformers
 */
export function getTransformers() {
  return axios.get('/platform-api/transformers');
}

/**
 * Get available validators
 */
export function getValidators() {
  return axios.get('/platform-api/validators');
}

/**
 * Get system configuration
 */
export function getSystemConfig() {
  return axios.get('/platform-api/config');
}

/**
 * Update system configuration
 */
export function updateSystemConfig(config: any) {
  return axios.put('/platform-api/config', config);
}

/**
 * Get feature flags
 */
export function getFeatureFlags() {
  return axios.get<{ [key: string]: boolean }>('/platform-api/feature-flags');
}

/**
 * Update feature flag
 */
export function updateFeatureFlag(flagName: string, enabled: boolean) {
  return axios.put(`/platform-api/feature-flags/${flagName}`, { enabled });
}

/**
 * Clear cache
 */
export function clearCache(cacheType?: string) {
  const url = cacheType ? `/platform-api/cache/${cacheType}/clear` : '/platform-api/cache/clear';
  return axios.post(url);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return axios.get('/platform-api/cache/stats');
}

