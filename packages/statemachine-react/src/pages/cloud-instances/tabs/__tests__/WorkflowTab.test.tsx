import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { WorkflowTab } from '../WorkflowTab';
import { getWorkflowGateway, getInstancesGateway } from '../../../../gateways';

const captured: any = {};
vi.mock('../../../../components/GraphicalStateMachine', () => ({
  GraphicalStateMachine: (props: any) => {
    Object.assign(captured, { props });
    return <div data-testid="graph-stub" />;
  },
}));

vi.mock('../../../../gateways', async () => {
  const actual = await vi.importActual<any>('../../../../gateways');
  return { ...actual, getWorkflowGateway: vi.fn(), getInstancesGateway: vi.fn() };
});

const sampleDoc = {
  version: '1.0', name: 'wf', initialState: 'draft',
  states: { draft: { transitions: [{ name: 't', next: 'draft', manual: true }] } },
};

function renderIt() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <App>
      <QueryClientProvider client={client}>
        <WorkflowTab
          entityId="eid"
          modelRef={{ entityName: 'C', modelVersion: 1 }}
          workflowName="wf"
        />
      </QueryClientProvider>
    </App>
  );
}

describe('WorkflowTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const k of Object.keys(captured)) delete captured[k];
    window.localStorage.clear();
  });

  it('renders the GraphicalStateMachine with adapted shape from the workflow doc', async () => {
    vi.mocked(getWorkflowGateway).mockReturnValue({
      loadWorkflow: vi.fn().mockResolvedValue(sampleDoc),
    } as any);
    vi.mocked(getInstancesGateway).mockReturnValue({
      load: vi.fn().mockResolvedValue({ data: {}, meta: { state: 'draft' } }),
    } as any);
    renderIt();
    await waitFor(() => expect(screen.getByTestId('graph-stub')).toBeInTheDocument());
    expect(captured.props.transitions).toHaveLength(1);
    expect(captured.props.transitions[0].startStateName).toBe('draft');
    expect(captured.props.currentState).toBe('draft');
  });
});
