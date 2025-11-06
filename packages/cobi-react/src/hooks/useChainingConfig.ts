/**
 * Chaining Configuration Hooks
 * React Query hooks for chaining configuration operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import * as chainingConfigApi from '../api/chainingConfigApi';
import type { ChainingConfigDto } from '../types';

/**
 * Hook to get all chaining configurations
 */
export function useChainingConfigs(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['chainingConfig', 'list'],
    queryFn: async () => {
      const response = await chainingConfigApi.getListAll();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to get a specific chaining configuration
 */
export function useChainingConfig(
  id: string | null,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['chainingConfig', 'detail', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await chainingConfigApi.getById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to get chaining configuration history
 */
export function useChainingConfigHistory(
  id: string | null,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['chainingConfig', 'history', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await chainingConfigApi.getHistory(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to save chaining configuration
 */
export function useSaveChainingConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChainingConfigDto) => chainingConfigApi.postSave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chainingConfig', 'list'] });
    },
  });
}

/**
 * Hook to delete chaining configuration
 */
export function useDeleteChainingConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => chainingConfigApi.deleteById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chainingConfig', 'list'] });
    },
  });
}

/**
 * Hook to export all COBI
 */
export function useExportAllCobi() {
  return useMutation({
    mutationFn: () => chainingConfigApi.exportAllCobi(),
  });
}

/**
 * Hook to import COBI configuration
 */
export function useImportCobiConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { data: any; params?: any }) => chainingConfigApi.importCobiConfig(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chainingConfig', 'list'] });
    },
  });
}

