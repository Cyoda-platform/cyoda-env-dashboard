# Cyoda-Go Workflow Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce a `WorkflowGateway` strategy boundary in `packages/statemachine-react`, with a full `CloudWorkflowGateway` implementation against the new document-based cloud workflow API and a backward-compatible `LegacyPlatformWorkflowGateway` implementation that preserves all existing legacy UI behavior. Rewrite the affected React Query hooks to dispatch through the gateway. No new user-facing UI in this sub-branch — a small stub cloud Workflows page exists only as a manual-smoke target.

**Architecture:** A narrow `WorkflowGateway` interface (defined in `packages/statemachine-react/src/gateways/`) speaks the cloud `WorkflowConfiguration` shape (`WorkflowDoc` / `WorkflowSummary`). Two implementations behind a single factory: `CloudWorkflowGateway` calls the new `/model/{entityName}/{modelVersion}/workflow/{export,import}` endpoints; `LegacyPlatformWorkflowGateway` adapts the existing granular `/platform-api/statemachine/workflows*` endpoints. The factory `getWorkflowGateway()` consults `HelperFeatureFlags.isCyodaCloud()` once; downstream code is flag-free. The Zustand store retains its existing granular API methods (consumed only by legacy detail pages) and gains a new `selectedModelRef` UI state for cloud mode. Affected React Query hooks (`useWorkflowsList`, `useCreateWorkflow`, `useUpdateWorkflow`, `useDeleteWorkflow`, `useCopyWorkflow`) are rewritten to call the gateway; new hooks `useWorkflowDoc` and `useRenameWorkflow` are added.

**Tech Stack:** TypeScript 5, React 18, Vite 6, Vitest, React Query (TanStack Query), Zustand, Ant Design 5, Axios.

**Spec:** `docs/superpowers/specs/2026-04-16-cyoda-go-support-design.md` (sections 4 and 5; reference §6.3 for the stub cloud page that this branch lands; later sub-branches replace the stub).

---

## Implementation choices made for this sub-branch

Two pragmatic deviations from the spec's bullet-list shape (which the spec itself flags as "implementation details" — recording them here for transparency):

1. **`useWorkflow` (the legacy hook) is NOT rewritten.** Spec §4.6 lists `useWorkflow` among the rewritten hooks, but its only consumer is the legacy `WorkflowDetail.tsx` editor, which expects the legacy backend shape — not the cloud `WorkflowDoc`. Forcing it through `WorkflowGateway.loadWorkflow` would either (a) require the legacy gateway to assemble a full `WorkflowDoc` from N granular calls (workflow + states + transitions + criteria + processors), which is a substantial refactor not needed for cyoda-go support, or (b) make the legacy editor break. We instead add a **new** hook `useWorkflowDoc(modelRef, name)` that consumes `WorkflowGateway.loadWorkflow` and is used only by cloud-mode code (the cloud editor lands in sub-branch 4). `useWorkflow` stays as-is, calling the legacy store directly. This is a single-paragraph deviation from the spec; the spec's intent (cloud and legacy use distinct paths cleanly) is preserved.

2. **`LegacyPlatformWorkflowGateway.loadWorkflow` throws `NotImplementedInLegacyError`.** No legacy code path calls it (per choice 1). Documented at the call site. The day a legacy use-case appears, the implementation is a small follow-up.

Everything else follows spec §4 / §5 verbatim.

---

## File Structure

| Path | Action | Responsibility |
| --- | --- | --- |
| `packages/statemachine-react/src/gateways/workflowDocTypes.ts` | Create | Cloud-shape types: `WorkflowDoc`, `WorkflowSummary`, `ModelRef`, `WorkflowImportMode`, `QueryCondition`, `StateDefinition`, `TransitionDefinition`, `ProcessorDefinition`, etc. — modeled after `docs/cyoda-cloud/api/openapi-workflow.yml`. |
| `packages/statemachine-react/src/gateways/errors.ts` | Create | Typed errors: `CannotDeleteLastWorkflowError`, `RenameIncompleteError`, `NotImplementedInLegacyError`. |
| `packages/statemachine-react/src/gateways/WorkflowGateway.ts` | Create | The `WorkflowGateway` interface. Type-only file. |
| `packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts` | Create | Class implementing `WorkflowGateway` against `/model/{entityName}/{modelVersion}/workflow/{export,import}`. |
| `packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts` | Create | Vitest suite mocking axios, asserting request URLs and bodies. |
| `packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.ts` | Create | Class implementing `WorkflowGateway` against the existing legacy store calls. |
| `packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts` | Create | Vitest suite mocking the store, asserting it routes through the existing API. |
| `packages/statemachine-react/src/gateways/index.ts` | Create | Barrel exports + factory `getWorkflowGateway()`. |
| `packages/statemachine-react/src/gateways/index.test.ts` | Create | Factory tests for both flag values. |
| `packages/statemachine-react/src/hooks/useStatemachine.ts` | Modify | Rewrite five hooks to use the gateway; add two new hooks; preserve the legacy `useWorkflow`. |
| `packages/statemachine-react/src/hooks/useStatemachine.test.tsx` | Modify | Add gateway-mocked tests for the rewritten hooks; keep existing tests for unchanged hooks. |
| `packages/statemachine-react/src/stores/statemachineStore.ts` | Modify | Add `selectedModelRef: ModelRef \| null` UI state with setter and a `partialize` slot. |
| `packages/statemachine-react/src/pages/Workflows.tsx` | Modify | Update three call sites for the rewritten hooks (pass `null` for `modelRef`). Branch on `isCyodaCloud()` to render a `WorkflowsCloudStub` instead of the existing legacy table. |
| `packages/statemachine-react/src/pages/WorkflowsCloudStub.tsx` | Create | Minimal stub: a hardcoded model-ref input and a list of workflow names from `useWorkflowsList(modelRef)`. Replaced by the real `WorkflowsCloud` page in sub-branch 3. |
| `packages/statemachine-react/src/pages/WorkflowsCloudStub.test.tsx` | Create | Renders the stub with a mocked gateway; asserts list rows render. |
| `packages/statemachine-react/src/index.ts` | Modify | Export the new gateway types and factory. |

No `apps/saas-app` changes in this sub-branch. Routing for the cloud editor (path `/workflow/:entityName/:modelVersion/:workflowName`) lands in sub-branch 4.

---

## Branching Setup

### Task 0: Cut the sub-branch from the parent feature branch

**Files:** none

- [ ] **Step 1: Verify clean starting state**

```bash
cd /Users/paul/dev/cyoda-env-dashboard
git status
git branch --show-current
git fetch origin
```

Expected: working tree may have unrelated unstaged modifications under `docs/cyoda-cloud/api/*` and `docs/cyoda-cloud/openapi.json`; that is fine and you must leave them alone. Anything else modified — STOP and ask.

- [ ] **Step 2: Switch to the parent feature branch and pull**

```bash
git checkout feature/cyoda-go-support
git pull --ff-only origin feature/cyoda-go-support
```

Expected: branch up to date with origin.

- [ ] **Step 3: Cut the sub-branch**

```bash
git checkout -b feature/cyoda-go-support-workflow-gateway
```

Expected: now on `feature/cyoda-go-support-workflow-gateway`. Every commit in this plan lands here.

---

## Type Definitions

### Task 1: Add cloud workflow type definitions

**Files:**
- Create: `packages/statemachine-react/src/gateways/workflowDocTypes.ts`

There is no behavior to test in this task — these are pure type declarations. Verification is `tsc`-clean compilation in subsequent tasks that consume the types.

- [ ] **Step 1: Create the types file**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/gateways/workflowDocTypes.ts` with:

```ts
/**
 * Cloud workflow type definitions.
 *
 * These types model the cloud workflow API documented in
 * `docs/cyoda-cloud/api/openapi-workflow.yml`. Used by the WorkflowGateway
 * interface and both gateway implementations.
 */

/** Identifier of an entity model in the cloud API. */
export interface ModelRef {
  entityName: string;
  modelVersion: number;
}

/** Import mode for the workflow/import endpoint. */
export type WorkflowImportMode = 'REPLACE' | 'ACTIVATE' | 'MERGE';

/** Execution mode of an externalized processor. */
export type ProcessorExecutionMode = 'SYNC' | 'ASYNC_SAME_TX' | 'ASYNC_NEW_TX';

/**
 * QueryCondition is the cloud's polymorphic condition tree (simple / group / function).
 * Defined in openapi-common.yml. We type it as `unknown`-shaped here and let editors
 * pass through; precise modeling lives in sub-branch 4 with the QueryConditionEditor.
 */
export type QueryCondition = Record<string, unknown>;

/** Externalized function configuration shared by externalized processors and function criteria. */
export interface ExternalizedFunctionConfig {
  attachEntity?: boolean;
  calculationNodesTags?: string;
  responseTimeoutMs?: number;
  retryPolicy?: string;
  context?: string;
  [key: string]: unknown;
}

/** Configuration for an externalized processor, extending the function config with async options. */
export interface ExternalizedProcessorConfig extends ExternalizedFunctionConfig {
  asyncResult?: boolean;
  crossoverToAsyncMs?: number;
}

/** Configuration for a scheduled-transition processor. */
export interface ScheduledTransitionConfig {
  delayMs: number;
  transition: string;
}

/** Polymorphic processor definition (externalized or scheduled). */
export interface ProcessorDefinition {
  type: 'externalized' | 'scheduled';
  name: string;
  executionMode?: ProcessorExecutionMode;
  config?: ExternalizedProcessorConfig | ScheduledTransitionConfig;
}

/** Definition of a state transition. */
export interface TransitionDefinition {
  name: string;
  next: string;
  manual: boolean;
  disabled?: boolean;
  processors?: ProcessorDefinition[];
  criterion?: QueryCondition;
}

/** Definition of a workflow state. */
export interface StateDefinition {
  transitions?: TransitionDefinition[];
}

/**
 * Full cloud workflow document — matches `WorkflowConfiguration` in openapi-workflow.yml.
 */
export interface WorkflowDoc {
  version: string;
  name: string;
  desc?: string;
  initialState: string;
  active?: boolean;
  criterion?: QueryCondition;
  states: Record<string, StateDefinition>;
}

/**
 * A summary projection of WorkflowDoc, returned by listWorkflows.
 * Includes everything a workflow-list table needs without the per-state details.
 */
export interface WorkflowSummary {
  name: string;
  desc?: string;
  active?: boolean;
  initialState: string;
  criterion?: QueryCondition;
}

/** Response shape of GET /model/{entityName}/{modelVersion}/workflow/export. */
export interface WorkflowExportResponse {
  entityName: string;
  modelVersion: number;
  workflows: WorkflowDoc[];
}

/** Body shape of POST /model/{entityName}/{modelVersion}/workflow/import. */
export interface WorkflowImportRequest {
  workflows: WorkflowDoc[];
  importMode?: WorkflowImportMode;
}
```

- [ ] **Step 2: Verify the file type-checks**

Run from the repo root:

```bash
pnpm exec tsc --noEmit -p packages/statemachine-react/tsconfig.json
```

Expected: no NEW type errors that mention `workflowDocTypes.ts` (the package may have pre-existing errors in other files; ignore those — confirm with `... 2>&1 | grep workflowDocTypes` returning nothing).

- [ ] **Step 3: Commit**

```bash
git add packages/statemachine-react/src/gateways/workflowDocTypes.ts
git commit -m "feat(statemachine-react): add cloud workflow type definitions"
```

### Task 2: Add typed gateway errors

**Files:**
- Create: `packages/statemachine-react/src/gateways/errors.ts`
- Create: `packages/statemachine-react/src/gateways/errors.test.ts`

- [ ] **Step 1: Write the failing test**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/gateways/errors.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  CannotDeleteLastWorkflowError,
  RenameIncompleteError,
  NotImplementedInLegacyError,
} from './errors';

describe('gateway errors', () => {
  describe('CannotDeleteLastWorkflowError', () => {
    it('is an Error subclass with the expected name and message', () => {
      const err = new CannotDeleteLastWorkflowError('Customer', 1, 'OnlyWorkflow');
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('CannotDeleteLastWorkflowError');
      expect(err.entityName).toBe('Customer');
      expect(err.modelVersion).toBe(1);
      expect(err.workflowName).toBe('OnlyWorkflow');
      expect(err.message).toContain('Customer');
      expect(err.message).toContain('OnlyWorkflow');
    });
  });

  describe('RenameIncompleteError', () => {
    it('carries both names and the underlying cause', () => {
      const cause = new Error('network down');
      const err = new RenameIncompleteError('OldName', 'NewName', cause);
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('RenameIncompleteError');
      expect(err.oldName).toBe('OldName');
      expect(err.newName).toBe('NewName');
      expect(err.cause).toBe(cause);
      expect(err.message).toContain('OldName');
      expect(err.message).toContain('NewName');
    });
  });

  describe('NotImplementedInLegacyError', () => {
    it('exposes the operation name in the message', () => {
      const err = new NotImplementedInLegacyError('loadWorkflow');
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('NotImplementedInLegacyError');
      expect(err.operation).toBe('loadWorkflow');
      expect(err.message).toContain('loadWorkflow');
      expect(err.message).toContain('legacy');
    });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/errors.test.ts
```

