/**
 * Tests for Source Configuration hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAllConfigs, useEncompassConfigs, useJdbcConfigs } from './useSourceConfig';

// Mock the http-api-react module with a factory function
vi.mock('@cyoda/http-api-react', () => ({
  axios: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock antd message
vi.mock('antd', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSourceConfig hooks', () => {
  let mockAxios: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Get the mocked axios from the module
    const httpApiReact = await import('@cyoda/http-api-react');
    mockAxios = httpApiReact.axios;
  });

  describe('useEncompassConfigs', () => {
    it('should fetch encompass configurations', async () => {
      const mockConfigs = [
        {
          id: '1',
          name: 'Test CSV Config',
          fileType: 'CSV' as const,
          columnMappingConfigs: [],
        },
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockConfigs });

      const { result } = renderHook(() => useEncompassConfigs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockConfigs);
      expect(mockAxios.get).toHaveBeenCalledWith('/encompass/upload-config/list-configs');
    });
  });

  describe('useJdbcConfigs', () => {
    it('should fetch JDBC configurations', async () => {
      const mockConfigs = [
        {
          id: '1',
          name: 'Test JDBC Config',
          srcSql: 'SELECT * FROM table',
          columnMappingConfigs: [],
        },
      ];

      mockAxios.get.mockResolvedValueOnce({ data: mockConfigs });

      const { result } = renderHook(() => useJdbcConfigs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockConfigs);
      expect(mockAxios.get).toHaveBeenCalledWith('/wk/jdbc-source-config/list-configs');
    });
  });

  describe('useAllConfigs', () => {
    it('should combine encompass and JDBC configurations', async () => {
      const mockEncompassConfigs = [
        {
          id: '1',
          name: 'CSV Config',
          fileType: 'CSV' as const,
          columnMappingConfigs: [],
        },
      ];

      const mockJdbcConfigs = [
        {
          id: '2',
          name: 'JDBC Config',
          srcSql: 'SELECT * FROM table',
          columnMappingConfigs: [],
        },
      ];

      mockAxios.get
        .mockResolvedValueOnce({ data: mockEncompassConfigs })
        .mockResolvedValueOnce({ data: mockJdbcConfigs });

      const { result } = renderHook(() => useAllConfigs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data).toEqual([...mockEncompassConfigs, ...mockJdbcConfigs]);
    });
  });
});

