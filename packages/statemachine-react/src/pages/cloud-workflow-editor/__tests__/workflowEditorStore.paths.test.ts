import { describe, it, expect, beforeEach } from 'vitest';
import { createWorkflowEditorStore } from '../workflowEditorStore';
import type { WorkflowDoc } from '../../../gateways';

const baseDoc: WorkflowDoc = {
  version: '1.0',
  name: 'wf',
  initialState: 'draft',
  states: {
    draft: { transitions: [{ name: 't1', next: 'review', manual: false }] },
    review: { transitions: [{ name: 't2', next: 'draft', manual: false }] },
  },
};

describe('workflowEditorStore — state mutations + path rewrites', () => {
  let store: ReturnType<typeof createWorkflowEditorStore>;
  beforeEach(() => { store = createWorkflowEditorStore(); store.getState().hydrate(baseDoc); });

  it('updateWorkflowProps patches the named fields and clears errors', () => {
    store.getState().setErrors([{ path: '/name', message: 'x' }]);
    store.getState().updateWorkflowProps({ name: 'renamed' });
    expect(store.getState().current!.name).toBe('renamed');
    expect(store.getState().errors).toEqual([]);
  });

  it('renameState renames the key and rewrites selectedPath/expandedPaths', () => {
    store.getState().setSelected('/states/draft/transitions/0');
    store.getState().toggleExpand('/states/draft');  // collapses (default-expanded)
    store.getState().toggleExpand('/states/draft');  // re-expand
    store.getState().renameState('draft', 'pending');
    expect('pending' in store.getState().current!.states).toBe(true);
    expect('draft' in store.getState().current!.states).toBe(false);
    expect(store.getState().selectedPath).toBe('/states/pending/transitions/0');
    expect(store.getState().expandedPaths.has('/states/pending')).toBe(true);
    expect(store.getState().expandedPaths.has('/states/draft')).toBe(false);
  });

  it('renameState cascades initialState if it pointed at the old name', () => {
    store.getState().renameState('draft', 'pending');
    expect(store.getState().current!.initialState).toBe('pending');
  });

  it('renameState does NOT cascade transition.next refs', () => {
    store.getState().renameState('review', 'audit');
    // draft.transitions[0].next was 'review' — should still be 'review' (now dangling)
    expect(store.getState().current!.states.draft.transitions![0].next).toBe('review');
  });

  it('addState inserts the state, selects it, and expands it', () => {
    store.getState().addState('archived');
    expect('archived' in store.getState().current!.states).toBe(true);
    expect(store.getState().selectedPath).toBe('/states/archived');
    expect(store.getState().expandedPaths.has('/states/archived')).toBe(true);
  });

  it('deleteState removes the state and any descendant paths from selection/expansion', () => {
    store.getState().setSelected('/states/draft/transitions/0');
    store.getState().deleteState('draft');
    expect('draft' in store.getState().current!.states).toBe(false);
    expect(store.getState().selectedPath).toBe('/');
    for (const p of store.getState().expandedPaths) {
      expect(p.startsWith('/states/draft')).toBe(false);
    }
  });

  it('any structural mutation clears errors', () => {
    store.getState().setErrors([{ path: '/name', message: 'x' }]);
    store.getState().addState('foo');
    expect(store.getState().errors).toEqual([]);
  });
});
