import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CloudWorkflowGateway } from './CloudWorkflowGateway';
import { CannotDeleteLastWorkflowError } from './errors';

vi.mock('@cyoda/http-api-react', () => ({
  axios: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const { axios } = await import('@cyoda/http-api-react');

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

      await gateway.saveWorkflow({ entityName: 'Customer', modelVersion: 1 }, doc, 'MERGE');

      expect(axios.post).toHaveBeenCalledWith(
        '/model/Customer/1/workflow/import',
        { importMode: 'MERGE', workflows: [doc] }
      );
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
        { version: '1.0', name: 'KeepMe', initialState: 's', states: { s: { transitions: [] } } },
        { version: '1.0', name: 'DeleteMe', initialState: 's', states: { s: { transitions: [] } } },
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

    it('throws CannotDeleteLastWorkflowError when only the target workflow exists', async () => {
      (axios.get as any).mockResolvedValueOnce({
        data: { entityName: 'Customer', modelVersion: 1, workflows: [twoWorkflows.workflows[1]] },
      });

      await expect(
        gateway.deleteWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'DeleteMe')
      ).rejects.toThrow(CannotDeleteLastWorkflowError);

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('treats a missing target as a no-op delete (still throws if it would empty the model)', async () => {
      (axios.get as any).mockResolvedValueOnce({
        data: { entityName: 'Customer', modelVersion: 1, workflows: [twoWorkflows.workflows[0]] },
      });

      // The "target" doesn't exist; the remaining set is the full set; that's >= 1, so just no-op.
      await gateway.deleteWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'NoSuchWorkflow');

      // Should NOT POST when there is nothing to remove (filter result equals original).
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('throws if modelRef is null', async () => {
      await expect(gateway.deleteWorkflow(null, 'X')).rejects.toThrow(/modelRef is required/i);
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

      await gateway.copyWorkflow(
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
});
