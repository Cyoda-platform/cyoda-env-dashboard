import { describe, it, expect, beforeEach, vi } from 'vitest';
import { axios } from '@cyoda/http-api-react';
import { CloudInstancesGateway } from './CloudInstancesGateway';
import { TooManyEntityIdsError } from './errors';

vi.mock('@cyoda/http-api-react', async () => {
  const actual = await vi.importActual<any>('@cyoda/http-api-react');
  return {
    ...actual,
    axios: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

const ref = { entityName: 'Customer', modelVersion: 1 };

describe('CloudInstancesGateway.list', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GETs /entity/{entityName}/{modelVersion} with pageSize and pageNumber', async () => {
    (axios.get as any).mockResolvedValueOnce({ data: { items: [], hasMore: false } });
    const gw = new CloudInstancesGateway();
    await gw.list(ref, { pageSize: 20, pageNumber: 1 });
    expect(axios.get).toHaveBeenCalledWith(
      '/entity/Customer/1',
      expect.objectContaining({ params: expect.objectContaining({ pageSize: 20, pageNumber: 1 }) }),
    );
  });

  it('with entityIds: falls through to /search/direct with synthesized OR-of-EQUALS group', async () => {
    (axios.post as any).mockResolvedValueOnce({ data: { items: [], hasMore: false } });
    const gw = new CloudInstancesGateway();
    await gw.list(ref, { entityIds: ['a', 'b', 'c'] });

    expect(axios.post).toHaveBeenCalledWith(
      '/search/direct/Customer/1',
      {
        type: 'group',
        operator: 'OR',
        conditions: [
          { type: 'lifecycle', field: 'id', operation: 'EQUALS', value: 'a' },
          { type: 'lifecycle', field: 'id', operation: 'EQUALS', value: 'b' },
          { type: 'lifecycle', field: 'id', operation: 'EQUALS', value: 'c' },
        ],
      },
      expect.any(Object),
    );
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('throws TooManyEntityIdsError when >100 IDs are passed (no axios call)', async () => {
    const gw = new CloudInstancesGateway();
    const ids = Array.from({ length: 101 }, (_, i) => `id-${i}`);
    await expect(gw.list(ref, { entityIds: ids })).rejects.toBeInstanceOf(TooManyEntityIdsError);
    expect(axios.get).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('returns InstancesPage shape with items + hasMore from the response', async () => {
    (axios.get as any).mockResolvedValueOnce({
      data: {
        items: [{ id: 'e1', state: 'NEW' }, { id: 'e2', state: 'DONE' }],
        hasMore: true,
      },
    });
    const gw = new CloudInstancesGateway();
    const result = await gw.list(ref, { pageSize: 20, pageNumber: 1 });
    expect(result.hasMore).toBe(true);
    expect(result.items).toHaveLength(2);
  });
});
