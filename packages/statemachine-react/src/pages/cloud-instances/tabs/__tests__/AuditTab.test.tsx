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

  it('renders one row per change with the new columns', async () => {
    vi.mocked(getInstancesGateway).mockReturnValue({
      loadChanges: vi.fn().mockResolvedValue([
        { transactionId: 'tx1', timestamp: '2026-04-01T00:00:00Z', user: 'u1', changeType: 'CREATE', fieldsChangedCount: 53 },
        { transactionId: 'tx2', timestamp: '2026-04-02T00:00:00Z', user: 'u2', changeType: 'UPDATE' },
      ]),
      loadAuditEvents: vi.fn().mockResolvedValue({ items: [], hasNext: false }),
      load: vi.fn().mockResolvedValue({ data: {}, meta: {} }),
    } as any);
    renderIt();
    await waitFor(() => expect(screen.getByText('tx1')).toBeInTheDocument());
    expect(screen.getByText('tx2')).toBeInTheDocument();
    expect(screen.getByText('CREATE')).toBeInTheDocument();
    expect(screen.getByText('UPDATE')).toBeInTheDocument();
  });

  it('renders fieldsChangedCount as a Tag', async () => {
    vi.mocked(getInstancesGateway).mockReturnValue({
      loadChanges: vi.fn().mockResolvedValue([
        { transactionId: 'tx1', timestamp: '2026-04-01T00:00:00Z', user: 'u1', changeType: 'CREATE', fieldsChangedCount: 53 },
      ]),
      loadAuditEvents: vi.fn().mockResolvedValue({ items: [], hasNext: false }),
      load: vi.fn().mockResolvedValue({ data: {}, meta: {} }),
    } as any);
    renderIt();
    await waitFor(() => expect(screen.getByText('53')).toBeInTheDocument());
  });

  it('does NOT render State From or State To columns', async () => {
    vi.mocked(getInstancesGateway).mockReturnValue({
      loadChanges: vi.fn().mockResolvedValue([
        { transactionId: 'tx1', timestamp: '2026-04-01T00:00:00Z', user: 'u1', changeType: 'CREATE' },
      ]),
      loadAuditEvents: vi.fn().mockResolvedValue({ items: [], hasNext: false }),
      load: vi.fn().mockResolvedValue({ data: {}, meta: {} }),
    } as any);
    renderIt();
    await waitFor(() => expect(screen.getByText('tx1')).toBeInTheDocument());
    expect(screen.queryByText('State From')).not.toBeInTheDocument();
    expect(screen.queryByText('State To')).not.toBeInTheDocument();
  });

  it('renders two action icon buttons per row', async () => {
    vi.mocked(getInstancesGateway).mockReturnValue({
      loadChanges: vi.fn().mockResolvedValue([
        { transactionId: 'tx1', timestamp: '2026-04-01T00:00:00Z', user: 'u1', changeType: 'CREATE', fieldsChangedCount: 5 },
      ]),
      loadAuditEvents: vi.fn().mockResolvedValue({ items: [], hasNext: false }),
      load: vi.fn().mockResolvedValue({ data: {}, meta: {} }),
    } as any);
    renderIt();
    await waitFor(() => expect(screen.getByText('tx1')).toBeInTheDocument());
    const buttons = screen.getAllByRole('button');
    // At least 2 action buttons (eye + branches)
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    const titles = buttons.map((b) => b.getAttribute('title'));
    expect(titles).toContain('View entity at this transaction');
    expect(titles).toContain('State Machine Audit');
  });
});
