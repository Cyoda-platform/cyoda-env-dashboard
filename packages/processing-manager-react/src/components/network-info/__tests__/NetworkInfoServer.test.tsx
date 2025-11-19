/**
 * Tests for NetworkInfoServer Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NetworkInfoServer } from '../NetworkInfoServer';

// Mock the hooks
vi.mock('../../../hooks/usePlatformCommon', () => ({
  useNetworkServerInfo: vi.fn(),
}));

describe('NetworkInfoServer', () => {
  const mockHookReturn = {
    data: { hostname: 'test-server', ip: '192.168.1.1', port: 8080, version: '1.0.0' },
    isLoading: false,
    error: null,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useNetworkServerInfo } = await import('../../../hooks/usePlatformCommon');
    vi.mocked(useNetworkServerInfo).mockReturnValue(mockHookReturn as any);
  });

  it('should render the component', async () => {
    const { useNetworkServerInfo } = await import('../../../hooks/usePlatformCommon');
    vi.mocked(useNetworkServerInfo).mockReturnValue(mockHookReturn as any);

    render(<NetworkInfoServer />);

    expect(screen.getByText('Server Information')).toBeInTheDocument();
  });

  it('should render server data', async () => {
    const { useNetworkServerInfo } = await import('../../../hooks/usePlatformCommon');
    vi.mocked(useNetworkServerInfo).mockReturnValue(mockHookReturn as any);

    render(<NetworkInfoServer />);

    expect(screen.getByText('test-server')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  it('should call useNetworkServerInfo hook', async () => {
    const { useNetworkServerInfo } = await import('../../../hooks/usePlatformCommon');
    vi.mocked(useNetworkServerInfo).mockReturnValue(mockHookReturn as any);

    render(<NetworkInfoServer />);

    expect(useNetworkServerInfo).toHaveBeenCalled();
  });

  it('should show loading spinner when loading', async () => {
    const { useNetworkServerInfo } = await import('../../../hooks/usePlatformCommon');
    const loadingData = {
      data: null,
      isLoading: true,
      error: null,
    };
    vi.mocked(useNetworkServerInfo).mockReturnValue(loadingData as any);

    const { container } = render(<NetworkInfoServer />);

    // Check for Spin component by class name
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('should handle empty data', async () => {
    const { useNetworkServerInfo } = await import('../../../hooks/usePlatformCommon');
    const emptyData = {
      data: null,
      isLoading: false,
      error: null,
    };
    vi.mocked(useNetworkServerInfo).mockReturnValue(emptyData as any);

    render(<NetworkInfoServer />);

    expect(screen.getByText('Server Information')).toBeInTheDocument();
  });
});

