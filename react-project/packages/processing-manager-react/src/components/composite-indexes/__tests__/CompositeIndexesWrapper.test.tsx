import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import CompositeIndexesWrapper from '../CompositeIndexesWrapper';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  usePlatformCommonCompositeIndexesList: vi.fn(),
  useEntitiesListPossible: vi.fn(),
  usePlatformCommonCompositeIndexesReindex: vi.fn(),
  usePlatformCommonCompositeIndexesDelete: vi.fn(),
  usePlatformCommonCompositeIndexesCreate: vi.fn(),
}));

// Mock the CompositeIndexes component from @cyoda/http-api-react
vi.mock('@cyoda/http-api-react', () => ({
  CompositeIndexes: vi.fn(({
    getAllCompositeIndexesRequestFn,
    getReportingFetchTypesRequestFn,
    postCompositeIndexesReindexRequestFn,
    postCompositeIndexesDeleteRequestFn,
    postCompositeIndexesCreateRequestFn,
  }) => {
    // Call the functions to test they work
    if (getAllCompositeIndexesRequestFn) getAllCompositeIndexesRequestFn('test-entity');
    if (getReportingFetchTypesRequestFn) getReportingFetchTypesRequestFn();
    if (postCompositeIndexesReindexRequestFn) postCompositeIndexesReindexRequestFn('test-index-id');
    if (postCompositeIndexesDeleteRequestFn) postCompositeIndexesDeleteRequestFn('test-index-id');
    if (postCompositeIndexesCreateRequestFn) postCompositeIndexesCreateRequestFn('test-form');
    
    return <div data-testid="composite-indexes">CompositeIndexes</div>;
  }),
}));

