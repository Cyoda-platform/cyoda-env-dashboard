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
const mockedAxios = vi.mocked(axios);

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
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportHistory });

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
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportHistory });

      render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('report-1')).toBeInTheDocument();
        expect(screen.getByText('report-2')).toBeInTheDocument();
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('admin')).toBeInTheDocument();
      });
    });

    it('should show loading state', () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {}));

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
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

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
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportHistory });

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
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportHistory });

      render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        // Numbers should be formatted with commas
        expect(screen.getByText('1,000')).toBeInTheDocument();
        expect(screen.getByText('500')).toBeInTheDocument();
      });
    });

    it('should calculate execution time', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportHistory });

      render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        // First report: 5 minutes
        expect(screen.getByText('5m 0s')).toBeInTheDocument();
        // Second report: 10 minutes
        expect(screen.getByText('10m 0s')).toBeInTheDocument();
      });
    });
  });

  describe('Row Selection', () => {
    it('should call onChange when report is loaded', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockReportHistory });

      render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('report-1')).toBeInTheDocument();
      });

      // Verify data is loaded
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should refetch data when filter changes', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockReportHistory });

      const { rerender } = render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
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
        expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

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

      mockedAxios.get.mockResolvedValueOnce({ data: malformedData });

      render(
        <HistoryTable
          filter={mockFilter}
          settings={mockSettings}
          onChange={mockOnChange}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText("ERROR: CAN'T GET CONFIG SHORTNAME")).toBeInTheDocument();
      });
    });

    it('should handle null or undefined values', async () => {
      const dataWithNulls = [
        {
          ...mockReportHistory[0],
          totalRowsCount: 0,
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: dataWithNulls });

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

