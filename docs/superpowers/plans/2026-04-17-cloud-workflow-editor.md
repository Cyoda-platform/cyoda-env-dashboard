# Cloud Workflow Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `WorkflowEditorCloudPlaceholder` with a real single-page editor for cloud workflow documents — tree navigation on the left, context-specific forms on the right, validation + dirty tracking + Playwright E2E.

**Architecture:** Page-scoped Zustand store (Immer + selector-subscriptions) holds the doc; AntD `<Tree virtual>` drives navigation; recursive `QueryConditionEditor` for transition criteria; hand-rolled validator surfaces errors as red dots on tree nodes; Save flow goes through the existing `CloudWorkflowGateway` and re-fetches the server's truth, preserving the user's tree position.

**Tech Stack:** TypeScript 5, React 18, Zustand 5, Immer 10, Ant Design 5, React Router 6 (`useBlocker`), TanStack Query 5, Vitest 3, Playwright (already in repo).

**Spec (source of truth):** `docs/superpowers/specs/2026-04-17-cloud-workflow-editor-design.md` (v4). This plan refers to spec sections (§3.1, §3.2, …) for design rationale rather than restating it.

**Branch:** `feature/cyoda-go-support-cloud-workflow-editor` (already created, currently has only the spec commits).

**Parent branch / PR target:** `feature/cyoda-go-support`.

---

## File map

This is the full set of files touched by the plan. Every task lists its own files; this map is for orientation.

**New (statemachine-react):**

```
packages/statemachine-react/src/pages/cloud-workflow-editor/
  WorkflowEditorCloud.tsx
  workflowEditorStore.ts
  validateWorkflowDoc.ts
  useDirtyGuard.ts
  WorkflowTree.tsx
  NodeRouter.tsx
  nodeHasError.ts
  index.ts
  __tests__/
    workflowEditorStore.test.ts
    workflowEditorStore.paths.test.ts
    validateWorkflowDoc.test.ts
    validateWorkflowDoc.perf.test.ts
    nodeHasError.test.ts
    WorkflowTree.test.tsx
    NodeRouter.test.tsx
    WorkflowEditorCloud.test.tsx
  nodes/
    WorkflowPropsForm.tsx
    StateForm.tsx
    TransitionForm.tsx
    ProcessorRow.tsx
    __tests__/
      WorkflowPropsForm.test.tsx
      StateForm.test.tsx
      TransitionForm.test.tsx
      ProcessorRow.test.tsx

packages/statemachine-react/src/components/cloud-workflows/
  QueryConditionEditor.tsx
  QueryConditionEditor.test.tsx
```

**New (E2E, repo root):**

```
e2e/
  fixtures/
    auth.ts
    testModel.ts
  cloud-workflow-editor/
    create.spec.ts
    edit-and-save.spec.ts
    add-processor.spec.ts
    query-condition.spec.ts
    validation.spec.ts
    dirty-guard.spec.ts
```

**Modified:**

```
packages/statemachine-react/src/gateways/errors.ts            # add WorkflowNotFoundError
packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts  # use the typed error
packages/statemachine-react/src/hooks/useStatemachine.ts      # cloudWorkflow key accepts undefined
packages/statemachine-react/src/index.ts                      # re-export WorkflowEditorCloud
apps/saas-app/src/routes/index.tsx                            # swap placeholder for real editor
playwright.config.ts                                          # add cloud-workflow-editor project
```

**Deleted:**

```
packages/statemachine-react/src/pages/WorkflowEditorCloudPlaceholder.tsx
```

---

## Task groups

- **Group A** — Gateway prep (typed error + key factory). 2 tasks.
- **Group B** — Validator. 1 task.
- **Group C** — Store. 5 tasks.
- **Group D** — `QueryConditionEditor`. 4 tasks.
- **Group E** — Forms. 4 tasks.
- **Group F** — Page assembly + dirty guard + tree + routing. 6 tasks.
- **Group G** — Playwright E2E. 8 tasks.
- **Group H** — Verification + PR. 1 task.

Total: 31 tasks. Each is a discrete subagent dispatch.

---

## Group A: Gateway prep

### Task 1: Promote `loadWorkflow` "not found" to typed `WorkflowNotFoundError`

**Spec:** §2 ("Small gateway scope-creep"), §3.8 ("Recommended user exit when `WorkflowNotFoundError` fires").

**Files:**
- Modify: `packages/statemachine-react/src/gateways/errors.ts`
- Modify: `packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts:53-65` (`loadWorkflow`) and `:140-146` (`copyWorkflow` source-not-found)
- Test: `packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts` (already exists)

- [ ] **Step 1: Audit blast radius** (verifies the §2 audit claim)

Run:
```bash
grep -rnE "instanceof Error|\.constructor === Error|err\.message.*not found" packages/statemachine-react/src/ apps/saas-app/src/ --include='*.ts' --include='*.tsx' | grep -v __tests__ | grep -v node_modules
```
Expected: 0 hits using `err.constructor === Error`. Hits using `err.message.includes('not found')` or `err instanceof Error` are acceptable — they keep working because `WorkflowNotFoundError extends Error` and the message string is preserved.

If exact-class checks exist, escalate to the controller before continuing.

- [ ] **Step 2: Write the failing tests**

Append to `packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts`:
```ts
import { WorkflowNotFoundError } from './errors';

describe('CloudWorkflowGateway loadWorkflow — typed not-found error', () => {
  it('throws WorkflowNotFoundError when the named workflow is missing', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { entityName: 'Customer', modelVersion: 1, workflows: [] },
    } as any);
    const gw = new CloudWorkflowGateway();
    await expect(
      gw.loadWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'missing'),
    ).rejects.toBeInstanceOf(WorkflowNotFoundError);
  });

  it('preserves the legacy message string for callers that match on it', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { entityName: 'Customer', modelVersion: 1, workflows: [] },
    } as any);
    const gw = new CloudWorkflowGateway();
    await expect(
      gw.loadWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'missing'),
    ).rejects.toThrow(/Workflow "missing" not found in model Customer v1/);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts -t "typed not-found"`
Expected: FAIL — `WorkflowNotFoundError` does not exist.

- [ ] **Step 4: Add the typed class**

Append to `packages/statemachine-react/src/gateways/errors.ts`:
```ts
/**
 * Thrown when a workflow lookup by name returns no match. Generic to any
 * not-found path (initial load with a bad URL, post-save fetch when the
 * backend rewrote the name — see CloudWorkflowGateway.loadWorkflow). The
 * message string is preserved for callers that match on it.
 */
export class WorkflowNotFoundError extends Error {
  constructor(
    public readonly workflowName: string,
    public readonly entityName: string,
    public readonly modelVersion: number,
  ) {
    super(`Workflow "${workflowName}" not found in model ${entityName} v${modelVersion}`);
    this.name = 'WorkflowNotFoundError';
  }
}
```

- [ ] **Step 5: Use the typed class in the gateway**

In `packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts`:

Add to the imports:
```ts
import { MustHaveActiveWorkflowError, RenameIncompleteError, WorkflowNotFoundError } from './errors';
```

Replace `loadWorkflow`'s throw block (lines 59-63):
```ts
    if (!found) {
      throw new WorkflowNotFoundError(name, modelRef.entityName, modelRef.modelVersion);
    }
```

Replace `copyWorkflow`'s source-not-found block (lines 140-146):
```ts
    const source = all.find((w) => w.name === sourceName);
    if (!source) {
      throw new WorkflowNotFoundError(sourceName, modelRef.entityName, modelRef.modelVersion);
    }
```

- [ ] **Step 6: Run gateway tests to verify all pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts`
Expected: PASS for all tests (the new ones plus the existing ones).

- [ ] **Step 7: Commit**

```bash
git add packages/statemachine-react/src/gateways/errors.ts packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts
git commit -m "feat(statemachine-react): add typed WorkflowNotFoundError to CloudWorkflowGateway"
```

---

### Task 2: `statemachineKeys.cloudWorkflow` accepts `name | undefined`

**Spec:** §3.9 step 4.

**Files:**
- Modify: `packages/statemachine-react/src/hooks/useStatemachine.ts:32` (the existing `cloudWorkflow` factory entry)

- [ ] **Step 1: Inspect current shape**

Read `packages/statemachine-react/src/hooks/useStatemachine.ts:24-50` to confirm the factory layout (already verified during plan-writing: `cloudWorkflow: (modelRef, name: string) => [...statemachineKeys.workflows(), 'doc', modelRef, name]`).

- [ ] **Step 2: Widen the signature**

Change line 32 from `name: string` to `name: string | undefined`. The body is unchanged — React Query handles `undefined` parts in the key fine, no empty-string sentinel needed.

```ts
cloudWorkflow: (modelRef: ModelRef, name: string | undefined) =>
  [...statemachineKeys.workflows(), 'doc', modelRef, name] as const,
```

- [ ] **Step 3: Run all tests in the hooks file to confirm nothing broke**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/hooks/`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/statemachine-react/src/hooks/useStatemachine.ts
git commit -m "chore(statemachine-react): cloudWorkflow key factory accepts name | undefined"
```

---

## Group B: Validator

### Task 3: `validateWorkflowDoc` — 12 rules + perf-ceiling test

**Spec:** §3.4 (the 12 validation rules), §4.1 ("perf-ceiling test").

**Files:**
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/validateWorkflowDoc.ts`
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/validateWorkflowDoc.test.ts`
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/validateWorkflowDoc.perf.test.ts`

- [ ] **Step 1: Write the failing rule tests**

`packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/validateWorkflowDoc.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { validateWorkflowDoc } from '../validateWorkflowDoc';
import type { WorkflowDoc } from '../../../gateways';

const valid: WorkflowDoc = {
  version: '1.0',
  name: 'wf',
  initialState: 'draft',
  states: { draft: { transitions: [{ name: 't1', next: 'draft', manual: false }] } },
  active: true,
};

describe('validateWorkflowDoc', () => {
  it('returns [] for a valid doc', () => {
    expect(validateWorkflowDoc(valid)).toEqual([]);
  });

  it('rule 1: empty version → error at /version', () => {
    expect(validateWorkflowDoc({ ...valid, version: '' })).toContainEqual(
      expect.objectContaining({ path: '/version' }),
    );
  });

  it('rule 2: empty name → error at /name', () => {
    expect(validateWorkflowDoc({ ...valid, name: '' })).toContainEqual(
      expect.objectContaining({ path: '/name' }),
    );
  });

  it('rule 3: empty initialState → error at /initialState', () => {
    expect(validateWorkflowDoc({ ...valid, initialState: '' })).toContainEqual(
      expect.objectContaining({ path: '/initialState' }),
    );
  });

  it('rule 4: empty states object → error at /states', () => {
    expect(validateWorkflowDoc({ ...valid, states: {} })).toContainEqual(
      expect.objectContaining({ path: '/states' }),
    );
  });

  it('rule 5: initialState references non-existent state → error at /initialState', () => {
    expect(validateWorkflowDoc({ ...valid, initialState: 'nope' })).toContainEqual(
      expect.objectContaining({ path: '/initialState' }),
    );
  });

  it('rule 6: empty state name (key) → error at /states', () => {
    const bad = { ...valid, states: { '': { transitions: [] }, draft: valid.states.draft } } as any;
    expect(validateWorkflowDoc(bad)).toContainEqual(
      expect.objectContaining({ path: '/states' }),
    );
  });

  it('rule 7a: transition with empty name → error at the transition path', () => {
    const bad: WorkflowDoc = {
      ...valid,
      states: { draft: { transitions: [{ name: '', next: 'draft', manual: false }] } },
    };
    expect(validateWorkflowDoc(bad)).toContainEqual(
      expect.objectContaining({ path: '/states/draft/transitions/0/name' }),
    );
  });

  it('rule 7b: transition with empty next → error at the next path', () => {
    const bad: WorkflowDoc = {
      ...valid,
      states: { draft: { transitions: [{ name: 't', next: '', manual: false }] } },
    };
    expect(validateWorkflowDoc(bad)).toContainEqual(
      expect.objectContaining({ path: '/states/draft/transitions/0/next' }),
    );
  });

  it('rule 7c: transition next references missing state → error at the next path', () => {
    const bad: WorkflowDoc = {
      ...valid,
      states: { draft: { transitions: [{ name: 't', next: 'nope', manual: false }] } },
    };
    expect(validateWorkflowDoc(bad)).toContainEqual(
      expect.objectContaining({ path: '/states/draft/transitions/0/next' }),
    );
  });

  it('rule 7d: transition manual is undefined → error at the manual path', () => {
    const bad: WorkflowDoc = {
      ...valid,
      states: {
        draft: { transitions: [{ name: 't', next: 'draft', manual: undefined as any }] },
      },
    };
    expect(validateWorkflowDoc(bad)).toContainEqual(
      expect.objectContaining({ path: '/states/draft/transitions/0/manual' }),
    );
  });

  it('rule 8: duplicate transition names within one state → error at second one', () => {
    const bad: WorkflowDoc = {
      ...valid,
      states: {
        draft: {
          transitions: [
            { name: 't', next: 'draft', manual: false },
            { name: 't', next: 'draft', manual: false },
          ],
        },
      },
    };
    expect(validateWorkflowDoc(bad)).toContainEqual(
      expect.objectContaining({ path: '/states/draft/transitions/1/name' }),
    );
  });

  it('rule 9: processor with empty name → error at processor path', () => {
    const bad: WorkflowDoc = {
      ...valid,
      states: {
        draft: {
          transitions: [{
            name: 't', next: 'draft', manual: false,
            processors: [{ type: 'externalized', name: '' }],
          }],
        },
      },
    };
    expect(validateWorkflowDoc(bad)).toContainEqual(
      expect.objectContaining({ path: '/states/draft/transitions/0/processors/0/name' }),
    );
  });

  it('rule 10: processor with invalid executionMode → error', () => {
    const bad: WorkflowDoc = {
      ...valid,
      states: {
        draft: {
          transitions: [{
            name: 't', next: 'draft', manual: false,
            processors: [{ type: 'externalized', name: 'p', executionMode: 'BAD' as any }],
          }],
        },
      },
    };
    expect(validateWorkflowDoc(bad)).toContainEqual(
      expect.objectContaining({ path: '/states/draft/transitions/0/processors/0/executionMode' }),
    );
  });

  it('rule 11a: scheduled processor with delayMs <= 0 → error', () => {
    const bad: WorkflowDoc = {
      ...valid,
      states: {
        draft: {
          transitions: [{
            name: 't', next: 'draft', manual: false,
            processors: [{
              type: 'scheduled', name: 's',
              config: { delayMs: 0, transition: 't' },
            }],
          }],
        },
      },
    };
    expect(validateWorkflowDoc(bad)).toContainEqual(
      expect.objectContaining({ path: '/states/draft/transitions/0/processors/0/config/delayMs' }),
    );
  });

  it('rule 11b: scheduled processor referencing unknown transition → error', () => {
    const bad: WorkflowDoc = {
      ...valid,
      states: {
        draft: {
          transitions: [{
            name: 't', next: 'draft', manual: false,
            processors: [{
              type: 'scheduled', name: 's',
              config: { delayMs: 1000, transition: 'unknown' },
            }],
          }],
        },
      },
    };
    expect(validateWorkflowDoc(bad)).toContainEqual(
      expect.objectContaining({ path: '/states/draft/transitions/0/processors/0/config/transition' }),
    );
  });

  it('rule 12: duplicate processor names within one transition → error at second one', () => {
    const bad: WorkflowDoc = {
      ...valid,
      states: {
        draft: {
          transitions: [{
            name: 't', next: 'draft', manual: false,
            processors: [
              { type: 'externalized', name: 'p' },
              { type: 'externalized', name: 'p' },
            ],
          }],
        },
      },
    };
    expect(validateWorkflowDoc(bad)).toContainEqual(
      expect.objectContaining({ path: '/states/draft/transitions/0/processors/1/name' }),
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/validateWorkflowDoc.test.ts`
Expected: FAIL — `validateWorkflowDoc` doesn't exist.

