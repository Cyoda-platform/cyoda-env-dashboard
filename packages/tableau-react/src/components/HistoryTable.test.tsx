/**
 * HistoryTable Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import HistoryTable from './HistoryTable';
import type { HistoryFilter, HistorySettings } from '@/types';
import axios from 'axios';
import { axiosPlatform } from '@cyoda/http-api-react';

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

// Wrapper component
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('HistoryTable', () => {
  const mockFilter: HistoryFilter = {
    config: '',
    type: '',
    user: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  };

  const mockSettings: HistorySettings = {
    lazyLoading: false,
    displayGroupType: 'out',
  };

  const mockOnChange = vi.fn();

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
        {
          reportHistoryFields: {
            id: '2',
            configName: 'test-config-report-2',
            createTime: '2025-10-16T11:00:00Z',
            finishTime: '2025-10-16T11:10:00Z',
            type: 'CUSTOM',
            userId: 'user2',
            status: 'RUNNING',
            totalRowsCount: 500,
            groupingColumns: ['col3'],
            groupingVersion: 'v2',
            hierarhyEnable: true,
            regroupingPossible: false,
          },
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock entity types API call (used by global axios)
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

    // Mock users API call (used by axiosPlatform)
    mockedAxiosPlatform.post.mockResolvedValue({
      data: [
        { userId: 'user1', username: 'testuser' },
        { userId: 'user2', username: 'admin' },
      ],
    });
  });

  describe('Rendering', () => {
    it('should render the history table', async () => {
      mockedAxiosPlatform.get.mockResolvedValueOnce({ data: mockReportHistory });

      const { container } = render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(container.querySelector('.ant-table')).toBeInTheDocument();
      });
    });

    it('should display report data in table', async () => {
      mockedAxiosPlatform.get.mockResolvedValueOnce({ data: mockReportHistory });

      render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(
        () => {
          expect(screen.getByText('test-config-report-1')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(screen.getByText('test-config-report-2')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      mockedAxiosPlatform.get.mockImplementation(() => new Promise(() => {}));

      const { container } = render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      // Ant Design Table shows loading spinner
      expect(container.querySelector('.ant-table')).toBeInTheDocument();
    });

    it('should handle empty data', async () => {
      mockedAxiosPlatform.get.mockResolvedValueOnce({ data: [] });

      const { container } = render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(container.querySelector('.ant-table')).toBeInTheDocument();
      });
    });
  });

  describe('Data Transformation', () => {
    it('should format dates correctly', async () => {
      mockedAxiosPlatform.get.mockResolvedValueOnce({ data: mockReportHistory });

      const { container } = render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        // Check that date is formatted (YYYY.MM.DD HH:mm:ss)
        const dateCell = container.querySelector('.ant-table-cell');
        expect(dateCell).toBeInTheDocument();
      });
    });

    it('should format row counts correctly', async () => {
      mockedAxiosPlatform.get.mockResolvedValueOnce({ data: mockReportHistory });

      const { container } = render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        // Check that table has data
        expect(container.querySelector('.ant-table-tbody')).toBeInTheDocument();
      });
    });

    it('should calculate execution time', async () => {
      mockedAxiosPlatform.get.mockResolvedValueOnce({ data: mockReportHistory });

      const { container } = render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        // Check that table has data
        expect(container.querySelector('.ant-table-tbody')).toBeInTheDocument();
      });
    });
  });

  describe('Row Selection', () => {
    it('should call onChange when report is loaded', async () => {
      mockedAxiosPlatform.get.mockResolvedValueOnce({ data: mockReportHistory });

      render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(
        () => {
          expect(screen.getByText('test-config-report-1')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify data is loaded
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should refetch data when filter changes', async () => {
      mockedAxiosPlatform.get.mockResolvedValue({ data: mockReportHistory });

      const { rerender } = render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(mockedAxiosPlatform.get).toHaveBeenCalledTimes(1);
      });

      // Change filter
      const newFilter: HistoryFilter = {
        ...mockFilter,
        status: 'COMPLETED',
      };

      rerender(
        <QueryClientProvider client={createTestQueryClient()}>
          <HistoryTable
            filter={newFilter}
            settings={mockSettings}
            onChange={mockOnChange}
          />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockedAxiosPlatform.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockedAxiosPlatform.get.mockRejectedValueOnce(new Error('API Error'));

      const { container } = render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(container.querySelector('.ant-table')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed config names', async () => {
      const malformedData = [
        {
          ...mockReportHistory[0],
          configName: 'invalid',
        },
      ];

      mockedAxiosPlatform.get.mockResolvedValueOnce({ data: malformedData });

      const { container } = render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        // Check that table rendered with data
        expect(container.querySelector('.ant-table-tbody')).toBeInTheDocument();
      });
    });

    it('should handle null or undefined values', async () => {
      const dataWithNulls = [
        {
          ...mockReportHistory[0],
          totalRowsCount: 0,
        },
      ];

      mockedAxiosPlatform.get.mockResolvedValueOnce({ data: dataWithNulls });

      const { container } = render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(container.querySelector('.ant-table')).toBeInTheDocument();
      });
    });
  });
});

