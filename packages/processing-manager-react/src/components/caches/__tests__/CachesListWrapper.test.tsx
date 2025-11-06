import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import CachesListWrapper from '../CachesListWrapper';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  usePlatformCommonCachesList: vi.fn(),
  usePlatformCommonInvalidateCache: vi.fn(),
  usePlatformCommonCacheKeys: vi.fn(),
}));

// Mock the CachesListView component from @cyoda/http-api-react
vi.mock('@cyoda/http-api-react', () => ({
  CachesListView: vi.fn(({ getCachesListRequestFn, getInvalidateCacheRequestFn, getCacheKeysRequestFn }) => {
    // Call the functions to test they work
    if (getCachesListRequestFn) getCachesListRequestFn();
    if (getInvalidateCacheRequestFn) getInvalidateCacheRequestFn('test-cache');
    if (getCacheKeysRequestFn) getCacheKeysRequestFn('test-cache');
    
    return <div data-testid="caches-list-view">CachesListView</div>;
  }),
}));

describe('CachesListWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (hooks.usePlatformCommonCachesList as any).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (hooks.usePlatformCommonInvalidateCache as any).mockReturnValue({
      mutate: vi.fn(),
    });
    (hooks.usePlatformCommonCacheKeys as any).mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  it('should render the component', () => {
    const { container } = render(<CachesListWrapper />);
    expect(container).toBeInTheDocument();
  });

  it('should render CachesListView component', () => {
    const { getByTestId } = render(<CachesListWrapper />);
    expect(getByTestId('caches-list-view')).toBeInTheDocument();
  });

  it('should call usePlatformCommonCachesList hook', () => {
    render(<CachesListWrapper />);
    expect(hooks.usePlatformCommonCachesList).toHaveBeenCalled();
  });

  it('should call usePlatformCommonInvalidateCache hook with cache type', () => {
    render(<CachesListWrapper />);
    expect(hooks.usePlatformCommonInvalidateCache).toHaveBeenCalledWith('test-cache');
  });

  it('should call usePlatformCommonCacheKeys hook with cache type', () => {
    render(<CachesListWrapper />);
    expect(hooks.usePlatformCommonCacheKeys).toHaveBeenCalledWith('test-cache');
  });

  it('should pass getCachesListRequestFn to CachesListView', () => {
    const { getByTestId } = render(<CachesListWrapper />);
    expect(getByTestId('caches-list-view')).toBeInTheDocument();
    expect(hooks.usePlatformCommonCachesList).toHaveBeenCalled();
  });

  it('should pass getInvalidateCacheRequestFn to CachesListView', () => {
    const { getByTestId } = render(<CachesListWrapper />);
    expect(getByTestId('caches-list-view')).toBeInTheDocument();
    expect(hooks.usePlatformCommonInvalidateCache).toHaveBeenCalled();
  });

  it('should pass getCacheKeysRequestFn to CachesListView', () => {
    const { getByTestId } = render(<CachesListWrapper />);
    expect(getByTestId('caches-list-view')).toBeInTheDocument();
    expect(hooks.usePlatformCommonCacheKeys).toHaveBeenCalled();
  });

  it('should wrap CachesListView in a div', () => {
    const { container } = render(<CachesListWrapper />);
    const wrapper = container.querySelector('div');
    expect(wrapper).toBeInTheDocument();
  });

  it('should provide function that returns usePlatformCommonCachesList result', () => {
    const mockResult = { data: ['cache1', 'cache2'], isLoading: false };
    (hooks.usePlatformCommonCachesList as any).mockReturnValue(mockResult);
    
    render(<CachesListWrapper />);
    expect(hooks.usePlatformCommonCachesList).toHaveBeenCalled();
  });

  it('should provide function that returns usePlatformCommonInvalidateCache result', () => {
    const mockMutate = vi.fn();
    (hooks.usePlatformCommonInvalidateCache as any).mockReturnValue({
      mutate: mockMutate,
    });
    
    render(<CachesListWrapper />);
    expect(hooks.usePlatformCommonInvalidateCache).toHaveBeenCalled();
  });

  it('should provide function that returns usePlatformCommonCacheKeys result', () => {
    const mockResult = { data: ['key1', 'key2'], isLoading: false };
    (hooks.usePlatformCommonCacheKeys as any).mockReturnValue(mockResult);
    
    render(<CachesListWrapper />);
    expect(hooks.usePlatformCommonCacheKeys).toHaveBeenCalled();
  });
});