describe('CompositeIndexesWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (hooks.usePlatformCommonCompositeIndexesList as any).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (hooks.useEntitiesListPossible as any).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (hooks.usePlatformCommonCompositeIndexesReindex as any).mockReturnValue({
      mutate: vi.fn(),
    });
    (hooks.usePlatformCommonCompositeIndexesDelete as any).mockReturnValue({
      mutate: vi.fn(),
    });
    (hooks.usePlatformCommonCompositeIndexesCreate as any).mockReturnValue({
      mutate: vi.fn(),
    });
  });

  it('should render the component', () => {
    const { container } = render(<CompositeIndexesWrapper />);
    expect(container).toBeInTheDocument();
  });

  it('should render CompositeIndexes component', () => {
    const { getByTestId } = render(<CompositeIndexesWrapper />);
    expect(getByTestId('composite-indexes')).toBeInTheDocument();
  });

  it('should call usePlatformCommonCompositeIndexesList hook with entity', () => {
    render(<CompositeIndexesWrapper />);
    expect(hooks.usePlatformCommonCompositeIndexesList).toHaveBeenCalledWith({
      entity: 'test-entity',
    });
  });

  it('should call useEntitiesListPossible hook', () => {
    render(<CompositeIndexesWrapper />);
    expect(hooks.useEntitiesListPossible).toHaveBeenCalled();
  });

  it('should call usePlatformCommonCompositeIndexesReindex hook with indexId', () => {
    render(<CompositeIndexesWrapper />);
    expect(hooks.usePlatformCommonCompositeIndexesReindex).toHaveBeenCalledWith({
      indexId: 'test-index-id',
    });
  });

  it('should call usePlatformCommonCompositeIndexesDelete hook with indexId', () => {
    render(<CompositeIndexesWrapper />);
    expect(hooks.usePlatformCommonCompositeIndexesDelete).toHaveBeenCalledWith({
      indexId: 'test-index-id',
    });
  });

  it('should call usePlatformCommonCompositeIndexesCreate hook with data', () => {
    render(<CompositeIndexesWrapper />);
    expect(hooks.usePlatformCommonCompositeIndexesCreate).toHaveBeenCalledWith({
      data: 'test-form',
    });
  });

  it('should pass getAllCompositeIndexesRequestFn to CompositeIndexes', () => {
    const { getByTestId } = render(<CompositeIndexesWrapper />);
    expect(getByTestId('composite-indexes')).toBeInTheDocument();
    expect(hooks.usePlatformCommonCompositeIndexesList).toHaveBeenCalled();
  });

  it('should pass getReportingFetchTypesRequestFn to CompositeIndexes', () => {
    const { getByTestId } = render(<CompositeIndexesWrapper />);
    expect(getByTestId('composite-indexes')).toBeInTheDocument();
    expect(hooks.useEntitiesListPossible).toHaveBeenCalled();
  });

  it('should pass postCompositeIndexesReindexRequestFn to CompositeIndexes', () => {
    const { getByTestId } = render(<CompositeIndexesWrapper />);
    expect(getByTestId('composite-indexes')).toBeInTheDocument();
    expect(hooks.usePlatformCommonCompositeIndexesReindex).toHaveBeenCalled();
  });

  it('should pass postCompositeIndexesDeleteRequestFn to CompositeIndexes', () => {
    const { getByTestId } = render(<CompositeIndexesWrapper />);
    expect(getByTestId('composite-indexes')).toBeInTheDocument();
    expect(hooks.usePlatformCommonCompositeIndexesDelete).toHaveBeenCalled();
  });

  it('should pass postCompositeIndexesCreateRequestFn to CompositeIndexes', () => {
    const { getByTestId } = render(<CompositeIndexesWrapper />);
    expect(getByTestId('composite-indexes')).toBeInTheDocument();
    expect(hooks.usePlatformCommonCompositeIndexesCreate).toHaveBeenCalled();
  });

  it('should wrap CompositeIndexes in a div', () => {
    const { container } = render(<CompositeIndexesWrapper />);
    const wrapper = container.querySelector('div');
    expect(wrapper).toBeInTheDocument();
  });

  it('should provide function that returns usePlatformCommonCompositeIndexesList result', () => {
    const mockResult = { data: [{ id: '1', name: 'index1' }], isLoading: false };
    (hooks.usePlatformCommonCompositeIndexesList as any).mockReturnValue(mockResult);
    
    render(<CompositeIndexesWrapper />);
    expect(hooks.usePlatformCommonCompositeIndexesList).toHaveBeenCalled();
  });

  it('should provide function that returns useEntitiesListPossible result', () => {
    const mockResult = { data: ['Entity1', 'Entity2'], isLoading: false };
    (hooks.useEntitiesListPossible as any).mockReturnValue(mockResult);
    
    render(<CompositeIndexesWrapper />);
    expect(hooks.useEntitiesListPossible).toHaveBeenCalled();
  });

  it('should provide function that returns usePlatformCommonCompositeIndexesReindex result', () => {
    const mockMutate = vi.fn();
    (hooks.usePlatformCommonCompositeIndexesReindex as any).mockReturnValue({
      mutate: mockMutate,
    });
    
    render(<CompositeIndexesWrapper />);
    expect(hooks.usePlatformCommonCompositeIndexesReindex).toHaveBeenCalled();
  });

  it('should provide function that returns usePlatformCommonCompositeIndexesDelete result', () => {
    const mockMutate = vi.fn();
    (hooks.usePlatformCommonCompositeIndexesDelete as any).mockReturnValue({
      mutate: mockMutate,
    });
    
    render(<CompositeIndexesWrapper />);
    expect(hooks.usePlatformCommonCompositeIndexesDelete).toHaveBeenCalled();
  });

  it('should provide function that returns usePlatformCommonCompositeIndexesCreate result', () => {
    const mockMutate = vi.fn();
    (hooks.usePlatformCommonCompositeIndexesCreate as any).mockReturnValue({
      mutate: mockMutate,
    });
    
    render(<CompositeIndexesWrapper />);
    expect(hooks.usePlatformCommonCompositeIndexesCreate).toHaveBeenCalled();
  });
});

