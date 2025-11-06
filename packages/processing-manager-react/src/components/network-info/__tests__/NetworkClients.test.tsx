/**
 * Tests for NetworkClients Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NetworkClients } from '../NetworkClients';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  usePlatformCommonNetInfoClients: vi.fn(),
}));

// Mock the NetworkClients component from @cyoda/http-api-react
vi.mock('@cyoda/http-api-react', () => ({
  NetworkClients: vi.fn(({ getNetInfoClientsRequestFn }) => {
    // Call the function to test hook integration
    getNetInfoClientsRequestFn();
    return <div data-testid="network-clients-component">Network Clients Component</div>;
  }),
}));

describe('NetworkClients', () => {
  const mockHookReturn = {
    data: { clients: ['client1', 'client2'] },
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.usePlatformCommonNetInfoClients).mockReturnValue(mockHookReturn as any);
  });

  it('should render the component', () => {
    render(<NetworkClients />);
    
    const component = screen.getByTestId('network-clients-component');
    expect(component).toBeInTheDocument();
  });

  it('should render NetworkClientsComponent from @cyoda/http-api-react', () => {
    render(<NetworkClients />);
    
    expect(screen.getByText('Network Clients Component')).toBeInTheDocument();
  });


  it('should call usePlatformCommonNetInfoClients hook when getNetInfoClientsRequestFn is invoked', () => {
    render(<NetworkClients />);
    
    // The mock component calls getNetInfoClientsRequestFn
    expect(hooks.usePlatformCommonNetInfoClients).toHaveBeenCalled();
  });

  it('should wrap component in a div', () => {
    const { container } = render(<NetworkClients />);
    
    const wrapper = container.querySelector('div');
    expect(wrapper).toBeInTheDocument();
  });

  it('should handle hook returning different data', () => {
    const differentData = {
      data: { clients: ['client3', 'client4', 'client5'] },
      isLoading: true,
      error: null,
    };
    vi.mocked(hooks.usePlatformCommonNetInfoClients).mockReturnValue(differentData as any);
    
    render(<NetworkClients />);
    
    expect(screen.getByTestId('network-clients-component')).toBeInTheDocument();
  });

  it('should handle hook returning error state', () => {
    const errorData = {
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch clients'),
    };
    vi.mocked(hooks.usePlatformCommonNetInfoClients).mockReturnValue(errorData as any);
    
    render(<NetworkClients />);
    
    expect(screen.getByTestId('network-clients-component')).toBeInTheDocument();
  });

  it('should handle hook returning loading state', () => {
    const loadingData = {
      data: null,
      isLoading: true,
      error: null,
    };
    vi.mocked(hooks.usePlatformCommonNetInfoClients).mockReturnValue(loadingData as any);
    
    render(<NetworkClients />);
    
    expect(screen.getByTestId('network-clients-component')).toBeInTheDocument();
  });


});

