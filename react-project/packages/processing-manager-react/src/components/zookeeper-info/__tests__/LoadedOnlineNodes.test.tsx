/**
 * Tests for LoadedOnlineNodes Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadedOnlineNodes } from '../LoadedOnlineNodes';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  usePlatformCommonZkInfoLoadedOnlineNodes: vi.fn(),
}));

// Mock the LoadedOnlineNodes component from @cyoda/http-api-react
vi.mock('@cyoda/http-api-react', () => ({
  LoadedOnlineNodes: vi.fn(({ getZkInfoLoadedOnlineNodesRequestFn, clusterStateClientNodes }) => {
    // Call the function to test hook integration
    getZkInfoLoadedOnlineNodesRequestFn();
    return (
      <div data-testid="loaded-online-nodes-component">
        Loaded Online Nodes Component
        {clusterStateClientNodes?.count && <span>Count: {clusterStateClientNodes.count}</span>}
      </div>
    );
  }),
}));

describe('LoadedOnlineNodes', () => {
  const mockHookReturn = {
    data: { nodes: ['node1', 'node2'] },
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.usePlatformCommonZkInfoLoadedOnlineNodes).mockReturnValue(mockHookReturn as any);
  });

  it('should render the component', () => {
    render(<LoadedOnlineNodes />);
    
    const component = screen.getByTestId('loaded-online-nodes-component');
    expect(component).toBeInTheDocument();
  });

  it('should render LoadedOnlineNodesComponent from @cyoda/http-api-react', () => {
    render(<LoadedOnlineNodes />);
    
    expect(screen.getByText('Loaded Online Nodes Component')).toBeInTheDocument();
  });




  it('should call usePlatformCommonZkInfoLoadedOnlineNodes hook when getZkInfoLoadedOnlineNodesRequestFn is invoked', () => {
    render(<LoadedOnlineNodes />);
    
    // The mock component calls getZkInfoLoadedOnlineNodesRequestFn
    expect(hooks.usePlatformCommonZkInfoLoadedOnlineNodes).toHaveBeenCalled();
  });

  it('should wrap component in a div', () => {
    const { container } = render(<LoadedOnlineNodes />);
    
    const wrapper = container.querySelector('div');
    expect(wrapper).toBeInTheDocument();
  });

  it('should handle clusterStateClientNodes with data', () => {
    const clientNodes = { count: 3, nodes: ['node1', 'node2', 'node3'] };
    
    render(<LoadedOnlineNodes clusterStateClientNodes={clientNodes} />);
    
    expect(screen.getByText(/Count: 3/)).toBeInTheDocument();
  });

  it('should handle hook returning different data', () => {
    const differentData = {
      data: { nodes: ['node3', 'node4', 'node5'] },
      isLoading: true,
      error: null,
    };
    vi.mocked(hooks.usePlatformCommonZkInfoLoadedOnlineNodes).mockReturnValue(differentData as any);
    
    render(<LoadedOnlineNodes />);
    
    expect(screen.getByTestId('loaded-online-nodes-component')).toBeInTheDocument();
  });

  it('should handle hook returning error state', () => {
    const errorData = {
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch online nodes'),
    };
    vi.mocked(hooks.usePlatformCommonZkInfoLoadedOnlineNodes).mockReturnValue(errorData as any);
    
    render(<LoadedOnlineNodes />);
    
    expect(screen.getByTestId('loaded-online-nodes-component')).toBeInTheDocument();
  });

  it('should handle hook returning loading state', () => {
    const loadingData = {
      data: null,
      isLoading: true,
      error: null,
    };
    vi.mocked(hooks.usePlatformCommonZkInfoLoadedOnlineNodes).mockReturnValue(loadingData as any);
    
    render(<LoadedOnlineNodes />);
    
    expect(screen.getByTestId('loaded-online-nodes-component')).toBeInTheDocument();
  });


});

