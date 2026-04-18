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
    entityClassName: 'travel.1001',
    active: true,
    persisted: true,
    creationDate: 1633024800000,
  },
  {
    id: 'workflow-2',
    name: 'Test Workflow 2',
    entityClassName: 'com.cyoda.tdb.model.EntityModel',
    active: false,
    persisted: true,
    creationDate: 1633024900000,
  },
  {
    id: 'workflow-3',
    name: 'Another Workflow',
    entityClassName: 'travel.1001',
    active: true,
    persisted: false,
    creationDate: 1633025000000,
  },
];

const mockUseWorkflowsList = vi.fn();
const mockUseWorkflowEnabledTypes = vi.fn();
const mockUseDeleteWorkflow = vi.fn();
const mockUseCopyWorkflow = vi.fn();
const mockGetAllWorkflowsList = vi.fn();

vi.mock('../hooks/useStatemachine', async () => {
  const actual = await vi.importActual<any>('../hooks/useStatemachine');
  return {
    ...actual,
    // useWorkflowsList kept for any other tests that import it; the page no longer calls it.
    useWorkflowsList: () => mockUseWorkflowsList(),
    useWorkflowEnabledTypes: () => mockUseWorkflowEnabledTypes(),
    useDeleteWorkflow: () => mockUseDeleteWorkflow(),
    useCopyWorkflow: () => mockUseCopyWorkflow(),
  };
});

vi.mock('../stores/statemachineStore', () => ({
  useStatemachineStore: {
    getState: () => ({
      getAllWorkflowsList: mockGetAllWorkflowsList,
    }),
  },
}));

// Mock ExportImport component
vi.mock('../components/ExportImport', () => ({
  ExportImport: ({ selectedWorkflows }: any) => (
    <div data-testid="export-import">
      Export/Import ({selectedWorkflows.length} selected)
    </div>
  ),
}));

// Mock EntityTypeSwitch component and other ui-lib-react exports
vi.mock('@cyoda/ui-lib-react', async () => {
  const actual = await vi.importActual('@cyoda/ui-lib-react');
  return {
    ...actual,
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
  };
});

// Mock global UI settings store
const mockSetEntityType = vi.fn();
const mockEntityTypeValue = 'BUSINESS';
const mockEntityType = vi.fn(() => mockEntityTypeValue);

