import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LegacyPlatformWorkflowGateway } from './LegacyPlatformWorkflowGateway';

const storeApi = {
  getAllWorkflowsList: vi.fn(),
  getWorkflow: vi.fn(),
  postWorkflow: vi.fn(),
  putWorkflow: vi.fn(),
  deleteWorkflow: vi.fn(),
  copyWorkflow: vi.fn(),
};

vi.mock('../stores/statemachineStore', () => ({
  useStatemachineStore: {
    getState: () => storeApi,
  },
}));

describe('LegacyPlatformWorkflowGateway', () => {
  let gateway: LegacyPlatformWorkflowGateway;

  beforeEach(() => {
    Object.values(storeApi).forEach((m) => m.mockReset());
    gateway = new LegacyPlatformWorkflowGateway();
  });

  it('can be instantiated', () => {
    expect(gateway).toBeInstanceOf(LegacyPlatformWorkflowGateway);
  });

  describe('listWorkflows', () => {
    it('calls store.getAllWorkflowsList() and projects records to summaries with name=id', async () => {
      storeApi.getAllWorkflowsList.mockResolvedValueOnce({
        data: [
          { id: 'wf-1', name: 'Premium', entityClassName: 'Customer', active: true, persisted: true },
          { id: 'wf-2', name: 'Standard', entityClassName: 'Customer', active: false, persisted: true },
        ],
      });

      const result = await gateway.listWorkflows(null);

      expect(storeApi.getAllWorkflowsList).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([
        { name: 'wf-1', desc: undefined, active: true, initialState: '', criterion: undefined },
        { name: 'wf-2', desc: undefined, active: false, initialState: '', criterion: undefined },
      ]);
    });

    it('returns an empty array when the store returns non-array data', async () => {
      storeApi.getAllWorkflowsList.mockResolvedValueOnce({ data: null });

      const result = await gateway.listWorkflows(null);

      expect(result).toEqual([]);
    });
  });

  describe('deleteWorkflow', () => {
    it('calls store.deleteWorkflow(name) where name is the legacy id', async () => {
      storeApi.deleteWorkflow.mockResolvedValueOnce({ data: undefined });

      await gateway.deleteWorkflow(null, 'wf-42');

      expect(storeApi.deleteWorkflow).toHaveBeenCalledWith('wf-42');
    });

    it('propagates errors from the underlying store', async () => {
      storeApi.deleteWorkflow.mockRejectedValueOnce(new Error('forbidden'));

      await expect(gateway.deleteWorkflow(null, 'wf-42')).rejects.toThrow('forbidden');
    });
  });

  describe('copyWorkflow', () => {
    it('orchestrates copyWorkflow, getWorkflow, putWorkflow to set newName on the copy', async () => {
      storeApi.copyWorkflow.mockResolvedValueOnce({ data: { id: 'wf-copy' } });
      storeApi.getWorkflow.mockResolvedValueOnce({
        data: { id: 'wf-copy', name: 'Premium (copy)', entityClassName: 'Customer', active: true, persisted: true },
      });
      storeApi.putWorkflow.mockResolvedValueOnce({ data: undefined });

      await gateway.copyWorkflow(null, 'wf-source', 'PremiumDuplicate');

      expect(storeApi.copyWorkflow).toHaveBeenCalledWith('persisted', 'wf-source');
      expect(storeApi.getWorkflow).toHaveBeenCalledWith('persisted', 'wf-copy');
      expect(storeApi.putWorkflow).toHaveBeenCalledWith({
        id: 'wf-copy',
        name: 'PremiumDuplicate',
        entityClassName: 'Customer',
        active: true,
        persisted: true,
      });
    });

    it('propagates errors from any step of the orchestration', async () => {
      storeApi.copyWorkflow.mockRejectedValueOnce(new Error('copy failed'));

      await expect(gateway.copyWorkflow(null, 'wf-source', 'NewName')).rejects.toThrow(
        'copy failed'
      );

      expect(storeApi.getWorkflow).not.toHaveBeenCalled();
      expect(storeApi.putWorkflow).not.toHaveBeenCalled();
    });
  });
});
