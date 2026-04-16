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

  describe('saveWorkflow (MERGE — active-flag toggle)', () => {
    it('loads the legacy record and writes it back with active overridden by doc.active', async () => {
      storeApi.getWorkflow.mockResolvedValueOnce({
        data: {
          id: 'wf-7',
          name: 'Premium',
          entityClassName: 'Customer',
          active: true,
          persisted: true,
          owner: 'someone',
        },
      });
      storeApi.putWorkflow.mockResolvedValueOnce({ data: undefined });

      const doc = {
        version: '1.0',
        name: 'wf-7',
        initialState: 's',
        active: false,
        states: { s: { transitions: [] } },
      };

      await gateway.saveWorkflow(null, doc, 'MERGE');

      expect(storeApi.getWorkflow).toHaveBeenCalledWith('persisted', 'wf-7');
      expect(storeApi.putWorkflow).toHaveBeenCalledWith({
        id: 'wf-7',
        name: 'Premium',
        entityClassName: 'Customer',
        active: false,
        persisted: true,
        owner: 'someone',
      });
    });

    it('defaults active to true if doc.active is undefined', async () => {
      storeApi.getWorkflow.mockResolvedValueOnce({
        data: { id: 'wf-7', name: 'Premium', entityClassName: 'Customer', active: false, persisted: true },
      });
      storeApi.putWorkflow.mockResolvedValueOnce({ data: undefined });

      const doc = {
        version: '1.0',
        name: 'wf-7',
        initialState: 's',
        states: { s: { transitions: [] } },
      };

      await gateway.saveWorkflow(null, doc, 'MERGE');

      expect(storeApi.putWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'wf-7', active: true })
      );
    });
  });

  describe('renameWorkflow', () => {
    it('orchestrates copyWorkflow then deleteWorkflow', async () => {
      storeApi.copyWorkflow.mockResolvedValueOnce({ data: { id: 'wf-new' } });
      storeApi.getWorkflow.mockResolvedValueOnce({
        data: { id: 'wf-new', name: 'autogen', entityClassName: 'Customer', active: true, persisted: true },
      });
      storeApi.putWorkflow.mockResolvedValueOnce({ data: undefined });
      storeApi.deleteWorkflow.mockResolvedValueOnce({ data: undefined });

      await gateway.renameWorkflow(null, 'wf-old', 'NewDisplayName');

      expect(storeApi.copyWorkflow).toHaveBeenCalledWith('persisted', 'wf-old');
      expect(storeApi.getWorkflow).toHaveBeenCalledWith('persisted', 'wf-new');
      expect(storeApi.putWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'wf-new', name: 'NewDisplayName' })
      );
      expect(storeApi.deleteWorkflow).toHaveBeenCalledWith('wf-old');
    });

    it('throws RenameIncompleteError if the delete-old step fails after copy succeeded', async () => {
      storeApi.copyWorkflow.mockResolvedValueOnce({ data: { id: 'wf-new' } });
      storeApi.getWorkflow.mockResolvedValueOnce({
        data: { id: 'wf-new', name: 'autogen', entityClassName: 'Customer', active: true, persisted: true },
      });
      storeApi.putWorkflow.mockResolvedValueOnce({ data: undefined });
      const cause = new Error('delete forbidden');
      storeApi.deleteWorkflow.mockRejectedValueOnce(cause);

      await expect(gateway.renameWorkflow(null, 'wf-old', 'NewName')).rejects.toMatchObject({
        name: 'RenameIncompleteError',
        oldName: 'wf-old',
        newName: 'NewName',
        cause,
      });
    });

    it('propagates copy errors directly when copy fails', async () => {
      storeApi.copyWorkflow.mockRejectedValueOnce(new Error('copy denied'));

      await expect(gateway.renameWorkflow(null, 'wf-old', 'NewName')).rejects.toThrow('copy denied');
      expect(storeApi.deleteWorkflow).not.toHaveBeenCalled();
    });
  });
});
