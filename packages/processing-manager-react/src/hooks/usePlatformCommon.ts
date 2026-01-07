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
  postCompositeIndexesExportByIds,
  postCompositeIndexesImport,
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
  getCqlExecStatsTables,
  getCqlExecStatsAllTables,
  getCqlExecStatsAllTablesBrief,
  getCqlExecStatsTable,
  getCqlExecStatsClear,
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

  // CQL Execution Statistics
  cqlExecStats: () => [...platformCommonKeys.all, 'cql-exec-stats'] as const,
  cqlExecStatsTables: () => [...platformCommonKeys.all, 'cql-exec-stats', 'tables'] as const,
  cqlExecStatsAllTables: () => [...platformCommonKeys.all, 'cql-exec-stats', 'all-tables'] as const,
  cqlExecStatsTable: (table: string) => [...platformCommonKeys.all, 'cql-exec-stats', 'table', table] as const,
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
      // Ensure data is always an array
      return Array.isArray(data) ? data : [];
    },
    initialData: [], // Provide initial empty array
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
      // Ensure data is always an array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!entity,
    // Don't use initialData to avoid caching empty array
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

/**
 * Export composite indexes by IDs
 */
export function useExportCompositeIndexes() {
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data } = await postCompositeIndexesExportByIds(ids);
      return data;
    },
  });
}

/**
 * Import composite indexes
 */
export function useImportCompositeIndexes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { data: response } = await postCompositeIndexesImport(data);
      return response;
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
      try {
        const { data } = await getCachesList();
        // Ensure data is always an array
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('useCachesList: Error fetching caches list:', error);
        throw error;
      }
    },
    placeholderData: [], // Use placeholder instead of initialData to ensure query runs
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
      // Ensure data is always an array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!cacheType,
    placeholderData: [], // Use placeholder instead of initialData
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
// CQL Execution Statistics Hooks
// ============================================================================

/**
 * Get list of tracked tables
 */
export function useCqlExecStatsTables() {
  return useQuery({
    queryKey: platformCommonKeys.cqlExecStatsTables(),
    queryFn: async () => {
      try {
        const { data } = await getCqlExecStatsTables();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('useCqlExecStatsTables: Error fetching tables:', error);
        throw error;
      }
    },
    placeholderData: [],
  });
}

/**
 * Get full statistics for all tables (with per-operation and minute-level details)
 */
export function useCqlExecStatsAllTables() {
  return useQuery({
    queryKey: platformCommonKeys.cqlExecStatsAllTables(),
    queryFn: async () => {
      try {
        const { data } = await getCqlExecStatsAllTables();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('useCqlExecStatsAllTables: Error fetching stats:', error);
        throw error;
      }
    },
    placeholderData: [],
  });
}

/**
 * Get all tables brief statistics
 */
export function useCqlExecStatsAllTablesBrief() {
  return useQuery({
    queryKey: platformCommonKeys.cqlExecStats(),
    queryFn: async () => {
      try {
        const { data } = await getCqlExecStatsAllTablesBrief();
        // Ensure data is always an array
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('useCqlExecStatsAllTablesBrief: Error fetching stats:', error);
        throw error;
      }
    },
    placeholderData: [],
  });
}

/**
 * Get statistics for a specific table
 */
export function useCqlExecStatsTable(table?: string) {
  return useQuery({
    queryKey: platformCommonKeys.cqlExecStatsTable(table || ''),
    queryFn: async () => {
      if (!table) return null;
      try {
        const { data } = await getCqlExecStatsTable(table);
        return data;
      } catch (error) {
        console.error('useCqlExecStatsTable: Error fetching table stats:', error);
        throw error;
      }
    },
    enabled: !!table,
  });
}

/**
 * Clear CQL execution statistics
 */
export function useClearCqlExecStats() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await getCqlExecStatsClear();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformCommonKeys.cqlExecStats() });
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
  useExportCompositeIndexes,
  useImportCompositeIndexes,

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

  // CQL Execution Statistics
  useCqlExecStatsTables,
  useCqlExecStatsAllTables,
  useCqlExecStatsAllTablesBrief,
  useCqlExecStatsTable,
  useClearCqlExecStats,
};

