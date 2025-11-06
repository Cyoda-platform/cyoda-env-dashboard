/**
 * Processing Hooks Tests
 * Tests for React Query hooks
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { axiosProcessing } from '@cyoda/http-api-react';
import {
  useClusterStats,
  useSummary,
  useProcessEventsStats,
  usePollingInfo,
  useTransactions,
  useTransaction,
  useTransactionStatuses,
  useTransactionEventStatusesList,
  useGrafanaDashboardByName,
  useGrafanaPanelsByUid,
  useForceMarkProcessed,
  useManualTransition,
  processingKeys,
} from '../useProcessing';
import { useProcessingStore } from '../../stores';
import type { ReactNode } from 'react';

// Mock axios
vi.mock('@cyoda/http-api-react', () => ({
  axiosProcessing: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock HelperUrl
vi.mock('../../utils', () => ({
  HelperUrl: {
    getLinkToServer: (path: string) => path,
  },
}));

// Create test query client
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Suppress error logs
    },
  });
}

// Wrapper component
function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useProcessing Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
    
    // Reset processing store
    const store = useProcessingStore.getState();
    store.reset();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Query Keys', () => {
    it('should generate correct query keys', () => {
      expect(processingKeys.all).toEqual(['processing']);
      expect(processingKeys.nodes()).toEqual(['processing', 'nodes']);
      expect(processingKeys.clusterStats()).toEqual(['processing', 'cluster-stats']);
      expect(processingKeys.summary({ test: 'param' })).toEqual(['processing', 'summary', { test: 'param' }]);
      expect(processingKeys.transaction('123')).toEqual(['processing', 'transaction', '123']);
    });
  });

  describe('useClusterStats', () => {
    it('should fetch cluster stats successfully', async () => {
      const mockData = {
        pmNodes: [
          { id: '1', name: 'Node 1', status: 'active' },
          { id: '2', name: 'Node 2', status: 'active' },
        ],
        totalNodes: 2,
      };

      vi.mocked(axiosProcessing.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useClusterStats(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(axiosProcessing.get).toHaveBeenCalledWith('/platform-processing/pm-cluster-stats-full.do');
      
      // Check that store was updated
      const store = useProcessingStore.getState();
      expect(store.nodesProcessing).toEqual(mockData.pmNodes);
    });

    it('should handle fetch error', async () => {
      const mockError = new Error('Network error');
      vi.mocked(axiosProcessing.get).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useClusterStats(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useSummary', () => {
    it('should fetch summary with params', async () => {
      const mockData = { summary: 'data' };
      const params = { node: 'node1' };

      vi.mocked(axiosProcessing.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useSummary(params), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(axiosProcessing.get).toHaveBeenCalledWith(
        '/platform-processing/summary',
        { params }
      );
    });

    it('should not fetch when params are not provided', () => {
      const { result } = renderHook(() => useSummary(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(axiosProcessing.get).not.toHaveBeenCalled();
    });
  });

  describe('useProcessEventsStats', () => {
    it('should fetch process events stats', async () => {
      const mockData = { events: [] };
      const params = { from: '2024-01-01', to: '2024-01-31' };

      vi.mocked(axiosProcessing.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useProcessEventsStats(params), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(axiosProcessing.get).toHaveBeenCalledWith(
        '/platform-processing/stats/process-events',
        { params }
      );
    });
  });

  describe('usePollingInfo', () => {
    it('should fetch polling info', async () => {
      const mockData = { polling: 'info' };

      vi.mocked(axiosProcessing.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => usePollingInfo(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(axiosProcessing.get).toHaveBeenCalledWith(
        '/platform-processing/polling-info-json.do',
        { params: undefined }
      );
    });
  });

  describe('useTransactions', () => {
    it('should fetch transactions list', async () => {
      const mockData = [
        { id: '1', status: 'completed' },
        { id: '2', status: 'pending' },
      ];

      vi.mocked(axiosProcessing.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useTransactions(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(axiosProcessing.get).toHaveBeenCalledWith(
        '/platform-processing/transactions/view',
        { params: undefined }
      );
    });
  });

  describe('useTransaction', () => {
    it('should fetch single transaction', async () => {
      const mockData = { id: '123', status: 'completed' };

      vi.mocked(axiosProcessing.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useTransaction('123'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(axiosProcessing.get).toHaveBeenCalledWith(
        '/platform-processing/transactions/view/123'
      );
    });

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useTransaction(''), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(axiosProcessing.get).not.toHaveBeenCalled();
    });
  });

  describe('useTransactionStatuses', () => {
    it('should fetch transaction statuses', async () => {
      const mockData = ['pending', 'completed', 'failed'];

      vi.mocked(axiosProcessing.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useTransactionStatuses(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(axiosProcessing.get).toHaveBeenCalledWith(
        '/platform-processing/transactions/statuses'
      );
    });
  });

  describe('useGrafanaDashboardByName', () => {
    it('should fetch Grafana dashboard by name', async () => {
      const mockData = { uid: 'abc123', title: 'Test Dashboard' };
      const dashboardName = 'Test Dashboard';

      vi.mocked(axiosProcessing.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useGrafanaDashboardByName(dashboardName), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(axiosProcessing.get).toHaveBeenCalledWith(
        `/grafana/search?query=${encodeURIComponent(dashboardName)}`
      );
    });

    it('should not fetch when name is empty', () => {
      const { result } = renderHook(() => useGrafanaDashboardByName(''), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(axiosProcessing.get).not.toHaveBeenCalled();
    });
  });

  describe('useGrafanaPanelsByUid', () => {
    it('should fetch Grafana panels by UID', async () => {
      const mockData = { panels: [{ id: 1, title: 'Panel 1' }] };
      const uid = 'abc123';

      vi.mocked(axiosProcessing.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useGrafanaPanelsByUid(uid), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(axiosProcessing.get).toHaveBeenCalledWith(`/grafana/dashboards/uid/${uid}`);
    });
  });

  describe('useForceMarkProcessed', () => {
    it('should force mark processed successfully', async () => {
      const mockData = { success: true };
      const params = { entityId: '123', queue: 'test-queue' };

      vi.mocked(axiosProcessing.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useForceMarkProcessed(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current).toBeDefined());

      result.current.mutate(params);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(axiosProcessing.get).toHaveBeenCalledWith(
        '/platform-processing/processing-queue/force-mark-processed.do',
        { params }
      );
    });

    it('should handle mutation error', async () => {
      const mockError = new Error('Mutation failed');

      vi.mocked(axiosProcessing.get).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useForceMarkProcessed(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ entityId: '123' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useManualTransition', () => {
    it('should perform manual transition successfully', async () => {
      const mockData = { success: true };
      const params = { entityId: '123', transition: 'approve' };

      vi.mocked(axiosProcessing.put).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useManualTransition(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current).toBeDefined());

      result.current.mutate(params);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(axiosProcessing.put).toHaveBeenCalledWith(
        '/platform-api/entity',
        params
      );
    });

    it('should handle mutation error', async () => {
      const mockError = new Error('Transition failed');

      vi.mocked(axiosProcessing.put).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useManualTransition(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ entityId: '123' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useTransactionEventStatusesList', () => {
    it('should fetch transaction event statuses list successfully', async () => {
      const mockData = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'];
      const params = { transactionId: '123' };

      vi.mocked(axiosProcessing.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useTransactionEventStatusesList(params), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(axiosProcessing.get).toHaveBeenCalledWith(
        '/platform-processing/transactions/event-ref-status-filters',
        { params }
      );
    });

    it('should not fetch when params are not provided', () => {
      const { result } = renderHook(() => useTransactionEventStatusesList(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(axiosProcessing.get).not.toHaveBeenCalled();
    });

    it('should handle fetch error', async () => {
      const mockError = new Error('Failed to fetch statuses');
      const params = { transactionId: '123' };

      vi.mocked(axiosProcessing.get).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useTransactionEventStatusesList(params), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });
});

