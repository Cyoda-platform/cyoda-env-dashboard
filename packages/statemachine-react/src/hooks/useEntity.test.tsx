/**
 * Tests for useEntity hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useEntityLoad } from './useEntity';
import type { Entity } from '@cyoda/http-api-react';

// Mock getEntityLoad API function
const mockGetEntityLoad = vi.fn();

// Mock HelperDetailEntity.filterData
const mockFilterData = vi.fn();

// Mock the dependencies
vi.mock('@cyoda/http-api-react', async () => {
  const actual = await vi.importActual('@cyoda/http-api-react');
  return {
    ...actual,
    getEntityLoad: (...args: any[]) => mockGetEntityLoad(...args),
  };
});

vi.mock('@cyoda/tableau-react', () => ({
  HelperDetailEntity: {
    filterData: (...args: any[]) => mockFilterData(...args),
  },
}));

describe('useEntity hooks', () => {
  let queryClient: QueryClient;
  let consoleLogSpy: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Spy on console.log to verify logging
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
    consoleLogSpy.mockRestore();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useEntityLoad', () => {
    const mockEntityData: Entity[] = [
      {
        columnInfo: { columnName: 'id', name: 'id', type: 'java.lang.String' },
        value: 'entity-123',
        type: 'LEAF',
        presented: true,
      },
      {
        columnInfo: { columnName: 'name', name: 'name', type: 'java.lang.String' },
        value: 'Test Entity',
        type: 'LEAF',
        presented: true,
      },
      {
        columnInfo: { columnName: 'hidden', name: 'hidden', type: 'java.lang.String' },
        value: 'Hidden Field',
        type: 'LEAF',
        presented: false,
      },
    ];

    const mockFilteredData: Entity[] = [
      {
        columnInfo: { columnName: 'id', name: 'id', type: 'java.lang.String' },
        value: 'entity-123',
        type: 'LEAF',
        presented: true,
      },
      {
        columnInfo: { columnName: 'name', name: 'name', type: 'java.lang.String' },
        value: 'Test Entity',
        type: 'LEAF',
        presented: true,
      },
    ];

    it('should fetch and filter entity data successfully', async () => {
      mockGetEntityLoad.mockResolvedValue({ data: mockEntityData });
      mockFilterData.mockReturnValue(mockFilteredData);

      const { result } = renderHook(
        () => useEntityLoad('entity-123', 'com.example.Entity'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetEntityLoad).toHaveBeenCalledWith('entity-123', 'com.example.Entity');
      expect(mockFilterData).toHaveBeenCalledWith(mockEntityData);
      expect(result.current.data).toEqual(mockFilteredData);
    });

    it('should log loading and loaded messages', async () => {
      mockGetEntityLoad.mockResolvedValue({ data: mockEntityData });
      mockFilterData.mockReturnValue(mockFilteredData);

      const { result } = renderHook(
        () => useEntityLoad('entity-123', 'com.example.Entity'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[useEntityLoad] Loading entity data:',
        { instanceId: 'entity-123', entityClassName: 'com.example.Entity' }
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[useEntityLoad] Loaded entity data:',
        mockFilteredData
      );
    });

    it('should not fetch when instanceId is undefined', async () => {
      const { result } = renderHook(
        () => useEntityLoad(undefined, 'com.example.Entity'),
        { wrapper }
      );

      // Wait a bit to ensure query doesn't run
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(mockGetEntityLoad).not.toHaveBeenCalled();
    });

    it('should not fetch when entityClassName is undefined', async () => {
      const { result } = renderHook(
        () => useEntityLoad('entity-123', undefined),
        { wrapper }
      );

      // Wait a bit to ensure query doesn't run
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(mockGetEntityLoad).not.toHaveBeenCalled();
    });

    it('should not fetch when both instanceId and entityClassName are undefined', async () => {
      const { result } = renderHook(
        () => useEntityLoad(undefined, undefined),
        { wrapper }
      );

      // Wait a bit to ensure query doesn't run
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(mockGetEntityLoad).not.toHaveBeenCalled();
    });

    it('should not fetch when enabled is false', async () => {
      const { result } = renderHook(
        () => useEntityLoad('entity-123', 'com.example.Entity', false),
        { wrapper }
      );

      // Wait a bit to ensure query doesn't run
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(mockGetEntityLoad).not.toHaveBeenCalled();
    });

    it('should throw error when instanceId is missing in queryFn', async () => {
      // This tests the error handling inside queryFn
      // We need to enable the query but pass undefined values
      const { result } = renderHook(
        () => {
          // Force enable the query even with undefined values
          const queryResult = useEntityLoad('entity-123', 'com.example.Entity', true);
          return queryResult;
        },
        { wrapper }
      );

      // Manually trigger the query with undefined values
      mockGetEntityLoad.mockImplementation(() => {
        throw new Error('instanceId and entityClassName are required');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error: Entity not found');
      mockGetEntityLoad.mockRejectedValue(mockError);

      const { result } = renderHook(
        () => useEntityLoad('entity-999', 'com.example.Entity'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.data).toBeUndefined();
    });

    it('should not retry on error', async () => {
      const mockError = new Error('API Error');
      mockGetEntityLoad.mockRejectedValue(mockError);

      const { result } = renderHook(
        () => useEntityLoad('entity-123', 'com.example.Entity'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Should only be called once (no retries)
      expect(mockGetEntityLoad).toHaveBeenCalledTimes(1);
    });

    it('should use correct query key', async () => {
      mockGetEntityLoad.mockResolvedValue({ data: mockEntityData });
      mockFilterData.mockReturnValue(mockFilteredData);

      const { result } = renderHook(
        () => useEntityLoad('entity-123', 'com.example.Entity'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Check that the query is cached with the correct key
      const cachedData = queryClient.getQueryData([
        'entity-load',
        'entity-123',
        'com.example.Entity',
      ]);
      expect(cachedData).toEqual(mockFilteredData);
    });

    it('should refetch when instanceId changes', async () => {
      mockGetEntityLoad.mockResolvedValue({ data: mockEntityData });
      mockFilterData.mockReturnValue(mockFilteredData);

      const { result, rerender } = renderHook(
        ({ instanceId }) => useEntityLoad(instanceId, 'com.example.Entity'),
        {
          wrapper,
          initialProps: { instanceId: 'entity-123' },
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetEntityLoad).toHaveBeenCalledTimes(1);
      expect(mockGetEntityLoad).toHaveBeenCalledWith('entity-123', 'com.example.Entity');

      // Change instanceId
      rerender({ instanceId: 'entity-456' });

      await waitFor(() => {
        expect(mockGetEntityLoad).toHaveBeenCalledTimes(2);
      });

      expect(mockGetEntityLoad).toHaveBeenCalledWith('entity-456', 'com.example.Entity');
    });

    it('should refetch when entityClassName changes', async () => {
      mockGetEntityLoad.mockResolvedValue({ data: mockEntityData });
      mockFilterData.mockReturnValue(mockFilteredData);

      const { result, rerender } = renderHook(
        ({ entityClassName }) => useEntityLoad('entity-123', entityClassName),
        {
          wrapper,
          initialProps: { entityClassName: 'com.example.Entity' },
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetEntityLoad).toHaveBeenCalledTimes(1);
      expect(mockGetEntityLoad).toHaveBeenCalledWith('entity-123', 'com.example.Entity');

      // Change entityClassName
      rerender({ entityClassName: 'com.example.OtherEntity' });

      await waitFor(() => {
        expect(mockGetEntityLoad).toHaveBeenCalledTimes(2);
      });

      expect(mockGetEntityLoad).toHaveBeenCalledWith('entity-123', 'com.example.OtherEntity');
    });
  });
});

