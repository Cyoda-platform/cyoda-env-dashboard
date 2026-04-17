import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { EntityAtTransactionModal } from '../EntityAtTransactionModal';
import { getInstancesGateway } from '../../../gateways';

vi.mock('../../../gateways', async () => {
  const actual = await vi.importActual<any>('../../../gateways');
  return { ...actual, getInstancesGateway: vi.fn() };
});

function renderIt(props: { open: boolean; entityId: string; transactionId: string }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <App>
      <QueryClientProvider client={client}>
        <EntityAtTransactionModal {...props} onClose={() => {}} />
      </QueryClientProvider>
    </App>
  );
}

describe('EntityAtTransactionModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the entity body as JSON when loaded', async () => {
    vi.mocked(getInstancesGateway).mockReturnValue({
      load: vi.fn().mockResolvedValue({ data: { status: 'active' }, meta: {} }),
    } as any);
    renderIt({ open: true, entityId: 'eid', transactionId: 'tx1' });
    await waitFor(() => expect(screen.getByText(/status/)).toBeInTheDocument());
    expect(screen.getByText(/active/)).toBeInTheDocument();
  });

  it('shows Loading… while query is in flight', () => {
    vi.mocked(getInstancesGateway).mockReturnValue({
      load: vi.fn().mockReturnValue(new Promise(() => {})),
    } as any);
    renderIt({ open: true, entityId: 'eid', transactionId: 'tx1' });
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('does not fire the query when open=false', () => {
    const load = vi.fn();
    vi.mocked(getInstancesGateway).mockReturnValue({ load } as any);
    renderIt({ open: false, entityId: 'eid', transactionId: 'tx1' });
    expect(load).not.toHaveBeenCalled();
  });
});
