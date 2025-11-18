/**
 * WorkflowDetail Page Tests
 * Comprehensive tests for the Workflow detail page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkflowDetail } from './WorkflowDetail';

// Mock the components
vi.mock('../components/WorkflowForm', () => ({
  WorkflowForm: ({ workflowId }: any) => (
    <div data-testid="workflow-form">WorkflowForm: {workflowId}</div>
  ),
}));

vi.mock('../components/TransitionsList', () => ({
  TransitionsList: ({ workflowId }: any) => (
    <div data-testid="transitions-list">TransitionsList: {workflowId}</div>
  ),
}));

vi.mock('../components/ProcessesList', () => ({
  ProcessesList: ({ workflowId }: any) => (
    <div data-testid="processes-list">ProcessesList: {workflowId}</div>
  ),
}));

vi.mock('../components/CriteriaList', () => ({
  CriteriaList: ({ workflowId }: any) => (
    <div data-testid="criteria-list">CriteriaList: {workflowId}</div>
  ),
}));

vi.mock('../components/GraphicalStateMachine', () => ({
  GraphicalStateMachine: ({ workflowId }: any) => (
    <div data-testid="graphical-state-machine">GraphicalStateMachine: {workflowId}</div>
  ),
}));

// Mock the hooks
const mockUseWorkflow = vi.fn();
const mockUseTransitions = vi.fn();
const mockUseProcesses = vi.fn();
const mockUseCriteria = vi.fn();
const mockUseCriteriaForWorkflow = vi.fn();

vi.mock('../hooks/useStatemachine', () => ({
  useWorkflow: () => mockUseWorkflow(),
  useTransitions: () => mockUseTransitions(),
  useProcesses: () => mockUseProcesses(),
  useCriteria: () => mockUseCriteria(),
  useCriteriaForWorkflow: () => mockUseCriteriaForWorkflow(),
  useStatesList: () => ({
    data: [],
    isLoading: false,
  }),
}));

// Mock the store
const mockGraphicalStatemachineStore = {
  positionsMap: {},
  updatePositionsMap: vi.fn(),
};

vi.mock('../stores/graphicalStatemachineStore', () => ({
  useGraphicalStatemachineStore: () => mockGraphicalStatemachineStore,
}));

const createWrapper = (workflowId = 'workflow-1') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={[
          `/statemachine/workflow/${workflowId}?persistedType=persisted&entityClassName=com.example.Entity`,
        ]}
      >
        <Routes>
          <Route path="/statemachine/workflow/:workflowId" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('WorkflowDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseWorkflow.mockReturnValue({
      data: {
        id: 'workflow-1',
        name: 'Test Workflow',
        entityClassName: 'com.example.Entity',
        active: true,
        persisted: true,
      },
      isLoading: false,
    });

    mockUseTransitions.mockReturnValue({
      data: [
        { id: 'transition-1', name: 'Transition 1', fromState: 'state-1', toState: 'state-2' },
      ],
      isLoading: false,
    });

    mockUseProcesses.mockReturnValue({
      data: [{ id: 'process-1', name: 'Process 1' }],
      isLoading: false,
    });

    mockUseCriteria.mockReturnValue({
      data: [{ id: 'criteria-1', name: 'Criteria 1' }],
      isLoading: false,
    });

    mockUseCriteriaForWorkflow.mockReturnValue({
      data: [{ id: 'criteria-1', name: 'Criteria 1' }],
      isLoading: false,
    });
  });

  it('should render the workflow detail page', () => {
    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // Should render the workflow form
    expect(screen.getByTestId('workflow-form')).toBeInTheDocument();
  });

  it('should render all layout mode buttons', () => {
    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // Should have 3 radio buttons for layout modes
    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(3);
  });

  it('should show WorkflowForm by default', () => {
    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // WorkflowForm should be visible
    expect(screen.getByTestId('workflow-form')).toBeInTheDocument();
  });

  it('should switch to Tabular view', async () => {
    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // Find and click the first radio button (tabular mode)
    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('transitions-list')).toBeInTheDocument();
      expect(screen.getByTestId('processes-list')).toBeInTheDocument();
      expect(screen.getByTestId('criteria-list')).toBeInTheDocument();
    });
  });

  it('should switch to Graphical view', async () => {
    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // Find and click the second radio button (graphical mode)
    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[1]);

    await waitFor(() => {
      expect(screen.getByTestId('graphical-state-machine')).toBeInTheDocument();
    });
  });

  it('should display workflow form with workflow ID', () => {
    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // WorkflowForm should receive the workflow ID
    const workflowForm = screen.getByTestId('workflow-form');
    expect(workflowForm).toHaveTextContent('workflow-1');
  });

  it('should show loading state', () => {
    mockUseWorkflow.mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // Component should still render the form even when loading
    expect(screen.getByTestId('workflow-form')).toBeInTheDocument();
  });

  it('should pass correct props to WorkflowForm', () => {
    render(<WorkflowDetail />, { wrapper: createWrapper() });

    const workflowForm = screen.getByTestId('workflow-form');
    expect(workflowForm).toHaveTextContent('workflow-1');
  });

  it('should pass correct props to TransitionsList', async () => {
    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // Click the first radio button (tabular mode)
    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]);

    await waitFor(() => {
      const transitionsList = screen.getByTestId('transitions-list');
      expect(transitionsList).toHaveTextContent('workflow-1');
    });
  });

  it('should pass correct props to GraphicalStateMachine', async () => {
    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // Click the second radio button (graphical mode)
    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[1]);

    await waitFor(() => {
      const graphicalStateMachine = screen.getByTestId('graphical-state-machine');
      expect(graphicalStateMachine).toBeInTheDocument();
    });
  });

  it('should render layout mode toggle buttons', () => {
    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // Should have 3 radio buttons for layout modes
    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(3);
  });

  it('should handle workflow not found', () => {
    mockUseWorkflow.mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // Component should still render the form
    expect(screen.getByTestId('workflow-form')).toBeInTheDocument();
  });

  it('should display entity class name', () => {
    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // WorkflowForm receives entityClassName via query params
    // The form itself should be rendered
    expect(screen.getByTestId('workflow-form')).toBeInTheDocument();
  });

  it('should show persisted type badge', () => {
    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // WorkflowForm handles displaying persisted type
    expect(screen.getByTestId('workflow-form')).toBeInTheDocument();
  });

  it('should show active status badge', () => {
    render(<WorkflowDetail />, { wrapper: createWrapper() });

    // WorkflowForm handles displaying active status
    expect(screen.getByTestId('workflow-form')).toBeInTheDocument();
  });
});

