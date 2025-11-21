/**
 * Tests for NetworkClients Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NetworkClients } from '../NetworkClients';

// Mock the hooks
vi.mock('../../../hooks/usePlatformCommon', () => ({
  useNetworkClients: vi.fn(),
}));

describe('NetworkClients', () => {
  const mockHookReturn = {
    data: [
      {
        id: '9c8183da-bf5e-11f0-b46a-9ecb0f97992a',
        clientType: 'LocalClient',
        nodeType: 'PROCESSING',
        host: '10.233.75.58',
        port: 10000,
        transport: {
          type: 'LocalClientTransport',
          running: true,
          connected: true,
        },
      },
      {
        id: '9c8183da-bf5e-11f0-b46a-9ecb0f97992b',
        clientType: 'RemoteClient',
        nodeType: 'PROCESSING',
        host: '10.233.75.59',
        port: 10001,
        transport: {
          type: 'RemoteClientTransport',
          running: false,
          connected: false,
        },
      },
    ],
    isLoading: false,
    error: null,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useNetworkClients } = await import('../../../hooks/usePlatformCommon');
    vi.mocked(useNetworkClients).mockReturnValue(mockHookReturn as any);
  });

  it('should render the component', async () => {
    const { useNetworkClients } = await import('../../../hooks/usePlatformCommon');
    vi.mocked(useNetworkClients).mockReturnValue(mockHookReturn as any);

    render(<NetworkClients />);

    expect(screen.getByText('Clients')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should render table headers', async () => {
    const { useNetworkClients } = await import('../../../hooks/usePlatformCommon');
    vi.mocked(useNetworkClients).mockReturnValue(mockHookReturn as any);

    const { container } = render(<NetworkClients />);

    // Check for table headers using container query
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();

    // Verify headers exist (all may appear multiple times due to resizable columns)
    expect(screen.getAllByText('Id').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Client Type').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Node Type').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Host').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Port').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Type').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Running').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Connected').length).toBeGreaterThan(0);
  });

  it('should render table with client data', async () => {
    const { useNetworkClients } = await import('../../../hooks/usePlatformCommon');
    vi.mocked(useNetworkClients).mockReturnValue(mockHookReturn as any);

    render(<NetworkClients />);

    expect(screen.getByText('9c8183da-bf5e-11f0-b46a-9ecb0f97992a')).toBeInTheDocument();
    expect(screen.getByText('LocalClient')).toBeInTheDocument();
    expect(screen.getByText('10.233.75.58')).toBeInTheDocument();
    expect(screen.getByText('10000')).toBeInTheDocument();
    expect(screen.getByText('LocalClientTransport')).toBeInTheDocument();
  });

  it('should render transport data correctly', async () => {
    const { useNetworkClients } = await import('../../../hooks/usePlatformCommon');
    vi.mocked(useNetworkClients).mockReturnValue(mockHookReturn as any);

    render(<NetworkClients />);

    const yesTexts = screen.getAllByText('Yes');
    const noTexts = screen.getAllByText('No');

    // First client: running=Yes, connected=Yes
    // Second client: running=No, connected=No
    expect(yesTexts.length).toBeGreaterThanOrEqual(2);
    expect(noTexts.length).toBeGreaterThanOrEqual(2);
  });

  it('should call useNetworkClients hook', async () => {
    const { useNetworkClients } = await import('../../../hooks/usePlatformCommon');
    vi.mocked(useNetworkClients).mockReturnValue(mockHookReturn as any);

    render(<NetworkClients />);

    expect(useNetworkClients).toHaveBeenCalled();
  });

  it('should handle loading state', async () => {
    const { useNetworkClients } = await import('../../../hooks/usePlatformCommon');
    const loadingData = {
      data: [],
      isLoading: true,
      error: null,
    };
    vi.mocked(useNetworkClients).mockReturnValue(loadingData as any);

    render(<NetworkClients />);

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should handle empty data', async () => {
    const { useNetworkClients } = await import('../../../hooks/usePlatformCommon');
    const emptyData = {
      data: [],
      isLoading: false,
      error: null,
    };
    vi.mocked(useNetworkClients).mockReturnValue(emptyData as any);

    render(<NetworkClients />);

    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

