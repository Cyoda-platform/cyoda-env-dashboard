/**
 * Entity Types Hook
 * React Query hook for fetching entity types/classes
 * Always uses real Cyoda backend data - no mock fallback
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from '../api/axios';

/**
 * Get reporting fetch types (entity classes)
 */
function getReportingFetchTypes(onlyDynamic = false) {
  return axios.get<string[]>(`/platform-api/entity-info/fetch/types?onlyDynamic=${onlyDynamic}`);
}

/**
 * Hook to get entity types (entity classes)
 * Uses the platform API to fetch available entity types
 * Always uses real backend data - no mock fallback
 */
export function useEntityTypes(
  onlyDynamic = false,
  options?: Omit<UseQueryOptions<string[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['entityTypes', onlyDynamic],
    queryFn: async () => {
      const response = await getReportingFetchTypes(onlyDynamic);
      // Always return real backend data (even if empty)
      return Array.isArray(response.data) ? response.data : [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - entity types don't change often
    initialData: [], // Provide empty array as initial data
    ...options,
  });
}

export default useEntityTypes;

