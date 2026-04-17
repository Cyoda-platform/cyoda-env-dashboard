import { describe, it, expect } from 'vitest';
import { validateWorkflowDoc } from '../validateWorkflowDoc';
import type { WorkflowDoc } from '../../../gateways';

function makeFixture(stateCount: number, transitionsPerState: number): WorkflowDoc {
  const states: WorkflowDoc['states'] = {};
  for (let s = 0; s < stateCount; s++) {
    const stateName = `s${s}`;
    states[stateName] = {
      transitions: Array.from({ length: transitionsPerState }, (_, i) => ({
        name: `t_${s}_${i}`,
        next: `s${(s + 1) % stateCount}`,
        manual: i % 2 === 0,
      })),
    };
  }
  return { version: '1.0', name: 'big', initialState: 's0', states, active: true };
}

describe('validateWorkflowDoc perf', () => {
  it('completes < 100ms median over 5 runs on 500 states × 5 transitions', () => {
    const doc = makeFixture(500, 5);
    const samples: number[] = [];
    for (let i = 0; i < 5; i++) {
      const t0 = performance.now();
      validateWorkflowDoc(doc);
      samples.push(performance.now() - t0);
    }
    samples.sort((a, b) => a - b);
    const median = samples[2];
    expect(median).toBeLessThan(100);
  });
});
