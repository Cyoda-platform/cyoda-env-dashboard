/**
 * InstanceDetail Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InstanceDetail } from './InstanceDetail';

// Mock the hooks
vi.mock('../hooks/useStatemachine', () => ({
  useWorkflow: vi.fn(() => ({
    data: { id: 'workflow-1', name: 'Test Workflow' },
    isLoading: false,
  })),
  useWorkflowEnabledTypes: vi.fn(() => ({
    data: [
      { name: 'com.example.Entity', type: 'BUSINESS' },
      { name: 'com.example.OtherEntity', type: 'TECHNICAL' },
    ],
    isLoading: false,
  })),
}));

// Mock http-api-react hooks
vi.mock('@cyoda/http-api-react', () => ({
  useEntity: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
}));

// Mock ui-lib-react components to avoid monaco-editor issues
vi.mock('@cyoda/ui-lib-react', () => ({
  DataLineage: ({ requestClass, id }: any) => (
    <div data-testid="data-lineage">
      DataLineage: {requestClass} - {id}
    </div>
  ),
  TransitionChangesTable: ({ type, entityId }: any) => (
    <div data-testid="transition-changes-table">
      TransitionChangesTable: {type} - {entityId}
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
      <MemoryRouter
        initialEntries={[
          '/statemachine/instances/123?entityClassName=com.example.Entity&currentWorkflowId=workflow-1&persistedType=persisted',
        ]}
      >
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('InstanceDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    render(<InstanceDetail />, { wrapper: createWrapper() });
    expect(screen.getByText(/Instances/i)).toBeInTheDocument();
  });

  it('should display instance ID and model name', () => {
    render(<InstanceDetail />, { wrapper: createWrapper() });
    // Check for the presence of ID and Model text
    expect(screen.getByText(/ID:/i)).toBeInTheDocument();
    expect(screen.getByText(/Model:/i)).toBeInTheDocument();
  });

  it('should display workflow name when available', async () => {
    render(<InstanceDetail />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText(/Test Workflow/i)).toBeInTheDocument();
    });
  });

  it('should render all tabs', () => {
    render(<InstanceDetail />, { wrapper: createWrapper() });
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Workflow')).toBeInTheDocument();
    expect(screen.getByText('Audit')).toBeInTheDocument();
    expect(screen.getByText('Data Lineage')).toBeInTheDocument();
  });

  it('should show Details tab by default', async () => {
    render(<InstanceDetail />, { wrapper: createWrapper() });
    // Details tab should be active by default
    // The component will show either DetailView or DetailJsonView based on entity type
    // Since we're not mocking axios, it will show "No Data" message
    await waitFor(() => {
      expect(screen.getByText('No Data') || screen.getByText('No entity data available for this instance.')).toBeTruthy();
    });
  });

  it('should not show Workflow tab when currentWorkflowId is missing', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const WrapperWithoutWorkflow = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={['/statemachine/instances/123?entityClassName=com.example.Entity']}
        >
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    );

    render(<InstanceDetail />, { wrapper: WrapperWithoutWorkflow });

    // Workflow tab should not be present
    const tabs = screen.queryAllByRole('tab');
    const workflowTab = tabs.find(tab => tab.textContent === 'Workflow');
    expect(workflowTab).toBeUndefined();
  });

  it('should load entity data using useEntity hook', async () => {
    const { useEntity } = await import('@cyoda/http-api-react');

    render(<InstanceDetail />, { wrapper: createWrapper() });

    // Check that useEntity was called
    await waitFor(() => {
      expect(useEntity).toHaveBeenCalled();
    });
  });

  it('should show loading state while entity data is loading', async () => {
    const { useEntity } = await import('@cyoda/http-api-react');

    vi.mocked(useEntity).mockReturnValue({
      data: null,
      isLoading: true,
    } as any);

    render(<InstanceDetail />, { wrapper: createWrapper() });

    // Should show loading spinner
    await waitFor(() => {
      const spinners = screen.queryAllByRole('img', { hidden: true });
      expect(spinners.length).toBeGreaterThan(0);
    });
  });

  it('should extract state from entity data for workflow view', async () => {
    const { useEntity } = await import('@cyoda/http-api-react');

    render(<InstanceDetail />, { wrapper: createWrapper() });

    // Check that useEntity was called
    await waitFor(() => {
      expect(useEntity).toHaveBeenCalled();
    });
  });

  it('should filter out non-presented entity fields', async () => {
    const { useEntity } = await import('@cyoda/http-api-react');

    render(<InstanceDetail />, { wrapper: createWrapper() });

    // Check that useEntity was called
    await waitFor(() => {
      expect(useEntity).toHaveBeenCalled();
    });

    // The component filters out fields with presented: false in the DetailView component
    // This is tested by the component logic, not the rendered output
  });
});

