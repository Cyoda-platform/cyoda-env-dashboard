/**
 * Unit Tests: useErrorHandler Hook
 * Tests error handling, HTTP error mapping, and error utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorHandler, retryOperation, isNetworkError, isTimeoutError, isAuthError } from '../../hooks/useErrorHandler';
import { message } from 'antd';

// Mock antd message
vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
  },
}));

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  describe('Hook Initialization', () => {
    it('should initialize with no error', () => {
      const { result } = renderHook(() => useErrorHandler());

      expect(result.current.error).toBeNull();
      expect(result.current.isError).toBe(false);
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useErrorHandler());

      expect(typeof result.current.handleError).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.showErrorMessage).toBe('function');
    });
  });

  describe('handleError - JavaScript Errors', () => {
    it('should handle JavaScript Error objects', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Test error');

      act(() => {
        result.current.handleError(error);
      });

      expect(result.current.error).toEqual({
        message: 'Test error',
        code: 'UNKNOWN_ERROR',
      });
      expect(result.current.isError).toBe(true);
      expect(message.error).toHaveBeenCalledWith('Test error');
    });

    it('should handle errors with custom code', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = { message: 'Custom error', code: 'CUSTOM_CODE' };

      act(() => {
        result.current.handleError(error);
      });

      expect(result.current.error?.code).toBe('CUSTOM_CODE');
    });

    it('should handle string errors', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError('String error message');
      });

      expect(result.current.error).toEqual({
        message: 'String error message',
        code: 'STRING_ERROR',
      });
    });

    it('should handle unknown error types', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError({ unknown: 'error' });
      });

      expect(result.current.error?.message).toBe('An unexpected error occurred');
      expect(result.current.error?.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('handleError - HTTP Errors', () => {
    it('should handle 400 Bad Request', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = {
        response: {
          status: 400,
          data: {},
        },
      };

      act(() => {
        result.current.handleError(error);
      });

      expect(result.current.error?.message).toContain('Invalid request');
      expect(result.current.error?.statusCode).toBe(400);
    });

    it('should handle 401 Unauthorized', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = {
        response: {
          status: 401,
          data: {},
        },
      };

      act(() => {
        result.current.handleError(error);
      });

      expect(result.current.error?.message).toContain('not authorized');
      expect(result.current.error?.statusCode).toBe(401);
    });

    it('should handle 403 Forbidden', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = {
        response: {
          status: 403,
          data: {},
        },
      };

      act(() => {
        result.current.handleError(error);
      });

      expect(result.current.error?.message).toContain('permission');
      expect(result.current.error?.statusCode).toBe(403);
    });

    it('should handle 404 Not Found', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = {
        response: {
          status: 404,
          data: {},
        },
      };

      act(() => {
        result.current.handleError(error);
      });

      expect(result.current.error?.message).toContain('not found');
      expect(result.current.error?.statusCode).toBe(404);
    });

    it('should handle 500 Server Error', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = {
        response: {
          status: 500,
          data: {},
        },
      };

      act(() => {
        result.current.handleError(error);
      });

      expect(result.current.error?.message).toContain('Server error');
      expect(result.current.error?.statusCode).toBe(500);
    });

    it('should use custom message from response data', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = {
        response: {
          status: 400,
          data: {
            message: 'Custom error from server',
          },
        },
      };

      act(() => {
        result.current.handleError(error);
      });

      expect(result.current.error?.message).toBe('Custom error from server');
    });
  });

  describe('handleError - Context', () => {
    it('should log error with context', () => {
      const { result } = renderHook(() => useErrorHandler());
      const consoleErrorSpy = vi.spyOn(console, 'error');

      act(() => {
        result.current.handleError(new Error('Test'), 'updating task');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in updating task:',
        expect.any(Error)
      );
    });

    it('should log error without context', () => {
      const { result } = renderHook(() => useErrorHandler());
      const consoleErrorSpy = vi.spyOn(console, 'error');

      act(() => {
        result.current.handleError(new Error('Test'));
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error:',
        expect.any(Error)
      );
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(new Error('Test'));
      });

      expect(result.current.isError).toBe(true);

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isError).toBe(false);
    });
  });

  describe('showErrorMessage', () => {
    it('should show error message using antd message', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.showErrorMessage('Custom error');
      });

      expect(message.error).toHaveBeenCalledWith('Custom error');
    });
  });
});

describe('retryOperation', () => {
  it('should succeed on first attempt', async () => {
    const operation = vi.fn().mockResolvedValue('success');

    const result = await retryOperation(operation, 3, 10);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const result = await retryOperation(operation, 3, 10);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should throw error after max retries', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Always fails'));

    await expect(retryOperation(operation, 3, 10)).rejects.toThrow('Always fails');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const startTime = Date.now();
    await retryOperation(operation, 3, 10);
    const endTime = Date.now();

    // Should have waited at least 10ms + 20ms = 30ms
    expect(endTime - startTime).toBeGreaterThanOrEqual(20);
  });
});

describe('Error Type Checkers', () => {
  describe('isNetworkError', () => {
    it('should detect network errors', () => {
      expect(isNetworkError({ message: 'Network Error' })).toBe(true);
      expect(isNetworkError({ code: 'ECONNABORTED' })).toBe(true);
      expect(isNetworkError({ code: 'ERR_NETWORK' })).toBe(true);
      expect(isNetworkError({ message: 'Other error' })).toBe(true); // No response
    });

    it('should not detect non-network errors', () => {
      expect(isNetworkError({ response: { status: 500 } })).toBe(false);
    });
  });

  describe('isTimeoutError', () => {
    it('should detect timeout errors', () => {
      expect(isTimeoutError({ code: 'ECONNABORTED' })).toBe(true);
      expect(isTimeoutError({ message: 'Request timeout' })).toBe(true);
      expect(isTimeoutError({ response: { status: 408 } })).toBe(true);
      expect(isTimeoutError({ response: { status: 504 } })).toBe(true);
    });

    it('should not detect non-timeout errors', () => {
      expect(isTimeoutError({ message: 'Other error' })).toBe(false);
      expect(isTimeoutError({ response: { status: 500 } })).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('should detect authentication errors', () => {
      expect(isAuthError({ response: { status: 401 } })).toBe(true);
      expect(isAuthError({ response: { status: 403 } })).toBe(true);
    });

    it('should not detect non-auth errors', () => {
      expect(isAuthError({ response: { status: 400 } })).toBe(false);
      expect(isAuthError({ response: { status: 500 } })).toBe(false);
    });
  });
});

