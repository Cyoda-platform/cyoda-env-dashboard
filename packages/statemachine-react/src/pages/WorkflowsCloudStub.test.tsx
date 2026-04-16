import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkflowsCloudStub } from './WorkflowsCloudStub';
import { getWorkflowGateway } from '../gateways';

vi.mock('../gateways', async () => {
  const actual = await vi.importActual<any>('../gateways');
  return {
    ...actual,
    getWorkflowGateway: vi.fn(),
  };
});

function renderWithClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <WorkflowsCloudStub />
    </QueryClientProvider>
  );
}

describe('WorkflowsCloudStub', () => {
  beforeEach(() => {
    vi.mocked(getWorkflowGateway).mockReset();
  });

  it('renders the model picker controls', () => {
    vi.mocked(getWorkflowGateway).mockReturnValue({
      listWorkflows: vi.fn().mockResolvedValue([]),
      loadWorkflow: vi.fn(),
      saveWorkflow: vi.fn(),
      deleteWorkflow: vi.fn(),
      copyWorkflow: vi.fn(),
      renameWorkflow: vi.fn(),
    } as any);

    renderWithClient();

    expect(screen.getByLabelText(/entity name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/model version/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
  });

  it('calls gateway.listWorkflows with the entered model ref and renders the result', async () => {
    const listWorkflows = vi.fn().mockResolvedValue([
      { name: 'Premium', desc: 'p', active: true, initialState: 'draft' },
      { name: 'Standard', desc: undefined, active: false, initialState: 'pending' },
    ]);
    vi.mocked(getWorkflowGateway).mockReturnValue({
      listWorkflows,
      loadWorkflow: vi.fn(),
      saveWorkflow: vi.fn(),
      deleteWorkflow: vi.fn(),
      copyWorkflow: vi.fn(),
      renameWorkflow: vi.fn(),
    } as any);

    renderWithClient();

    await userEvent.type(screen.getByLabelText(/entity name/i), 'Customer');
    await userEvent.clear(screen.getByLabelText(/model version/i));
    await userEvent.type(screen.getByLabelText(/model version/i), '1');
    await userEvent.click(screen.getByRole('button', { name: /load/i }));

    await waitFor(() => {
      expect(listWorkflows).toHaveBeenCalledWith({ entityName: 'Customer', modelVersion: 1 });
    });
    await waitFor(() => {
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
    });
  });
});
