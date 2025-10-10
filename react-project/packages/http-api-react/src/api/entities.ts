/**
 * Entity API endpoints
 */

import axios from '../config/axios';
import qs from 'qs';
import type { Entity, EntityRequest, Transaction, TransactionDiff, RelatedPath } from '../types';

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
 */
export function updateEntity(entityClass: string, entityId: string, entityRequest: EntityRequest) {
  return axios.put(`/platform-api/entity/${entityClass}/${entityId}`, entityRequest);
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
 * Execute entity transition
 */
export function executeEntityTransition(
  entityClass: string,
  entityId: string,
  transition: string,
  values?: any[]
) {
  return axios.post(`/platform-api/entity/${entityClass}/${entityId}/transition/${transition}`, {
    values,
  });
}

/**
 * Get available transitions for entity
 */
export function getEntityTransitions(entityClass: string, entityId: string) {
  return axios.get<string[]>(`/platform-api/entity/${entityClass}/${entityId}/transitions`);
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

