/**
 * Entity API endpoints
 */

import axios from '../config/axios';
import qs from 'qs';
import HelperFeatureFlags from '../utils/HelperFeatureFlags';
import type { Entity, EntityRequest, EntityValueRequest, Transaction, TransactionDiff, RelatedPath } from '../types';

const stringifyOpts = {
  addQueryPrefix: true,
  arrayFormat: 'comma' as const,
  encode: false,
  encodeValuesOnly: true,
  skipNulls: true,
};

/**
 * Get entity by ID
 */
export function getEntity(entityClass: string, entityId: string, params?: any) {
  const query = params ? qs.stringify(params, stringifyOpts) : '';
  return axios.get<Entity>(`/platform-api/entity/${entityClass}/${entityId}${query}`);
}

/**
 * Get entity data in lazy-loaded format (returns Entity[] array with columnInfo, value, type)
 * This is used for entity detail modal to display entity fields in a tree structure
 */
export function getEntityLoad(
  entityId: string,
  entityClass: string,
  parentFldClass: string = '',
  columnPath: string = ''
) {
  const params: any = {
    entityClass,
    entityId: encodeURIComponent(entityId),
  };
  if (parentFldClass) params.parentFldClass = encodeURIComponent(parentFldClass);
  if (columnPath) params.columnPath = encodeURIComponent(columnPath);

  const query = qs.stringify(params, stringifyOpts);
  return axios.get<Entity[]>(`/platform-api/entity-info/fetch/lazy${query}`);
}

/**
 * Search entities
 */
export function searchEntities(entityClass: string, searchParams: any) {
  const query = qs.stringify(searchParams, stringifyOpts);
  return axios.get(`/platform-api/entity/${entityClass}/search${query}`);
}

/**
 * Create entity
 */
export function createEntity(entityRequest: EntityRequest) {
  return axios.post('/platform-api/entity', entityRequest);
}

/**
 * Update entity
 * The transactional flag is set to true by default in the request body to ensure atomic execution.
 * The transactional flag is part of the EntityRequest body, not a query parameter.
 * entityClass and entityId are only in the request body, not in the URL path.
 */
export function updateEntity(entityClass: string, entityId: string, entityRequest: EntityRequest) {
  const requestBody: EntityRequest = {
    ...entityRequest,
    entityClass,
    entityId,
    transactional: entityRequest.transactional ?? true,
  };

  return axios.put('/platform-api/entity', requestBody);
}

/**
 * Delete entity
 */
export function deleteEntity(entityClass: string, entityId: string) {
  return axios.delete(`/platform-api/entity/${entityClass}/${entityId}`);
}

/**
 * Get entity history/transactions
 */
export function getEntityTransactions(entityClass: string, entityId: string, params?: any) {
  const query = params ? qs.stringify(params, stringifyOpts) : '';
  return axios.get<{ _embedded: { transactions: Transaction[] } }>(
    `/platform-api/entity/${entityClass}/${entityId}/transactions${query}`
  );
}

/**
 * Get transaction diff
 */
export function getTransactionDiff(transactionId: string) {
  return axios.get<TransactionDiff[]>(`/platform-api/transaction/${transactionId}/diff`);
}

/**
 * Get entity related paths
 */
export function getEntityRelatedPaths(entityClass: string) {
  return axios.get<RelatedPath[]>(`/platform-api/entity/${entityClass}/related-paths`);
}

/**
 * Get related entities
 */
export function getRelatedEntities(entityClass: string, entityId: string, relationPath: string, params?: any) {
  const query = params ? qs.stringify(params, stringifyOpts) : '';
  return axios.get(
    `/platform-api/entity/${entityClass}/${entityId}/related/${encodeURIComponent(relationPath)}${query}`
  );
}

/**
 * Get entity column values (for autocomplete/filters)
 */
export function getEntityColumnValues(entityClass: string, columnPath: string, params?: any) {
  const query = params ? qs.stringify(params, stringifyOpts) : '';
  return axios.get(
    `/platform-api/entity/${entityClass}/column/${encodeURIComponent(columnPath)}/values${query}`
  );
}

/**
 * Validate entity
 */
export function validateEntity(entityRequest: EntityRequest) {
  return axios.post('/platform-api/entity/validate', entityRequest);
}

/**
 * Get entity schema/metadata
 */
export function getEntitySchema(entityClass: string) {
  return axios.get(`/platform-api/entity/${entityClass}/schema`);
}

/**
 * Get all entity classes
 */
export function getEntityClasses() {
  return axios.get<string[]>('/platform-api/entity/classes');
}

/**
 * Execute entity transition using the transactional updateEntity endpoint.
 * This replaces the old non-transactional /platform-api/entity/transition endpoint.
 * After the transition completes, call getEntityTransitions to get the updated list.
 * entityClass and entityId are only in the request body, not in the URL path.
 */
export function executeEntityTransition(
  entityClass: string,
  entityId: string,
  transition: string,
  values?: EntityValueRequest[]
) {
  const requestBody: EntityRequest = {
    entityClass,
    entityId,
    transition,
    transactional: true,
    async: false,
    values: values || [],
  };
  return axios.put('/platform-api/entity', requestBody);
}

