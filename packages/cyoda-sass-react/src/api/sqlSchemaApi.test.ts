/**
 * Tests for SQL Schema API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sqlSchemaApi } from './sqlSchemaApi';
import { axios } from '@cyoda/http-api-react';

// Mock the @cyoda/http-api-react module
vi.mock('@cyoda/http-api-react', () => ({
  axios: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('SQL Schema API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getListAll', () => {
    it('should call GET /api/sql/schema/listAll', async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await sqlSchemaApi.getListAll();

      expect(axios.get).toHaveBeenCalledWith('/api/sql/schema/listAll');
      expect(result).toEqual(mockResponse);
    });

    it('should return list of schemas', async () => {
      const mockSchemas = [
        { id: 'schema-1', name: 'Schema 1' },
        { id: 'schema-2', name: 'Schema 2' },
      ];
      vi.mocked(axios.get).mockResolvedValue({ data: mockSchemas });

      const result = await sqlSchemaApi.getListAll();

      expect(result.data).toEqual(mockSchemas);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Network error');
      vi.mocked(axios.get).mockRejectedValue(mockError);

      await expect(sqlSchemaApi.getListAll()).rejects.toThrow('Network error');
    });
  });

  describe('getSchemaById', () => {
    it('should call GET /api/sql/schema/{schemaId}', async () => {
      const mockResponse = { data: { id: 'schema-123', name: 'Test Schema' } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await sqlSchemaApi.getSchemaById('schema-123');

      expect(axios.get).toHaveBeenCalledWith('/api/sql/schema/schema-123');
      expect(result).toEqual(mockResponse);
    });

    it('should return schema data', async () => {
      const mockSchema = { id: 'schema-123', name: 'Test Schema', tables: [] };
      vi.mocked(axios.get).mockResolvedValue({ data: mockSchema });

      const result = await sqlSchemaApi.getSchemaById('schema-123');

      expect(result.data).toEqual(mockSchema);
    });

    it('should handle not found errors', async () => {
      const mockError = new Error('Schema not found');
      vi.mocked(axios.get).mockRejectedValue(mockError);

      await expect(sqlSchemaApi.getSchemaById('invalid-id')).rejects.toThrow('Schema not found');
    });
  });

  describe('saveSchema', () => {
    it('should call POST /api/sql/schema/ with schema data', async () => {
      const mockSchema = { id: 'schema-123', name: 'Test Schema', tables: [] };
      const mockResponse = { data: mockSchema };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await sqlSchemaApi.saveSchema(mockSchema);

      expect(axios.post).toHaveBeenCalledWith('/api/sql/schema/', mockSchema);
      expect(result).toEqual(mockResponse);
    });

    it('should create new schema', async () => {
      const newSchema = { name: 'New Schema', tables: [] };
      const savedSchema = { id: 'schema-456', ...newSchema };
      vi.mocked(axios.post).mockResolvedValue({ data: savedSchema });

      const result = await sqlSchemaApi.saveSchema(newSchema as any);

      expect(result.data).toEqual(savedSchema);
    });

    it('should update existing schema', async () => {
      const existingSchema = { id: 'schema-123', name: 'Updated Schema', tables: [] };
      vi.mocked(axios.post).mockResolvedValue({ data: existingSchema });

      const result = await sqlSchemaApi.saveSchema(existingSchema);

      expect(result.data).toEqual(existingSchema);
    });

    it('should handle validation errors', async () => {
      const invalidSchema = { name: '' };
      const mockError = new Error('Validation error');
      vi.mocked(axios.post).mockRejectedValue(mockError);

      await expect(sqlSchemaApi.saveSchema(invalidSchema as any)).rejects.toThrow('Validation error');
    });
  });

  describe('delete', () => {
    it('should call DELETE /api/sql/schema/{schemaId}', async () => {
      const mockResponse = { data: undefined };
      vi.mocked(axios.delete).mockResolvedValue(mockResponse);

      const result = await sqlSchemaApi.delete('schema-123');

      expect(axios.delete).toHaveBeenCalledWith('/api/sql/schema/schema-123');
      expect(result).toEqual(mockResponse);
    });

    it('should handle deletion success', async () => {
      vi.mocked(axios.delete).mockResolvedValue({ data: undefined });

      await expect(sqlSchemaApi.delete('schema-123')).resolves.toBeDefined();
    });

    it('should handle deletion errors', async () => {
      const mockError = new Error('Cannot delete schema');
      vi.mocked(axios.delete).mockRejectedValue(mockError);

      await expect(sqlSchemaApi.delete('schema-123')).rejects.toThrow('Cannot delete schema');
    });
  });

  describe('getEntityModelList', () => {
    it('should call GET /api/model/', async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await sqlSchemaApi.getEntityModelList();

      expect(axios.get).toHaveBeenCalledWith('/api/model/');
      expect(result).toEqual(mockResponse);
    });

    it('should return list of entity models', async () => {
      const mockModels = [
        { id: 'model-1', name: 'Model 1' },
        { id: 'model-2', name: 'Model 2' },
      ];
      vi.mocked(axios.get).mockResolvedValue({ data: mockModels });

      const result = await sqlSchemaApi.getEntityModelList();

      expect(result.data).toEqual(mockModels);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Failed to fetch models');
      vi.mocked(axios.get).mockRejectedValue(mockError);

      await expect(sqlSchemaApi.getEntityModelList()).rejects.toThrow('Failed to fetch models');
    });
  });

  describe('getGenTable', () => {
    it('should call GET /api/sql/schema/genTables/{id}', async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await sqlSchemaApi.getGenTable('model-123');

      expect(axios.get).toHaveBeenCalledWith('/api/sql/schema/genTables/model-123');
      expect(result).toEqual(mockResponse);
    });

    it('should return generated tables', async () => {
      const mockTables = [
        { name: 'table1', columns: [] },
        { name: 'table2', columns: [] },
      ];
      vi.mocked(axios.get).mockResolvedValue({ data: mockTables });

      const result = await sqlSchemaApi.getGenTable('model-123');

      expect(result.data).toEqual(mockTables);
    });

    it('should handle generation errors', async () => {
      const mockError = new Error('Failed to generate tables');
      vi.mocked(axios.get).mockRejectedValue(mockError);

      await expect(sqlSchemaApi.getGenTable('model-123')).rejects.toThrow('Failed to generate tables');
    });
  });

  describe('updateTables', () => {
    it('should call POST /api/sql/schema/updateTables/{metaId} with tables', async () => {
      const mockTables = [{ name: 'table1', columns: [] }];
      const mockResponse = { data: mockTables };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await sqlSchemaApi.updateTables('meta-123', mockTables);

      expect(axios.post).toHaveBeenCalledWith('/api/sql/schema/updateTables/meta-123', mockTables);
      expect(result).toEqual(mockResponse);
    });

    it('should update multiple tables', async () => {
      const mockTables = [
        { name: 'table1', columns: [] },
        { name: 'table2', columns: [] },
      ];
      vi.mocked(axios.post).mockResolvedValue({ data: mockTables });

      const result = await sqlSchemaApi.updateTables('meta-123', mockTables);

      expect(result.data).toEqual(mockTables);
    });

    it('should handle update errors', async () => {
      const mockError = new Error('Failed to update tables');
      vi.mocked(axios.post).mockRejectedValue(mockError);

      await expect(sqlSchemaApi.updateTables('meta-123', [])).rejects.toThrow('Failed to update tables');
    });
  });

  describe('importData', () => {
    it('should call POST /api/model/import/JSON/SAMPLE_DATA/nobel_1/1 with sample data', async () => {
      const mockData = { key: 'value' };
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await sqlSchemaApi.importData(mockData);

      expect(axios.post).toHaveBeenCalledWith('/api/model/import/JSON/SAMPLE_DATA/nobel_1/1', mockData);
      expect(result).toEqual(mockResponse);
    });

    it('should import sample data successfully', async () => {
      const sampleData = { records: [{ id: 1, name: 'Test' }] };
      vi.mocked(axios.post).mockResolvedValue({ data: { imported: 1 } });

      const result = await sqlSchemaApi.importData(sampleData);

      expect(result.data).toEqual({ imported: 1 });
    });

    it('should handle import errors', async () => {
      const mockError = new Error('Failed to import data');
      vi.mocked(axios.post).mockRejectedValue(mockError);

      await expect(sqlSchemaApi.importData({})).rejects.toThrow('Failed to import data');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty schema list', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      const result = await sqlSchemaApi.getListAll();

      expect(result.data).toEqual([]);
    });

    it('should handle empty entity model list', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      const result = await sqlSchemaApi.getEntityModelList();

      expect(result.data).toEqual([]);
    });

    it('should handle empty generated tables', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [] });

      const result = await sqlSchemaApi.getGenTable('model-123');

      expect(result.data).toEqual([]);
    });

    it('should handle empty tables update', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: [] });

      const result = await sqlSchemaApi.updateTables('meta-123', []);

      expect(result.data).toEqual([]);
    });
  });
});

