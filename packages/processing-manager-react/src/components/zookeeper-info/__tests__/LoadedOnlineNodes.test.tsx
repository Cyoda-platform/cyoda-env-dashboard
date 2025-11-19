/**
 * Tests for LoadedOnlineNodes Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoadedOnlineNodes } from '../LoadedOnlineNodes';
import * as hooks from '../../../hooks';
import type { ReactNode } from 'react';

// Mock the hooks
vi.mock('../../../hooks', () => ({
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

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    vi.mocked(hooks.useZkOnlineNodes).mockReturnValue(mockHookReturn as any);
  });

  it('should render the component', () => {
    const { container } = render(<LoadedOnlineNodes />, { wrapper });

    expect(container.querySelector('.loaded-online-nodes')).toBeInTheDocument();
  });

  it('should render table when data is available', () => {
    const { container } = render(<LoadedOnlineNodes />, { wrapper });

    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    const loadingData = {
      data: null,
      isLoading: true,
      error: null,
    };
    vi.mocked(hooks.useZkOnlineNodes).mockReturnValue(loadingData as any);

    const { container } = render(<LoadedOnlineNodes />, { wrapper });

    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should handle empty data', () => {
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