Expected: fails with `Failed to resolve import "./errors"` (file does not exist yet).

- [ ] **Step 3: Implement**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/gateways/errors.ts`:

```ts
/**
 * Typed errors raised by WorkflowGateway implementations.
 */

/**
 * Thrown when a delete request would leave the entity model with zero workflows.
 * Cloud Cyoda requires at least one workflow per (entityName, modelVersion).
 */
export class CannotDeleteLastWorkflowError extends Error {
  constructor(
    public readonly entityName: string,
    public readonly modelVersion: number,
    public readonly workflowName: string
  ) {
    super(
      `Cannot delete the last workflow "${workflowName}" of model ` +
        `${entityName} v${modelVersion} — every model requires at least one workflow.`
    );
    this.name = 'CannotDeleteLastWorkflowError';
  }
}

/**
 * Thrown when a rename succeeded in copying the workflow under the new name
 * but failed to delete the old one. The caller must decide whether to retry
 * the delete or remove the new copy to undo the rename.
 */
export class RenameIncompleteError extends Error {
  constructor(
    public readonly oldName: string,
    public readonly newName: string,
    public readonly cause: unknown
  ) {
    super(
      `Workflow rename "${oldName}" → "${newName}" left the model in a partial state: ` +
        `the new copy exists but the old one could not be removed.`
    );
    this.name = 'RenameIncompleteError';
  }
}

/**
 * Thrown when a WorkflowGateway operation is invoked on the legacy gateway
 * but no legacy implementation exists for it (typically because no legacy
 * UI code path needs the operation today).
 */
export class NotImplementedInLegacyError extends Error {
  constructor(public readonly operation: string) {
    super(
      `Operation "${operation}" is not implemented in the legacy workflow gateway. ` +
        `It is currently only used by cloud-mode code.`
    );
    this.name = 'NotImplementedInLegacyError';
  }
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/errors.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/gateways/errors.ts \
        packages/statemachine-react/src/gateways/errors.test.ts
git commit -m "feat(statemachine-react): add typed gateway errors"
```

### Task 3: Define the `WorkflowGateway` interface

**Files:**
- Create: `packages/statemachine-react/src/gateways/WorkflowGateway.ts`

Pure interface declaration. No test (the test surface is the implementations).

- [ ] **Step 1: Create the interface file**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/gateways/WorkflowGateway.ts`:

```ts
/**
 * WorkflowGateway — the strategy boundary for workflow data access.
 *
 * Two implementations exist: `CloudWorkflowGateway` (cloud document API) and
 * `LegacyPlatformWorkflowGateway` (legacy granular CRUD). The factory in
 * `./index.ts` picks one based on `HelperFeatureFlags.isCyodaCloud()`.
 *
 * In legacy mode, `modelRef` is `null` and the legacy gateway ignores it.
 * In cloud mode, `modelRef` carries the (entityName, modelVersion) of the
 * entity model whose workflows are being operated on.
 *
 * `name` is the workflow's identity within `(entityName, modelVersion)` in cloud
 * mode. In legacy mode, the legacy gateway treats it as the user-facing workflow
 * name; uniqueness is the caller's responsibility.
 */

import type { ModelRef, WorkflowDoc, WorkflowSummary } from './workflowDocTypes';

export interface WorkflowGateway {
  /** List all workflows for the given model. In legacy mode, lists across all entity classes. */
  listWorkflows(modelRef: ModelRef | null): Promise<WorkflowSummary[]>;

  /** Load a full workflow document by name within the given model. */
  loadWorkflow(modelRef: ModelRef | null, name: string): Promise<WorkflowDoc>;

  /** Persist (create or update) a single workflow with the given import mode. */
  saveWorkflow(modelRef: ModelRef | null, doc: WorkflowDoc, mode: 'MERGE'): Promise<void>;

  /**
   * Delete a workflow by name. In cloud mode, enforces the ≥1 invariant
   * (throws `CannotDeleteLastWorkflowError` rather than emptying the model).
   */
  deleteWorkflow(modelRef: ModelRef | null, name: string): Promise<void>;

  /** Duplicate a workflow under a new name. Validates uniqueness of `newName` client-side. */
  copyWorkflow(modelRef: ModelRef | null, sourceName: string, newName: string): Promise<void>;

  /**
   * Rename a workflow. Implementations orchestrate copy-then-delete because
   * neither backend exposes a native rename. Throws `RenameIncompleteError`
   * if the copy succeeds but the delete fails.
   */
  renameWorkflow(modelRef: ModelRef | null, oldName: string, newName: string): Promise<void>;
}
```

- [ ] **Step 2: Verify type-clean**

```bash
pnpm exec tsc --noEmit -p packages/statemachine-react/tsconfig.json 2>&1 | grep -E "(WorkflowGateway|workflowDocTypes)"
```

Expected: no output (no new errors in these two files).

- [ ] **Step 3: Commit**

```bash
git add packages/statemachine-react/src/gateways/WorkflowGateway.ts
git commit -m "feat(statemachine-react): define WorkflowGateway interface"
```

---

## CloudWorkflowGateway

The cloud gateway calls two endpoints documented in `docs/cyoda-cloud/api/openapi-workflow.yml`:

- `GET /model/{entityName}/{modelVersion}/workflow/export` — returns `WorkflowExportResponse` (entityName + modelVersion + workflows[]).
- `POST /model/{entityName}/{modelVersion}/workflow/import` — accepts `WorkflowImportRequest` (workflows[] + importMode).

The package's HTTP client is `axios` from `@cyoda/http-api-react`. All test mocks use `vi.mock('@cyoda/http-api-react', ...)` to intercept the axios instance.

### Task 4: Bootstrap `CloudWorkflowGateway` with a passing class shell

**Files:**
- Create: `packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts`
- Create: `packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts`

- [ ] **Step 1: Write the bootstrap test**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts
```

Expected: fails with `Failed to resolve import "./CloudWorkflowGateway"`.

- [ ] **Step 3: Implement the shell**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts`:

```ts
/**
 * CloudWorkflowGateway — calls the cloud document-based workflow API.
 *
 * Maps WorkflowGateway operations to the two endpoints documented in
 * `docs/cyoda-cloud/api/openapi-workflow.yml`:
 *   - GET  /model/{entityName}/{modelVersion}/workflow/export
 *   - POST /model/{entityName}/{modelVersion}/workflow/import
 */

import { axios } from '@cyoda/http-api-react';
import { CannotDeleteLastWorkflowError, RenameIncompleteError } from './errors';
import type { WorkflowGateway } from './WorkflowGateway';
import type {
  ModelRef,
  WorkflowDoc,
  WorkflowExportResponse,
  WorkflowImportRequest,
  WorkflowSummary,
} from './workflowDocTypes';

export class CloudWorkflowGateway implements WorkflowGateway {
  async listWorkflows(_modelRef: ModelRef | null): Promise<WorkflowSummary[]> {
    throw new Error('not implemented');
  }

  async loadWorkflow(_modelRef: ModelRef | null, _name: string): Promise<WorkflowDoc> {
    throw new Error('not implemented');
  }

  async saveWorkflow(
    _modelRef: ModelRef | null,
    _doc: WorkflowDoc,
    _mode: 'MERGE'
  ): Promise<void> {
    throw new Error('not implemented');
  }

  async deleteWorkflow(_modelRef: ModelRef | null, _name: string): Promise<void> {
    throw new Error('not implemented');
  }

  async copyWorkflow(
    _modelRef: ModelRef | null,
    _sourceName: string,
    _newName: string
  ): Promise<void> {
    throw new Error('not implemented');
  }

  async renameWorkflow(
    _modelRef: ModelRef | null,
    _oldName: string,
    _newName: string
  ): Promise<void> {
    throw new Error('not implemented');
  }
}
```

- [ ] **Step 4: Verify the bootstrap test passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts
```

Expected: 1 test PASS (`can be instantiated`).

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts \
        packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts
git commit -m "feat(statemachine-react): scaffold CloudWorkflowGateway"
```

### Task 5: `CloudWorkflowGateway.listWorkflows`

**Files:**
- Modify: `packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts`
- Modify: `packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts`

- [ ] **Step 1: Write the failing test**

In `CloudWorkflowGateway.test.ts`, add this describe-block immediately before the file's outer closing `});`:

```ts
  describe('listWorkflows', () => {
    it('GETs the export endpoint and projects workflows[] to summaries', async () => {
      const exportResponse = {
        entityName: 'Customer',
        modelVersion: 1,
        workflows: [
          {
            version: '1.0',
            name: 'Premium',
            desc: 'Premium customers',
            initialState: 'draft',
            active: true,
            criterion: { type: 'simple', jsonPath: '$.t', operation: 'EQUALS', value: 'premium' },
            states: { draft: { transitions: [] } },
          },
          {
            version: '1.0',
            name: 'Standard',
            initialState: 'pending',
            active: false,
            states: { pending: { transitions: [] } },
          },
        ],
      };
      (axios.get as any).mockResolvedValueOnce({ data: exportResponse });

      const result = await gateway.listWorkflows({ entityName: 'Customer', modelVersion: 1 });

      expect(axios.get).toHaveBeenCalledWith(
        '/model/Customer/1/workflow/export'
      );
      expect(result).toEqual([
        {
          name: 'Premium',
          desc: 'Premium customers',
          active: true,
          initialState: 'draft',
          criterion: { type: 'simple', jsonPath: '$.t', operation: 'EQUALS', value: 'premium' },
        },
        {
          name: 'Standard',
          desc: undefined,
          active: false,
          initialState: 'pending',
          criterion: undefined,
        },
      ]);
    });

    it('URL-encodes entityName segments', async () => {
      (axios.get as any).mockResolvedValueOnce({
        data: { entityName: 'Some/Class', modelVersion: 2, workflows: [] },
      });

      await gateway.listWorkflows({ entityName: 'Some/Class', modelVersion: 2 });

      expect(axios.get).toHaveBeenCalledWith('/model/Some%2FClass/2/workflow/export');
    });

    it('throws if modelRef is null', async () => {
      await expect(gateway.listWorkflows(null)).rejects.toThrow(
        /modelRef is required/i
      );
    });
  });
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts -t "listWorkflows"
```

Expected: 3 tests fail (`not implemented` for the first two; `not implemented` instead of the `modelRef is required` regex for the third).

- [ ] **Step 3: Implement `listWorkflows`**

Replace the `listWorkflows` method body in `CloudWorkflowGateway.ts` with:

```ts
  async listWorkflows(modelRef: ModelRef | null): Promise<WorkflowSummary[]> {
    if (modelRef === null) {
      throw new Error('CloudWorkflowGateway.listWorkflows: modelRef is required');
    }
    const url = exportUrl(modelRef);
    const response = await axios.get<WorkflowExportResponse>(url);
    return (response.data.workflows ?? []).map(toSummary);
  }
```

Also add the two helpers above the class declaration (just below the imports):

```ts
function exportUrl(modelRef: ModelRef): string {
  return `/model/${encodeURIComponent(modelRef.entityName)}/${modelRef.modelVersion}/workflow/export`;
}

function importUrl(modelRef: ModelRef): string {
  return `/model/${encodeURIComponent(modelRef.entityName)}/${modelRef.modelVersion}/workflow/import`;
}

function toSummary(doc: WorkflowDoc): WorkflowSummary {
  return {
    name: doc.name,
    desc: doc.desc,
    active: doc.active,
    initialState: doc.initialState,
    criterion: doc.criterion,
  };
}
```

(`importUrl` is unused in this task but used in subsequent tasks. Defining it now keeps the helpers grouped.)

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts -t "listWorkflows"
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts \
        packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts
git commit -m "feat(statemachine-react): CloudWorkflowGateway.listWorkflows"
```

### Task 6: `CloudWorkflowGateway.loadWorkflow`

**Files:**
- Modify: `packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts`
- Modify: `packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts`

- [ ] **Step 1: Write the failing test**

Append to `CloudWorkflowGateway.test.ts` before the outer closing `});`:

```ts
  describe('loadWorkflow', () => {
    const exportResponse = {
      entityName: 'Customer',
      modelVersion: 1,
      workflows: [
        { version: '1.0', name: 'Premium', initialState: 'draft', states: {} },
        { version: '1.0', name: 'Standard', initialState: 'pending', states: {} },
      ],
    };

    it('GETs the export endpoint and returns the matching workflow', async () => {
      (axios.get as any).mockResolvedValueOnce({ data: exportResponse });

      const result = await gateway.loadWorkflow(
        { entityName: 'Customer', modelVersion: 1 },
        'Standard'
      );

      expect(axios.get).toHaveBeenCalledWith('/model/Customer/1/workflow/export');
      expect(result).toEqual({
        version: '1.0',
        name: 'Standard',
        initialState: 'pending',
        states: {},
      });
    });

    it('throws if no workflow with that name exists in the model', async () => {
      (axios.get as any).mockResolvedValueOnce({ data: exportResponse });

      await expect(
        gateway.loadWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'NoSuchOne')
      ).rejects.toThrow(/NoSuchOne/);
    });

    it('throws if modelRef is null', async () => {
      await expect(gateway.loadWorkflow(null, 'X')).rejects.toThrow(
        /modelRef is required/i
      );
    });
  });
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts -t "loadWorkflow"
```

Expected: 3 tests fail.

- [ ] **Step 3: Implement `loadWorkflow`**

Replace the `loadWorkflow` method body in `CloudWorkflowGateway.ts` with:

```ts
  async loadWorkflow(modelRef: ModelRef | null, name: string): Promise<WorkflowDoc> {
    if (modelRef === null) {
      throw new Error('CloudWorkflowGateway.loadWorkflow: modelRef is required');
    }
    const response = await axios.get<WorkflowExportResponse>(exportUrl(modelRef));
    const found = (response.data.workflows ?? []).find((w) => w.name === name);
    if (!found) {
      throw new Error(
        `Workflow "${name}" not found in model ${modelRef.entityName} v${modelRef.modelVersion}`
      );
    }
    return found;
  }
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts -t "loadWorkflow"
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts \
        packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts
