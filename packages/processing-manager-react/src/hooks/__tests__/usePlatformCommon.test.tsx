/**
 * Tests for usePlatformCommon hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useEntityTypes,
  useCompositeIndexes,
  useReindexCompositeIndex,
  useCreateCompositeIndex,
  useDeleteCompositeIndex,
  useExportCompositeIndexes,
  useImportCompositeIndexes,
  useCachesList,
  useCacheKeys,
  useInvalidateCache,
  useNetworkServerInfo,
  useNetworkClients,
  useZkCurrNodeInfo,
  useZkOnlineNodes,
  useZkShardsDistribution,
  useZkClusterState,
  platformCommonKeys,
} from '../usePlatformCommon';
import * as httpApiReact from '@cyoda/http-api-react';

// Mock the http-api-react module
vi.mock('@cyoda/http-api-react', () => ({
  getAllCompositeIndexes: vi.fn(),
  postCompositeIndexesReindex: vi.fn(),
  postCompositeIndexesCreate: vi.fn(),
  postCompositeIndexesDelete: vi.fn(),
  postCompositeIndexesExportByIds: vi.fn(),
  postCompositeIndexesImport: vi.fn(),
  getCachesList: vi.fn(),
  getInvalidateCache: vi.fn(),
  getCacheKeys: vi.fn(),
  getNetInfoServer: vi.fn(),
  getNetInfoClients: vi.fn(),
  getZkInfoCurrNodeInfo: vi.fn(),
  getZkInfoLoadedOnlineNodes: vi.fn(),
  getZkInfoLoadedShardsDistribution: vi.fn(),
  getZkInfoClusterState: vi.fn(),
  getReportingFetchTypes: vi.fn(),
}));

// Helper to create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePlatformCommon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Query Keys Tests
  // ============================================================================

  describe('platformCommonKeys', () => {
    it('should generate correct query keys', () => {
      expect(platformCommonKeys.all).toEqual(['platform-common']);
      expect(platformCommonKeys.entityTypes()).toEqual(['platform-common', 'entity-types']);
      expect(platformCommonKeys.compositeIndexes('Entity1')).toEqual(['platform-common', 'composite-indexes', 'Entity1']);
      expect(platformCommonKeys.caches()).toEqual(['platform-common', 'caches']);
      expect(platformCommonKeys.cacheKeys('cache1')).toEqual(['platform-common', 'cache-keys', 'cache1']);
      expect(platformCommonKeys.networkServer()).toEqual(['platform-common', 'network-server']);
      expect(platformCommonKeys.networkClients()).toEqual(['platform-common', 'network-clients']);
      expect(platformCommonKeys.zkCurrNode()).toEqual(['platform-common', 'zk-curr-node']);
      expect(platformCommonKeys.zkOnlineNodes()).toEqual(['platform-common', 'zk-online-nodes']);
      expect(platformCommonKeys.zkShardsDistribution()).toEqual(['platform-common', 'zk-shards-distribution']);
      expect(platformCommonKeys.zkClusterState()).toEqual(['platform-common', 'zk-cluster-state']);
    });
  });

  // ============================================================================
  // Entity Types Hooks Tests
  // ============================================================================

  describe('useEntityTypes', () => {
    it('should fetch entity types successfully', async () => {
      const mockData = ['Entity1', 'Entity2', 'Entity3'];
      vi.mocked(httpApiReact.getReportingFetchTypes).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useEntityTypes(), {
        wrapper: createWrapper(),
      });

      // Wait for the query to finish fetching
      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(httpApiReact.getReportingFetchTypes).toHaveBeenCalledWith(false);
    });

    it('should fetch only dynamic entity types when onlyDynamic is true', async () => {
      const mockData = ['DynamicEntity1', 'DynamicEntity2'];
      vi.mocked(httpApiReact.getReportingFetchTypes).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useEntityTypes(true), {
        wrapper: createWrapper(),
      });

      // Wait for the query to finish fetching
      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(httpApiReact.getReportingFetchTypes).toHaveBeenCalledWith(true);
    });

    it('should return empty array when API returns non-array', async () => {
      vi.mocked(httpApiReact.getReportingFetchTypes).mockResolvedValue({ data: null } as any);

      const { result } = renderHook(() => useEntityTypes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should handle API error', async () => {
      vi.mocked(httpApiReact.getReportingFetchTypes).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useEntityTypes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  // ============================================================================
  // Composite Indexes Hooks Tests
  // ============================================================================

  describe('useCompositeIndexes', () => {
    it('should fetch composite indexes successfully', async () => {
      const mockData = [
        { id: '1', name: 'Index1' },
        { id: '2', name: 'Index2' },
      ];
      vi.mocked(httpApiReact.getAllCompositeIndexes).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useCompositeIndexes('Entity1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(httpApiReact.getAllCompositeIndexes).toHaveBeenCalledWith('Entity1');
    });

    it('should not fetch when entity is undefined', async () => {
      const { result } = renderHook(() => useCompositeIndexes(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toBeUndefined();
      expect(httpApiReact.getAllCompositeIndexes).not.toHaveBeenCalled();
    });

    it('should return empty array when API returns non-array', async () => {
      vi.mocked(httpApiReact.getAllCompositeIndexes).mockResolvedValue({ data: null } as any);

      const { result } = renderHook(() => useCompositeIndexes('Entity1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should handle API error', async () => {
      vi.mocked(httpApiReact.getAllCompositeIndexes).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useCompositeIndexes('Entity1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useReindexCompositeIndex', () => {
    it('should reindex composite index successfully', async () => {
      const mockData = { success: true };
      vi.mocked(httpApiReact.postCompositeIndexesReindex).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useReindexCompositeIndex(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('index-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(httpApiReact.postCompositeIndexesReindex).toHaveBeenCalledWith('index-1');
    });

    it('should handle reindex error', async () => {
      vi.mocked(httpApiReact.postCompositeIndexesReindex).mockRejectedValue(new Error('Reindex failed'));

      const { result } = renderHook(() => useReindexCompositeIndex(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('index-1');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useCreateCompositeIndex', () => {
    it('should create composite index successfully', async () => {
      const mockData = { id: 'new-index', name: 'New Index' };
      vi.mocked(httpApiReact.postCompositeIndexesCreate).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useCreateCompositeIndex(), {
        wrapper: createWrapper(),
      });

      const indexData = { name: 'New Index', fields: ['field1', 'field2'] };
      result.current.mutate(indexData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(httpApiReact.postCompositeIndexesCreate).toHaveBeenCalledWith(indexData);
    });

    it('should handle create error', async () => {
      vi.mocked(httpApiReact.postCompositeIndexesCreate).mockRejectedValue(new Error('Create failed'));

      const { result } = renderHook(() => useCreateCompositeIndex(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ name: 'New Index' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useDeleteCompositeIndex', () => {
    it('should delete composite index successfully', async () => {
      const mockData = { success: true };
      vi.mocked(httpApiReact.postCompositeIndexesDelete).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useDeleteCompositeIndex(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('index-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(httpApiReact.postCompositeIndexesDelete).toHaveBeenCalledWith('index-1');
    });

    it('should handle delete error', async () => {
      vi.mocked(httpApiReact.postCompositeIndexesDelete).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useDeleteCompositeIndex(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('index-1');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useExportCompositeIndexes', () => {
    it('should export composite indexes successfully', async () => {
      const mockData = { exportData: 'base64string' };
      vi.mocked(httpApiReact.postCompositeIndexesExportByIds).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useExportCompositeIndexes(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(['index-1', 'index-2']);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(httpApiReact.postCompositeIndexesExportByIds).toHaveBeenCalledWith(['index-1', 'index-2']);
    });

    it('should handle export error', async () => {
      vi.mocked(httpApiReact.postCompositeIndexesExportByIds).mockRejectedValue(new Error('Export failed'));

      const { result } = renderHook(() => useExportCompositeIndexes(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(['index-1']);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useImportCompositeIndexes', () => {
    it('should import composite indexes successfully', async () => {
      const mockData = { success: true, imported: 2 };
      vi.mocked(httpApiReact.postCompositeIndexesImport).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useImportCompositeIndexes(), {
        wrapper: createWrapper(),
      });

      const importData = { data: 'base64string' };
      result.current.mutate(importData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(httpApiReact.postCompositeIndexesImport).toHaveBeenCalledWith(importData);
    });

    it('should handle import error', async () => {
      vi.mocked(httpApiReact.postCompositeIndexesImport).mockRejectedValue(new Error('Import failed'));

      const { result } = renderHook(() => useImportCompositeIndexes(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ data: 'invalid' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  // ============================================================================
  // Cache Hooks Tests
  // ============================================================================

  describe('useCachesList', () => {
    it('should fetch caches list successfully', async () => {
      const mockData = ['cache1', 'cache2', 'cache3'];
      vi.mocked(httpApiReact.getCachesList).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useCachesList(), {
        wrapper: createWrapper(),
      });

      // Wait for the query to finish fetching
      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(httpApiReact.getCachesList).toHaveBeenCalled();
    });

    it('should return empty array when API returns non-array', async () => {
      vi.mocked(httpApiReact.getCachesList).mockResolvedValue({ data: null } as any);

      const { result } = renderHook(() => useCachesList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should handle API error', async () => {
      vi.mocked(httpApiReact.getCachesList).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useCachesList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useCacheKeys', () => {
    it('should fetch cache keys successfully', async () => {
      const mockData = ['key1', 'key2', 'key3'];
      vi.mocked(httpApiReact.getCacheKeys).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useCacheKeys('cache1'), {
        wrapper: createWrapper(),
      });

      // Wait for the query to finish fetching
      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(httpApiReact.getCacheKeys).toHaveBeenCalledWith('cache1');
    });

    it('should not fetch when cacheType is undefined', async () => {
      const { result } = renderHook(() => useCacheKeys(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toEqual([]);
      expect(httpApiReact.getCacheKeys).not.toHaveBeenCalled();
    });

    it('should return empty array when API returns non-array', async () => {
      vi.mocked(httpApiReact.getCacheKeys).mockResolvedValue({ data: null } as any);

      const { result } = renderHook(() => useCacheKeys('cache1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should handle API error', async () => {
      vi.mocked(httpApiReact.getCacheKeys).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useCacheKeys('cache1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useInvalidateCache', () => {
    it('should invalidate cache successfully', async () => {
      const mockData = { success: true };
      vi.mocked(httpApiReact.getInvalidateCache).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useInvalidateCache(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('cache1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(httpApiReact.getInvalidateCache).toHaveBeenCalledWith('cache1');
    });

    it('should handle invalidate error', async () => {
      vi.mocked(httpApiReact.getInvalidateCache).mockRejectedValue(new Error('Invalidate failed'));

      const { result } = renderHook(() => useInvalidateCache(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('cache1');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  // ============================================================================
  // Network Info Hooks Tests
  // ============================================================================

  describe('useNetworkServerInfo', () => {
    it('should fetch network server info successfully', async () => {
      const mockData = { host: 'localhost', port: 8080 };
      vi.mocked(httpApiReact.getNetInfoServer).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useNetworkServerInfo(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(httpApiReact.getNetInfoServer).toHaveBeenCalled();
    });

    it('should handle API error', async () => {
      vi.mocked(httpApiReact.getNetInfoServer).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useNetworkServerInfo(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useNetworkClients', () => {
    it('should fetch network clients successfully', async () => {
      const mockData = [
        { id: 'client1', address: '192.168.1.1' },
        { id: 'client2', address: '192.168.1.2' },
      ];
      vi.mocked(httpApiReact.getNetInfoClients).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useNetworkClients(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(httpApiReact.getNetInfoClients).toHaveBeenCalled();
    });

    it('should handle API error', async () => {
      vi.mocked(httpApiReact.getNetInfoClients).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useNetworkClients(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  // ============================================================================
  // ZooKeeper Info Hooks Tests
  // ============================================================================

  describe('useZkCurrNodeInfo', () => {
    it('should fetch current node info successfully', async () => {
      const mockData = {
        nodeId: 'node-1',
        processingNode: true,
        shardIds: [1, 2, 3],
      };
      vi.mocked(httpApiReact.getZkInfoCurrNodeInfo).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useZkCurrNodeInfo(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(httpApiReact.getZkInfoCurrNodeInfo).toHaveBeenCalled();
    });

    it('should handle API error', async () => {
      vi.mocked(httpApiReact.getZkInfoCurrNodeInfo).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useZkCurrNodeInfo(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useZkOnlineNodes', () => {
    it('should fetch online nodes successfully', async () => {
      const mockData = {
        nodesIds: ['node-1', 'node-2'],
        nodes: [
          { nodeId: 'node-1', processingNode: true },
          { nodeId: 'node-2', processingNode: false },
        ],
      };
      vi.mocked(httpApiReact.getZkInfoLoadedOnlineNodes).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useZkOnlineNodes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(httpApiReact.getZkInfoLoadedOnlineNodes).toHaveBeenCalled();
    });

    it('should handle API error', async () => {
      vi.mocked(httpApiReact.getZkInfoLoadedOnlineNodes).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useZkOnlineNodes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useZkShardsDistribution', () => {
    it('should fetch shards distribution successfully', async () => {
      const mockData = {
        nodesIds: ['node-1', 'node-2'],
        shardsByNodes: {
          'node-1': [1, 2, 3],
          'node-2': [4, 5, 6],
        },
      };
      vi.mocked(httpApiReact.getZkInfoLoadedShardsDistribution).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useZkShardsDistribution(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(httpApiReact.getZkInfoLoadedShardsDistribution).toHaveBeenCalled();
    });

    it('should handle API error', async () => {
      vi.mocked(httpApiReact.getZkInfoLoadedShardsDistribution).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useZkShardsDistribution(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useZkClusterState', () => {
    it('should fetch cluster state successfully', async () => {
      const mockData = {
        nodesIds: ['node-1', 'node-2'],
        nodes: [
          { nodeId: 'node-1', processingNode: true },
          { nodeId: 'node-2', processingNode: false },
        ],
      };
      vi.mocked(httpApiReact.getZkInfoClusterState).mockResolvedValue({ data: mockData } as any);

      const { result } = renderHook(() => useZkClusterState(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(httpApiReact.getZkInfoClusterState).toHaveBeenCalled();
    });

    it('should handle API error', async () => {
      vi.mocked(httpApiReact.getZkInfoClusterState).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useZkClusterState(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });
});

