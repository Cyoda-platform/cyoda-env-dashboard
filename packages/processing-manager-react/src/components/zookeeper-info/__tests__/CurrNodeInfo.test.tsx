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

    expect(screen.getByText('Current Node Information')).toBeInTheDocument();
  });

  it('should render node information fields', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    vi.mocked(hooks.useZkCurrNodeInfo).mockReturnValue(mockHookReturn as any);

    render(<CurrNodeInfo />, { wrapper });

    expect(screen.getByText('Node ID')).toBeInTheDocument();
    expect(screen.getByText('Hostname')).toBeInTheDocument();
    expect(screen.getByText('IP Address')).toBeInTheDocument();
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

    const clusterState = { name: 'test-node', status: 'active', port: 8080 };

    render(<CurrNodeInfo clusterStateCurrentNode={clusterState} />, { wrapper });

    expect(screen.getByText('Current Node Information')).toBeInTheDocument();
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
        nodeId: 'node-123',
        hostname: 'test-host',
        ip: '192.168.1.1',
        port: 8080,
        version: '1.0.0',
        status: 'ONLINE'
      },
      isLoading: false,
      error: null,
    };
    vi.mocked(hooks.useZkCurrNodeInfo).mockReturnValue(nodeData as any);

    render(<CurrNodeInfo />, { wrapper });

    expect(screen.getByText('node-123')).toBeInTheDocument();
    expect(screen.getByText('test-host')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });


});

