/**
 * Tests for ShardsDetailTabZKInfo Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import ShardsDetailTabZKInfo from '../ShardsDetailTabZKInfo';
import type { ReactNode } from 'react';

// Mock the hooks
vi.mock('../../../hooks/usePlatformCommon', () => ({
  useZkClusterState: vi.fn(),
  useZkCurrNodeInfo: vi.fn(),
  useZkOnlineNodes: vi.fn(),
  useZkShardsDistribution: vi.fn(),
}));

describe('ShardsDetailTabZKInfo', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const mockClusterState = {
    currentNode: {
      type: 'PROCESSING',
      id: 'test-node-id',
      baseUrl: 'http://localhost:8080/api',
      host: 'localhost',
      notificationsPort: 10000,
      processingNode: true
    },
    clientNodes: {
      DEFAULT: [],
      PROCESSING: [],
      TOOLBOX: []
    },
    shardsDistrState: {}
  };

  beforeEach(async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    vi.mocked(hooks.useZkClusterState).mockReturnValue({
      data: mockClusterState,
      isLoading: false,
      error: null,
    } as any);
    vi.mocked(hooks.useZkCurrNodeInfo).mockReturnValue({
      data: mockClusterState.currentNode,
      isLoading: false,
      error: null,
    } as any);
    vi.mocked(hooks.useZkOnlineNodes).mockReturnValue({
      data: mockClusterState.clientNodes,
      isLoading: false,
      error: null,
    } as any);
    vi.mocked(hooks.useZkShardsDistribution).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
  });

  it('should render the component', () => {
    const { container } = render(<ShardsDetailTabZKInfo />, { wrapper });

    expect(container.querySelector('.zk-info-tab')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<ShardsDetailTabZKInfo />, { wrapper });

    expect(screen.getByText('ZooKeeper Info')).toBeInTheDocument();
  });

  it('should render all section labels', () => {
    render(<ShardsDetailTabZKInfo />, { wrapper });

    expect(screen.getByText('Node info')).toBeInTheDocument();
    expect(screen.getByText('Loaded Online Nodes')).toBeInTheDocument();
    expect(screen.getByText('Loaded Shards Distribution')).toBeInTheDocument();
  });

  it('should render CurrNodeInfo component', () => {
    const { container } = render(<ShardsDetailTabZKInfo />, { wrapper });

    expect(container.querySelector('.curr-node-info')).toBeInTheDocument();
  });

  it('should render LoadedOnlineNodes component', () => {
    const { container } = render(<ShardsDetailTabZKInfo />, { wrapper });

    expect(container.querySelector('.loaded-online-nodes')).toBeInTheDocument();
  });

  it('should render LoadedShardsDistribution component', () => {
    const { container } = render(<ShardsDetailTabZKInfo />, { wrapper });

    expect(container.querySelector('.loaded-shards-distribution')).toBeInTheDocument();
  });

  it('should render dividers between sections', () => {
    const { container } = render(<ShardsDetailTabZKInfo />, { wrapper });

    const dividers = container.querySelectorAll('.ant-divider');
    expect(dividers.length).toBeGreaterThan(0);
  });

  it('should render all three sections', () => {
    const { container } = render(<ShardsDetailTabZKInfo />, { wrapper });

    expect(container.querySelector('.curr-node-info')).toBeInTheDocument();
    expect(container.querySelector('.loaded-online-nodes')).toBeInTheDocument();
    expect(container.querySelector('.loaded-shards-distribution')).toBeInTheDocument();
  });

  it('should render without errors', () => {
    expect(() => render(<ShardsDetailTabZKInfo />, { wrapper })).not.toThrow();
  });

  it('should display node type', () => {
    render(<ShardsDetailTabZKInfo />, { wrapper });

    expect(screen.getByText('PROCESSING')).toBeInTheDocument();
  });
});

