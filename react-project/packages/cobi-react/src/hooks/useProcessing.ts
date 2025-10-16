/**
 * Processing Hooks
 * React Query hooks for processing operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import * as processingApi from '../api/processingApi';

/**
 * Hook to get transaction status
 */
export function useTransactionStatus(
  transactionId: string | null,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['processing', 'transaction', transactionId],
    queryFn: async () => {
      if (!transactionId) return null;
      const response = await processingApi.getStatusOfTransactions(transactionId);
      return response.data;
    },
    enabled: !!transactionId,
    refetchInterval: 3000, // Poll every 3 seconds
    ...options,
  });
}

/**
 * Hook to get all transactions
 */
export function useTransactions(
  params?: any,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['processing', 'transactions', params],
    queryFn: async () => {
      const response = await processingApi.getAllTransactions(params);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook to get transaction entity changes
 */
export function useTransactionEntityChanges(
  params: any,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['processing', 'entityChanges', params],
    queryFn: async () => {
      const response = await processingApi.getTransactionEntityChanges(params);
      return response.data;
    },
    enabled: !!params,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook to cancel transaction
 */
export function useCancelTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) => processingApi.cancelTransaction(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processing', 'transactions'] });
    },
  });
}

/**
 * Hook to retry transaction
 */
export function useRetryTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) => processingApi.retryTransaction(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processing', 'transactions'] });
    },
  });
}

