import { describe, it, expect, beforeEach } from 'vitest';
import { createWorkflowEditorStore } from '../workflowEditorStore';
import type { WorkflowDoc } from '../../../gateways';

const docA: WorkflowDoc = {
  version: '1.0',
  name: 'A',
  initialState: 'draft',
  states: { draft: { transitions: [{ name: 't', next: 'draft', manual: false }] } },
};

const docB: WorkflowDoc = {
  ...docA,
  name: 'B',
  states: { review: { transitions: [] } },
  initialState: 'review',
};

describe('workflowEditorStore — hydrate / errors', () => {
  let store: ReturnType<typeof createWorkflowEditorStore>;
  beforeEach(() => {
    store = createWorkflowEditorStore();
  });

  it('hydrate sets pristine, current, and clears errors', () => {
    store.getState().setErrors([{ path: '/x', message: 'pre' }]);
    store.getState().hydrate(docA);
    const s = store.getState();
    expect(s.pristine).toEqual(docA);
    expect(s.current).toEqual(docA);
    expect(s.errors).toEqual([]);
  });

  it('setErrors stores them; setErrors([]) clears them', () => {
    store.getState().hydrate(docA);
    store.getState().setErrors([{ path: '/name', message: 'x' }]);
    expect(store.getState().errors).toHaveLength(1);
    store.getState().setErrors([]);
    expect(store.getState().errors).toEqual([]);
  });
});

describe('workflowEditorStore — processors / criterion / reset', () => {
  let store: ReturnType<typeof createWorkflowEditorStore>;
  beforeEach(() => { store = createWorkflowEditorStore(); store.getState().hydrate(docA); });

  it('addProcessor appends and clears errors', () => {
    store.getState().setErrors([{ path: '/x', message: 'y' }]);
    store.getState().addProcessor('draft', 0, { type: 'externalized', name: 'p' });
    expect(store.getState().current!.states.draft.transitions![0].processors).toEqual([
      { type: 'externalized', name: 'p' },
    ]);
    expect(store.getState().errors).toEqual([]);
  });

  it('updateProcessor patches the processor at the path', () => {
    store.getState().addProcessor('draft', 0, { type: 'externalized', name: 'p' });
    store.getState().updateProcessor('draft', 0, 0, { name: 'renamed' });
    expect(store.getState().current!.states.draft.transitions![0].processors![0].name).toBe('renamed');
  });

  it('deleteProcessor removes the processor at the index', () => {
    store.getState().addProcessor('draft', 0, { type: 'externalized', name: 'p1' });
    store.getState().addProcessor('draft', 0, { type: 'externalized', name: 'p2' });
    store.getState().deleteProcessor('draft', 0, 0);
    expect(store.getState().current!.states.draft.transitions![0].processors).toEqual([
      { type: 'externalized', name: 'p2' },
    ]);
  });

  it('setTransitionCriterion sets and undefined-clears the criterion', () => {
    store.getState().setTransitionCriterion('draft', 0, { type: 'simple', jsonPath: '$.x', operation: 'EQUALS', value: 'y' } as any);
    expect(store.getState().current!.states.draft.transitions![0].criterion).toEqual({
      type: 'simple', jsonPath: '$.x', operation: 'EQUALS', value: 'y',
    });
    store.getState().setTransitionCriterion('draft', 0, undefined);
    expect(store.getState().current!.states.draft.transitions![0].criterion).toBeUndefined();
    expect('criterion' in store.getState().current!.states.draft.transitions![0]).toBe(false);
  });

  it('resetToPristine restores the doc and clears errors', () => {
    store.getState().updateWorkflowProps({ name: 'changed' });
    store.getState().setErrors([{ path: '/name', message: 'err' }]);
    store.getState().resetToPristine();
    expect(store.getState().current).toEqual(docA);
    expect(store.getState().errors).toEqual([]);
  });
});
