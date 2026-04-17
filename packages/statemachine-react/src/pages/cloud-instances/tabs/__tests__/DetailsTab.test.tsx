import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { DetailsTab } from '../DetailsTab';
import { getInstancesGateway, getWorkflowGateway } from '../../../../gateways';

vi.mock('../../../../gateways', async () => {
  const actual = await vi.importActual<any>('../../../../gateways');
  return { ...actual, getInstancesGateway: vi.fn(), getWorkflowGateway: vi.fn() };
});

vi.mock('@cyoda/ui-lib-react', () => ({
  CodeEditor: ({ value }: { value: string }) => <div data-testid="code-editor">{value}</div>,
}));

function renderIt(props: { entityId: string; modelRef: any; workflowName: string }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <App>
      <QueryClientProvider client={client}>
        <DetailsTab {...props} />
      </QueryClientProvider>
    </App>
  );
}

describe('DetailsTab', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders standard fields from the loaded entity meta', async () => {
    vi.mocked(getInstancesGateway).mockReturnValue({
      load: vi.fn().mockResolvedValue({
        data: { color: 'red' },
        meta: { id: 'eid', state: 'NEW', creationDate: '2026-04-01T00:00:00Z' },
      }),
    } as any);
    vi.mocked(getWorkflowGateway).mockReturnValue({
      loadWorkflow: vi.fn().mockResolvedValue({
        version: '1.0', name: 'wf', initialState: 'NEW',
        states: { NEW: { transitions: [] } },
      }),
    } as any);
    renderIt({ entityId: 'eid', modelRef: { entityName: 'C', modelVersion: 1 }, workflowName: 'wf' });
    await waitFor(() => expect(screen.getByText('eid')).toBeInTheDocument());
    expect(screen.getByText('NEW')).toBeInTheDocument();
    expect(screen.getByText(/2026-04-01/)).toBeInTheDocument();
    expect(screen.getByText(/color/)).toBeInTheDocument();
    expect(screen.getByText(/red/)).toBeInTheDocument();
  });
});
