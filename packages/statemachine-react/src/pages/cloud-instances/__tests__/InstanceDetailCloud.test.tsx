import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { InstanceDetailCloud } from '../InstanceDetailCloud';
import { getInstancesGateway, getWorkflowGateway } from '../../../gateways';

vi.mock('../../../gateways', async () => {
  const actual = await vi.importActual<any>('../../../gateways');
  return { ...actual, getInstancesGateway: vi.fn(), getWorkflowGateway: vi.fn() };
});

function renderAt(url: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <App>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route path="/instances/:instanceId" element={<InstanceDetailCloud />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </App>
  );
}

describe('InstanceDetailCloud — shell', () => {
  beforeEach(() => {
    vi.mocked(getInstancesGateway).mockReturnValue({
      load: vi.fn().mockResolvedValue({ data: {}, meta: { id: 'eid', state: 'NEW' } }),
      loadChanges: vi.fn().mockResolvedValue([]),
      list: vi.fn(), search: vi.fn(), fireTransition: vi.fn(), delete: vi.fn(),
    } as any);
    vi.mocked(getWorkflowGateway).mockReturnValue({
      loadWorkflow: vi.fn().mockResolvedValue({
        version: '1.0', name: 'wf', initialState: 'NEW',
        states: { NEW: { transitions: [] } },
      }),
      listWorkflows: vi.fn().mockResolvedValue([{ name: 'wf', active: true }]),
    } as any);
  });

  it('renders Back to Instances + the entity ID + the 4 tabs', () => {
    renderAt('/instances/eid?entityName=Customer&modelVersion=1&workflowName=wf');
    expect(screen.getByRole('button', { name: /Back to Instances/i })).toBeInTheDocument();
    expect(screen.getByText('eid')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Details/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Workflow/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Audit/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Data Lineage/ })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /^JSON$/ })).not.toBeInTheDocument();
  });
});
