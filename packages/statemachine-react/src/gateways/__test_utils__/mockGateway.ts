/**
 * Test helper: build a `WorkflowGateway` mock with vi.fn() stubs for every
 * method, optionally overriding specific methods.
 *
 * Use in tests that mock `getWorkflowGateway`:
 *
 *   import { makeMockGateway } from '../gateways/__test_utils__/mockGateway';
 *
 *   const listWorkflows = vi.fn().mockResolvedValue([...]);
 *   vi.mocked(getWorkflowGateway).mockReturnValue(makeMockGateway({ listWorkflows }));
 *
 * Centralizing the default mock surface means: (a) when the WorkflowGateway
 * interface gains a method, only this helper needs the new stub; (b) test
 * sites name only the methods they actually exercise; (c) typing on overrides
 * is preserved.
 */

import { vi } from 'vitest';
import type { WorkflowGateway } from '../WorkflowGateway';

export function makeMockGateway(
  overrides: Partial<WorkflowGateway> = {}
): WorkflowGateway {
  const base: WorkflowGateway = {
    listWorkflows: vi.fn(),
    loadWorkflow: vi.fn(),
    saveWorkflow: vi.fn(),
    deleteWorkflow: vi.fn(),
    copyWorkflow: vi.fn(),
    renameWorkflow: vi.fn(),
  };
  return { ...base, ...overrides };
}
