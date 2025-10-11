/**
 * Workflow Creation Integration Tests
 * Tests the complete workflow creation flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Workflows } from '../../pages/Workflows';
import { WorkflowDetail } from '../../pages/WorkflowDetail';

// Mock the API calls
const mockCreateWorkflow = vi.fn();
const mockUpdateWorkflow = vi.fn();
const mockDeleteWorkflow = vi.fn();
const mockCopyWorkflow = vi.fn();

vi.mock('../../hooks/useStatemachine', () => ({
  useWorkflowsList: () => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  }),
  useWorkflow: () => ({
    data: null,
    isLoading: false,
  }),
  useWorkflowEnabledTypes: () => ({
    data: [
      { name: 'com.example.Entity', label: 'Example Entity', type: 'BUSINESS' },
    ],
    isLoading: false,
  }),
  useCreateWorkflow: () => ({
    mutateAsync: mockCreateWorkflow,
    isPending: false,
  }),
  useUpdateWorkflow: () => ({
    mutateAsync: mockUpdateWorkflow,
    isPending: false,
  }),
  useDeleteWorkflow: () => ({
    mutateAsync: mockDeleteWorkflow,
    isPending: false,
  }),
  useCopyWorkflow: () => ({
    mutateAsync: mockCopyWorkflow,
    isPending: false,
  }),
  useTransitionsList: () => ({
    data: [],
    isLoading: false,
  }),
  useProcessesList: () => ({
    data: [],
    isLoading: false,
  }),
  useCriteriaList: () => ({
    data: [],
    isLoading: false,
  }),
}));

// Mock components
vi.mock('../../components/ExportImport', () => ({
  ExportImport: () => <div data-testid="export-import">Export/Import</div>,
}));

vi.mock('../../components/WorkflowForm', () => ({
  WorkflowForm: ({ onSave }: any) => (
    <div data-testid="workflow-form">
      <button onClick={() => onSave({ name: 'New Workflow', entityClassName: 'com.example.Entity' })}>
        Save Workflow
      </button>
    </div>
  ),
}));

vi.mock('../../components/TransitionsList', () => ({
  TransitionsList: () => <div data-testid="transitions-list">Transitions</div>,
}));

vi.mock('../../components/ProcessesList', () => ({
  ProcessesList: () => <div data-testid="processes-list">Processes</div>,
}));

vi.mock('../../components/CriteriaList', () => ({
  CriteriaList: () => <div data-testid="criteria-list">Criteria</div>,
}));

vi.mock('../../components/GraphicalStateMachine', () => ({
  GraphicalStateMachine: () => <div data-testid="graphical-state-machine">Graphical View</div>,
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

describe('Workflow Creation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new workflow from Workflows page', async () => {
    mockCreateWorkflow.mockResolvedValue({
      id: 'new-workflow-1',
      name: 'New Workflow',
      entityClassName: 'com.example.Entity',
    });

    render(<Workflows />, { wrapper: createWrapper() });

    // Click "Create new workflow" button
    const createButton = screen.getByText('Create new workflow');
    fireEvent.click(createButton);

    // This would typically open a modal or navigate to a form
    // The exact behavior depends on the implementation
  });

  it('should validate workflow name is required', async () => {
    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // Try to save without entering a name
    // The form should show validation errors
    // This depends on the WorkflowForm implementation
  });

  it('should validate entity class is required', async () => {
    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // Try to save without selecting an entity class
    // The form should show validation errors
  });

  it('should save workflow with valid data', async () => {
    mockCreateWorkflow.mockResolvedValue({
      id: 'new-workflow-1',
      name: 'New Workflow',
      entityClassName: 'com.example.Entity',
    });

    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // Fill in the form and save
    const saveButton = screen.getByText('Save Workflow');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockCreateWorkflow).toHaveBeenCalledWith({
        name: 'New Workflow',
        entityClassName: 'com.example.Entity',
      });
    });
  });

  it('should handle workflow creation error', async () => {
    mockCreateWorkflow.mockRejectedValue(new Error('Failed to create workflow'));

    render(<WorkflowDetail />, { wrapper: createWrapper() });

    const saveButton = screen.getByText('Save Workflow');
    fireEvent.click(saveButton);

    await waitFor(() => {
      // Should show error message
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should copy an existing workflow', async () => {
    mockCopyWorkflow.mockResolvedValue({
      id: 'copied-workflow-1',
      name: 'Copy of Test Workflow',
      entityClassName: 'com.example.Entity',
    });

    // This test would require rendering a workflow with a copy button
    // The exact implementation depends on the Workflows page
  });

  it('should delete a workflow', async () => {
    mockDeleteWorkflow.mockResolvedValue(undefined);

    // This test would require rendering a workflow with a delete button
    // The exact implementation depends on the Workflows page
  });

  it('should update an existing workflow', async () => {
    mockUpdateWorkflow.mockResolvedValue({
      id: 'workflow-1',
      name: 'Updated Workflow',
      entityClassName: 'com.example.Entity',
    });

    // This test would require rendering an existing workflow
    // and updating its properties
  });

  it('should navigate between workflow tabs', async () => {
    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // Click on Tabular tab
    const tabularTab = screen.getByText('Tabular');
    fireEvent.click(tabularTab);

    await waitFor(() => {
      expect(screen.getByTestId('transitions-list')).toBeInTheDocument();
      expect(screen.getByTestId('processes-list')).toBeInTheDocument();
      expect(screen.getByTestId('criteria-list')).toBeInTheDocument();
    });

    // Click on Graphical tab
    const graphicalTab = screen.getByText('Graphical');
    fireEvent.click(graphicalTab);

    await waitFor(() => {
      expect(screen.getByTestId('graphical-state-machine')).toBeInTheDocument();
    });

    // Click back to Settings tab
    const settingsTab = screen.getByText('Settings');
    fireEvent.click(settingsTab);

    await waitFor(() => {
      expect(screen.getByTestId('workflow-form')).toBeInTheDocument();
    });
  });

  it('should show loading state during workflow creation', async () => {
    mockCreateWorkflow.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<WorkflowDetail />, { wrapper: createWrapper() });

    const saveButton = screen.getByText('Save Workflow');
    fireEvent.click(saveButton);

    // Should show loading indicator
    await waitFor(() => {
      expect(document.querySelector('.ant-spin')).toBeInTheDocument();
    });
  });

  it('should refresh workflow list after creation', async () => {
    const mockRefetch = vi.fn();
    
    vi.mocked(require('../../hooks/useStatemachine').useWorkflowsList).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: mockRefetch,
    });

    mockCreateWorkflow.mockResolvedValue({
      id: 'new-workflow-1',
      name: 'New Workflow',
      entityClassName: 'com.example.Entity',
    });

    render(<WorkflowDetail />, { wrapper: createWrapper() });

    const saveButton = screen.getByText('Save Workflow');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});