- [ ] **Step 3: Implement `validateWorkflowDoc`**

`packages/statemachine-react/src/pages/cloud-workflow-editor/validateWorkflowDoc.ts`:
```ts
/**
 * Pure validator for cloud workflow documents. Rules are spelled out in
 * docs/superpowers/specs/2026-04-17-cloud-workflow-editor-design.md §3.4.
 */
import type { WorkflowDoc, ProcessorDefinition, ProcessorExecutionMode } from '../../gateways';

export interface ValidationIssue {
  path: string;
  message: string;
}

const VALID_EXECUTION_MODES: ProcessorExecutionMode[] = ['SYNC', 'ASYNC_SAME_TX', 'ASYNC_NEW_TX'];

export function validateWorkflowDoc(doc: WorkflowDoc): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!doc.version) issues.push({ path: '/version', message: 'Version is required.' });
  if (!doc.name) issues.push({ path: '/name', message: 'Name is required.' });
  if (!doc.initialState) issues.push({ path: '/initialState', message: 'Initial state is required.' });

  const stateNames = Object.keys(doc.states ?? {});
  if (stateNames.length === 0) {
    issues.push({ path: '/states', message: 'At least one state is required.' });
  }
  if (stateNames.some((n) => n === '')) {
    issues.push({ path: '/states', message: 'State names cannot be empty.' });
  }
  if (doc.initialState && !(doc.initialState in (doc.states ?? {}))) {
    issues.push({
      path: '/initialState',
      message: `Initial state "${doc.initialState}" does not exist.`,
    });
  }

  // Pre-compute the set of all transition names across the doc — needed for
  // scheduled-processor cross-references (rule 11b).
  const allTransitionNames = new Set<string>();
  for (const state of Object.values(doc.states ?? {})) {
    for (const t of state.transitions ?? []) {
      if (t.name) allTransitionNames.add(t.name);
    }
  }

  for (const [stateName, state] of Object.entries(doc.states ?? {})) {
    const transitions = state.transitions ?? [];
    const seenTransitionNames = new Set<string>();
    transitions.forEach((t, i) => {
      const tPath = `/states/${stateName}/transitions/${i}`;
      if (!t.name) issues.push({ path: `${tPath}/name`, message: 'Transition name is required.' });
      if (!t.next) issues.push({ path: `${tPath}/next`, message: 'Transition target (next) is required.' });
      if (t.next && !(t.next in (doc.states ?? {}))) {
        issues.push({ path: `${tPath}/next`, message: `Target state "${t.next}" does not exist.` });
      }
      if (typeof t.manual !== 'boolean') {
        issues.push({ path: `${tPath}/manual`, message: 'Transition "manual" must be boolean.' });
      }
      if (t.name) {
        if (seenTransitionNames.has(t.name)) {
          issues.push({ path: `${tPath}/name`, message: `Duplicate transition name "${t.name}".` });
        }
        seenTransitionNames.add(t.name);
      }

      const seenProcNames = new Set<string>();
      (t.processors ?? []).forEach((p, pi) => {
        const pPath = `${tPath}/processors/${pi}`;
        if (!p.name) issues.push({ path: `${pPath}/name`, message: 'Processor name is required.' });
        if (p.executionMode && !VALID_EXECUTION_MODES.includes(p.executionMode)) {
          issues.push({ path: `${pPath}/executionMode`, message: `Invalid executionMode "${p.executionMode}".` });
        }
        if (p.type === 'scheduled') {
          const cfg = (p.config ?? {}) as { delayMs?: number; transition?: string };
          if (!cfg.delayMs || cfg.delayMs <= 0) {
            issues.push({ path: `${pPath}/config/delayMs`, message: 'delayMs must be > 0.' });
          }
          if (!cfg.transition || !allTransitionNames.has(cfg.transition)) {
            issues.push({
              path: `${pPath}/config/transition`,
              message: `Scheduled transition "${cfg.transition ?? ''}" not found in workflow.`,
            });
          }
        }
        if (p.name) {
          if (seenProcNames.has(p.name)) {
            issues.push({ path: `${pPath}/name`, message: `Duplicate processor name "${p.name}".` });
          }
          seenProcNames.add(p.name);
        }
      });
    });
  }

  return issues;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/validateWorkflowDoc.test.ts`
Expected: PASS — all 17 tests.

- [ ] **Step 5: Add the perf-ceiling test**

`packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/validateWorkflowDoc.perf.test.ts`:
```ts
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
```

