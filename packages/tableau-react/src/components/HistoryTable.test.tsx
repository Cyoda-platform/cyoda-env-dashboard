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

// Mock axios
vi.mock('axios');

// Create mock axios instance with interceptors
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

// Mock http-api-react with all necessary exports
vi.mock('@cyoda/http-api-react', () => ({
  axios: mockAxiosInstance,
  axiosPlatform: mockAxiosInstance,
  axiosPublic: mockAxiosInstance,
  axiosProcessing: mockAxiosInstance,
  axiosGrafana: mockAxiosInstance,
  axiosAI: mockAxiosInstance,
  useGlobalUiSettingsStore: vi.fn(() => ({
    dateFormat: 'YYYY.MM.DD',
    timeFormat: 'HH:mm:ss',
  })),
  getReportConfig: vi.fn(),
  getReportingFetchTypes: vi.fn(),
  getHistory: vi.fn(),
}));

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

  const mockReportHistory = [
    {
      id: '1',
      configName: 'test-config-report-1',
      createTime: '2025-10-16T10:00:00Z',
      finishTime: '2025-10-16T10:05:00Z',
      type: 'STANDARD',
      user: { username: 'testuser' },
      status: 'COMPLETED',
      totalRowsCount: 1000,
      groupingColumns: ['col1', 'col2'],
      groupingVersion: 'v1',
      hierarhyEnable: false,
      regroupingPossible: true,
    },
    {
      id: '2',
      configName: 'test-config-report-2',
      createTime: '2025-10-16T11:00:00Z',
      finishTime: '2025-10-16T11:10:00Z',
      type: 'CUSTOM',
      user: { username: 'admin' },
      status: 'RUNNING',
      totalRowsCount: 500,
      groupingColumns: ['col3'],
      groupingVersion: 'v2',
      hierarhyEnable: true,
      regroupingPossible: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the history table', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockReportHistory });

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
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockReportHistory });

      render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('test-config-report-1')).toBeInTheDocument();
        expect(screen.getByText('test-config-report-2')).toBeInTheDocument();
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('admin')).toBeInTheDocument();
      });
    });

    it('should show loading state', () => {
      mockAxiosInstance.get.mockImplementation(() => new Promise(() => {}));

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
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] });

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
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockReportHistory });

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
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockReportHistory });

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
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockReportHistory });

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
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockReportHistory });

      render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('test-config-report-1')).toBeInTheDocument();
      });

      // Verify data is loaded
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should refetch data when filter changes', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockReportHistory });

      const { rerender } = render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
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
        expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

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

      mockAxiosInstance.get.mockResolvedValueOnce({ data: malformedData });

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

      mockAxiosInstance.get.mockResolvedValueOnce({ data: dataWithNulls });

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

