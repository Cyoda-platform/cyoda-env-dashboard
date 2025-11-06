/**
 * Tests for CurrNodeInfo Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CurrNodeInfo } from '../CurrNodeInfo';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  usePlatformCommonZkInfoCurrNodeInfo: vi.fn(),
}));

// Mock the CurrNodeInfo component from @cyoda/http-api-react
vi.mock('@cyoda/http-api-react', () => ({
  CurrNodeInfo: vi.fn(({ getZkInfoCurrNodeInfoRequestFn, clusterStateCurrentNode }) => {
    // Call the function to test hook integration
    getZkInfoCurrNodeInfoRequestFn();
    return (
      <div data-testid="curr-node-info-component">
        Current Node Info Component
        {clusterStateCurrentNode?.name && <span>Node: {clusterStateCurrentNode.name}</span>}
      </div>
    );
  }),
}));

describe('CurrNodeInfo', () => {
  const mockHookReturn = {
    data: { nodeInfo: 'test-node-info' },
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.usePlatformCommonZkInfoCurrNodeInfo).mockReturnValue(mockHookReturn as any);
  });

  it('should render the component', () => {
    render(<CurrNodeInfo />);
    
    const component = screen.getByTestId('curr-node-info-component');
    expect(component).toBeInTheDocument();
  });

  it('should render CurrNodeInfoComponent from @cyoda/http-api-react', () => {
    render(<CurrNodeInfo />);
    
    expect(screen.getByText('Current Node Info Component')).toBeInTheDocument();
  });




  it('should call usePlatformCommonZkInfoCurrNodeInfo hook when getZkInfoCurrNodeInfoRequestFn is invoked', () => {
    render(<CurrNodeInfo />);
    
    // The mock component calls getZkInfoCurrNodeInfoRequestFn
    expect(hooks.usePlatformCommonZkInfoCurrNodeInfo).toHaveBeenCalled();
  });

  it('should wrap component in a div', () => {
    const { container } = render(<CurrNodeInfo />);
    
    const wrapper = container.querySelector('div');
    expect(wrapper).toBeInTheDocument();
  });

  it('should handle clusterStateCurrentNode with data', () => {
    const clusterState = { name: 'test-node', status: 'active', port: 8080 };
    
    render(<CurrNodeInfo clusterStateCurrentNode={clusterState} />);
    
    expect(screen.getByText(/Node: test-node/)).toBeInTheDocument();
  });

  it('should handle hook returning different data', () => {
    const differentData = {
      data: { nodeInfo: 'different-node', details: 'some-details' },
      isLoading: true,
      error: null,
    };
    vi.mocked(hooks.usePlatformCommonZkInfoCurrNodeInfo).mockReturnValue(differentData as any);
    
    render(<CurrNodeInfo />);
    
    expect(screen.getByTestId('curr-node-info-component')).toBeInTheDocument();
  });

  it('should handle hook returning error state', () => {
    const errorData = {
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch node info'),
    };
    vi.mocked(hooks.usePlatformCommonZkInfoCurrNodeInfo).mockReturnValue(errorData as any);
    
    render(<CurrNodeInfo />);
    
    expect(screen.getByTestId('curr-node-info-component')).toBeInTheDocument();
  });

  it('should handle hook returning loading state', () => {
    const loadingData = {
      data: null,
      isLoading: true,
      error: null,
    };
    vi.mocked(hooks.usePlatformCommonZkInfoCurrNodeInfo).mockReturnValue(loadingData as any);
    
    render(<CurrNodeInfo />);
    
    expect(screen.getByTestId('curr-node-info-component')).toBeInTheDocument();
  });


});