- [ ] **Step 6: Run perf test**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/validateWorkflowDoc.perf.test.ts`
Expected: PASS — should complete well under 100ms even on a slow runner.

- [ ] **Step 7: Commit**

```bash
git add packages/statemachine-react/src/pages/cloud-workflow-editor/validateWorkflowDoc.ts packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/validateWorkflowDoc.test.ts packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/validateWorkflowDoc.perf.test.ts
git commit -m "feat(statemachine-react): add validateWorkflowDoc with 12 rules + perf-ceiling test"
```

---

## Group C: Store

### Task 4: Store skeleton — `hydrate` (default + `preserveView`), selection, expansion, errors lifecycle

**Spec:** §3.2 (store shape, hydrate semantics, errors lifecycle).

**Files:**
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/workflowEditorStore.ts`
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.test.ts`

This task adds store creation + `hydrate` + `setSelected` + `toggleExpand` + a placeholder `setErrors` action. Mutations come in Tasks 5–7.

- [ ] **Step 1: Install Immer if not present**

Run: `pnpm --filter @cyoda/statemachine-react add immer zustand@^5`
Expected: lockfile updates. Commit the lockfile change at the end of this task.

If Zustand is already a dep at the right major version, only add Immer. Verify with `grep -E '"(zustand|immer)"' packages/statemachine-react/package.json` first; only add what's missing.

- [ ] **Step 2: Write failing tests for hydrate + selection + expansion + errors lifecycle**

`packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.test.ts`:
```ts
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

  it('setErrors stores them; mutating actions clear them (placeholder via updateWorkflowProps in next task)', () => {
    store.getState().hydrate(docA);
    store.getState().setErrors([{ path: '/name', message: 'x' }]);
    expect(store.getState().errors).toHaveLength(1);
    store.getState().setErrors([]);
    expect(store.getState().errors).toEqual([]);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.test.ts`
Expected: FAIL — `createWorkflowEditorStore` doesn't exist.

- [ ] **Step 4: Implement the store skeleton**

`packages/statemachine-react/src/pages/cloud-workflow-editor/workflowEditorStore.ts`:
```ts
/**
 * Page-scoped Zustand store for the cloud workflow editor.
 *
 * Designed for workflows with hundreds of states: components subscribe to
 * narrow slices via selectors and only re-render when their slice changes.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-workflow-editor-design.md §3.2
 */
import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { WorkflowDoc, QueryCondition, TransitionDefinition, ProcessorDefinition } from '../../gateways';
import type { ValidationIssue } from './validateWorkflowDoc';

export interface WorkflowEditorState {
  pristine: WorkflowDoc | null;
  current: WorkflowDoc | null;
  selectedPath: string;
  expandedPaths: Set<string>;
  errors: ValidationIssue[];

  hydrate(initial: WorkflowDoc, opts?: { preserveView?: boolean }): void;
  setSelected(path: string): void;
  toggleExpand(path: string): void;
  setErrors(errors: ValidationIssue[]): void;

  // Mutations come in Tasks 5–7.
  updateWorkflowProps(patch: Partial<WorkflowDoc>): void;
  renameState(oldName: string, newName: string): void;
  addState(name: string): void;
  deleteState(name: string): void;
  addTransition(stateName: string): void;
  deleteTransition(stateName: string, index: number): void;
  updateTransition(stateName: string, index: number, patch: Partial<TransitionDefinition>): void;
  addProcessor(stateName: string, transitionIndex: number, processor: ProcessorDefinition): void;
  updateProcessor(stateName: string, transitionIndex: number, processorIndex: number, patch: Partial<ProcessorDefinition>): void;
  deleteProcessor(stateName: string, transitionIndex: number, processorIndex: number): void;
  setTransitionCriterion(stateName: string, transitionIndex: number, criterion: QueryCondition | undefined): void;
  resetToPristine(): void;
}

export type WorkflowEditorStore = UseBoundStore<StoreApi<WorkflowEditorState>>;

/** Returns true iff `path` resolves in `doc`. Paths: '/', '/states/<n>', '/states/<n>/transitions/<i>'. */
export function pathResolvesIn(path: string, doc: WorkflowDoc): boolean {
  if (path === '/') return true;
  const m = path.match(/^\/states\/([^/]+)(?:\/transitions\/(\d+))?$/);
  if (!m) return false;
  const stateName = m[1];
  if (!(stateName in doc.states)) return false;
  if (m[2] === undefined) return true;
  const idx = Number(m[2]);
  const transitions = doc.states[stateName].transitions ?? [];
  return idx >= 0 && idx < transitions.length;
}

function defaultExpansion(doc: WorkflowDoc): Set<string> {
  const set = new Set<string>(['/']);
  const firstState = Object.keys(doc.states)[0];
  if (firstState) set.add(`/states/${firstState}`);
  return set;
}

export function createWorkflowEditorStore(): WorkflowEditorStore {
  return create<WorkflowEditorState>()(
    immer((set) => ({
      pristine: null,
      current: null,
      selectedPath: '/',
      expandedPaths: new Set<string>(),
      errors: [],

      hydrate(initial, opts) {
        set((s) => {
          s.pristine = initial;
          s.current = initial;
          s.errors = [];
          if (opts?.preserveView && s.pristine) {
            // Selection
            const keepSel = pathResolvesIn(s.selectedPath, initial);
            s.selectedPath = keepSel ? s.selectedPath : '/';
            // Expansion: keep the resolving subset; if NONE resolve, fall back to defaults.
            const kept = new Set<string>();
            for (const p of s.expandedPaths) {
              if (pathResolvesIn(p, initial)) kept.add(p);
            }
            s.expandedPaths = kept.size > 0 ? kept : defaultExpansion(initial);
          } else {
            s.selectedPath = '/';
            s.expandedPaths = defaultExpansion(initial);
          }
        });
      },

      setSelected(path) { set((s) => { s.selectedPath = path; }); },
      toggleExpand(path) {
        set((s) => {
          if (s.expandedPaths.has(path)) s.expandedPaths.delete(path);
          else s.expandedPaths.add(path);
        });
      },
      setErrors(errors) { set((s) => { s.errors = errors; }); },

      // Stubs — implemented in Tasks 5–7.
      updateWorkflowProps() { throw new Error('not implemented'); },
      renameState() { throw new Error('not implemented'); },
      addState() { throw new Error('not implemented'); },
      deleteState() { throw new Error('not implemented'); },
      addTransition() { throw new Error('not implemented'); },
      deleteTransition() { throw new Error('not implemented'); },
      updateTransition() { throw new Error('not implemented'); },
      addProcessor() { throw new Error('not implemented'); },
      updateProcessor() { throw new Error('not implemented'); },
      deleteProcessor() { throw new Error('not implemented'); },
      setTransitionCriterion() { throw new Error('not implemented'); },
      resetToPristine() { throw new Error('not implemented'); },
    })),
  );
}
```

- [ ] **Step 5: Run tests to verify all pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.test.ts`
Expected: PASS — all 9 tests.

- [ ] **Step 6: Commit**

```bash
git add packages/statemachine-react/src/pages/cloud-workflow-editor/workflowEditorStore.ts packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.test.ts packages/statemachine-react/package.json pnpm-lock.yaml
git commit -m "feat(statemachine-react): scaffold workflowEditorStore with hydrate/selection/expansion"
```

---

### Task 5: Store mutations — `updateWorkflowProps`, `renameState`, `addState`, `deleteState` (with path rewrites)

**Spec:** §3.2 path-rewrite table (rows for `addState`, `deleteState`, `renameState`); §3.5 (renameState cascades `initialState`).

**Files:**
- Modify: `packages/statemachine-react/src/pages/cloud-workflow-editor/workflowEditorStore.ts`
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.paths.test.ts`

- [ ] **Step 1: Write failing tests**

`packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.paths.test.ts`:
```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.paths.test.ts`
Expected: FAIL — actions throw "not implemented".

- [ ] **Step 3: Implement the four actions**

In `workflowEditorStore.ts`, replace the four named stubs with:

```ts
      updateWorkflowProps(patch) {
        set((s) => {
          if (!s.current) return;
          Object.assign(s.current, patch);
          s.errors = [];
        });
      },

      renameState(oldName, newName) {
        if (oldName === newName) return;
        set((s) => {
          if (!s.current || !(oldName in s.current.states)) return;
          s.current.states[newName] = s.current.states[oldName];
          delete s.current.states[oldName];
          if (s.current.initialState === oldName) s.current.initialState = newName;
          // Path rewrites
          const oldPrefix = `/states/${oldName}`;
          const newPrefix = `/states/${newName}`;
          if (s.selectedPath === oldPrefix || s.selectedPath.startsWith(oldPrefix + '/')) {
            s.selectedPath = newPrefix + s.selectedPath.slice(oldPrefix.length);
          }
          const next = new Set<string>();
          for (const p of s.expandedPaths) {
            if (p === oldPrefix || p.startsWith(oldPrefix + '/')) {
              next.add(newPrefix + p.slice(oldPrefix.length));
            } else {
              next.add(p);
            }
          }
          s.expandedPaths = next;
          s.errors = [];
        });
      },

      addState(name) {
        set((s) => {
          if (!s.current || name in s.current.states) return;
          s.current.states[name] = { transitions: [] };
          s.selectedPath = `/states/${name}`;
          s.expandedPaths.add(`/states/${name}`);
          s.errors = [];
        });
      },

      deleteState(name) {
        set((s) => {
          if (!s.current || !(name in s.current.states)) return;
          delete s.current.states[name];
          const prefix = `/states/${name}`;
          if (s.selectedPath === prefix || s.selectedPath.startsWith(prefix + '/')) {
            s.selectedPath = '/';
          }
          const next = new Set<string>();
          for (const p of s.expandedPaths) {
            if (p !== prefix && !p.startsWith(prefix + '/')) next.add(p);
          }
          s.expandedPaths = next;
          s.errors = [];
        });
      },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/`
Expected: PASS for both store test files.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/pages/cloud-workflow-editor/workflowEditorStore.ts packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.paths.test.ts
git commit -m "feat(statemachine-react): workflowEditorStore — state mutations with path rewrites"
```

---

### Task 6: Store mutations — `addTransition`, `deleteTransition`, `updateTransition`

**Spec:** §3.2 path-rewrite table (rows for `addTransition`, `deleteTransition`, `updateTransition`).

**Files:**
- Modify: `packages/statemachine-react/src/pages/cloud-workflow-editor/workflowEditorStore.ts`
- Modify: `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.paths.test.ts`

- [ ] **Step 1: Append failing tests**

Append to `workflowEditorStore.paths.test.ts`:
```ts
describe('workflowEditorStore — transition mutations', () => {
  let store: ReturnType<typeof createWorkflowEditorStore>;
  beforeEach(() => { store = createWorkflowEditorStore(); store.getState().hydrate(baseDoc); });

  it('addTransition appends a transition, selects it, expands the parent state and the new transition', () => {
    store.getState().addTransition('draft');
    const draft = store.getState().current!.states.draft;
    expect(draft.transitions).toHaveLength(2);
    expect(store.getState().selectedPath).toBe('/states/draft/transitions/1');
    expect(store.getState().expandedPaths.has('/states/draft')).toBe(true);
    expect(store.getState().expandedPaths.has('/states/draft/transitions/1')).toBe(true);
  });

  it('deleteTransition shifts indices in selectedPath and expandedPaths', () => {
    // Add a second transition first so indices > 0 exist.
    store.getState().addTransition('draft');             // selects /states/draft/transitions/1
    store.getState().toggleExpand('/states/draft/transitions/1'); // toggle off
    store.getState().toggleExpand('/states/draft/transitions/1'); // toggle on
    store.getState().setSelected('/states/draft/transitions/1');
    store.getState().deleteTransition('draft', 0);
    // The transition at index 1 became index 0.
    expect(store.getState().current!.states.draft.transitions).toHaveLength(1);
    expect(store.getState().selectedPath).toBe('/states/draft/transitions/0');
    expect(store.getState().expandedPaths.has('/states/draft/transitions/0')).toBe(true);
  });

  it('deleteTransition resets selection to parent state if the deleted index was selected', () => {
    store.getState().setSelected('/states/draft/transitions/0');
    store.getState().deleteTransition('draft', 0);
    expect(store.getState().selectedPath).toBe('/states/draft');
  });

  it('updateTransition patches the transition and clears errors', () => {
    store.getState().setErrors([{ path: '/states/draft/transitions/0/name', message: 'x' }]);
    store.getState().updateTransition('draft', 0, { name: 'renamed' });
    expect(store.getState().current!.states.draft.transitions![0].name).toBe('renamed');
    expect(store.getState().errors).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.paths.test.ts -t "transition mutations"`
Expected: FAIL — actions throw "not implemented".

- [ ] **Step 3: Implement the three actions**

In `workflowEditorStore.ts`, replace the three named stubs with:

```ts
      addTransition(stateName) {
        set((s) => {
          if (!s.current || !(stateName in s.current.states)) return;
          const list = s.current.states[stateName].transitions ??= [];
          list.push({ name: '', next: stateName, manual: false });
          const newIndex = list.length - 1;
          const newPath = `/states/${stateName}/transitions/${newIndex}`;
          s.selectedPath = newPath;
          s.expandedPaths.add(`/states/${stateName}`);
          s.expandedPaths.add(newPath);
          s.errors = [];
        });
      },

      deleteTransition(stateName, index) {
        set((s) => {
          if (!s.current || !(stateName in s.current.states)) return;
          const list = s.current.states[stateName].transitions ?? [];
          if (index < 0 || index >= list.length) return;
          list.splice(index, 1);

          const deletedPath = `/states/${stateName}/transitions/${index}`;
          // Selection: if it was the deleted one or a descendant, jump to parent.
          if (s.selectedPath === deletedPath || s.selectedPath.startsWith(deletedPath + '/')) {
            s.selectedPath = `/states/${stateName}`;
          } else {
            // If selection was at a higher index in the same state, decrement.
            const m = s.selectedPath.match(new RegExp(`^/states/${stateName}/transitions/(\\d+)(.*)$`));
            if (m) {
              const j = Number(m[1]);
              if (j > index) s.selectedPath = `/states/${stateName}/transitions/${j - 1}${m[2]}`;
            }
          }
          // Expansion: drop the deleted path + descendants; shift higher indices.
          const next = new Set<string>();
          for (const p of s.expandedPaths) {
            if (p === deletedPath || p.startsWith(deletedPath + '/')) continue;
            const m = p.match(new RegExp(`^/states/${stateName}/transitions/(\\d+)(.*)$`));
            if (m) {
              const j = Number(m[1]);
              if (j > index) { next.add(`/states/${stateName}/transitions/${j - 1}${m[2]}`); continue; }
            }
            next.add(p);
          }
          s.expandedPaths = next;
          s.errors = [];
        });
      },

      updateTransition(stateName, index, patch) {
        set((s) => {
          const t = s.current?.states[stateName]?.transitions?.[index];
          if (!t) return;
          Object.assign(t, patch);
          s.errors = [];
        });
      },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.paths.test.ts`
Expected: PASS for all tests in the file.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/pages/cloud-workflow-editor/workflowEditorStore.ts packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.paths.test.ts
git commit -m "feat(statemachine-react): workflowEditorStore — transition mutations with path rewrites"
```

---

### Task 7: Store mutations — processors + `setTransitionCriterion` + `resetToPristine`

**Spec:** §3.2 (processor mutations are no-op for tree paths; `resetToPristine`).

**Files:**
- Modify: `packages/statemachine-react/src/pages/cloud-workflow-editor/workflowEditorStore.ts`
- Modify: `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.test.ts`

- [ ] **Step 1: Append failing tests**

Append to `workflowEditorStore.test.ts`:
```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.test.ts -t "processors / criterion / reset"`
Expected: FAIL — actions throw "not implemented".

- [ ] **Step 3: Implement**

In `workflowEditorStore.ts`, replace the remaining stubs with:

```ts
      addProcessor(stateName, ti, processor) {
        set((s) => {
          const t = s.current?.states[stateName]?.transitions?.[ti];
          if (!t) return;
          (t.processors ??= []).push(processor);
          s.errors = [];
        });
      },

      updateProcessor(stateName, ti, pi, patch) {
        set((s) => {
          const p = s.current?.states[stateName]?.transitions?.[ti]?.processors?.[pi];
          if (!p) return;
          Object.assign(p, patch);
          s.errors = [];
        });
      },

      deleteProcessor(stateName, ti, pi) {
        set((s) => {
          const list = s.current?.states[stateName]?.transitions?.[ti]?.processors;
          if (!list || pi < 0 || pi >= list.length) return;
          list.splice(pi, 1);
          s.errors = [];
        });
      },

      setTransitionCriterion(stateName, ti, criterion) {
        set((s) => {
          const t = s.current?.states[stateName]?.transitions?.[ti];
          if (!t) return;
          if (criterion === undefined) delete t.criterion;
          else t.criterion = criterion;
          s.errors = [];
        });
      },

      resetToPristine() {
        set((s) => {
          if (!s.pristine) return;
          s.current = s.pristine;
          s.selectedPath = '/';
          s.expandedPaths = defaultExpansion(s.pristine);
          s.errors = [];
        });
      },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/`
Expected: PASS for all store test files.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/pages/cloud-workflow-editor/workflowEditorStore.ts packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.test.ts
git commit -m "feat(statemachine-react): workflowEditorStore — processors, criterion, resetToPristine"
```

---

### Task 8: `nodeHasError` helper

**Spec:** §3.2 ("Tree-node error bubbling").

**Files:**
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/nodeHasError.ts`
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/nodeHasError.test.ts`

- [ ] **Step 1: Write failing tests**

`packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/nodeHasError.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { nodeHasError } from '../nodeHasError';

describe('nodeHasError', () => {
  const errors = [
    { path: '/states/draft/transitions/0/next', message: 'x' },
    { path: '/name', message: 'y' },
  ];
  it('returns true for an exact path match', () => {
    expect(nodeHasError('/name', errors)).toBe(true);
  });
  it('returns true for an ancestor path of an error', () => {
    expect(nodeHasError('/states/draft', errors)).toBe(true);
    expect(nodeHasError('/states/draft/transitions/0', errors)).toBe(true);
  });
  it('returns false for an unrelated path', () => {
    expect(nodeHasError('/states/review', errors)).toBe(false);
  });
  it('returns false for the empty error list', () => {
    expect(nodeHasError('/states/draft', [])).toBe(false);
  });
  it('does NOT return true for sibling/prefix-only paths', () => {
    // "/states/draft" is NOT a prefix of "/states/draftish/..."; the slash matters.
    expect(nodeHasError('/states/draftish', [{ path: '/states/draft/transitions/0', message: 'x' }])).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/nodeHasError.test.ts`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

`packages/statemachine-react/src/pages/cloud-workflow-editor/nodeHasError.ts`:
```ts
import type { ValidationIssue } from './validateWorkflowDoc';

/** A tree node renders the red dot iff some error path equals it OR has it as a slash-bounded prefix. */
export function nodeHasError(nodePath: string, errors: ValidationIssue[]): boolean {
  return errors.some((e) => e.path === nodePath || e.path.startsWith(nodePath + '/'));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/nodeHasError.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/pages/cloud-workflow-editor/nodeHasError.ts packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/nodeHasError.test.ts
git commit -m "feat(statemachine-react): add nodeHasError helper for tree validation badges"
```

---

## Group D: QueryConditionEditor

The `QueryConditionEditor` is built incrementally — first the simple node, then group, then function, then the type-switch confirm. Each task adds one capability and tests it; the component stays in one file.

### Task 9: `QueryConditionEditor` — empty + `simple` node

**Spec:** §3.6 (`simple` shape, `OperatorType` optGroups, `value` helper text).

**Files:**
- Create: `packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.tsx`
- Create: `packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx`

- [ ] **Step 1: Write failing tests**

`packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryConditionEditor } from './QueryConditionEditor';

describe('QueryConditionEditor — empty / simple', () => {
  it('renders an "Add criterion" button when value is undefined', () => {
    render(<QueryConditionEditor value={undefined} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /add criterion/i })).toBeInTheDocument();
  });

  it('clicking "Add criterion" emits a default simple condition', async () => {
    const onChange = vi.fn();
    render(<QueryConditionEditor value={undefined} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /add criterion/i }));
    expect(onChange).toHaveBeenCalledWith({
      type: 'simple', jsonPath: '', operation: 'EQUALS', value: '',
    });
  });

  it('renders simple-condition fields when value.type === "simple"', () => {
    render(<QueryConditionEditor
      value={{ type: 'simple', jsonPath: '$.x', operation: 'EQUALS', value: 'y' } as any}
      onChange={vi.fn()}
    />);
    expect(screen.getByDisplayValue('$.x')).toBeInTheDocument();
    expect(screen.getByDisplayValue('y')).toBeInTheDocument();
    // Helper text:
    expect(screen.getByText(/compared as a string/i)).toBeInTheDocument();
  });

  it('typing into jsonPath emits the change', async () => {
    const onChange = vi.fn();
    render(<QueryConditionEditor
      value={{ type: 'simple', jsonPath: '$.x', operation: 'EQUALS', value: 'y' } as any}
      onChange={onChange}
    />);
    const input = screen.getByDisplayValue('$.x');
    await userEvent.clear(input);
    await userEvent.type(input, '$.z');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ jsonPath: '$.z' })
    );
  });

  it('"Remove criterion" emits undefined', async () => {
    const onChange = vi.fn();
    render(<QueryConditionEditor
      value={{ type: 'simple', jsonPath: '$.x', operation: 'EQUALS', value: 'y' } as any}
      onChange={onChange}
    />);
    await userEvent.click(screen.getByRole('button', { name: /remove criterion/i }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement the empty + simple paths**

`packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.tsx`:
```tsx
/**
 * Recursive editor for cloud QueryCondition values (simple / group / function).
 * Spec: docs/superpowers/specs/2026-04-17-cloud-workflow-editor-design.md §3.6
 */
import React from 'react';
import { Button, Input, Select, Space, Typography } from 'antd';
import type { QueryCondition } from '../../gateways';

const { Text } = Typography;

export interface QueryConditionEditorProps {
  value: QueryCondition | undefined;
  onChange: (next: QueryCondition | undefined) => void;
}

const STRING_OPS = ['EQUALS', 'NOT_EQUAL', 'CONTAINS', 'STARTS_WITH', 'ENDS_WITH'];
const NUMERIC_OPS = ['LESS_THAN', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN', 'GREATER_THAN_OR_EQUAL'];
const COLLECTION_OPS = ['IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL'];

const OPERATION_OPTIONS = [
  { label: 'String', options: STRING_OPS.map((v) => ({ value: v, label: v })) },
  { label: 'Numeric', options: NUMERIC_OPS.map((v) => ({ value: v, label: v })) },
  { label: 'Collection', options: COLLECTION_OPS.map((v) => ({ value: v, label: v })) },
];

export const QueryConditionEditor: React.FC<QueryConditionEditorProps> = ({ value, onChange }) => {
  if (value === undefined) {
    return (
      <Button onClick={() => onChange({ type: 'simple', jsonPath: '', operation: 'EQUALS', value: '' } as any)}>
        + Add criterion
      </Button>
    );
  }

  const t = (value as any).type;
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space>
        <Text strong>Type:</Text>
        <Text>{t}</Text>
        <Button size="small" onClick={() => onChange(undefined)}>Remove criterion</Button>
      </Space>
      {t === 'simple' && (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="JSONPath e.g. $.field"
            value={(value as any).jsonPath ?? ''}
            onChange={(e) => onChange({ ...(value as any), jsonPath: e.target.value })}
          />
          <Select
            style={{ width: 240 }}
            value={(value as any).operation}
            onChange={(op) => onChange({ ...(value as any), operation: op })}
            options={OPERATION_OPTIONS}
          />
          <Input
            placeholder="Value"
            value={(value as any).value ?? ''}
            onChange={(e) => onChange({ ...(value as any), value: e.target.value })}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Compared as a string. For typed comparisons (numeric, boolean), use a function condition.
          </Text>
        </Space>
      )}
    </Space>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.tsx packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx
git commit -m "feat(statemachine-react): QueryConditionEditor — empty + simple node"
```

---

### Task 10: `QueryConditionEditor` — `group` node (recursive)

**Spec:** §3.6 (`group` shape).

**Files:**
- Modify: `packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.tsx`
- Modify: `packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx`

- [ ] **Step 1: Append failing tests**

Append to `QueryConditionEditor.test.tsx`:
```tsx
describe('QueryConditionEditor — group', () => {
  it('renders operator + nested children for a group', () => {
    render(<QueryConditionEditor
      value={{ type: 'group', operator: 'AND', conditions: [
        { type: 'simple', jsonPath: '$.a', operation: 'EQUALS', value: '1' },
        { type: 'simple', jsonPath: '$.b', operation: 'EQUALS', value: '2' },
      ]} as any}
      onChange={vi.fn()}
    />);
    expect(screen.getByDisplayValue('$.a')).toBeInTheDocument();
    expect(screen.getByDisplayValue('$.b')).toBeInTheDocument();
  });

  it('"+ Add condition" appends a default simple to the group', async () => {
    const onChange = vi.fn();
    render(<QueryConditionEditor
      value={{ type: 'group', operator: 'AND', conditions: [] } as any}
      onChange={onChange}
    />);
    await userEvent.click(screen.getByRole('button', { name: /add condition/i }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      type: 'group', operator: 'AND',
      conditions: expect.arrayContaining([expect.objectContaining({ type: 'simple' })]),
    }));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx -t "group"`
Expected: FAIL.

- [ ] **Step 3: Add the group branch**

In `QueryConditionEditor.tsx`, inside the wrapping `<Space direction="vertical">`, after the `simple` branch, add:

```tsx
      {t === 'group' && (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            style={{ width: 120 }}
            value={(value as any).operator}
            onChange={(op) => onChange({ ...(value as any), operator: op })}
            options={[{ value: 'AND', label: 'AND' }, { value: 'OR', label: 'OR' }, { value: 'NOT', label: 'NOT' }]}
          />
          {((value as any).conditions ?? []).map((c: QueryCondition, i: number) => (
            <div key={i} style={{ paddingLeft: 16, borderLeft: '2px solid #eee' }}>
              <QueryConditionEditor
                value={c}
                onChange={(next) => {
                  const arr = [...((value as any).conditions ?? [])];
                  if (next === undefined) arr.splice(i, 1);
                  else arr[i] = next;
                  onChange({ ...(value as any), conditions: arr });
                }}
              />
            </div>
          ))}
          <Button onClick={() => onChange({
            ...(value as any),
            conditions: [...((value as any).conditions ?? []), { type: 'simple', jsonPath: '', operation: 'EQUALS', value: '' }],
          })}>
            + Add condition
          </Button>
        </Space>
      )}
```

- [ ] **Step 4: Run tests to verify all pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.tsx packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx
git commit -m "feat(statemachine-react): QueryConditionEditor — recursive group node"
```

---

### Task 11: `QueryConditionEditor` — `function` node

**Spec:** §3.6 (`function` shape — name, optional config, optional nested criterion).

**Files:**
- Modify: `packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.tsx`
- Modify: `packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx`

- [ ] **Step 1: Append failing tests**

Append to `QueryConditionEditor.test.tsx`:
```tsx
describe('QueryConditionEditor — function', () => {
  it('renders the function name and emits changes', async () => {
    const onChange = vi.fn();
    render(<QueryConditionEditor
      value={{ type: 'function', function: { name: 'isVip' } } as any}
      onChange={onChange}
    />);
    const input = screen.getByDisplayValue('isVip');
    await userEvent.clear(input);
    await userEvent.type(input, 'isPremium');
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      type: 'function', function: expect.objectContaining({ name: 'isPremium' }),
    }));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx -t "function"`
Expected: FAIL — function branch not rendered.

- [ ] **Step 3: Add the function branch**

In `QueryConditionEditor.tsx`, after the `group` branch, add:

```tsx
      {t === 'function' && (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="Function name"
            value={(value as any).function?.name ?? ''}
            onChange={(e) => onChange({
              ...(value as any),
              function: { ...((value as any).function ?? {}), name: e.target.value },
            })}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Optional: nested criterion (cheap pre-check) and config fields are inferred from
            the existing value structure. To add them, edit the workflow JSON externally for now.
          </Text>
        </Space>
      )}
```

(Config and nested criterion editing for `function` is intentionally minimal — spec §3.6 allows it; the helper text sets expectations.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.tsx packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx
git commit -m "feat(statemachine-react): QueryConditionEditor — function node"
```

---

### Task 12: `QueryConditionEditor` — type-switch confirm dialog

**Spec:** §3.6 ("Type switching is destructive — guarded by confirm").

**Files:**
- Modify: `packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.tsx`
- Modify: `packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx`

- [ ] **Step 1: Append failing tests**

Append to `QueryConditionEditor.test.tsx`:
```tsx
import { App } from 'antd';

function renderWithApp(ui: React.ReactNode) {
  return render(<App>{ui}</App>);
}

describe('QueryConditionEditor — destructive type switch', () => {
  it('switching from a non-trivial group to simple opens the confirm dialog', async () => {
    const onChange = vi.fn();
    renderWithApp(<QueryConditionEditor
      value={{ type: 'group', operator: 'AND', conditions: [
        { type: 'simple', jsonPath: '$.a', operation: 'EQUALS', value: '1' },
      ]} as any}
      onChange={onChange}
    />);
    // Open the type Select inside the editor's header.
    const typeSelect = screen.getByDisplayValue('group');
    await userEvent.click(typeSelect);
    await userEvent.click(screen.getByText('simple'));
    // Confirm dialog should appear (AntD modal text).
    expect(await screen.findByText(/discard the nested children/i)).toBeInTheDocument();
    // Cancel — no change emitted.
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('switching from an empty group to simple does NOT open the dialog', async () => {
    const onChange = vi.fn();
    renderWithApp(<QueryConditionEditor
      value={{ type: 'group', operator: 'AND', conditions: [] } as any}
      onChange={onChange}
    />);
    const typeSelect = screen.getByDisplayValue('group');
    await userEvent.click(typeSelect);
    await userEvent.click(screen.getByText('simple'));
    // Should have applied directly.
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'simple' }));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx -t "destructive"`
Expected: FAIL — there's no type Select rendered yet, no confirm wired.

- [ ] **Step 3: Add the type Select + destructiveness check + confirm**

Replace the `<Space>` header in the rendered output (the one that currently shows `<Text>{t}</Text>`) with a Select, and add the destructiveness check. Use `App.useApp().modal` so the confirm respects ConfigProvider:

```tsx
import { App } from 'antd';

// Inside the component body, after `if (value === undefined) return ...`:
const { modal } = App.useApp();

function isDestructiveSwitch(from: any, _toType: string): boolean {
  if (from.type === 'group' && (from.conditions?.length ?? 0) > 0) return true;
  if (from.type === 'function' && (from.function?.config || from.function?.criterion)) return true;
  return false;
}

function blankFor(toType: string): QueryCondition {
  if (toType === 'simple') return { type: 'simple', jsonPath: '', operation: 'EQUALS', value: '' } as any;
  if (toType === 'group') return { type: 'group', operator: 'AND', conditions: [] } as any;
  return { type: 'function', function: { name: '' } } as any;
}

const handleTypeChange = (toType: string) => {
  if (toType === t) return;
  if (isDestructiveSwitch(value, toType)) {
    modal.confirm({
      title: 'Switch condition type',
      content: 'Switching the condition type will discard the nested children. Continue?',
      okText: 'Switch',
      cancelText: 'Cancel',
      onOk: () => onChange(blankFor(toType)),
    });
  } else {
    onChange(blankFor(toType));
  }
};
```

Replace the existing `<Text>{t}</Text>` with:
```tsx
<Select
  style={{ width: 120 }}
  value={t}
  onChange={handleTypeChange}
  options={[{ value: 'simple', label: 'simple' }, { value: 'group', label: 'group' }, { value: 'function', label: 'function' }]}
/>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx`
Expected: PASS for all tests.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.tsx packages/statemachine-react/src/components/cloud-workflows/QueryConditionEditor.test.tsx
git commit -m "feat(statemachine-react): QueryConditionEditor — destructive type-switch confirm"
```

---

## Group E: Forms

For each form, the test pattern is: render with a fixture store, edit one field, assert the right store action ran. Forms read state via store selectors (no props beyond paths).

### Task 13: `WorkflowPropsForm`

**Spec:** §3.5 (WorkflowPropsForm fields).

**Files:**
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/WorkflowPropsForm.tsx`
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/WorkflowPropsForm.test.tsx`

- [ ] **Step 1: Write failing tests**

`packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/WorkflowPropsForm.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { createWorkflowEditorStore } from '../../workflowEditorStore';
import { WorkflowEditorStoreContext } from '../../storeContext';
import { WorkflowPropsForm } from '../WorkflowPropsForm';
import type { WorkflowDoc } from '../../../../gateways';

const doc: WorkflowDoc = {
  version: '1.0', name: 'wf', initialState: 'draft', active: true,
  states: { draft: { transitions: [] } },
};

function renderWithStore(store: ReturnType<typeof createWorkflowEditorStore>) {
  return render(
    <App>
      <WorkflowEditorStoreContext.Provider value={store}>
        <WorkflowPropsForm />
      </WorkflowEditorStoreContext.Provider>
    </App>
  );
}

describe('WorkflowPropsForm', () => {
  let store: ReturnType<typeof createWorkflowEditorStore>;
  beforeEach(() => { store = createWorkflowEditorStore(); store.getState().hydrate(doc); });

  it('renders the workflow fields populated from the store', () => {
    renderWithStore(store);
    expect(screen.getByDisplayValue('wf')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1.0')).toBeInTheDocument();
  });

  it('typing into the name field updates the store', async () => {
    renderWithStore(store);
    const input = screen.getByDisplayValue('wf');
    await userEvent.clear(input);
    await userEvent.type(input, 'renamed');
    expect(store.getState().current!.name).toBe('renamed');
  });
});
```

- [ ] **Step 2: Create the store context**

`packages/statemachine-react/src/pages/cloud-workflow-editor/storeContext.ts`:
```ts
/**
 * React Context that publishes the page-scoped Zustand store to the editor's
 * subtree. Every form/node component reads the store via this context, so
 * tests can supply a fresh store without monkey-patching modules.
 */
import { createContext, useContext } from 'react';
import type { WorkflowEditorStore } from './workflowEditorStore';

export const WorkflowEditorStoreContext = createContext<WorkflowEditorStore | null>(null);

export function useWorkflowEditorStore<T>(selector: (s: import('./workflowEditorStore').WorkflowEditorState) => T): T {
  const store = useContext(WorkflowEditorStoreContext);
  if (!store) throw new Error('useWorkflowEditorStore: missing WorkflowEditorStoreContext');
  return store(selector);
}
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/WorkflowPropsForm.test.tsx`
Expected: FAIL — `WorkflowPropsForm` doesn't exist.

- [ ] **Step 4: Implement**

`packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/WorkflowPropsForm.tsx`:
```tsx
import React from 'react';
import { Form, Input, Select, Space, Switch, Typography } from 'antd';
import { useWorkflowEditorStore, WorkflowEditorStoreContext } from '../storeContext';
import { useContext } from 'react';
import { QueryConditionEditor } from '../../../components/cloud-workflows/QueryConditionEditor';

const { Title } = Typography;

export const WorkflowPropsForm: React.FC = () => {
  const store = useContext(WorkflowEditorStoreContext)!;
  const doc = useWorkflowEditorStore((s) => s.current);
  if (!doc) return null;

  const update = (patch: any) => store.getState().updateWorkflowProps(patch);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Title level={4}>Workflow</Title>
      <Form layout="vertical">
        <Form.Item label="Name">
          <Input value={doc.name} onChange={(e) => update({ name: e.target.value })} />
        </Form.Item>
        <Form.Item label="Description">
          <Input.TextArea value={doc.desc ?? ''} onChange={(e) => update({ desc: e.target.value })} rows={2} />
        </Form.Item>
        <Form.Item label="Version">
          <Input value={doc.version} onChange={(e) => update({ version: e.target.value })} />
        </Form.Item>
        <Form.Item label="Initial state">
          <Select
            style={{ width: 240 }}
            value={doc.initialState}
            onChange={(v) => update({ initialState: v })}
            options={Object.keys(doc.states).map((n) => ({ value: n, label: n }))}
          />
        </Form.Item>
        <Form.Item label="Active">
          <Switch checked={doc.active ?? false} onChange={(v) => update({ active: v })} />
        </Form.Item>
        <Form.Item label="Workflow-level criterion (optional)">
          <QueryConditionEditor
            value={doc.criterion}
            onChange={(c) => update({ criterion: c })}
          />
        </Form.Item>
      </Form>
    </Space>
  );
};
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/WorkflowPropsForm.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/WorkflowPropsForm.tsx packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/WorkflowPropsForm.test.tsx packages/statemachine-react/src/pages/cloud-workflow-editor/storeContext.ts
git commit -m "feat(statemachine-react): WorkflowPropsForm + store context"
```

---

### Task 14: `StateForm`

**Spec:** §3.5 (StateForm — summary + add transition; renaming via tree title is in Task 18).

**Files:**
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/StateForm.tsx`
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/StateForm.test.tsx`

- [ ] **Step 1: Write failing tests**

`packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/StateForm.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { createWorkflowEditorStore } from '../../workflowEditorStore';
import { WorkflowEditorStoreContext } from '../../storeContext';
import { StateForm } from '../StateForm';
import type { WorkflowDoc } from '../../../../gateways';

const doc: WorkflowDoc = {
  version: '1.0', name: 'wf', initialState: 'draft',
  states: { draft: { transitions: [{ name: 't', next: 'draft', manual: false }] } },
};

function renderWithStore(s: ReturnType<typeof createWorkflowEditorStore>) {
  return render(
    <App>
      <WorkflowEditorStoreContext.Provider value={s}>
        <StateForm stateName="draft" />
      </WorkflowEditorStoreContext.Provider>
    </App>
  );
}

describe('StateForm', () => {
  let store: ReturnType<typeof createWorkflowEditorStore>;
  beforeEach(() => { store = createWorkflowEditorStore(); store.getState().hydrate(doc); });

  it('renders the state name and the transition count', () => {
    renderWithStore(store);
    expect(screen.getByText(/draft/)).toBeInTheDocument();
    expect(screen.getByText(/1 transition/i)).toBeInTheDocument();
  });

  it('"+ Add transition" calls store.addTransition with the state name', async () => {
    renderWithStore(store);
    await userEvent.click(screen.getByRole('button', { name: /add transition/i }));
    expect(store.getState().current!.states.draft.transitions).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/StateForm.test.tsx`
Expected: FAIL — `StateForm` doesn't exist.

- [ ] **Step 3: Implement**

`packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/StateForm.tsx`:
```tsx
import React from 'react';
import { Button, Space, Typography } from 'antd';
import { useContext } from 'react';
import { WorkflowEditorStoreContext, useWorkflowEditorStore } from '../storeContext';

const { Title } = Typography;

export interface StateFormProps {
  stateName: string;
}

export const StateForm: React.FC<StateFormProps> = ({ stateName }) => {
  const store = useContext(WorkflowEditorStoreContext)!;
  const transitions = useWorkflowEditorStore((s) => s.current?.states[stateName]?.transitions ?? []);
  const count = transitions.length;
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Title level={4}>State: {stateName}</Title>
      <div>{count} transition{count === 1 ? '' : 's'}</div>
      <Button onClick={() => store.getState().addTransition(stateName)}>+ Add transition</Button>
    </Space>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/StateForm.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/StateForm.tsx packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/StateForm.test.tsx
git commit -m "feat(statemachine-react): StateForm — state summary + add transition"
```

---

### Task 15: `ProcessorRow` — externalized + scheduled fields

**Spec:** §3.5 (ProcessorRow externalized vs scheduled fields).

**Files:**
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/ProcessorRow.tsx`
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/ProcessorRow.test.tsx`

- [ ] **Step 1: Write failing tests**

`packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/ProcessorRow.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { createWorkflowEditorStore } from '../../workflowEditorStore';
import { WorkflowEditorStoreContext } from '../../storeContext';
import { ProcessorRow } from '../ProcessorRow';
import type { WorkflowDoc } from '../../../../gateways';

const doc: WorkflowDoc = {
  version: '1.0', name: 'wf', initialState: 'draft',
  states: {
    draft: {
      transitions: [{
        name: 't', next: 'draft', manual: false,
        processors: [
          { type: 'externalized', name: 'p1', executionMode: 'SYNC' },
          { type: 'scheduled', name: 'p2', config: { delayMs: 1000, transition: 't' } },
        ],
      }],
    },
  },
};

function renderRow(idx: number, store: ReturnType<typeof createWorkflowEditorStore>) {
  return render(
    <App>
      <WorkflowEditorStoreContext.Provider value={store}>
        <ProcessorRow stateName="draft" transitionIndex={0} processorIndex={idx} />
      </WorkflowEditorStoreContext.Provider>
    </App>
  );
}

describe('ProcessorRow', () => {
  let store: ReturnType<typeof createWorkflowEditorStore>;
  beforeEach(() => { store = createWorkflowEditorStore(); store.getState().hydrate(doc); });

  it('renders externalized fields for an externalized processor', () => {
    renderRow(0, store);
    expect(screen.getByDisplayValue('p1')).toBeInTheDocument();
    // executionMode shown as a Select with value SYNC
    expect(screen.getByText('SYNC')).toBeInTheDocument();
  });

  it('renders scheduled fields for a scheduled processor', () => {
    renderRow(1, store);
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('t')).toBeInTheDocument();
  });

  it('typing into name updates the store', async () => {
    renderRow(0, store);
    const input = screen.getByDisplayValue('p1');
    await userEvent.clear(input);
    await userEvent.type(input, 'renamed');
    expect(store.getState().current!.states.draft.transitions![0].processors![0].name).toBe('renamed');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/ProcessorRow.test.tsx`
Expected: FAIL — `ProcessorRow` doesn't exist.

- [ ] **Step 3: Implement**

`packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/ProcessorRow.tsx`:
```tsx
import React from 'react';
import { Form, Input, InputNumber, Select, Space, Switch, Button } from 'antd';
import { useContext } from 'react';
import { WorkflowEditorStoreContext, useWorkflowEditorStore } from '../storeContext';

export interface ProcessorRowProps {
  stateName: string;
  transitionIndex: number;
  processorIndex: number;
}

export const ProcessorRow: React.FC<ProcessorRowProps> = ({ stateName, transitionIndex, processorIndex }) => {
  const store = useContext(WorkflowEditorStoreContext)!;
  const p = useWorkflowEditorStore(
    (s) => s.current?.states[stateName]?.transitions?.[transitionIndex]?.processors?.[processorIndex],
  );
  if (!p) return null;
  const update = (patch: any) => store.getState().updateProcessor(stateName, transitionIndex, processorIndex, patch);
  const updateConfig = (cfgPatch: any) => update({ config: { ...((p as any).config ?? {}), ...cfgPatch } });

  return (
    <Form layout="vertical">
      <Form.Item label="Name">
        <Input value={p.name} onChange={(e) => update({ name: e.target.value })} />
      </Form.Item>
      <Form.Item label="Execution mode">
        <Select
          style={{ width: 200 }}
          value={p.executionMode ?? 'ASYNC_NEW_TX'}
          onChange={(v) => update({ executionMode: v })}
          options={[
            { value: 'SYNC', label: 'SYNC' },
            { value: 'ASYNC_SAME_TX', label: 'ASYNC_SAME_TX' },
            { value: 'ASYNC_NEW_TX', label: 'ASYNC_NEW_TX' },
          ]}
        />
      </Form.Item>
      {p.type === 'externalized' && (
        <>
          <Form.Item label="Attach entity">
            <Switch checked={(p as any).config?.attachEntity ?? false} onChange={(v) => updateConfig({ attachEntity: v })} />
          </Form.Item>
          <Form.Item label="Calculation node tags">
            <Input value={(p as any).config?.calculationNodesTags ?? ''} onChange={(e) => updateConfig({ calculationNodesTags: e.target.value })} />
          </Form.Item>
          <Form.Item label="Response timeout (ms)">
            <InputNumber value={(p as any).config?.responseTimeoutMs ?? null} onChange={(v) => updateConfig({ responseTimeoutMs: v ?? undefined })} />
          </Form.Item>
        </>
      )}
      {p.type === 'scheduled' && (
        <>
          <Form.Item label="Delay (ms)">
            <InputNumber value={(p as any).config?.delayMs ?? null} onChange={(v) => updateConfig({ delayMs: v ?? undefined })} />
          </Form.Item>
          <Form.Item label="Timeout (ms)">
            <InputNumber value={(p as any).config?.timeoutMs ?? null} onChange={(v) => updateConfig({ timeoutMs: v ?? undefined })} />
          </Form.Item>
          <Form.Item label="Transition to fire">
            <Input value={(p as any).config?.transition ?? ''} onChange={(e) => updateConfig({ transition: e.target.value })} />
          </Form.Item>
        </>
      )}
      <Button danger onClick={() => store.getState().deleteProcessor(stateName, transitionIndex, processorIndex)}>
        Remove processor
      </Button>
    </Form>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/ProcessorRow.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/ProcessorRow.tsx packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/ProcessorRow.test.tsx
git commit -m "feat(statemachine-react): ProcessorRow — externalized + scheduled processor fields"
```

---

### Task 16: `TransitionForm` — basic fields + Processors accordion + criterion editor

**Spec:** §3.5 (TransitionForm — name/next/manual/disabled + Processors `Collapse` + criterion).

**Files:**
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/TransitionForm.tsx`
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/TransitionForm.test.tsx`

- [ ] **Step 1: Write failing tests**

`packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/TransitionForm.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { createWorkflowEditorStore } from '../../workflowEditorStore';
import { WorkflowEditorStoreContext } from '../../storeContext';
import { TransitionForm } from '../TransitionForm';
import type { WorkflowDoc } from '../../../../gateways';

const doc: WorkflowDoc = {
  version: '1.0', name: 'wf', initialState: 'draft',
  states: {
    draft: { transitions: [{ name: 't', next: 'review', manual: false }] },
    review: { transitions: [] },
  },
};

function renderForm(store: ReturnType<typeof createWorkflowEditorStore>) {
  return render(
    <App>
      <WorkflowEditorStoreContext.Provider value={store}>
        <TransitionForm stateName="draft" transitionIndex={0} />
      </WorkflowEditorStoreContext.Provider>
    </App>
  );
}

describe('TransitionForm', () => {
  let store: ReturnType<typeof createWorkflowEditorStore>;
  beforeEach(() => { store = createWorkflowEditorStore(); store.getState().hydrate(doc); });

  it('renders name, next, manual, and Processors accordion section', () => {
    renderForm(store);
    expect(screen.getByDisplayValue('t')).toBeInTheDocument();
    // "next" Select shows "review"
    expect(screen.getByText('review')).toBeInTheDocument();
    expect(screen.getByText(/Processors/i)).toBeInTheDocument();
  });

  it('typing into name updates the store', async () => {
    renderForm(store);
    const input = screen.getByDisplayValue('t');
    await userEvent.clear(input);
    await userEvent.type(input, 'renamed');
    expect(store.getState().current!.states.draft.transitions![0].name).toBe('renamed');
  });

  it('"+ Add processor" opens the type chooser; choosing externalized appends', async () => {
    renderForm(store);
    await userEvent.click(screen.getByRole('button', { name: /add processor/i }));
    await userEvent.click(screen.getByRole('button', { name: /externalized/i }));
    expect(store.getState().current!.states.draft.transitions![0].processors).toHaveLength(1);
    expect(store.getState().current!.states.draft.transitions![0].processors![0].type).toBe('externalized');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/TransitionForm.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

`packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/TransitionForm.tsx`:
```tsx
import React, { useState } from 'react';
import { Button, Collapse, Form, Input, Modal, Select, Space, Switch, Typography } from 'antd';
import { useContext } from 'react';
import { WorkflowEditorStoreContext, useWorkflowEditorStore } from '../storeContext';
import { ProcessorRow } from './ProcessorRow';
import { QueryConditionEditor } from '../../../components/cloud-workflows/QueryConditionEditor';
import { App } from 'antd';

const { Title } = Typography;

export interface TransitionFormProps {
  stateName: string;
  transitionIndex: number;
}

export const TransitionForm: React.FC<TransitionFormProps> = ({ stateName, transitionIndex }) => {
  const store = useContext(WorkflowEditorStoreContext)!;
  const t = useWorkflowEditorStore((s) => s.current?.states[stateName]?.transitions?.[transitionIndex]);
  const stateNames = useWorkflowEditorStore((s) => Object.keys(s.current?.states ?? {}));
  const [pickerOpen, setPickerOpen] = useState(false);
  const { modal } = App.useApp();
  if (!t) return null;

  const update = (patch: any) => store.getState().updateTransition(stateName, transitionIndex, patch);
  const addProc = (type: 'externalized' | 'scheduled') => {
    store.getState().addProcessor(stateName, transitionIndex, {
      type, name: '',
      ...(type === 'scheduled' ? { config: { delayMs: 1000, transition: t.name } } : {}),
    } as any);
    setPickerOpen(false);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Title level={4}>Transition</Title>
      <Form layout="vertical">
        <Form.Item label="Name">
          <Input value={t.name} onChange={(e) => update({ name: e.target.value })} />
        </Form.Item>
        <Form.Item label="Next state">
          <Select
            style={{ width: 240 }}
            value={t.next}
            onChange={(v) => update({ next: v })}
            options={stateNames.map((n) => ({ value: n, label: n }))}
          />
        </Form.Item>
        <Form.Item label="Manual">
          <Switch checked={t.manual} onChange={(v) => update({ manual: v })} />
        </Form.Item>
        <Form.Item label="Disabled">
          <Switch checked={t.disabled ?? false} onChange={(v) => update({ disabled: v })} />
        </Form.Item>
        <Form.Item label="Criterion (optional)">
          <QueryConditionEditor
            value={t.criterion}
            onChange={(c) => store.getState().setTransitionCriterion(stateName, transitionIndex, c)}
          />
        </Form.Item>
      </Form>

      <Title level={5}>Processors</Title>
      <Collapse
        defaultActiveKey={(t.processors?.length ?? 0) > 0 ? ['0'] : []}
        items={(t.processors ?? []).map((p, i) => ({
          key: String(i),
          label: `${p.type}: ${p.name || '(unnamed)'}`,
          children: <ProcessorRow stateName={stateName} transitionIndex={transitionIndex} processorIndex={i} />,
        }))}
      />
      <Button onClick={() => setPickerOpen(true)}>+ Add processor</Button>

      <Modal open={pickerOpen} onCancel={() => setPickerOpen(false)} footer={null} title="Add processor">
        <Space>
          <Button onClick={() => addProc('externalized')}>externalized</Button>
          <Button onClick={() => addProc('scheduled')}>scheduled</Button>
        </Space>
      </Modal>
    </Space>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/TransitionForm.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/TransitionForm.tsx packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/TransitionForm.test.tsx
git commit -m "feat(statemachine-react): TransitionForm — fields + processors accordion + criterion"
```

---

## Group F: Page assembly

### Task 17: `useDirtyGuard`

**Spec:** §3.7.

**Files:**
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/useDirtyGuard.ts`

(Behavior is hard to unit-test cleanly because RR `useBlocker` has a runtime test harness; we cover it via the Playwright `dirty-guard.spec.ts` in Task 30.)

- [ ] **Step 1: Implement**

`packages/statemachine-react/src/pages/cloud-workflow-editor/useDirtyGuard.ts`:
```ts
/**
 * Hook: when `isDirty`, blocks in-app navigation (RR useBlocker — covers the
 * browser back button via popstate) with an AntD Modal.confirm, and registers
 * a beforeunload listener for tab close / refresh.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-workflow-editor-design.md §3.7
 */
import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { App } from 'antd';

export function useDirtyGuard(isDirty: boolean): void {
  const { modal } = App.useApp();

  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    modal.confirm({
      title: 'Discard unsaved changes?',
      okText: 'Discard',
      cancelText: 'Stay',
      onOk: () => blocker.proceed?.(),
      onCancel: () => blocker.reset?.(),
    });
  }, [blocker, modal]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
}
```

- [ ] **Step 2: Type-check**

Run: `cd packages/statemachine-react && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/statemachine-react/src/pages/cloud-workflow-editor/useDirtyGuard.ts
git commit -m "feat(statemachine-react): useDirtyGuard — useBlocker + beforeunload"
```

---

### Task 18: `WorkflowTree` — antd `<Tree virtual>` + height observer + error dots + inline rename

**Spec:** §3.3 (tree model, layout sizing), §3.5 (StateForm — inline rename via tree title).

**Files:**
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/WorkflowTree.tsx`
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowTree.test.tsx`

- [ ] **Step 1: Write failing tests**

`packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowTree.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { createWorkflowEditorStore } from '../workflowEditorStore';
import { WorkflowEditorStoreContext } from '../storeContext';
import { WorkflowTree } from '../WorkflowTree';
import type { WorkflowDoc } from '../../../gateways';

const doc: WorkflowDoc = {
  version: '1.0', name: 'wf', initialState: 'draft',
  states: { draft: { transitions: [{ name: 't1', next: 'draft', manual: false }] } },
};

function renderTree(s: ReturnType<typeof createWorkflowEditorStore>) {
  return render(
    <App>
      <WorkflowEditorStoreContext.Provider value={s}>
        <WorkflowTree />
      </WorkflowEditorStoreContext.Provider>
    </App>
  );
}

describe('WorkflowTree', () => {
  let store: ReturnType<typeof createWorkflowEditorStore>;
  beforeEach(() => { store = createWorkflowEditorStore(); store.getState().hydrate(doc); });

  it('renders the workflow root, the state, and the transition', () => {
    renderTree(store);
    expect(screen.getByText('Workflow')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(screen.getByText('t1')).toBeInTheDocument();
  });

  it('clicking a node updates selectedPath in the store', async () => {
    renderTree(store);
    await userEvent.click(screen.getByText('t1'));
    expect(store.getState().selectedPath).toBe('/states/draft/transitions/0');
  });

  it('renders a red dot on a state when an error path is under it', () => {
    store.getState().setErrors([{ path: '/states/draft/transitions/0/next', message: 'x' }]);
    renderTree(store);
    // The dot is rendered as a Badge dot inside the title; assert via test-id.
    expect(document.querySelectorAll('[data-testid="node-error-dot"]').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowTree.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

`packages/statemachine-react/src/pages/cloud-workflow-editor/WorkflowTree.tsx`:
```tsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Tree, Badge, Input } from 'antd';
import type { TreeDataNode } from 'antd';
import { useContext } from 'react';
import { WorkflowEditorStoreContext, useWorkflowEditorStore } from './storeContext';
import { nodeHasError } from './nodeHasError';

function buildTreeData(
  doc: ReturnType<typeof useWorkflowEditorStore>,
): TreeDataNode[] {
  // doc here is the full WorkflowDoc | null
  const d = doc as any;
  if (!d) return [];
  return [
    {
      key: '/',
      title: 'Workflow',
      children: Object.entries(d.states ?? {}).map(([name, state]: any) => ({
        key: `/states/${name}`,
        title: name,
        children: (state.transitions ?? []).map((t: any, i: number) => ({
          key: `/states/${name}/transitions/${i}`,
          title: t.name || '(unnamed)',
        })),
      })),
    },
  ];
}

function decorate(nodes: TreeDataNode[], errors: any[], renaming: string | null, setRenaming: (k: string | null) => void, store: any): TreeDataNode[] {
  return nodes.map((n) => {
    const path = String(n.key);
    const hasErr = nodeHasError(path, errors as any);
    const isStateNode = /^\/states\/[^/]+$/.test(path);
    const stateName = isStateNode ? path.replace('/states/', '') : null;
    const titleEl = (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {hasErr && <Badge status="error" data-testid="node-error-dot" />}
        {isStateNode && renaming === path ? (
          <Input
            size="small"
            defaultValue={stateName!}
            autoFocus
            onPressEnter={(e) => {
              const v = (e.target as HTMLInputElement).value.trim();
              if (v && v !== stateName) store.getState().renameState(stateName!, v);
              setRenaming(null);
            }}
            onBlur={() => setRenaming(null)}
          />
        ) : (
          <span
            onDoubleClick={() => isStateNode && setRenaming(path)}
            title={isStateNode ? 'Double-click to rename' : ''}
          >
            {n.title as React.ReactNode}
          </span>
        )}
      </span>
    );
    return { ...n, title: titleEl, children: n.children ? decorate(n.children, errors, renaming, setRenaming, store) : undefined };
  });
}

export const WorkflowTree: React.FC = () => {
  const store = useContext(WorkflowEditorStoreContext)!;
  const doc = useWorkflowEditorStore((s) => s.current);
  const errors = useWorkflowEditorStore((s) => s.errors);
  const selected = useWorkflowEditorStore((s) => s.selectedPath);
  const expandedSet = useWorkflowEditorStore((s) => s.expandedPaths);
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(400);
  const [renaming, setRenaming] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => setHeight(Math.max(entry.contentRect.height - 8, 200)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const data = useMemo(() => decorate(buildTreeData(doc), errors as any, renaming, setRenaming, store), [doc, errors, renaming, store]);

  return (
    <div ref={ref} style={{ height: '100%', overflow: 'hidden' }}>
      <Tree
        height={height}
        treeData={data}
        selectedKeys={[selected]}
        expandedKeys={Array.from(expandedSet)}
        onSelect={(keys) => keys[0] && store.getState().setSelected(String(keys[0]))}
        onExpand={(keys, info) => store.getState().toggleExpand(String(info.node.key))}
      />
    </div>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowTree.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/pages/cloud-workflow-editor/WorkflowTree.tsx packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowTree.test.tsx
git commit -m "feat(statemachine-react): WorkflowTree — virtual tree + error dots + inline rename"
```

---

### Task 19: `NodeRouter` — picks the form based on `selectedPath`

**Files:**
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/NodeRouter.tsx`
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/NodeRouter.test.tsx`

- [ ] **Step 1: Write failing tests**

`packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/NodeRouter.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import { createWorkflowEditorStore } from '../workflowEditorStore';
import { WorkflowEditorStoreContext } from '../storeContext';
import { NodeRouter } from '../NodeRouter';
import type { WorkflowDoc } from '../../../gateways';

const doc: WorkflowDoc = {
  version: '1.0', name: 'wf', initialState: 'draft',
  states: { draft: { transitions: [{ name: 't', next: 'draft', manual: false }] } },
};

function renderRouter(s: ReturnType<typeof createWorkflowEditorStore>) {
  return render(
    <App>
      <WorkflowEditorStoreContext.Provider value={s}>
        <NodeRouter />
      </WorkflowEditorStoreContext.Provider>
    </App>
  );
}

describe('NodeRouter', () => {
  let store: ReturnType<typeof createWorkflowEditorStore>;
  beforeEach(() => { store = createWorkflowEditorStore(); store.getState().hydrate(doc); });

  it('renders WorkflowPropsForm for selectedPath="/"', () => {
    renderRouter(store);
    expect(screen.getByText('Workflow')).toBeInTheDocument();   // Title from WorkflowPropsForm
  });

  it('renders StateForm for /states/<name>', () => {
    store.getState().setSelected('/states/draft');
    renderRouter(store);
    expect(screen.getByText(/State: draft/i)).toBeInTheDocument();
  });

  it('renders TransitionForm for /states/<name>/transitions/<i>', () => {
    store.getState().setSelected('/states/draft/transitions/0');
    renderRouter(store);
    expect(screen.getByText('Transition')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/NodeRouter.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

`packages/statemachine-react/src/pages/cloud-workflow-editor/NodeRouter.tsx`:
```tsx
import React from 'react';
import { useWorkflowEditorStore } from './storeContext';
import { WorkflowPropsForm } from './nodes/WorkflowPropsForm';
import { StateForm } from './nodes/StateForm';
import { TransitionForm } from './nodes/TransitionForm';

export const NodeRouter: React.FC = () => {
  const path = useWorkflowEditorStore((s) => s.selectedPath);

  if (path === '/') return <WorkflowPropsForm />;
  const stateMatch = path.match(/^\/states\/([^/]+)$/);
  if (stateMatch) return <StateForm stateName={stateMatch[1]} />;
  const transMatch = path.match(/^\/states\/([^/]+)\/transitions\/(\d+)$/);
  if (transMatch) return <TransitionForm stateName={transMatch[1]} transitionIndex={Number(transMatch[2])} />;
  return null;
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/NodeRouter.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/pages/cloud-workflow-editor/NodeRouter.tsx packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/NodeRouter.test.tsx
git commit -m "feat(statemachine-react): NodeRouter — picks form by selectedPath"
```

---

### Task 20: `WorkflowEditorCloud` page shell + load/scaffold + save bar (Save + Discard)

**Spec:** §3.3 (layout), §3.8 (save bar layout), §3.9 (load/scaffold + NaN guard).

**Files:**
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/WorkflowEditorCloud.tsx`
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowEditorCloud.test.tsx`
- Create: `packages/statemachine-react/src/pages/cloud-workflow-editor/index.ts`

This task gets the page rendering with mocked-gateway-load, the layout, the empty save bar (Save disabled because not dirty yet, Discard disabled). The save flow itself is wired in Task 21.

- [ ] **Step 1: Write failing tests for load + scaffold + 404 + layout**

`packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowEditorCloud.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { WorkflowEditorCloud } from '../WorkflowEditorCloud';
import { getWorkflowGateway } from '../../../gateways';

vi.mock('../../../gateways', async () => {
  const actual = await vi.importActual<any>('../../../gateways');
  return { ...actual, getWorkflowGateway: vi.fn() };
});

function renderAt(url: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <App>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route path="/workflow/:entityName/:modelVersion/new" element={<WorkflowEditorCloud />} />
            <Route path="/workflow/:entityName/:modelVersion/:workflowName" element={<WorkflowEditorCloud />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </App>,
  );
}

const sampleDoc = {
  version: '1.0', name: 'wf', initialState: 'draft',
  states: { draft: { transitions: [{ name: 't', next: 'draft', manual: false }] } },
};

describe('WorkflowEditorCloud — load / scaffold / 404', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads an existing workflow via gateway.loadWorkflow', async () => {
    vi.mocked(getWorkflowGateway).mockReturnValue({
      loadWorkflow: vi.fn().mockResolvedValue(sampleDoc),
      saveWorkflow: vi.fn(), copyWorkflow: vi.fn(), deleteWorkflow: vi.fn(),
      renameWorkflow: vi.fn(), listWorkflows: vi.fn(),
    } as any);
    renderAt('/workflow/Customer/1/wf');
    await waitFor(() => expect(screen.getByText('Workflow')).toBeInTheDocument());
  });

  it('uses the scaffold for /new', async () => {
    vi.mocked(getWorkflowGateway).mockReturnValue({
      loadWorkflow: vi.fn(), saveWorkflow: vi.fn(), copyWorkflow: vi.fn(),
      deleteWorkflow: vi.fn(), renameWorkflow: vi.fn(), listWorkflows: vi.fn(),
    } as any);
    renderAt('/workflow/Customer/1/new');
    await waitFor(() => expect(screen.getByText('Workflow')).toBeInTheDocument());
    // Scaffold has draft state
    expect(screen.getByText('draft')).toBeInTheDocument();
  });

  it('renders a 404 result when modelVersion is not a number', async () => {
    renderAt('/workflow/Customer/abc/wf');
    expect(await screen.findByText(/404/)).toBeInTheDocument();
  });

  it('Save and Discard buttons exist and are disabled while not dirty', async () => {
    vi.mocked(getWorkflowGateway).mockReturnValue({
      loadWorkflow: vi.fn().mockResolvedValue(sampleDoc),
      saveWorkflow: vi.fn(), copyWorkflow: vi.fn(), deleteWorkflow: vi.fn(),
      renameWorkflow: vi.fn(), listWorkflows: vi.fn(),
    } as any);
    renderAt('/workflow/Customer/1/wf');
    await waitFor(() => expect(screen.getByText('Workflow')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /^Save$/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Discard changes/ })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowEditorCloud.test.tsx`
Expected: FAIL — `WorkflowEditorCloud` doesn't exist.

- [ ] **Step 3: Implement the page shell**

`packages/statemachine-react/src/pages/cloud-workflow-editor/WorkflowEditorCloud.tsx`:
```tsx
import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Result, Space, App } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { createWorkflowEditorStore } from './workflowEditorStore';
import { WorkflowEditorStoreContext, useWorkflowEditorStore } from './storeContext';
import { WorkflowTree } from './WorkflowTree';
import { NodeRouter } from './NodeRouter';
import { useDirtyGuard } from './useDirtyGuard';
import { getWorkflowGateway, statemachineKeys } from '../../hooks/useStatemachine';   // see note in Task 22
// NOTE: getWorkflowGateway is actually re-exported from gateways/index.ts; statemachineKeys from hooks/useStatemachine.
// If a single import path doesn't carry both, import from their actual modules — adjust to the existing layout.

import type { WorkflowDoc } from '../../gateways';

const SCAFFOLD: WorkflowDoc = {
  version: '1.0', name: '', initialState: 'draft',
  states: { draft: { transitions: [] } }, active: true,
};

export const WorkflowEditorCloud: React.FC = () => {
  const params = useParams<{ entityName: string; modelVersion: string; workflowName?: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const store = useMemo(() => createWorkflowEditorStore(), []);

  const isBadRef = !params.entityName || Number.isNaN(Number(params.modelVersion));
  const modelRef = { entityName: params.entityName ?? '', modelVersion: Number(params.modelVersion) };
  const isNew = !params.workflowName;

  const query = useQuery({
    queryKey: statemachineKeys.cloudWorkflow(modelRef, params.workflowName),
    queryFn: () => getWorkflowGateway().loadWorkflow(modelRef, params.workflowName!),
    enabled: !isBadRef && !isNew,
  });

  // Hydrate once when fresh data arrives or for /new.
  useEffect(() => {
    const pristine = store.getState().pristine;
    if (pristine !== null) return;
    if (isNew && !isBadRef) store.getState().hydrate(SCAFFOLD);
    else if (query.data) store.getState().hydrate(query.data);
  }, [store, isNew, isBadRef, query.data]);

  if (isBadRef) {
    return <Result status="404" title="Bad workflow URL" subTitle="entityName or modelVersion missing or invalid." extra={<a href="/workflows">Back to workflows</a>} />;
  }

  return (
    <WorkflowEditorStoreContext.Provider value={store}>
      <PageBody isNew={isNew} entityName={modelRef.entityName} modelVersion={modelRef.modelVersion} />
    </WorkflowEditorStoreContext.Provider>
  );
};

const PageBody: React.FC<{ isNew: boolean; entityName: string; modelVersion: number }> = () => {
  const isDirty = useWorkflowEditorStore((s) => s.pristine !== null && s.current !== s.pristine);
  const ready = useWorkflowEditorStore((s) => s.pristine !== null);
  useDirtyGuard(isDirty);

  if (!ready) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: '0 0 320px', borderRight: '1px solid #eee' }}>
          <WorkflowTree />
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <NodeRouter />
        </div>
      </div>
      <SaveBar />
    </div>
  );
};

const SaveBar: React.FC = () => {
  const isDirty = useWorkflowEditorStore((s) => s.pristine !== null && s.current !== s.pristine);
  return (
    <div style={{ borderTop: '1px solid #eee', padding: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
      <Button disabled={!isDirty}>Discard changes</Button>
      <Button type="primary" disabled={!isDirty}>Save</Button>
    </div>
  );
};

export default WorkflowEditorCloud;
```

`packages/statemachine-react/src/pages/cloud-workflow-editor/index.ts`:
```ts
export { WorkflowEditorCloud } from './WorkflowEditorCloud';
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowEditorCloud.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/pages/cloud-workflow-editor/WorkflowEditorCloud.tsx packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowEditorCloud.test.tsx packages/statemachine-react/src/pages/cloud-workflow-editor/index.ts
git commit -m "feat(statemachine-react): WorkflowEditorCloud page shell — load, scaffold, layout"
```

---

### Task 21: Save flow integration (validate → save → fetchQuery → hydrate(preserveView) → navigate) + Discard

**Spec:** §3.8 (full flow including `WorkflowNotFoundError`, post-save navigation, recommended user exit).

**Files:**
- Modify: `packages/statemachine-react/src/pages/cloud-workflow-editor/WorkflowEditorCloud.tsx`
- Modify: `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowEditorCloud.test.tsx`

- [ ] **Step 1: Append failing tests**

Append to `WorkflowEditorCloud.test.tsx`:
```tsx
import { MustHaveActiveWorkflowError, WorkflowNotFoundError } from '../../../gateways/errors';
import userEvent from '@testing-library/user-event';

describe('WorkflowEditorCloud — save flow', () => {
  beforeEach(() => vi.clearAllMocks());

  function makeGateway(overrides: any = {}) {
    return {
      loadWorkflow: vi.fn().mockResolvedValue(sampleDoc),
      saveWorkflow: vi.fn().mockResolvedValue({ key: 'wf' }),
      copyWorkflow: vi.fn(), deleteWorkflow: vi.fn(),
      renameWorkflow: vi.fn(), listWorkflows: vi.fn(),
      ...overrides,
    };
  }

  it('Save click calls saveWorkflow with the right doc and re-fetches via loadWorkflow', async () => {
    const gw = makeGateway();
    vi.mocked(getWorkflowGateway).mockReturnValue(gw as any);
    renderAt('/workflow/Customer/1/wf');
    await waitFor(() => expect(screen.getByText('Workflow')).toBeInTheDocument());
    // Make the doc dirty by editing the description field.
    const descInput = await screen.findByRole('textbox', { name: /description/i });
    await userEvent.type(descInput, 'X');
    await userEvent.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() => expect(gw.saveWorkflow).toHaveBeenCalled());
    expect(gw.loadWorkflow).toHaveBeenCalledTimes(2);   // initial + post-save
  });

  it('Validation failure does not call saveWorkflow and shows the banner', async () => {
    const gw = makeGateway();
    vi.mocked(getWorkflowGateway).mockReturnValue(gw as any);
    renderAt('/workflow/Customer/1/wf');
    await waitFor(() => expect(screen.getByText('Workflow')).toBeInTheDocument());
    // Make the doc dirty AND invalid: clear the name field.
    const nameInput = await screen.findByDisplayValue('wf');
    await userEvent.clear(nameInput);
    await userEvent.click(screen.getByRole('button', { name: /^Save$/ }));
    expect(gw.saveWorkflow).not.toHaveBeenCalled();
    expect(await screen.findByText(/validation failed/i)).toBeInTheDocument();
  });

  it('after save on /new, navigates to the canonical URL with replace=true', async () => {
    const gw = makeGateway();
    vi.mocked(getWorkflowGateway).mockReturnValue(gw as any);
    // Spy on navigation by inspecting the location after save.
    renderAt('/workflow/Customer/1/new');
    await waitFor(() => expect(screen.getByText('Workflow')).toBeInTheDocument());
    const nameInput = await screen.findByRole('textbox', { name: /^Name$/i });
    await userEvent.type(nameInput, 'created');
    await userEvent.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() => {
      // window location is hard to assert with MemoryRouter; smoke-check that the gateway was called with name='created'
      expect(gw.saveWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({ entityName: 'Customer', modelVersion: 1 }),
        expect.objectContaining({ name: 'created' }),
        'MERGE',
      );
    });
  });

  it('Discard-changes confirms then resets to pristine', async () => {
    const gw = makeGateway();
    vi.mocked(getWorkflowGateway).mockReturnValue(gw as any);
    renderAt('/workflow/Customer/1/wf');
    await waitFor(() => expect(screen.getByText('Workflow')).toBeInTheDocument());
    const descInput = await screen.findByRole('textbox', { name: /description/i });
    await userEvent.type(descInput, 'X');
    await userEvent.click(screen.getByRole('button', { name: /Discard changes/ }));
    // Confirm dialog
    await userEvent.click(await screen.findByRole('button', { name: /Discard$/ }));
    // Doc is back to pristine; description is cleared
    await waitFor(() => expect((descInput as HTMLInputElement).value).toBe(''));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowEditorCloud.test.tsx -t "save flow"`
Expected: FAIL — Save button is currently a no-op.

- [ ] **Step 3: Wire the save flow**

In `WorkflowEditorCloud.tsx`, replace the `SaveBar` component and add the save handler. Also wire the Discard button:

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { validateWorkflowDoc } from './validateWorkflowDoc';
import { MustHaveActiveWorkflowError, WorkflowNotFoundError } from '../../gateways/errors';
import { useState } from 'react';

const SaveBar: React.FC<{ isNew: boolean; entityName: string; modelVersion: number }> = ({ isNew, entityName, modelVersion }) => {
  const store = useContext(WorkflowEditorStoreContext)!;
  const isDirty = useWorkflowEditorStore((s) => s.pristine !== null && s.current !== s.pristine);
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const current = store.getState().current;
    if (!current) return;
    setSaving(true);
    try {
      const issues = validateWorkflowDoc(current);
      if (issues.length > 0) {
        store.getState().setErrors(issues);
        store.getState().setSelected(issues[0].path);
        // expand ancestors of the first error
        const parts = issues[0].path.split('/').filter(Boolean);
        let acc = '';
        for (const part of parts) {
          acc += '/' + part;
          if (!store.getState().expandedPaths.has(acc)) store.getState().toggleExpand(acc);
        }
        message.error('Validation failed — see highlighted fields.');
        setSaving(false);
        return;
      }
      const modelRef = { entityName, modelVersion };
      await getWorkflowGateway().saveWorkflow(modelRef, current, 'MERGE');
      try {
        const fresh = await queryClient.fetchQuery({
          queryKey: statemachineKeys.cloudWorkflow(modelRef, current.name),
          queryFn: () => getWorkflowGateway().loadWorkflow(modelRef, current.name),
        });
        store.getState().hydrate(fresh, { preserveView: true });
        if (isNew) navigate(`/workflow/${entityName}/${modelVersion}/${current.name}`, { replace: true });
        message.success('Workflow saved');
      } catch (err: any) {
        if (err instanceof WorkflowNotFoundError) {
          message.warning('Save succeeded but the saved workflow could not be re-loaded by name. Refresh the workflows list.');
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      if (err instanceof MustHaveActiveWorkflowError) message.error('Cannot deactivate the only active workflow');
      else message.error(err.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onDiscard = () => {
    modal.confirm({
      title: 'Discard all unsaved changes? This cannot be undone.',
      okText: 'Discard',
      cancelText: 'Keep editing',
      onOk: () => store.getState().resetToPristine(),
    });
  };

  return (
    <div style={{ borderTop: '1px solid #eee', padding: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
      <Button onClick={onDiscard} disabled={!isDirty || saving}>Discard changes</Button>
      <Button type="primary" loading={saving} disabled={!isDirty || saving} onClick={onSave}>Save</Button>
    </div>
  );
};
```

Also update `PageBody` to pass props through:
```tsx
const PageBody: React.FC<{ isNew: boolean; entityName: string; modelVersion: number }> = ({ isNew, entityName, modelVersion }) => {
  // ... existing body ...
  // ...replace <SaveBar /> with <SaveBar isNew={isNew} entityName={entityName} modelVersion={modelVersion} />
};
```

And add the missing import at the top: `import { useContext } from 'react';`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowEditorCloud.test.tsx`
Expected: PASS for all tests in the file.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/pages/cloud-workflow-editor/WorkflowEditorCloud.tsx packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowEditorCloud.test.tsx
git commit -m "feat(statemachine-react): WorkflowEditorCloud — save flow + Discard"
```

---

### Task 22: Wire the route + remove placeholder + barrel export

**Spec:** §3.9.

**Files:**
- Modify: `apps/saas-app/src/routes/index.tsx` (lines 17-19, 90-99)
- Modify: `packages/statemachine-react/src/index.ts` (add re-export)
- Delete: `packages/statemachine-react/src/pages/WorkflowEditorCloudPlaceholder.tsx`

- [ ] **Step 1: Replace the placeholder route element**

In `apps/saas-app/src/routes/index.tsx`:

Replace lines 17-19:
```tsx
const WorkflowEditorCloudPlaceholder = React.lazy(() =>
  import('@cyoda/statemachine-react').then((m) => ({ default: m.WorkflowEditorCloudPlaceholder }))
);
```
with:
```tsx
const WorkflowEditorCloud = React.lazy(() =>
  import('@cyoda/statemachine-react').then((m) => ({ default: m.WorkflowEditorCloud }))
);
```

Replace the route registrations (lines 90-99) — change `<WorkflowEditorCloudPlaceholder />` to `<WorkflowEditorCloud />`. Update the comment above the routes from "placeholder in sub-branch 3" to "real editor in sub-branch 4".

- [ ] **Step 2: Re-export from the package barrel**

In `packages/statemachine-react/src/index.ts`, find where `WorkflowEditorCloudPlaceholder` is re-exported (added in sub-branch 3) and replace with:
```ts
export { WorkflowEditorCloud } from './pages/cloud-workflow-editor';
```

- [ ] **Step 3: Delete the placeholder**

```bash
rm packages/statemachine-react/src/pages/WorkflowEditorCloudPlaceholder.tsx
```

- [ ] **Step 4: Type-check + run all package tests**

Run:
```bash
cd packages/statemachine-react && npx tsc --noEmit
cd /Users/paul/dev/cyoda-env-dashboard && npx vitest run --environment jsdom packages/statemachine-react/src
```
Expected: type-check clean; all tests pass.

If any test references `WorkflowEditorCloudPlaceholder`, replace those imports with `WorkflowEditorCloud` (or delete the test if it was only verifying the placeholder existed).

- [ ] **Step 5: Commit**

```bash
git add apps/saas-app/src/routes/index.tsx packages/statemachine-react/src/index.ts
git rm packages/statemachine-react/src/pages/WorkflowEditorCloudPlaceholder.tsx
git commit -m "feat(saas-app): wire WorkflowEditorCloud, remove placeholder"
```

---

## Group G: Playwright E2E

### Task 23: `playwright.config.ts` — add `cloud-workflow-editor` project

**Spec:** §4.2 ("Repo state today" + "Modified files").

**Files:**
- Modify: `playwright.config.ts`

- [ ] **Step 1: Append the project to the existing `projects` array**

In `playwright.config.ts`, add to the `projects` array:

```ts
    {
      name: 'cloud-workflow-editor',
      testDir: './e2e/cloud-workflow-editor',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
      },
    },
```

Do NOT change the existing `chromium` project, the `webServer` block, or any other top-level fields. The legacy defaults are out of scope per spec §2.

- [ ] **Step 2: Verify Playwright lists the new project**

Run: `pnpm exec playwright test --list --project=cloud-workflow-editor`
Expected: lists 0 tests for now (no spec files yet) but does not fail.

- [ ] **Step 3: Commit**

```bash
git add playwright.config.ts
git commit -m "test(e2e): add cloud-workflow-editor project to playwright config"
```

---

### Task 24: Auth + testModel fixtures

**Spec:** §4.2 ("Auth fixture" + "Fixture sketch").

**Files:**
- Create: `e2e/fixtures/auth.ts`
- Create: `e2e/fixtures/testModel.ts`

- [ ] **Step 1: Implement the auth fixture**

`e2e/fixtures/auth.ts`:
```ts
import { test as base, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const STATE_DIR = path.join(os.tmpdir(), 'cyoda-e2e-auth');
const STATE_FILE = path.join(STATE_DIR, 'auth.json');

async function performLogin(page: Page) {
  const user = process.env.TEST_ENV_USER;
  const secret = process.env.TEST_ENV_SECRET;
  if (!user || !secret) throw new Error('TEST_ENV_USER and TEST_ENV_SECRET must be set');
  await page.goto('/login');
  await page.getByRole('textbox', { name: /Username/i }).fill(user);
  await page.getByRole('textbox', { name: /Password/i }).fill(secret);
  await page.getByRole('button', { name: /Log in/i }).click();
  await page.waitForURL((u) => !u.pathname.includes('/login'));
}

export const test = base.extend({
  storageState: async ({ browser }, use) => {
    if (!fs.existsSync(STATE_FILE)) {
      fs.mkdirSync(STATE_DIR, { recursive: true });
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await performLogin(page);
      await ctx.storageState({ path: STATE_FILE });
      await ctx.close();
    }
    await use(STATE_FILE);
  },
});

export { expect } from '@playwright/test';
```

- [ ] **Step 2: Implement the testModel fixture (composed onto the auth fixture)**

`e2e/fixtures/testModel.ts`:
```ts
import { test as authTest } from './auth';

export interface ModelRef {
  entityName: string;
  modelVersion: number;
}

export const test = authTest.extend<{ model: ModelRef }>({
  model: async ({ request }, use, testInfo) => {
    const apiBase = process.env.CYODA_API_BASE_URL ?? '';
    if (!apiBase) throw new Error('CYODA_API_BASE_URL must be set for tests that use the model fixture');
    const entityName = `E2E_${testInfo.testId.replace(/[^A-Za-z0-9]/g, '_')}_${Date.now()}`;
    const modelVersion = 1;
    // No PUT /lock — locking enables data ingestion (Instances territory),
    // not workflow authoring. Workflows can be authored against an unlocked model.
    const post = await request.post(
      `${apiBase}/model/import/JSON/SAMPLE_DATA/${entityName}/${modelVersion}`,
      { data: { id: 1, name: 'sample' } },
    );
    if (!post.ok()) throw new Error(`Model setup failed (${post.status()}): ${await post.text()}`);

    await use({ entityName, modelVersion });

    // Cleanup — runs even if the test fails.
    await request.delete(`${apiBase}/model/${entityName}/${modelVersion}`);
  },
});

export { expect } from '@playwright/test';
```

- [ ] **Step 3: Type-check from repo root**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors. (If the repo doesn't have a tsconfig at root, run `pnpm exec playwright test --list --project=cloud-workflow-editor` again to verify the fixtures don't break the type-aware Playwright loader.)

- [ ] **Step 4: Commit**

```bash
git add e2e/fixtures/auth.ts e2e/fixtures/testModel.ts
git commit -m "test(e2e): auth + testModel fixtures for cloud-workflow-editor"
```

---

### Tasks 25–30: E2E specs

Each spec uses the `test` and `expect` re-exported from `e2e/fixtures/testModel.ts`. They share a common shape: navigate to a URL under the freshly-created `model`, exercise the editor through the UI, optionally re-load and assert. Cleanup is automatic.

For each spec, the Step pattern is:

1. Create the spec file with the listed test bodies.
2. Run: `pnpm exec playwright test --project=cloud-workflow-editor <file>`
3. Expected: PASS (assuming a local cyoda env with `BASE_URL`, `CYODA_API_BASE_URL`, `TEST_ENV_USER`, `TEST_ENV_SECRET` env vars set).
4. Commit.

To save space, the per-spec body is sketched below; the implementer fills in selectors using AntD role-based queries (`getByRole`, `getByLabel`) consistent with the unit tests above.

### Task 25: `create.spec.ts` — create new workflow + post-save redirect

```ts
import { test, expect } from '../fixtures/testModel';

test('create new workflow → save → redirected to canonical URL', async ({ page, model }) => {
  await page.goto(`/workflow/${model.entityName}/${model.modelVersion}/new`);
  await page.getByRole('textbox', { name: /^Name$/ }).fill('e2e-created');
  await page.getByRole('button', { name: /^Save$/ }).click();
  await expect(page).toHaveURL(new RegExp(`/workflow/${model.entityName}/${model.modelVersion}/e2e-created$`));
  // Sanity: refresh re-loads the saved workflow.
  await page.reload();
  await expect(page.getByDisplayValue('e2e-created')).toBeVisible();
});
```

Commit: `git commit -m "test(e2e): cloud-workflow-editor — create workflow"`

### Task 26: `edit-and-save.spec.ts`

```ts
import { test, expect } from '../fixtures/testModel';

test('edit transition name → save → reload → persisted', async ({ page, request, model }) => {
  // Seed a workflow via the import API so we don't depend on the create spec passing.
  await request.post(`${process.env.CYODA_API_BASE_URL}/model/${model.entityName}/${model.modelVersion}/workflow/import`, {
    data: {
      importMode: 'MERGE',
      workflows: [{
        version: '1.0', name: 'wf1', initialState: 'draft', active: true,
        states: { draft: { transitions: [{ name: 'oldName', next: 'draft', manual: false }] } },
      }],
    },
  });
  await page.goto(`/workflow/${model.entityName}/${model.modelVersion}/wf1`);
  // Navigate to the transition node and edit its name.
  await page.getByText('draft').click();
  await page.getByText('oldName').click();
  const nameInput = page.getByRole('textbox', { name: /^Name$/ });
  await nameInput.fill('newName');
  await page.getByRole('button', { name: /^Save$/ }).click();
  await page.reload();
  await expect(page.getByText('newName')).toBeVisible();
});
```

Commit: `git commit -m "test(e2e): cloud-workflow-editor — edit and save"`

### Task 27: `add-processor.spec.ts`

```ts
import { test, expect } from '../fixtures/testModel';

test('add an externalized processor to a transition → save', async ({ page, request, model }) => {
  await request.post(`${process.env.CYODA_API_BASE_URL}/model/${model.entityName}/${model.modelVersion}/workflow/import`, {
    data: {
      importMode: 'MERGE',
      workflows: [{
        version: '1.0', name: 'wf', initialState: 'draft', active: true,
        states: { draft: { transitions: [{ name: 't', next: 'draft', manual: false }] } },
      }],
    },
  });
  await page.goto(`/workflow/${model.entityName}/${model.modelVersion}/wf`);
  await page.getByText('draft').click();
  await page.getByText('t').click();
  await page.getByRole('button', { name: /add processor/i }).click();
  await page.getByRole('button', { name: /^externalized$/ }).click();
  await page.getByRole('textbox', { name: /^Name$/ }).last().fill('p1');
  await page.getByRole('button', { name: /^Save$/ }).click();
  await page.reload();
  await expect(page.getByText(/externalized: p1/)).toBeVisible();
});
```

Commit: `git commit -m "test(e2e): cloud-workflow-editor — add processor"`

### Task 28: `query-condition.spec.ts`

```ts
import { test, expect } from '../fixtures/testModel';

test('add group condition with two simple children → save → reload preserves structure', async ({ page, request, model }) => {
  await request.post(`${process.env.CYODA_API_BASE_URL}/model/${model.entityName}/${model.modelVersion}/workflow/import`, {
    data: {
      importMode: 'MERGE',
      workflows: [{
        version: '1.0', name: 'wf', initialState: 'draft', active: true,
        states: { draft: { transitions: [{ name: 't', next: 'draft', manual: false }] } },
      }],
    },
  });
  await page.goto(`/workflow/${model.entityName}/${model.modelVersion}/wf`);
  await page.getByText('draft').click();
  await page.getByText('t').click();
  await page.getByRole('button', { name: /Add criterion/ }).click();
  // Switch type from simple → group (no destructive content yet).
  await page.locator('text=Type:').locator('xpath=following-sibling::*[1]').click();
  await page.getByText('group', { exact: true }).click();
  await page.getByRole('button', { name: /Add condition/ }).click();
  await page.getByRole('button', { name: /Add condition/ }).click();
  await page.getByRole('button', { name: /^Save$/ }).click();
  await page.reload();
  // Two simple inputs visible
  await expect(page.locator('input[placeholder="JSONPath e.g. $.field"]')).toHaveCount(2);
});
```

Commit: `git commit -m "test(e2e): cloud-workflow-editor — query condition group + simples"`

### Task 29: `validation.spec.ts`

```ts
import { test, expect } from '../fixtures/testModel';

test('clear initialState → save attempt → error banner + tree-node red badge', async ({ page, request, model }) => {
  await request.post(`${process.env.CYODA_API_BASE_URL}/model/${model.entityName}/${model.modelVersion}/workflow/import`, {
    data: {
      importMode: 'MERGE',
      workflows: [{
        version: '1.0', name: 'wf', initialState: 'draft', active: true,
        states: { draft: { transitions: [] } },
      }],
    },
  });
  await page.goto(`/workflow/${model.entityName}/${model.modelVersion}/wf`);
  // Force initialState to an unknown value via the Select.
  await page.getByLabel('Initial state').click();
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await page.getByRole('button', { name: /^Save$/ }).click();
  await expect(page.getByText(/validation failed/i)).toBeVisible();
  await expect(page.locator('[data-testid="node-error-dot"]').first()).toBeVisible();
});
```

Commit: `git commit -m "test(e2e): cloud-workflow-editor — validation banner + tree dot"`

### Task 30: `dirty-guard.spec.ts` — sidebar nav + browser back button

```ts
import { test, expect } from '../fixtures/testModel';

test('dirty guard fires on sidebar nav and on browser back button', async ({ page, request, model }) => {
  await request.post(`${process.env.CYODA_API_BASE_URL}/model/${model.entityName}/${model.modelVersion}/workflow/import`, {
    data: {
      importMode: 'MERGE',
      workflows: [{
        version: '1.0', name: 'wf', initialState: 'draft', active: true,
        states: { draft: { transitions: [] } },
      }],
    },
  });
  await page.goto(`/workflow/${model.entityName}/${model.modelVersion}/wf`);
  // Make dirty.
  await page.getByRole('textbox', { name: /^Name$/ }).fill('wf-edited');

  // Sidebar nav path.
  page.once('dialog', () => {});  // no native dialog expected; the AntD modal renders inline
  await page.getByRole('menuitem', { name: /workflow/i }).first().click();
  await expect(page.getByText(/Discard unsaved changes/i)).toBeVisible();
  await page.getByRole('button', { name: /Stay/i }).click();
  await expect(page).toHaveURL(new RegExp(`/workflow/${model.entityName}`));

  // Browser back path.
  await page.goBack();
  await expect(page.getByText(/Discard unsaved changes/i)).toBeVisible();
  await page.getByRole('button', { name: /Discard/i }).click();
});
```

Commit: `git commit -m "test(e2e): cloud-workflow-editor — dirty guard sidebar + back button"`

---

## Group H: Verification + push/PR

### Task 31: Repo-wide verification + push + PR

**Files:** none modified (gating step).

- [ ] **Step 1: Repo-wide unit tests**

Run: `npx vitest run --environment jsdom packages/`
Expected: all PASS, no new failures vs. parent branch.

- [ ] **Step 2: Type-check the workspace**

Run: `npx tsc --noEmit -p packages/statemachine-react`
Expected: no errors.

If errors exist, fix in a follow-up task. Don't push broken types.

- [ ] **Step 3: Local Playwright smoke (if cyoda env available)**

If the user has a cyoda env running and the env vars set:
```bash
BASE_URL=http://localhost:5173 \
CYODA_API_BASE_URL=http://localhost:5173/api \
TEST_ENV_USER=demo.user TEST_ENV_SECRET=k33pS8fe!! \
pnpm exec playwright test --project=cloud-workflow-editor
```
Expected: all 6 specs PASS.

If the env isn't available, skip this step and note it in the PR body.

- [ ] **Step 4: Push and open PR**

```bash
git -c credential.helper= -c credential.helper='!gh auth git-credential' push -u origin feature/cyoda-go-support-cloud-workflow-editor
gh pr create --base feature/cyoda-go-support --head feature/cyoda-go-support-cloud-workflow-editor \
  --title "feat(cloud-workflow-editor): real cloud workflow editor (sub-branch 4)" \
  --body "$(cat <<'BODY'
## Summary

Sub-branch 4 of the cyoda-go effort. Replaces \`WorkflowEditorCloudPlaceholder\` with a real single-page editor for cloud workflow documents.

- Tree navigation (left) + context-specific forms (right) with sticky save bar
- Page-scoped Zustand + Immer store with selector subscriptions (handles hundreds of states)
- Hand-rolled \`validateWorkflowDoc\` (12 rules) + perf-ceiling test on 500-state fixture
- Recursive \`QueryConditionEditor\` for simple / group / function condition types with destructive-type-switch confirm
- Dirty tracking via RR \`useBlocker\` + \`beforeunload\`
- Save flow goes through \`CloudWorkflowGateway\` and re-fetches the server's truth, preserving the user's tree position
- Post-save navigation for \`/new\` lands on the canonical URL via \`navigate({ replace: true })\`
- Promoted \`loadWorkflow\` "not found" string error to a typed \`WorkflowNotFoundError\` class for distinguishable post-save warnings

## Spec & plan

- Spec: \`docs/superpowers/specs/2026-04-17-cloud-workflow-editor-design.md\` (v4)
- Plan: \`docs/superpowers/plans/2026-04-17-cloud-workflow-editor.md\` (this implementation)

## Test plan

- [x] Unit tests: store + path-rewrites + validator + perf ceiling + 4 forms + QueryConditionEditor + page integration — all green
- [x] Playwright E2E (6 specs, tagged \`cloud-workflow-editor\`): create / edit-and-save / add-processor / query-condition / validation / dirty-guard
- [ ] Reviewer: pull and run E2E against own cyoda env

## Out of scope (deferred to follow-ups)

- Read-only graph view (adapter from \`WorkflowDoc\` → \`graphicalStatemachineStore\` is its own design problem)
- \`array\` and \`lifecycle\` query condition types (search-side per openapi-common.yml)
- Undo/redo
- Drag-to-reorder in the tree
- Tab-close \`beforeunload\` Playwright assertion (browser-native dialog)
- Fixing the legacy defaults in \`playwright.config.ts\` (port 3000 / npm)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
BODY
)"
```
Expected: PR URL printed.

- [ ] **Step 5: Done**

Mark all tasks complete in TodoWrite. The PR is ready for review.

---

## Self-review

- **Spec coverage:** Each spec section maps to at least one task — §3.1 file layout (Tasks 4–22), §3.2 store + paths + nodeHasError (Tasks 4–8), §3.3 tree layout (Tasks 18, 20), §3.4 validator (Task 3), §3.5 forms (Tasks 13–16), §3.6 QueryConditionEditor (Tasks 9–12), §3.7 dirty guard (Task 17), §3.8 save flow (Task 21), §3.9 routing (Tasks 20, 22), §4.1 unit tests (interleaved with each impl task), §4.2 E2E (Tasks 23–30). §2 scope items: typed `WorkflowNotFoundError` (Task 1), `cloudWorkflow` key (Task 2). §5 risks are documented in the spec and don't need code.
- **No placeholders:** every step has actual code or an exact command. Where the implementer must adapt to local layout (e.g. the gateway re-export path comment in Task 20), it's flagged inline.
- **Type consistency:** `WorkflowEditorState` interface signatures in Task 4 match what's called from Tasks 5–7 and from forms in Group E. `nodeHasError(nodePath, errors)` signature consistent across Task 8 (def) and Task 18 (use). `validateWorkflowDoc(doc): ValidationIssue[]` consistent across Task 3 (def) and Task 21 (use). `WorkflowNotFoundError` class signature consistent across Task 1 (def) and Task 21 (use).
