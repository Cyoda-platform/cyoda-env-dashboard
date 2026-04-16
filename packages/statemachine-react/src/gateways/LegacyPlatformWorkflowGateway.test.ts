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
});
