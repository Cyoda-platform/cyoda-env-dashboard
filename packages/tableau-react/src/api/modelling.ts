/**
 * Modelling API Functions
 * API calls for CyodaModelling components
 */

import { axios } from '@cyoda/http-api-react';
import type { ReportingInfoRow, RelatedPath, CatalogItem } from '../types/modelling';



/**
 * Get reporting info (entity fields and types)
 * Returns real data from Cyoda backend API
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

    // Always return the API response (even if empty array)
    // Empty array means no entity info exists for this entity
    if (Array.isArray(response.data)) {
      return response;
    }

    // If response data is not an array, return empty array
    console.warn(`Invalid response data for ${entityClass}, expected array`);
    return {
      data: [],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  } catch (error) {
    // Only fall back to empty array if API call fails completely
    console.warn(`API unavailable for ${entityClass}, returning empty array:`, error);
    return {
      data: [],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }
}

/**
 * Get related paths for an entity
 * Returns JOIN relationships (not nested objects)
 * Falls back to empty array if API is unavailable
 */
export async function getReportingRelatedPaths(entityClass: string) {
  try {
    const response = await axios.get<RelatedPath[]>(
      `/platform-api/entity-info/model-info/related/paths?entityModel=${entityClass}`
    );

    // Always return the API response (even if empty array)
    // Empty array means no JOIN relationships exist for this entity
    if (Array.isArray(response.data)) {
      return response;
    }

    // If response data is not an array, return empty array
    console.warn(`Invalid response data for related paths of ${entityClass}, expected array`);
    return {
      data: [],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  } catch (error) {
    // Only fall back to empty array if API call fails completely
    console.warn(`API unavailable for related paths of ${entityClass}, returning empty array:`, error);
    return {
      data: [],
      status: 200,
      statusText: 'OK',
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

