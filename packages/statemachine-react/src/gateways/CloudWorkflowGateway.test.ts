import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CloudWorkflowGateway } from './CloudWorkflowGateway';
import { MustHaveActiveWorkflowError, WorkflowNotFoundError } from './errors';

vi.mock('@cyoda/http-api-react', () => ({
  axios: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const { axios } = await import('@cyoda/http-api-react');
const mockedAxios = axios as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

describe('CloudWorkflowGateway', () => {
  let gateway: CloudWorkflowGateway;

  beforeEach(() => {
    vi.clearAllMocks();
    gateway = new CloudWorkflowGateway();
  });

  it('can be instantiated', () => {
    expect(gateway).toBeInstanceOf(CloudWorkflowGateway);
  });

  describe('listWorkflows', () => {
    it('GETs the export endpoint and projects workflows[] to summaries', async () => {
      const exportResponse = {
        entityName: 'Customer',
        modelVersion: 1,
        workflows: [
          {
            version: '1.0',
            name: 'Premium',
            desc: 'Premium customers',
            initialState: 'draft',
            active: true,
            criterion: { type: 'simple', jsonPath: '$.t', operation: 'EQUALS', value: 'premium' },
            states: { draft: { transitions: [] } },
          },
          {
            version: '1.0',
            name: 'Standard',
            initialState: 'pending',
            active: false,
            states: { pending: { transitions: [] } },
          },
        ],
      };
      (axios.get as any).mockResolvedValueOnce({ data: exportResponse });

      const result = await gateway.listWorkflows({ entityName: 'Customer', modelVersion: 1 });

      expect(axios.get).toHaveBeenCalledWith(
        '/model/Customer/1/workflow/export'
      );
      expect(result).toEqual([
        {
          name: 'Premium',
          desc: 'Premium customers',
          active: true,
          initialState: 'draft',
          criterion: { type: 'simple', jsonPath: '$.t', operation: 'EQUALS', value: 'premium' },
        },
        {
          name: 'Standard',
          desc: undefined,
          active: false,
          initialState: 'pending',
          criterion: undefined,
        },
      ]);
    });

    it('URL-encodes entityName segments', async () => {
      (axios.get as any).mockResolvedValueOnce({
        data: { entityName: 'Some/Class', modelVersion: 2, workflows: [] },
      });

      await gateway.listWorkflows({ entityName: 'Some/Class', modelVersion: 2 });

      expect(axios.get).toHaveBeenCalledWith('/model/Some%2FClass/2/workflow/export');
    });

    it('throws if modelRef is null', async () => {
      await expect(gateway.listWorkflows(null)).rejects.toThrow(
        /modelRef is required/i
      );
    });
  });

  describe('loadWorkflow', () => {
    const exportResponse = {
      entityName: 'Customer',
      modelVersion: 1,
      workflows: [
        { version: '1.0', name: 'Premium', initialState: 'draft', states: {} },
        { version: '1.0', name: 'Standard', initialState: 'pending', states: {} },
      ],
    };

    it('GETs the export endpoint and returns the matching workflow', async () => {
      (axios.get as any).mockResolvedValueOnce({ data: exportResponse });

      const result = await gateway.loadWorkflow(
        { entityName: 'Customer', modelVersion: 1 },
        'Standard'
      );

      expect(axios.get).toHaveBeenCalledWith('/model/Customer/1/workflow/export');
      expect(result).toEqual({
        version: '1.0',
        name: 'Standard',
        initialState: 'pending',
        states: {},
      });
    });

    it('throws if no workflow with that name exists in the model', async () => {
      (axios.get as any).mockResolvedValueOnce({ data: exportResponse });

      await expect(
        gateway.loadWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'NoSuchOne')
      ).rejects.toThrow(/NoSuchOne/);
    });

    it('throws if modelRef is null', async () => {
      await expect(gateway.loadWorkflow(null, 'X')).rejects.toThrow(
        /modelRef is required/i
      );
    });
  });

  describe('saveWorkflow (MERGE)', () => {
    it('POSTs to the import endpoint with importMode MERGE and a single-element workflows array', async () => {
      (axios.post as any).mockResolvedValueOnce({ data: undefined });

      const doc = {
        version: '1.0',
        name: 'NewOne',
        initialState: 'draft',
        active: true,
        states: { draft: { transitions: [] } },
      };

      const result = await gateway.saveWorkflow({ entityName: 'Customer', modelVersion: 1 }, doc, 'MERGE');

      expect(axios.post).toHaveBeenCalledWith(
        '/model/Customer/1/workflow/import',
        { importMode: 'MERGE', workflows: [doc] }
      );
      expect(result).toEqual({ key: 'NewOne' });
    });

    it('throws if modelRef is null', async () => {
      const doc = { version: '1.0', name: 'X', initialState: 's', states: {} };

      await expect(gateway.saveWorkflow(null, doc, 'MERGE')).rejects.toThrow(
        /modelRef is required/i
      );
    });
  });

  describe('deleteWorkflow', () => {
    const twoWorkflows = {
      entityName: 'Customer',
      modelVersion: 1,
      workflows: [
        { version: '1.0', name: 'KeepMe', initialState: 's', active: true, states: { s: { transitions: [] } } },
        { version: '1.0', name: 'DeleteMe', initialState: 's', active: true, states: { s: { transitions: [] } } },
      ],
    };

    it('exports, filters out the target, and POSTs REPLACE with the remaining workflows', async () => {
      (axios.get as any).mockResolvedValueOnce({ data: twoWorkflows });
      (axios.post as any).mockResolvedValueOnce({ data: undefined });

      await gateway.deleteWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'DeleteMe');

      expect(axios.get).toHaveBeenCalledWith('/model/Customer/1/workflow/export');
      expect(axios.post).toHaveBeenCalledWith('/model/Customer/1/workflow/import', {
        importMode: 'REPLACE',
        workflows: [twoWorkflows.workflows[0]],
      });
    });

    it('throws MustHaveActiveWorkflowError when deleting would leave no active workflows', async () => {
      // Single workflow, active. Deleting it would leave 0 active.
      (axios.get as any).mockResolvedValueOnce({
        data: { entityName: 'Customer', modelVersion: 1, workflows: [{ ...twoWorkflows.workflows[1], active: true }] },
      });

      await expect(
        gateway.deleteWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'DeleteMe')
      ).rejects.toThrow(MustHaveActiveWorkflowError);

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('allows deleting an inactive workflow when at least one other is active', async () => {
      const data = {
        entityName: 'Customer',
        modelVersion: 1,
        workflows: [
          { version: '1.0', name: 'KeepMeActive', initialState: 's', active: true, states: { s: { transitions: [] } } },
          { version: '1.0', name: 'DeleteMe', initialState: 's', active: false, states: { s: { transitions: [] } } },
        ],
      };
      (axios.get as any).mockResolvedValueOnce({ data });
      (axios.post as any).mockResolvedValueOnce({ data: undefined });

      await gateway.deleteWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'DeleteMe');

      expect(axios.post).toHaveBeenCalledWith('/model/Customer/1/workflow/import', {
        importMode: 'REPLACE',
        workflows: [data.workflows[0]],
      });
    });

    it('blocks deleting the only active workflow even when other inactive workflows exist', async () => {
      // 2 workflows: one active (target), one inactive. Deleting target → 0 active.
      (axios.get as any).mockResolvedValueOnce({
        data: {
          entityName: 'Customer',
          modelVersion: 1,
          workflows: [
            { version: '1.0', name: 'DeleteMe', initialState: 's', active: true, states: { s: { transitions: [] } } },
            { version: '1.0', name: 'StillInactive', initialState: 's', active: false, states: { s: { transitions: [] } } },
          ],
        },
      });

      await expect(
        gateway.deleteWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'DeleteMe')
      ).rejects.toThrow(MustHaveActiveWorkflowError);

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('treats a missing target as a no-op when an active workflow remains', async () => {
      (axios.get as any).mockResolvedValueOnce({
        data: { entityName: 'Customer', modelVersion: 1, workflows: [twoWorkflows.workflows[0]] },
      });

      // The "target" doesn't exist; the remaining set is the full set (KeepMe, active), so just no-op.
      await gateway.deleteWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'NoSuchWorkflow');

      // Should NOT POST when there is nothing to remove (filter result equals original).
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('throws if modelRef is null', async () => {
      await expect(gateway.deleteWorkflow(null, 'X')).rejects.toThrow(/modelRef is required/i);
    });
  });

  describe('saveWorkflow active-flag invariant', () => {
    it('throws MustHaveActiveWorkflowError when MERGE would orphan the model', async () => {
      // The workflow being saved is going active=false; no other active workflow.
      (axios.get as any).mockResolvedValueOnce({
        data: {
          entityName: 'Customer',
          modelVersion: 1,
          workflows: [
            { version: '1.0', name: 'OnlyActive', initialState: 's', active: true, states: { s: { transitions: [] } } },
            { version: '1.0', name: 'AlreadyInactive', initialState: 's', active: false, states: { s: { transitions: [] } } },
          ],
        },
      });

      const doc = {
        version: '1.0',
        name: 'OnlyActive',
        initialState: 's',
        active: false,
        states: { s: { transitions: [] } },
      };

      await expect(
        gateway.saveWorkflow({ entityName: 'Customer', modelVersion: 1 }, doc, 'MERGE')
      ).rejects.toThrow(MustHaveActiveWorkflowError);

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('allows MERGE with active=false when another workflow remains active', async () => {
      (axios.get as any).mockResolvedValueOnce({
        data: {
          entityName: 'Customer',
          modelVersion: 1,
          workflows: [
            { version: '1.0', name: 'OneActive', initialState: 's', active: true, states: { s: { transitions: [] } } },
            { version: '1.0', name: 'TwoActive', initialState: 's', active: true, states: { s: { transitions: [] } } },
          ],
        },
      });
      (axios.post as any).mockResolvedValueOnce({ data: undefined });

      const doc = {
        version: '1.0',
        name: 'OneActive',
        initialState: 's',
        active: false,
        states: { s: { transitions: [] } },
      };

      const result = await gateway.saveWorkflow({ entityName: 'Customer', modelVersion: 1 }, doc, 'MERGE');

      expect(result).toEqual({ key: 'OneActive' });
      expect(axios.post).toHaveBeenCalledWith('/model/Customer/1/workflow/import', {
        importMode: 'MERGE',
        workflows: [doc],
      });
    });

    it('does not fetch when active is true (no invariant check needed)', async () => {
      (axios.post as any).mockResolvedValueOnce({ data: undefined });

      const doc = {
        version: '1.0',
        name: 'NewlyActive',
        initialState: 's',
        active: true,
        states: { s: { transitions: [] } },
      };

      await gateway.saveWorkflow({ entityName: 'Customer', modelVersion: 1 }, doc, 'MERGE');

      // No GET — the active invariant only fires when active=false.
      expect(axios.get).not.toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledOnce();
    });

    it('does not fetch when active is undefined (no invariant check needed)', async () => {
      (axios.post as any).mockResolvedValueOnce({ data: undefined });

      const doc = {
        version: '1.0',
        name: 'NoActiveSpecified',
        initialState: 's',
        states: { s: { transitions: [] } },
      };

      await gateway.saveWorkflow({ entityName: 'Customer', modelVersion: 1 }, doc, 'MERGE');

      expect(axios.get).not.toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledOnce();
    });
  });

  describe('copyWorkflow', () => {
    const exportResponse = {
      entityName: 'Customer',
      modelVersion: 1,
      workflows: [
        {
          version: '1.0',
          name: 'Premium',
          desc: 'orig',
          initialState: 's',
          active: true,
          states: { s: { transitions: [{ name: 't', next: 's', manual: true }] } },
        },
        { version: '1.0', name: 'Standard', initialState: 's', states: { s: { transitions: [] } } },
      ],
    };

    it('exports, clones the source under the new name, and MERGE-saves the clone', async () => {
      (axios.get as any).mockResolvedValueOnce({ data: exportResponse });
      (axios.post as any).mockResolvedValueOnce({ data: undefined });

      const result = await gateway.copyWorkflow(
        { entityName: 'Customer', modelVersion: 1 },
        'Premium',
        'PremiumCopy'
      );

      expect(axios.get).toHaveBeenCalledWith('/model/Customer/1/workflow/export');
      const expectedClone = {
        ...exportResponse.workflows[0],
        name: 'PremiumCopy',
      };
      expect(axios.post).toHaveBeenCalledWith('/model/Customer/1/workflow/import', {
        importMode: 'MERGE',
        workflows: [expectedClone],
      });
      expect(result).toEqual({ key: 'PremiumCopy' });
    });

    it('throws if newName is not unique within the model', async () => {
      (axios.get as any).mockResolvedValueOnce({ data: exportResponse });

      await expect(
        gateway.copyWorkflow(
          { entityName: 'Customer', modelVersion: 1 },
          'Premium',
          'Standard'
        )
      ).rejects.toThrow(/already exists/i);

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('throws if the source workflow does not exist', async () => {
      (axios.get as any).mockResolvedValueOnce({ data: exportResponse });

      await expect(
        gateway.copyWorkflow(
          { entityName: 'Customer', modelVersion: 1 },
          'NoSuchSource',
          'AnyName'
        )
      ).rejects.toThrow(/NoSuchSource/);

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('throws if modelRef is null', async () => {
      await expect(gateway.copyWorkflow(null, 'a', 'b')).rejects.toThrow(/modelRef is required/i);
    });
  });

  describe('renameWorkflow', () => {
    const onlyOne = {
      entityName: 'Customer',
      modelVersion: 1,
      workflows: [
        { version: '1.0', name: 'Old', initialState: 's', active: true, states: { s: { transitions: [] } } },
      ],
    };

    it('orchestrates copy(old → new) then delete(old) and tolerates the >=1 invariant on a single-workflow model', async () => {
      // 1st call: export for copy()
      (axios.get as any).mockResolvedValueOnce({ data: onlyOne });
      // 2nd call: post for copy() (MERGE)
      (axios.post as any).mockResolvedValueOnce({ data: undefined });
      // 3rd call: export for delete() — now both exist
      (axios.get as any).mockResolvedValueOnce({
        data: {
          ...onlyOne,
          workflows: [...onlyOne.workflows, { ...onlyOne.workflows[0], name: 'New' }],
        },
      });
      // 4th call: post for delete() (REPLACE, with only "New" remaining)
      (axios.post as any).mockResolvedValueOnce({ data: undefined });

      await gateway.renameWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'Old', 'New');

      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(axios.post).toHaveBeenCalledTimes(2);
      // Copy POST
      expect(axios.post).toHaveBeenNthCalledWith(1, '/model/Customer/1/workflow/import', {
        importMode: 'MERGE',
        workflows: [{ ...onlyOne.workflows[0], name: 'New' }],
      });
      // Delete POST (REPLACE keeps only New)
      expect(axios.post).toHaveBeenNthCalledWith(2, '/model/Customer/1/workflow/import', {
        importMode: 'REPLACE',
        workflows: [{ ...onlyOne.workflows[0], name: 'New' }],
      });
    });

    it('throws RenameIncompleteError when copy succeeds but delete fails', async () => {
      // copy: export OK, post OK
      (axios.get as any).mockResolvedValueOnce({ data: onlyOne });
      (axios.post as any).mockResolvedValueOnce({ data: undefined });
      // delete: export OK, post REJECTS
      (axios.get as any).mockResolvedValueOnce({
        data: {
          ...onlyOne,
          workflows: [...onlyOne.workflows, { ...onlyOne.workflows[0], name: 'New' }],
        },
      });
      const networkError = new Error('network down');
      (axios.post as any).mockRejectedValueOnce(networkError);

      await expect(
        gateway.renameWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'Old', 'New')
      ).rejects.toMatchObject({
        name: 'RenameIncompleteError',
        oldName: 'Old',
        newName: 'New',
        cause: networkError,
      });
    });

    it('propagates copy errors directly (no RenameIncompleteError) when copy fails', async () => {
      // copy export OK, but newName clashes with an existing workflow
      (axios.get as any).mockResolvedValueOnce({
        data: {
          ...onlyOne,
          workflows: [...onlyOne.workflows, { ...onlyOne.workflows[0], name: 'New' }],
        },
      });

      await expect(
        gateway.renameWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'Old', 'New')
      ).rejects.toThrow(/already exists/i);

      // Should not have attempted any POST.
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('throws if modelRef is null', async () => {
      await expect(gateway.renameWorkflow(null, 'a', 'b')).rejects.toThrow(/modelRef is required/i);
    });

    it('is a no-op when oldName equals newName', async () => {
      await gateway.renameWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'Same', 'Same');

      expect(axios.get).not.toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
    });
  });
});

describe('CloudWorkflowGateway loadWorkflow — typed not-found error', () => {
  it('throws WorkflowNotFoundError when the named workflow is missing', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { entityName: 'Customer', modelVersion: 1, workflows: [] },
    } as any);
    const gw = new CloudWorkflowGateway();
    await expect(
      gw.loadWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'missing'),
    ).rejects.toBeInstanceOf(WorkflowNotFoundError);
  });

  it('preserves the legacy message string for callers that match on it', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { entityName: 'Customer', modelVersion: 1, workflows: [] },
    } as any);
    const gw = new CloudWorkflowGateway();
    await expect(
      gw.loadWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'missing'),
    ).rejects.toThrow(/Workflow "missing" not found in model Customer v1/);
  });
});
