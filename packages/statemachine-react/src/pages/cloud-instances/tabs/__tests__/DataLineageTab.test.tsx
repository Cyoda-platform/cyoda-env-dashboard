import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { DataLineageTab } from '../DataLineageTab';
import { getInstancesGateway } from '../../../../gateways';

const captured: any = {};
vi.mock('@cyoda/ui-lib-react', async () => {
  const actual = await vi.importActual<any>('@cyoda/ui-lib-react');
  return {
    ...actual,
    CodeEditor: (props: any) => {
      Object.assign(captured, { props });
      return <div data-testid="diff-stub" />;
    },
  };
});

vi.mock('../../../../gateways', async () => {
  const actual = await vi.importActual<any>('../../../../gateways');
  return { ...actual, getInstancesGateway: vi.fn() };
});

function renderIt() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <App>
      <QueryClientProvider client={client}>
        <DataLineageTab entityId="eid" />
      </QueryClientProvider>
    </App>
  );
}

describe('DataLineageTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const k of Object.keys(captured)) delete captured[k];
  });

  it('renders one timeline row per change', async () => {
    vi.mocked(getInstancesGateway).mockReturnValue({
      loadChanges: vi.fn().mockResolvedValue([
        { transactionId: 'tx2', timestamp: '2026-04-02T00:00:00Z', changeType: 'UPDATE' },
        { transactionId: 'tx1', timestamp: '2026-04-01T00:00:00Z', changeType: 'CREATE' },
      ]),
      load: vi.fn(),
    } as any);
    renderIt();
    await waitFor(() => expect(screen.getByText(/2026-04-02/)).toBeInTheDocument());
    expect(screen.getByText(/2026-04-01/)).toBeInTheDocument();
  });

  it('Compare with two checks: passes older as oldString, newer as newString', async () => {
    const load = vi.fn()
      .mockResolvedValueOnce({ data: { v: 'old' }, meta: {} })
      .mockResolvedValueOnce({ data: { v: 'new' }, meta: {} });
    vi.mocked(getInstancesGateway).mockReturnValue({
      loadChanges: vi.fn().mockResolvedValue([
        { transactionId: 'tx2', timestamp: '2026-04-02T00:00:00Z', changeType: 'UPDATE' },
        { transactionId: 'tx1', timestamp: '2026-04-01T00:00:00Z', changeType: 'CREATE' },
      ]),
      load,
    } as any);
    renderIt();
    const checkboxes = await screen.findAllByRole('checkbox');
    await userEvent.click(checkboxes[0]); // newer (top of list = newest-first)
    await userEvent.click(checkboxes[1]); // older
    await userEvent.click(screen.getByRole('button', { name: /^Compare$/ }));
    await waitFor(() => expect(screen.getByTestId('diff-stub')).toBeInTheDocument());
    // Original is older, modified is newer (assert via captured props' textual content)
    expect(captured.props.oldString).toContain('"old"');
    expect(captured.props.newString).toContain('"new"');
  });

  it('checking a third box un-checks the first-checked (click-order FIFO)', async () => {
    vi.mocked(getInstancesGateway).mockReturnValue({
      loadChanges: vi.fn().mockResolvedValue([
        { transactionId: 'tx3', timestamp: '2026-04-03T00:00:00Z', changeType: 'UPDATE' },
        { transactionId: 'tx2', timestamp: '2026-04-02T00:00:00Z', changeType: 'UPDATE' },
        { transactionId: 'tx1', timestamp: '2026-04-01T00:00:00Z', changeType: 'CREATE' },
      ]),
      load: vi.fn(),
    } as any);
    renderIt();
    const checkboxes = await screen.findAllByRole('checkbox');
    await userEvent.click(checkboxes[0]); // first check
    await userEvent.click(checkboxes[1]); // second check
    await userEvent.click(checkboxes[2]); // third → first un-checks
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(false);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[2] as HTMLInputElement).checked).toBe(true);
  });
});
