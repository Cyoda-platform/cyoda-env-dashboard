/**
 * useErrorHandler Hook
 * Centralized error handling for async operations
 */

import { useState, useCallback } from 'react';
import { message } from 'antd';

export interface ErrorDetails {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export interface UseErrorHandlerReturn {
  error: ErrorDetails | null;
  isError: boolean;
  handleError: (error: any, context?: string) => void;
  clearError: () => void;
  showErrorMessage: (errorMessage: string) => void;
}

/**
 * Hook for handling errors with user-friendly messages
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<ErrorDetails | null>(null);

  const handleError = useCallback((error: any, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);

    let errorDetails: ErrorDetails;

    // Handle different error types
    if (error?.response) {
      // HTTP error response
      const status = error.response.status;
      const data = error.response.data;

      errorDetails = {
        message: getHttpErrorMessage(status, data),
        code: data?.code || `HTTP_${status}`,
        statusCode: status,
        details: data,
      };
    } else if (error?.message) {
      // JavaScript Error object
      errorDetails = {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      };
    } else if (typeof error === 'string') {
      // String error
      errorDetails = {
        message: error,
        code: 'STRING_ERROR',
      };
    } else {
      // Unknown error type
      errorDetails = {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        details: error,
      };
    }

    setError(errorDetails);

    // Show user-friendly message
    message.error(errorDetails.message);

    return errorDetails;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const showErrorMessage = useCallback((errorMessage: string) => {
    message.error(errorMessage);
  }, []);

  return {
    error,
    isError: error !== null,
    handleError,
    clearError,
    showErrorMessage,
  };
};

/**
 * Get user-friendly error message based on HTTP status code
 */
function getHttpErrorMessage(status: number, data?: any): string {
  // Try to get message from response data
  if (data?.message) {
    return data.message;
  }

  // Default messages based on status code
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'You are not authorized. Please log in and try again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 408:
      return 'Request timeout. Please try again.';
    case 409:
      return 'Conflict. The resource already exists or is in use.';
    case 422:
      return 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Bad gateway. The server is temporarily unavailable.';
    case 503:
      return 'Service unavailable. Please try again later.';
    case 504:
      return 'Gateway timeout. The server took too long to respond.';
    default:
      if (status >= 500) {
        return 'Server error. Please try again later.';
      } else if (status >= 400) {
        return 'Request error. Please check your input and try again.';
      }
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Retry helper for failed operations
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error?.message === 'Network Error' ||
    error?.code === 'ECONNABORTED' ||
    error?.code === 'ERR_NETWORK' ||
    !error?.response
  );
};

/**
 * Check if error is a timeout error
 */
export const isTimeoutError = (error: any): boolean => {
  return (
    error?.code === 'ECONNABORTED' ||
    error?.message?.includes('timeout') ||
    error?.response?.status === 408 ||
    error?.response?.status === 504
  );
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: any): boolean => {
  return error?.response?.status === 401 || error?.response?.status === 403;
};

export default useErrorHandler;

