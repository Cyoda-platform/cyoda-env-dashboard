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
    
    mockUseWorkflowsList.mockReturnValue({
      data: mockWorkflows,
      isLoading: false,
      refetch: vi.fn(),
    });
    
    mockUseWorkflowEnabledTypes.mockReturnValue({
      data: [
        { name: 'com.example.Entity1', label: 'Entity 1', type: 'BUSINESS' },
        { name: 'com.example.Entity2', label: 'Entity 2', type: 'TECHNICAL' },
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
    
    expect(screen.getByText('Entity 1')).toBeInTheDocument();
    expect(screen.getByText('Entity 2')).toBeInTheDocument();
  });

  it('should show active/inactive status', () => {
    render(<Workflows />, { wrapper: createWrapper() });
    
    // Check for active badges (2 active workflows)
    const activeBadges = screen.getAllByText('Active');
    expect(activeBadges).toHaveLength(2);
    
    // Check for inactive badge (1 inactive workflow)
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should show persisted/transient status', () => {
    render(<Workflows />, { wrapper: createWrapper() });
    
    // Check for persisted badges (2 persisted workflows)
    const persistedBadges = screen.getAllByText('Persisted');
    expect(persistedBadges).toHaveLength(2);
    
    // Check for transient badge (1 transient workflow)
    expect(screen.getByText('Transient')).toBeInTheDocument();
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
    expect(screen.getByText(/2021/)).toBeInTheDocument();
  });

  it('should show action buttons for each workflow', () => {
    render(<Workflows />, { wrapper: createWrapper() });
    
    // Each workflow should have View, Copy, and Delete buttons
    // We have 3 workflows, so 3 of each button
    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    expect(viewButtons.length).toBeGreaterThanOrEqual(3);
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
});

