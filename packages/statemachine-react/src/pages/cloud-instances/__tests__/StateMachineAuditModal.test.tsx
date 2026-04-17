import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { StateMachineAuditModal } from '../StateMachineAuditModal';
import { getInstancesGateway } from '../../../gateways';

vi.mock('../../../gateways', async () => {
  const actual = await vi.importActual<any>('../../../gateways');
  return { ...actual, getInstancesGateway: vi.fn() };
});

function renderIt(props: { open: boolean; entityId: string }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <App>
      <QueryClientProvider client={client}>
        <StateMachineAuditModal {...props} onClose={() => {}} />
      </QueryClientProvider>
    </App>
  );
}

describe('StateMachineAuditModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders audit event rows when loaded', async () => {
    vi.mocked(getInstancesGateway).mockReturnValue({
      loadAuditEvents: vi.fn().mockResolvedValue({
        items: [
          {
            auditEventType: 'StateMachine',
            severity: 'INFO',
            utcTime: '2026-04-11T00:43:33.886Z',
            transactionId: 'tx-audit-1',
            actor: { name: 'USER_EXTERNAL|x' },
            state: 'SIGNED',
            eventType: 'FINISHED',
            details: 'State machine finished',
          },
        ],
        hasNext: false,
      }),
    } as any);
    renderIt({ open: true, entityId: 'eid' });
    await waitFor(() => expect(screen.getByText('tx-audit-1')).toBeInTheDocument());
    expect(screen.getByText('SIGNED')).toBeInTheDocument();
    expect(screen.getByText('FINISHED')).toBeInTheDocument();
  });

  it('does not fire the query when open=false', () => {
    const loadAuditEvents = vi.fn();
    vi.mocked(getInstancesGateway).mockReturnValue({ loadAuditEvents } as any);
    renderIt({ open: false, entityId: 'eid' });
    expect(loadAuditEvents).not.toHaveBeenCalled();
  });

  it('renders a severity selector', () => {
    vi.mocked(getInstancesGateway).mockReturnValue({
      loadAuditEvents: vi.fn().mockReturnValue(new Promise(() => {})),
    } as any);
    renderIt({ open: true, entityId: 'eid' });
    expect(screen.getByText('Minimum Severity:')).toBeInTheDocument();
  });
});
