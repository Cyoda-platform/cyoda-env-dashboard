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

describe('workflowEditorStore — hydrate / selection / expansion / errors', () => {
  let store: ReturnType<typeof createWorkflowEditorStore>;
  beforeEach(() => {
    store = createWorkflowEditorStore();
  });

  it('hydrate sets pristine, current, default selection "/" and expands "/" + first state', () => {
    store.getState().hydrate(docA);
    const s = store.getState();
    expect(s.pristine).toEqual(docA);
    expect(s.current).toEqual(docA);
    expect(s.selectedPath).toBe('/');
    expect(s.expandedPaths.has('/')).toBe(true);
    expect(s.expandedPaths.has('/states/draft')).toBe(true);
    expect(s.errors).toEqual([]);
  });

  it('hydrate without preserveView resets selection to "/" even if a path was selected', () => {
    store.getState().hydrate(docA);
    store.getState().setSelected('/states/draft/transitions/0');
    store.getState().hydrate(docB);
    expect(store.getState().selectedPath).toBe('/');
  });

  it('hydrate with preserveView keeps selectedPath if it still resolves', () => {
    store.getState().hydrate(docA);
    store.getState().setSelected('/states/draft');
    store.getState().hydrate(docA, { preserveView: true });
    expect(store.getState().selectedPath).toBe('/states/draft');
  });

  it('hydrate with preserveView falls back to "/" if selectedPath no longer resolves', () => {
    store.getState().hydrate(docA);
    store.getState().setSelected('/states/draft/transitions/0');
    store.getState().hydrate(docB, { preserveView: true });
    expect(store.getState().selectedPath).toBe('/');
  });

  it('hydrate with preserveView keeps the still-resolving subset of expandedPaths', () => {
    const docTwoStates: WorkflowDoc = {
      ...docA,
      states: { draft: { transitions: [] }, review: { transitions: [] } },
    };
    store.getState().hydrate(docTwoStates);
    store.getState().toggleExpand('/states/review');
    store.getState().hydrate(docA, { preserveView: true }); // only "draft" survives
    const exp = store.getState().expandedPaths;
    expect(exp.has('/states/draft')).toBe(true);
    expect(exp.has('/states/review')).toBe(false);
  });

  it('preserveView defaults do NOT add the first-state default on top of preserved entries', () => {
    const docTwoStates: WorkflowDoc = {
      ...docA,
      states: { alpha: { transitions: [] }, beta: { transitions: [] } },
      initialState: 'alpha',
    };
    store.getState().hydrate(docTwoStates);
    // Manually collapse the first-state default and expand the second:
    store.getState().toggleExpand('/states/alpha');  // collapses
    store.getState().toggleExpand('/states/beta');   // expands
    store.getState().hydrate(docTwoStates, { preserveView: true });
    const exp = store.getState().expandedPaths;
    expect(exp.has('/states/alpha')).toBe(false);    // not re-added by default
    expect(exp.has('/states/beta')).toBe(true);
  });

  it('setSelected updates selectedPath', () => {
    store.getState().hydrate(docA);
    store.getState().setSelected('/states/draft');
    expect(store.getState().selectedPath).toBe('/states/draft');
  });

  it('toggleExpand adds a missing path and removes a present one', () => {
    store.getState().hydrate(docA);
    store.getState().toggleExpand('/states/draft');   // already expanded by default → remove
    expect(store.getState().expandedPaths.has('/states/draft')).toBe(false);
    store.getState().toggleExpand('/states/draft');   // re-add
    expect(store.getState().expandedPaths.has('/states/draft')).toBe(true);
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
  });

  it('resetToPristine restores the doc and resets selection/expansion to defaults', () => {
    store.getState().updateWorkflowProps({ name: 'changed' });
    store.getState().setSelected('/states/draft/transitions/0');
    store.getState().resetToPristine();
    expect(store.getState().current).toEqual(docA);
    expect(store.getState().selectedPath).toBe('/');
    expect(store.getState().expandedPaths.has('/states/draft')).toBe(true);
    expect(store.getState().errors).toEqual([]);
  });
});