git commit -m "feat(statemachine-react): CloudWorkflowGateway.loadWorkflow"
```

### Task 7: `CloudWorkflowGateway.saveWorkflow` (MERGE)

**Files:**
- Modify: `packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts`
- Modify: `packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts`

- [ ] **Step 1: Write the failing test**

Append to `CloudWorkflowGateway.test.ts` before the outer closing `});`:

```ts
  describe('saveWorkflow (MERGE)', () => {
    it('POSTs to the import endpoint with importMode MERGE and a single-element workflows array', async () => {
      (axios.post as any).mockResolvedValueOnce({ data: undefined });

      const doc = {
        version: '1.0',
        name: 'NewOne',
        initialState: 'draft',
        active: true,
        states: { draft: { transitions: [] } },
      };

      await gateway.saveWorkflow({ entityName: 'Customer', modelVersion: 1 }, doc, 'MERGE');

      expect(axios.post).toHaveBeenCalledWith(
        '/model/Customer/1/workflow/import',
        { importMode: 'MERGE', workflows: [doc] }
      );
    });

    it('throws if modelRef is null', async () => {
      const doc = { version: '1.0', name: 'X', initialState: 's', states: {} };

      await expect(gateway.saveWorkflow(null, doc, 'MERGE')).rejects.toThrow(
        /modelRef is required/i
      );
    });
  });
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts -t "saveWorkflow"
```

Expected: 2 tests fail.

- [ ] **Step 3: Implement `saveWorkflow`**

Replace the `saveWorkflow` method body in `CloudWorkflowGateway.ts` with:

```ts
  async saveWorkflow(
    modelRef: ModelRef | null,
    doc: WorkflowDoc,
    mode: 'MERGE'
  ): Promise<void> {
    if (modelRef === null) {
      throw new Error('CloudWorkflowGateway.saveWorkflow: modelRef is required');
    }
    const body: WorkflowImportRequest = { importMode: mode, workflows: [doc] };
    await axios.post(importUrl(modelRef), body);
  }
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts -t "saveWorkflow"
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts \
        packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts
