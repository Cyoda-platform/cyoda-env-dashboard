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
      entityType: 'test.Entity',
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
            type: 'STANDARD',
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

  let mockTableau: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.tableau
    mockTableau = {
      connectionData: '',
      connectionName: '',
      submit: vi.fn(),
      dataTypeEnum: {
        string: 'string',
      },
    };

    global.window.tableau = mockTableau;

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

    it('should load report data and send to Tableau', async () => {
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
        expect(mockTableau.submit).toHaveBeenCalled();
      });

      expect(mockTableau.connectionName).toBe('Test Report');
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
        expect(mockTableau.submit).toHaveBeenCalled();
      });

      const connectionData = JSON.parse(mockTableau.connectionData);
      expect(connectionData.tableauData[0]).toHaveProperty('user_name', 'John');
      expect(connectionData.tableauData[0]).toHaveProperty('user_profile_age', 30);
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

      await waitFor(() => {
        expect(mockTableau.submit).toHaveBeenCalledTimes(1);
      });

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

      await waitFor(() => {
        expect(mockTableau.connectionName).toBe('Second Report');
      });
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
          'Failed to load report rows:',
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });

    it('should handle missing Tableau API', async () => {
      delete (global.window as any).tableau;
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

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
        expect(consoleWarn).toHaveBeenCalledWith('Tableau Web Data Connector not loaded');
      });

      consoleWarn.mockRestore();

      // Restore tableau for other tests
      global.window.tableau = mockTableau;
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

      mockedAxios.get.mockResolvedValueOnce({ data: largeDataset });

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
        expect(mockTableau.submit).toHaveBeenCalled();
      });

      const connectionData = JSON.parse(mockTableau.connectionData);
      expect(connectionData.tableauData).toHaveLength(10);
    });

    it('should load all data when lazy loading is disabled', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportData });

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
        expect(mockedAxios.get).toHaveBeenCalledWith(
          '/api/report/1/rows?size=100000'
        );
      });
    });
  });
});

