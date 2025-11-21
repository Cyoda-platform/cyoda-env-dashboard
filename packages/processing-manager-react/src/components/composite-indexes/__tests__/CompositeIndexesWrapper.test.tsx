import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { App } from 'antd';
import CompositeIndexesWrapper from '../CompositeIndexesWrapper';

// Mock the hooks
vi.mock('../../../hooks/usePlatformCommon', () => ({
  useCompositeIndexes: vi.fn(),
  useReindexCompositeIndex: vi.fn(),
  useDeleteCompositeIndex: vi.fn(),
  useCreateCompositeIndex: vi.fn(),
  useExportCompositeIndexes: vi.fn(),
  useImportCompositeIndexes: vi.fn(),
}));

vi.mock('../../../hooks/useProcessing', () => ({
  useEntitiesListPossible: vi.fn(),
}));

// Mock CompositeIndexCreateDialog
vi.mock('../CompositeIndexCreateDialog', () => ({
  CompositeIndexCreateDialog: () => <div data-testid="create-dialog">Create Dialog</div>,
}));

// Wrapper component with App provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <App>{children}</App>
);

describe('CompositeIndexesWrapper', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const platformCommonHooks = await import('../../../hooks/usePlatformCommon');
    const processingHooks = await import('../../../hooks/useProcessing');

    vi.mocked(processingHooks.useEntitiesListPossible).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(platformCommonHooks.useCompositeIndexes).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);
    vi.mocked(platformCommonHooks.useReindexCompositeIndex).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(platformCommonHooks.useDeleteCompositeIndex).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(platformCommonHooks.useCreateCompositeIndex).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(platformCommonHooks.useExportCompositeIndexes).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(platformCommonHooks.useImportCompositeIndexes).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it('should render the component', () => {
    const { container } = render(<CompositeIndexesWrapper />, { wrapper: TestWrapper });
    expect(container).toBeInTheDocument();
  });

  it('should render entity type selector', async () => {
    const processingHooks = await import('../../../hooks/useProcessing');

    vi.mocked(processingHooks.useEntitiesListPossible).mockReturnValue({
      data: ['Entity1', 'Entity2'],
      isLoading: false,
    } as any);

    const { container } = render(<CompositeIndexesWrapper />, { wrapper: TestWrapper });
    expect(container.querySelector('.ant-select')).toBeInTheDocument();
  });

  it('should render composite indexes table', () => {
    const { container } = render(<CompositeIndexesWrapper />, { wrapper: TestWrapper });
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should render Create New button', () => {
    const { getByText } = render(<CompositeIndexesWrapper />, { wrapper: TestWrapper });
    expect(getByText('Create New')).toBeInTheDocument();
  });

  it('should render Export and Import buttons', () => {
    const { getByText } = render(<CompositeIndexesWrapper />, { wrapper: TestWrapper });
    expect(getByText('Export')).toBeInTheDocument();
    expect(getByText('Import')).toBeInTheDocument();
  });

});