git commit -m "feat(statemachine-react): CloudWorkflowGateway.saveWorkflow (MERGE)"
```

### Task 8: `CloudWorkflowGateway.deleteWorkflow` (REPLACE-minus-target with ≥1 invariant)

**Files:**
- Modify: `packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts`
- Modify: `packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts`

- [ ] **Step 1: Write the failing test**

Append to `CloudWorkflowGateway.test.ts` before the outer closing `});`:

```ts
  describe('deleteWorkflow', () => {
    const twoWorkflows = {
      entityName: 'Customer',
      modelVersion: 1,
      workflows: [
        { version: '1.0', name: 'KeepMe', initialState: 's', states: { s: { transitions: [] } } },
        { version: '1.0', name: 'DeleteMe', initialState: 's', states: { s: { transitions: [] } } },
      ],
    };

    it('exports, filters out the target, and POSTs REPLACE with the remaining workflows', async () => {
      (axios.get as any).mockResolvedValueOnce({ data: twoWorkflows });
      (axios.post as any).mockResolvedValueOnce({ data: undefined });

      await gateway.deleteWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'DeleteMe');

      expect(axios.get).toHaveBeenCalledWith('/model/Customer/1/workflow/export');
      expect(axios.post).toHaveBeenCalledWith('/model/Customer/1/workflow/import', {
        importMode: 'REPLACE',
        workflows: [twoWorkflows.workflows[0]],
      });
    });

    it('throws CannotDeleteLastWorkflowError when only the target workflow exists', async () => {
      (axios.get as any).mockResolvedValueOnce({
        data: { entityName: 'Customer', modelVersion: 1, workflows: [twoWorkflows.workflows[1]] },
      });

      await expect(
        gateway.deleteWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'DeleteMe')
      ).rejects.toThrow(CannotDeleteLastWorkflowError);

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('treats a missing target as a no-op delete (still throws if it would empty the model)', async () => {
      (axios.get as any).mockResolvedValueOnce({
        data: { entityName: 'Customer', modelVersion: 1, workflows: [twoWorkflows.workflows[0]] },
      });

      // The "target" doesn't exist; the remaining set is the full set; that's >= 1, so just no-op.
      await gateway.deleteWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'NoSuchWorkflow');

      // Should NOT POST when there is nothing to remove (filter result equals original).
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('throws if modelRef is null', async () => {
      await expect(gateway.deleteWorkflow(null, 'X')).rejects.toThrow(/modelRef is required/i);
    });
  });
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts -t "deleteWorkflow"
```

Expected: 4 tests fail.

- [ ] **Step 3: Implement `deleteWorkflow`**

Replace the `deleteWorkflow` method body in `CloudWorkflowGateway.ts` with:

```ts
  async deleteWorkflow(modelRef: ModelRef | null, name: string): Promise<void> {
    if (modelRef === null) {
      throw new Error('CloudWorkflowGateway.deleteWorkflow: modelRef is required');
    }
    const response = await axios.get<WorkflowExportResponse>(exportUrl(modelRef));
    const all = response.data.workflows ?? [];
    const remaining = all.filter((w) => w.name !== name);
    if (remaining.length === 0) {
      throw new CannotDeleteLastWorkflowError(modelRef.entityName, modelRef.modelVersion, name);
    }
    if (remaining.length === all.length) {
      // Target wasn't in the export (already deleted by another caller, or never existed).
      // Nothing to do.
      return;
    }
    const body: WorkflowImportRequest = { importMode: 'REPLACE', workflows: remaining };
    await axios.post(importUrl(modelRef), body);
  }
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts -t "deleteWorkflow"
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts \
        packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts
git commit -m "feat(statemachine-react): CloudWorkflowGateway.deleteWorkflow with >=1 invariant"
```

### Task 9: `CloudWorkflowGateway.copyWorkflow`

**Files:**
- Modify: `packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts`
- Modify: `packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts`

- [ ] **Step 1: Write the failing test**

Append to `CloudWorkflowGateway.test.ts` before the outer closing `});`:

```ts
  describe('copyWorkflow', () => {
    const exportResponse = {
      entityName: 'Customer',
      modelVersion: 1,
      workflows: [
        {
          version: '1.0',
          name: 'Premium',
          desc: 'orig',
          initialState: 's',
          active: true,
          states: { s: { transitions: [{ name: 't', next: 's', manual: true }] } },
        },
        { version: '1.0', name: 'Standard', initialState: 's', states: { s: { transitions: [] } } },
      ],
    };

    it('exports, clones the source under the new name, and MERGE-saves the clone', async () => {
      (axios.get as any).mockResolvedValueOnce({ data: exportResponse });
      (axios.post as any).mockResolvedValueOnce({ data: undefined });

      await gateway.copyWorkflow(
        { entityName: 'Customer', modelVersion: 1 },
        'Premium',
        'PremiumCopy'
      );

      expect(axios.get).toHaveBeenCalledWith('/model/Customer/1/workflow/export');
      const expectedClone = {
        ...exportResponse.workflows[0],
        name: 'PremiumCopy',
      };
      expect(axios.post).toHaveBeenCalledWith('/model/Customer/1/workflow/import', {
        importMode: 'MERGE',
        workflows: [expectedClone],
      });
    });

    it('throws if newName is not unique within the model', async () => {
      (axios.get as any).mockResolvedValueOnce({ data: exportResponse });

      await expect(
        gateway.copyWorkflow(
          { entityName: 'Customer', modelVersion: 1 },
          'Premium',
          'Standard'
        )
      ).rejects.toThrow(/already exists/i);

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('throws if the source workflow does not exist', async () => {
      (axios.get as any).mockResolvedValueOnce({ data: exportResponse });

      await expect(
        gateway.copyWorkflow(
          { entityName: 'Customer', modelVersion: 1 },
          'NoSuchSource',
          'AnyName'
        )
      ).rejects.toThrow(/NoSuchSource/);

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('throws if modelRef is null', async () => {
      await expect(gateway.copyWorkflow(null, 'a', 'b')).rejects.toThrow(/modelRef is required/i);
    });
  });
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts -t "copyWorkflow"
```

Expected: 4 tests fail.

- [ ] **Step 3: Implement `copyWorkflow`**

Replace the `copyWorkflow` method body in `CloudWorkflowGateway.ts` with:

```ts
  async copyWorkflow(
    modelRef: ModelRef | null,
    sourceName: string,
    newName: string
  ): Promise<void> {
    if (modelRef === null) {
      throw new Error('CloudWorkflowGateway.copyWorkflow: modelRef is required');
    }
    const response = await axios.get<WorkflowExportResponse>(exportUrl(modelRef));
    const all = response.data.workflows ?? [];

    if (all.some((w) => w.name === newName)) {
      throw new Error(
        `Cannot copy: a workflow named "${newName}" already exists in model ` +
          `${modelRef.entityName} v${modelRef.modelVersion}`
      );
    }

    const source = all.find((w) => w.name === sourceName);
    if (!source) {
      throw new Error(
        `Source workflow "${sourceName}" not found in model ` +
          `${modelRef.entityName} v${modelRef.modelVersion}`
      );
    }

    const clone: WorkflowDoc = { ...source, name: newName };
    const body: WorkflowImportRequest = { importMode: 'MERGE', workflows: [clone] };
    await axios.post(importUrl(modelRef), body);
  }
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts -t "copyWorkflow"
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts \
        packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts
git commit -m "feat(statemachine-react): CloudWorkflowGateway.copyWorkflow"
```

### Task 10: `CloudWorkflowGateway.renameWorkflow`

Renames orchestrate `copyWorkflow` then `deleteWorkflow`. The cloud delete itself uses REPLACE; the ≥1 invariant is satisfied throughout because the new copy exists before the old is removed.

**Files:**
- Modify: `packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts`
- Modify: `packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts`

- [ ] **Step 1: Write the failing test**

Append to `CloudWorkflowGateway.test.ts` before the outer closing `});`:

```ts
  describe('renameWorkflow', () => {
    const onlyOne = {
      entityName: 'Customer',
      modelVersion: 1,
      workflows: [
        { version: '1.0', name: 'Old', initialState: 's', states: { s: { transitions: [] } } },
      ],
    };

    it('orchestrates copy(old → new) then delete(old) and tolerates the >=1 invariant on a single-workflow model', async () => {
      // 1st call: export for copy()
      (axios.get as any).mockResolvedValueOnce({ data: onlyOne });
      // 2nd call: post for copy() (MERGE)
      (axios.post as any).mockResolvedValueOnce({ data: undefined });
      // 3rd call: export for delete() — now both exist
      (axios.get as any).mockResolvedValueOnce({
        data: {
          ...onlyOne,
          workflows: [...onlyOne.workflows, { ...onlyOne.workflows[0], name: 'New' }],
        },
      });
      // 4th call: post for delete() (REPLACE, with only "New" remaining)
      (axios.post as any).mockResolvedValueOnce({ data: undefined });

      await gateway.renameWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'Old', 'New');

      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(axios.post).toHaveBeenCalledTimes(2);
      // Copy POST
      expect(axios.post).toHaveBeenNthCalledWith(1, '/model/Customer/1/workflow/import', {
        importMode: 'MERGE',
        workflows: [{ ...onlyOne.workflows[0], name: 'New' }],
      });
      // Delete POST (REPLACE keeps only New)
      expect(axios.post).toHaveBeenNthCalledWith(2, '/model/Customer/1/workflow/import', {
        importMode: 'REPLACE',
        workflows: [{ ...onlyOne.workflows[0], name: 'New' }],
      });
    });

    it('throws RenameIncompleteError when copy succeeds but delete fails', async () => {
      // copy: export OK, post OK
      (axios.get as any).mockResolvedValueOnce({ data: onlyOne });
      (axios.post as any).mockResolvedValueOnce({ data: undefined });
      // delete: export OK, post REJECTS
      (axios.get as any).mockResolvedValueOnce({
        data: {
          ...onlyOne,
          workflows: [...onlyOne.workflows, { ...onlyOne.workflows[0], name: 'New' }],
        },
      });
      const networkError = new Error('network down');
      (axios.post as any).mockRejectedValueOnce(networkError);

      await expect(
        gateway.renameWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'Old', 'New')
      ).rejects.toMatchObject({
        name: 'RenameIncompleteError',
        oldName: 'Old',
        newName: 'New',
        cause: networkError,
      });
    });

    it('propagates copy errors directly (no RenameIncompleteError) when copy fails', async () => {
      // copy export OK, but newName clashes with an existing workflow
      (axios.get as any).mockResolvedValueOnce({
        data: {
          ...onlyOne,
          workflows: [...onlyOne.workflows, { ...onlyOne.workflows[0], name: 'New' }],
        },
      });

      await expect(
        gateway.renameWorkflow({ entityName: 'Customer', modelVersion: 1 }, 'Old', 'New')
      ).rejects.toThrow(/already exists/i);

      // Should not have attempted any POST.
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('throws if modelRef is null', async () => {
      await expect(gateway.renameWorkflow(null, 'a', 'b')).rejects.toThrow(/modelRef is required/i);
    });
  });
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts -t "renameWorkflow"
```

Expected: 4 tests fail.

- [ ] **Step 3: Implement `renameWorkflow`**

Replace the `renameWorkflow` method body in `CloudWorkflowGateway.ts` with:

```ts
  async renameWorkflow(
    modelRef: ModelRef | null,
    oldName: string,
    newName: string
  ): Promise<void> {
    if (modelRef === null) {
      throw new Error('CloudWorkflowGateway.renameWorkflow: modelRef is required');
    }
    // Copy first; if this throws, no state has changed and the caller sees the underlying error.
    await this.copyWorkflow(modelRef, oldName, newName);
    // Then delete the old. If this throws, we wrap it in RenameIncompleteError so the caller
    // can prompt the user (retry delete vs. discard the new copy).
    try {
      await this.deleteWorkflow(modelRef, oldName);
    } catch (cause) {
      throw new RenameIncompleteError(oldName, newName, cause);
    }
  }
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts -t "renameWorkflow"
```

Expected: 4 tests PASS.

- [ ] **Step 5: Run the full CloudWorkflowGateway test file**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts
```

Expected: every test in the file passes (cumulative across Tasks 4–10).

- [ ] **Step 6: Commit**

```bash
git add packages/statemachine-react/src/gateways/CloudWorkflowGateway.ts \
        packages/statemachine-react/src/gateways/CloudWorkflowGateway.test.ts
git commit -m "feat(statemachine-react): CloudWorkflowGateway.renameWorkflow with RenameIncompleteError"
```

---

## LegacyPlatformWorkflowGateway

The legacy gateway wraps the existing `useStatemachineStore` API methods (which call `/platform-api/statemachine/...`). It uses `getState()` to access the store from a non-React context (the gateway is an instance, not a hook). Tests mock the store to verify the method dispatch.

**Adapter approach for legacy `WorkflowSummary`:** the legacy `Workflow` record has `id`, `name`, `entityClassName`, `active`, plus other fields. The gateway returns `WorkflowSummary` objects where `name` is set to the legacy **id** (because the gateway interface uses `name` as the operation key in subsequent calls, and legacy operations key on `id`). The legacy `Workflows.tsx` page already reads richer record fields directly when needed; the gateway-provided summary is sufficient for the list table once we make the page also pass through the original record (this is handled in the page-update task).

For sub-branch 2 the only legacy gateway operation that actually mutates state is `deleteWorkflow` and `copyWorkflow` (used by the existing list page). `saveWorkflow` is reserved for the deactivate toggle — supported, but only when the doc differs from the existing record on the `active` field (other field changes throw `NotImplementedInLegacyError` because the legacy editor would handle them via granular methods, not via this gateway). `loadWorkflow` and `renameWorkflow` are also not yet wired into legacy UI but are implemented here (rename via copy+delete) for symmetry and forward-compatibility.

### Task 11: Bootstrap `LegacyPlatformWorkflowGateway` with a passing class shell

**Files:**
- Create: `packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.ts`
- Create: `packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts`

- [ ] **Step 1: Write the bootstrap test**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts
```

Expected: fails with `Failed to resolve import "./LegacyPlatformWorkflowGateway"`.

- [ ] **Step 3: Implement the shell**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.ts`:

```ts
/**
 * LegacyPlatformWorkflowGateway — adapts the existing legacy granular store
 * calls to the WorkflowGateway interface. Used when isCyodaCloud() is false.
 *
 * Identity mapping: the gateway interface uses `name: string` as the workflow
 * key in operations like deleteWorkflow / copyWorkflow / renameWorkflow.
 * Legacy workflows are keyed by `id` (UUID) on the wire, so this gateway
 * treats the WorkflowGateway `name` parameter as the legacy workflow's id
 * (an opaque-but-string identifier from the gateway's perspective).
 *
 * The corresponding WorkflowSummary returned by listWorkflows() therefore
 * has its `name` field set to the legacy id; the human-readable name and
 * other legacy-specific fields are accessed by the legacy list page from
 * the underlying store record, not from this summary.
 */

import { useStatemachineStore } from '../stores/statemachineStore';
import { NotImplementedInLegacyError, RenameIncompleteError } from './errors';
import type { WorkflowGateway } from './WorkflowGateway';
import type { ModelRef, WorkflowDoc, WorkflowSummary } from './workflowDocTypes';

export class LegacyPlatformWorkflowGateway implements WorkflowGateway {
  async listWorkflows(_modelRef: ModelRef | null): Promise<WorkflowSummary[]> {
    throw new Error('not implemented');
  }

  async loadWorkflow(_modelRef: ModelRef | null, _name: string): Promise<WorkflowDoc> {
    throw new NotImplementedInLegacyError('loadWorkflow');
  }

  async saveWorkflow(
    _modelRef: ModelRef | null,
    _doc: WorkflowDoc,
    _mode: 'MERGE'
  ): Promise<void> {
    throw new Error('not implemented');
  }

  async deleteWorkflow(_modelRef: ModelRef | null, _name: string): Promise<void> {
    throw new Error('not implemented');
  }

  async copyWorkflow(
    _modelRef: ModelRef | null,
    _sourceName: string,
    _newName: string
  ): Promise<void> {
    throw new Error('not implemented');
  }

  async renameWorkflow(
    _modelRef: ModelRef | null,
    _oldName: string,
    _newName: string
  ): Promise<void> {
    throw new Error('not implemented');
  }
}
```

- [ ] **Step 4: Run to verify the bootstrap test passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts
```

Expected: 1 test PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.ts \
        packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts
git commit -m "feat(statemachine-react): scaffold LegacyPlatformWorkflowGateway"
```

### Task 12: `LegacyPlatformWorkflowGateway.listWorkflows`

**Files:**
- Modify: `packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts`
- Modify: `packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.ts`

- [ ] **Step 1: Write the failing test**

Append to `LegacyPlatformWorkflowGateway.test.ts` before the outer closing `});`:

```ts
  describe('listWorkflows', () => {
    it('calls store.getAllWorkflowsList() and projects records to summaries with name=id', async () => {
      storeApi.getAllWorkflowsList.mockResolvedValueOnce({
        data: [
          { id: 'wf-1', name: 'Premium', entityClassName: 'Customer', active: true, persisted: true },
          { id: 'wf-2', name: 'Standard', entityClassName: 'Customer', active: false, persisted: true },
        ],
      });

      const result = await gateway.listWorkflows(null);

      expect(storeApi.getAllWorkflowsList).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([
        { name: 'wf-1', desc: undefined, active: true, initialState: '', criterion: undefined },
        { name: 'wf-2', desc: undefined, active: false, initialState: '', criterion: undefined },
      ]);
    });

    it('returns an empty array when the store returns non-array data', async () => {
      storeApi.getAllWorkflowsList.mockResolvedValueOnce({ data: null });

      const result = await gateway.listWorkflows(null);

      expect(result).toEqual([]);
    });
  });
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts -t "listWorkflows"
```

Expected: 2 tests fail.

- [ ] **Step 3: Implement `listWorkflows`**

Replace the `listWorkflows` method body in `LegacyPlatformWorkflowGateway.ts` with:

```ts
  async listWorkflows(_modelRef: ModelRef | null): Promise<WorkflowSummary[]> {
    const response = await useStatemachineStore.getState().getAllWorkflowsList(undefined);
    const records = Array.isArray(response.data) ? response.data : [];
    return records.map((rec: any) => ({
      name: rec.id,
      desc: undefined,
      active: !!rec.active,
      initialState: '',
      criterion: undefined,
    }));
  }
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts -t "listWorkflows"
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.ts \
        packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts
git commit -m "feat(statemachine-react): LegacyPlatformWorkflowGateway.listWorkflows"
```

### Task 13: `LegacyPlatformWorkflowGateway.deleteWorkflow`

**Files:**
- Modify: `packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts`
- Modify: `packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.ts`

- [ ] **Step 1: Write the failing test**

Append to `LegacyPlatformWorkflowGateway.test.ts` before the outer closing `});`:

```ts
  describe('deleteWorkflow', () => {
    it('calls store.deleteWorkflow(name) where name is the legacy id', async () => {
      storeApi.deleteWorkflow.mockResolvedValueOnce({ data: undefined });

      await gateway.deleteWorkflow(null, 'wf-42');

      expect(storeApi.deleteWorkflow).toHaveBeenCalledWith('wf-42');
    });

    it('propagates errors from the underlying store', async () => {
      storeApi.deleteWorkflow.mockRejectedValueOnce(new Error('forbidden'));

      await expect(gateway.deleteWorkflow(null, 'wf-42')).rejects.toThrow('forbidden');
    });
  });
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts -t "deleteWorkflow"
```

Expected: 2 tests fail.

- [ ] **Step 3: Implement `deleteWorkflow`**

Replace the `deleteWorkflow` method body in `LegacyPlatformWorkflowGateway.ts` with:

```ts
  async deleteWorkflow(_modelRef: ModelRef | null, name: string): Promise<void> {
    await useStatemachineStore.getState().deleteWorkflow(name);
  }
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts -t "deleteWorkflow"
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.ts \
        packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts
git commit -m "feat(statemachine-react): LegacyPlatformWorkflowGateway.deleteWorkflow"
```

### Task 14: `LegacyPlatformWorkflowGateway.copyWorkflow` (orchestrated)

The legacy backend's `copyWorkflow(persistedType, workflowId)` returns a copy with an auto-generated name. To honor the gateway's `(sourceName, newName)` contract, we follow up with `getWorkflow` + `putWorkflow` to set the new name.

**Files:**
- Modify: `packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts`
- Modify: `packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.ts`

- [ ] **Step 1: Write the failing test**

Append to `LegacyPlatformWorkflowGateway.test.ts` before the outer closing `});`:

```ts
  describe('copyWorkflow', () => {
    it('orchestrates copyWorkflow, getWorkflow, putWorkflow to set newName on the copy', async () => {
      storeApi.copyWorkflow.mockResolvedValueOnce({ data: { id: 'wf-copy' } });
      storeApi.getWorkflow.mockResolvedValueOnce({
        data: { id: 'wf-copy', name: 'Premium (copy)', entityClassName: 'Customer', active: true, persisted: true },
      });
      storeApi.putWorkflow.mockResolvedValueOnce({ data: undefined });

      await gateway.copyWorkflow(null, 'wf-source', 'PremiumDuplicate');

      expect(storeApi.copyWorkflow).toHaveBeenCalledWith('persisted', 'wf-source');
      expect(storeApi.getWorkflow).toHaveBeenCalledWith('persisted', 'wf-copy');
      expect(storeApi.putWorkflow).toHaveBeenCalledWith({
        id: 'wf-copy',
        name: 'PremiumDuplicate',
        entityClassName: 'Customer',
        active: true,
        persisted: true,
      });
    });

    it('propagates errors from any step of the orchestration', async () => {
      storeApi.copyWorkflow.mockRejectedValueOnce(new Error('copy failed'));

      await expect(gateway.copyWorkflow(null, 'wf-source', 'NewName')).rejects.toThrow(
        'copy failed'
      );

      expect(storeApi.getWorkflow).not.toHaveBeenCalled();
      expect(storeApi.putWorkflow).not.toHaveBeenCalled();
    });
  });
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts -t "copyWorkflow"
```

Expected: 2 tests fail.

- [ ] **Step 3: Implement `copyWorkflow`**

Replace the `copyWorkflow` method body in `LegacyPlatformWorkflowGateway.ts` with:

```ts
  async copyWorkflow(
    _modelRef: ModelRef | null,
    sourceName: string,
    newName: string
  ): Promise<void> {
    const store = useStatemachineStore.getState();
    const copyResp = await store.copyWorkflow('persisted', sourceName);
    const copyId = copyResp?.data?.id;
    if (!copyId) {
      throw new Error('copyWorkflow: backend response did not include the new workflow id');
    }
    const recordResp = await store.getWorkflow('persisted', copyId);
    const record = recordResp?.data ?? {};
    await store.putWorkflow({ ...record, id: copyId, name: newName });
  }
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts -t "copyWorkflow"
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.ts \
        packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts
git commit -m "feat(statemachine-react): LegacyPlatformWorkflowGateway.copyWorkflow"
```

### Task 15: `LegacyPlatformWorkflowGateway.saveWorkflow` (active-flag MERGE)

The only call site that uses `saveWorkflow` against the legacy gateway is the deactivate toggle on the list page. Implement it as: load the legacy record, overlay only the `active` flag from the doc, write it back. Other fields are ignored (the legacy editor mutates them via granular methods, not via this gateway).

**Files:**
- Modify: `packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts`
- Modify: `packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.ts`

- [ ] **Step 1: Write the failing test**

Append to `LegacyPlatformWorkflowGateway.test.ts` before the outer closing `});`:

```ts
  describe('saveWorkflow (MERGE — active-flag toggle)', () => {
    it('loads the legacy record and writes it back with active overridden by doc.active', async () => {
      storeApi.getWorkflow.mockResolvedValueOnce({
        data: {
          id: 'wf-7',
          name: 'Premium',
          entityClassName: 'Customer',
          active: true,
          persisted: true,
          owner: 'someone',
        },
      });
      storeApi.putWorkflow.mockResolvedValueOnce({ data: undefined });

      const doc = {
        version: '1.0',
        name: 'wf-7',
        initialState: 's',
        active: false,
        states: { s: { transitions: [] } },
      };

      await gateway.saveWorkflow(null, doc, 'MERGE');

      expect(storeApi.getWorkflow).toHaveBeenCalledWith('persisted', 'wf-7');
      expect(storeApi.putWorkflow).toHaveBeenCalledWith({
        id: 'wf-7',
        name: 'Premium',
        entityClassName: 'Customer',
        active: false,
        persisted: true,
        owner: 'someone',
      });
    });

    it('defaults active to true if doc.active is undefined', async () => {
      storeApi.getWorkflow.mockResolvedValueOnce({
        data: { id: 'wf-7', name: 'Premium', entityClassName: 'Customer', active: false, persisted: true },
      });
      storeApi.putWorkflow.mockResolvedValueOnce({ data: undefined });

      const doc = {
        version: '1.0',
        name: 'wf-7',
        initialState: 's',
        states: { s: { transitions: [] } },
      };

      await gateway.saveWorkflow(null, doc, 'MERGE');

      expect(storeApi.putWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'wf-7', active: true })
      );
    });
  });
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts -t "saveWorkflow"
```

Expected: 2 tests fail.

- [ ] **Step 3: Implement `saveWorkflow`**

Replace the `saveWorkflow` method body in `LegacyPlatformWorkflowGateway.ts` with:

```ts
  async saveWorkflow(
    _modelRef: ModelRef | null,
    doc: WorkflowDoc,
    _mode: 'MERGE'
  ): Promise<void> {
    const store = useStatemachineStore.getState();
    const recordResp = await store.getWorkflow('persisted', doc.name);
    const record = recordResp?.data ?? {};
    const merged = {
      ...record,
      id: doc.name,
      active: doc.active === undefined ? true : doc.active,
    };
    await store.putWorkflow(merged);
  }
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts -t "saveWorkflow"
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.ts \
        packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts
git commit -m "feat(statemachine-react): LegacyPlatformWorkflowGateway.saveWorkflow (active-flag MERGE)"
```

### Task 16: `LegacyPlatformWorkflowGateway.renameWorkflow` (orchestrated)

Same orchestration pattern as the cloud gateway: copy + delete, with `RenameIncompleteError` if the delete fails.

**Files:**
- Modify: `packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts`
- Modify: `packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.ts`

- [ ] **Step 1: Write the failing test**

Append to `LegacyPlatformWorkflowGateway.test.ts` before the outer closing `});`:

```ts
  describe('renameWorkflow', () => {
    it('orchestrates copyWorkflow then deleteWorkflow', async () => {
      storeApi.copyWorkflow.mockResolvedValueOnce({ data: { id: 'wf-new' } });
      storeApi.getWorkflow.mockResolvedValueOnce({
        data: { id: 'wf-new', name: 'autogen', entityClassName: 'Customer', active: true, persisted: true },
      });
      storeApi.putWorkflow.mockResolvedValueOnce({ data: undefined });
      storeApi.deleteWorkflow.mockResolvedValueOnce({ data: undefined });

      await gateway.renameWorkflow(null, 'wf-old', 'NewDisplayName');

      expect(storeApi.copyWorkflow).toHaveBeenCalledWith('persisted', 'wf-old');
      expect(storeApi.getWorkflow).toHaveBeenCalledWith('persisted', 'wf-new');
      expect(storeApi.putWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'wf-new', name: 'NewDisplayName' })
      );
      expect(storeApi.deleteWorkflow).toHaveBeenCalledWith('wf-old');
    });

    it('throws RenameIncompleteError if the delete-old step fails after copy succeeded', async () => {
      storeApi.copyWorkflow.mockResolvedValueOnce({ data: { id: 'wf-new' } });
      storeApi.getWorkflow.mockResolvedValueOnce({
        data: { id: 'wf-new', name: 'autogen', entityClassName: 'Customer', active: true, persisted: true },
      });
      storeApi.putWorkflow.mockResolvedValueOnce({ data: undefined });
      const cause = new Error('delete forbidden');
      storeApi.deleteWorkflow.mockRejectedValueOnce(cause);

      await expect(gateway.renameWorkflow(null, 'wf-old', 'NewName')).rejects.toMatchObject({
        name: 'RenameIncompleteError',
        oldName: 'wf-old',
        newName: 'NewName',
        cause,
      });
    });

    it('propagates copy errors directly when copy fails', async () => {
      storeApi.copyWorkflow.mockRejectedValueOnce(new Error('copy denied'));

      await expect(gateway.renameWorkflow(null, 'wf-old', 'NewName')).rejects.toThrow('copy denied');
      expect(storeApi.deleteWorkflow).not.toHaveBeenCalled();
    });
  });
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts -t "renameWorkflow"
```

Expected: 3 tests fail.

- [ ] **Step 3: Implement `renameWorkflow`**

Replace the `renameWorkflow` method body in `LegacyPlatformWorkflowGateway.ts` with:

```ts
  async renameWorkflow(
    modelRef: ModelRef | null,
    oldName: string,
    newName: string
  ): Promise<void> {
    await this.copyWorkflow(modelRef, oldName, newName);
    try {
      await this.deleteWorkflow(modelRef, oldName);
    } catch (cause) {
      throw new RenameIncompleteError(oldName, newName, cause);
    }
  }
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts -t "renameWorkflow"
```

Expected: 3 tests PASS.

- [ ] **Step 5: Run the full LegacyPlatformWorkflowGateway test file**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts
```

Expected: every test in the file passes (cumulative across Tasks 11–16).

- [ ] **Step 6: Commit**

```bash
git add packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.ts \
        packages/statemachine-react/src/gateways/LegacyPlatformWorkflowGateway.test.ts
git commit -m "feat(statemachine-react): LegacyPlatformWorkflowGateway.renameWorkflow"
```

---

## Factory and Module Exports

### Task 17: Factory `getWorkflowGateway()` and barrel exports

**Files:**
- Create: `packages/statemachine-react/src/gateways/index.ts`
- Create: `packages/statemachine-react/src/gateways/index.test.ts`

- [ ] **Step 1: Write the failing test**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/gateways/index.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getWorkflowGateway } from './index';
import { CloudWorkflowGateway } from './CloudWorkflowGateway';
import { LegacyPlatformWorkflowGateway } from './LegacyPlatformWorkflowGateway';

vi.mock('@cyoda/http-api-react', async () => {
  const actual = await vi.importActual<any>('@cyoda/http-api-react');
  return {
    ...actual,
    HelperFeatureFlags: {
      isCyodaCloud: vi.fn(),
    },
  };
});

const { HelperFeatureFlags } = await import('@cyoda/http-api-react');

describe('getWorkflowGateway', () => {
  beforeEach(() => {
    (HelperFeatureFlags.isCyodaCloud as any).mockReset();
  });

  it('returns CloudWorkflowGateway when isCyodaCloud is true', () => {
    (HelperFeatureFlags.isCyodaCloud as any).mockReturnValue(true);

    const gateway = getWorkflowGateway();

    expect(gateway).toBeInstanceOf(CloudWorkflowGateway);
  });

  it('returns LegacyPlatformWorkflowGateway when isCyodaCloud is false', () => {
    (HelperFeatureFlags.isCyodaCloud as any).mockReturnValue(false);

    const gateway = getWorkflowGateway();

    expect(gateway).toBeInstanceOf(LegacyPlatformWorkflowGateway);
  });

  it('returns a fresh instance per call (no cached singleton)', () => {
    (HelperFeatureFlags.isCyodaCloud as any).mockReturnValue(true);

    const a = getWorkflowGateway();
    const b = getWorkflowGateway();

    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/index.test.ts
```

Expected: fails with `Failed to resolve import "./index"` or with `getWorkflowGateway is not a function`.

- [ ] **Step 3: Implement the factory and barrel**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/gateways/index.ts`:

```ts
/**
 * Workflow gateway barrel + factory.
 *
 * `getWorkflowGateway()` is the only place in the codebase that consults
 * `HelperFeatureFlags.isCyodaCloud()` for workflow operations. Callers
 * (React Query hooks) call this every time and never cache the instance,
 * so a flag flip during HMR is reflected immediately.
 */

import { HelperFeatureFlags } from '@cyoda/http-api-react';
import { CloudWorkflowGateway } from './CloudWorkflowGateway';
import { LegacyPlatformWorkflowGateway } from './LegacyPlatformWorkflowGateway';
import type { WorkflowGateway } from './WorkflowGateway';

export type { WorkflowGateway } from './WorkflowGateway';
export {
  CannotDeleteLastWorkflowError,
  RenameIncompleteError,
  NotImplementedInLegacyError,
} from './errors';
export type {
  ModelRef,
  WorkflowDoc,
  WorkflowSummary,
  WorkflowImportMode,
  WorkflowExportResponse,
  WorkflowImportRequest,
  StateDefinition,
  TransitionDefinition,
  ProcessorDefinition,
  ExternalizedFunctionConfig,
  ExternalizedProcessorConfig,
  ScheduledTransitionConfig,
  ProcessorExecutionMode,
  QueryCondition,
} from './workflowDocTypes';
export { CloudWorkflowGateway } from './CloudWorkflowGateway';
export { LegacyPlatformWorkflowGateway } from './LegacyPlatformWorkflowGateway';

export function getWorkflowGateway(): WorkflowGateway {
  return HelperFeatureFlags.isCyodaCloud()
    ? new CloudWorkflowGateway()
    : new LegacyPlatformWorkflowGateway();
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/gateways/index.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/gateways/index.ts \
        packages/statemachine-react/src/gateways/index.test.ts
git commit -m "feat(statemachine-react): add getWorkflowGateway factory + module exports"
```

### Task 18: Re-export the gateway module from the package root

**Files:**
- Modify: `packages/statemachine-react/src/index.ts`

- [ ] **Step 1: Add the re-export**

In `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/index.ts`, immediately **after** the line:

```ts
// Stores
export { useStatemachineStore } from './stores/statemachineStore';
export { useGraphicalStatemachineStore } from './stores/graphicalStatemachineStore';
```

…insert:

```ts

// Gateways
export * from './gateways';
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit -p packages/statemachine-react/tsconfig.json 2>&1 | grep -E "gateways" | head -5
```

Expected: no output (the re-export does not introduce new errors).

- [ ] **Step 3: Commit**

```bash
git add packages/statemachine-react/src/index.ts
git commit -m "feat(statemachine-react): re-export gateways from package root"
```

---

## Store: `selectedModelRef` UI state

### Task 19: Add `selectedModelRef` to `statemachineStore`

The cloud Workflows page needs to remember which entity-model the user is browsing. We add it to the existing Zustand store, following the same `partialize` persistence pattern.

**Files:**
- Modify: `packages/statemachine-react/src/stores/statemachineStore.ts`
- Modify: `packages/statemachine-react/src/stores/statemachineStore.test.ts`

- [ ] **Step 1: Write the failing test**

In `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/stores/statemachineStore.test.ts`, locate the existing describe-block that tests `setSelectedWorkflow` (around line 50). Immediately **after** that `it(...)` block, insert this new `it`:

```ts
    it('should set and clear selected model ref', () => {
      const { result } = renderHook(() => useStatemachineStore());

      act(() => {
        result.current.setSelectedModelRef({ entityName: 'Customer', modelVersion: 1 });
      });

      expect(result.current.selectedModelRef).toEqual({ entityName: 'Customer', modelVersion: 1 });

      act(() => {
        result.current.setSelectedModelRef(null);
      });

      expect(result.current.selectedModelRef).toBeNull();
    });
```

If `renderHook` and `act` are not already imported in the test file's import block, add them to the existing `@testing-library/react` import. (Check the file's imports first; the existing `setSelectedWorkflow` test already uses these helpers, so they should already be imported.)

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/stores/statemachineStore.test.ts -t "selected model ref"
```

Expected: fails with `result.current.setSelectedModelRef is not a function`.

- [ ] **Step 3: Update the store**

In `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/stores/statemachineStore.ts`:

A. Add the import at the top of the file. Find the existing `import type { ... } from '../types';` block and add a new `import type` line below it:

```ts
import type { ModelRef } from '../gateways/workflowDocTypes';
```

B. In the `StatemachineState` interface, find the existing `selectedWorkflow: Workflow | null;` property. Add immediately after it:

```ts
  selectedModelRef: ModelRef | null;
```

…and find the existing `setSelectedWorkflow: (workflow: Workflow | null) => void;` action signature. Add immediately after it:

```ts
  setSelectedModelRef: (modelRef: ModelRef | null) => void;
```

C. In the `create<StatemachineState>()` body, find `selectedWorkflow: null,` (the initial state). Add immediately after it:

```ts
      selectedModelRef: null,
```

D. Find `setSelectedWorkflow: (workflow) => set({ selectedWorkflow: workflow }),`. Add immediately after it:

```ts
      setSelectedModelRef: (modelRef) => set({ selectedModelRef: modelRef }),
```

E. Find the `partialize` block:

```ts
      partialize: (state) => ({
        selectedWorkflow: state.selectedWorkflow,
        selectedEntityClassName: state.selectedEntityClassName,
      }),
```

…and replace it with:

```ts
      partialize: (state) => ({
        selectedWorkflow: state.selectedWorkflow,
        selectedEntityClassName: state.selectedEntityClassName,
        selectedModelRef: state.selectedModelRef,
      }),
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/stores/statemachineStore.test.ts -t "selected model ref"
```

Expected: 1 test PASS. Also re-run the entire test file to confirm no regressions:

```bash
pnpm exec vitest run packages/statemachine-react/src/stores/statemachineStore.test.ts
```

Expected: every test in the file passes.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/stores/statemachineStore.ts \
        packages/statemachine-react/src/stores/statemachineStore.test.ts
git commit -m "feat(statemachine-react): add selectedModelRef to statemachineStore"
```

---

## React Query Hook Rewrites

The five hooks `useWorkflowsList`, `useCreateWorkflow`, `useUpdateWorkflow`, `useDeleteWorkflow`, `useCopyWorkflow` are rewritten to dispatch through the gateway. Two new hooks (`useWorkflowDoc`, `useRenameWorkflow`) are added. The legacy `useWorkflow` (used by `WorkflowDetail.tsx`) is deliberately left untouched per "Implementation choices" §1 above.

Per spec §4.6, cache keys include the model ref for cloud mode. We extend `statemachineKeys.workflowsList` and `statemachineKeys.workflow` to take an optional `modelRef`.

### Task 20: Extend `statemachineKeys` and rewrite `useWorkflowsList`

**Files:**
- Modify: `packages/statemachine-react/src/hooks/useStatemachine.ts`
- Modify: `packages/statemachine-react/src/hooks/useStatemachine.test.tsx`

- [ ] **Step 1: Write the failing test**

In `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/hooks/useStatemachine.test.tsx`, locate the existing tests for `useWorkflowsList`. Add a new describe-block immediately **after** them:

```ts
  describe('useWorkflowsList — gateway-backed', () => {
    it('calls gateway.listWorkflows with the provided modelRef and returns the result', async () => {
      const summaries = [{ name: 'A', initialState: 's', active: true }];
      const listWorkflows = vi.fn().mockResolvedValue(summaries);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows,
        loadWorkflow: vi.fn(),
        saveWorkflow: vi.fn(),
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const modelRef = { entityName: 'Customer', modelVersion: 1 };
      const { result } = renderHook(() => useWorkflowsList(modelRef), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(listWorkflows).toHaveBeenCalledWith(modelRef);
      expect(result.current.data).toEqual(summaries);
    });

    it('passes null modelRef through to the gateway', async () => {
      const listWorkflows = vi.fn().mockResolvedValue([]);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows,
        loadWorkflow: vi.fn(),
        saveWorkflow: vi.fn(),
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const { result } = renderHook(() => useWorkflowsList(null), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(listWorkflows).toHaveBeenCalledWith(null);
    });
  });
```

You will also need to add the imports/mocks at the top of the test file. Find the existing top-of-file import block and add:

```ts
import { getWorkflowGateway } from '../gateways';

vi.mock('../gateways', async () => {
  const actual = await vi.importActual<any>('../gateways');
  return {
    ...actual,
    getWorkflowGateway: vi.fn(),
  };
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/hooks/useStatemachine.test.tsx -t "useWorkflowsList — gateway-backed"
```

Expected: 2 tests fail (the existing `useWorkflowsList` still calls the store, not the gateway).

- [ ] **Step 3: Update `statemachineKeys` and rewrite `useWorkflowsList`**

In `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/hooks/useStatemachine.ts`:

A. Update the imports at the top of the file. Find the existing `import { useStatemachineStore } from '../stores/statemachineStore';` and immediately after the existing type import block, add:

```ts
import { getWorkflowGateway } from '../gateways';
import type { ModelRef, WorkflowDoc, WorkflowSummary } from '../gateways/workflowDocTypes';
```

B. Find the `statemachineKeys` object. Replace the `workflowsList` and `workflow` entries with model-ref-aware versions:

```ts
  workflowsList: (modelRef?: ModelRef | null, entityClassName?: string) =>
    [...statemachineKeys.workflows(), 'list', modelRef ?? null, entityClassName] as const,
  workflow: (persistedType: PersistedType, workflowId: string) =>
    [...statemachineKeys.workflows(), persistedType, workflowId] as const,
  workflowDoc: (modelRef: ModelRef | null, name: string) =>
    [...statemachineKeys.workflows(), 'doc', modelRef, name] as const,
```

C. Replace the existing `useWorkflowsList` function entirely with:

```ts
export function useWorkflowsList(modelRef: ModelRef | null = null): ReturnType<typeof useQuery<WorkflowSummary[]>> {
  return useQuery<WorkflowSummary[]>({
    queryKey: statemachineKeys.workflowsList(modelRef),
    queryFn: async () => {
      const gateway = getWorkflowGateway();
      return gateway.listWorkflows(modelRef);
    },
  });
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/hooks/useStatemachine.test.tsx -t "useWorkflowsList"
```

Expected: all `useWorkflowsList` tests PASS (both old and new). If the old tests were calling the store directly and now break, **the old tests are stale** — update them to use the gateway mock pattern shown above (mock `getWorkflowGateway` rather than the store), keeping their assertions structurally similar.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/hooks/useStatemachine.ts \
        packages/statemachine-react/src/hooks/useStatemachine.test.tsx
git commit -m "feat(statemachine-react): rewrite useWorkflowsList to dispatch through gateway"
```

### Task 21: Add `useWorkflowDoc` (cloud-only loader)

**Files:**
- Modify: `packages/statemachine-react/src/hooks/useStatemachine.ts`
- Modify: `packages/statemachine-react/src/hooks/useStatemachine.test.tsx`

- [ ] **Step 1: Write the failing test**

In `useStatemachine.test.tsx`, append a new describe-block:

```ts
  describe('useWorkflowDoc', () => {
    it('calls gateway.loadWorkflow with modelRef + name', async () => {
      const doc = { version: '1.0', name: 'X', initialState: 's', states: {} };
      const loadWorkflow = vi.fn().mockResolvedValue(doc);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow,
        saveWorkflow: vi.fn(),
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const modelRef = { entityName: 'Customer', modelVersion: 1 };
      const { result } = renderHook(() => useWorkflowDoc(modelRef, 'X'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(loadWorkflow).toHaveBeenCalledWith(modelRef, 'X');
      expect(result.current.data).toEqual(doc);
    });

    it('does not run when name is empty', () => {
      const loadWorkflow = vi.fn();
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow,
        saveWorkflow: vi.fn(),
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      renderHook(() => useWorkflowDoc({ entityName: 'X', modelVersion: 1 }, ''), { wrapper });

      expect(loadWorkflow).not.toHaveBeenCalled();
    });
  });
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/hooks/useStatemachine.test.tsx -t "useWorkflowDoc"
```

Expected: fails with `useWorkflowDoc is not defined`.

- [ ] **Step 3: Add the hook**

In `useStatemachine.ts`, add the new hook immediately **after** the existing `useWorkflow` function:

```ts
export function useWorkflowDoc(modelRef: ModelRef | null, name: string, enabled = true) {
  return useQuery<WorkflowDoc>({
    queryKey: statemachineKeys.workflowDoc(modelRef, name),
    queryFn: async () => {
      const gateway = getWorkflowGateway();
      return gateway.loadWorkflow(modelRef, name);
    },
    enabled: enabled && !!name,
  });
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/hooks/useStatemachine.test.tsx -t "useWorkflowDoc"
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/hooks/useStatemachine.ts \
        packages/statemachine-react/src/hooks/useStatemachine.test.tsx
git commit -m "feat(statemachine-react): add useWorkflowDoc cloud loader hook"
```

### Task 22: Rewrite `useCreateWorkflow` and `useUpdateWorkflow` to gateway

Both create and update become a single `gateway.saveWorkflow(modelRef, doc, 'MERGE')` call (the cloud doc API treats them identically — MERGE creates or updates by name). For backward-compat with legacy callers we keep both hook names, but they share an implementation.

**Files:**
- Modify: `packages/statemachine-react/src/hooks/useStatemachine.ts`
- Modify: `packages/statemachine-react/src/hooks/useStatemachine.test.tsx`

- [ ] **Step 1: Write the failing test**

Append to `useStatemachine.test.tsx`:

```ts
  describe('useCreateWorkflow / useUpdateWorkflow — gateway-backed', () => {
    it('useCreateWorkflow.mutateAsync calls gateway.saveWorkflow with MERGE', async () => {
      const saveWorkflow = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow: vi.fn(),
        saveWorkflow,
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const { result } = renderHook(() => useCreateWorkflow(), { wrapper });

      const doc = { version: '1.0', name: 'X', initialState: 's', states: {} };
      const modelRef = { entityName: 'Customer', modelVersion: 1 };
      await result.current.mutateAsync({ modelRef, doc });

      expect(saveWorkflow).toHaveBeenCalledWith(modelRef, doc, 'MERGE');
    });

    it('useUpdateWorkflow.mutateAsync calls gateway.saveWorkflow with MERGE', async () => {
      const saveWorkflow = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow: vi.fn(),
        saveWorkflow,
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const { result } = renderHook(() => useUpdateWorkflow(), { wrapper });

      const doc = { version: '1.0', name: 'X', initialState: 's', states: {} };
      await result.current.mutateAsync({ modelRef: null, doc });

      expect(saveWorkflow).toHaveBeenCalledWith(null, doc, 'MERGE');
    });
  });
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/hooks/useStatemachine.test.tsx -t "useCreateWorkflow / useUpdateWorkflow — gateway-backed"
```

Expected: 2 tests fail.

- [ ] **Step 3: Rewrite both hooks**

In `useStatemachine.ts`, find the existing `useCreateWorkflow` and `useUpdateWorkflow` functions and replace them entirely with:

```ts
export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ modelRef, doc }: { modelRef: ModelRef | null; doc: WorkflowDoc }) => {
      const gateway = getWorkflowGateway();
      await gateway.saveWorkflow(modelRef, doc, 'MERGE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.workflows() });
    },
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ modelRef, doc }: { modelRef: ModelRef | null; doc: WorkflowDoc }) => {
      const gateway = getWorkflowGateway();
      await gateway.saveWorkflow(modelRef, doc, 'MERGE');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.workflows() });
      queryClient.invalidateQueries({
        queryKey: statemachineKeys.workflowDoc(variables.modelRef, variables.doc.name),
      });
    },
  });
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/hooks/useStatemachine.test.tsx -t "useCreateWorkflow / useUpdateWorkflow — gateway-backed"
```

Expected: 2 tests PASS. Older tests for these hooks (if they call the store directly) are now stale — update them to the new mutation argument shape (`{ modelRef, doc }`) using the same gateway-mock pattern.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/hooks/useStatemachine.ts \
        packages/statemachine-react/src/hooks/useStatemachine.test.tsx
git commit -m "feat(statemachine-react): rewrite useCreateWorkflow and useUpdateWorkflow to gateway"
```

### Task 23: Rewrite `useDeleteWorkflow` to gateway

**Files:**
- Modify: `packages/statemachine-react/src/hooks/useStatemachine.ts`
- Modify: `packages/statemachine-react/src/hooks/useStatemachine.test.tsx`

- [ ] **Step 1: Write the failing test**

Append to `useStatemachine.test.tsx`:

```ts
  describe('useDeleteWorkflow — gateway-backed', () => {
    it('mutateAsync calls gateway.deleteWorkflow with modelRef + name', async () => {
      const deleteWorkflow = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow: vi.fn(),
        saveWorkflow: vi.fn(),
        deleteWorkflow,
        copyWorkflow: vi.fn(),
        renameWorkflow: vi.fn(),
      } as any);

      const { result } = renderHook(() => useDeleteWorkflow(), { wrapper });

      const modelRef = { entityName: 'Customer', modelVersion: 1 };
      await result.current.mutateAsync({ modelRef, name: 'X' });

      expect(deleteWorkflow).toHaveBeenCalledWith(modelRef, 'X');
    });
  });
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/hooks/useStatemachine.test.tsx -t "useDeleteWorkflow — gateway-backed"
```

Expected: fails.

- [ ] **Step 3: Rewrite the hook**

In `useStatemachine.ts`, replace the entire existing `useDeleteWorkflow` function with:

```ts
export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ modelRef, name }: { modelRef: ModelRef | null; name: string }) => {
      const gateway = getWorkflowGateway();
      await gateway.deleteWorkflow(modelRef, name);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.workflows() });
    },
  });
}
```

(Note: the old optimistic-update behavior on the legacy hook is dropped here. If the legacy list page relied on optimistic delete, it'll see a slightly slower UX — but invalidation re-fetches and the row disappears correctly. Document this delta in the PR description.)

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/hooks/useStatemachine.test.tsx -t "useDeleteWorkflow"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/hooks/useStatemachine.ts \
        packages/statemachine-react/src/hooks/useStatemachine.test.tsx
git commit -m "feat(statemachine-react): rewrite useDeleteWorkflow to gateway"
```

