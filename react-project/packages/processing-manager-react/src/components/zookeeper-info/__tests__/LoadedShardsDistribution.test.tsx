/**
 * Tests for LoadedShardsDistribution Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadedShardsDistribution } from '../LoadedShardsDistribution';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  usePlatformCommonZkInfoLoadedShardsDistribution: vi.fn(),
}));

// Mock the LoadedShardsDistribution component from @cyoda/http-api-react
vi.mock('@cyoda/http-api-react', () => ({
  LoadedShardsDistribution: vi.fn(({ 
    getZkInfoLoadedShardsDistributionRequestFn, 
    clusterState, 
    clusterStateShardsDistr 
  }) => {
    // Call the function to test hook integration
    getZkInfoLoadedShardsDistributionRequestFn();
    return (
      <div data-testid="loaded-shards-distribution-component">
        Loaded Shards Distribution Component
        {clusterState?.totalShards && <span>Total: {clusterState.totalShards}</span>}
        {clusterStateShardsDistr?.distribution && <span>Distribution: {clusterStateShardsDistr.distribution}</span>}
      </div>
    );
  }),
}));

describe('LoadedShardsDistribution', () => {
  const mockHookReturn = {
    data: { shards: ['shard1', 'shard2'] },
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.usePlatformCommonZkInfoLoadedShardsDistribution).mockReturnValue(mockHookReturn as any);
  });

  it('should render the component', () => {
    render(<LoadedShardsDistribution />);
    
    const component = screen.getByTestId('loaded-shards-distribution-component');
    expect(component).toBeInTheDocument();
  });

  it('should render LoadedShardsDistributionComponent from @cyoda/http-api-react', () => {
    render(<LoadedShardsDistribution />);
    
    expect(screen.getByText('Loaded Shards Distribution Component')).toBeInTheDocument();
  });





  it('should call usePlatformCommonZkInfoLoadedShardsDistribution hook when getZkInfoLoadedShardsDistributionRequestFn is invoked', () => {
    render(<LoadedShardsDistribution />);
    
    // The mock component calls getZkInfoLoadedShardsDistributionRequestFn
    expect(hooks.usePlatformCommonZkInfoLoadedShardsDistribution).toHaveBeenCalled();
  });

  it('should wrap component in a div', () => {
    const { container } = render(<LoadedShardsDistribution />);
    
    const wrapper = container.querySelector('div');
    expect(wrapper).toBeInTheDocument();
  });

  it('should handle clusterState with data', () => {
    const clusterState = { totalShards: 15, activeShards: 12 };
    
    render(<LoadedShardsDistribution clusterState={clusterState} />);
    
    expect(screen.getByText(/Total: 15/)).toBeInTheDocument();
  });

  it('should handle clusterStateShardsDistr with data', () => {
    const shardsDistr = { distribution: 'balanced' };
    
    render(<LoadedShardsDistribution clusterStateShardsDistr={shardsDistr} />);
    
    expect(screen.getByText(/Distribution: balanced/)).toBeInTheDocument();
  });

  it('should handle both clusterState and clusterStateShardsDistr with data', () => {
    const clusterState = { totalShards: 20 };
    const shardsDistr = { distribution: 'uneven' };
    
    render(
      <LoadedShardsDistribution 
        clusterState={clusterState} 
        clusterStateShardsDistr={shardsDistr} 
      />
    );
    
    expect(screen.getByText(/Total: 20/)).toBeInTheDocument();
    expect(screen.getByText(/Distribution: uneven/)).toBeInTheDocument();
  });

  it('should handle hook returning different data', () => {
    const differentData = {
      data: { shards: ['shard3', 'shard4', 'shard5'] },
      isLoading: true,
      error: null,
    };
    vi.mocked(hooks.usePlatformCommonZkInfoLoadedShardsDistribution).mockReturnValue(differentData as any);
    
    render(<LoadedShardsDistribution />);
    
    expect(screen.getByTestId('loaded-shards-distribution-component')).toBeInTheDocument();
  });

  it('should handle hook returning error state', () => {
    const errorData = {
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch shards distribution'),
    };
    vi.mocked(hooks.usePlatformCommonZkInfoLoadedShardsDistribution).mockReturnValue(errorData as any);
    
    render(<LoadedShardsDistribution />);
    
    expect(screen.getByTestId('loaded-shards-distribution-component')).toBeInTheDocument();
  });

  it('should handle hook returning loading state', () => {
    const loadingData = {
      data: null,
      isLoading: true,
      error: null,
    };
    vi.mocked(hooks.usePlatformCommonZkInfoLoadedShardsDistribution).mockReturnValue(loadingData as any);
    
    render(<LoadedShardsDistribution />);
    
    expect(screen.getByTestId('loaded-shards-distribution-component')).toBeInTheDocument();
  });


});

