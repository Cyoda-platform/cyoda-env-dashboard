import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import CompositeIndexesWrapper from '../CompositeIndexesWrapper';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks/usePlatformCommon', () => ({
  useEntityTypes: vi.fn(),
  useCompositeIndexes: vi.fn(),
  useReindexCompositeIndex: vi.fn(),
  useDeleteCompositeIndex: vi.fn(),
}));

describe('CompositeIndexesWrapper', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const hooks = await import('../../../hooks/usePlatformCommon');
    vi.mocked(hooks.useEntityTypes).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(hooks.useCompositeIndexes).mockReturnValue({
      data: { indexes: [] },
      isLoading: false,
      refetch: vi.fn(),
    } as any);
    vi.mocked(hooks.useReindexCompositeIndex).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
    } as any);
    vi.mocked(hooks.useDeleteCompositeIndex).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
    } as any);
  });

  it('should render the component', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    vi.mocked(hooks.useEntityTypes).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(hooks.useCompositeIndexes).mockReturnValue({
      data: { indexes: [] },
      isLoading: false,
      refetch: vi.fn(),
    } as any);
    vi.mocked(hooks.useReindexCompositeIndex).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
    } as any);
    vi.mocked(hooks.useDeleteCompositeIndex).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
    } as any);

    const { container } = render(<CompositeIndexesWrapper />);
    expect(container).toBeInTheDocument();
  });

  it('should render entity type selector', async () => {
    const hooks = await import('../../../hooks/usePlatformCommon');
    vi.mocked(hooks.useEntityTypes).mockReturnValue({
      data: ['Entity1', 'Entity2'],
      isLoading: false,
    } as any);
    vi.mocked(hooks.useCompositeIndexes).mockReturnValue({
      data: { indexes: [] },
      isLoading: false,
      refetch: vi.fn(),
    } as any);
    vi.mocked(hooks.useReindexCompositeIndex).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
    } as any);
    vi.mocked(hooks.useDeleteCompositeIndex).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
    } as any);

    const { container } = render(<CompositeIndexesWrapper />);
    expect(container.querySelector('.ant-select')).toBeInTheDocument();
  });

});

