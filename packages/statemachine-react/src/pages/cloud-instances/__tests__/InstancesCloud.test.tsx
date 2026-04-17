import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { InstancesCloud } from '../InstancesCloud';
import { getInstancesGateway } from '../../../gateways';

vi.mock('../../../gateways', async () => {
  const actual = await vi.importActual<any>('../../../gateways');
  return { ...actual, getInstancesGateway: vi.fn() };
});

function renderAt(url: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <App>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route path="/instances" element={<InstancesCloud />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </App>,
  );
}

const mkPage = (items: any[], hasMore = false) => ({ items, hasMore });

describe('InstancesCloud — basic shell', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the heading and the model picker', () => {
    vi.mocked(getInstancesGateway).mockReturnValue({
      list: vi.fn().mockResolvedValue(mkPage([])),
      search: vi.fn(), load: vi.fn(), loadChanges: vi.fn(),
      fireTransition: vi.fn(), delete: vi.fn(),
    } as any);
    renderAt('/instances');
    expect(screen.getByRole('heading', { name: /Instances/ })).toBeInTheDocument();
    // Model picker (combobox role)
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('with entityName + modelVersion in URL: calls list and renders one row per item', async () => {
    const list = vi.fn().mockResolvedValue(mkPage([
      { entityId: 'e1', entityName: 'Customer', modelVersion: 1, state: 'NEW' },
      { entityId: 'e2', entityName: 'Customer', modelVersion: 1, state: 'DONE' },
    ]));
    vi.mocked(getInstancesGateway).mockReturnValue({
      list, search: vi.fn(), load: vi.fn(), loadChanges: vi.fn(),
      fireTransition: vi.fn(), delete: vi.fn(),
    } as any);
    renderAt('/instances?entityName=Customer&modelVersion=1');
    await waitFor(() => expect(screen.getByText('e1')).toBeInTheDocument());
    expect(screen.getByText('e2')).toBeInTheDocument();
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ entityName: 'Customer', modelVersion: 1 }),
      expect.objectContaining({ pageSize: 20, pageNumber: 1 }),
    );
  });

  it('Next page click increments pageNumber', async () => {
    const list = vi.fn().mockResolvedValue(mkPage([{ entityId: 'e1', entityName: 'Customer', modelVersion: 1, state: 'NEW' }], true));
    vi.mocked(getInstancesGateway).mockReturnValue({
      list, search: vi.fn(), load: vi.fn(), loadChanges: vi.fn(),
      fireTransition: vi.fn(), delete: vi.fn(),
    } as any);
    renderAt('/instances?entityName=Customer&modelVersion=1');
    await waitFor(() => expect(screen.getByText('e1')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));
    await waitFor(() => {
      expect(list).toHaveBeenLastCalledWith(
        expect.objectContaining({ entityName: 'Customer', modelVersion: 1 }),
        expect.objectContaining({ pageSize: 20, pageNumber: 2 }),
      );
    });
  });
});

describe('InstancesCloud — entity-IDs filter', () => {
  beforeEach(() => vi.clearAllMocks());

  it('typing IDs and clicking Search calls list with entityIds', async () => {
    const list = vi.fn().mockResolvedValue(mkPage([]));
    vi.mocked(getInstancesGateway).mockReturnValue({
      list, search: vi.fn(), load: vi.fn(), loadChanges: vi.fn(),
      fireTransition: vi.fn(), delete: vi.fn(),
    } as any);
    renderAt('/instances?entityName=Customer&modelVersion=1');
    await waitFor(() => expect(list).toHaveBeenCalled());
    list.mockClear();
    await userEvent.type(screen.getByPlaceholderText(/Search by id/i), 'a, b, c');
    await userEvent.click(screen.getByRole('button', { name: /^Search$/i }));
    await waitFor(() => {
      expect(list).toHaveBeenLastCalledWith(
        expect.objectContaining({ entityName: 'Customer', modelVersion: 1 }),
        expect.objectContaining({ entityIds: ['a', 'b', 'c'] }),
      );
    });
  });

  it('with >100 IDs: shows a banner and does NOT call list', async () => {
    const list = vi.fn().mockResolvedValue(mkPage([]));
    vi.mocked(getInstancesGateway).mockReturnValue({
      list, search: vi.fn(), load: vi.fn(), loadChanges: vi.fn(),
      fireTransition: vi.fn(), delete: vi.fn(),
    } as any);
    renderAt('/instances?entityName=Customer&modelVersion=1');
    await waitFor(() => expect(list).toHaveBeenCalledTimes(1));   // initial load
    list.mockClear();
    const ids = Array.from({ length: 101 }, (_, i) => `id-${i}`).join(',');
    await userEvent.type(screen.getByPlaceholderText(/Search by id/i), ids);
    await userEvent.click(screen.getByRole('button', { name: /^Search$/i }));
    expect(await screen.findByText(/Too many IDs/i)).toBeInTheDocument();
    expect(list).not.toHaveBeenCalled();
  });
});
