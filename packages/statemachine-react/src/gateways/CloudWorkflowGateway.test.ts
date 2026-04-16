import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CloudWorkflowGateway } from './CloudWorkflowGateway';

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
});
