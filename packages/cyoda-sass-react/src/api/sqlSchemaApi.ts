import { axios } from '@cyoda/http-api-react';
import type { SqlSchema, EntityModel, GeneratedTable, ApiResponse } from '../types';

/**
 * SQL Schema API service
 * Handles all API calls related to SQL schema management
 *
 * Note: Endpoints use /api/sql/schema/* paths
 */
export const sqlSchemaApi = {
  /**
   * Get all SQL schemas
   * @returns Promise with list of schemas
   */
  getListAll: (): Promise<ApiResponse<SqlSchema[]>> => {
    return axios.get('/api/sql/schema/listAll');
  },

  /**
   * Get SQL schema by ID
   * @param schemaId - Schema ID (UUID)
   * @returns Promise with schema data
   */
  getSchemaById: (schemaId: string): Promise<ApiResponse<SqlSchema>> => {
    return axios.get(`/api/sql/schema/${schemaId}`) as unknown as Promise<ApiResponse<SqlSchema>>;
  },

  /**
   * Create or update SQL schema
   * @param data - Schema data
   * @returns Promise with saved schema data
   */
  saveSchema: (data: SqlSchema): Promise<ApiResponse<SqlSchema>> => {
    return axios.post('/api/sql/schema/', data);
  },

  /**
   * Delete SQL schema
   * @param schemaId - Schema ID (UUID)
   * @returns Promise with deletion result
   */
  delete: (schemaId: string): Promise<ApiResponse<void>> => {
    return axios.delete(`/api/sql/schema/${schemaId}`) as unknown as Promise<ApiResponse<void>>;
  },

  /**
   * Get list of entity models
   * @returns Promise with list of entity models
   */
  getEntityModelList: (): Promise<ApiResponse<EntityModel[]>> => {
    return axios.get('/api/model/');
  },

  /**
   * Generate tables from entity model
   * @param id - Entity model ID
   * @returns Promise with generated tables
   */
  getGenTable: (id: string): Promise<ApiResponse<GeneratedTable[]>> => {
    return axios.get(`/api/sql/schema/genTables/${id}`);
  },

  /**
   * Update tables for a schema
   * @param metaId - Metadata class ID
   * @param tables - Array of tables to update
   * @returns Promise with updated tables
   */
  updateTables: (metaId: string, tables: any[]): Promise<ApiResponse<any[]>> => {
    return axios.post(`/api/sql/schema/updateTables/${metaId}`, tables);
  },

  /**
   * Import sample data (for testing)
   * @param sampleData - Sample data JSON
   * @returns Promise with import result
   */
  importData: (sampleData: any): Promise<ApiResponse<any>> => {
    return axios.post('/api/model/import/JSON/SAMPLE_DATA/nobel_1/1', sampleData);
  },
};

export default sqlSchemaApi;

