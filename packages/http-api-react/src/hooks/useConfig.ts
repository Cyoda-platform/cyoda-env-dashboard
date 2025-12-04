/**
 * Configuration hooks
 * Provides React hooks for configuration and system operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import * as configApi from '../api/config';
import type {
  IDefinition,
  IDefinitionStream,
  CatalogItem,
  CatalogItemExportImportContainer,
  ServerInfo,
  ClusterState,
  NodeInfo,
} from '../types';

/**
 * Hook to get all definitions
 */
export function useDefinitions(
  params?: any,
  options?: Omit<UseQueryOptions<{ _embedded: { definitions: IDefinition[] } }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['config', 'definitions', params],
    queryFn: async () => {
      const response = await configApi.getDefinitions(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to get a specific definition
 */
export function useDefinition(
  definitionId: string,
  options?: Omit<UseQueryOptions<IDefinition>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['config', 'definitions', definitionId],
    queryFn: async () => {
      const response = await configApi.getDefinition(definitionId);
      return response.data;
    },
    enabled: !!definitionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to get stream definitions
 */
export function useStreamDefinitions(
  params?: any,
  options?: Omit<UseQueryOptions<IDefinitionStream[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['config', 'streams', params],
    queryFn: async () => {
      const response = await configApi.getStreamDefinitions(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to get a specific stream definition
 */
export function useStreamDefinition(
  streamId: string,
  options?: Omit<UseQueryOptions<IDefinitionStream>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['config', 'streams', streamId],
    queryFn: async () => {
      const response = await configApi.getStreamDefinition(streamId);
      return response.data;
    },
    enabled: !!streamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to get catalog items
 */
export function useCatalogItems(
  params?: any,
  options?: Omit<UseQueryOptions<{ _embedded: { catalogItems: CatalogItem[] } }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['config', 'catalog', params],
    queryFn: async () => {
      const response = await configApi.getCatalogItems(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to get a specific catalog item
 */
export function useCatalogItem(
  itemId: string,
  options?: Omit<UseQueryOptions<CatalogItem>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['config', 'catalog', itemId],
    queryFn: async () => {
      const response = await configApi.getCatalogItem(itemId);
      return response.data;
    },
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to get server info
 */
export function useServerInfo(options?: Omit<UseQueryOptions<ServerInfo>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['config', 'serverInfo'],
    queryFn: async () => {
      const response = await configApi.getServerInfo();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get cluster state
 */
export function useClusterState(options?: Omit<UseQueryOptions<ClusterState>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['config', 'clusterState'],
    queryFn: async () => {
      const response = await configApi.getClusterState();
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    ...options,
  });
}

/**
 * Hook to get cluster nodes
 */
export function useClusterNodes(options?: Omit<UseQueryOptions<NodeInfo[]>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['config', 'clusterNodes'],
    queryFn: async () => {
      const response = await configApi.getClusterNodes();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to get system health
 */
export function useSystemHealth(
  options?: Omit<UseQueryOptions<{ status: string; checks: any[] }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['config', 'systemHealth'],
    queryFn: async () => {
      const response = await configApi.getSystemHealth();
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refetch every minute
    ...options,
  });
}

/**
 * Hook to get system metrics
 */
export function useSystemMetrics(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['config', 'systemMetrics'],
    queryFn: async () => {
      const response = await configApi.getSystemMetrics();
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook to get entity types
 */
export function useEntityTypes(options?: Omit<UseQueryOptions<string[]>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['config', 'entityTypes'],
    queryFn: async () => {
      const response = await configApi.getEntityTypes();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get entity type metadata
 */
export function useEntityTypeMetadata(
  entityType: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['config', 'entityTypes', entityType, 'metadata'],
    queryFn: async () => {
      const response = await configApi.getEntityTypeMetadata(entityType);
      return response.data;
    },
    enabled: !!entityType,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get feature flags
 */
export function useFeatureFlags(
  options?: Omit<UseQueryOptions<{ [key: string]: boolean }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['config', 'featureFlags'],
    queryFn: async () => {
      const response = await configApi.getFeatureFlags();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to get cache statistics
 */
export function useCacheStats(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['config', 'cacheStats'],
    queryFn: async () => {
      const response = await configApi.getCacheStats();
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to create a definition
 */
export function useCreateDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (definition: any) => {
      const response = await configApi.createDefinition(definition);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'definitions'] });
    },
  });
}

/**
 * Hook to update a definition
 */
export function useUpdateDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ definitionId, definition }: { definitionId: string; definition: any }) => {
      const response = await configApi.updateDefinition(definitionId, definition);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['config', 'definitions', variables.definitionId] });
      queryClient.invalidateQueries({ queryKey: ['config', 'definitions'] });
    },
  });
}

/**
 * Hook to delete a definition
 */
export function useDeleteDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (definitionId: string) => {
      const response = await configApi.deleteDefinition(definitionId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'definitions'] });
    },
  });
}

/**
 * Hook to create a stream definition
 */
export function useCreateStreamDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stream: IDefinitionStream) => {
      const response = await configApi.createStreamDefinition(stream);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'streams'] });
    },
  });
}

/**
 * Hook to update a stream definition
 */
export function useUpdateStreamDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ streamId, stream }: { streamId: string; stream: IDefinitionStream }) => {
      const response = await configApi.updateStreamDefinition(streamId, stream);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['config', 'streams', variables.streamId] });
      queryClient.invalidateQueries({ queryKey: ['config', 'streams'] });
    },
  });
}

/**
 * Hook to delete a stream definition
 */
export function useDeleteStreamDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamId: string) => {
      const response = await configApi.deleteStreamDefinition(streamId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'streams'] });
    },
  });
}

/**
 * Hook to create a catalog item
 */
export function useCreateCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: CatalogItem) => {
      const response = await configApi.createCatalogItem(item);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'catalog'] });
    },
  });
}

/**
 * Hook to update a catalog item
 */
export function useUpdateCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, item }: { itemId: string; item: CatalogItem }) => {
      const response = await configApi.updateCatalogItem(itemId, item);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['config', 'catalog', variables.itemId] });
      queryClient.invalidateQueries({ queryKey: ['config', 'catalog'] });
    },
  });
}

/**
 * Hook to delete a catalog item
 */
export function useDeleteCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await configApi.deleteCatalogItem(itemId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'catalog'] });
    },
  });
}

/**
 * Hook to export catalog items
 */
export function useExportCatalogItems() {
  return useMutation({
    mutationFn: async (itemIds: string[]) => {
      const response = await configApi.exportCatalogItems(itemIds);
      return response.data;
    },
  });
}

/**
 * Hook to import catalog items
 */
export function useImportCatalogItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (container: CatalogItemExportImportContainer) => {
      const response = await configApi.importCatalogItems(container);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'catalog'] });
    },
  });
}

/**
 * Hook to update feature flag
 */
export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ flagName, enabled }: { flagName: string; enabled: boolean }) => {
      const response = await configApi.updateFeatureFlag(flagName, enabled);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'featureFlags'] });
    },
  });
}

/**
 * Hook to clear cache
 */
export function useClearCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cacheType?: string) => {
      const response = await configApi.clearCache(cacheType);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'cacheStats'] });
    },
  });
}