### Task 24: Rewrite `useCopyWorkflow` to gateway

**Files:**
- Modify: `packages/statemachine-react/src/hooks/useStatemachine.ts`
- Modify: `packages/statemachine-react/src/hooks/useStatemachine.test.tsx`

- [ ] **Step 1: Write the failing test**

Append to `useStatemachine.test.tsx`:

```ts
  describe('useCopyWorkflow — gateway-backed', () => {
    it('mutateAsync calls gateway.copyWorkflow with (modelRef, sourceName, newName)', async () => {
      const copyWorkflow = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow: vi.fn(),
        saveWorkflow: vi.fn(),
        deleteWorkflow: vi.fn(),
        copyWorkflow,
        renameWorkflow: vi.fn(),
      } as any);

      const { result } = renderHook(() => useCopyWorkflow(), { wrapper });

      const modelRef = { entityName: 'Customer', modelVersion: 1 };
      await result.current.mutateAsync({ modelRef, sourceName: 'A', newName: 'B' });

      expect(copyWorkflow).toHaveBeenCalledWith(modelRef, 'A', 'B');
    });
  });
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/hooks/useStatemachine.test.tsx -t "useCopyWorkflow — gateway-backed"
```

Expected: fails.

- [ ] **Step 3: Rewrite the hook**

