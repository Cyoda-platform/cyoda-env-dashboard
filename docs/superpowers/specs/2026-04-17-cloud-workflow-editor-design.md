# Cloud Workflow Editor — design spec (sub-branch 4 of feature/cyoda-go-support)

> **Parent design:** `docs/superpowers/specs/2026-04-16-cyoda-go-support-design.md` §6.4. This spec is a focused expansion of that section.
>
> **Branch:** `feature/cyoda-go-support-cloud-workflow-editor`, off `feature/cyoda-go-support`.

## 1. Summary

Replace `WorkflowEditorCloudPlaceholder` with a real single-page editor for cloud workflow documents. The editor loads a `WorkflowDoc` via `CloudWorkflowGateway.loadWorkflow` (or a scaffold for `/new`), presents a tree-based navigation on the left and a context-specific form on the right, validates the doc client-side, and saves through `gateway.saveWorkflow(modelRef, doc, 'MERGE')`.

This sub-branch ships the **form editor** with a polymorphic `QueryConditionEditor` covering `simple`, `group`, and `function` condition types. The read-only graph view, `array`/`lifecycle` condition types, and undo/redo are explicitly deferred to follow-up sub-branches.

## 2. Scope

### In scope

- `WorkflowEditorCloud` page (replaces `WorkflowEditorCloudPlaceholder`).
- Page-scoped Zustand store with Immer middleware and selector-based subscriptions, designed to handle workflows with hundreds of states and many more transitions.
- Hand-rolled `validateWorkflowDoc(doc): {path, message}[]` covering required-field rules and cross-references (`initialState` ∈ `states`, `transition.next` ∈ `states`).
- AntD `<Tree virtual>` for left-panel navigation, with red-dot suffixes on nodes whose path appears in the validator output.
- Right-panel forms: `WorkflowPropsForm`, `StateForm`, `TransitionForm`, `ProcessorRow` (accordion).
- `QueryConditionEditor` component supporting `simple`, `group`, `function` condition types only.
- Dirty tracking via React Router v6 `useBlocker` (in-app navigation) plus `beforeunload` listener (tab close), with AntD `Modal.confirm` for in-app confirmation and the native browser dialog for tab close.
- Save flow: validate → focus first error in tree on failure → `gateway.saveWorkflow` on success → re-fetch and reset pristine state.
- Scaffold doc for `/new`: `{ version: '1.0', name: '', initialState: 'draft', states: { draft: {} }, active: true }`.
- Unit tests (Vitest): store reducers, `validateWorkflowDoc`, each form component in isolation, and a page-level integration test against a mocked gateway.
- Playwright E2E specs (this is the editor's slice of spec §8.2):
  - Create new workflow → fill required fields → add transition → save → verify in workflows list.
  - Load existing workflow → edit transition → save → reload → verify persisted.
  - Add an externalized processor to a transition → save.
  - Add a `group` query condition with two `simple` children to a transition criterion → save → reload → verify structure.
  - Trigger validation failure (clear `initialState`) → assert error banner + tree-node red badge on the right path.
  - In-app navigation dirty guard: edit → click sidebar nav → confirm dialog → cancel keeps you on page; confirm leaves.

### Out of scope (deferred to follow-up sub-branches)

- Read-only graph view (the existing `graphicalStatemachineStore` was designed around the legacy data shape — a `WorkflowDoc → graph` adapter is its own design problem, parked).
- `array` and `lifecycle` query condition types (these are search-side concepts in `openapi-common.yml`; transition criteria realistically use `simple`/`group`/`function`).
- Undo/redo (the store shape leaves room for `zundo` middleware later without changing the form components' contracts).
- Drag-to-reorder in the tree.
- Tab-close dirty guard test in Playwright (`beforeunload` is not assertable through Playwright's Page API; manual verification only).
- Docker harness for cyoda-go in `playwright.config.ts` (separate infrastructure concern; the E2E specs assume the user runs cyoda locally and provides `BASE_URL` + `TEST_ENV_USER` + `TEST_ENV_SECRET`).

## 3. Architecture

### 3.1 File layout

```
packages/statemachine-react/src/pages/cloud-workflow-editor/
  WorkflowEditorCloud.tsx                 # page shell, layout, save bar
  workflowEditorStore.ts                  # Zustand + Immer + selector helpers
  validateWorkflowDoc.ts                  # pure function returning {path, message}[]
  useDirtyGuard.ts                        # wraps useBlocker + beforeunload
  WorkflowTree.tsx                        # left panel — antd <Tree virtual>
  NodeRouter.tsx                          # picks the form for the current selection
  nodes/
    WorkflowPropsForm.tsx                 # name, desc, version, initialState, active, top-level criterion
    StateForm.tsx                         # state-level summary (transitions list)
    TransitionForm.tsx                    # name, next, manual, disabled + processors accordion + criterion editor
    ProcessorRow.tsx                      # accordion row: externalized OR scheduled
  index.ts                                # barrel — re-exports WorkflowEditorCloud

packages/statemachine-react/src/components/cloud-workflows/
  QueryConditionEditor.tsx                # polymorphic editor — simple/group/function only
  QueryConditionEditor.test.tsx
```

The `pages/cloud-workflow-editor/` directory is a sibling to other pages — chosen because the editor is many small files and a flat `pages/` would obscure the cohesion. `QueryConditionEditor` lives under `components/cloud-workflows/` because it's potentially reusable from other cloud pages (e.g. workflow-level `criterion`).

Per CLAUDE-MD-style guidance, each file has one clear responsibility and is small enough to hold in context at once.

### 3.2 Store shape

```ts
// workflowEditorStore.ts
interface WorkflowEditorState {
  pristine: WorkflowDoc | null;          // last saved (or initial loaded) version
  current: WorkflowDoc | null;           // edited copy
  selectedPath: string;                  // e.g. "/", "/states/draft", "/states/draft/transitions/0"
  expandedPaths: Set<string>;            // tree expansion, persisted per-page-session
  errors: ValidationIssue[];             // populated on Save attempt (and when current changes after a failed Save)

  hydrate(initial: WorkflowDoc): void;
  setSelected(path: string): void;
  toggleExpand(path: string): void;

  // Targeted updates (Immer underneath). Each mutation only touches the relevant slice.
  updateWorkflowProps(patch: Partial<Pick<WorkflowDoc, 'name' | 'desc' | 'version' | 'initialState' | 'active' | 'criterion'>>): void;
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
  acceptCurrentAsPristine(): void;       // called after successful save
}
```

**Selector pattern:** components subscribe via `useWorkflowEditorStore(selector, shallow)`. Each form component reads only the slice it edits. This is the mechanism that keeps the editor performant at hundreds of states.

```ts
// Example — only re-renders when this transition changes
const transition = useWorkflowEditorStore(
  (s) => s.current?.states[stateName]?.transitions?.[index],
  shallow,
);
```

**Dirty check** is a single shallow comparison: `isDirty = pristine !== null && current !== pristine` (Immer preserves reference equality for unchanged subtrees, so this works at the slice level too if needed for granular dirty markers).

### 3.3 Tree model

The tree mirrors the doc:

```
[/] Workflow                              ← WorkflowPropsForm
  [/states/draft] draft                   ← StateForm
    [/states/draft/transitions/0] toReview  ← TransitionForm
      [/states/draft/transitions/0/criterion]      (rendered inline, not a separate node)
      [/states/draft/transitions/0/processors/0] sendEmail  ← inline accordion row, not a tree node
```

Decision: criteria and processors are **inline sub-forms inside the TransitionForm**, not separate tree nodes. The spec §6.4 mandates this: "every inline sub-form is rendered inside a collapsible accordion." Putting them in the tree would duplicate UX with the accordion. Tree nodes are: workflow root, each state, each transition.

**Path scheme:** `/`, `/states/<name>`, `/states/<name>/transitions/<index>`. Used as React keys, AntD Tree node keys, the `selectedPath` selector key, and the path field in `ValidationIssue`.

**Expansion default:** workflow root expanded; first state expanded; everything else collapsed. Per-page-session memory in the store (no localStorage).

### 3.4 Validation

```ts
// validateWorkflowDoc.ts
export interface ValidationIssue {
  path: string;            // e.g. "/states/draft/transitions/0/next"
  message: string;
}
export function validateWorkflowDoc(doc: WorkflowDoc): ValidationIssue[];
```

**Rules** (table-driven; one test case per rule):

1. `version` non-empty string.
2. `name` non-empty string.
3. `initialState` non-empty string.
4. `states` non-empty object.
5. `initialState` references an existing state.
6. Each state name is non-empty.
7. For each transition:
   - `name` non-empty.
   - `next` non-empty.
   - `next` references an existing state.
   - `manual` is a boolean (TS guarantees it but a missing field would deserialize as `undefined`).
8. Transition names within a state are unique.
9. Processor `name` non-empty.
10. Processor `executionMode` valid enum value (if present).
11. Scheduled processor `config.delayMs > 0` and `config.transition` references a valid transition name from any state.

Cross-cutting rules (e.g. "every state is reachable from `initialState`") are explicitly **not** enforced — the cloud backend doesn't enforce them either, and a workflow author may legitimately keep an "orphan" state during incremental editing.

### 3.5 Forms

Every form receives no props beyond what's needed for store paths (e.g. `stateName`, `transitionIndex`). Forms read their slice via store selectors and write through the store actions. This keeps prop chains short and re-renders narrow.

- **WorkflowPropsForm** — fields for `name`, `desc`, `version`, `initialState` (Select populated from `Object.keys(states)`), `active` (Switch), `criterion` (`QueryConditionEditor`, optional, with an "Add criterion" affordance to materialize it).
- **StateForm** — read-only summary of the state (`name`, transition count) plus a "+ Add transition" button. The cloud `StateDefinition` schema has no fields beyond `transitions`, so there's nothing else to edit at the state level. Renaming a state happens via an inline edit affordance on the state's tree node.
- **TransitionForm** — fields for `name`, `next` (Select), `manual` (Switch), `disabled` (Switch); below those, a "Processors" accordion (collapsible AntD `Collapse` with default-open on the first item only) and a `QueryConditionEditor` for the optional `criterion`. "Add processor" opens a small dialog asking type (externalized | scheduled), then appends.
- **ProcessorRow** — collapsible row inside the accordion. Externalized-processor fields: `name`, `executionMode`, plus `config` sub-object (`attachEntity`, `calculationNodesTags`, `responseTimeoutMs`, `retryPolicy`, `context`, `asyncResult`, `crossoverToAsyncMs`). Scheduled-processor fields: `name`, `executionMode`, plus `config` (`delayMs`, `timeoutMs`, `transition`).

### 3.6 QueryConditionEditor

```ts
interface QueryConditionEditorProps {
  value: QueryCondition | undefined;
  onChange: (next: QueryCondition | undefined) => void;
}
```

**Three node types** rendered recursively:

- **simple** (`SimpleCondition`): `jsonPath`, `operation` (Select from `OperatorType` enum in `openapi-common.yml`), `value` (string input — JSON-aware coercion is out of scope).
- **group** (`GroupCondition`): `operator` (Select: AND | OR | NOT), nested `conditions[]` rendered as collapsible rows; "+ Add condition" picks type.
- **function** (`FunctionCondition`): `function.name`, optional nested `function.config` (`ExternalizedFunctionConfig` fields), optional nested `function.criterion` (recursive `QueryConditionEditor`).

**Empty state:** shows a "No criterion — Add" button that materializes `{ type: 'simple', jsonPath: '', operation: 'EQUALS', value: '' }`. The "Remove criterion" button calls `onChange(undefined)`.

**Recursion safety:** maximum nesting depth is bounded by the doc itself; no artificial limit. The recursive component subscribes only to its own `value`, so deep trees don't broadcast re-renders to the whole editor.

### 3.7 Dirty guard

```ts
// useDirtyGuard.ts
export function useDirtyGuard(isDirty: boolean): void;
```

**In-app navigation:** wraps `useBlocker(isDirty)`. When blocker fires, opens an AntD `Modal.confirm({ title: 'Discard unsaved changes?', okText: 'Discard', cancelText: 'Stay' })`. On Discard, calls `blocker.proceed()`. On Stay, calls `blocker.reset()`.

**Tab close / refresh:** `useEffect` registers `window.addEventListener('beforeunload', handler)` while `isDirty`. Handler calls `e.preventDefault()` and sets `e.returnValue = ''` per the standard contract. The browser shows its native dialog (text is browser-controlled and can't be customized).

### 3.8 Save flow

```
Click Save
  → setErrors(validateWorkflowDoc(current))
  → if errors.length > 0:
      → setSelected(errors[0].path) — focuses the tree
      → expand all ancestor paths of errors[0].path
      → message.error('Validation failed — see highlighted fields')
      → return
  → setSaving(true)
  → try gateway.saveWorkflow(modelRef, current, 'MERGE')
      on success:
        → re-fetch via queryClient.invalidateQueries
        → store.acceptCurrentAsPristine()
        → message.success('Workflow saved')
      on MustHaveActiveWorkflowError (current.active === false attempted):
        → message.error('Cannot deactivate the only active workflow')
      on other error:
        → message.error(err.message)
  → finally setSaving(false)
```

The Save button lives in a sticky footer. Disabled while `!isDirty`, shows a loading spinner during the in-flight save.

### 3.9 Routing & data fetch

The placeholder routes already exist in `apps/saas-app/src/routes/index.tsx`:

```
/workflow/:entityName/:modelVersion/new
/workflow/:entityName/:modelVersion/:workflowName
```

Sub-branch 4 swaps `WorkflowEditorCloudPlaceholder` for `WorkflowEditorCloud` and updates the lazy-import in the routes file accordingly. `WorkflowEditorCloudPlaceholder` is then deleted.

`WorkflowEditorCloud`:

1. Reads `useParams<{entityName, modelVersion, workflowName?}>()`.
2. Computes `modelRef = { entityName, modelVersion: Number(modelVersion) }`.
3. If `workflowName` is set: `useQuery({ queryKey: [...statemachineKeys.cloudWorkflow(modelRef, workflowName)], queryFn: () => gateway.loadWorkflow(modelRef, workflowName) })`.
4. If `workflowName` is undefined: hydrate the store with the scaffold doc (no fetch).
5. On `useQuery` success: `store.hydrate(data)` once.
6. Renders the layout once `pristine !== null`.

`statemachineKeys.cloudWorkflow(modelRef, name)` is a new key factory entry alongside the existing `cloudWorkflows(modelRef)` key.

## 4. Testing strategy

### 4.1 Unit (Vitest)

- `workflowEditorStore.test.ts` — every action: hydrate, rename state (cascades references in `initialState` and `transition.next`? **No** — rename is local; the validator surfaces dangling refs), add/delete state, add/delete transition, update transition, add/update/delete processor, set criterion, resetToPristine, acceptCurrentAsPristine.
- `validateWorkflowDoc.test.ts` — table-driven: one test per rule from §3.4; both passing and failing cases per rule.
- `WorkflowTree.test.tsx` — renders the right node hierarchy from a fixture doc; clicking a node calls `setSelected`; red-dot suffix appears for paths in `errors`.
- `WorkflowPropsForm.test.tsx`, `StateForm.test.tsx`, `TransitionForm.test.tsx`, `ProcessorRow.test.tsx` — render with a fixture, edit one field, assert the store action was called with the right path.
- `QueryConditionEditor.test.tsx` — renders empty / simple / group / function; switching type clears node-specific fields; nested group with two simples round-trips through `value`/`onChange`.
- `WorkflowEditorCloud.test.tsx` (integration) — mocked gateway: load → edit → save calls `gateway.saveWorkflow` with the right doc; validation failure surfaces in the tree; dirty guard fires `Modal.confirm` on attempted nav.

### 4.2 E2E (Playwright)

**New files**:

```
playwright.config.ts                      # repo root
e2e/
  fixtures/
    auth.ts                               # login once per worker, reuse storageState
    testModel.ts                          # POST /model/import on setup, DELETE on teardown
  cloud-workflow-editor/
    create.spec.ts
    edit-and-save.spec.ts
    add-processor.spec.ts
    query-condition.spec.ts
    validation.spec.ts
    dirty-guard.spec.ts
```

**Run requirements** — the env vars the user sets before running `pnpm e2e`:

- `BASE_URL` — e.g. `http://localhost:5173` (the saas-app dev server)
- `TEST_ENV_USER`, `TEST_ENV_SECRET` — login creds (re-use the existing values from `apps/saas-app/.env`)
- `CYODA_API_BASE_URL` — for the `request` fixture's direct API calls when setting up models (e.g. `http://localhost:5173/api` if going through the dev proxy, or the cyoda env URL directly)

**Fixture sketch** (`testModel.ts`):

```ts
export const test = base.extend<{ model: ModelRef }>({
  model: async ({ request }, use, testInfo) => {
    const entityName = `E2E_${testInfo.testId.replace(/[^A-Za-z0-9]/g, '_')}_${Date.now()}`;
    const modelVersion = 1;
    // No PUT /lock — locking enables data ingestion, which is for Instances.
    // Workflow authoring works against an unlocked model.
    await request.post(
      `${process.env.CYODA_API_BASE_URL}/model/import/JSON/SAMPLE_DATA/${entityName}/${modelVersion}`,
      { data: { id: 1, name: 'sample' } }
    );
    await use({ entityName, modelVersion });
    await request.delete(`${process.env.CYODA_API_BASE_URL}/model/${entityName}/${modelVersion}`);
  },
});
```

**Note for sub-branch 5 (Instances):** Instances tests will additionally `PUT /model/{entityName}/{modelVersion}/lock` after creating the model and before ingesting data. The `testModel` fixture will grow a `withLock` option then.

**Tagging:** every editor spec uses `test.describe.configure({ mode: 'parallel' })` and tags via `@cloud-workflow-editor` so the suite can be filtered with `pnpm e2e --grep @cloud-workflow-editor`.

**Auth fixture:** logs in once via username/password form on the first test of each worker, saves storage state to a temp file, all subsequent tests in the worker reuse it via `storageState`. No retry logic — login failure means the env is broken and the run should die fast.

**Cleanup safety:** `afterEach` always runs the `model.dispose` step even on test failure; if the test crashes mid-flight, the model is still deleted. Workflows are deleted transitively when the model is deleted (verified during plan execution; if false, fixture grows an explicit workflow-cleanup step).

### 4.3 What's deliberately NOT covered

- Tab-close `beforeunload` (Playwright can't cleanly assert browser-native dialog).
- Multi-tab editing race (out of scope — last-write-wins is acceptable).
- Backend rejection of an otherwise-valid doc (validator-on-the-server is its own surface; surfaced to the user as the gateway error message).

## 5. Risks & open questions

- **`useBlocker` stability:** stable in `react-router-dom@6.7+`. The repo currently runs `^6` — confirmed during plan execution; if pinned below 6.7, the plan adds a controlled bump.
- **Immer + Zustand bundle cost:** ~14kb gzipped combined. Acceptable given the perf justification (selectors prevent re-render fan-out at scale).
- **Tree expansion at scale:** AntD's `<Tree virtual>` virtualizes rendered rows; expansion of all states still creates many DOM nodes if the user clicks "expand all". We do **not** ship an "expand all" affordance; users navigate top-down. Performance is acceptable up to ~1000 visible nodes per AntD's published benchmarks.
- **Renaming a state with inbound `next` refs:** the spec §3.4 validator surfaces dangling refs after a rename. We deliberately do **not** auto-rewrite `next` references on rename — automatic refactors hide intent and are easy to get wrong. The user fixes the dangling refs explicitly. (If this proves clumsy in practice, a follow-up sub-branch can add an opt-in "Rewrite references" affordance.)
- **`E2E_*` model name pollution:** if the cleanup step crashes hard (e.g. node process killed), models named `E2E_*` accumulate on the dev cyoda env. Tolerable — they're trivially identifiable and deletable manually; a periodic cleanup script is out of scope.

## 6. Branching and delivery

- **Branch:** `feature/cyoda-go-support-cloud-workflow-editor`, off `feature/cyoda-go-support`.
- **PR target:** `feature/cyoda-go-support` (squash-merged, matching sub-branches 1–3).
- **Plan:** `docs/superpowers/plans/2026-04-17-cloud-workflow-editor.md` (written next, by the writing-plans skill).
- **Execution:** subagent-driven-development, same process as sub-branch 3.
