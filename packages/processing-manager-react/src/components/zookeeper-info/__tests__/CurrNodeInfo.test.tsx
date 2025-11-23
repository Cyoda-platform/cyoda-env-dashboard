/**
 * Tests for CurrNodeInfo Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CurrNodeInfo } from '../CurrNodeInfo';
import type { ReactNode } from 'react';

// Mock the hooks
vi.mock('../../../hooks/usePlatformCommon', () => ({
  useZkCurrNodeInfo: vi.fn(),
}));



describe('CurrNodeInfo', () => {
  const mockHookReturn = {
    data: { nodeInfo: 'test-node-info' },
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
    vi.mocked(hooks.useZkCurrNodeInfo).mockReturnValue(mockHookReturn as any);
  });

  it('should render the component', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    vi.mocked(hooks.useZkCurrNodeInfo).mockReturnValue(mockHookReturn as any);

    render(<CurrNodeInfo />, { wrapper });

    expect(screen.getByText('Node info')).toBeInTheDocument();
  });

  it('should render node information fields', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    vi.mocked(hooks.useZkCurrNodeInfo).mockReturnValue(mockHookReturn as any);

    render(<CurrNodeInfo />, { wrapper });

    expect(screen.getByText('BaseUrl:')).toBeInTheDocument();
    expect(screen.getByText('Host:')).toBeInTheDocument();
    expect(screen.getByText('Notifications Port:')).toBeInTheDocument();
    expect(screen.getByText('Processing Node:')).toBeInTheDocument();
  });

  it('should wrap component in a div', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    vi.mocked(hooks.useZkCurrNodeInfo).mockReturnValue(mockHookReturn as any);

    const { container } = render(<CurrNodeInfo />, { wrapper });

    const wrapperDiv = container.querySelector('div');
    expect(wrapperDiv).toBeInTheDocument();
  });

  it('should handle clusterStateCurrentNode with data', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    vi.mocked(hooks.useZkCurrNodeInfo).mockReturnValue(mockHookReturn as any);

    const clusterState = {
      type: 'PROCESSING',
      id: 'test-node-id',
      baseUrl: 'http://localhost:8080/api',
      host: 'localhost',
      notificationsPort: 10000,
      processingNode: true
    };

    render(<CurrNodeInfo clusterStateCurrentNode={clusterState} />, { wrapper });

    expect(screen.getByText('Node info')).toBeInTheDocument();
  });

  it('should show loading spinner when loading', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    const loadingData = {
      data: null,
      isLoading: true,
      error: null,
    };
    vi.mocked(hooks.useZkCurrNodeInfo).mockReturnValue(loadingData as any);

    const { container } = render(<CurrNodeInfo />, { wrapper });

    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('should display node data when available', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    const nodeData = {
      data: {
        type: 'PROCESSING',
        id: 'node-123',
        baseUrl: 'http://test-host:8080/api',
        host: 'test-host',
        notificationsPort: 10000,
        processingNode: true
      },
      isLoading: false,
      error: null,
    };
    vi.mocked(hooks.useZkCurrNodeInfo).mockReturnValue(nodeData as any);

    render(<CurrNodeInfo />, { wrapper });

    expect(screen.getByText('PROCESSING')).toBeInTheDocument();
    expect(screen.getByText('http://test-host:8080/api')).toBeInTheDocument();
    expect(screen.getByText('test-host')).toBeInTheDocument();
    expect(screen.getByText('10000')).toBeInTheDocument();
  });


});

