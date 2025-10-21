/**
 * Modelling API Functions
 * API calls for CyodaModelling components
 */

import axios from 'axios';
import type { ReportingInfoRow, RelatedPath, CatalogItem } from '../types/modelling';

/**
 * Get reporting info (entity fields and types)
 */
export function getReportingInfo(
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

  return axios.get<ReportingInfoRow[]>(`/platform-api/entity-info/model-info?${query}`);
}

/**
 * Get related paths for an entity
 */
export function getReportingRelatedPaths(entityClass: string) {
  return axios.get<RelatedPath[]>(
    `/platform-api/entity-info/model-info/related/paths?entityModel=${entityClass}`
  );
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

