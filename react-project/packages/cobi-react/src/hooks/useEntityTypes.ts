/**
 * Entity Types Hook
 * React Query hook for fetching entity types/classes
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from '../api/axios';

// Mock data for development when backend is not available
const MOCK_ENTITY_TYPES = [
  'com.cyoda.tms.model.entities.Account',
  'com.cyoda.tms.model.entities.Transaction',
  'com.cyoda.tms.model.entities.Customer',
  'com.cyoda.tms.model.entities.Product',
  'com.cyoda.tms.model.entities.Order',
  'com.cyoda.tms.model.entities.Payment',
  'com.cyoda.tms.model.entities.Invoice',
  'com.cyoda.tms.model.entities.User',
];

/**
 * Get reporting fetch types (entity classes)
 */
function getReportingFetchTypes(onlyDynamic = false) {
  return axios.get<string[]>(`/platform-api/entity-info/fetch/types?onlyDynamic=${onlyDynamic}`);
}

/**
 * Hook to get entity types (entity classes)
 * Uses the platform API to fetch available entity types
 * Falls back to mock data if API is unavailable (for development)
 */
export function useEntityTypes(
  onlyDynamic = false,
  options?: Omit<UseQueryOptions<string[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['entityTypes', onlyDynamic],
    queryFn: async () => {
      try {
        const response = await getReportingFetchTypes(onlyDynamic);
        return response.data;
      } catch (error) {
        console.warn('Failed to fetch entity types from API, using mock data:', error);
        // Return mock data for development
        return MOCK_ENTITY_TYPES;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - entity types don't change often
    ...options,
  });
}

export default useEntityTypes;

