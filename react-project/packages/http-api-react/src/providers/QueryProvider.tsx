/**
 * React Query Provider
 * Provides React Query context to the application
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Default query client configuration
const defaultQueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 0,
    },
  },
};

// Create a singleton query client
let queryClientInstance: QueryClient | null = null;

/**
 * Get or create the query client instance
 */
export function getQueryClient(config = defaultQueryClientConfig): QueryClient {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient(config);
  }
  return queryClientInstance;
}

/**
 * Reset the query client instance (useful for testing)
 */
export function resetQueryClient(): void {
  queryClientInstance = null;
}

interface QueryProviderProps {
  children: React.ReactNode;
  client?: QueryClient;
  showDevtools?: boolean;
}

/**
 * Query Provider Component
 * Wraps the application with React Query context
 */
export function QueryProvider({ children, client, showDevtools = false }: QueryProviderProps) {
  const queryClient = client || getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevtools && import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default QueryProvider;

