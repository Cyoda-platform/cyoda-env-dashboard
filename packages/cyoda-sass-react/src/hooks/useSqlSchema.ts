import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import sqlSchemaApi from '../api/sqlSchemaApi';
import type { SqlSchema } from '../types';

/**
 * Query keys for SQL schema operations
 */
export const sqlSchemaKeys = {
  all: ['sqlSchemas'] as const,
  lists: () => [...sqlSchemaKeys.all, 'list'] as const,
  list: () => [...sqlSchemaKeys.lists()] as const,
  details: () => [...sqlSchemaKeys.all, 'detail'] as const,
  detail: (id: string) => [...sqlSchemaKeys.details(), id] as const,
  entityModels: () => ['entityModels'] as const,
  genTables: (id: string) => ['genTables', id] as const,
};

/**
 * Hook to get all SQL schemas
 * @returns Query result with list of schemas
 */
export const useSchemas = () => {
  return useQuery({
    queryKey: sqlSchemaKeys.list(),
    queryFn: async () => {
      const { data } = await sqlSchemaApi.getListAll();
      return data;
    },
  });
};

/**
 * Hook to get SQL schema by ID
 * @param id - Schema ID (UUID)
 * @param enabled - Whether the query should run
 * @returns Query result with schema data
 */
export const useSchema = (id: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: sqlSchemaKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Schema ID is required');
      const { data } = await sqlSchemaApi.getSchemaById(id);
      return data;
    },
    enabled: enabled && !!id,
  });
};

/**
 * Hook to create or update SQL schema
 * @returns Mutation for creating/updating schema
 */
export const useSaveSchema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (schema: SqlSchema) => {
      const { data } = await sqlSchemaApi.saveSchema(schema);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sqlSchemaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sqlSchemaKeys.detail(data.id || '') });
      message.success('Schema saved successfully');
    },
    onError: (error: any) => {
      message.error(error?.message || 'Failed to save schema');
    },
  });
};

/**
 * Hook to delete SQL schema
 * @returns Mutation for deleting schema
 */
export const useDeleteSchema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (schemaId: string) => {
      await sqlSchemaApi.delete(schemaId);
      return schemaId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sqlSchemaKeys.lists() });
      message.success('Schema deleted successfully');
    },
    onError: (error: any) => {
      message.error(error?.message || 'Failed to delete schema');
    },
  });
};

/**
 * Hook to get entity models
 * @returns Query result with list of entity models
 */
export const useEntityModels = () => {
  return useQuery({
    queryKey: sqlSchemaKeys.entityModels(),
    queryFn: async () => {
      const { data } = await sqlSchemaApi.getEntityModelList();
      return data;
    },
  });
};

/**
 * Hook to generate tables from entity model
 * @param id - Entity model ID
 * @param enabled - Whether the query should run
 * @returns Query result with generated tables
 */
export const useGenTables = (id: string | undefined, enabled = false) => {
  return useQuery({
    queryKey: sqlSchemaKeys.genTables(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Entity model ID is required');
      const { data } = await sqlSchemaApi.getGenTable(id);
      return data;
    },
    enabled: enabled && !!id,
  });
};

/**
 * Hook to update tables for a schema
 * @returns Mutation for updating tables
 */
export const useUpdateTables = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ metaId, tables }: { metaId: string; tables: any[] }) => {
      const { data } = await sqlSchemaApi.updateTables(metaId, tables);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sqlSchemaKeys.lists() });
      message.success('Tables updated successfully');
    },
    onError: (error: any) => {
      message.error(error?.message || 'Failed to update tables');
    },
  });
};

/**
 * Hook to import sample data
 * @returns Mutation for importing data
 */
export const useImportData = () => {
  return useMutation({
    mutationFn: async (sampleData: any) => {
      const { data } = await sqlSchemaApi.importData(sampleData);
      return data;
    },
    onSuccess: () => {
      message.success('Data imported successfully');
    },
    onError: (error: any) => {
      message.error(error?.message || 'Failed to import data');
    },
  });
};

