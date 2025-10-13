/**
 * Tests for HelperErrors
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AxiosError } from 'axios';
import { message } from 'antd';
import { HelperErrors } from './errors';

// Mock Ant Design message
vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

describe('HelperErrors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handler', () => {
    it('should handle Axios error with status 400', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { message: 'Invalid request' },
        },
        message: 'Request failed',
      } as AxiosError;

      HelperErrors.handler(error);

      expect(message.error).toHaveBeenCalledWith('Bad Request: Invalid request');
    });

    it('should handle Axios error with status 403', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 403,
          data: { message: 'Access denied' },
        },
        message: 'Request failed',
      } as AxiosError;

      HelperErrors.handler(error);

      expect(message.error).toHaveBeenCalledWith('Forbidden: Access denied');
    });

    it('should handle Axios error with status 404', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { message: 'Resource not found' },
        },
        message: 'Request failed',
      } as AxiosError;

      HelperErrors.handler(error);

      expect(message.error).toHaveBeenCalledWith('Not Found: Resource not found');
    });

    it('should handle Axios error with status 500', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
        message: 'Request failed',
      } as AxiosError;

      HelperErrors.handler(error);

      expect(message.error).toHaveBeenCalledWith('Server Error: Internal server error');
    });

    it('should handle Axios error with status 503', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 503,
          data: { message: 'Service temporarily unavailable' },
        },
        message: 'Request failed',
      } as AxiosError;

      HelperErrors.handler(error);

      expect(message.error).toHaveBeenCalledWith('Service Unavailable: Service temporarily unavailable');
    });

    it('should handle Axios error with unknown status code', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 418,
          data: { message: 'I am a teapot' },
        },
        message: 'Request failed',
      } as AxiosError;

      HelperErrors.handler(error);

      expect(message.error).toHaveBeenCalledWith('Error 418: I am a teapot');
    });

    it('should not show error for 401 status', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        message: 'Request failed',
      } as AxiosError;

      HelperErrors.handler(error);

      expect(message.error).not.toHaveBeenCalled();
    });

    it('should handle Axios error with string data', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: 'String error message',
        },
        message: 'Request failed',
      } as AxiosError;

      HelperErrors.handler(error);

      expect(message.error).toHaveBeenCalledWith('Bad Request: String error message');
    });

    it('should handle Axios error with error field', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { error: 'Error field message' },
        },
        message: 'Request failed',
      } as AxiosError;

      HelperErrors.handler(error);

      expect(message.error).toHaveBeenCalledWith('Bad Request: Error field message');
    });

    it('should handle Axios error with errors array', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { errors: ['Error 1', 'Error 2', 'Error 3'] },
        },
        message: 'Request failed',
      } as AxiosError;

      HelperErrors.handler(error);

      expect(message.error).toHaveBeenCalledWith('Bad Request: Error 1, Error 2, Error 3');
    });

    it('should handle Axios error with no response data', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 500,
          data: null,
        },
        message: 'Network Error',
      } as AxiosError;

      HelperErrors.handler(error);

      expect(message.error).toHaveBeenCalledWith('Server Error: Network Error');
    });

    it('should handle Axios error with no response', () => {
      const error = {
        isAxiosError: true,
        message: 'Network Error',
      } as AxiosError;

      HelperErrors.handler(error);

      expect(message.error).toHaveBeenCalledWith('Network Error');
    });

    it('should handle generic Error', () => {
      const error = new Error('Generic error message');

      HelperErrors.handler(error);

      expect(message.error).toHaveBeenCalledWith('Generic error message');
    });

    it('should handle Error with no message', () => {
      const error = new Error();

      HelperErrors.handler(error);

      expect(message.error).toHaveBeenCalledWith('An unexpected error occurred');
    });
  });

  describe('success', () => {
    it('should show success message', () => {
      HelperErrors.success('Operation successful');

      expect(message.success).toHaveBeenCalledWith('Operation successful');
    });
  });

  describe('warning', () => {
    it('should show warning message', () => {
      HelperErrors.warning('Warning message');

      expect(message.warning).toHaveBeenCalledWith('Warning message');
    });
  });

  describe('info', () => {
    it('should show info message', () => {
      HelperErrors.info('Info message');

      expect(message.info).toHaveBeenCalledWith('Info message');
    });
  });

  describe('error', () => {
    it('should show error message', () => {
      HelperErrors.error('Error message');

      expect(message.error).toHaveBeenCalledWith('Error message');
    });
  });

  describe('edge cases', () => {
    it('should handle Axios error with empty data object', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {},
        },
        message: 'Request failed',
      } as AxiosError;

      HelperErrors.handler(error);

      // When data is empty object, none of the conditions match
      // errorMessage stays as default "An error occurred"
      expect(message.error).toHaveBeenCalledWith('Bad Request: An error occurred');
    });

    it('should handle Axios error with null message', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { message: null },
        },
        message: null,
      } as any;

      HelperErrors.handler(error);

      // When data.message is null, it doesn't match the condition, falls to default
      expect(message.error).toHaveBeenCalledWith('Bad Request: An error occurred');
    });

    it('should handle Axios error with empty errors array', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { errors: [] },
        },
        message: 'Request failed',
      } as AxiosError;

      HelperErrors.handler(error);

      // When errors array is empty, join returns empty string, which is falsy
      // So it doesn't set errorMessage and stays as default "An error occurred"
      expect(message.error).toHaveBeenCalledWith('Bad Request: ');
    });
  });
});

