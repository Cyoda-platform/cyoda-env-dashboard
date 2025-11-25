import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import EntityVersionsModal from '../EntityVersionsModal';
import * as hooks from '@/hooks';

// Mock the useEntityVersions hook
vi.mock('@/hooks', () => ({
  useEntityVersions: vi.fn(),
}));

// Mock the child components
vi.mock('../../versions/TransitionVersionsFilter', () => ({
  default: ({ onChange }: any) => (
    <div data-testid="versions-filter">
      <button onClick={() => onChange({ someFilter: 'value' })}>Apply Filter</button>
    </div>
  ),
}));

vi.mock('../../versions/TransitionVersionsAggregated', () => ({
  default: ({ rows }: any) => (
    <div data-testid="versions-aggregated">Aggregated: {rows.length} rows</div>
  ),
}));

vi.mock('../../versions/TransitionVersionsSorted', () => ({
  default: ({ rows }: any) => (
    <div data-testid="versions-sorted">Sorted: {rows.length} rows</div>
  ),
}));

vi.mock('../../common/Pagination', () => ({
  Pagination: ({ firstPage, lastPage }: any) => (
    <div data-testid="pagination">
      First: {firstPage ? 'true' : 'false'}, Last: {lastPage ? 'true' : 'false'}
    </div>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('EntityVersionsModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when visible is true', () => {
    vi.mocked(hooks.useEntityVersions).mockReturnValue({
      data: { rows: [], firstPage: true, lastPage: true },
      isLoading: false,
      error: null,
    } as any);

    render(
      <EntityVersionsModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Version columns of entity/i)).toBeInTheDocument();
    expect(screen.getByText(/TestEntity/i)).toBeInTheDocument();
    expect(screen.getByText(/entity-123/i)).toBeInTheDocument();
  });

  it('should not render modal when visible is false', () => {
    vi.mocked(hooks.useEntityVersions).mockReturnValue({
      data: { rows: [], firstPage: true, lastPage: true },
      isLoading: false,
      error: null,
    } as any);

    render(
      <EntityVersionsModal
        visible={false}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText(/Version columns of entity/i)).not.toBeInTheDocument();
  });

  it('should call onClose when modal is closed', async () => {
    const user = userEvent.setup();
    vi.mocked(hooks.useEntityVersions).mockReturnValue({
      data: { rows: [], firstPage: true, lastPage: true },
      isLoading: false,
      error: null,
    } as any);

    render(
      <EntityVersionsModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    // Find and click the close button
    const closeButton = document.querySelector('.ant-modal-close');
    if (closeButton) {
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should render filter component', () => {
    vi.mocked(hooks.useEntityVersions).mockReturnValue({
      data: { rows: [], firstPage: true, lastPage: true },
      isLoading: false,
      error: null,
    } as any);

    render(
      <EntityVersionsModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByTestId('versions-filter')).toBeInTheDocument();
  });

  it('should render aggregated and sorted components', () => {
    vi.mocked(hooks.useEntityVersions).mockReturnValue({
      data: { rows: [{ id: 1 }, { id: 2 }], firstPage: true, lastPage: true },
      isLoading: false,
      error: null,
    } as any);

    render(
      <EntityVersionsModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Aggregated: 2 rows')).toBeInTheDocument();
    expect(screen.getByText('Sorted: 2 rows')).toBeInTheDocument();
  });

  it('should pass correct parameters to useEntityVersions hook', () => {
    vi.mocked(hooks.useEntityVersions).mockReturnValue({
      data: { rows: [], firstPage: true, lastPage: true },
      isLoading: false,
      error: null,
    } as any);

    render(
      <EntityVersionsModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-456"
        entityType="com.example.AnotherEntity"
      />,
      { wrapper: createWrapper() }
    );

    expect(vi.mocked(hooks.useEntityVersions)).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'com.example.AnotherEntity',
        id: 'entity-456',
      })
    );
  });

  it('should extract entity class name from entity type', () => {
    vi.mocked(hooks.useEntityVersions).mockReturnValue({
      data: { rows: [], firstPage: true, lastPage: true },
      isLoading: false,
      error: null,
    } as any);

    render(
      <EntityVersionsModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.package.MyEntity"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/MyEntity/i)).toBeInTheDocument();
  });

  it('should handle entity type without package', () => {
    vi.mocked(hooks.useEntityVersions).mockReturnValue({
      data: { rows: [], firstPage: true, lastPage: true },
      isLoading: false,
      error: null,
    } as any);

    render(
      <EntityVersionsModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="SimpleEntity"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/SimpleEntity/i)).toBeInTheDocument();
  });

  it('should render pagination component', () => {
    vi.mocked(hooks.useEntityVersions).mockReturnValue({
      data: { rows: [{ id: 1 }], firstPage: false, lastPage: false },
      isLoading: false,
      error: null,
    } as any);

    render(
      <EntityVersionsModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByText(/First: false/i)).toBeInTheDocument();
    expect(screen.getByText(/Last: false/i)).toBeInTheDocument();
  });

  it('should have correct modal class', () => {
    vi.mocked(hooks.useEntityVersions).mockReturnValue({
      data: { rows: [], firstPage: true, lastPage: true },
      isLoading: false,
      error: null,
    } as any);

    render(
      <EntityVersionsModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    const modal = document.body.querySelector('.entity-versions-modal');
    expect(modal).toBeInTheDocument();
  });

  it('should render without footer', () => {
    vi.mocked(hooks.useEntityVersions).mockReturnValue({
      data: { rows: [], firstPage: true, lastPage: true },
      isLoading: false,
      error: null,
    } as any);

    render(
      <EntityVersionsModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    const footer = document.body.querySelector('.ant-modal-footer');
    expect(footer).not.toBeInTheDocument();
  });

  it('should handle filter changes', async () => {
    const user = userEvent.setup();
    vi.mocked(hooks.useEntityVersions).mockReturnValue({
      data: { rows: [], firstPage: true, lastPage: true },
      isLoading: false,
      error: null,
    } as any);

    render(
      <EntityVersionsModal
        visible={true}
        onClose={mockOnClose}
        entityId="entity-123"
        entityType="com.example.TestEntity"
      />,
      { wrapper: createWrapper() }
    );

    const applyFilterButton = screen.getByText('Apply Filter');
    await user.click(applyFilterButton);

    // After filter change, hook should be called with new parameters
    await waitFor(() => {
      expect(vi.mocked(hooks.useEntityVersions)).toHaveBeenCalled();
    });
  });
});

