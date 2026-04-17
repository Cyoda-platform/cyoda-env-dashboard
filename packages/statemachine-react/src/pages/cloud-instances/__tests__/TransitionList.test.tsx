import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { TransitionList } from '../TransitionList';
import { getWorkflowGateway, getInstancesGateway } from '../../../gateways';

vi.mock('../../../gateways', async () => {
  const actual = await vi.importActual<any>('../../../gateways');
  return { ...actual, getWorkflowGateway: vi.fn(), getInstancesGateway: vi.fn() };
});

const wfDoc = {
  version: '1.0', name: 'wf', initialState: 'NEW',
  states: {
    NEW: { transitions: [{ name: 'submit', next: 'PENDING', manual: true }] },
    PENDING: { transitions: [] },
  },
};

function renderIt(props: any) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <App>
      <QueryClientProvider client={client}>
        <TransitionList {...props} />
      </QueryClientProvider>
    </App>
  );
}

describe('TransitionList', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders one button per transition for the current state', async () => {
    vi.mocked(getWorkflowGateway).mockReturnValue({
      loadWorkflow: vi.fn().mockResolvedValue(wfDoc),
    } as any);
    vi.mocked(getInstancesGateway).mockReturnValue({
      fireTransition: vi.fn(),
    } as any);
    renderIt({ entityId: 'eid', modelRef: { entityName: 'C', modelVersion: 1 }, workflowName: 'wf', entityBody: {}, currentState: 'NEW' });
    expect(await screen.findByRole('button', { name: 'submit' })).toBeInTheDocument();
  });

  it('shows "No transitions available" when current state has none', async () => {
    vi.mocked(getWorkflowGateway).mockReturnValue({
      loadWorkflow: vi.fn().mockResolvedValue(wfDoc),
    } as any);
    vi.mocked(getInstancesGateway).mockReturnValue({
      fireTransition: vi.fn(),
    } as any);
    renderIt({ entityId: 'eid', modelRef: { entityName: 'C', modelVersion: 1 }, workflowName: 'wf', entityBody: {}, currentState: 'PENDING' });
    expect(await screen.findByText(/No transitions available/i)).toBeInTheDocument();
  });

  it('clicking a button confirms then calls fireTransition with the body', async () => {
    const fire = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getWorkflowGateway).mockReturnValue({
      loadWorkflow: vi.fn().mockResolvedValue(wfDoc),
    } as any);
    vi.mocked(getInstancesGateway).mockReturnValue({
      fireTransition: fire,
    } as any);
    renderIt({ entityId: 'eid', modelRef: { entityName: 'C', modelVersion: 1 }, workflowName: 'wf', entityBody: { foo: 'bar' }, currentState: 'NEW' });
    await userEvent.click(await screen.findByRole('button', { name: 'submit' }));
    // Confirm modal Fire button
    await userEvent.click(await screen.findByRole('button', { name: /^Fire$/ }));
    await waitFor(() => expect(fire).toHaveBeenCalledWith('eid', 'submit', { foo: 'bar' }));
  });
});
