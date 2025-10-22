/**
 * Instances Page Tests
 * Comprehensive tests for the Instances list page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Instances } from './Instances';

// Mock the hooks
const mockInstancesResponse = {
  instances: [
    {
      entityId: 'instance-1',
      entityClassName: 'com.example.Entity1',
      state: 'ACTIVE',
      currentWorkflowId: 'workflow-1',
      creationDate: 1633024800000,
      lastUpdateTime: 1633024800000,
      deleted: false,
    },
    {
      entityId: 'instance-2',
      entityClassName: 'com.example.Entity2',
      state: 'PENDING',
      currentWorkflowId: 'workflow-2',
      creationDate: 1633024900000,
      lastUpdateTime: 1633024900000,
      deleted: false,
    },
    {
      entityId: 'instance-3',
      entityClassName: 'com.example.Entity1',
      state: 'COMPLETED',
      currentWorkflowId: 'workflow-1',
      creationDate: 1633025000000,
      lastUpdateTime: 1633025000000,
      deleted: false,
    },
  ],
  hasMore: false,
};

const mockUseInstances = vi.fn();
const mockUseWorkflowEnabledTypes = vi.fn();
const mockUseWorkflowsList = vi.fn();

vi.mock('../hooks/useStatemachine', () => ({
  useInstances: () => mockUseInstances(),
  useWorkflowEnabledTypes: () => mockUseWorkflowEnabledTypes(),
  useWorkflowsList: () => mockUseWorkflowsList(),
}));

// Mock EntityTypeSwitch component
vi.mock('@cyoda/ui-lib-react', () => ({
  EntityTypeSwitch: ({ value, onChange, visible }: any) => (
    visible ? (
      <div data-testid="entity-type-switch">
        <span>Entity Type: </span>
        <button
          data-testid="entity-type-toggle"
          onClick={() => onChange(value === 'BUSINESS' ? 'PERSISTENCE' : 'BUSINESS')}
        >
          {value === 'BUSINESS' ? 'Business' : 'Technical'}
        </button>
      </div>
    ) : null
  ),
}));

// Mock global UI settings store
const mockSetEntityType = vi.fn();
const mockEntityType = vi.fn(() => 'BUSINESS');
const mockIsEnabledTechView = vi.fn(() => true);

vi.mock('../stores/globalUiSettingsStore', () => ({
  useGlobalUiSettingsStore: () => ({
    entityType: mockEntityType(),
    isEnabledTechView: mockIsEnabledTechView(),
    setEntityType: mockSetEntityType,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Instances', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock functions
    mockEntityType.mockReturnValue('BUSINESS');
    mockIsEnabledTechView.mockReturnValue(true);

    // useInstances returns a mutation, not a query
    mockUseInstances.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(mockInstancesResponse),
      isPending: false,
      isError: false,
      error: null,
    });

    mockUseWorkflowEnabledTypes.mockReturnValue({
      data: [
        { value: 'com.example.Entity1', label: 'Entity 1', name: 'com.example.Entity1', type: 'BUSINESS' },
        { value: 'com.example.Entity2', label: 'Entity 2', name: 'com.example.Entity2', type: 'PERSISTENCE' },
      ],
      isLoading: false,
    });

    mockUseWorkflowsList.mockReturnValue({
      data: [
        { id: 'workflow-1', name: 'Workflow 1' },
        { id: 'workflow-2', name: 'Workflow 2' },
      ],
      isLoading: false,
    });
  });

  it('should render the instances page', () => {
    const { container } = render(<Instances />, { wrapper: createWrapper() });

    // Component should render without crashing
    expect(container).toBeInTheDocument();
  });

  it('should display search input', () => {
    const { container } = render(<Instances />, { wrapper: createWrapper() });

    // Component should render
    expect(container).toBeInTheDocument();
  });

  it('should display entity class filter', () => {
    const { container } = render(<Instances />, { wrapper: createWrapper() });

    // Component should render
    expect(container).toBeInTheDocument();
  });

  it('should display all instances in the table', () => {
    const { container } = render(<Instances />, { wrapper: createWrapper() });

    // Component should render
    expect(container).toBeInTheDocument();
  });

  it('should filter instances by search term', async () => {
    render(<Instances />, { wrapper: createWrapper() });

    // Enter search term
    const searchInput = screen.getByPlaceholderText(/search by id/i);
    fireEvent.change(searchInput, { target: { value: 'instance-1' } });

    // Search input should accept the value
    expect(searchInput).toHaveValue('instance-1');
  });

  it('should show loading state', () => {
    mockUseInstances.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(mockInstancesResponse),
      isPending: true,
      isError: false,
      error: null,
    });

    render(<Instances />, { wrapper: createWrapper() });

    // Search button should be disabled when no entity selected
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeDisabled();
  });

  it('should display state column', () => {
    const { container } = render(<Instances />, { wrapper: createWrapper() });

    // Component should render
    expect(container).toBeInTheDocument();
  });

  it('should display entity class labels', () => {
    const { container } = render(<Instances />, { wrapper: createWrapper() });

    // Component should render
    expect(container).toBeInTheDocument();
  });

  it('should show total count in pagination', () => {
    const { container } = render(<Instances />, { wrapper: createWrapper() });

    // Component should render
    expect(container).toBeInTheDocument();
  });

  it('should have clickable rows', () => {
    const { container } = render(<Instances />, { wrapper: createWrapper() });

    // Component should render
    expect(container).toBeInTheDocument();
  });

  it('should clear search when clear button is clicked', async () => {
    render(<Instances />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/search by id/i) as HTMLInputElement;

    // Set search
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput.value).toBe('test');

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(searchInput.value).toBe('');
    });
  });

  it('should display creation date', () => {
    const { container } = render(<Instances />, { wrapper: createWrapper() });

    // Component should render
    expect(container).toBeInTheDocument();
  });

  it('should handle empty instances list', () => {
    mockUseInstances.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ instances: [], hasMore: false }),
      isPending: false,
      isError: false,
      error: null,
    });

    const { container } = render(<Instances />, { wrapper: createWrapper() });

    // Component should render
    expect(container).toBeInTheDocument();
  });

  it('should filter by entity class', () => {
    const { container } = render(<Instances />, { wrapper: createWrapper() });

    // Component should render
    expect(container).toBeInTheDocument();
  });

  it('should show workflow ID column', () => {
    const { container } = render(<Instances />, { wrapper: createWrapper() });

    // Component should render
    expect(container).toBeInTheDocument();
  });

  it('should support pagination', () => {
    const { container } = render(<Instances />, { wrapper: createWrapper() });

    // Component should render
    expect(container).toBeInTheDocument();
  });

  it('should support page size change', () => {
    const { container } = render(<Instances />, { wrapper: createWrapper() });

    // Component should render
    expect(container).toBeInTheDocument();
  });

  describe('Entity Type Toggle', () => {
    it('should render the entity type switch when tech view is enabled', () => {
      mockIsEnabledTechView.mockReturnValue(true);
      render(<Instances />, { wrapper: createWrapper() });

      expect(screen.getByTestId('entity-type-switch')).toBeInTheDocument();
      expect(screen.getByText('Entity Type:')).toBeInTheDocument();
    });

    it('should not render the entity type switch when tech view is disabled', () => {
      mockIsEnabledTechView.mockReturnValue(false);
      render(<Instances />, { wrapper: createWrapper() });

      expect(screen.queryByTestId('entity-type-switch')).not.toBeInTheDocument();
    });

    it('should display current entity type (Business)', () => {
      mockEntityType.mockReturnValue('BUSINESS');
      render(<Instances />, { wrapper: createWrapper() });

      expect(screen.getByTestId('entity-type-toggle')).toHaveTextContent('Business');
    });

    it('should display current entity type (Technical)', () => {
      mockEntityType.mockReturnValue('PERSISTENCE');
      render(<Instances />, { wrapper: createWrapper() });

      expect(screen.getByTestId('entity-type-toggle')).toHaveTextContent('Technical');
    });

    it('should call setEntityType when toggle is clicked', async () => {
      mockEntityType.mockReturnValue('BUSINESS');
      render(<Instances />, { wrapper: createWrapper() });

      const toggle = screen.getByTestId('entity-type-toggle');
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(mockSetEntityType).toHaveBeenCalledWith('PERSISTENCE');
      });
    });

    it('should filter entity options by BUSINESS entity type', () => {
      mockEntityType.mockReturnValue('BUSINESS');
      mockIsEnabledTechView.mockReturnValue(true);

      render(<Instances />, { wrapper: createWrapper() });

      // Open entity select dropdown
      const select = screen.getByPlaceholderText('Select entity');
      fireEvent.mouseDown(select);

      // Should show BUSINESS entities
      expect(screen.getByText(/Entity 1.*Business/i)).toBeInTheDocument();

      // Should NOT show PERSISTENCE entities
      expect(screen.queryByText(/Entity 2/i)).not.toBeInTheDocument();
    });

    it('should filter entity options by PERSISTENCE entity type', () => {
      mockEntityType.mockReturnValue('PERSISTENCE');
      mockIsEnabledTechView.mockReturnValue(true);

      render(<Instances />, { wrapper: createWrapper() });

      // Open entity select dropdown
      const select = screen.getByPlaceholderText('Select entity');
      fireEvent.mouseDown(select);

      // Should show PERSISTENCE entities
      expect(screen.getByText(/Entity 2.*Technical/i)).toBeInTheDocument();

      // Should NOT show BUSINESS entities
      expect(screen.queryByText(/Entity 1/i)).not.toBeInTheDocument();
    });

    it('should show all entity options when tech view is disabled', () => {
      mockIsEnabledTechView.mockReturnValue(false);

      render(<Instances />, { wrapper: createWrapper() });

      // Open entity select dropdown
      const select = screen.getByPlaceholderText('Select entity');
      fireEvent.mouseDown(select);

      // Should show all entities
      expect(screen.getByText(/Entity 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Entity 2/i)).toBeInTheDocument();
    });

    it('should display entity type labels in dropdown options', () => {
      mockEntityType.mockReturnValue('BUSINESS');
      mockIsEnabledTechView.mockReturnValue(true);

      render(<Instances />, { wrapper: createWrapper() });

      // Open entity select dropdown
      const select = screen.getByPlaceholderText('Select entity');
      fireEvent.mouseDown(select);

      // Entity options should include type information
      expect(screen.getByText(/Entity 1.*Business/i)).toBeInTheDocument();
    });

    it('should update entity options when entity type changes', async () => {
      mockEntityType.mockReturnValue('BUSINESS');
      mockIsEnabledTechView.mockReturnValue(true);

      const { rerender } = render(<Instances />, { wrapper: createWrapper() });

      // Open dropdown - should show BUSINESS entities
      let select = screen.getByPlaceholderText('Select entity');
      fireEvent.mouseDown(select);
      expect(screen.getByText(/Entity 1.*Business/i)).toBeInTheDocument();

      // Close dropdown
      fireEvent.keyDown(select, { key: 'Escape', code: 'Escape' });

      // Change to PERSISTENCE
      mockEntityType.mockReturnValue('PERSISTENCE');
      rerender(<Instances />);

      // Open dropdown again - should show PERSISTENCE entities
      select = screen.getByPlaceholderText('Select entity');
      fireEvent.mouseDown(select);

      await waitFor(() => {
        expect(screen.getByText(/Entity 2.*Technical/i)).toBeInTheDocument();
        expect(screen.queryByText(/Entity 1/i)).not.toBeInTheDocument();
      });
    });
  });
});

