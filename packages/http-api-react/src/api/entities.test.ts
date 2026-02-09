/**
 * Tests for Entities API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as entitiesApi from './entities';
import axios from '../config/axios';
import HelperFeatureFlags from '../utils/HelperFeatureFlags';

// Mock axios
vi.mock('../config/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock HelperFeatureFlags
vi.mock('../utils/HelperFeatureFlags', () => ({
  default: {
    isUseModelsInfo: vi.fn(),
  },
}));

describe('Entities API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEntity', () => {
    it('should call GET /platform-api/entity/{entityClass}/{entityId}', async () => {
      const mockResponse = { data: { id: '123', name: 'Test Entity' } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await entitiesApi.getEntity('TestClass', '123');

      expect(axios.get).toHaveBeenCalledWith('/platform-api/entity/TestClass/123');
      expect(result).toEqual(mockResponse);
    });

    it('should include query parameters when provided', async () => {
      const mockResponse = { data: { id: '123', name: 'Test Entity' } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await entitiesApi.getEntity('TestClass', '123', { fields: 'id,name' });

      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('?fields=id,name'));
    });
  });

  describe('searchEntities', () => {
    it('should call GET /platform-api/entity/{entityClass}/search', async () => {
      const mockResponse = { data: { _embedded: { entities: [] }, page: { totalElements: 0 } } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await entitiesApi.searchEntities('TestClass', { name: 'test' });

      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/platform-api/entity/TestClass/search'));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createEntity', () => {
    it('should call POST /platform-api/entity', async () => {
      const mockResponse = { data: { id: '123', name: 'New Entity' } };
      const entityRequest = { entityClass: 'TestClass', values: { name: 'New Entity' } } as any;
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await entitiesApi.createEntity(entityRequest);

      expect(axios.post).toHaveBeenCalledWith('/platform-api/entity', entityRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateEntity', () => {
    it('should call PUT /platform-api/entity/{entityClass}/{entityId}', async () => {
      const mockResponse = { data: { id: '123', name: 'Updated Entity' } };
      const entityRequest = { entityClass: 'TestClass', id: '123', values: { name: 'Updated Entity' } } as any;
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      const result = await entitiesApi.updateEntity('TestClass', '123', entityRequest);

      expect(axios.put).toHaveBeenCalledWith('/platform-api/entity/TestClass/123', entityRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteEntity', () => {
    it('should call DELETE /platform-api/entity/{entityClass}/{entityId}', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.delete).mockResolvedValue(mockResponse);

      const result = await entitiesApi.deleteEntity('TestClass', '123');

      expect(axios.delete).toHaveBeenCalledWith('/platform-api/entity/TestClass/123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('validateEntity', () => {
    it('should call POST /platform-api/entity/validate', async () => {
      const mockResponse = { data: { valid: true, errors: [] } };
      const entityRequest = { entityClass: 'TestClass', values: { name: 'Test' } };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await entitiesApi.validateEntity(entityRequest);

      expect(axios.post).toHaveBeenCalledWith('/platform-api/entity/validate', entityRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getEntitySchema', () => {
    it('should call GET /platform-api/entity/{entityClass}/schema', async () => {
      const mockResponse = { data: { fields: [], relations: [] } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await entitiesApi.getEntitySchema('TestClass');

      expect(axios.get).toHaveBeenCalledWith('/platform-api/entity/TestClass/schema');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getEntityClasses', () => {
    it('should call GET /platform-api/entity/classes', async () => {
      const mockResponse = { data: ['Class1', 'Class2', 'Class3'] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await entitiesApi.getEntityClasses();

      expect(axios.get).toHaveBeenCalledWith('/platform-api/entity/classes');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('executeEntityTransition', () => {
    it('should call POST /platform-api/entity/{entityClass}/{entityId}/transition/{transition}', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await entitiesApi.executeEntityTransition('TestClass', '123', 'approve', ['value1']);

      expect(axios.post).toHaveBeenCalledWith(
        '/platform-api/entity/TestClass/123/transition/approve',
        { values: ['value1'] }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should work without values', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      await entitiesApi.executeEntityTransition('TestClass', '123', 'approve');

      expect(axios.post).toHaveBeenCalledWith(
        '/platform-api/entity/TestClass/123/transition/approve',
        { values: undefined }
      );
    });
  });

  describe('getRelatedEntities', () => {
    it('should call GET /platform-api/entity/{entityClass}/{entityId}/related/{relationPath}', async () => {
      const mockResponse = { data: { _embedded: { entities: [] } } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await entitiesApi.getRelatedEntities('TestClass', '123', 'children');

      expect(axios.get).toHaveBeenCalledWith('/platform-api/entity/TestClass/123/related/children');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getEntityTransactions', () => {
    it('should call GET /platform-api/entity/{entityClass}/{entityId}/transactions', async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await entitiesApi.getEntityTransactions('TestClass', '123');

      expect(axios.get).toHaveBeenCalledWith('/platform-api/entity/TestClass/123/transactions');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getTransactionDiff', () => {
    it('should call GET /platform-api/transaction/{transactionId}/diff', async () => {
      const mockResponse = { data: { changes: [] } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await entitiesApi.getTransactionDiff('tx-456');

      expect(axios.get).toHaveBeenCalledWith('/platform-api/transaction/tx-456/diff');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('exportEntities', () => {
    it('should call GET /platform-api/entity/{entityClass}/export with format', async () => {
      const mockResponse = { data: new Blob() };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await entitiesApi.exportEntities('TestClass', undefined, 'csv');

      expect(axios.get).toHaveBeenCalledWith(
        '/platform-api/entity/TestClass/export?format=csv',
        { responseType: 'blob' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should default to csv format', async () => {
      const mockResponse = { data: new Blob() };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await entitiesApi.exportEntities('TestClass');

      expect(axios.get).toHaveBeenCalledWith(
        '/platform-api/entity/TestClass/export?format=csv',
        { responseType: 'blob' }
      );
    });
  });

  describe('importEntities', () => {
    it('should call POST /platform-api/entity/{entityClass}/import with file', async () => {
      const mockResponse = { data: { imported: 10, errors: [] } };
      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await entitiesApi.importEntities('TestClass', mockFile, 'csv');

      expect(axios.post).toHaveBeenCalledWith(
        '/platform-api/entity/TestClass/import',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getEntityCount', () => {
    it('should call GET /platform-api/entity/{entityClass}/count', async () => {
      const mockResponse = { data: { count: 42 } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await entitiesApi.getEntityCount('TestClass');

      expect(axios.get).toHaveBeenCalledWith('/platform-api/entity/TestClass/count');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getReportingFetchTypes', () => {
    describe('when VITE_FEATURE_FLAG_USE_MODELS_INFO is disabled', () => {
      beforeEach(() => {
        vi.mocked(HelperFeatureFlags.isUseModelsInfo).mockReturnValue(false);
      });

      it('should call GET /platform-api/entity-info/fetch/types', async () => {
        const mockResponse = { data: ['Type1', 'Type2'] };
        vi.mocked(axios.get).mockResolvedValue(mockResponse);

        const result = await entitiesApi.getReportingFetchTypes();

        expect(axios.get).toHaveBeenCalledWith('/platform-api/entity-info/fetch/types?onlyDynamic=false');
        expect(result).toEqual(mockResponse);
      });

      it('should support onlyDynamic parameter', async () => {
        const mockResponse = { data: ['DynamicType1'] };
        vi.mocked(axios.get).mockResolvedValue(mockResponse);

        await entitiesApi.getReportingFetchTypes(true);

        expect(axios.get).toHaveBeenCalledWith('/platform-api/entity-info/fetch/types?onlyDynamic=true');
      });
    });

    describe('when VITE_FEATURE_FLAG_USE_MODELS_INFO is enabled', () => {
      beforeEach(() => {
        vi.mocked(HelperFeatureFlags.isUseModelsInfo).mockReturnValue(true);
      });

      it('should call GET /platform-api/entity-info/fetch/models-info', async () => {
        const mockResponse = {
          data: [
            { name: 'com.cyoda.core.Entity', type: 'BUSINESS' },
            { name: 'com.cyoda.core.User', type: 'PERSISTENCE' },
          ],
        };
        vi.mocked(axios.get).mockResolvedValue(mockResponse);

        const result = await entitiesApi.getReportingFetchTypes();

        expect(axios.get).toHaveBeenCalledWith('/platform-api/entity-info/fetch/models-info?onlyDynamic=false');
        expect(result).toEqual(mockResponse);
      });

      it('should support onlyDynamic parameter with models-info endpoint', async () => {
        const mockResponse = {
          data: [
            { name: 'com.cyoda.dynamic.Entity', type: 'BUSINESS' },
          ],
        };
        vi.mocked(axios.get).mockResolvedValue(mockResponse);

        await entitiesApi.getReportingFetchTypes(true);

        expect(axios.get).toHaveBeenCalledWith('/platform-api/entity-info/fetch/models-info?onlyDynamic=true');
      });

      it('should return entities with type information for filtering', async () => {
        const mockResponse = {
          data: [
            { name: 'com.cyoda.business.Customer', type: 'BUSINESS' },
            { name: 'com.cyoda.core.constraints.UniqueConstraintOwner', type: 'PERSISTENCE' },
            { name: 'com.cyoda.business.Order', type: 'BUSINESS' },
          ],
        };
        vi.mocked(axios.get).mockResolvedValue(mockResponse);

        const result = await entitiesApi.getReportingFetchTypes();

        expect(result.data).toHaveLength(3);
        expect(result.data[0]).toHaveProperty('type', 'BUSINESS');
        expect(result.data[1]).toHaveProperty('type', 'PERSISTENCE');
        expect(result.data[2]).toHaveProperty('type', 'BUSINESS');
      });
    });
  });

  describe('cloneEntity', () => {
    it('should call POST /platform-api/entity/{entityClass}/{entityId}/clone', async () => {
      const mockResponse = { data: { id: '456', name: 'Cloned Entity' } };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await entitiesApi.cloneEntity('TestClass', '123');

      expect(axios.post).toHaveBeenCalledWith('/platform-api/entity/TestClass/123/clone');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getEntityAuditLog', () => {
    it('should call GET /platform-api/entity/{entityClass}/{entityId}/audit', async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await entitiesApi.getEntityAuditLog('TestClass', '123');

      expect(axios.get).toHaveBeenCalledWith('/platform-api/entity/TestClass/123/audit');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCyodaCloudEntity', () => {
    it('should call GET /entity/{entityId} without transactionId', async () => {
      const mockResponse = { data: { id: '123', name: 'Test Entity', field: 'value' } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await entitiesApi.getCyodaCloudEntity('entity-uuid-123');

      expect(axios.get).toHaveBeenCalledWith('/entity/entity-uuid-123', { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it('should call GET /entity/{entityId} with transactionId when provided', async () => {
      const mockResponse = { data: { id: '123', name: 'Test Entity at Transaction' } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await entitiesApi.getCyodaCloudEntity('entity-uuid-123', 'txn-456');

      expect(axios.get).toHaveBeenCalledWith('/entity/entity-uuid-123', { params: { transactionId: 'txn-456' } });
      expect(result).toEqual(mockResponse);
    });

    it('should encode entityId in URL', async () => {
      const mockResponse = { data: { id: 'special/id' } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await entitiesApi.getCyodaCloudEntity('special/id');

      expect(axios.get).toHaveBeenCalledWith('/entity/special%2Fid', { params: undefined });
    });

    it('should return entity data as Record<string, unknown>', async () => {
      const mockEntityData = {
        id: '123',
        name: 'Test Entity',
        nested: { field: 'value' },
        array: [1, 2, 3],
      };
      vi.mocked(axios.get).mockResolvedValue({ data: mockEntityData });

      const result = await entitiesApi.getCyodaCloudEntity('entity-uuid-123');

      expect(result.data).toEqual(mockEntityData);
      expect(result.data).toHaveProperty('nested');
      expect(result.data).toHaveProperty('array');
    });
  });
});