/**
 * Get available transitions for entity
 * Uses query parameters: entityId, entityClass
 */
export function getEntityTransitions(entityClass: string, entityId: string) {
  return axios.get<string[]>(
    `/platform-api/entity/fetch/transitions?entityId=${encodeURIComponent(entityId)}&entityClass=${encodeURIComponent(entityClass)}`
  );
}

/**
 * Bulk create entities
 */
export function bulkCreateEntities(entities: EntityRequest[]) {
  return axios.post('/platform-api/entity/bulk', entities);
}

/**
 * Bulk update entities
 */
export function bulkUpdateEntities(updates: Array<{ entityClass: string; entityId: string; values: any[] }>) {
  return axios.put('/platform-api/entity/bulk', updates);
}

/**
 * Bulk delete entities
 */
export function bulkDeleteEntities(entities: Array<{ entityClass: string; entityId: string }>) {
  return axios.delete('/platform-api/entity/bulk', { data: entities });
}

/**
 * Export entities
 */
export function exportEntities(entityClass: string, params?: any, format: 'csv' | 'excel' | 'json' = 'csv') {
  const query = params ? qs.stringify({ ...params, format }, stringifyOpts) : `?format=${format}`;
  return axios.get(`/platform-api/entity/${entityClass}/export${query}`, {
    responseType: 'blob',
  });
}

/**
 * Import entities
 */
