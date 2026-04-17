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
      undefined,
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

describe('CloudInstancesGateway.search', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('POSTs /search/direct/{entityName}/{modelVersion} with the criterion as the body', async () => {
    (axios.post as any).mockResolvedValueOnce({ data: { items: [{ id: 'e1' }], hasMore: false } });
    const gw = new CloudInstancesGateway();
    const criterion = { type: 'simple', jsonPath: '$.x', operation: 'EQUALS', value: 'y' };
    await gw.search(ref, criterion);
    expect(axios.post).toHaveBeenCalledWith(
      '/search/direct/Customer/1',
      criterion,
      undefined,
    );
  });

  it('passes limit and pointInTime as query params when provided', async () => {
    (axios.post as any).mockResolvedValueOnce({ data: { items: [], hasMore: false } });
    const gw = new CloudInstancesGateway();
    await gw.search(ref, {}, { limit: 50, pointInTime: '2026-04-17T00:00:00Z' });
    expect(axios.post).toHaveBeenCalledWith(
      '/search/direct/Customer/1',
      {},
      expect.objectContaining({ params: { limit: 50, pointInTime: '2026-04-17T00:00:00Z' } }),
    );
  });
});

describe('CloudInstancesGateway.load', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GETs /entity/{entityId} and extracts data + meta from the envelope', async () => {
    (axios.get as any).mockResolvedValueOnce({
      data: {
        type: 'ENTITY',
        data: { name: 'Acme' },
        meta: { id: 'eid', state: 'ACTIVE', creationDate: '2026-04-01T00:00:00Z' },
      },
    });
    const gw = new CloudInstancesGateway();
    const result = await gw.load('eid');
    expect(axios.get).toHaveBeenCalledWith('/entity/eid', undefined);
    expect(result.data).toEqual({ name: 'Acme' });
    expect(result.meta).toEqual({ id: 'eid', state: 'ACTIVE', creationDate: '2026-04-01T00:00:00Z' });
  });

  it('passes pointInTime and transactionId as query params', async () => {
    (axios.get as any).mockResolvedValueOnce({ data: { type: 'ENTITY', data: {}, meta: {} } });
    const gw = new CloudInstancesGateway();
    await gw.load('eid', { pointInTime: '2026-04-01T00:00:00Z', transactionId: 'tx1' });
    expect(axios.get).toHaveBeenCalledWith(
      '/entity/eid',
      expect.objectContaining({ params: { pointInTime: '2026-04-01T00:00:00Z', transactionId: 'tx1' } }),
    );
  });

  it('URL-encodes entityId', async () => {
    (axios.get as any).mockResolvedValueOnce({ data: { type: 'ENTITY', data: {}, meta: {} } });
    const gw = new CloudInstancesGateway();
    await gw.load('a/b');
    expect(axios.get).toHaveBeenCalledWith('/entity/a%2Fb', undefined);
  });
});

describe('CloudInstancesGateway.loadChanges', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GETs /entity/{entityId}/changes and maps response to EntityChange[]', async () => {
    (axios.get as any).mockResolvedValueOnce({
      data: [
        {
          transactionId: 'tx1',
          timestamp: '2026-04-01T00:00:00Z',
          user: 'demo.user',
          changeType: 'CREATE',
          stateFrom: null,
          stateTo: 'NEW',
        },
        {
          transactionId: 'tx2',
          timestamp: '2026-04-02T00:00:00Z',
          user: 'demo.user',
          changeType: 'UPDATE',
          stateFrom: 'NEW',
          stateTo: 'DONE',
        },
      ],
    });
    const gw = new CloudInstancesGateway();
    const changes = await gw.loadChanges('eid');
    expect(axios.get).toHaveBeenCalledWith('/entity/eid/changes', undefined);
    expect(changes).toHaveLength(2);
    expect(changes[0]).toEqual(expect.objectContaining({
      transactionId: 'tx1',
      timestamp: '2026-04-01T00:00:00Z',
      changeType: 'CREATE',
    }));
  });

  it('passes pointInTime as query param', async () => {
    (axios.get as any).mockResolvedValueOnce({ data: [] });
    const gw = new CloudInstancesGateway();
    await gw.loadChanges('eid', { pointInTime: '2026-04-01T00:00:00Z' });
    expect(axios.get).toHaveBeenCalledWith(
      '/entity/eid/changes',
      expect.objectContaining({ params: { pointInTime: '2026-04-01T00:00:00Z' } }),
    );
  });
});

describe('CloudInstancesGateway.fireTransition', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('PUTs /entity/JSON/{entityId}/{transition} with the body verbatim', async () => {
    (axios.put as any).mockResolvedValueOnce({ data: {} });
    const gw = new CloudInstancesGateway();
    const body = { foo: 'bar', baz: 42 };
    await gw.fireTransition('eid', 'submit', body);
    expect(axios.put).toHaveBeenCalledWith('/entity/JSON/eid/submit', body);
  });

  it('URL-encodes entityId and transition', async () => {
    (axios.put as any).mockResolvedValueOnce({ data: {} });
    const gw = new CloudInstancesGateway();
    await gw.fireTransition('a/b', 'go to next', {});
    expect(axios.put).toHaveBeenCalledWith('/entity/JSON/a%2Fb/go%20to%20next', {});
  });
});

describe('CloudInstancesGateway.delete', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('DELETEs /entity/{entityId}', async () => {
    (axios.delete as any).mockResolvedValueOnce({ data: undefined });
    const gw = new CloudInstancesGateway();
    await gw.delete('eid');
    expect(axios.delete).toHaveBeenCalledWith('/entity/eid');
  });
});