In `useStatemachine.ts`, replace the entire existing `useCopyWorkflow` function with:

```ts
export function useCopyWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      modelRef,
      sourceName,
      newName,
    }: {
      modelRef: ModelRef | null;
      sourceName: string;
      newName: string;
    }) => {
      const gateway = getWorkflowGateway();
      await gateway.copyWorkflow(modelRef, sourceName, newName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.workflows() });
    },
  });
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/hooks/useStatemachine.test.tsx -t "useCopyWorkflow"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/hooks/useStatemachine.ts \
        packages/statemachine-react/src/hooks/useStatemachine.test.tsx
git commit -m "feat(statemachine-react): rewrite useCopyWorkflow to gateway"
```

### Task 25: Add `useRenameWorkflow`

**Files:**
- Modify: `packages/statemachine-react/src/hooks/useStatemachine.ts`
- Modify: `packages/statemachine-react/src/hooks/useStatemachine.test.tsx`

- [ ] **Step 1: Write the failing test**

Append to `useStatemachine.test.tsx`:

```ts
  describe('useRenameWorkflow', () => {
    it('mutateAsync calls gateway.renameWorkflow with (modelRef, oldName, newName)', async () => {
      const renameWorkflow = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getWorkflowGateway).mockReturnValue({
        listWorkflows: vi.fn(),
        loadWorkflow: vi.fn(),
        saveWorkflow: vi.fn(),
        deleteWorkflow: vi.fn(),
        copyWorkflow: vi.fn(),
        renameWorkflow,
      } as any);

      const { result } = renderHook(() => useRenameWorkflow(), { wrapper });

      const modelRef = { entityName: 'Customer', modelVersion: 1 };
      await result.current.mutateAsync({ modelRef, oldName: 'A', newName: 'B' });

      expect(renameWorkflow).toHaveBeenCalledWith(modelRef, 'A', 'B');
    });
  });
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/hooks/useStatemachine.test.tsx -t "useRenameWorkflow"
```

