/**
 * Integration Tests
 * Tests for component interactions and full workflows
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HistoryTable from '../components/HistoryTable';
import ReportTableRows from '../components/ReportTableRows';
import axios from 'axios';
import { axios as httpApiAxios, axiosPlatform } from '@cyoda/http-api-react';

// Mock axios
vi.mock('axios');

// Mock http-api-react with all necessary exports
vi.mock('@cyoda/http-api-react', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };

  return {
    axios: mockAxiosInstance,
    axiosPlatform: mockAxiosInstance,
    axiosPublic: mockAxiosInstance,
    axiosProcessing: mockAxiosInstance,
    axiosGrafana: mockAxiosInstance,
    axiosAI: mockAxiosInstance,
    useGlobalUiSettingsStore: vi.fn(() => ({
      dateFormat: 'YYYY.MM.DD',
      timeFormat: 'HH:mm:ss',
      entityType: 'BUSINESS',
    })),
    getReportConfig: vi.fn(),
    getReportingFetchTypes: vi.fn(),
    getHistory: vi.fn(),
  };
});

const mockedAxios = vi.mocked(axios);
const mockedHttpApiAxios = vi.mocked(httpApiAxios);
const mockedAxiosPlatform = vi.mocked(axiosPlatform);

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('Integration Tests', () => {
  const mockReportHistory = {
    _embedded: {
      reportHistoryFieldsViews: [
        {
          reportHistoryFields: {
            id: '1',
            configName: 'test-config-report-1',
            createTime: '2025-10-16T10:00:00Z',
            finishTime: '2025-10-16T10:05:00Z',
            type: 'Entity1',
            userId: 'user1',
            status: 'COMPLETED',
            totalRowsCount: 1000,
            groupingColumns: ['col1', 'col2'],
            groupingVersion: 'v1',
            hierarhyEnable: false,
            regroupingPossible: true,
          },
        },
      ],
    },
  };

  const mockConfigDefinition = {
    id: 'config-1',
    description: 'Test Report',
    columns: [
      { name: 'user.name' },
      { name: 'amount' },
    ],
  };

  const mockReportData = {
    _embedded: {
      reportRows: [
        {
          content: {
            user: { name: 'John Doe' },
            amount: 1000,
          },
        },
      ],
    },
    page: {
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock entity types API call (used by global axios for HistoryTable)
    mockedAxios.get.mockResolvedValue({
      data: {
        _embedded: {
          entityTypes: [
            { name: 'test.Entity1', type: 'BUSINESS' },
            { name: 'test.Entity2', type: 'BUSINESS' },
          ],
        },
      },
    });

    // Mock users API call (used by axiosPlatform for HistoryTable)
    mockedAxiosPlatform.post.mockImplementation((url: string) => {
      if (url.includes('/api/platform-api/users/get-by-ids')) {
        return Promise.resolve({
          data: [
            { userId: 'user1', username: 'testuser' },
          ],
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  describe('HistoryTable and ReportTableRows Integration', () => {
    it('should load report history and display in table', async () => {
      mockedAxiosPlatform.get.mockResolvedValueOnce({ data: mockReportHistory });

      const queryClient = createTestQueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <HistoryTable
            filter={{
              config: '',
              type: '',
              user: '',
              status: '',
              dateFrom: '',
              dateTo: '',
            }}
            settings={{
              lazyLoading: false,
              displayGroupType: 'out',
            }}
            onChange={vi.fn()}
          />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockedAxiosPlatform.get).toHaveBeenCalledWith(
          '/api/platform-api/reporting/history',
          expect.any(Object)
        );
      });
    });

  });

  describe('Data Flow Integration', () => {
    it('should transform and flatten data correctly', async () => {
      const nestedData = {
        _embedded: {
          reportRows: [
            {
              content: {
                user: { name: 'John', profile: { age: 30 } },
                amount: 1000,
              },
            },
          ],
        },
        page: { totalElements: 1, totalPages: 1, size: 10, number: 0 },
      };

      mockedHttpApiAxios.get.mockResolvedValueOnce({ data: nestedData });

      const queryClient = createTestQueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <ReportTableRows
            tableLinkRows="/api/report/1/rows"
            lazyLoading={false}
            configDefinition={mockConfigDefinition}
          />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockedHttpApiAxios.get).toHaveBeenCalledWith('/api/report/1/rows?size=100000');
      });
    });

    it('should handle multiple reports in sequence', async () => {
      const queryClient = createTestQueryClient();

      // First report
      mockedHttpApiAxios.get.mockResolvedValueOnce({ data: mockReportData });

      const { rerender } = render(
        <QueryClientProvider client={queryClient}>
          <ReportTableRows
            tableLinkRows="/api/report/1/rows"
            lazyLoading={false}
            configDefinition={mockConfigDefinition}
          />
        </QueryClientProvider>
      );

      // First report
      await waitFor(() => expect(mockedHttpApiAxios.get).toHaveBeenCalledWith('/api/report/1/rows?size=100000'));

      // Second report
      const newConfig = { ...mockConfigDefinition, description: 'Second Report' };
      mockedHttpApiAxios.get.mockResolvedValueOnce({ data: mockReportData });

      rerender(
        <QueryClientProvider client={queryClient}>
          <ReportTableRows
            tableLinkRows="/api/report/2/rows"
            lazyLoading={false}
            configDefinition={newConfig}
          />
        </QueryClientProvider>
      );

      await waitFor(() => expect(mockedHttpApiAxios.get).toHaveBeenCalledWith('/api/report/2/rows?size=100000'));
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockedHttpApiAxios.get.mockRejectedValueOnce(new Error('API Error'));

      const queryClient = createTestQueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <ReportTableRows
            tableLinkRows="/api/report/1/rows"
            lazyLoading={false}
            configDefinition={mockConfigDefinition}
          />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'ReportTableRows: Failed to load report rows:',
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });

  });

  describe('Lazy Loading', () => {
    it('should limit data when lazy loading is enabled', async () => {
      const largeDataset = {
        _embedded: {
          reportRows: Array.from({ length: 100 }, (_, i) => ({
            content: { id: i, name: `Item ${i}` },
          })),
        },
        page: { totalElements: 100, totalPages: 10, size: 10, number: 0 },
      };

      mockedHttpApiAxios.get.mockResolvedValueOnce({ data: largeDataset });

      const queryClient = createTestQueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <ReportTableRows
            tableLinkRows="/api/report/1/rows"
            lazyLoading={true}
            configDefinition={mockConfigDefinition}
          />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockedHttpApiAxios.get).toHaveBeenCalledWith('/api/report/1/rows?size=10');
      });
    });

    it('should load all data when lazy loading is disabled', async () => {
      mockedHttpApiAxios.get.mockResolvedValueOnce({ data: mockReportData });

      const queryClient = createTestQueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <ReportTableRows
            tableLinkRows="/api/report/1/rows"
            lazyLoading={false}
            configDefinition={mockConfigDefinition}
          />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockedHttpApiAxios.get).toHaveBeenCalledWith(
          '/api/report/1/rows?size=100000'
        );
      });
    });
  });
});

