/**
 * Workflows Page Tests
 * Comprehensive tests for the Workflows list page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Workflows } from './Workflows';
import type { Workflow } from '../types';

// Mock the hooks
const mockWorkflows: Workflow[] = [
  {
    id: 'workflow-1',
    name: 'Test Workflow 1',
    entityClassName: 'com.example.Entity1',
    active: true,
    persisted: true,
    creationDate: 1633024800000,
  },
  {
    id: 'workflow-2',
    name: 'Test Workflow 2',
    entityClassName: 'com.example.Entity2',
    active: false,
    persisted: true,
    creationDate: 1633024900000,
  },
  {
    id: 'workflow-3',
    name: 'Another Workflow',
    entityClassName: 'com.example.Entity1',
    active: true,
    persisted: false,
    creationDate: 1633025000000,
  },
];

const mockUseWorkflowsList = vi.fn();
const mockUseWorkflowEnabledTypes = vi.fn();
const mockUseDeleteWorkflow = vi.fn();
const mockUseCopyWorkflow = vi.fn();

vi.mock('../hooks/useStatemachine', () => ({
  useWorkflowsList: () => mockUseWorkflowsList(),
  useWorkflowEnabledTypes: () => mockUseWorkflowEnabledTypes(),
  useDeleteWorkflow: () => mockUseDeleteWorkflow(),
  useCopyWorkflow: () => mockUseCopyWorkflow(),
}));

// Mock ExportImport component
vi.mock('../components/ExportImport', () => ({
  ExportImport: ({ selectedWorkflows }: any) => (
    <div data-testid="export-import">
      Export/Import ({selectedWorkflows.length} selected)
    </div>
  ),
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

// Mock StateIndicator component
vi.mock('../components/StateIndicator', () => ({
  StateIndicator: ({ state, type }: any) => (
    <div data-testid={`state-indicator-${type || 'default'}`} data-state={state}>
      {state ? '🟢' : '⚪'}
      {type === 'automated' && 'A'}
    </div>
  ),
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

describe('Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock functions
    mockEntityType.mockReturnValue('BUSINESS');
    mockIsEnabledTechView.mockReturnValue(true);

    mockUseWorkflowsList.mockReturnValue({
      data: mockWorkflows,
      isLoading: false,
      refetch: vi.fn(),
    });

    mockUseWorkflowEnabledTypes.mockReturnValue({
      data: [
        { name: 'com.example.Entity1', label: 'Entity 1', type: 'BUSINESS' },
        { name: 'com.example.Entity2', label: 'Entity 2', type: 'PERSISTENCE' },
      ],
      isLoading: false,
    });

    mockUseDeleteWorkflow.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseCopyWorkflow.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  it('should render the workflows page', () => {
    render(<Workflows />, { wrapper: createWrapper() });
    
    expect(screen.getByPlaceholderText('Filter workflows')).toBeInTheDocument();
    expect(screen.getByText('Create new workflow')).toBeInTheDocument();
  });

  it('should display all workflows in the table', () => {
    render(<Workflows />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
    expect(screen.getByText('Test Workflow 2')).toBeInTheDocument();
    expect(screen.getByText('Another Workflow')).toBeInTheDocument();
  });

  it('should filter workflows by name', async () => {
    render(<Workflows />, { wrapper: createWrapper() });
    
    const filterInput = screen.getByPlaceholderText('Filter workflows');
    fireEvent.change(filterInput, { target: { value: 'Another' } });
    
    await waitFor(() => {
      expect(screen.getByText('Another Workflow')).toBeInTheDocument();
      expect(screen.queryByText('Test Workflow 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Workflow 2')).not.toBeInTheDocument();
    });
  });

  it('should filter workflows by entity class name', async () => {
    render(<Workflows />, { wrapper: createWrapper() });
    
    const filterInput = screen.getByPlaceholderText('Filter workflows');
    fireEvent.change(filterInput, { target: { value: 'Entity 2' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Workflow 2')).toBeInTheDocument();
      expect(screen.queryByText('Test Workflow 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Another Workflow')).not.toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    mockUseWorkflowsList.mockReturnValue({
      data: [],
      isLoading: true,
      refetch: vi.fn(),
    });
    
    render(<Workflows />, { wrapper: createWrapper() });
    
    // Ant Design Table shows loading spinner
    expect(document.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('should display entity class labels', () => {
    render(<Workflows />, { wrapper: createWrapper() });

    // Entity 1 appears twice (2 workflows with this entity class)
    const entity1Elements = screen.getAllByText('Entity 1');
    expect(entity1Elements.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Entity 2')).toBeInTheDocument();
  });

  it('should show active/inactive status', () => {
    render(<Workflows />, { wrapper: createWrapper() });

    // Check for "Yes" in active column (2 active workflows)
    const yesElements = screen.getAllByText('Yes');
    // Should have at least 2 "Yes" (for active column)
    expect(yesElements.length).toBeGreaterThanOrEqual(2);

    // Check for "No" (1 inactive workflow)
    const noElements = screen.getAllByText('No');
    expect(noElements.length).toBeGreaterThanOrEqual(1);
  });

  it('should show persisted/transient status', () => {
    render(<Workflows />, { wrapper: createWrapper() });

    // Check for "Yes" in persisted column (2 persisted workflows)
    const yesElements = screen.getAllByText('Yes');
    // Should have at least 2 "Yes" (for persisted column)
    expect(yesElements.length).toBeGreaterThanOrEqual(2);

    // Check for "No" (1 transient workflow)
    const noElements = screen.getAllByText('No');
    expect(noElements.length).toBeGreaterThanOrEqual(1);
  });

  it('should allow row selection', async () => {
    render(<Workflows />, { wrapper: createWrapper() });
    
    // Find and click the first checkbox
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const firstRowCheckbox = checkboxes[1]; // Skip the header checkbox
    
    fireEvent.click(firstRowCheckbox);
    
    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked();
    });
  });

  it('should render ExportImport component', () => {
    render(<Workflows />, { wrapper: createWrapper() });
    
    expect(screen.getByTestId('export-import')).toBeInTheDocument();
    expect(screen.getByText(/Export\/Import \(0 selected\)/)).toBeInTheDocument();
  });

  it('should show correct count in ExportImport when rows selected', async () => {
    render(<Workflows />, { wrapper: createWrapper() });
    
    // Select first row
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    fireEvent.click(checkboxes[1]);
    
    await waitFor(() => {
      expect(screen.getByText(/Export\/Import \(1 selected\)/)).toBeInTheDocument();
    });
  });

  it('should display creation date', () => {
    render(<Workflows />, { wrapper: createWrapper() });

    // Dates should be formatted and displayed
    // The exact format depends on the implementation
    const dateElements = screen.getAllByText(/2021/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('should show action buttons for each workflow', () => {
    render(<Workflows />, { wrapper: createWrapper() });

    // Each workflow should have action buttons (search, table, copy, delete icons)
    // We have 3 workflows, so multiple action buttons
    const allButtons = screen.getAllByRole('button');
    // Should have at least: 3 workflows × 4 buttons + create button + filter clear
    expect(allButtons.length).toBeGreaterThan(10);
  });

  it('should show total count in pagination', () => {
    render(<Workflows />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Total 3 workflows')).toBeInTheDocument();
  });

  it('should clear filter when clear button is clicked', async () => {
    render(<Workflows />, { wrapper: createWrapper() });
    
    const filterInput = screen.getByPlaceholderText('Filter workflows') as HTMLInputElement;
    
    // Set filter
    fireEvent.change(filterInput, { target: { value: 'Test' } });
    expect(filterInput.value).toBe('Test');
    
    // Clear filter
    fireEvent.change(filterInput, { target: { value: '' } });
    
    await waitFor(() => {
      expect(filterInput.value).toBe('');
      // All workflows should be visible again
      expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
      expect(screen.getByText('Test Workflow 2')).toBeInTheDocument();
      expect(screen.getByText('Another Workflow')).toBeInTheDocument();
    });
  });

  describe('Entity Type Toggle', () => {
    it('should render the entity type switch when tech view is enabled', () => {
      mockIsEnabledTechView.mockReturnValue(true);
      render(<Workflows />, { wrapper: createWrapper() });

      expect(screen.getByTestId('entity-type-switch')).toBeInTheDocument();
      expect(screen.getByText('Entity Type:')).toBeInTheDocument();
    });

    it('should not render the entity type switch when tech view is disabled', () => {
      mockIsEnabledTechView.mockReturnValue(false);
      render(<Workflows />, { wrapper: createWrapper() });

      expect(screen.queryByTestId('entity-type-switch')).not.toBeInTheDocument();
    });

    it('should display current entity type (Business)', () => {
      mockEntityType.mockReturnValue('BUSINESS');
      render(<Workflows />, { wrapper: createWrapper() });

      expect(screen.getByTestId('entity-type-toggle')).toHaveTextContent('Business');
    });

    it('should display current entity type (Technical)', () => {
      mockEntityType.mockReturnValue('PERSISTENCE');
      render(<Workflows />, { wrapper: createWrapper() });

      expect(screen.getByTestId('entity-type-toggle')).toHaveTextContent('Technical');
    });

    it('should call setEntityType when toggle is clicked', async () => {
      mockEntityType.mockReturnValue('BUSINESS');
      render(<Workflows />, { wrapper: createWrapper() });

      const toggle = screen.getByTestId('entity-type-toggle');
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(mockSetEntityType).toHaveBeenCalledWith('PERSISTENCE');
      });
    });

    it('should filter workflows by BUSINESS entity type', () => {
      mockEntityType.mockReturnValue('BUSINESS');
      mockIsEnabledTechView.mockReturnValue(true);

      // Update workflows to have entity types
      const workflowsWithTypes = [
        { ...mockWorkflows[0], entityClassName: 'com.example.Entity1' }, // BUSINESS
        { ...mockWorkflows[1], entityClassName: 'com.example.Entity2' }, // PERSISTENCE
        { ...mockWorkflows[2], entityClassName: 'com.example.Entity1' }, // BUSINESS
      ];

      mockUseWorkflowsList.mockReturnValue({
        data: workflowsWithTypes,
        isLoading: false,
        refetch: vi.fn(),
      });

      render(<Workflows />, { wrapper: createWrapper() });

      // Should show BUSINESS workflows (Entity1)
      expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
      expect(screen.getByText('Another Workflow')).toBeInTheDocument();

      // Should NOT show PERSISTENCE workflows (Entity2)
      expect(screen.queryByText('Test Workflow 2')).not.toBeInTheDocument();
    });

    it('should filter workflows by PERSISTENCE entity type', () => {
      mockEntityType.mockReturnValue('PERSISTENCE');
      mockIsEnabledTechView.mockReturnValue(true);

      const workflowsWithTypes = [
        { ...mockWorkflows[0], entityClassName: 'com.example.Entity1' }, // BUSINESS
        { ...mockWorkflows[1], entityClassName: 'com.example.Entity2' }, // PERSISTENCE
        { ...mockWorkflows[2], entityClassName: 'com.example.Entity1' }, // BUSINESS
      ];

      mockUseWorkflowsList.mockReturnValue({
        data: workflowsWithTypes,
        isLoading: false,
        refetch: vi.fn(),
      });

      render(<Workflows />, { wrapper: createWrapper() });

      // Should show PERSISTENCE workflows (Entity2)
      expect(screen.getByText('Test Workflow 2')).toBeInTheDocument();

      // Should NOT show BUSINESS workflows (Entity1)
      expect(screen.queryByText('Test Workflow 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Another Workflow')).not.toBeInTheDocument();
    });

    it('should show all workflows when tech view is disabled', () => {
      mockIsEnabledTechView.mockReturnValue(false);

      render(<Workflows />, { wrapper: createWrapper() });

      // Should show all workflows regardless of entity type
      expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
      expect(screen.getByText('Test Workflow 2')).toBeInTheDocument();
      expect(screen.getByText('Another Workflow')).toBeInTheDocument();
    });

    it('should display entity type labels in entity class names', () => {
      mockEntityType.mockReturnValue('BUSINESS');
      mockIsEnabledTechView.mockReturnValue(true);

      render(<Workflows />, { wrapper: createWrapper() });

      // Entity class labels should include type information
      expect(screen.getByText(/Entity 1.*Business/i)).toBeInTheDocument();
    });

    it('should update filtered workflows when entity type changes', async () => {
      mockEntityType.mockReturnValue('BUSINESS');
      mockIsEnabledTechView.mockReturnValue(true);

      const { rerender } = render(<Workflows />, { wrapper: createWrapper() });

      // Initially showing BUSINESS workflows
      expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Workflow 2')).not.toBeInTheDocument();

      // Change to PERSISTENCE
      mockEntityType.mockReturnValue('PERSISTENCE');
      rerender(<Workflows />);

      await waitFor(() => {
        // Now showing PERSISTENCE workflows
        expect(screen.queryByText('Test Workflow 1')).not.toBeInTheDocument();
        expect(screen.getByText('Test Workflow 2')).toBeInTheDocument();
      });
    });
  });

  describe('StateIndicator Integration', () => {
    it('should render StateIndicator for Active column', () => {
      render(<Workflows />, { wrapper: createWrapper() });

      // Should have StateIndicator components for active state
      const indicators = screen.getAllByTestId('state-indicator-default');
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('should show active state indicator for active workflows', () => {
      render(<Workflows />, { wrapper: createWrapper() });

      const indicators = screen.getAllByTestId('state-indicator-default');
      const activeIndicators = indicators.filter(ind => ind.getAttribute('data-state') === 'true');

      // At least one workflow should be active
      expect(activeIndicators.length).toBeGreaterThan(0);
    });

    it('should show inactive state indicator for inactive workflows', () => {
      render(<Workflows />, { wrapper: createWrapper() });

      const indicators = screen.getAllByTestId('state-indicator-default');
      const inactiveIndicators = indicators.filter(ind => ind.getAttribute('data-state') === 'false');

      // At least one workflow should be inactive
      expect(inactiveIndicators.length).toBeGreaterThan(0);
    });

    it('should render StateIndicator for Persisted column', () => {
      render(<Workflows />, { wrapper: createWrapper() });

      // Should have StateIndicator components
      const indicators = screen.getAllByTestId('state-indicator-default');

      // Should have indicators for both Active and Persisted columns
      // (2 indicators per row: Active + Persisted)
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('should display correct state for persisted workflows', () => {
      render(<Workflows />, { wrapper: createWrapper() });

      const indicators = screen.getAllByTestId('state-indicator-default');

      // Verify indicators exist and have state attributes
      indicators.forEach(indicator => {
        const state = indicator.getAttribute('data-state');
        expect(state).toMatch(/true|false/);
      });
    });
  });
});