export function importEntities(entityClass: string, file: File, format: 'csv' | 'excel' | 'json' = 'csv') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('format', format);

  return axios.post(`/platform-api/entity/${entityClass}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * Get entity count
 */
export function getEntityCount(entityClass: string, params?: any) {
  const query = params ? qs.stringify(params, stringifyOpts) : '';
  return axios.get<{ count: number }>(`/platform-api/entity/${entityClass}/count${query}`);
}

/**
 * Get reporting fetch types (entity classes)
 * Always uses real backend data - no mock fallback
 * When VITE_FEATURE_FLAG_USE_MODELS_INFO is enabled, uses models-info endpoint
 * which returns entity type information (BUSINESS/PERSISTENCE)
 */
export async function getReportingFetchTypes(onlyDynamic = false) {
  // Check feature flag to determine which endpoint to use
  const useModelsInfo = HelperFeatureFlags.isUseModelsInfo();

  if (useModelsInfo) {
    // When feature flag is enabled, use models-info endpoint which returns entity type info
    const response = await axios.get(
      `/platform-api/entity-info/fetch/models-info?onlyDynamic=${onlyDynamic}`
    );
    return response;
  }

  // Default endpoint returns just entity class names as strings
  const response = await axios.get<string[]>(
    `/platform-api/entity-info/fetch/types?onlyDynamic=${onlyDynamic}`
  );

  // Return the actual API response (even if empty)
  return response;
}

/**
 * Get reporting info (entity fields and types)
 * Always uses real backend data - no mock fallback
 */
export async function getReportingInfo(
  entityClass: string,
  parentFldClass: string = '',
  columnPath: string = '',
  onlyRange: boolean = false
) {
  const params: any = { entityModel: entityClass };
  if (parentFldClass) params.parentFieldType = encodeURIComponent(parentFldClass);
  if (columnPath) params.columnPath = encodeURIComponent(columnPath);
  if (onlyRange) params.onlyRange = onlyRange;

  const query = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  // Always use real backend data - no mock fallback
  const response = await axios.get(`/platform-api/entity-info/model-info?${query}`);

  // Return the actual API response (even if empty)
  return response;
}

/**
 * Get related paths for an entity
 * Returns JOIN relationships (not nested objects)
 * Always uses real backend data - no mock fallback
 */
export async function getReportingRelatedPaths(entityClass: string) {
  // Always use real backend data - no mock fallback
  const response = await axios.get(
    `/platform-api/entity-info/model-info/related/paths?entityModel=${entityClass}`
  );

  // Return the actual API response (even if empty array)
  // Empty array means no JOIN relationships exist for this entity
  return response;
}

/**
 * Clone entity
 */
export function cloneEntity(entityClass: string, entityId: string) {
  return axios.post(`/platform-api/entity/${entityClass}/${entityId}/clone`);
}

/**
 * Get entity audit log
 */
export function getEntityAuditLog(entityClass: string, entityId: string, params?: any) {
  const query = params ? qs.stringify(params, stringifyOpts) : '';
  return axios.get(`/platform-api/entity/${entityClass}/${entityId}/audit${query}`);
}

/**
 * Get stream data for reports
 */
export function getStreamData(request: any) {
  return axios.post('/platform-api/stream-data/get', request);
}

/**
 * User type for usersList response
 */
export interface User {
  userId: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Get users by their IDs
 * Used to fetch user information for report definitions
 */
export function usersList(userIds: string[]) {
  return axios.post<User[]>('/platform-api/users/get-by-ids', userIds);
}

// ============================================================================
// Cyoda Cloud API Functions
// These endpoints are used when VITE_FEATURE_FLAG_IS_CYODA_CLOUD is enabled
// ============================================================================

/**
 * SIMPLE_VIEW model export response type
 * The model is a map of JSON paths to field definitions
 */
export interface SimpleViewModel {
  currentState: string;
  model: Record<string, Record<string, string>>;
}

/**
 * Get entity model in SIMPLE_VIEW format (Cyoda Cloud API)
 * Used when VITE_FEATURE_FLAG_IS_CYODA_CLOUD is enabled for Business entities
 *
 * @param entityName - The entity model name (e.g., "nobel-prize")
 * @param modelVersion - The model version number
 * @returns The model in SIMPLE_VIEW format
 */
export function getEntityModelExport(entityName: string, modelVersion: number) {
  return axios.get<SimpleViewModel>(
    `/model/export/SIMPLE_VIEW/${encodeURIComponent(entityName)}/${modelVersion}`
  );
}

/**
 * Get entity data by ID (Cyoda Cloud API)
 * Used when VITE_FEATURE_FLAG_IS_CYODA_CLOUD is enabled
 * Returns the raw entity data as JSON
 *
 * @param entityId - The entity UUID
 * @param transactionId - Optional transaction ID to load entity as it was at the end of that transaction
 * @returns The entity data as a JSON object
 */
export function getCyodaCloudEntity(entityId: string, transactionId?: string) {
  const params = transactionId ? { transactionId } : undefined;
  return axios.get<Record<string, unknown>>(`/entity/${encodeURIComponent(entityId)}`, { params });
}

/**
 * Parse entity name and version from models-info response
 * The models-info endpoint returns names in format "entityName.version"
 *
 * @param modelName - The model name from models-info (e.g., "nobel-prize.1")
 * @returns Object with entityName and modelVersion
 */
export function parseModelNameVersion(modelName: string): { entityName: string; modelVersion: number } {
  const lastDotIndex = modelName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    // No version found, default to version 1
    return { entityName: modelName, modelVersion: 1 };
  }

  const entityName = modelName.substring(0, lastDotIndex);
  const versionStr = modelName.substring(lastDotIndex + 1);
  const modelVersion = parseInt(versionStr, 10);

  // If version is not a valid number, treat the whole string as entity name
  if (isNaN(modelVersion)) {
    return { entityName: modelName, modelVersion: 1 };
  }

  return { entityName, modelVersion };
}

/**
 * Get entity audit events (Cyoda Cloud API)
 * Used when VITE_FEATURE_FLAG_IS_CYODA_CLOUD is enabled
 * Returns audit events for a specific entity with optional filtering
 *
 * @param params - Parameters for filtering audit events
 * @returns Paginated list of audit events
 */
export function getEntityAuditEvents(params: {
  entityId: string;
  eventType?: ('StateMachine' | 'EntityChange' | 'System')[];
  severity?: 'ERROR' | 'INFO' | 'WARN' | 'DEBUG';
  fromUtcTime?: string;
  toUtcTime?: string;
  transactionId?: string;
  cursor?: string;
  limit?: number;
}) {
  const { entityId, ...queryParams } = params;

  // Build query parameters, handling array for eventType
  const searchParams = new URLSearchParams();

  if (queryParams.eventType && queryParams.eventType.length > 0) {
    queryParams.eventType.forEach(type => searchParams.append('eventType', type));
  }
  if (queryParams.severity) {
    searchParams.append('severity', queryParams.severity);
  }
  if (queryParams.fromUtcTime) {
    searchParams.append('fromUtcTime', queryParams.fromUtcTime);
  }
  if (queryParams.toUtcTime) {
    searchParams.append('toUtcTime', queryParams.toUtcTime);
  }
  if (queryParams.transactionId) {
    searchParams.append('transactionId', queryParams.transactionId);
  }
  if (queryParams.cursor) {
    searchParams.append('cursor', queryParams.cursor);
  }
  if (queryParams.limit) {
    searchParams.append('limit', queryParams.limit.toString());
  }

  const queryString = searchParams.toString();
  const url = `/audit/entity/${encodeURIComponent(entityId)}${queryString ? `?${queryString}` : ''}`;

  return axios.get<{
    items: Array<{
      auditEventType: 'StateMachine' | 'EntityChange' | 'System';
      severity: 'ERROR' | 'INFO' | 'WARN' | 'DEBUG';
      utcTime: string;
      microsTime: number;
      consistencyTime?: string;
      entityId?: string;
      entityModel?: string;
      transactionId?: string;
      actor?: { id: string; legalId: string; name?: string };
      details?: string;
      system?: boolean;
      // StateMachine specific
      state?: string;
      eventType?: string;
      data?: Record<string, unknown>;
      // EntityChange specific
      changeType?: 'CREATED' | 'UPDATED' | 'DELETED';
      changes?: { before?: Record<string, unknown>; after?: Record<string, unknown> };
      // System specific
      errorTime?: string;
      doneTime?: string;
      queueName?: string;
      shardId?: string;
      status?: string;
    }>;
    pagination: { hasNext: boolean; nextCursor?: string };
  }>(url);
}
