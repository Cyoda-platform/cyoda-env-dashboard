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
 * Mock entity classes for demo mode
 */
const MOCK_ENTITY_CLASSES = [
  'com.cyoda.core.Entity',
  'com.cyoda.core.User',
  'com.cyoda.core.Transaction',
  'com.cyoda.core.Account',
  'com.cyoda.core.Product',
  'com.cyoda.core.Order',
  'com.cyoda.core.Customer',
  'com.cyoda.core.Payment',
];

const MOCK_DYNAMIC_ENTITY_CLASSES = [
  'com.cyoda.core.Entity',
  'com.cyoda.core.User',
  'com.cyoda.core.Transaction',
];

/**
 * Get reporting fetch types (entity classes)
 * Falls back to mock data if API is unavailable (for demo mode)
 */
export async function getReportingFetchTypes(onlyDynamic = false) {
  try {
    // Try to get data from the real API
    const response = await axios.get<string[]>(`/platform-api/entity-info/fetch/types?onlyDynamic=${onlyDynamic}`);

    // If response data is valid, return it
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response;
    }

    // If API returns empty or invalid data, fall back to mock
    console.warn('API returned empty/invalid data, using mock entity classes for demo');
    return {
      data: onlyDynamic ? MOCK_DYNAMIC_ENTITY_CLASSES : MOCK_ENTITY_CLASSES,
      status: 200,
      statusText: 'OK (Mock Data)',
      headers: {},
      config: {} as any,
    };
  } catch (error) {
    // If API fails, use mock data for demo mode
    console.warn('API unavailable, using mock entity classes for demo:', error);
    return {
      data: onlyDynamic ? MOCK_DYNAMIC_ENTITY_CLASSES : MOCK_ENTITY_CLASSES,
      status: 200,
      statusText: 'OK (Mock Data)',
      headers: {},
      config: {} as any,
    };
  }
}

/**
 * Mock entity info data for demo mode
 * Includes various field types to demonstrate all ModellingGroup features:
 * - Simple fields (LEAF type)
 * - Nested objects (OBJECT type)
 * - Collections (LIST type)
 * - Related entities (with join paths)
 */
const getMockEntityInfo = (entityClass: string) => {
  const shortName = entityClass.split('.').pop() || 'Entity';

  // Comprehensive test data with different field types
  return [
    // Simple LEAF fields
    {
      columnName: 'id',
      columnType: 'java.lang.String',
      columnPath: 'id',
      type: 'LEAF',
      fullPath: `@${entityClass.replace(/\./g, '#')}#id`
    },
    {
      columnName: 'name',
      columnType: 'java.lang.String',
      columnPath: 'name',
      type: 'LEAF',
      fullPath: `@${entityClass.replace(/\./g, '#')}#name`
    },
    {
      columnName: 'createdAt',
      columnType: 'java.time.Instant',
      columnPath: 'createdAt',
      type: 'LEAF',
      fullPath: `@${entityClass.replace(/\./g, '#')}#createdAt`
    },
    {
      columnName: 'updatedAt',
      columnType: 'java.time.Instant',
      columnPath: 'updatedAt',
      type: 'LEAF',
      fullPath: `@${entityClass.replace(/\./g, '#')}#updatedAt`
    },
    {
      columnName: 'status',
      columnType: 'java.lang.String',
      columnPath: 'status',
      type: 'LEAF',
      fullPath: `@${entityClass.replace(/\./g, '#')}#status`
    },

    // OBJECT type field (expandable with nested fields)
    {
      columnName: 'metadata',
      columnType: 'com.cyoda.core.Metadata',
      columnPath: 'metadata',
      type: 'OBJECT',
      fullPath: `@${entityClass.replace(/\./g, '#')}#metadata`,
      elementInfo: {
        type: 'OBJECT',
        columnType: 'com.cyoda.core.Metadata'
      }
    },

    // LIST type field (expandable collection)
    {
      columnName: 'tags',
      columnType: 'java.util.List',
      columnPath: 'tags',
      type: 'LIST',
      fullPath: `@${entityClass.replace(/\./g, '#')}#tags`,
      elementType: {
        type: 'LEAF',
        columnType: 'java.lang.String'
      }
    },

    // Related entity field (will have blue circle icon)
    {
      columnName: 'owner',
      columnType: 'com.cyoda.core.User',
      columnPath: 'owner',
      type: 'OBJECT',
      fullPath: `@${entityClass.replace(/\./g, '#')}#owner`,
      elementInfo: {
        type: 'OBJECT',
        columnType: 'com.cyoda.core.User'
      }
    },

    // Another related entity
    {
      columnName: 'category',
      columnType: 'com.cyoda.core.Category',
      columnPath: 'category',
      type: 'OBJECT',
      fullPath: `@${entityClass.replace(/\./g, '#')}#category`,
      elementInfo: {
        type: 'OBJECT',
        columnType: 'com.cyoda.core.Category'
      }
    },

    // More simple fields
    {
      columnName: 'description',
      columnType: 'java.lang.String',
      columnPath: 'description',
      type: 'LEAF',
      fullPath: `@${entityClass.replace(/\./g, '#')}#description`
    },
    {
      columnName: 'amount',
      columnType: 'java.math.BigDecimal',
      columnPath: 'amount',
      type: 'LEAF',
      fullPath: `@${entityClass.replace(/\./g, '#')}#amount`
    },
    {
      columnName: 'quantity',
      columnType: 'java.lang.Integer',
      columnPath: 'quantity',
      type: 'LEAF',
      fullPath: `@${entityClass.replace(/\./g, '#')}#quantity`
    },
  ];
};

