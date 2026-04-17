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

import userEvent from '@testing-library/user-event';

describe('WorkflowEditorCloud — save flow', () => {
  beforeEach(() => vi.clearAllMocks());

  function makeGateway(overrides: any = {}) {
    return {
      loadWorkflow: vi.fn().mockResolvedValue(sampleDoc),
      saveWorkflow: vi.fn().mockResolvedValue({ key: 'wf' }),
      copyWorkflow: vi.fn(), deleteWorkflow: vi.fn(),
      renameWorkflow: vi.fn(), listWorkflows: vi.fn(),
      ...overrides,
    };
  }

  it('Save click calls saveWorkflow with the right doc and re-fetches via loadWorkflow', async () => {
    const gw = makeGateway();
    vi.mocked(getWorkflowGateway).mockReturnValue(gw as any);
    renderAt('/workflow/Customer/1/wf');
    await waitFor(() => expect(screen.getAllByText('Workflow').length).toBeGreaterThan(0));
    // Make the doc dirty by editing the description field.
    const descInput = await screen.findByRole('textbox', { name: /description/i });
    await userEvent.type(descInput, 'X');
    await userEvent.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() => expect(gw.saveWorkflow).toHaveBeenCalled());
    // initial loadWorkflow via useQuery + post-save fetchQuery = 2 total
    await waitFor(() => expect(gw.loadWorkflow).toHaveBeenCalledTimes(2));
  });

  it('Validation failure does not call saveWorkflow and shows the banner', async () => {
    const gw = makeGateway();
    vi.mocked(getWorkflowGateway).mockReturnValue(gw as any);
    renderAt('/workflow/Customer/1/wf');
    await waitFor(() => expect(screen.getAllByText('Workflow').length).toBeGreaterThan(0));
    // Make the doc dirty AND invalid: clear the name field.
    const nameInput = await screen.findByDisplayValue('wf');
    await userEvent.clear(nameInput);
    await userEvent.click(screen.getByRole('button', { name: /^Save$/ }));
    expect(gw.saveWorkflow).not.toHaveBeenCalled();
    expect(await screen.findByText(/validation failed/i)).toBeInTheDocument();
  });

  it('after save on /new, calls saveWorkflow with the right doc', async () => {
    const gw = makeGateway();
    vi.mocked(getWorkflowGateway).mockReturnValue(gw as any);
    renderAt('/workflow/Customer/1/new');
    await waitFor(() => expect(screen.getAllByText('Workflow').length).toBeGreaterThan(0));
    const nameInput = await screen.findByRole('textbox', { name: /^Name$/i });
    await userEvent.type(nameInput, 'created');
    await userEvent.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() => {
      expect(gw.saveWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({ entityName: 'Customer', modelVersion: 1 }),
        expect.objectContaining({ name: 'created' }),
        'MERGE',
      );
    });
  });

  it('Discard-changes confirms then resets to pristine', async () => {
    const gw = makeGateway();
    vi.mocked(getWorkflowGateway).mockReturnValue(gw as any);
    renderAt('/workflow/Customer/1/wf');
    await waitFor(() => expect(screen.getAllByText('Workflow').length).toBeGreaterThan(0));
    const descInput = await screen.findByRole('textbox', { name: /description/i });
    await userEvent.type(descInput, 'X');
    await userEvent.click(screen.getByRole('button', { name: /Discard changes/ }));
    // Confirm dialog
    await userEvent.click(await screen.findByRole('button', { name: /^Discard$/ }));
    // Doc is back to pristine; description is cleared
    await waitFor(() => expect((descInput as HTMLInputElement).value).toBe(''));
  });
});
