/**
 * Data Mapping Hooks
 * React Query hooks for data mapping operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import * as dataMappingApi from '../api/dataMappingApi';
import type { MappingConfigDto } from '../types';

// Mock data for development when backend is not available
const MOCK_DATA_MAPPINGS: MappingConfigDto[] = [];

// In-memory storage for development mode
let inMemoryMappings: MappingConfigDto[] = [...MOCK_DATA_MAPPINGS];

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
      try {
        const response = await dataMappingApi.getListAllDataMappings(withSampleContent);
        return response.data;
      } catch (error) {
        console.warn('Failed to fetch data mappings from API, using in-memory data:', error);
        // Return in-memory data for development
        return inMemoryMappings;
      }
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
      try {
        const response = await dataMappingApi.getDataMapping(id);
        return response.data;
      } catch (error) {
        console.warn('Failed to fetch data mapping from API, using in-memory data:', error);
        // Find in in-memory storage for development
        const mapping = inMemoryMappings.find(m => m.id === id || m.name === id);
        return mapping || null;
      }
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
 * Hook to get reporting info (entity fields and types for filter builder)
 */
export function useReportingInfo(
  entityClass: string | null,
  parentFldClass?: string,
  columnPath?: string,
  onlyRange?: boolean,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['dataMapping', 'reportingInfo', entityClass, parentFldClass, columnPath, onlyRange],
    queryFn: async () => {
      if (!entityClass) return null;
      const response = await dataMappingApi.getReportingInfo(entityClass, parentFldClass, columnPath, onlyRange);
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
    mutationFn: async (data: MappingConfigDto) => {
      try {
        const response = await dataMappingApi.postSave(data);
        return response;
      } catch (error) {
        console.warn('Failed to save to API, using in-memory storage:', error);
        // Save to in-memory storage for development
        let existingIndex = -1;

        // First, try to find by ID if it exists
        if (data.id) {
          existingIndex = inMemoryMappings.findIndex(m => m.id === data.id);
        }

        // If not found by ID and no ID exists, try to find by name (for updates where name didn't change)
        if (existingIndex < 0 && !data.id) {
          existingIndex = inMemoryMappings.findIndex(m => m.name === data.name);
        }

        if (existingIndex >= 0) {
          // Update existing - preserve the ID
          inMemoryMappings[existingIndex] = {
            ...data,
            id: inMemoryMappings[existingIndex].id,
          };
          console.log('Updated existing mapping:', inMemoryMappings[existingIndex]);
        } else {
          // Add new - generate new ID
          const newMapping = {
            ...data,
            id: data.id || `mapping-${Date.now()}`,
          };
          inMemoryMappings.push(newMapping);
          console.log('Created new mapping:', newMapping);
        }
        return { data };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataMapping', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['dataMapping', 'detail'] });
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
    mutationFn: async (id: string) => {
      try {
        const response = await dataMappingApi.deleteDataMapping(id);
        return response;
      } catch (error) {
        console.warn('Failed to delete from API, using in-memory storage:', error);
        // Delete from in-memory storage for development
        inMemoryMappings = inMemoryMappings.filter(m => m.id !== id && m.name !== id);
        return { data: { success: true } };
      }
    },
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

