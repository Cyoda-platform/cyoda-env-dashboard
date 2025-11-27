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
 * Get all catalog items (aliases)
 */
export function getAllCatalogItems() {
  return axios.get<CatalogItem[]>(`/platform-api/catalog/item/all`);
}

/**
 * Get catalog items by entity class
 */
export function getCatalogItemsByClass(entityClass: string) {
  return axios.get<CatalogItem[]>(`/platform-api/catalog/item/class?entityClass=${entityClass}`);
}

/**
 * Get catalog items (aliases) - generic version
 */
export function getCatalogItems(params?: any) {
  const query = params ? qs.stringify(params, stringifyOpts) : '';
  return axios.get<{ _embedded: { catalogItems: CatalogItem[] } }>(`/platform-api/catalog${query}`);
}

/**
 * Get specific catalog item
 */
export function getCatalogItem(itemId: string) {
  return axios.get<CatalogItem>(`/platform-api/catalog/item?itemId=${itemId}`);
}

/**
 * Create catalog item
 */
export function createCatalogItem(item: CatalogItem) {
  return axios.post<string>('/platform-api/catalog/item', item);
}

/**
 * Update catalog item
 */
export function updateCatalogItem(itemId: string, item: CatalogItem) {
  return axios.put(`/platform-api/catalog/item?itemId=${itemId}`, item);
}

/**
 * Delete catalog item
 */
export function deleteCatalogItem(itemId: string) {
  return axios.delete(`/platform-api/catalog/item?itemId=${itemId}`);
}

/**
 * Export catalog items by IDs
 */
export function exportCatalogItems(itemIds: string[], isSingleFile: boolean = true) {
  return axios.get<CatalogItemExportImportContainer>(
    `/platform-api/catalog/item/export-by-ids?ids=${itemIds.join(',')}&isSingleFile=${isSingleFile}`
  );
}

/**
 * Export catalog items by entity classes
 */
export function exportCatalogItemsByClass(entityClasses: string) {
  return axios.get<CatalogItem[]>(`/platform-api/catalog/item/export?entityClasses=${entityClasses}`);
}

/**
 * Import catalog items
 */
export function importCatalogItems(container: CatalogItemExportImportContainer, needRewrite: boolean = true) {
  return axios.post(`/platform-api/catalog/item/import?needRewrite=${needRewrite}`, container);
}

/**
 * Export report definitions by IDs
 */
export function exportReportsByIds(ids: string[]) {
  return axios.get(`/platform-api/reporting/export-by-ids?includeIds=${ids.join(',')}`);
}

/**
 * Import report definitions
 */
export function importReports(data: any, params?: any) {
  return axios.post('/platform-api/reporting/import', data, { params });
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
export function getMappers(params?: { inClass?: string }) {
  return axios.get<import('../types').ReportMapper[]>('/platform-api/entity-info/fetch/mappers', { params });
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

// ============================================================================
// Composite Indexes APIs
// ============================================================================

/**
 * Get all composite indexes for an entity
 */
export function getAllCompositeIndexes(entity: string) {
  return axios.get(`/platform-common/composite-indexes/list?entityClass=${entity}`);
}

/**
 * Reindex a composite index
 */
export function postCompositeIndexesReindex(indexId: string) {
  return axios.post(`/platform-common/composite-indexes/reindex`, [indexId]);
}

/**
 * Create a composite index
 */
export function postCompositeIndexesCreate(data: any) {
  return axios.post(`/platform-common/composite-indexes/create`, data);
}

/**
 * Delete a composite index
 */
export function postCompositeIndexesDelete(indexId: string) {
  return axios.post(`/platform-common/composite-indexes/delete`, [indexId]);
}

/**
 * Export composite indexes by IDs
 */
export function postCompositeIndexesExportByIds(ids: string[]) {
  return axios.post(`/platform-common/composite-indexes/export-by-ids`, ids);
}

/**
 * Import composite indexes
 */
export function postCompositeIndexesImport(data: any) {
  return axios.post(`/platform-common/composite-indexes/import`, data);
}

// ============================================================================
// Cache Info APIs
// ============================================================================

/**
 * Get caches list
 */
export function getCachesList() {
  return axios.get(`/platform-common/cache-info/caches-list`);
}

/**
 * Invalidate cache
 */
export function getInvalidateCache(cacheType: string) {
  return axios.get(`/platform-common/cache-info/invalidate-cache?cacheType=${cacheType}`);
}

/**
 * Get cache keys
 */
export function getCacheKeys(cacheType: string) {
  return axios.get(`/platform-common/cache-info/cache-keys?cacheType=${encodeURIComponent(cacheType)}`);
}

// ============================================================================
// Network Info APIs
// ============================================================================

/**
 * Get network server info
 */
export function getNetInfoServer() {
  return axios.get(`/platform-common/net-info/server`);
}

/**
 * Get network clients
 */
export function getNetInfoClients() {
  return axios.get(`/platform-common/net-info/clients`);
}

// ============================================================================
// ZooKeeper Info APIs
// ============================================================================

/**
 * Get current node info
 */
export function getZkInfoCurrNodeInfo() {
  return axios.get(`/platform-common/zk-info/curr-node-info`);
}

/**
 * Get loaded online nodes
 */
export function getZkInfoLoadedOnlineNodes() {
  return axios.get(`/platform-common/zk-info/loaded-online-nodes`);
}

/**
 * Get loaded shards distribution
 */
export function getZkInfoLoadedShardsDistribution() {
  return axios.get(`/platform-common/zk-info/loaded-shards-distribution`);
}

/**
 * Get cluster state
 */
export function getZkInfoClusterState() {
  return axios.get(`/platform-common/zk-info/cluster-state`);
}

// ============================================================================
// CQL Execution Statistics APIs
// ============================================================================

/**
 * Get list of tracked tables
 */
export function getCqlExecStatsTables() {
  return axios.get(`/platform-common/cql-exec-stats/tables`);
}

/**
 * Get full statistics for all tables (with per-operation and minute-level details)
 */
export function getCqlExecStatsAllTables() {
  return axios.get(`/platform-common/cql-exec-stats/all-tables`);
}

/**
 * Get all tables brief statistics
 */
export function getCqlExecStatsAllTablesBrief() {
  return axios.get(`/platform-common/cql-exec-stats/all-tables-brief`);
}

/**
 * Get statistics for a specific table
 * @param table - Table name (will be quoted automatically)
 */
export function getCqlExecStatsTable(table: string) {
  // Ensure table name is properly quoted
  const quotedTable = table.startsWith('"') ? table : `"${table}"`;
  return axios.get(`/platform-common/cql-exec-stats/table/${quotedTable}`);
}

/**
 * Clear CQL execution statistics
 */
export function getCqlExecStatsClear() {
  return axios.get(`/platform-common/cql-exec-stats/clear-cql-exec-stats`);
}

