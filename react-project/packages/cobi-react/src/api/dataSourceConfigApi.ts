/**
 * Data Source Configuration API
 * API endpoints for data source configuration operations
 * 
 * Migrated from: .old_project/packages/cobi/src/stores/data-source-config.ts
 */

import axios from './axios';
import type { DataSourceConfigDto } from '../types';

/**
 * Save data source configuration
 */
export function postSave(data: DataSourceConfigDto) {
  return axios.post('/data-source-config/save', data);
}

/**
 * Get list of all data source configurations
 */
export function getListAll() {
  return axios.get('/data-source-config/list-all');
}

/**
 * Get data source configuration by ID
 */
export function getById(id: string) {
  return axios.get(`/data-source-config/get-by-id/${id}`);
}

/**
 * Delete data source configuration by ID
 */
export function deleteById(id: string) {
  return axios.delete(`/data-source-config/delete-by-id/${id}`);
}

/**
 * Get pipeline for data source configuration
 */
export function getPipeline(id: string) {
  return axios.get(`/data-source-config/${id}/pipeline`);
}

/**
 * Get available auth types
 */
export function getAvailableAuthType() {
  return axios.get('/data-source-config/available-auth-type');
}

/**
 * Get auth type configuration
 */
export function getAvailableAuthTypeConfig(authType: string) {
  return axios.get(`/data-source-config/auth-type-required-params/${authType}`);
}

/**
 * Check endpoint connection
 */
export function postCheckEndpointConnection(data: any) {
  return axios.post('/data-source-config/check-endpoint-connection', data);
}

/**
 * Get proxy configuration
 */
export function getProxy() {
  return axios.get('/data-source-config/proxy');
}

/**
 * Export all COBI configurations
 */
export function exportAllCobi() {
  return axios.get('/data-source-config/export-all-cobi');
}

/**
 * Export COBI for specific keys
 */
export function exportCobiForKeys(data: any) {
  return axios.post('/data-source-config/export-cobi-for-keys', data);
}

/**
 * Import COBI configuration
 */
export function importCobiConfig(params: { data: any; params?: any }) {
  return axios.post('/data-source-config/import-cobi-config', params.data, {
    params: params.params,
  });
}

/**
 * Verify template calculation
 */
export function verifyTemplateCalc(data: any) {
  return axios.post('/data-source-config/verify-template-calc', data);
}

/**
 * Request data from data source
 */
export function request(data: any) {
  return axios.post('/data-source/request/request', data);
}

/**
 * Get request result
 */
export function result(id: string) {
  return axios.get(`/data-source/request/result/${id}`);
}

/**
 * Get request state
 */
export function resultState(id: string) {
  return axios.get(`/data-source/request/requestState/${id}`);
}

/**
 * Get available data sources
 */
export function datasources() {
  return axios.get('/data-source/request/datasources');
}

/**
 * Get plugins setup
 */
export function pluginsSetup() {
  return axios.get('/data-source/request/plugins-setup');
}

/**
 * Get auth service configs
 */
export function authServiceConfigs() {
  return axios.get('/data-source-config/auth-service-configs');
}

/**
 * Get auth response parser configs
 */
export function authRespParserConfigs() {
  return axios.get('/data-source-config/auth-resp-parser-configs');
}

/**
 * Get statistics for root
 */
export function getStatisticsForRoot(data: any) {
  return axios.post('/data-source-config/get-statistics-for-root', data);
}

/**
 * Get statistics for child
 */
export function getStatisticsForChild(data: any) {
  return axios.post('/data-source-config/get-statistics-for-child', data);
}

/**
 * Get history of data source configuration
 */
export function getHistory(id: string) {
  return axios.get(`/data-source-config/get-by-id/${id}/history`);
}

/**
 * Get history by time UID
 */
export function getHistoryByTimeUid(params: { id: string; timeId: string }) {
  return axios.get(`/data-source-config/get-by-id/${params.id}/history/${params.timeId}`);
}