vi.mock('@cyoda/http-api-react', async () => {
  const actual = await vi.importActual('@cyoda/http-api-react');
  return {
    ...actual,
    useGlobalUiSettingsStore: () => ({
      get entityType() {
        return mockEntityType();
      },
      setEntityType: mockSetEntityType,
    }),
  };
});

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

    mockUseWorkflowsList.mockReturnValue({
      data: mockWorkflows,
      isLoading: false,
      refetch: vi.fn(),
    });

    mockGetAllWorkflowsList.mockResolvedValue({ data: mockWorkflows });

    mockUseWorkflowEnabledTypes.mockReturnValue({
      data: [
        { name: 'travel.1001', label: 'Travel', type: 'BUSINESS' },
        { name: 'com.cyoda.tdb.model.EntityModel', label: 'EntityModel', type: 'PERSISTENCE' },
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

  it('should display all workflows in the table', async () => {
    render(<Workflows />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
    });
    // Test Workflow 2 is filtered out because it's PERSISTENCE type and entityType is BUSINESS
    expect(screen.queryByText('Test Workflow 2')).not.toBeInTheDocument();
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
    // This test filters by text "travel" which matches the entity class name
    // travel is BUSINESS type, so it will be visible with default entityType
    render(<Workflows />, { wrapper: createWrapper() });

    const filterInput = screen.getByPlaceholderText('Filter workflows');
    fireEvent.change(filterInput, { target: { value: 'travel' } });

    await waitFor(() => {
      // Both workflows with travel should be visible
      expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
      expect(screen.getByText('Another Workflow')).toBeInTheDocument();
      // Workflow with Entity2 should not be visible
      expect(screen.queryByText('Test Workflow 2')).not.toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    mockUseWorkflowsList.mockReturnValue({
      data: [],
      isLoading: true,
      refetch: vi.fn(),
    });
    // Leave the store query unresolved to keep React Query in loading state.
    mockGetAllWorkflowsList.mockReturnValue(new Promise(() => {}));

    render(<Workflows />, { wrapper: createWrapper() });

    // Ant Design Table shows loading spinner
    expect(document.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('should display entity class labels', async () => {
    render(<Workflows />, { wrapper: createWrapper() });

    // Entity 1 appears twice (2 workflows with this entity class) without type label
    await waitFor(() => {
      const entity1Elements = screen.getAllByText('travel');
      expect(entity1Elements.length).toBeGreaterThanOrEqual(1);
    });

    // Entity 2 is PERSISTENCE type, so it's filtered out when entityType is BUSINESS
    expect(screen.queryByText(/Entity2/i)).not.toBeInTheDocument();
  });

  it('should show active/inactive status', async () => {
    render(<Workflows />, { wrapper: createWrapper() });

    // Wait for table to render
    await waitFor(() => {
      expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
    });

    // Only 2 BUSINESS workflows are shown (Entity1)
    // StateIndicator is mocked with data-testid="state-indicator-default"
    const stateIndicators = screen.getAllByTestId('state-indicator-default');
    // Should have at least 4 indicators (2 rows × 2 columns: Active and Persisted)
    expect(stateIndicators.length).toBeGreaterThanOrEqual(4);

    // Check that we have both active (true) and inactive (false) states
    const activeIndicators = stateIndicators.filter(el => el.getAttribute('data-state') === 'true');
    const inactiveIndicators = stateIndicators.filter(el => el.getAttribute('data-state') === 'false');
    expect(activeIndicators.length).toBeGreaterThanOrEqual(1);
    expect(inactiveIndicators.length).toBeGreaterThanOrEqual(1);
  });

  it('should show persisted/transient status', async () => {
    render(<Workflows />, { wrapper: createWrapper() });

    // Wait for table to render
    await waitFor(() => {
      expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
    });

    // Only 2 BUSINESS workflows are shown (Entity1)
    // StateIndicator is mocked with data-testid="state-indicator-default"
    const stateIndicators = screen.getAllByTestId('state-indicator-default');
    // Should have at least 4 indicators (2 rows × 2 columns: Active and Persisted)
    expect(stateIndicators.length).toBeGreaterThanOrEqual(4);

    // Check that we have both persisted (true) and transient (false) states
    const persistedIndicators = stateIndicators.filter(el => el.getAttribute('data-state') === 'true');
    const transientIndicators = stateIndicators.filter(el => el.getAttribute('data-state') === 'false');
    expect(persistedIndicators.length).toBeGreaterThanOrEqual(1);
    expect(transientIndicators.length).toBeGreaterThanOrEqual(1);
  });

  it('should allow row selection', async () => {
    render(<Workflows />, { wrapper: createWrapper() });

    // Wait for the table data to render before selecting a row.
    await waitFor(() => {
      expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
    });

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

    // Wait for the table data to render before selecting a row.
    await waitFor(() => {
      expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
    });

    // Select first row
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    fireEvent.click(checkboxes[1]);

    await waitFor(() => {
      expect(screen.getByText(/Export\/Import \(1 selected\)/)).toBeInTheDocument();
    });
  });

  it('should display creation date', async () => {
    render(<Workflows />, { wrapper: createWrapper() });

    // Dates should be formatted and displayed
    // The exact format depends on the implementation
    await waitFor(() => {
      const dateElements = screen.getAllByText(/2021/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it('should show action buttons for each workflow', async () => {
    render(<Workflows />, { wrapper: createWrapper() });

    // Each workflow should have action buttons (search, table, copy, delete icons)
    // We have 3 workflows, so multiple action buttons
    await waitFor(() => {
      const allButtons = screen.getAllByRole('button');
      // Should have at least: 3 workflows × 4 buttons + create button + filter clear
      expect(allButtons.length).toBeGreaterThan(10);
    });
  });

  it('should show total count in pagination', async () => {
    render(<Workflows />, { wrapper: createWrapper() });

    // Only 2 BUSINESS workflows are shown (Entity1 workflows)
    await waitFor(() => {
      expect(screen.getByText('Total 2 workflows')).toBeInTheDocument();
    });
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
      // Only BUSINESS workflows should be visible (entity type filter still applies)
      expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Workflow 2')).not.toBeInTheDocument(); // PERSISTENCE type
      expect(screen.getByText('Another Workflow')).toBeInTheDocument();
    });
  });

  describe('Entity Type Filtering', () => {
    // Note: Entity type toggle is now in the global header (AppHeader), not on the Workflows page
    // These tests verify that the Workflows page correctly filters based on the global entityType setting

    it('should display Business Entity column header when entityType is BUSINESS', () => {
      mockEntityType.mockReturnValue('BUSINESS');
      render(<Workflows />, { wrapper: createWrapper() });
      expect(screen.getByText('Business Entity')).toBeInTheDocument();
    });

    it('should display Technical Entity column header when entityType is PERSISTENCE', () => {
      mockEntityType.mockReturnValue('PERSISTENCE');
      render(<Workflows />, { wrapper: createWrapper() });
      expect(screen.getByText('Technical Entity')).toBeInTheDocument();
    });

it('should display Version column when entityType is BUSINESS', () => {
  mockEntityType.mockReturnValue('BUSINESS');
  render(<Workflows />, { wrapper: createWrapper() });
  expect(screen.getByText('Version')).toBeInTheDocument();
});

it('should NOT display Version column when entityType is PERSISTENCE', () => {
  mockEntityType.mockReturnValue('PERSISTENCE');
  render(<Workflows />, { wrapper: createWrapper() });
  expect(screen.queryByText('Version')).not.toBeInTheDocument();
});

it('should display version value for Business entities', async () => {
  mockEntityType.mockReturnValue('BUSINESS');
  render(<Workflows />, { wrapper: createWrapper() });
  // Version is extracted from entityClassName (e.g., travel.1001 -> 1001)
  await waitFor(() => {
    const versionElements = screen.getAllByText('1001');
    expect(versionElements.length).toBeGreaterThanOrEqual(1);
  });
});

    it('should filter workflows by BUSINESS entity type', async () => {
      mockEntityType.mockReturnValue('BUSINESS');

      // Update workflows to have entity types
      const workflowsWithTypes = [
        { ...mockWorkflows[0], entityClassName: 'travel.1001' }, // BUSINESS
        { ...mockWorkflows[1], entityClassName: 'com.cyoda.tdb.model.EntityModel' }, // PERSISTENCE
        { ...mockWorkflows[2], entityClassName: 'travel.1001' }, // BUSINESS
      ];

      mockUseWorkflowsList.mockReturnValue({
        data: workflowsWithTypes,
        isLoading: false,
        refetch: vi.fn(),
      });
      mockGetAllWorkflowsList.mockResolvedValue({ data: workflowsWithTypes });

      render(<Workflows />, { wrapper: createWrapper() });

      // Should show BUSINESS workflows (Entity1)
      await waitFor(() => {
        expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
      });
      expect(screen.getByText('Another Workflow')).toBeInTheDocument();

      // Should NOT show PERSISTENCE workflows (Entity2)
      expect(screen.queryByText('Test Workflow 2')).not.toBeInTheDocument();
    });

    it('should filter workflows by PERSISTENCE entity type', async () => {
      mockEntityType.mockReturnValue('PERSISTENCE');

      const workflowsWithTypes = [
        { ...mockWorkflows[0], entityClassName: 'travel.1001' }, // BUSINESS
        { ...mockWorkflows[1], entityClassName: 'com.cyoda.tdb.model.EntityModel' }, // PERSISTENCE
        { ...mockWorkflows[2], entityClassName: 'travel.1001' }, // BUSINESS
      ];

      mockUseWorkflowsList.mockReturnValue({
        data: workflowsWithTypes,
        isLoading: false,
        refetch: vi.fn(),
      });
      mockGetAllWorkflowsList.mockResolvedValue({ data: workflowsWithTypes });

      render(<Workflows />, { wrapper: createWrapper() });

      // Should show PERSISTENCE workflows (Entity2)
      await waitFor(() => {
        expect(screen.getByText('Test Workflow 2')).toBeInTheDocument();
      });

      // Should NOT show BUSINESS workflows (Entity1)
      expect(screen.queryByText('Test Workflow 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Another Workflow')).not.toBeInTheDocument();
    });

    it('should display entity class names without type suffix', async () => {
      mockEntityType.mockReturnValue('BUSINESS');

      render(<Workflows />, { wrapper: createWrapper() });

      // Entity class labels should NOT include type information (type is shown in column header)
      // Use getAllByText because Entity1 appears multiple times in the table
      await waitFor(() => {
        const entity1Elements = screen.getAllByText('travel');
        expect(entity1Elements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should update filtered workflows when entity type changes', async () => {
      mockEntityType.mockReturnValue('BUSINESS');

      const { rerender } = render(<Workflows />, { wrapper: createWrapper() });

      // Initially showing BUSINESS workflows
      await waitFor(() => {
        expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
      });
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
    it('should render StateIndicator for Active column', async () => {
      render(<Workflows />, { wrapper: createWrapper() });

      // Should have StateIndicator components for active state
      await waitFor(() => {
        const indicators = screen.getAllByTestId('state-indicator-default');
        expect(indicators.length).toBeGreaterThan(0);
      });
    });

    it('should show active state indicator for active workflows', async () => {
      render(<Workflows />, { wrapper: createWrapper() });

      await waitFor(() => {
        const indicators = screen.getAllByTestId('state-indicator-default');
        const activeIndicators = indicators.filter(ind => ind.getAttribute('data-state') === 'true');

        // At least one workflow should be active
        expect(activeIndicators.length).toBeGreaterThan(0);
      });
    });

    it('should show inactive state indicator for inactive workflows', async () => {
      render(<Workflows />, { wrapper: createWrapper() });

      await waitFor(() => {
        const indicators = screen.getAllByTestId('state-indicator-default');
        const inactiveIndicators = indicators.filter(ind => ind.getAttribute('data-state') === 'false');

        // At least one workflow should be inactive
        expect(inactiveIndicators.length).toBeGreaterThan(0);
      });
    });

    it('should render StateIndicator for Persisted column', async () => {
      render(<Workflows />, { wrapper: createWrapper() });

      // Should have StateIndicator components
      await waitFor(() => {
        const indicators = screen.getAllByTestId('state-indicator-default');

        // Should have indicators for both Active and Persisted columns
        // (2 indicators per row: Active + Persisted)
        expect(indicators.length).toBeGreaterThan(0);
      });
    });

    it('should display correct state for persisted workflows', async () => {
      render(<Workflows />, { wrapper: createWrapper() });

      await waitFor(() => {
        const indicators = screen.getAllByTestId('state-indicator-default');
        expect(indicators.length).toBeGreaterThan(0);
      });

      const indicators = screen.getAllByTestId('state-indicator-default');

      // Verify indicators exist and have state attributes
      indicators.forEach(indicator => {
        const state = indicator.getAttribute('data-state');
        expect(state).toMatch(/true|false/);
      });
    });
  });

  describe('Feature Flag Integration - Entity Type Info', () => {
    describe('When feature flag is enabled (returns objects with type field)', () => {
      beforeEach(() => {
        // Mock returns objects with type field
        mockUseWorkflowEnabledTypes.mockReturnValue({
          data: [
            { name: 'travel.1001', label: 'Travel', type: 'BUSINESS' },
            { name: 'com.cyoda.tdb.model.EntityModel', label: 'EntityModel', type: 'PERSISTENCE' },
          ],
          isLoading: false,
        });
      });

      it('should display entity names without type suffix', async () => {
        mockEntityType.mockReturnValue('BUSINESS');

        const workflowsWithTypes = [
          { ...mockWorkflows[0], entityClassName: 'travel.1001' },
        ];

        mockUseWorkflowsList.mockReturnValue({
          data: workflowsWithTypes,
          isLoading: false,
          refetch: vi.fn(),
        });
        mockGetAllWorkflowsList.mockResolvedValue({ data: workflowsWithTypes });

        render(<Workflows />, { wrapper: createWrapper() });

        // Should show entity name without type label (type is shown in column header)
        await waitFor(() => {
          expect(screen.getByText('travel')).toBeInTheDocument();
        });
      });

      it('should filter workflows by BUSINESS type', async () => {
        mockEntityType.mockReturnValue('BUSINESS');

        const workflowsWithTypes = [
          { ...mockWorkflows[0], entityClassName: 'travel.1001' }, // BUSINESS
          { ...mockWorkflows[1], entityClassName: 'com.cyoda.tdb.model.EntityModel' }, // PERSISTENCE
        ];

        mockUseWorkflowsList.mockReturnValue({
          data: workflowsWithTypes,
          isLoading: false,
          refetch: vi.fn(),
        });
        mockGetAllWorkflowsList.mockResolvedValue({ data: workflowsWithTypes });

        render(<Workflows />, { wrapper: createWrapper() });

        // Should only show BUSINESS workflows
        await waitFor(() => {
          expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
        });
        expect(screen.queryByText('Test Workflow 2')).not.toBeInTheDocument();
      });

      it('should filter workflows by PERSISTENCE type', async () => {
        mockEntityType.mockReturnValue('PERSISTENCE');

        const workflowsWithTypes = [
          { ...mockWorkflows[0], entityClassName: 'travel.1001' }, // BUSINESS
          { ...mockWorkflows[1], entityClassName: 'com.cyoda.tdb.model.EntityModel' }, // PERSISTENCE
        ];

        mockUseWorkflowsList.mockReturnValue({
          data: workflowsWithTypes,
          isLoading: false,
          refetch: vi.fn(),
        });
        mockGetAllWorkflowsList.mockResolvedValue({ data: workflowsWithTypes });

        render(<Workflows />, { wrapper: createWrapper() });

        // Should only show PERSISTENCE workflows
        await waitFor(() => {
          expect(screen.getByText('Test Workflow 2')).toBeInTheDocument();
        });
        expect(screen.queryByText('Test Workflow 1')).not.toBeInTheDocument();
      });

      it('should handle workflows with unknown entity types', async () => {
        mockEntityType.mockReturnValue('BUSINESS');

        const workflowsWithTypes = [
          { ...mockWorkflows[0], entityClassName: 'travel.1001' }, // BUSINESS
          { ...mockWorkflows[1], entityClassName: 'com.cyoda.tdb.model.UnknownEntity' }, // Not in enabled types
        ];

        mockUseWorkflowsList.mockReturnValue({
          data: workflowsWithTypes,
          isLoading: false,
          refetch: vi.fn(),
        });
        mockGetAllWorkflowsList.mockResolvedValue({ data: workflowsWithTypes });

        render(<Workflows />, { wrapper: createWrapper() });

        // Should show BUSINESS workflow
        await waitFor(() => {
          expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
        });
        // Unknown entity type should also show (no type = no filter)
        expect(screen.getByText('Test Workflow 2')).toBeInTheDocument();
      });
    });

    describe('When feature flag is disabled (returns array of strings)', () => {
      beforeEach(() => {
        // Mock returns array of strings (no type field)
        mockUseWorkflowEnabledTypes.mockReturnValue({
          data: ['travel.1001', 'com.cyoda.tdb.model.EntityModel'],
          isLoading: false,
        });
      });

      it('should display entity names without type suffix', async () => {
        const workflowsWithTypes = [
          { ...mockWorkflows[0], entityClassName: 'travel.1001' },
          { ...mockWorkflows[2], entityClassName: 'travel.1001' },
        ];

        mockUseWorkflowsList.mockReturnValue({
          data: workflowsWithTypes,
          isLoading: false,
          refetch: vi.fn(),
        });
        mockGetAllWorkflowsList.mockResolvedValue({ data: workflowsWithTypes });

        render(<Workflows />, { wrapper: createWrapper() });

        // Should show entity name without type label (appears twice)
        await waitFor(() => {
          const entity1Elements = screen.getAllByText('travel.1001');
          expect(entity1Elements.length).toBeGreaterThanOrEqual(1);
        });
        expect(screen.queryByText(/travel.1001.*Business/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Entity1.*Technical/i)).not.toBeInTheDocument();
      });

      it('should show all workflows regardless of entity type filter', async () => {
        mockEntityType.mockReturnValue('BUSINESS');

        const workflowsWithTypes = [
          { ...mockWorkflows[0], entityClassName: 'travel.1001' },
          { ...mockWorkflows[1], entityClassName: 'com.cyoda.tdb.model.EntityModel' },
        ];

        mockUseWorkflowsList.mockReturnValue({
          data: workflowsWithTypes,
          isLoading: false,
          refetch: vi.fn(),
        });
        mockGetAllWorkflowsList.mockResolvedValue({ data: workflowsWithTypes });

        render(<Workflows />, { wrapper: createWrapper() });

        // Should show all workflows (no filtering when feature flag is disabled)
        await waitFor(() => {
          expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
        });
        expect(screen.getByText('Test Workflow 2')).toBeInTheDocument();
      });
    });

    describe('When workflowEnabledTypes is empty', () => {
      beforeEach(() => {
        mockUseWorkflowEnabledTypes.mockReturnValue({
          data: [],
          isLoading: false,
        });
      });

      it('should show all workflows without filtering', async () => {
        render(<Workflows />, { wrapper: createWrapper() });

        // Should show all workflows
        await waitFor(() => {
          expect(screen.getByText('Test Workflow 1')).toBeInTheDocument();
        });
        expect(screen.getByText('Test Workflow 2')).toBeInTheDocument();
        expect(screen.getByText('Another Workflow')).toBeInTheDocument();
      });

      it('should display entity names without type suffix', async () => {
        render(<Workflows />, { wrapper: createWrapper() });

        // Should show short class names without type labels (appears multiple times)
        await waitFor(() => {
          const entity1Elements = screen.getAllByText('travel.1001');
          expect(entity1Elements.length).toBeGreaterThanOrEqual(1);
        });
        expect(screen.queryByText(/travel.1001.*Business/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Cloud-vs-legacy branching by isCloudBusinessActive', () => {
    afterEach(() => {
      // Restore default for sibling tests — clear cloud flag so the legacy
      // branch is taken everywhere else.
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_CLOUD;
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;
    });

    it('renders the cloud Workflows page when cyoda-cloud is on AND entityType is BUSINESS', async () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_CLOUD = true as any;
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;
      mockEntityType.mockReturnValue('BUSINESS');

      const { container } = render(<Workflows />, { wrapper: createWrapper() });

      // The cloud page renders the model picker (combobox role); the legacy
      // table renders a "Filter workflows" Input with placeholder. The cloud
      // page does NOT render that placeholder. Use that as the cloud-mode
      // signal: legacy header is absent.
      expect(container.querySelector('input[placeholder="Filter workflows"]')).toBeNull();
    });

    it('renders the legacy table when cyoda-cloud is on but entityType is PERSISTENCE', async () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_CLOUD = true as any;
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;
      mockEntityType.mockReturnValue('PERSISTENCE');

      mockGetAllWorkflowsList.mockResolvedValue({ data: [] });

      const { container } = render(<Workflows />, { wrapper: createWrapper() });

      // The legacy "Filter workflows" Input must be present — confirms we
      // fell through to the legacy code path.
      expect(container.querySelector('input[placeholder="Filter workflows"]')).not.toBeNull();
    });

    it('toggles between cloud and legacy without violating the Rules of Hooks', async () => {
      // Regression test for a "Rendered more hooks than during the previous
      // render" crash that fired when Workflows had an early `return
      // <WorkflowsCloud />` ahead of the legacy hooks. Toggling entityType in
      // a single component instance changed the hook count between renders.
      // The fix routes between two sibling components so each owns its own
      // hook list.
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_CLOUD = true as any;
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;
      mockEntityType.mockReturnValue('BUSINESS');
      mockGetAllWorkflowsList.mockResolvedValue({ data: [] });

      const { container, rerender } = render(<Workflows />, { wrapper: createWrapper() });

      // Cloud branch first.
      expect(container.querySelector('input[placeholder="Filter workflows"]')).toBeNull();

      // Toggle to PERSISTENCE → legacy. Must not throw.
      mockEntityType.mockReturnValue('PERSISTENCE');
      rerender(<Workflows />);
      expect(container.querySelector('input[placeholder="Filter workflows"]')).not.toBeNull();

      // Toggle back to BUSINESS → cloud. Must not throw either.
      mockEntityType.mockReturnValue('BUSINESS');
      rerender(<Workflows />);
      expect(container.querySelector('input[placeholder="Filter workflows"]')).toBeNull();
    });
  });
});

