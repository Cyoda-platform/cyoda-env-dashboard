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
    (axios.get as any).mockResolvedValueOnce({ data: [] });
    const gw = new CloudInstancesGateway();
    await gw.list(ref, { pageSize: 20, pageNumber: 0 });
    expect(axios.get).toHaveBeenCalledWith(
      '/entity/Customer/1',
      expect.objectContaining({ params: expect.objectContaining({ pageSize: 20, pageNumber: 0 }) }),
    );
  });

  it('with entityIds: falls through to /search/direct with synthesized OR-of-EQUALS group', async () => {
    (axios.post as any).mockResolvedValueOnce({ data: [] });
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

  it('returns InstancesPage shape with items mapped from envelopes', async () => {
    (axios.get as any).mockResolvedValueOnce({
      data: [
        { type: 'ENTITY', data: {}, meta: { id: 'e1', state: 'NEW' } },
        { type: 'ENTITY', data: {}, meta: { id: 'e2', state: 'DONE' } },
      ],
    });
    const gw = new CloudInstancesGateway();
    const result = await gw.list(ref, { pageSize: 20, pageNumber: 0 });
    // hasMore is true iff items.length === pageSize. With pageSize=20 and 2 items, hasMore is false.
    expect(result.hasMore).toBe(false);
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toEqual(expect.objectContaining({ entityId: 'e1', state: 'NEW' }));
  });

  it('hasMore is true when items.length equals pageSize', async () => {
    (axios.get as any).mockResolvedValueOnce({
      data: Array.from({ length: 20 }, (_, i) => ({ type: 'ENTITY', data: {}, meta: { id: `e${i}`, state: 'NEW' } })),
    });
    const gw = new CloudInstancesGateway();
    const result = await gw.list(ref, { pageSize: 20, pageNumber: 0 });
    expect(result.hasMore).toBe(true);
    expect(result.items).toHaveLength(20);
  });
});

describe('CloudInstancesGateway.search', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('POSTs /search/direct/{entityName}/{modelVersion} with the criterion as the body', async () => {
    (axios.post as any).mockResolvedValueOnce({ data: [{ type: 'ENTITY', data: {}, meta: { id: 'e1' } }] });
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
    (axios.post as any).mockResolvedValueOnce({ data: [] });
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

  it('GETs /entity/{entityId}/changes and maps timeOfChange→timestamp, passes fieldsChangedCount', async () => {
    (axios.get as any).mockResolvedValueOnce({
      data: [
        {
          transactionId: 'tx1',
          timeOfChange: '2026-04-11T00:43:28.307Z',
          user: 'USER_EXTERNAL|4f1b06ec',
          changeType: 'CREATE',
          fieldsChangedCount: 53,
        },
        {
          transactionId: 'tx2',
          timeOfChange: '2026-04-12T00:00:00Z',
          user: 'demo.user',
          changeType: 'UPDATE',
        },
      ],
    });
    const gw = new CloudInstancesGateway();
    const changes = await gw.loadChanges('eid');
    expect(axios.get).toHaveBeenCalledWith('/entity/eid/changes', undefined);
    expect(changes).toHaveLength(2);
    expect(changes[0]).toEqual(expect.objectContaining({
      transactionId: 'tx1',
      timestamp: '2026-04-11T00:43:28.307Z',
      changeType: 'CREATE',
      fieldsChangedCount: 53,
    }));
    // stateFrom/stateTo are NOT present
    expect(changes[0]).not.toHaveProperty('stateFrom');
    expect(changes[0]).not.toHaveProperty('stateTo');
    // fieldsChangedCount undefined when not present in response
    expect(changes[1].fieldsChangedCount).toBeUndefined();
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

describe('CloudInstancesGateway.loadAuditEvents', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GETs /audit/entity/{entityId} without params when none provided', async () => {
    (axios.get as any).mockResolvedValueOnce({
      data: { items: [], pagination: { hasNext: false } },
    });
    const gw = new CloudInstancesGateway();
    const result = await gw.loadAuditEvents('eid');
    expect(axios.get).toHaveBeenCalledWith('/audit/entity/eid', undefined);
    expect(result).toEqual({ items: [], hasNext: false, nextCursor: undefined });
  });

  it('passes cursor, limit, severity as query params', async () => {
    (axios.get as any).mockResolvedValueOnce({
      data: { items: [], pagination: { hasNext: false } },
    });
    const gw = new CloudInstancesGateway();
    await gw.loadAuditEvents('eid', { cursor: 'c1', limit: 50, severity: 'DEBUG' });
    expect(axios.get).toHaveBeenCalledWith(
      '/audit/entity/eid',
      expect.objectContaining({ params: { cursor: 'c1', limit: 50, severity: 'DEBUG' } }),
    );
  });

  it('passes transactionId to scope events to a single transaction', async () => {
    (axios.get as any).mockResolvedValueOnce({
      data: { items: [], pagination: { hasNext: false } },
    });
    const gw = new CloudInstancesGateway();
    await gw.loadAuditEvents('eid', { transactionId: 'tx-1', severity: 'DEBUG' });
    expect(axios.get).toHaveBeenCalledWith(
      '/audit/entity/eid',
      expect.objectContaining({ params: { severity: 'DEBUG', transactionId: 'tx-1' } }),
    );
  });

  it('maps pagination.hasNext and nextCursor correctly', async () => {
    (axios.get as any).mockResolvedValueOnce({
      data: {
        items: [
          {
            auditEventType: 'StateMachine',
            severity: 'INFO',
            utcTime: '2026-04-11T00:43:33.886Z',
            transactionId: 'tx-abc',
            actor: { name: 'USER_EXTERNAL|x', externalId: 'x' },
            state: 'SIGNED',
            eventType: 'FINISHED',
            details: 'State machine finished',
          },
        ],
        pagination: { hasNext: true, nextCursor: 'cursor-next' },
      },
    });
    const gw = new CloudInstancesGateway();
    const result = await gw.loadAuditEvents('eid', { severity: 'INFO', limit: 10 });
    expect(result.hasNext).toBe(true);
    expect(result.nextCursor).toBe('cursor-next');
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      auditEventType: 'StateMachine',
      severity: 'INFO',
      transactionId: 'tx-abc',
    });
  });

  it('URL-encodes entityId', async () => {
    (axios.get as any).mockResolvedValueOnce({ data: { items: [], pagination: {} } });
    const gw = new CloudInstancesGateway();
    await gw.loadAuditEvents('a/b');
    expect(axios.get).toHaveBeenCalledWith('/audit/entity/a%2Fb', undefined);
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

describe('CloudInstancesGateway.fireLoopback', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('PUTs /entity/JSON/{entityId} with no transition path segment', async () => {
    (axios.put as any).mockResolvedValueOnce({ data: {} });
    const gw = new CloudInstancesGateway();
    const body = { foo: 'bar' };
    await gw.fireLoopback('eid', body);
    expect(axios.put).toHaveBeenCalledWith('/entity/JSON/eid', body);
  });

  it('URL-encodes entityId', async () => {
    (axios.put as any).mockResolvedValueOnce({ data: {} });
    const gw = new CloudInstancesGateway();
    await gw.fireLoopback('a/b', {});
    expect(axios.put).toHaveBeenCalledWith('/entity/JSON/a%2Fb', {});
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
