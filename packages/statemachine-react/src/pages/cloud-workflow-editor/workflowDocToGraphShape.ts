/**
 * Adapter: WorkflowDoc (cloud, nested) → legacy flat-list shape consumed by
 * GraphicalStateMachine. Synthetic IDs are deterministic from doc structure.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-workflow-editor-layout-pivot.md §3.4
 */
import type { WorkflowDoc } from '../../gateways';
import type { Transition, Process, Criteria } from '../../types';

export interface GraphShape {
  states: Array<{ id: string; name: string }>;
  transitions: Transition[];
  processes: Process[];
  criteria: Criteria[];
}

export function workflowDocToGraphShape(doc: WorkflowDoc): GraphShape {
  const states = Object.keys(doc.states ?? {}).map((name) => ({ id: `state:${name}`, name }));
  const transitions: Transition[] = [];
  const processes: Process[] = [];
  const criteria: Criteria[] = [];

  for (const [stateName, state] of Object.entries(doc.states ?? {})) {
    (state.transitions ?? []).forEach((t, i) => {
      const tId = `t:${stateName}/${i}`;
      const procIds = (t.processors ?? []).map((_, pi) => `p:${stateName}/${i}/${pi}`);
      const critIds = t.criterion ? [`c:${stateName}/${i}`] : [];

      transitions.push({
        id: tId,
        name: t.name,
        startStateId: `state:${stateName}`,
        endStateId: `state:${t.next}`,
        startStateName: stateName,
        endStateName: t.next,
        automated: !t.manual,
        active: !t.disabled,
        persisted: true,
        criteriaIds: critIds,
        endProcessesIds: procIds,
      });

      (t.processors ?? []).forEach((p, pi) => {
        processes.push({
          id: `p:${stateName}/${i}/${pi}`,
          name: p.name,
          description: '',
          persisted: true,
        });
      });

      if (t.criterion) {
        criteria.push({
          id: `c:${stateName}/${i}`,
          name: `${t.name || '(unnamed)'} criterion`,
          description: '',
          persisted: true,
        });
      }
    });
  }

  return { states, transitions, processes, criteria };
}
