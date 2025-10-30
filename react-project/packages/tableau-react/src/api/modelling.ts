/**
 * Modelling API Functions
 * API calls for CyodaModelling components
 */

import { axios } from '@cyoda/http-api-react';
import type { ReportingInfoRow, RelatedPath, CatalogItem } from '../types/modelling';

/**
 * Mock entity info data for demo mode
 */
const getMockEntityInfo = (entityClass: string): ReportingInfoRow[] => {
  const shortName = entityClass.split('.').pop() || 'Entity';

  return [
    {
      columnName: 'id',
      columnPath: 'id',
      type: 'LEAF',
    },
    {
      columnName: 'name',
      columnPath: 'name',
      type: 'LEAF',
    },
    {
      columnName: 'createdAt',
      columnPath: 'createdAt',
      type: 'LEAF',
    },
    {
      columnName: 'updatedAt',
      columnPath: 'updatedAt',
      type: 'LEAF',
    },
    {
      columnName: 'status',
      columnPath: 'status',
      type: 'LEAF',
    },
    {
      columnName: 'description',
      columnPath: 'description',
      type: 'LEAF',
    },
  ];
};

/**
 * Mock related paths data for demo mode
 */
const getMockRelatedPaths = (entityClass: string): RelatedPath[] => {
  return [];
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
    const response = await axios.get<ReportingInfoRow[]>(`/platform-api/entity-info/model-info?${query}`);

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
 * Get related paths for an entity
 * Falls back to mock data if API is unavailable (for demo mode)
 */
export async function getReportingRelatedPaths(entityClass: string) {
  try {
    const response = await axios.get<RelatedPath[]>(
      `/platform-api/entity-info/model-info/related/paths?entityModel=${entityClass}`
    );

    // If response data is valid, return it
    if (Array.isArray(response.data)) {
      return response;
    }

    // Fall back to mock data
    console.warn(`API returned invalid data for related paths of ${entityClass}, using mock data`);
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
 * Get catalog items for an entity class
 */
export function getCatalogItems(entityClass: string) {
  return axios.get<CatalogItem[]>(`/platform-api/catalog/item/class?entityClass=${entityClass}`);
}

/**
 * Create a new catalog item
 */
export function postCatalogItem(data: CatalogItem) {
  return axios.post<string>(`/platform-api/catalog/item`, data);
}

/**
 * Update a catalog item
 */
export function putCatalogItem(data: CatalogItem, id: string) {
  return axios.put(`/platform-api/catalog/item?itemId=${id}`, data);
}

/**
 * Delete a catalog item
 */
export function deleteCatalogItem(id: string) {
  return axios.delete(`/platform-api/catalog/item?itemId=${id}`);
}

/**
 * Get mapper classes
 */
export function getMapperClasses() {
  return axios.get<string[]>(`/platform-api/catalog/mappers`);
}

