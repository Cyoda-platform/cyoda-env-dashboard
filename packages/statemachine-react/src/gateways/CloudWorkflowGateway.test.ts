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
});