Expected: fails with `useRenameWorkflow is not defined`.

- [ ] **Step 3: Add the hook**

In `useStatemachine.ts`, add the new hook immediately **after** `useCopyWorkflow`:

```ts
export function useRenameWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      modelRef,
      oldName,
      newName,
    }: {
      modelRef: ModelRef | null;
      oldName: string;
      newName: string;
    }) => {
      const gateway = getWorkflowGateway();
      await gateway.renameWorkflow(modelRef, oldName, newName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.workflows() });
    },
  });
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/hooks/useStatemachine.test.tsx -t "useRenameWorkflow"
```

Expected: PASS.

- [ ] **Step 5: Run the full hooks test file**

```bash
pnpm exec vitest run packages/statemachine-react/src/hooks/useStatemachine.test.tsx
```

Expected: every test passes (including all old non-workflow hook tests like state/transition/criteria/process which were untouched in this sub-branch).

- [ ] **Step 6: Commit**

```bash
git add packages/statemachine-react/src/hooks/useStatemachine.ts \
        packages/statemachine-react/src/hooks/useStatemachine.test.tsx
git commit -m "feat(statemachine-react): add useRenameWorkflow hook"
```

---

## Page Updates

### Task 26: Update legacy `Workflows.tsx` call sites for the new hook signatures

The hook signatures changed: `useWorkflowsList()` now optionally takes a modelRef, and the mutation hooks take typed argument objects. The legacy page passes `null` for modelRef.

**Files:**
- Modify: `packages/statemachine-react/src/pages/Workflows.tsx`

- [ ] **Step 1: Update the hook call sites**

In `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/pages/Workflows.tsx`:

A. Find:

```tsx
  const { data: workflows = [], isLoading, refetch } = useWorkflowsList();
```

…and replace with:

```tsx
  // Legacy mode passes null modelRef; the legacy gateway ignores it.
  const { data: workflows = [], isLoading, refetch } = useWorkflowsList(null);
```

B. Find every place the page calls `deleteWorkflowMutation.mutate(...)` (or `mutateAsync`). The argument used to be a string `workflowId`. Update to `{ modelRef: null, name: workflowId }`. For example, if you find:

```tsx
  deleteWorkflowMutation.mutate(workflow.id);
```

…replace with:

```tsx
  deleteWorkflowMutation.mutate({ modelRef: null, name: workflow.id });
```

Apply the same translation to every call site in this file. Use `git grep -n "deleteWorkflowMutation" packages/statemachine-react/src/pages/Workflows.tsx` to enumerate them.

C. Same translation for `copyWorkflowMutation`. The old shape was `{ persistedType, workflowId }`. The new shape is `{ modelRef: null, sourceName: workflow.id, newName: <user-provided-name> }`. **Note:** the legacy list page today probably does not prompt for a new name — it relies on the backend's auto-name behavior. To preserve behavior without a prompt UX in this sub-branch, pass `newName` as the same as `sourceName` plus a suffix:

```tsx
  copyWorkflowMutation.mutate({
    modelRef: null,
    sourceName: workflow.id,
    newName: `${workflow.name} (copy)`,
  });
```

This is acknowledged behavior drift documented in the PR description.

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit -p packages/statemachine-react/tsconfig.json 2>&1 | grep "Workflows.tsx"
```

Expected: no output (no new errors in `Workflows.tsx`). If the saas-app type-check pre-existing errors fold these in, ignore — verify by `git diff main..HEAD -- packages/statemachine-react/src/pages/Workflows.tsx` shows only the documented changes.

- [ ] **Step 3: Manually run the existing Workflows.test if any exists**

```bash
pnpm exec vitest run packages/statemachine-react/src/pages/Workflows.test.tsx
```

Expected: every test passes. If any test fails because it asserted on the old mutation argument shape, update the test to use the new shape.

- [ ] **Step 4: Commit**

```bash
git add packages/statemachine-react/src/pages/Workflows.tsx
git commit -m "refactor(statemachine-react): pass null modelRef + new mutation argument shapes in legacy Workflows page"
```

If `Workflows.test.tsx` was modified, include it in the same commit.

---

## Cloud Stub Page

### Task 27: Add the cloud workflow list stub page

A minimal page that exercises the gateway end-to-end so we can manually smoke the cloud path before sub-branch 3 lands the real UI.

**Files:**
- Create: `packages/statemachine-react/src/pages/WorkflowsCloudStub.tsx`
- Create: `packages/statemachine-react/src/pages/WorkflowsCloudStub.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/pages/WorkflowsCloudStub.test.tsx`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkflowsCloudStub } from './WorkflowsCloudStub';
import { getWorkflowGateway } from '../gateways';

vi.mock('../gateways', async () => {
  const actual = await vi.importActual<any>('../gateways');
  return {
    ...actual,
    getWorkflowGateway: vi.fn(),
  };
});

function renderWithClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <WorkflowsCloudStub />
    </QueryClientProvider>
  );
}

describe('WorkflowsCloudStub', () => {
  beforeEach(() => {
    vi.mocked(getWorkflowGateway).mockReset();
  });

  it('renders the model picker controls', () => {
    vi.mocked(getWorkflowGateway).mockReturnValue({
      listWorkflows: vi.fn().mockResolvedValue([]),
      loadWorkflow: vi.fn(),
      saveWorkflow: vi.fn(),
      deleteWorkflow: vi.fn(),
      copyWorkflow: vi.fn(),
      renameWorkflow: vi.fn(),
    } as any);

    renderWithClient();

    expect(screen.getByLabelText(/entity name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/model version/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
  });

  it('calls gateway.listWorkflows with the entered model ref and renders the result', async () => {
    const listWorkflows = vi.fn().mockResolvedValue([
      { name: 'Premium', desc: 'p', active: true, initialState: 'draft' },
      { name: 'Standard', desc: undefined, active: false, initialState: 'pending' },
    ]);
    vi.mocked(getWorkflowGateway).mockReturnValue({
      listWorkflows,
      loadWorkflow: vi.fn(),
      saveWorkflow: vi.fn(),
      deleteWorkflow: vi.fn(),
      copyWorkflow: vi.fn(),
      renameWorkflow: vi.fn(),
    } as any);

    renderWithClient();

    await userEvent.type(screen.getByLabelText(/entity name/i), 'Customer');
    await userEvent.clear(screen.getByLabelText(/model version/i));
    await userEvent.type(screen.getByLabelText(/model version/i), '1');
    await userEvent.click(screen.getByRole('button', { name: /load/i }));

    await waitFor(() => {
      expect(listWorkflows).toHaveBeenCalledWith({ entityName: 'Customer', modelVersion: 1 });
    });
    await waitFor(() => {
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/pages/WorkflowsCloudStub.test.tsx
```

