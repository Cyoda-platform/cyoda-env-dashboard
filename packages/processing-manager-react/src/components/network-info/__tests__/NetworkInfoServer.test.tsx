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
    data: {
      type: 'TcpServer',
      id: '9c8183da-bf5e-11f0-b46a-9ecb0f97992a',
      nodeType: 'PROCESSING',
      host: '10.233.75.58',
      port: 10000,
      running: true,
      binded: true,
    },
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

    expect(screen.getByText('Server')).toBeInTheDocument();
  });

  it('should render server type', async () => {
    const { useNetworkServerInfo } = await import('../../../hooks/usePlatformCommon');
    vi.mocked(useNetworkServerInfo).mockReturnValue(mockHookReturn as any);

    render(<NetworkInfoServer />);

    expect(screen.getByText('TYPE:')).toBeInTheDocument();
    expect(screen.getByText('TcpServer')).toBeInTheDocument();
  });

  it('should render server data fields', async () => {
    const { useNetworkServerInfo } = await import('../../../hooks/usePlatformCommon');
    vi.mocked(useNetworkServerInfo).mockReturnValue(mockHookReturn as any);

    render(<NetworkInfoServer />);

    expect(screen.getByText('Id:')).toBeInTheDocument();
    expect(screen.getByText('9c8183da-bf5e-11f0-b46a-9ecb0f97992a')).toBeInTheDocument();
    expect(screen.getByText('Node Type:')).toBeInTheDocument();
    expect(screen.getByText('PROCESSING')).toBeInTheDocument();
    expect(screen.getByText('Host:')).toBeInTheDocument();
    expect(screen.getByText('10.233.75.58')).toBeInTheDocument();
    expect(screen.getByText('Port:')).toBeInTheDocument();
    expect(screen.getByText('10000')).toBeInTheDocument();
  });

  it('should render boolean fields as Yes/No', async () => {
    const { useNetworkServerInfo } = await import('../../../hooks/usePlatformCommon');
    vi.mocked(useNetworkServerInfo).mockReturnValue(mockHookReturn as any);

    render(<NetworkInfoServer />);

    expect(screen.getByText('Running:')).toBeInTheDocument();
    expect(screen.getByText('Binded:')).toBeInTheDocument();
    const yesTexts = screen.getAllByText('Yes');
    expect(yesTexts).toHaveLength(2); // Running: Yes, Binded: Yes
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

  it('should handle empty data with dashes', async () => {
    const { useNetworkServerInfo } = await import('../../../hooks/usePlatformCommon');
    const emptyData = {
      data: null,
      isLoading: false,
      error: null,
    };
    vi.mocked(useNetworkServerInfo).mockReturnValue(emptyData as any);

    render(<NetworkInfoServer />);

    expect(screen.getByText('Server')).toBeInTheDocument();
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThan(0);
  });
});