/**
 * Get reporting info (entity fields and types)
 * Falls back to mock data if API is unavailable (for demo mode)
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

  try {
    const response = await axios.get(`/platform-api/entity-info/model-info?${query}`);

    // If response data is valid, return it
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response;
    }

    // Fall back to mock data
    console.warn(`API returned empty data for ${entityClass}, using mock data`);
    return {
      data: getMockEntityInfo(entityClass),
      status: 200,
      statusText: 'OK (Mock Data)',
      headers: {},
      config: {} as any,
    };
  } catch (error) {
    console.warn(`API unavailable for ${entityClass}, using mock data:`, error);
    return {
      data: getMockEntityInfo(entityClass),
      status: 200,
      statusText: 'OK (Mock Data)',
      headers: {},
      config: {} as any,
    };
  }
}

/**
 * Mock related paths data for demo mode
 * These define which fields are joinable/related entities (will show blue circle icon)
 */
const getMockRelatedPaths = (entityClass: string) => {
  return [
    {
      columnPath: 'owner',
      path: 'owner',
      targetEntityClass: 'com.cyoda.core.User',
      joinType: 'MANY_TO_ONE',
      description: 'User who owns this entity'
    },
    {
      columnPath: 'category',
      path: 'category',
      targetEntityClass: 'com.cyoda.core.Category',
      joinType: 'MANY_TO_ONE',
      description: 'Category of this entity'
    },
    {
      columnPath: 'metadata',
      path: 'metadata',
      targetEntityClass: 'com.cyoda.core.Metadata',
      joinType: 'ONE_TO_ONE',
      description: 'Metadata information'
    }
  ];
};

/**
 * Get related paths for an entity
 * Falls back to mock data if API is unavailable (for demo mode)
 */
export async function getReportingRelatedPaths(entityClass: string) {
  try {
    const response = await axios.get(
      `/platform-api/entity-info/model-info/related/paths?entityModel=${entityClass}`
    );

    // If response data is valid, return it
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response;
    }

    // Fall back to mock data for demo mode
    console.warn(`API returned empty/invalid data for related paths of ${entityClass}, using mock data`);
    return {
      data: getMockRelatedPaths(entityClass),
      status: 200,
      statusText: 'OK (Mock Data)',
      headers: {},
      config: {} as any,
    };
  } catch (error) {
    console.warn(`API unavailable for related paths of ${entityClass}, using mock data:`, error);
    return {
      data: getMockRelatedPaths(entityClass),
      status: 200,
      statusText: 'OK (Mock Data)',
      headers: {},
      config: {} as any,
    };
  }
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