Expected: fails with `Failed to resolve import "./WorkflowsCloudStub"`.

- [ ] **Step 3: Implement the stub page**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/pages/WorkflowsCloudStub.tsx`:

```tsx
/**
 * WorkflowsCloudStub — minimal manual-smoke page for the WorkflowGateway.
 *
 * Replaced by the real cloud Workflows page in sub-branch 3
 * (entity-model picker + workflows table + row actions + URL state persistence).
 * This stub exists only to exercise gateway calls end-to-end during sub-branch 2.
 */

import React, { useState } from 'react';
import { useWorkflowsList } from '../hooks/useStatemachine';
import type { ModelRef } from '../gateways';

export const WorkflowsCloudStub: React.FC = () => {
  const [entityName, setEntityName] = useState('');
  const [modelVersion, setModelVersion] = useState('1');
  const [activeRef, setActiveRef] = useState<ModelRef | null>(null);

  const { data: workflows, isLoading, error } = useWorkflowsList(activeRef);

  return (
    <div style={{ padding: 24 }}>
      <h2>Cloud workflows (stub)</h2>
      <p>
        Manual-smoke page for the workflow gateway. The real cloud Workflows
        page (with model picker + URL state + row actions) lands in sub-branch 3.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <label>
          Entity name
          <input
            aria-label="entity name"
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            style={{ marginLeft: 4 }}
          />
        </label>
        <label>
          Model version
          <input
            aria-label="model version"
            value={modelVersion}
            onChange={(e) => setModelVersion(e.target.value)}
            style={{ marginLeft: 4, width: 60 }}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            const v = parseInt(modelVersion, 10);
            if (!entityName || Number.isNaN(v)) return;
            setActiveRef({ entityName, modelVersion: v });
          }}
        >
          Load
        </button>
      </div>

      {isLoading && <p>Loading…</p>}
      {error && <p style={{ color: 'red' }}>Error: {(error as Error).message}</p>}
      {workflows && (
        <ul>
          {workflows.map((w) => (
            <li key={w.name}>
              <strong>{w.name}</strong>
              {w.desc ? ` — ${w.desc}` : ''} (active: {String(w.active)})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/pages/WorkflowsCloudStub.test.tsx
```

Expected: 2 tests PASS.

- [ ] **Step 5: Export from package barrel**

In `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/index.ts`, immediately **after** the line `export { Workflows } from './pages/Workflows';`, insert:

```ts
export { WorkflowsCloudStub } from './pages/WorkflowsCloudStub';
```

- [ ] **Step 6: Commit**

```bash
git add packages/statemachine-react/src/pages/WorkflowsCloudStub.tsx \
        packages/statemachine-react/src/pages/WorkflowsCloudStub.test.tsx \
        packages/statemachine-react/src/index.ts
git commit -m "feat(statemachine-react): add WorkflowsCloudStub manual-smoke page"
```

### Task 28: Branch the `/workflows` route to render the stub under cloud mode

**Files:**
- Modify: `packages/statemachine-react/src/pages/Workflows.tsx`

The existing `Workflows.tsx` is the legacy implementation. Per spec §6.3, "the branch lives inside `Workflows.tsx`'s top-level render". For sub-branch 2, that branch renders the stub when `isCyodaCloud()`. Sub-branch 3 will replace the stub with the real cloud list page.

- [ ] **Step 1: Add the branch**

In `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/pages/Workflows.tsx`:

A. Add the imports near the top of the file (alongside other `@cyoda/http-api-react` imports if any, or as a new import line):

```ts
import { HelperFeatureFlags } from '@cyoda/http-api-react';
import { WorkflowsCloudStub } from './WorkflowsCloudStub';
```

B. At the top of the `Workflows` component function body — **before** any other hook calls — insert:

```tsx
  // When cyoda-cloud (or cyoda-go) is in use, render the stub cloud page.
  // The real cloud Workflows UI lands in sub-branch 3.
  if (HelperFeatureFlags.isCyodaCloud()) {
    return <WorkflowsCloudStub />;
  }
```

This early return keeps the existing legacy code path entirely untouched.

- [ ] **Step 2: Verify legacy tests still pass**

```bash
pnpm exec vitest run packages/statemachine-react/src/pages/Workflows.test.tsx
```

Expected: existing legacy tests pass (they don't set `IS_CYODA_CLOUD=true`, so the early return doesn't fire).

- [ ] **Step 3: Commit**

```bash
git add packages/statemachine-react/src/pages/Workflows.tsx
git commit -m "feat(statemachine-react): render WorkflowsCloudStub when isCyodaCloud is true"
```

---

## Verification and Handoff

### Task 29: Full automated verification

**Files:** none modified

- [ ] **Step 1: Run the affected test files**

```bash
pnpm exec vitest run \
  packages/statemachine-react/src/gateways \
  packages/statemachine-react/src/stores/statemachineStore.test.ts \
  packages/statemachine-react/src/hooks/useStatemachine.test.tsx \
  packages/statemachine-react/src/pages/Workflows.test.tsx \
  packages/statemachine-react/src/pages/WorkflowsCloudStub.test.tsx
```

Expected: every test passes. Capture the count.

- [ ] **Step 2: Run the full root vitest suite**

```bash
pnpm test:run
```

Expected: every test passes that was passing on the `feature/cyoda-go-support` parent branch tip. If any **new** failure appears that involves `gateways/`, `useStatemachine.ts`, `statemachineStore.ts`, `Workflows.tsx`, or `WorkflowsCloudStub.tsx`, that's a regression — investigate before proceeding. Pre-existing failures unrelated to this work (per the entries documented in `https://github.com/Cyoda-platform/cyoda-env-dashboard/issues/7`) are tolerated; do not "fix" them in this branch.

- [ ] **Step 3: Type-check the changed package**

```bash
pnpm exec tsc --noEmit -p packages/statemachine-react/tsconfig.json 2>&1 | tee /tmp/tsc-foundation.log | tail -20
```

Compare error count to the baseline at the parent commit:

```bash
git stash push -m "tmp" -- packages/statemachine-react docs/cyoda-cloud
git checkout feature/cyoda-go-support
pnpm exec tsc --noEmit -p packages/statemachine-react/tsconfig.json 2>&1 | tail -20 > /tmp/tsc-baseline.log
git checkout feature/cyoda-go-support-workflow-gateway
git stash pop
```

Compare the two error counts. Expected: equal (no new errors introduced). If higher, investigate.

- [ ] **Step 4: Confirm git status**

```bash
git status
git log --oneline feature/cyoda-go-support..HEAD
```

Expected: `git status` shows only the unrelated `docs/cyoda-cloud/api/*` modifications. The log shows ~28 commits matching the task list.

### Task 30: Push and open the PR

**Files:** none

- [ ] **Step 1: Push the sub-branch**

```bash
git push -u origin feature/cyoda-go-support-workflow-gateway
```

If the credential helper prompts, use the token-env workaround used in earlier sub-branches: `git push https://x-access-token:${GH_TOKEN}@github.com/Cyoda-platform/cyoda-env-dashboard.git feature/cyoda-go-support-workflow-gateway`.

- [ ] **Step 2: Open the PR against the parent feature branch**

```bash
gh pr create \
  --base feature/cyoda-go-support \
  --head feature/cyoda-go-support-workflow-gateway \
  --title "Workflow data layer: WorkflowGateway abstraction + Cloud and Legacy implementations" \
  --body "$(cat <<'EOF'
## Summary

Sub-branch 2 of 7 of the cyoda-go support build. Introduces the workflow data-layer strategy boundary (\`WorkflowGateway\`) with two implementations and a single factory; rewrites the affected React Query hooks; preserves all existing legacy UI behavior; lands a minimal stub cloud page so the gateway is exercisable end-to-end via the dev server.

### What's in this PR

- **Cloud workflow types** (\`gateways/workflowDocTypes.ts\`) modeled on \`docs/cyoda-cloud/api/openapi-workflow.yml\`.
- **Typed errors** (\`gateways/errors.ts\`): \`CannotDeleteLastWorkflowError\`, \`RenameIncompleteError\`, \`NotImplementedInLegacyError\`.
- **\`WorkflowGateway\`** interface with six methods (list / load / save / delete / copy / rename) — see \`gateways/WorkflowGateway.ts\`.
- **\`CloudWorkflowGateway\`** — full implementation against \`/model/{entityName}/{modelVersion}/workflow/{export,import}\`. Cloud delete uses REPLACE-minus-target with a strict ≥1 invariant. Cloud rename orchestrates copy+delete with \`RenameIncompleteError\` on partial failure.
- **\`LegacyPlatformWorkflowGateway\`** — adapts existing legacy store calls. \`listWorkflows\`, \`deleteWorkflow\`, \`copyWorkflow\` (orchestrated copy+rename), \`saveWorkflow\` (active-flag MERGE only), \`renameWorkflow\` (orchestrated copy+delete) are implemented. \`loadWorkflow\` throws \`NotImplementedInLegacyError\` since no legacy code path consumes it.
- **Factory** \`getWorkflowGateway()\` is the single read site for \`HelperFeatureFlags.isCyodaCloud()\` in workflow code paths.
- **\`statemachineStore\`** gains \`selectedModelRef\` UI state with persistence via \`partialize\`.
- **React Query hooks**: \`useWorkflowsList\`, \`useCreateWorkflow\`, \`useUpdateWorkflow\`, \`useDeleteWorkflow\`, \`useCopyWorkflow\` rewritten to dispatch through the gateway with new typed mutation argument shapes. New hooks: \`useWorkflowDoc\` (cloud loader), \`useRenameWorkflow\` (orchestrated rename).
- **\`Workflows.tsx\`** branches on \`isCyodaCloud()\` — cloud mode renders \`WorkflowsCloudStub\`; legacy mode keeps its existing UI with updated mutation call sites (passes \`null\` for \`modelRef\`).
- **\`WorkflowsCloudStub\`**: minimal manual-smoke page (model-ref input + workflows list). Replaced by the real cloud Workflows UI in sub-branch 3.

### Implementation choices (deviations from spec)

Documented in detail at the top of the plan (\`docs/superpowers/plans/2026-04-16-cyoda-go-workflow-gateway.md\` § "Implementation choices"). Two:

1. \`useWorkflow\` is **not** rewritten — it remains a legacy-only hook used by \`WorkflowDetail.tsx\`. A new \`useWorkflowDoc\` hook is added for cloud loaders.
2. \`LegacyPlatformWorkflowGateway.loadWorkflow\` throws \`NotImplementedInLegacyError\` — no legacy code path uses it.

### Behavior changes worth flagging

- The legacy \`useDeleteWorkflow\`'s previous optimistic-update behavior is dropped. Invalidation re-fetches; the deleted row disappears correctly but slightly slower than the previous in-place removal. Negligible UX impact for the legacy list page.
- The legacy \`useCopyWorkflow\` previously called \`copyWorkflow\` with no name (backend auto-named the copy). The new shape requires a \`newName\`. \`Workflows.tsx\` synthesizes \`"\${workflow.name} (copy)"\` to preserve the no-prompt behavior; the underlying gateway now performs an extra \`getWorkflow\` + \`putWorkflow\` to set the name. Functionally equivalent for the user; an extra HTTP round-trip on copy.

### Spec / plan

- Design spec: \`docs/superpowers/specs/2026-04-16-cyoda-go-support-design.md\` §4, §5, §9.2 sub-branch 2.
- Implementation plan: \`docs/superpowers/plans/2026-04-16-cyoda-go-workflow-gateway.md\`.

## Test plan

- [x] All gateway test files pass (\`gateways/*.test.ts\`).
- [x] \`useStatemachine.test.tsx\` passes including the new gateway-mocked tests.
- [x] \`statemachineStore.test.ts\` passes including the new \`selectedModelRef\` test.
- [x] \`Workflows.test.tsx\` passes (legacy path; cloud branch covered separately by \`WorkflowsCloudStub.test.tsx\`).
- [x] Type-check error count unchanged from parent commit.
- [ ] Manual smoke (legacy mode): existing Workflows page renders, list/delete/copy work as before. **(Reviewer to verify.)**
- [ ] Manual smoke (cloud mode, with a real backend or cyoda-go container): navigate to \`/workflows\`, enter an entity name + version, click Load, confirm the workflow names render. **(Reviewer to verify.)**

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Capture the PR URL.

- [ ] **Step 3: Verify PR opened cleanly**

```bash
gh pr view --json number,url,baseRefName,headRefName,state
```

Confirm: `baseRefName` is `feature/cyoda-go-support`, `headRefName` is `feature/cyoda-go-support-workflow-gateway`, `state` is `OPEN`.

---

## Done

When this PR merges into `feature/cyoda-go-support`, sub-branch 2 is complete. Sub-branch 3 (real cloud Workflows page with model picker, table, row actions, URL state) gets its own plan when ready.
