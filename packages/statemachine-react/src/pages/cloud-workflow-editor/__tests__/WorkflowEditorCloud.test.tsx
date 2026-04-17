import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { WorkflowEditorCloud } from '../WorkflowEditorCloud';
import { getWorkflowGateway } from '../../../gateways';

vi.mock('../../../gateways', async () => {
  const actual = await vi.importActual<any>('../../../gateways');
  return { ...actual, getWorkflowGateway: vi.fn() };
});

// useDirtyGuard uses useBlocker which requires a data router; stub it out for unit tests.
vi.mock('../useDirtyGuard', () => ({ useDirtyGuard: vi.fn() }));

function renderAt(url: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <App>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route path="/workflow/:entityName/:modelVersion/new" element={<WorkflowEditorCloud />} />
            <Route path="/workflow/:entityName/:modelVersion/:workflowName" element={<WorkflowEditorCloud />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </App>,
  );
}

const sampleDoc = {
  version: '1.0', name: 'wf', initialState: 'draft',
  states: { draft: { transitions: [{ name: 't', next: 'draft', manual: false }] } },
};

describe('WorkflowEditorCloud — load / scaffold / 404', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads an existing workflow via gateway.loadWorkflow', async () => {
    vi.mocked(getWorkflowGateway).mockReturnValue({
      loadWorkflow: vi.fn().mockResolvedValue(sampleDoc),
      saveWorkflow: vi.fn(), copyWorkflow: vi.fn(), deleteWorkflow: vi.fn(),
      renameWorkflow: vi.fn(), listWorkflows: vi.fn(),
    } as any);
    renderAt('/workflow/Customer/1/wf');
    await waitFor(() => expect(screen.getAllByText('Workflow').length).toBeGreaterThan(0));
  });

  it('uses the scaffold for /new', async () => {
    vi.mocked(getWorkflowGateway).mockReturnValue({
      loadWorkflow: vi.fn(), saveWorkflow: vi.fn(), copyWorkflow: vi.fn(),
      deleteWorkflow: vi.fn(), renameWorkflow: vi.fn(), listWorkflows: vi.fn(),
    } as any);
    renderAt('/workflow/Customer/1/new');
    await waitFor(() => expect(screen.getAllByText('Workflow').length).toBeGreaterThan(0));
    // Scaffold has draft state
    await waitFor(() => expect(screen.getAllByText('draft').length).toBeGreaterThan(0));
  });

  it('renders a 404 result when modelVersion is not a number', async () => {
    renderAt('/workflow/Customer/abc/wf');
    expect(await screen.findByText('Bad workflow URL')).toBeInTheDocument();
  });

  it('Save and Discard buttons exist and are disabled while not dirty', async () => {
    vi.mocked(getWorkflowGateway).mockReturnValue({
      loadWorkflow: vi.fn().mockResolvedValue(sampleDoc),
      saveWorkflow: vi.fn(), copyWorkflow: vi.fn(), deleteWorkflow: vi.fn(),
      renameWorkflow: vi.fn(), listWorkflows: vi.fn(),
    } as any);
    renderAt('/workflow/Customer/1/wf');
    await waitFor(() => expect(screen.getAllByText('Workflow').length).toBeGreaterThan(0));
    expect(screen.getByRole('button', { name: /^Save$/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Discard changes/ })).toBeDisabled();
  });
});
