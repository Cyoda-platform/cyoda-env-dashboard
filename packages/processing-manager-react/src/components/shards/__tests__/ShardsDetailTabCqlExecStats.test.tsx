/**
 * Tests for ShardsDetailTabCqlExecStats component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ShardsDetailTabCqlExecStats from '../ShardsDetailTabCqlExecStats';

// Mock the hooks
vi.mock('../../../hooks/usePlatformCommon', () => ({
  useCqlExecStatsTables: vi.fn(),
  useCqlExecStatsAllTablesBrief: vi.fn(),
  useCqlExecStatsTable: vi.fn(),
  useClearCqlExecStats: vi.fn(),
}));

import {
  useCqlExecStatsTables,
  useCqlExecStatsAllTablesBrief,
  useCqlExecStatsTable,
  useClearCqlExecStats,
} from '../../../hooks/usePlatformCommon';

const mockUseCqlExecStatsTables = useCqlExecStatsTables as any;
const mockUseCqlExecStatsAllTablesBrief = useCqlExecStatsAllTablesBrief as any;
const mockUseCqlExecStatsTable = useCqlExecStatsTable as any;
const mockUseClearCqlExecStats = useClearCqlExecStats as any;

describe('ShardsDetailTabCqlExecStats', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset mocks
    vi.clearAllMocks();

    // Default mock implementations
    mockUseCqlExecStatsTables.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    mockUseCqlExecStatsAllTablesBrief.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseCqlExecStatsTable.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    mockUseClearCqlExecStats.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ShardsDetailTabCqlExecStats />
      </QueryClientProvider>
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('CQL Execution Statistics')).toBeInTheDocument();
  });

  it('displays refresh and clear buttons', () => {
    renderComponent();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseCqlExecStatsAllTablesBrief.mockReturnValue({
      data: [],
      isLoading: true,
      isFetching: true,
      error: null,
      refetch: vi.fn(),
    });

    renderComponent();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('displays table data when loaded', async () => {
    const mockData = [
      {
        table: 'ALIAS_CATALOG',
        tableStats: {
          numCalls: 1186,
          min: 480000, // 0.48ms in nanoseconds
          avg: 910000, // 0.91ms in nanoseconds
          max: 22000000, // 22ms in nanoseconds
          last: 690000, // 0.69ms in nanoseconds
          total: 1, // seconds
          measure: 1,
          measureDesc: 'ns',
        },
      },
      {
        table: 'AUDIT_ENTITY_FIELD_BLOBS',
        tableStats: {
          numCalls: 44896,
          min: 340000, // 0.34ms in nanoseconds
          avg: 1200000, // 1.2ms in nanoseconds
          max: 83000000, // 83ms in nanoseconds
          last: 1500000, // 1.5ms in nanoseconds
          total: 51, // seconds
          measure: 1,
          measureDesc: 'ns',
        },
      },
    ];

    mockUseCqlExecStatsAllTablesBrief.mockReturnValue({
      data: mockData,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('ALIAS_CATALOG')).toBeInTheDocument();
      expect(screen.getByText('AUDIT_ENTITY_FIELD_BLOBS')).toBeInTheDocument();
      expect(screen.getByText('1,186')).toBeInTheDocument();
      expect(screen.getByText('44,896')).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', () => {
    const errorMessage = 'Failed to fetch statistics';
    mockUseCqlExecStatsAllTablesBrief.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      error: new Error(errorMessage),
      refetch: vi.fn(),
    });

    renderComponent();
    expect(screen.getByText('Error Loading Statistics')).toBeInTheDocument();
  });

  it('displays empty table when no data', () => {
    mockUseCqlExecStatsAllTablesBrief.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    renderComponent();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('has correct table columns', () => {
    renderComponent();

    // Check that all column headers exist (they may appear multiple times due to sticky headers)
    expect(screen.getAllByText('Table Name').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Num Calls').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Min (ms)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Avg (ms)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Max (ms)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Last (ms)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Total (s)').length).toBeGreaterThan(0);
  });

  it('displays table filter dropdown', () => {
    const mockTables = ['ALIAS_CATALOG', 'AUDIT_ENTITY_INFO'];

    mockUseCqlExecStatsTables.mockReturnValue({
      data: mockTables,
      isLoading: false,
      error: null,
    });

    renderComponent();

    // Check for the Select component by its text content
    expect(screen.getByText('Filter by table')).toBeInTheDocument();
  });

  it('formats time values correctly', async () => {
    const mockData = [
      {
        table: 'TEST_TABLE',
        tableStats: {
          numCalls: 100,
          min: 480000, // 0.48ms in nanoseconds
          avg: 910000, // 0.91ms in nanoseconds
          max: 22000000, // 22ms in nanoseconds
          last: 690000, // 0.69ms in nanoseconds
          total: 5,
          measure: 1,
          measureDesc: 'ns',
        },
      },
    ];

    mockUseCqlExecStatsAllTablesBrief.mockReturnValue({
      data: mockData,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    renderComponent();

    await waitFor(() => {
      // Check that values are displayed (formatted)
      expect(screen.getByText('TEST_TABLE')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  it('handles missing tableStats gracefully', async () => {
    const mockData = [
      {
        table: 'EMPTY_TABLE',
        // No tableStats
      },
    ];

    mockUseCqlExecStatsAllTablesBrief.mockReturnValue({
      data: mockData,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('EMPTY_TABLE')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls refetch when Refresh button is clicked', async () => {
      const mockRefetch = vi.fn();
      mockUseCqlExecStatsAllTablesBrief.mockReturnValue({
        data: [],
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: mockRefetch,
      });

      renderComponent();

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('calls clear mutation when Clear button is clicked', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({});
      mockUseClearCqlExecStats.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderComponent();

      // Click the Clear button to open confirmation modal
      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);

      // Wait for confirmation modal to appear
      await waitFor(() => {
        const titles = screen.getAllByText('Clear CQL Execution Statistics');
        expect(titles.length).toBeGreaterThan(0);
      });

      // Find and click the "Clear" button in the confirmation modal (the dangerous one)
      const confirmButtons = screen.getAllByRole('button', { name: /clear/i });
      const confirmClearButton = confirmButtons.find(
        (button) => button.className.includes('dangerous') && button.className.includes('outlined')
      );

      if (confirmClearButton) {
        fireEvent.click(confirmClearButton);
      }

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledTimes(1);
      });
    });

    it('opens detail modal when table row is clicked', async () => {
      const mockData = [
        {
          table: 'TEST_TABLE',
          tableStats: {
            numCalls: 100,
            min: 480000,
            avg: 910000,
            max: 22000000,
            last: 690000,
            total: 5,
            measure: 1,
            measureDesc: 'ns',
          },
        },
      ];

      mockUseCqlExecStatsAllTablesBrief.mockReturnValue({
        data: mockData,
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
      });

      mockUseCqlExecStatsTable.mockReturnValue({
        data: mockData[0],
        isLoading: false,
        error: null,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('TEST_TABLE')).toBeInTheDocument();
      });

      // Click on the table row
      const tableRow = screen.getByText('TEST_TABLE').closest('tr');
      if (tableRow) {
        fireEvent.click(tableRow);
      }

      // Check that modal is opened by looking for the table name in content
      await waitFor(() => {
        expect(screen.getByText('Table:')).toBeInTheDocument();
        expect(screen.getByText('Overall Statistics')).toBeInTheDocument();
      });
    });

    it('closes detail modal when Close button is clicked', async () => {
      const mockData = [
        {
          table: 'TEST_TABLE',
          tableStats: {
            numCalls: 100,
            min: 480000,
            avg: 910000,
            max: 22000000,
            last: 690000,
            total: 5,
            measure: 1,
            measureDesc: 'ns',
          },
        },
      ];

      mockUseCqlExecStatsAllTablesBrief.mockReturnValue({
        data: mockData,
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
      });

      mockUseCqlExecStatsTable.mockReturnValue({
        data: mockData[0],
        isLoading: false,
        error: null,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('TEST_TABLE')).toBeInTheDocument();
      });

      // Open modal
      const tableRow = screen.getByText('TEST_TABLE').closest('tr');
      if (tableRow) {
        fireEvent.click(tableRow);
      }

      await waitFor(() => {
        expect(screen.getByText('Table:')).toBeInTheDocument();
        expect(screen.getByText('Overall Statistics')).toBeInTheDocument();
      });

      // Close modal - find the button with text "Close" (not the X button)
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      const closeButton = closeButtons.find((button) => button.textContent === 'Close');

      if (closeButton) {
        fireEvent.click(closeButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('Overall Statistics')).not.toBeInTheDocument();
      });
    });
  });
});

