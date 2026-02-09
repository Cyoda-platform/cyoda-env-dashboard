/**
 * Entity Data Hooks
 * Custom hooks for loading and managing entity data using React Query
 */

import { useQuery } from '@tanstack/react-query';
import { getEntityLoad, getCyodaCloudEntity, HelperFeatureFlags, type Entity } from '@cyoda/http-api-react';
import { HelperDetailEntity } from '@cyoda/tableau-react';

/**
 * Hook to load entity data using React Query
 *
 * @param instanceId - The instance ID to load
 * @param entityClassName - The entity class name
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns React Query result with entity data
 *
 * @example
 * ```typescript
 * const { data: entityData, isLoading, error } = useEntityLoad(
 *   instanceId,
 *   entityClassName
 * );
 * ```
 */
export function useEntityLoad(
  instanceId: string | undefined,
  entityClassName: string | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: ['entity-load', instanceId, entityClassName],
    queryFn: async () => {
      if (!instanceId || !entityClassName) {
        throw new Error('instanceId and entityClassName are required');
      }

      const { data } = await getEntityLoad(instanceId, entityClassName);
      const filtered = HelperDetailEntity.filterData(data);

      return filtered;
    },
    enabled: enabled && !!instanceId && !!entityClassName,
    // Don't retry on error - entity might not exist
    retry: false,
  });
}

/**
 * Hook to load entity data as raw JSON using Cyoda Cloud API
 *
 * @param instanceId - The instance ID to load
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns React Query result with raw entity JSON data
 *
 * @example
 * ```typescript
 * const { data: entityJson, isLoading, error } = useCyodaCloudEntity(instanceId);
 * ```
 */
export function useCyodaCloudEntity(
  instanceId: string | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: ['cyoda-cloud-entity', instanceId],
    queryFn: async () => {
      if (!instanceId) {
        throw new Error('instanceId is required');
      }

      const { data } = await getCyodaCloudEntity(instanceId);
      return data;
    },
    enabled: enabled && !!instanceId && HelperFeatureFlags.isCyodaCloud(),
    // Don't retry on error - entity might not exist
    retry: false,
  });
}

