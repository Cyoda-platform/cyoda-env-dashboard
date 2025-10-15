/**
 * Tests for NetworkInfoServer Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NetworkInfoServer } from '../NetworkInfoServer';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  usePlatformCommonNetInfoServer: vi.fn(),
}));

// Mock the NetworkInfoServer component from @cyoda/http-api-react
vi.mock('@cyoda/http-api-react', () => ({
  NetworkInfoServer: vi.fn(({ getNetInfoServerRequestFn }) => {
    // Call the function to test hook integration
    getNetInfoServerRequestFn();
    return <div data-testid="network-info-server-component">Network Info Server Component</div>;
  }),
}));

describe('NetworkInfoServer', () => {
  const mockHookReturn = {
    data: { server: 'test-server' },
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.usePlatformCommonNetInfoServer).mockReturnValue(mockHookReturn as any);
  });

  it('should render the component', () => {
    render(<NetworkInfoServer />);
    
    const component = screen.getByTestId('network-info-server-component');
    expect(component).toBeInTheDocument();
  });

  it('should render NetworkInfoServerComponent from @cyoda/http-api-react', () => {
    render(<NetworkInfoServer />);
    
    expect(screen.getByText('Network Info Server Component')).toBeInTheDocument();
  });

  it('should call usePlatformCommonNetInfoServer hook when getNetInfoServerRequestFn is invoked', () => {
    render(<NetworkInfoServer />);

    // The mock component calls getNetInfoServerRequestFn
    expect(hooks.usePlatformCommonNetInfoServer).toHaveBeenCalled();
  });

  it('should wrap component in a div', () => {
    const { container } = render(<NetworkInfoServer />);

    const wrapper = container.querySelector('div');
    expect(wrapper).toBeInTheDocument();
  });

  it('should handle hook returning different data', () => {
    const differentData = {
      data: { server: 'different-server', port: 8080 },
      isLoading: true,
      error: null,
    };
    vi.mocked(hooks.usePlatformCommonNetInfoServer).mockReturnValue(differentData as any);

    render(<NetworkInfoServer />);

    expect(screen.getByTestId('network-info-server-component')).toBeInTheDocument();
  });

  it('should handle hook returning error state', () => {
    const errorData = {
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch'),
    };
    vi.mocked(hooks.usePlatformCommonNetInfoServer).mockReturnValue(errorData as any);

    render(<NetworkInfoServer />);

    expect(screen.getByTestId('network-info-server-component')).toBeInTheDocument();
  });

  it('should handle hook returning loading state', () => {
    const loadingData = {
      data: null,
      isLoading: true,
      error: null,
    };
    vi.mocked(hooks.usePlatformCommonNetInfoServer).mockReturnValue(loadingData as any);

    render(<NetworkInfoServer />);

    expect(screen.getByTestId('network-info-server-component')).toBeInTheDocument();
  });
});

