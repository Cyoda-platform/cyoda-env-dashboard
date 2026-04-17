import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { AuditTab } from '../AuditTab';
import { getInstancesGateway } from '../../../../gateways';

vi.mock('../../../../gateways', async () => {
  const actual = await vi.importActual<any>('../../../../gateways');
  return { ...actual, getInstancesGateway: vi.fn() };
});

function renderIt() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <App>
      <QueryClientProvider client={client}>
        <AuditTab entityId="eid" />
      </QueryClientProvider>
    </App>
  );
}

describe('AuditTab', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders one row per change with the columns from the spec', async () => {
    vi.mocked(getInstancesGateway).mockReturnValue({
      loadChanges: vi.fn().mockResolvedValue([
        { transactionId: 'tx1', timestamp: '2026-04-01T00:00:00Z', user: 'u1', changeType: 'CREATE', stateFrom: undefined, stateTo: 'NEW' },
        { transactionId: 'tx2', timestamp: '2026-04-02T00:00:00Z', user: 'u2', changeType: 'UPDATE', stateFrom: 'NEW', stateTo: 'DONE' },
      ]),
    } as any);
    renderIt();
    await waitFor(() => expect(screen.getByText('tx1')).toBeInTheDocument());
    expect(screen.getByText('tx2')).toBeInTheDocument();
    expect(screen.getByText('CREATE')).toBeInTheDocument();
    expect(screen.getByText('UPDATE')).toBeInTheDocument();
  });
});
