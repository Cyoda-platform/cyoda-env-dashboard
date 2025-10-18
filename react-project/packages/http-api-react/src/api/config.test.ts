/**
 * Tests for Configuration API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as configApi from './config';
import axios from '../config/axios';

// Mock axios
vi.mock('../config/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Configuration API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDefinitions', () => {
    it('should call GET /platform-api/definitions', async () => {
      const mockResponse = { data: { _embedded: { definitions: [] } } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await configApi.getDefinitions();

      expect(axios.get).toHaveBeenCalledWith('/platform-api/definitions');
      expect(result).toEqual(mockResponse);
    });

    it('should include query parameters when provided', async () => {
      const mockResponse = { data: { _embedded: { definitions: [] } } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await configApi.getDefinitions({ fields: 'id,name' });

      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('?fields=id,name'));
    });
  });

  describe('getDefinition', () => {
    it('should call GET /platform-api/definitions/{definitionId}', async () => {
      const mockResponse = { data: { id: 'def-123', name: 'Test Definition' } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await configApi.getDefinition('def-123');

      expect(axios.get).toHaveBeenCalledWith('/platform-api/definitions/def-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createDefinition', () => {
    it('should call POST /platform-api/definitions', async () => {
      const mockResponse = { data: { id: 'def-123', name: 'New Definition' } };
      const definition = { name: 'New Definition', fields: [] };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await configApi.createDefinition(definition);

      expect(axios.post).toHaveBeenCalledWith('/platform-api/definitions', definition);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateDefinition', () => {
    it('should call PUT /platform-api/definitions/{definitionId}', async () => {
      const mockResponse = { data: { success: true } };
      const definition = { name: 'Updated Definition' };
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      const result = await configApi.updateDefinition('def-123', definition);

      expect(axios.put).toHaveBeenCalledWith('/platform-api/definitions/def-123', definition);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteDefinition', () => {
    it('should call DELETE /platform-api/definitions/{definitionId}', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.delete).mockResolvedValue(mockResponse);

      const result = await configApi.deleteDefinition('def-123');

      expect(axios.delete).toHaveBeenCalledWith('/platform-api/definitions/def-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDefinitionStreams', () => {
    it('should call GET /platform-api/definitions/{definitionId}/streams', async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await configApi.getDefinitionStreams('def-123');

      expect(axios.get).toHaveBeenCalledWith('/platform-api/definitions/def-123/streams');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCatalogItems', () => {
    it('should call GET /platform-api/catalog', async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await configApi.getCatalogItems();

      expect(axios.get).toHaveBeenCalledWith('/platform-api/catalog');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCatalogItem', () => {
    it('should call GET /platform-api/catalog/{itemId}', async () => {
      const mockResponse = { data: { id: 'item-123', name: 'Test Item' } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await configApi.getCatalogItem('item-123');

      expect(axios.get).toHaveBeenCalledWith('/platform-api/catalog/item-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createCatalogItem', () => {
    it('should call POST /platform-api/catalog', async () => {
      const mockResponse = { data: { id: 'item-123', name: 'New Item' } };
      const item = { name: 'New Item', type: 'report' };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await configApi.createCatalogItem(item);

      expect(axios.post).toHaveBeenCalledWith('/platform-api/catalog', item);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateCatalogItem', () => {
    it('should call PUT /platform-api/catalog/{itemId}', async () => {
      const mockResponse = { data: { success: true } };
      const item = { name: 'Updated Item' };
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      const result = await configApi.updateCatalogItem('item-123', item);

      expect(axios.put).toHaveBeenCalledWith('/platform-api/catalog/item-123', item);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteCatalogItem', () => {
    it('should call DELETE /platform-api/catalog/{itemId}', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.delete).mockResolvedValue(mockResponse);

      const result = await configApi.deleteCatalogItem('item-123');

      expect(axios.delete).toHaveBeenCalledWith('/platform-api/catalog/item-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('exportCatalogItems', () => {
    it('should call POST /platform-api/catalog/export', async () => {
      const mockResponse = { data: { items: [] } };
      const itemIds = ['item-1', 'item-2'];
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await configApi.exportCatalogItems(itemIds);

      expect(axios.post).toHaveBeenCalledWith('/platform-api/catalog/export', { itemIds });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('importCatalogItems', () => {
    it('should call POST /platform-api/catalog/import', async () => {
      const mockResponse = { data: { imported: 2 } };
      const container = { items: [] };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await configApi.importCatalogItems(container);

      expect(axios.post).toHaveBeenCalledWith('/platform-api/catalog/import', container);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getServerInfo', () => {
    it('should call GET /platform-api/info', async () => {
      const mockResponse = { data: { version: '1.0.0', environment: 'production' } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await configApi.getServerInfo();

      expect(axios.get).toHaveBeenCalledWith('/platform-api/info');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getClusterState', () => {
    it('should call GET /platform-api/cluster/state', async () => {
      const mockResponse = { data: { nodes: [], status: 'healthy' } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await configApi.getClusterState();

      expect(axios.get).toHaveBeenCalledWith('/platform-api/cluster/state');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getClusterNodes', () => {
    it('should call GET /platform-api/cluster/nodes', async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await configApi.getClusterNodes();

      expect(axios.get).toHaveBeenCalledWith('/platform-api/cluster/nodes');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getNodeInfo', () => {
    it('should call GET /platform-api/cluster/nodes/{nodeId}', async () => {
      const mockResponse = { data: { id: 'node-1', status: 'active' } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await configApi.getNodeInfo('node-1');

      expect(axios.get).toHaveBeenCalledWith('/platform-api/cluster/nodes/node-1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSystemConfig', () => {
    it('should call GET /platform-api/config', async () => {
      const mockResponse = { data: { settings: {} } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await configApi.getSystemConfig();

      expect(axios.get).toHaveBeenCalledWith('/platform-api/config');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateSystemConfig', () => {
    it('should call PUT /platform-api/config', async () => {
      const mockResponse = { data: { success: true } };
      const config = { settings: { key: 'value' } };
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      const result = await configApi.updateSystemConfig(config);

      expect(axios.put).toHaveBeenCalledWith('/platform-api/config', config);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getFeatureFlags', () => {
    it('should call GET /platform-api/features', async () => {
      const mockResponse = { data: { feature1: true, feature2: false } };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await configApi.getFeatureFlags();

      expect(axios.get).toHaveBeenCalledWith('/platform-api/features');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateFeatureFlag', () => {
    it('should call PUT /platform-api/features/{flagName}', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      const result = await configApi.updateFeatureFlag('feature1', true);

      expect(axios.put).toHaveBeenCalledWith('/platform-api/features/feature1', { enabled: true });
      expect(result).toEqual(mockResponse);
    });
  });
});

