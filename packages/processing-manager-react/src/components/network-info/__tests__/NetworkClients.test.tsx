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
      { id: '1', address: '192.168.1.1', port: 8080, connected: true },
      { id: '2', address: '192.168.1.2', port: 8081, connected: false },
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

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should render table with client data', async () => {
    const { useNetworkClients } = await import('../../../hooks/usePlatformCommon');
    vi.mocked(useNetworkClients).mockReturnValue(mockHookReturn as any);

    render(<NetworkClients />);

    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.2')).toBeInTheDocument();
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

