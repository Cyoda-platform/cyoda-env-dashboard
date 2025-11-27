/**
 * Tests for ShardsDetailTabCqlExecStats component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ShardsDetailTabCqlExecStats from '../ShardsDetailTabCqlExecStats';

// Mock the hooks
vi.mock('../../../hooks/usePlatformCommon', () => ({
  useCqlExecStatsAllTablesBrief: vi.fn(),
  useCqlExecStatsTable: vi.fn(),
  useClearCqlExecStats: vi.fn(),
}));

import {
  useCqlExecStatsAllTablesBrief,
  useCqlExecStatsTable,
  useClearCqlExecStats,
} from '../../../hooks/usePlatformCommon';

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
    mockUseCqlExecStatsAllTablesBrief.mockReturnValue({
      data: [],
      isLoading: false,
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
    expect(screen.getByText('Clear Statistics')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseCqlExecStatsAllTablesBrief.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    renderComponent();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('displays table data when loaded', async () => {
    const mockData = [
      {
        tableName: '"TestTable"',
        queryCount: 100,
        avgExecutionTime: 25.5,
        minExecutionTime: 10.2,
        maxExecutionTime: 50.8,
        totalExecutionTime: 2550,
      },
      {
        tableName: '"AnotherTable"',
        queryCount: 50,
        avgExecutionTime: 15.3,
        minExecutionTime: 5.1,
        maxExecutionTime: 30.2,
        totalExecutionTime: 765,
      },
    ];

    mockUseCqlExecStatsAllTablesBrief.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('"TestTable"')).toBeInTheDocument();
      expect(screen.getByText('"AnotherTable"')).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', () => {
    const errorMessage = 'Failed to fetch statistics';
    mockUseCqlExecStatsAllTablesBrief.mockReturnValue({
      data: [],
      isLoading: false,
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
      error: null,
      refetch: vi.fn(),
    });

    renderComponent();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('has correct table columns', () => {
    renderComponent();
    
    expect(screen.getByText('Table Name')).toBeInTheDocument();
    expect(screen.getByText('Query Count')).toBeInTheDocument();
    expect(screen.getByText('Avg Time (ms)')).toBeInTheDocument();
    expect(screen.getByText('Min Time (ms)')).toBeInTheDocument();
    expect(screen.getByText('Max Time (ms)')).toBeInTheDocument();
    expect(screen.getByText('Total Time (ms)')).toBeInTheDocument();
  });
});

