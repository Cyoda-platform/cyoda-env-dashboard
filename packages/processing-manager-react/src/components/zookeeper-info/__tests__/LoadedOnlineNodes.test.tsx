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

  it('should display node data in table', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    const nodeData = {
      data: {
        DEFAULT: [
          {
            id: 'node-123',
            type: 'DEFAULT',
            baseUrl: 'http://test-host:8080/api',
            host: 'test-host',
            notificationsPort: 10000,
            processingNode: false
          }
        ],
        PROCESSING: [],
        TOOLBOX: []
      },
      isLoading: false,
      error: null,
    };
    vi.mocked(hooks.useZkOnlineNodes).mockReturnValue(nodeData as any);

    render(<LoadedOnlineNodes />, { wrapper });

    expect(screen.getByText('node-123')).toBeInTheDocument();
    expect(screen.getByText('DEFAULT')).toBeInTheDocument();
    expect(screen.getByText('http://test-host:8080/api')).toBeInTheDocument();
    expect(screen.getByText('test-host')).toBeInTheDocument();
    expect(screen.getByText('10000')).toBeInTheDocument();
  });

  it('should show warning icon in Action column when there are differences', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    const nodeData = {
      data: {
        DEFAULT: [
          {
            id: 'node-123',
            type: 'DEFAULT',
            baseUrl: 'http://test-host:8080/api',
            host: 'test-host',
            notificationsPort: 10000,
            processingNode: false
          }
        ],
        PROCESSING: [],
        TOOLBOX: []
      },
      isLoading: false,
      error: null,
    };
    vi.mocked(hooks.useZkOnlineNodes).mockReturnValue(nodeData as any);

    // Pass different cluster state to trigger warning
    const clusterState = {
      DEFAULT: [
        {
          id: 'node-123',
          type: 'DEFAULT',
          baseUrl: 'http://different-host:8080/api', // Different baseUrl
          host: 'different-host',
          notificationsPort: 10000,
          processingNode: false
        }
      ],
      PROCESSING: [],
      TOOLBOX: []
    };

    const { container } = render(<LoadedOnlineNodes clusterStateClientNodes={clusterState} />, { wrapper });

    // Check for warning icon
    const warningIcon = container.querySelector('.anticon-exclamation-circle');
    expect(warningIcon).toBeInTheDocument();
  });

  it('should not show warning icon when data matches cluster state', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    const nodeData = {
      data: {
        DEFAULT: [
          {
            id: 'node-123',
            type: 'DEFAULT',
            baseUrl: 'http://test-host:8080/api',
            host: 'test-host',
            notificationsPort: 10000,
            processingNode: false
          }
        ],
        PROCESSING: [],
        TOOLBOX: []
      },
      isLoading: false,
      error: null,
    };
    vi.mocked(hooks.useZkOnlineNodes).mockReturnValue(nodeData as any);

    // Pass matching cluster state
    const clusterState = {
      DEFAULT: [
        {
          id: 'node-123',
          type: 'DEFAULT',
          baseUrl: 'http://test-host:8080/api',
          host: 'test-host',
          notificationsPort: 10000,
          processingNode: false
        }
      ],
      PROCESSING: [],
      TOOLBOX: []
    };

    const { container } = render(<LoadedOnlineNodes clusterStateClientNodes={clusterState} />, { wrapper });

    // Check that warning icon is NOT present
    const warningIcon = container.querySelector('.anticon-exclamation-circle');
    expect(warningIcon).not.toBeInTheDocument();
  });

  it('should display "No Data" when all node types are empty', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    const emptyNodeData = {
      data: {
        DEFAULT: [],
        PROCESSING: [],
        TOOLBOX: []
      },
      isLoading: false,
      error: null,
    };
    vi.mocked(hooks.useZkOnlineNodes).mockReturnValue(emptyNodeData as any);

    render(<LoadedOnlineNodes />, { wrapper });

    // Component renders 3 tables (DEFAULT, PROCESSING, TOOLBOX), each showing "No Data"
    const noDataElements = screen.getAllByText('No Data');
    expect(noDataElements.length).toBe(3);
  });


});

