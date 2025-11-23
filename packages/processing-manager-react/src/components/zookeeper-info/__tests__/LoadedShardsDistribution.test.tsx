/**
 * Tests for LoadedShardsDistribution Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoadedShardsDistribution } from '../LoadedShardsDistribution';
import type { ReactNode } from 'react';

// Mock the hooks
vi.mock('../../../hooks/usePlatformCommon', () => ({
  useZkShardsDistribution: vi.fn(),
}));



describe('LoadedShardsDistribution', () => {
  const mockHookReturn = {
    data: { shards: ['shard1', 'shard2'] },
    isLoading: false,
    error: null,
  };

  // Create test query client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

  // Wrapper component
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(async () => {
    vi.clearAllMocks();
    queryClient.clear();
    const hooks = await import('../../../hooks/usePlatformCommon');
    vi.mocked(hooks.useZkShardsDistribution).mockReturnValue(mockHookReturn as any);
  });

  it('should render the component', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    vi.mocked(hooks.useZkShardsDistribution).mockReturnValue(mockHookReturn as any);

    const { container } = render(<LoadedShardsDistribution />, { wrapper });

    expect(container.querySelector('.loaded-shards-distribution')).toBeInTheDocument();
  });

  it('should render table when data is available', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    vi.mocked(hooks.useZkShardsDistribution).mockReturnValue(mockHookReturn as any);

    const { container } = render(<LoadedShardsDistribution />, { wrapper });

    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should show loading state', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    const loadingData = {
      data: null,
      isLoading: true,
      error: null,
    };
    vi.mocked(hooks.useZkShardsDistribution).mockReturnValue(loadingData as any);

    const { container } = render(<LoadedShardsDistribution />, { wrapper });

    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should handle empty data', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    const emptyData = {
      data: null,
      isLoading: false,
      error: null,
    };
    vi.mocked(hooks.useZkShardsDistribution).mockReturnValue(emptyData as any);

    const { container } = render(<LoadedShardsDistribution />, { wrapper });

    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should display shard data in table', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    const shardData = {
      data: {
        nodesIds: ['node-123', 'node-456'],
        shardsByNodes: {
          'node-123': ['shard-1', 'shard-2'],
          'node-456': ['shard-3']
        }
      },
      isLoading: false,
      error: null,
    };
    vi.mocked(hooks.useZkShardsDistribution).mockReturnValue(shardData as any);

    render(<LoadedShardsDistribution />, { wrapper });

    expect(screen.getByText('node-123')).toBeInTheDocument();
    expect(screen.getByText('node-456')).toBeInTheDocument();
    expect(screen.getByText('shard-1, shard-2')).toBeInTheDocument();
    expect(screen.getByText('shard-3')).toBeInTheDocument();
  });



  it('should display "No Data" when shards data is empty', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    const emptyShardData = {
      data: {
        nodesIds: [],
        shardsByNodes: {}
      },
      isLoading: false,
      error: null,
    };
    vi.mocked(hooks.useZkShardsDistribution).mockReturnValue(emptyShardData as any);

    render(<LoadedShardsDistribution />, { wrapper });

    expect(screen.getByText('No Data')).toBeInTheDocument();
  });


});

