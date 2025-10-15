/**
 * Platform Common Hooks
 *
 * React Query hooks for Platform Common API operations.
 * Provides hooks for composite indexes, caches, network info, and ZooKeeper info.
 *
 * @module usePlatformCommon
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllCompositeIndexes,
  postCompositeIndexesReindex,
  postCompositeIndexesCreate,
  postCompositeIndexesDelete,
  getCachesList,
  getInvalidateCache,
  getCacheKeys,
  getNetInfoServer,
  getNetInfoClients,
  getZkInfoCurrNodeInfo,
  getZkInfoLoadedOnlineNodes,
  getZkInfoLoadedShardsDistribution,
  getZkInfoClusterState,
  getReportingFetchTypes,
} from '@cyoda/http-api-react';

// ============================================================================
// Query Keys
// ============================================================================

export const platformCommonKeys = {
  all: ['platform-common'] as const,

  // Entity Types
  entityTypes: () => [...platformCommonKeys.all, 'entity-types'] as const,

  // Composite Indexes
  compositeIndexes: (entity?: string) => [...platformCommonKeys.all, 'composite-indexes', entity] as const,

  // Caches
  caches: () => [...platformCommonKeys.all, 'caches'] as const,
  cacheKeys: (cacheType: string) => [...platformCommonKeys.all, 'cache-keys', cacheType] as const,

  // Network Info
  networkServer: () => [...platformCommonKeys.all, 'network-server'] as const,
  networkClients: () => [...platformCommonKeys.all, 'network-clients'] as const,

  // ZooKeeper Info
  zkCurrNode: () => [...platformCommonKeys.all, 'zk-curr-node'] as const,
  zkOnlineNodes: () => [...platformCommonKeys.all, 'zk-online-nodes'] as const,
  zkShardsDistribution: () => [...platformCommonKeys.all, 'zk-shards-distribution'] as const,
  zkClusterState: () => [...platformCommonKeys.all, 'zk-cluster-state'] as const,
};

// ============================================================================
// Entity Types Hooks
// ============================================================================

/**
 * Get entity types (for dropdown options)
 */
export function useEntityTypes(onlyDynamic = false) {
  return useQuery({
    queryKey: platformCommonKeys.entityTypes(),
    queryFn: async () => {
      const { data } = await getReportingFetchTypes(onlyDynamic);
      return data;
    },
  });
}

// ============================================================================
// Composite Indexes Hooks
// ============================================================================

/**
 * Get all composite indexes for an entity
 */
export function useCompositeIndexes(entity?: string) {
  return useQuery({
    queryKey: platformCommonKeys.compositeIndexes(entity),
    queryFn: async () => {
      if (!entity) return [];
      const { data } = await getAllCompositeIndexes(entity);
      return data;
    },
    enabled: !!entity,
  });
}

/**
 * Reindex a composite index
 */
export function useReindexCompositeIndex() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (indexId: string) => {
      const { data } = await postCompositeIndexesReindex(indexId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformCommonKeys.all });
    },
  });
}

/**
 * Create a composite index
 */
export function useCreateCompositeIndex() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (indexData: any) => {
      const { data } = await postCompositeIndexesCreate(indexData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformCommonKeys.all });
    },
  });
}

/**
 * Delete a composite index
 */
export function useDeleteCompositeIndex() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (indexId: string) => {
      const { data } = await postCompositeIndexesDelete(indexId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformCommonKeys.all });
    },
  });
}

// ============================================================================
// Cache Hooks
// ============================================================================

/**
 * Get caches list
 */
export function useCachesList() {
  return useQuery({
    queryKey: platformCommonKeys.caches(),
    queryFn: async () => {
      const { data } = await getCachesList();
      return data;
    },
  });
}

/**
 * Get cache keys for a specific cache type
 */
export function useCacheKeys(cacheType?: string) {
  return useQuery({
    queryKey: platformCommonKeys.cacheKeys(cacheType || ''),
    queryFn: async () => {
      if (!cacheType) return [];
      const { data } = await getCacheKeys(cacheType);
      return data;
    },
    enabled: !!cacheType,
  });
}

/**
 * Invalidate a cache
 */
export function useInvalidateCache() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cacheType: string) => {
      const { data } = await getInvalidateCache(cacheType);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformCommonKeys.caches() });
    },
  });
}

// ============================================================================
// Network Info Hooks
// ============================================================================

/**
 * Get network server info
 */
export function useNetworkServerInfo() {
  return useQuery({
    queryKey: platformCommonKeys.networkServer(),
    queryFn: async () => {
      const { data } = await getNetInfoServer();
      return data;
    },
  });
}

/**
 * Get network clients
 */
export function useNetworkClients() {
  return useQuery({
    queryKey: platformCommonKeys.networkClients(),
    queryFn: async () => {
      const { data } = await getNetInfoClients();
      return data;
    },
  });
}

// ============================================================================
// ZooKeeper Info Hooks
// ============================================================================

/**
 * Get current node info
 */
export function useZkCurrNodeInfo() {
  return useQuery({
    queryKey: platformCommonKeys.zkCurrNode(),
    queryFn: async () => {
      const { data } = await getZkInfoCurrNodeInfo();
      return data;
    },
  });
}

/**
 * Get loaded online nodes
 */
export function useZkOnlineNodes() {
  return useQuery({
    queryKey: platformCommonKeys.zkOnlineNodes(),
    queryFn: async () => {
      const { data } = await getZkInfoLoadedOnlineNodes();
      return data;
    },
  });
}

/**
 * Get loaded shards distribution
 */
export function useZkShardsDistribution() {
  return useQuery({
    queryKey: platformCommonKeys.zkShardsDistribution(),
    queryFn: async () => {
      const { data } = await getZkInfoLoadedShardsDistribution();
      return data;
    },
  });
}

/**
 * Get cluster state
 */
export function useZkClusterState() {
  return useQuery({
    queryKey: platformCommonKeys.zkClusterState(),
    queryFn: async () => {
      const { data } = await getZkInfoClusterState();
      return data;
    },
  });
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  // Entity Types
  useEntityTypes,

  // Composite Indexes
  useCompositeIndexes,
  useReindexCompositeIndex,
  useCreateCompositeIndex,
  useDeleteCompositeIndex,

  // Caches
  useCachesList,
  useCacheKeys,
  useInvalidateCache,

  // Network Info
  useNetworkServerInfo,
  useNetworkClients,

  // ZooKeeper Info
  useZkCurrNodeInfo,
  useZkOnlineNodes,
  useZkShardsDistribution,
  useZkClusterState,
};

