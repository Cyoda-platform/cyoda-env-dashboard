import { describe, it, expect } from 'vitest';
import { workflowDocToGraphShape } from '../workflowDocToGraphShape';
import type { WorkflowDoc } from '../../../gateways';

describe('workflowDocToGraphShape', () => {
  it('returns empty arrays for an empty doc', () => {
    const doc: WorkflowDoc = { version: '1.0', name: 'wf', initialState: '', states: {} };
    expect(workflowDocToGraphShape(doc)).toEqual({
      states: [], transitions: [], processes: [], criteria: [],
    });
  });

  it('renders one state-node with no transitions', () => {
    const doc: WorkflowDoc = {
      version: '1.0', name: 'wf', initialState: 'draft',
      states: { draft: { transitions: [] } },
    };
    const out = workflowDocToGraphShape(doc);
    expect(out.states).toEqual([{ id: 'state:draft', name: 'draft' }]);
    expect(out.transitions).toEqual([]);
  });

  it('maps a transition with manual=false to automated=true', () => {
    const doc: WorkflowDoc = {
      version: '1.0', name: 'wf', initialState: 'a',
      states: {
        a: { transitions: [{ name: 'go', next: 'b', manual: false }] },
        b: { transitions: [] },
      },
    };
    const t = workflowDocToGraphShape(doc).transitions[0];
    expect(t.id).toBe('t:a/0');
    expect(t.name).toBe('go');
    expect(t.startStateId).toBe('state:a');
    expect(t.endStateId).toBe('state:b');
    expect(t.startStateName).toBe('a');
    expect(t.endStateName).toBe('b');
    expect(t.automated).toBe(true);
    expect(t.active).toBe(true);
    expect(t.persisted).toBe(true);
    expect(t.criteriaIds).toEqual([]);
    expect(t.endProcessesIds).toEqual([]);
  });

  it('maps manual=true → automated=false and disabled=true → active=false', () => {
    const doc: WorkflowDoc = {
      version: '1.0', name: 'wf', initialState: 'a',
      states: {
        a: { transitions: [{ name: 'pause', next: 'a', manual: true, disabled: true }] },
      },
    };
    const t = workflowDocToGraphShape(doc).transitions[0];
    expect(t.automated).toBe(false);
    expect(t.active).toBe(false);
  });

  it('emits a Criteria row + criteriaIds when transition has criterion', () => {
    const doc: WorkflowDoc = {
      version: '1.0', name: 'wf', initialState: 'a',
      states: {
        a: { transitions: [{ name: 'check', next: 'a', manual: false,
          criterion: { type: 'simple', jsonPath: '$.x', operation: 'EQUALS', value: 'y' } as any,
        }] },
      },
    };
    const out = workflowDocToGraphShape(doc);
    expect(out.transitions[0].criteriaIds).toEqual(['c:a/0']);
    expect(out.criteria).toEqual([{
      id: 'c:a/0', name: 'check criterion', description: '', persisted: true,
    }]);
  });

  it('emits a Criteria row with derived name when transition name is empty', () => {
    const doc: WorkflowDoc = {
      version: '1.0', name: 'wf', initialState: 'a',
      states: {
        a: { transitions: [{ name: '', next: 'a', manual: false,
          criterion: { type: 'simple' } as any,
        }] },
      },
    };
    const out = workflowDocToGraphShape(doc);
    expect(out.criteria[0].name).toBe('(unnamed) criterion');
  });

  it('emits Process rows + endProcessesIds when transition has processors', () => {
    const doc: WorkflowDoc = {
      version: '1.0', name: 'wf', initialState: 'a',
      states: {
        a: { transitions: [{ name: 't', next: 'a', manual: false, processors: [
          { type: 'externalized', name: 'p1' },
          { type: 'externalized', name: 'p2' },
        ]}] },
      },
    };
    const out = workflowDocToGraphShape(doc);
    expect(out.transitions[0].endProcessesIds).toEqual(['p:a/0/0', 'p:a/0/1']);
    expect(out.processes).toEqual([
      { id: 'p:a/0/0', name: 'p1', description: '', persisted: true },
      { id: 'p:a/0/1', name: 'p2', description: '', persisted: true },
    ]);
  });

  it('is deterministic — same input doc twice produces deep-equal output', () => {
    const doc: WorkflowDoc = {
      version: '1.0', name: 'wf', initialState: 'a',
      states: {
        a: { transitions: [{ name: 't1', next: 'b', manual: false, processors: [{ type: 'externalized', name: 'p' }]}] },
        b: { transitions: [{ name: 't2', next: 'a', manual: true, criterion: { type: 'simple' } as any }] },
      },
    };
    expect(workflowDocToGraphShape(doc)).toEqual(workflowDocToGraphShape(doc));
  });
});
