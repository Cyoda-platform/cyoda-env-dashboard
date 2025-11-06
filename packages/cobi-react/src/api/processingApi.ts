/**
 * Processing API
 * API endpoints for processing transactions
 * 
 * Migrated from: .old_project/packages/cobi/src/stores/cobi-processing.ts
 */

import axios from './axios';

/**
 * Get status of transaction
 */
export function getStatusOfTransactions(transactionId: string) {
  return axios.get(`/platform-processing/transactions/view?transactionId=${transactionId}`);
}

/**
 * Get transaction entity changes
 */
export function getTransactionEntityChanges(params: any) {
  return axios.get('/platform-processing/transactions/view/entity-changes', { params });
}

/**
 * Get all transactions
 */
export function getAllTransactions(params?: any) {
  return axios.get('/platform-processing/transactions', { params });
}

/**
 * Cancel transaction
 */
export function cancelTransaction(transactionId: string) {
  return axios.post(`/platform-processing/transactions/${transactionId}/cancel`);
}

/**
 * Retry transaction
 */
export function retryTransaction(transactionId: string) {
  return axios.post(`/platform-processing/transactions/${transactionId}/retry`);
}

