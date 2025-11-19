/**
 * Tests for LoadedOnlineNodes Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoadedOnlineNodes } from '../LoadedOnlineNodes';
import type { ReactNode } from 'react';

// Mock the hooks
vi.mock('../../../hooks/usePlatformCommon', () => ({
  useZkOnlineNodes: vi.fn(),
}));

describe('LoadedOnlineNodes', () => {
  const mockHookReturn = {
    data: { nodes: ['node1', 'node2'] },
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
    vi.mocked(hooks.useZkOnlineNodes).mockReturnValue(mockHookReturn as any);
  });

  it('should render the component', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    vi.mocked(hooks.useZkOnlineNodes).mockReturnValue(mockHookReturn as any);

    const { container } = render(<LoadedOnlineNodes />, { wrapper });

    expect(container.querySelector('.loaded-online-nodes')).toBeInTheDocument();
  });

  it('should render table when data is available', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    vi.mocked(hooks.useZkOnlineNodes).mockReturnValue(mockHookReturn as any);

    const { container } = render(<LoadedOnlineNodes />, { wrapper });

    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should show loading state', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    const loadingData = {
      data: null,
      isLoading: true,
      error: null,
    };
    vi.mocked(hooks.useZkOnlineNodes).mockReturnValue(loadingData as any);

    const { container } = render(<LoadedOnlineNodes />, { wrapper });

    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should handle empty data', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    const emptyData = {
      data: null,
      isLoading: false,
      error: null,
    };
    vi.mocked(hooks.useZkOnlineNodes).mockReturnValue(emptyData as any);

    const { container } = render(<LoadedOnlineNodes />, { wrapper });

    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });


});

