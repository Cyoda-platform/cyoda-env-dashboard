/**
 * Entity hooks
 * Provides React hooks for entity operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import * as entitiesApi from '../api/entities';
import type { Entity, EntityRequest, Transaction, TransactionDiff, RelatedPath } from '../types';

/**
 * Hook to get an entity by ID
 */
export function useEntity(
  entityClass: string,
  entityId: string,
  params?: any,
  options?: Omit<UseQueryOptions<Entity>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['entities', entityClass, entityId, params],
    queryFn: async () => {
      const response = await entitiesApi.getEntity(entityClass, entityId, params);
      return response.data;
    },
    enabled: !!entityClass && !!entityId,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook to search entities
 */
export function useSearchEntities(
  entityClass: string,
  searchParams: any,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['entities', entityClass, 'search', searchParams],
    queryFn: async () => {
      const response = await entitiesApi.searchEntities(entityClass, searchParams);
      return response.data;
    },
    enabled: !!entityClass,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook to get entity schema/metadata
 */
export function useEntitySchema(
  entityClass: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['entities', entityClass, 'schema'],
    queryFn: async () => {
      const response = await entitiesApi.getEntitySchema(entityClass);
      return response.data;
    },
    enabled: !!entityClass,
    staleTime: 10 * 60 * 1000, // 10 minutes - schema doesn't change often
    ...options,
  });
}

/**
 * Hook to get all entity classes
 */
export function useEntityClasses(options?: Omit<UseQueryOptions<string[]>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['entities', 'classes'],
    queryFn: async () => {
      const response = await entitiesApi.getEntityClasses();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get entity transactions/history
 */
export function useEntityTransactions(
  entityClass: string,
  entityId: string,
  params?: any,
  options?: Omit<UseQueryOptions<{ _embedded: { transactions: Transaction[] } }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['entities', entityClass, entityId, 'transactions', params],
    queryFn: async () => {
      const response = await entitiesApi.getEntityTransactions(entityClass, entityId, params);
      return response.data;
    },
    enabled: !!entityClass && !!entityId,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook to get transaction diff
 */
export function useTransactionDiff(
  transactionId: string,
  options?: Omit<UseQueryOptions<TransactionDiff[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['transactions', transactionId, 'diff'],
    queryFn: async () => {
      const response = await entitiesApi.getTransactionDiff(transactionId);
      return response.data;
    },
    enabled: !!transactionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to get entity related paths
 */
export function useEntityRelatedPaths(
  entityClass: string,
  options?: Omit<UseQueryOptions<RelatedPath[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['entities', entityClass, 'relatedPaths'],
    queryFn: async () => {
      const response = await entitiesApi.getEntityRelatedPaths(entityClass);
      return response.data;
    },
    enabled: !!entityClass,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to get related entities
 */
export function useRelatedEntities(
  entityClass: string,
  entityId: string,
  relationPath: string,
  params?: any,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['entities', entityClass, entityId, 'related', relationPath, params],
    queryFn: async () => {
      const response = await entitiesApi.getRelatedEntities(entityClass, entityId, relationPath, params);
      return response.data;
    },
    enabled: !!entityClass && !!entityId && !!relationPath,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook to get entity column values (for autocomplete/filters)
 */
export function useEntityColumnValues(
  entityClass: string,
  columnPath: string,
  params?: any,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['entities', entityClass, 'column', columnPath, 'values', params],
    queryFn: async () => {
      const response = await entitiesApi.getEntityColumnValues(entityClass, columnPath, params);
      return response.data;
    },
    enabled: !!entityClass && !!columnPath,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to get available transitions for entity
 */
export function useEntityTransitions(
  entityClass: string,
  entityId: string,
  options?: Omit<UseQueryOptions<string[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['entities', entityClass, entityId, 'transitions'],
    queryFn: async () => {
      const response = await entitiesApi.getEntityTransitions(entityClass, entityId);
      return response.data;
    },
    enabled: !!entityClass && !!entityId,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook to get entity count
 */
export function useEntityCount(
  entityClass: string,
  params?: any,
  options?: Omit<UseQueryOptions<{ count: number }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['entities', entityClass, 'count', params],
    queryFn: async () => {
      const response = await entitiesApi.getEntityCount(entityClass, params);
      return response.data;
    },
    enabled: !!entityClass,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook to create an entity
 */
export function useCreateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entityRequest: EntityRequest) => {
      const response = await entitiesApi.createEntity(entityRequest);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entities', variables.entityClass] });
    },
  });
}

/**
 * Hook to update an entity
 */
export function useUpdateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entityClass,
      entityId,
      entityRequest,
    }: {
      entityClass: string;
      entityId: string;
      entityRequest: EntityRequest;
    }) => {
      const response = await entitiesApi.updateEntity(entityClass, entityId, entityRequest);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entities', variables.entityClass, variables.entityId] });
      queryClient.invalidateQueries({ queryKey: ['entities', variables.entityClass, 'search'] });
    },
  });
}

/**
 * Hook to delete an entity
 */
export function useDeleteEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entityClass, entityId }: { entityClass: string; entityId: string }) => {
      const response = await entitiesApi.deleteEntity(entityClass, entityId);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entities', variables.entityClass] });
    },
  });
}

/**
 * Hook to validate an entity
 */
export function useValidateEntity() {
  return useMutation({
    mutationFn: async (entityRequest: EntityRequest) => {
      const response = await entitiesApi.validateEntity(entityRequest);
      return response.data;
    },
  });
}

/**
 * Hook to execute entity transition
 */
export function useExecuteEntityTransition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entityClass,
      entityId,
      transition,
      values,
    }: {
      entityClass: string;
      entityId: string;
      transition: string;
      values?: any[];
    }) => {
      const response = await entitiesApi.executeEntityTransition(entityClass, entityId, transition, values);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entities', variables.entityClass, variables.entityId] });
      queryClient.invalidateQueries({ queryKey: ['entities', variables.entityClass, variables.entityId, 'transactions'] });
    },
  });
}

/**
 * Hook to clone an entity
 */
export function useCloneEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entityClass, entityId }: { entityClass: string; entityId: string }) => {
      const response = await entitiesApi.cloneEntity(entityClass, entityId);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entities', variables.entityClass] });
    },
  });
}

