/**
 * Tests for useReportStatus hook
 * Verifies that polling (refetchInterval) works correctly with TanStack React Query v5
 *
 * In React Query v5, the refetchInterval callback receives a Query object
 * (not the data directly). The data lives at query.state.data.
 * These tests verify the callback returns 2000ms for RUNNING/STARTED
 * and false for terminal states.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useReportStatus } from './useReports';
import * as reportsApi from '../api/reports';

// Mock the reports API module
vi.mock('../api/reports', () => ({
  getReportStatus: vi.fn(),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });
}

/**
 * Helper to simulate the Query object shape that React Query v5
 * passes to the refetchInterval callback.
 */
function makeFakeQuery(data: any) {
  return { state: { data } } as any;
}

describe('useReportStatus', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch report status when reportId is provided', async () => {
    vi.mocked(reportsApi.getReportStatus).mockResolvedValue({
      data: { content: { status: 'SUCCESSFUL', startTime: '2025-01-01T00:00:00Z' } },
    } as any);

    const { result } = renderHook(() => useReportStatus('report-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.content?.status).toBe('SUCCESSFUL');
    expect(reportsApi.getReportStatus).toHaveBeenCalledWith('report-123', undefined);
  });

  it('should not fetch when reportId is empty', () => {
    const { result } = renderHook(() => useReportStatus(''), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });

  /**
   * Instead of fighting fake timers + React Query internals, we directly
   * test the refetchInterval callback by capturing it from the useQuery
   * options. We render the hook, then inspect the query's options.
   */
  describe('refetchInterval callback (v5 Query object)', () => {
    it('should return 2000 when status is RUNNING', async () => {
      vi.mocked(reportsApi.getReportStatus).mockResolvedValue({
        data: { content: { status: 'RUNNING', startTime: '2025-01-01T00:00:00Z' } },
      } as any);

      renderHook(() => useReportStatus('report-123'), { wrapper });

      await waitFor(() => {
        expect(reportsApi.getReportStatus).toHaveBeenCalled();
      });

      // Get the refetchInterval function from the query cache
      const query = queryClient.getQueryCache().findAll({
        queryKey: ['reports', 'report-123', undefined, 'status'],
      })[0];

      const refetchInterval = query?.options?.refetchInterval as Function;
      expect(refetchInterval).toBeTypeOf('function');

      // Simulate the v5 callback with a Query-shaped object
      const result = refetchInterval(makeFakeQuery({ content: { status: 'RUNNING' } }));
      expect(result).toBe(2000);
    });

    it('should return 2000 when status is STARTED', async () => {
      vi.mocked(reportsApi.getReportStatus).mockResolvedValue({
        data: { content: { status: 'STARTED', startTime: '2025-01-01T00:00:00Z' } },
      } as any);

      renderHook(() => useReportStatus('report-123'), { wrapper });

      await waitFor(() => {
        expect(reportsApi.getReportStatus).toHaveBeenCalled();
      });

      const query = queryClient.getQueryCache().findAll({
        queryKey: ['reports', 'report-123', undefined, 'status'],
      })[0];

      const refetchInterval = query?.options?.refetchInterval as Function;
      const result = refetchInterval(makeFakeQuery({ content: { status: 'STARTED' } }));
      expect(result).toBe(2000);
    });

    it('should return false when status is SUCCESSFUL', async () => {
      vi.mocked(reportsApi.getReportStatus).mockResolvedValue({
        data: { content: { status: 'SUCCESSFUL', startTime: '2025-01-01T00:00:00Z' } },
      } as any);

      renderHook(() => useReportStatus('report-123'), { wrapper });

      await waitFor(() => {
        expect(reportsApi.getReportStatus).toHaveBeenCalled();
      });

      const query = queryClient.getQueryCache().findAll({
        queryKey: ['reports', 'report-123', undefined, 'status'],
      })[0];

      const refetchInterval = query?.options?.refetchInterval as Function;
      const result = refetchInterval(makeFakeQuery({ content: { status: 'SUCCESSFUL' } }));
      expect(result).toBe(false);
    });

    it('should return false when status is FAILED', async () => {
      vi.mocked(reportsApi.getReportStatus).mockResolvedValue({
        data: { content: { status: 'FAILED', startTime: '2025-01-01T00:00:00Z' } },
      } as any);

      renderHook(() => useReportStatus('report-123'), { wrapper });

      await waitFor(() => {
        expect(reportsApi.getReportStatus).toHaveBeenCalled();
      });

      const query = queryClient.getQueryCache().findAll({
        queryKey: ['reports', 'report-123', undefined, 'status'],
      })[0];

      const refetchInterval = query?.options?.refetchInterval as Function;
      const result = refetchInterval(makeFakeQuery({ content: { status: 'FAILED' } }));
      expect(result).toBe(false);
    });

    it('should return false when data is undefined (initial state)', async () => {
      vi.mocked(reportsApi.getReportStatus).mockResolvedValue({
        data: { content: { status: 'RUNNING', startTime: '2025-01-01T00:00:00Z' } },
      } as any);

      renderHook(() => useReportStatus('report-123'), { wrapper });

      await waitFor(() => {
        expect(reportsApi.getReportStatus).toHaveBeenCalled();
      });

      const query = queryClient.getQueryCache().findAll({
        queryKey: ['reports', 'report-123', undefined, 'status'],
      })[0];

      const refetchInterval = query?.options?.refetchInterval as Function;
      // Before data loads, query.state.data is undefined
      const result = refetchInterval(makeFakeQuery(undefined));
      expect(result).toBe(false);
    });
  });
});

