import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { JsonTab } from '../JsonTab';
import { getInstancesGateway } from '../../../../gateways';

vi.mock('../../../../gateways', async () => {
  const actual = await vi.importActual<any>('../../../../gateways');
  return { ...actual, getInstancesGateway: vi.fn() };
});

describe('JsonTab', () => {
  beforeEach(() => vi.clearAllMocks());
  it('renders the entity body as pretty JSON', async () => {
    vi.mocked(getInstancesGateway).mockReturnValue({
      load: vi.fn().mockResolvedValue({ data: { color: 'red', count: 7 }, meta: {} }),
    } as any);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { container } = render(
      <App>
        <QueryClientProvider client={client}>
          <JsonTab entityId="eid" />
        </QueryClientProvider>
      </App>
    );
    await waitFor(() => expect(container.textContent).toContain('"color": "red"'));
    expect(container.textContent).toContain('"count": 7');
  });
});
