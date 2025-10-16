/**
 * Data Mapping Hooks
 * React Query hooks for data mapping operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import * as dataMappingApi from '../api/dataMappingApi';
import type { MappingConfigDto } from '../types';

/**
 * Hook to get all data types
 */
export function useDataTypes(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['dataMapping', 'dataTypes'],
    queryFn: async () => {
      const response = await dataMappingApi.getListAllDataTypes();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get all transformers
 */
export function useTransformers(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['dataMapping', 'transformers'],
    queryFn: async () => {
      const response = await dataMappingApi.getListAllTransformers();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get all dictionaries
 */
export function useDictionaries(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['dataMapping', 'dictionaries'],
    queryFn: async () => {
      const response = await dataMappingApi.getListAllDictionaries();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get all functions
 */
export function useFunctions(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['dataMapping', 'functions'],
    queryFn: async () => {
      const response = await dataMappingApi.getListAllFunctions();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get function examples
 */
export function useFunctionExamples(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['dataMapping', 'functionExamples'],
    queryFn: async () => {
      const response = await dataMappingApi.getListExamplesFunctions();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get all data mappings
 */
export function useDataMappings(
  withSampleContent = true,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['dataMapping', 'list', withSampleContent],
    queryFn: async () => {
      const response = await dataMappingApi.getListAllDataMappings(withSampleContent);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to get a specific data mapping
 */
export function useDataMapping(
  id: string | null,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['dataMapping', 'detail', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await dataMappingApi.getDataMapping(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to get entity classes
 */
export function useEntityClasses(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['dataMapping', 'entityClasses'],
    queryFn: async () => {
      const response = await dataMappingApi.getEntityClasses();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get entity info
 */
export function useEntityInfo(
  entityClass: string | null,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['dataMapping', 'entityInfo', entityClass],
    queryFn: async () => {
      if (!entityClass) return null;
      const response = await dataMappingApi.getEntityInfo(entityClass);
      return response.data;
    },
    enabled: !!entityClass,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get entity schema
 */
export function useEntitySchema(
  entityClass: string | null,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['dataMapping', 'entitySchema', entityClass],
    queryFn: async () => {
      if (!entityClass) return null;
      const response = await dataMappingApi.getEntitySchema(entityClass);
      return response.data;
    },
    enabled: !!entityClass,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get COBI meta parameters
 */
export function useCobiMetaParams(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['dataMapping', 'cobiMetaParams'],
    queryFn: async () => {
      const response = await dataMappingApi.getListAllCobiMetaParams();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get mapping history
 */
export function useMappingHistory(
  id: string | null,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['dataMapping', 'history', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await dataMappingApi.getHistory(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to save data mapping
 */
export function useSaveDataMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MappingConfigDto) => dataMappingApi.postSave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataMapping', 'list'] });
    },
  });
}

/**
 * Hook to dry run data mapping
 */
export function useDryRunDataMapping() {
  return useMutation({
    mutationFn: (data: MappingConfigDto) => dataMappingApi.dryRun(data),
  });
}

/**
 * Hook to delete data mapping
 */
export function useDeleteDataMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dataMappingApi.deleteDataMapping(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataMapping', 'list'] });
    },
  });
}

/**
 * Hook to parse sample content
 */
export function useParseSampleContent() {
  return useMutation({
    mutationFn: (data: { dataType: string; content: string; parserParameters?: any }) =>
      dataMappingApi.parseSampleContent(data),
  });
}

/**
 * Hook to export all COBI
 */
export function useExportAllCobi() {
  return useMutation({
    mutationFn: () => dataMappingApi.exportAllCobi(),
  });
}

/**
 * Hook to import COBI config
 */
export function useImportCobiConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { data: any; params?: any }) => dataMappingApi.importCobiConfig(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataMapping', 'list'] });
    },
  });
}

