/**
 * Chaining Configuration API
 * API endpoints for data chaining configuration operations
 * 
 * Migrated from: .old_project/packages/cobi/src/stores/chaining-config.ts
 */

import axios from './axios';
import type { ChainingConfigDto } from '../types';

/**
 * Save chaining configuration
 */
export function postSave(data: ChainingConfigDto) {
  return axios.post('/chaining-config/save', data);
}

/**
 * Get list of all chaining configurations
 */
export function getListAll() {
  return axios.get('/chaining-config/list-all');
}

/**
 * Get chaining configuration by ID
 */
export function getById(id: string) {
  return axios.get(`/chaining-config/get-by-id/${id}`);
}

/**
 * Delete chaining configuration by ID
 */
export function deleteById(id: string) {
  return axios.delete(`/chaining-config/delete-by-id/${id}`);
}

/**
 * Get history of chaining configuration
 */
export function getHistory(id: string) {
  return axios.get(`/chaining-config/get-by-id/${id}/history`);
}

/**
 * Get history by time UID
 */
export function getHistoryByTimeUid(params: { id: string; timeId: string }) {
  return axios.get(`/chaining-config/get-by-id/${params.id}/history/${params.timeId}`);
}

/**
 * Export all COBI configurations
 */
export function exportAllCobi() {
  return axios.get('/chaining-config/export-all-cobi');
}

/**
 * Export COBI for specific keys
 */
export function exportCobiForKeys(data: any) {
  return axios.post('/chaining-config/export-cobi-for-keys', data);
}

/**
 * Import COBI configuration
 */
export function importCobiConfig(params: { data: any; params?: any }) {
  return axios.post('/chaining-config/import-cobi-config', params.data, {
    params: params.params,
  });
}
