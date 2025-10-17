/**
 * Data Source Configuration Hooks
 * React Query hooks for data source configuration operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import * as dataSourceConfigApi from '../api/dataSourceConfigApi';
import type { DataSourceConfigDto } from '../types';

/**
 * Hook to get all data source configurations
 */
export function useDataSourceConfigs(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['dataSourceConfig', 'list'],
    queryFn: async () => {
      const response = await dataSourceConfigApi.getListAll();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to get a specific data source configuration
 */
export function useDataSourceConfig(
  id: string | null,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['dataSourceConfig', 'detail', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await dataSourceConfigApi.getById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to get available auth types
 */
export function useAvailableAuthTypes(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['dataSourceConfig', 'authTypes'],
    queryFn: async () => {
      const response = await dataSourceConfigApi.getAvailableAuthType();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get auth type configuration
 */
export function useAuthTypeConfig(
  authType: string | null,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['dataSourceConfig', 'authTypeConfig', authType],
    queryFn: async () => {
      if (!authType) return null;
      const response = await dataSourceConfigApi.getAvailableAuthTypeConfig(authType);
      return response.data;
    },
    enabled: !!authType,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get proxy configuration
 */
export function useProxyConfig(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['dataSourceConfig', 'proxy'],
    queryFn: async () => {
      const response = await dataSourceConfigApi.getProxy();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get available data sources
 */
export function useDataSources(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['dataSourceConfig', 'datasources'],
    queryFn: async () => {
      const response = await dataSourceConfigApi.datasources();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to get plugins setup
 */
export function usePluginsSetup(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['dataSourceConfig', 'pluginsSetup'],
    queryFn: async () => {
      const response = await dataSourceConfigApi.pluginsSetup();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get auth service configs
 */
export function useAuthServiceConfigs(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['dataSourceConfig', 'authServiceConfigs'],
    queryFn: async () => {
      const response = await dataSourceConfigApi.authServiceConfigs();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get auth response parser configs
 */
export function useAuthRespParserConfigs(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['dataSourceConfig', 'authRespParserConfigs'],
    queryFn: async () => {
      const response = await dataSourceConfigApi.authRespParserConfigs();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get configuration history
 */
export function useConfigHistory(
  id: string | null,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['dataSourceConfig', 'history', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await dataSourceConfigApi.getHistory(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to save data source configuration
 */
export function useSaveDataSourceConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DataSourceConfigDto) => dataSourceConfigApi.postSave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSourceConfig', 'list'] });
    },
  });
}

/**
 * Hook to delete data source configuration
 */
export function useDeleteDataSourceConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dataSourceConfigApi.deleteById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSourceConfig', 'list'] });
    },
  });
}

/**
 * Hook to check endpoint connection
 */
export function useCheckEndpointConnection() {
  return useMutation({
    mutationFn: (data: any) => dataSourceConfigApi.postCheckEndpointConnection(data),
  });
}

/**
 * Hook to verify template calculation
 */
export function useVerifyTemplateCalc() {
  return useMutation({
    mutationFn: (data: any) => dataSourceConfigApi.verifyTemplateCalc(data),
  });
}

/**
 * Hook to request data from data source
 */
export function useDataSourceRequest() {
  return useMutation({
    mutationFn: (data: any) => dataSourceConfigApi.request(data),
  });
}

/**
 * Hook to get request result
 */
export function useRequestResult(
  id: string | null,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['dataSourceConfig', 'requestResult', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await dataSourceConfigApi.result(id);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 2000, // Poll every 2 seconds
    ...options,
  });
}

/**
 * Hook to get request state
 */
export function useRequestState(
  id: string | null,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['dataSourceConfig', 'requestState', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await dataSourceConfigApi.resultState(id);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 2000, // Poll every 2 seconds
    ...options,
  });
}

/**
 * Hook to get statistics for root
 */
export function useStatisticsForRoot() {
  return useMutation({
    mutationFn: (data: any) => dataSourceConfigApi.getStatisticsForRoot(data),
  });
}

/**
 * Hook to get statistics for child
 */
export function useStatisticsForChild() {
  return useMutation({
    mutationFn: (data: any) => dataSourceConfigApi.getStatisticsForChild(data),
  });
}

/**
 * Hook to import COBI configuration
 */
export function useImportCobiConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { data: any; params?: any }) => dataSourceConfigApi.importCobiConfig(params),
    onSuccess: () => {
      // Invalidate and refetch data source configs
      queryClient.invalidateQueries({ queryKey: ['dataSourceConfig'] });
    },
  });
}
