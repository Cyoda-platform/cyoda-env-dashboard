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
- AntD `<Tree virtual>` for left-panel navigation, with red-dot suffixes on nodes whose path is a prefix of any validator-error path.
- Right-panel forms: `WorkflowPropsForm`, `StateForm`, `TransitionForm`, `ProcessorRow` (accordion).
- `QueryConditionEditor` component supporting `simple`, `group`, `function` condition types only.
- Dirty tracking via React Router v6 `useBlocker` (in-app navigation, including the browser back button) plus `beforeunload` listener (tab close), with AntD `Modal.confirm` for in-app confirmation and the native browser dialog for tab close.
- Save flow: validate → focus first error in tree on failure → `gateway.saveWorkflow` on success → fetch the server's truth and re-hydrate the store. For `/new`, the URL is replaced with the canonical `/workflow/:entity/:version/:savedName` after save.
- Small gateway scope-creep: promote `CloudWorkflowGateway.loadWorkflow`'s "Workflow not found" string error to a typed `WorkflowNotFoundError` class (exported from `gateways/errors.ts`). The editor needs to distinguish it from generic save failures to surface a more accurate post-save warning (see §3.8). **Blast-radius audit:** sub-branch 3 callers of `loadWorkflow` either don't catch (let the error bubble) or use `err instanceof Error` / `err.message` checks — both keep working because `WorkflowNotFoundError extends Error` and the message string stays identical. No callsite uses `err.constructor === Error` or similar exact-class checks (verified during plan execution by grepping `gateways/`, `pages/`, `hooks/`).
- Scaffold doc for `/new` (defined in §3.9).
- Unit tests (Vitest): store reducers (including path-rewrite invariants), `validateWorkflowDoc`, each form component in isolation, and a page-level integration test against a mocked gateway.
- Playwright E2E specs (this is the editor's slice of spec §8.2):
  - Create new workflow → fill required fields → add transition → save → verify in workflows list.
  - Load existing workflow → edit transition → save → reload → verify persisted.
  - Add an externalized processor to a transition → save.
  - Add a `group` query condition with two `simple` children to a transition criterion → save → reload → verify structure.
  - Trigger validation failure (clear `initialState`) → assert error banner + tree-node red badge on the right path.
  - In-app navigation dirty guard: edit → click sidebar nav → confirm dialog → cancel keeps you on page; confirm leaves. Same spec also covers the **browser back button** path (RR `useBlocker` handles `popstate`; asserting both paths is one extra step in the same test file).
  - `/new` post-save redirect: create a workflow → save → assert URL is now `/workflow/<entity>/<version>/<savedName>` (not `/new`) and a browser refresh re-loads the saved workflow rather than re-scaffolding.

### Out of scope (deferred to follow-up sub-branches)

- Read-only graph view (the existing `graphicalStatemachineStore` was designed around the legacy data shape — a `WorkflowDoc → graph` adapter is its own design problem, parked).
- `array` and `lifecycle` query condition types (these are search-side concepts in `openapi-common.yml`; transition criteria realistically use `simple`/`group`/`function`).
- Undo/redo (the store shape leaves room for `zundo` middleware later without changing the form components' contracts).
- Drag-to-reorder in the tree.
- Tab-close dirty guard test in Playwright (`beforeunload` is not assertable through Playwright's Page API; manual verification only).
- Docker harness for cyoda-go in `playwright.config.ts` (separate infrastructure concern; the E2E specs assume the user runs cyoda locally and provides `BASE_URL` + `TEST_ENV_USER` + `TEST_ENV_SECRET`).
- Fixing the existing `playwright.config.ts` defaults (baseURL `http://localhost:3000` and `npm run dev` webServer command — both wrong for the current pnpm + Vite-default-5173 setup). This sub-branch adds a new project entry for the editor specs without touching the legacy defaults; a separate sweep can fix them.
- Type-coercion of `value` in `simple` query conditions (sent as plain string; see §3.6 helper text and §5 risks).

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

Each file has one clear responsibility and stays small (≤ ~200 lines) — easier to review, test, and reason about than a single 1000-line page component.

### 3.2 Store shape

```ts
// workflowEditorStore.ts
interface WorkflowEditorState {
  pristine: WorkflowDoc | null;          // last saved (or initial loaded) version
  current: WorkflowDoc | null;           // edited copy
  selectedPath: string;                  // e.g. "/", "/states/draft", "/states/draft/transitions/0"
  expandedPaths: Set<string>;            // tree expansion, persisted per-page-session
  errors: ValidationIssue[];             // populated on Save attempt; cleared on any structural mutation (see "Errors lifecycle")

  hydrate(initial: WorkflowDoc, opts?: { preserveView?: boolean }): void;
  // initial load: resets pristine, current, errors AND selection (defaults to '/'),
  //               and expansion (defaults to '/' + the first state if any).
  // preserveView=true (used by the save flow): always resets pristine, current, and errors
  //               from the new doc. For selection: keep selectedPath if it still resolves
  //               in the new doc; otherwise fall back to '/'. For expansion: keep every
  //               entry of expandedPaths that still resolves; do NOT add the initial-load
  //               defaults on top — defaults apply only when the entire selection or
  //               expansion set was unresolvable. This prevents the irritating
  //               post-save "and now the first state is suddenly expanded again."
  setSelected(path: string): void;
  toggleExpand(path: string): void;

  // Targeted updates (Immer underneath). Each mutation only touches the relevant slice.
  // Mutations that change structure (rename/add/delete) MUST also rewrite selectedPath
  // and expandedPaths — see "Path-aware mutations" below.
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

**Dirty check** is a single shallow comparison: `isDirty = pristine !== null && current !== pristine` (Immer preserves reference equality for unchanged subtrees, so this works at the slice level too if needed for granular dirty markers). Caveat: typing a character then deleting it leaves `isDirty = true` even though the doc is structurally identical. This is acceptable; a structural deep-equal would be more confusing than helpful (it would silently swallow "I tried that, undid it, will try something else" intent).

**Errors lifecycle:** errors are populated only by the Save flow (see §3.8). Any structural mutation (`rename*`, `add*`, `delete*`, `update*`, `setTransitionCriterion`, `updateWorkflowProps`) clears `errors` to `[]`. This gives "fix and try again" UX without stale red badges and resolves the apparent contradiction between displaying validation errors and allowing further edits. The trade-off: a user who edits one field then immediately scrolls to look at another error elsewhere will have lost the badge. Acceptable: clicking Save again is one click and re-derives the full error set.

**Path-aware mutations.** Every action that changes the structure of the doc rewrites `selectedPath` and `expandedPaths` atomically inside the same `set` call. Without this, selection silently points at a stale subtree and the right-hand panel renders garbage. Concrete rules:

| Action | Path rewrite |
| --- | --- |
| `renameState(old, new)` | Replace prefix `/states/<old>` with `/states/<new>` in `selectedPath` and every entry of `expandedPaths`. Also: if `current.initialState === old`, set it to `new` (see §3.5 — this is the one cascade we do; `transition.next` references are NOT cascaded, by design). |
| `deleteState(name)` | Drop every path that starts with `/states/<name>` from `expandedPaths`. If `selectedPath` was such a path, set `selectedPath = '/'`. |
| `addState(name)` | Set `selectedPath = '/states/<name>'` and add it to `expandedPaths`. The user just clicked "Add state" — they want to edit the new one. |
| `deleteTransition(stateName, index)` | For every path matching `/states/<stateName>/transitions/<j>` with `j > index`, decrement `j`. Drop the path matching `j === index` and any descendants from `expandedPaths`. If `selectedPath` matched the deleted transition (or was a descendant), set `selectedPath = '/states/<stateName>'`. |
| `addTransition(stateName)` | Set `selectedPath = '/states/<stateName>/transitions/<lastIndex>'` (the just-added one) and add the parent state and the new transition to `expandedPaths`. |
| `updateTransition` | No-op for paths. |
| `add/update/deleteProcessor` | No-op for tree paths (processors aren't tree nodes). The accordion's per-transition expansion-key set lives in component-local state, not in `expandedPaths`. |
| `setTransitionCriterion` | No-op for paths. |

A small pure helper (or set of per-action helpers — implementation choice) computes the path deltas for each mutation; the unit tests in §4.1 cover each rule.

**Trade-off acknowledged: accordion expansion in TransitionForm is component-local state, not store-tracked.** That means navigating away from a transition and back to it collapses all processor accordion rows. We accept this to keep `expandedPaths` focused on tree-node expansion only — pulling per-transition accordion state into the global store would force every TransitionForm mount/unmount to round-trip through the store, complicating selectors for marginal UX gain. If users complain, the fix is small: add `accordionExpansionByPath: Map<string, Set<number>>` to the store and wire `<Collapse activeKey>` to it.

**Tree-node error bubbling.** A tree node's path is a prefix of any descendant's path (e.g. `/states/draft` is a prefix of `/states/draft/transitions/0/next`). A node renders the red dot iff some `error.path` equals the node's path or starts with `<nodePath>/`. The helper:

```ts
export function nodeHasError(nodePath: string, errors: ValidationIssue[]): boolean {
  return errors.some((e) => e.path === nodePath || e.path.startsWith(nodePath + '/'));
}
```

Tested explicitly in `WorkflowTree.test.tsx`.

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

**Path scheme:** `/`, `/states/<name>`, `/states/<name>/transitions/<index>`. Used as React keys, AntD Tree node keys, the `selectedPath` selector key, and the path field in `ValidationIssue`. Path mutations on rename/delete are spelled out in §3.2 "Path-aware mutations".

**Expansion default:** workflow root expanded; first state expanded; everything else collapsed. Per-page-session memory in the store (no localStorage).

**Layout / vertical sizing:** AntD `<Tree virtual>` requires a numeric `height` prop. The page shell is a flex column: header (~64px from `AppLayout`), then a flex-1 row split into a fixed-width left panel (`flex: 0 0 320px`) and the right form panel, then a sticky save bar (~56px) at the bottom. Inside the left panel, the Tree fills the available vertical space — measured by `useResizeObserver` on the panel element and passed to `<Tree height={containerHeight - 8}>`. Initial render uses a sensible default (e.g. `400`); the observer corrects on first measurement.

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
12. Processor names within a single transition are unique. (Per-workflow uniqueness is not asserted — the backend's contract here is unclear and any backend-side rejection is surfaced verbatim by §3.8's catch-all error path.)

Cross-cutting rules (e.g. "every state is reachable from `initialState`") are explicitly **not** enforced — the cloud backend doesn't enforce them either, and a workflow author may legitimately keep an "orphan" state during incremental editing.

### 3.5 Forms

Every form receives no props beyond what's needed for store paths (e.g. `stateName`, `transitionIndex`). Forms read their slice via store selectors and write through the store actions. This keeps prop chains short and re-renders narrow.

- **WorkflowPropsForm** — fields for `name`, `desc`, `version`, `initialState` (Select populated from `Object.keys(states)`), `active` (Switch), `criterion` (`QueryConditionEditor`, optional, with an "Add criterion" affordance to materialize it).
- **StateForm** — read-only summary of the state (`name`, transition count) plus a "+ Add transition" button. The cloud `StateDefinition` schema has no fields beyond `transitions`, so there's nothing else to edit at the state level. Renaming a state happens via an inline edit affordance on the state's tree node (a small pencil icon in the custom title renderer that swaps the label for an input on click). On rename: `initialState` is rewritten if it pointed at the old name; `transition.next` references are NOT rewritten (the validator surfaces dangling refs after, and the user fixes them by hand — automatic refactors of cross-state references hide intent).
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

- **simple** (`SimpleCondition`): `jsonPath`, `operation` (Select from `OperatorType` enum in `openapi-common.yml`, grouped by family — string ops / numeric ops / collection ops — using AntD `Select` `optGroups` so the menu doesn't read as a flat 20-item dump), `value` (string input). Helper text under the input: "Compared as a string. For typed comparisons (numeric, boolean), use a function condition." This is also captured in §5 risks.
- **group** (`GroupCondition`): `operator` (Select: AND | OR | NOT), nested `conditions[]` rendered as collapsible rows; "+ Add condition" picks type.
- **function** (`FunctionCondition`): `function.name`, optional nested `function.config` (`ExternalizedFunctionConfig` fields), optional nested `function.criterion` (recursive `QueryConditionEditor`).

**Empty state:** shows a "No criterion — Add" button that materializes `{ type: 'simple', jsonPath: '', operation: 'EQUALS', value: '' }`. The "Remove criterion" button calls `onChange(undefined)`.

**Type switching is destructive — guarded by confirm.** Switching a condition's `type` discards fields specific to the old type (`group` → `simple` throws away nested `conditions`; `function` → `simple` throws away `function.config` and `function.criterion`). When the old subtree is non-trivial (group with ≥1 nested condition, OR function with `config` or `criterion` set), the editor opens an AntD `Modal.confirm` ("Switching the condition type will discard the nested children. Continue?"). Switches that destroy nothing (e.g. simple → group with empty conditions, OR a fresh group with no conditions to function) proceed without confirmation. Tested explicitly in `QueryConditionEditor.test.tsx`.

**Recursion safety:** maximum nesting depth is bounded by the doc itself; no artificial limit. The recursive component subscribes only to its own `value`, so deep trees don't broadcast re-renders to the whole editor.

### 3.7 Dirty guard

```ts
// useDirtyGuard.ts
export function useDirtyGuard(isDirty: boolean): void;
```

**Browser back/forward AND tab close:** `useDirtyGuard` guards `popstate` via a sentinel pushState (the standard pattern) and `beforeunload` via the W3C contract. Both open an AntD `Modal.confirm` (back button) or the browser's native dialog (tab close).

**Limitation — sidebar/menu click:** the app uses `BrowserRouter` rather than a data router, so RR v6's `useBlocker` — which would catch internal `navigate()` calls from sidebar `<Link>`s — is unavailable. A user clicking a sidebar menu item from a dirty editor will navigate away without prompting. This is a known regression vs. the originally-specified behavior; closing it requires migrating `apps/saas-app/src/App.tsx` from `BrowserRouter` to `createBrowserRouter`, which is a cross-cutting refactor outside this sub-branch. Tracked for a follow-up.

### 3.8 Save flow

The page reads `message` from `App.useApp()` rather than calling the static `message.error`/`message.success` API — AntD v5 deprecated the static API because it bypasses `ConfigProvider` and triggers a console warning.

```
Click Save                                           (button is disabled while !isDirty or saving)
  → setSaving(true)
  → setErrors(validateWorkflowDoc(current))
  → if errors.length > 0:
      → setSelected(errors[0].path) — focuses the tree
      → expand all ancestor paths of errors[0].path
      → message.error('Validation failed — see highlighted fields')
      → setSaving(false)
      → return
  → try:
      → await gateway.saveWorkflow(modelRef, current, 'MERGE')
      → const fresh = await queryClient.fetchQuery({...cloudWorkflow(modelRef, current.name)})
      → store.hydrate(fresh, { preserveView: true })   (resets pristine = current = fresh, clears errors,
                                                       keeps selectedPath/expandedPaths where they still resolve)
      → if route is /new:
          → navigate(`/workflow/${entityName}/${modelVersion}/${current.name}`, { replace: true })
      → message.success('Workflow saved')
  → catch MustHaveActiveWorkflowError:
      → message.error('Cannot deactivate the only active workflow')
  → catch WorkflowNotFoundError (typed; promoted from CloudWorkflowGateway.loadWorkflow's existing "Workflow X not found" — see "Post-save navigation" below):
      → message.warning('Save succeeded but the saved workflow could not be re-loaded by name. Refresh the workflows list.')
      → (this is the surfacing point for backend name-rewrite; see §5 risks)
  → catch err:
      → message.error(err.message)
  → finally setSaving(false)
```

**Why `fetchQuery` and not `invalidateQueries`?** `invalidateQueries` schedules a refetch but the success-handler order is non-deterministic relative to subsequent edits — if the user types into a field after Save fires the mutation but before the refetch lands, the refetch's `hydrate(serverDoc)` clobbers their typing. The Save button being disabled during `saving` (already specified) closes that window, but only `await fetchQuery` makes the contract explicit: "Save means: send to server, then take the server's truth." `hydrate` with `preserveView: true` keeps the user where they were in the tree — `hydrate` without that flag would teleport them back to `/`, which is correct semantics for initial load but wrong for "I just saved my edits to /states/review/transitions/3".

**Post-save navigation for `/new`.** Before the save, the route is `/workflow/<entity>/<version>/new` and `current.name` is whatever the user typed. After successful save, the workflow has a canonical identity at `/workflow/<entity>/<version>/<name>`. The page calls `navigate(...{ replace: true })` so a browser refresh on that URL re-loads the saved workflow rather than re-scaffolding an empty doc. **Caveat:** this assumes the backend preserves the workflow name verbatim. The cloud `POST .../workflow/import` returns no body (the OpenAPI documents only `200 — Workflows imported successfully`), so the gateway can't observe a server-side rewrite directly. The fall-back path is the post-save fetch failing — we detect it by matching the `loadWorkflow` error message (which is the existing `Workflow "<name>" not found in model ...` from `CloudWorkflowGateway.loadWorkflow`, sub-branch 3) and surface the warning toast. To avoid relying on string-matching, this sub-branch promotes that error to a typed class `WorkflowNotFoundError` exported from `gateways/errors.ts` (a small scope-creep on the gateway, justified because the editor needs to distinguish it from generic save failures). See §5 for the risk note.

**Recommended user exit when `WorkflowNotFoundError` fires after save.** The save itself succeeded (the gateway returned, the server has the workflow under whatever canonical name it chose); only the post-save fetch failed. The page deliberately does NOT navigate and does NOT mutate the store — pristine remains the scaffold (or the pre-save loaded doc), `current` is unchanged, the user's edits are still visible. The toast directs them to refresh the workflows list and open their workflow from there ("Save succeeded but the saved workflow could not be re-loaded by name. Refresh the workflows list."). The local state on /new is therefore stale-but-harmless: `isDirty` is still true, but clicking Save again re-issues the same MERGE request, which is idempotent at the server (same name → same workflow → upsert is a no-op apart from any edits since). The risk of "Save again creates a second copy if the server rewrites the name a second time differently" is real but vanishingly small — backend rewrite would have to be non-deterministic, which would be an outright backend bug. We accept that scenario as out of scope.

**MERGE handles both create and update.** The cloud `WorkflowImportMode.MERGE` is documented as "incremental update of the specified workflows. Any unspecified configurations remain unchanged." Empirically (sub-branch 3's `copyWorkflow` uses MERGE to materialize a renamed copy of an existing workflow, observed working in the live env), MERGE upserts: if the workflow name doesn't exist on the model, it's added; if it does, it's overwritten. So `/new` saving with MERGE is correct — no need to branch the save call by route.

**`MustHaveActiveWorkflowError` reachability.** This error fires only when an existing workflow is being saved with `active: false` and would leave the model with no active workflows. It is **not** reachable from `/new` (the scaffold sets `active: true`). Spec §4.2 includes a test on the edit path; the `/new` create test does not.

**Save bar layout.** Sticky footer, two buttons:

- **Save** — primary, disabled while `!isDirty || saving`, shows a loading spinner during the in-flight save.
- **Discard changes** — secondary, disabled while `!isDirty || saving`. On click, opens an AntD `Modal.confirm` ("Discard all unsaved changes? This cannot be undone.") and on confirm calls `store.resetToPristine()`. This is the affordance that wires `resetToPristine` to the UI and gives users a way out other than navigate-away-then-confirm.

### 3.9 Routing & data fetch

The placeholder routes already exist in `apps/saas-app/src/routes/index.tsx`:

```
/workflow/:entityName/:modelVersion/new
/workflow/:entityName/:modelVersion/:workflowName
```

Sub-branch 4 swaps `WorkflowEditorCloudPlaceholder` for `WorkflowEditorCloud` and updates the lazy-import in the routes file accordingly. `WorkflowEditorCloudPlaceholder` is then deleted.

`WorkflowEditorCloud`:

1. Reads `useParams<{entityName, modelVersion, workflowName?}>()`.
2. Computes `const isBadRef = !entityName || Number.isNaN(Number(modelVersion))`. **All hooks are called unconditionally** (rules-of-hooks compliance — see also the §3.5/§3.7 note in sub-branch 3 where the same pattern bit us). The `useQuery` below uses `enabled: !isBadRef && !!workflowName` so the bad-ref render path doesn't fetch.
3. Computes `modelRef = { entityName, modelVersion: Number(modelVersion) }` for use inside the query.
4. `useQuery({ queryKey: statemachineKeys.cloudWorkflow(modelRef, workflowName), queryFn: () => gateway.loadWorkflow(modelRef, workflowName!), enabled: !isBadRef && !!workflowName })`. The key factory accepts `name: string | undefined` and includes it in the key as-is (React Query handles undefined parts fine; cleaner than an empty-string sentinel that shows up in devtools).
5. After all hooks: if `isBadRef`, return an AntD `Result status="404"` with a back-to-workflows link. **Do not** propagate `NaN` into a fetch and surface a backend error — fail at the URL parse, not at the API boundary.
6. If `workflowName` is undefined and not bad-ref: in a `useEffect`, hydrate the store with the scaffold doc, **guarded by `if (pristine === null)`** so the scaffold isn't re-applied on every render. The scaffold is `{ version: '1.0', name: '', initialState: 'draft', states: { draft: {} }, active: true }` — note `name` is empty, so the validator will reject Save until the user fills it.
7. On `useQuery` success: in a `useEffect`, `store.hydrate(data)`, **guarded by `if (pristine === null)`** for the same reason. (After save the store is re-hydrated by §3.8's flow, not by this effect.)
8. Renders the layout once `pristine !== null`.

`statemachineKeys.cloudWorkflow(modelRef, name | undefined)` is a new key factory entry alongside the existing `cloudWorkflows(modelRef)` key.

## 4. Testing strategy

### 4.1 Unit (Vitest)

- `workflowEditorStore.test.ts` — every action: hydrate (default and `preserveView: true`); updateWorkflowProps; renameState (cascades only `initialState`, NOT `transition.next` — see §3.5); addState / deleteState; addTransition / deleteTransition / updateTransition; addProcessor / updateProcessor / deleteProcessor; setTransitionCriterion; resetToPristine. **Plus path-rewrite invariants** (one test per row in §3.2's path-rewrite table): renameState rewrites `selectedPath` and `expandedPaths`; deleteState clears descendants and falls `selectedPath` back to `/`; deleteTransition shifts indices in both selection and expansion; addState/addTransition auto-select the new node; mutations clear `errors`. **Plus a `hydrate(_, { preserveView: true })` test** that confirms a still-valid `selectedPath` survives hydration and a no-longer-valid one falls back to `/`.
- `validateWorkflowDoc.test.ts` — table-driven: one test per rule from §3.4 (12 rules), both passing and failing cases per rule. **Plus a perf-ceiling test** — a regular `it()` block (not Vitest's `bench` — `bench` reports comparative statistics, it doesn't fail on a threshold) that runs `validateWorkflowDoc` against a synthetic 500-state, 5-transitions-each fixture five times, takes the **median** elapsed time via `performance.now()`, and asserts `expect(medianMs).toBeLessThan(100)`. The threshold is generous to absorb runner jitter; the point is to catch O(n²) regressions, not to micro-tune. Median (not min/mean) because GC pauses on a single iteration would otherwise either give a spurious pass (lucky run) or a spurious fail (unlucky run).
- `WorkflowTree.test.tsx` — renders the right node hierarchy from a fixture doc; clicking a node calls `setSelected`; red-dot suffix appears for any node whose path is a prefix of an error path (the §3.2 `nodeHasError` rule, asserted with both equal-path and prefix-path errors).
- `WorkflowPropsForm.test.tsx`, `StateForm.test.tsx`, `TransitionForm.test.tsx`, `ProcessorRow.test.tsx` — render with a fixture, edit one field, assert the store action was called with the right path.
- `QueryConditionEditor.test.tsx` — renders empty / simple / group / function; nested group with two simples round-trips through `value`/`onChange`. **Type-switch tests, both branches:** (a) switching from a non-trivial group to simple shows the confirm dialog; clicking Cancel preserves the original value; clicking OK applies the type change; (b) switching from a fresh empty group to simple does NOT show the dialog.
- `WorkflowEditorCloud.test.tsx` (integration) — mocked gateway: load → edit → save calls `gateway.saveWorkflow` with the right doc; **after save, the user's selectedPath is preserved** (asserts `preserveView: true` was passed to `hydrate`); **after save on /new, asserts `navigate` was called with the canonical URL and `replace: true`**; **after save when the post-save fetch throws `WorkflowNotFoundError`, asserts the warning toast and that no navigation happens** (per §3.8); validation failure surfaces in the tree; dirty guard fires `Modal.confirm` on attempted nav; **Discard-changes button click** confirms then calls `resetToPristine`, and the page returns to pristine state.

### 4.2 E2E (Playwright)

**Repo state today** — `playwright.config.ts` already exists at the repo root, with `baseURL: 'http://localhost:3000'` and a `webServer` that runs `cd apps/saas-app && npm run dev`. Both defaults are stale: the saas-app's Vite default is port 5173 and the repo migrated from npm to pnpm. `e2e/` already exists with ~20 spec files (`auth0-login.spec.ts`, `entity-viewer-*.spec.ts`, etc.). There is no `e2e/fixtures/` directory.

**This sub-branch's plan**: extend, don't rewrite. Specifically:

1. **`playwright.config.ts`** — add a new project entry (alongside the existing `chromium` project) named `cloud-workflow-editor`. The new project sets its own `testMatch: 'cloud-workflow-editor/**/*.spec.ts'`, its own `baseURL` from `process.env.BASE_URL ?? 'http://localhost:5173'`, and **does not configure a webServer** (the user runs the dev server themselves; this avoids tangling with the existing `webServer` pointing at port 3000). Existing projects are untouched. Run: `pnpm exec playwright test --project=cloud-workflow-editor`.
2. **`e2e/fixtures/`** (new directory) — `auth.ts` (login once per worker, save `storageState` to a temp file, all subsequent tests reuse it) and `testModel.ts` (POST /model/import on setup, DELETE on teardown — fixture sketch in this file).
3. **`e2e/cloud-workflow-editor/`** (new directory) — the spec files listed below.

**New files**:

```
e2e/
  fixtures/
    auth.ts                               # NEW: login once per worker, reuse storageState
    testModel.ts                          # NEW: POST /model/import on setup, DELETE on teardown
  cloud-workflow-editor/
    create.spec.ts                        # NEW
    edit-and-save.spec.ts                 # NEW
    add-processor.spec.ts                 # NEW
    query-condition.spec.ts               # NEW
    validation.spec.ts                    # NEW
    dirty-guard.spec.ts                   # NEW
```

**Modified files**:

```
playwright.config.ts                      # MODIFIED: add cloud-workflow-editor project
                                          #           (legacy defaults left as-is; out of scope to fix)
```

**Run requirements** — the env vars the user sets before running `pnpm exec playwright test --project=cloud-workflow-editor`:

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
- **Renaming a state — `initialState` cascades, `transition.next` does not.** Renaming a state rewrites `current.initialState` if it pointed at the old name (singular reference, almost never intentionally orphaned), but does NOT rewrite `transition.next` references across states (potentially many; auto-refactors of cross-state references hide intent and are easy to get wrong). The validator surfaces dangling `next` refs and the user fixes them by hand. If this proves clumsy in practice, a follow-up sub-branch can add an opt-in "Rewrite references" affordance.
- **Plain-string `value` in simple conditions.** A `simple` condition's `value` field is sent as a string; a numeric backend field will receive the literal `"42"` and the failure mode is "query matches nothing," not an error. Helper text under the input warns about this and points users at function conditions for typed comparisons. Out of scope for this sub-branch to add JSON-aware coercion.
- **Dirty flag stays true after edit-then-revert.** The reference-equality `current !== pristine` check returns true even after the user types a character and deletes it (Immer produces a new object on every mutation). A structural deep-equal would be more confusing than helpful (it would silently swallow "I tried that, undid it, will try something else" intent), so this is accepted.
- **Backend may rewrite the workflow name on import.** The cloud `POST .../workflow/import` endpoint returns no body — only a `200` status — so the gateway can't observe whether the server slugified, normalized case, or otherwise rewrote `doc.name`. The current contract assumes the backend preserves names verbatim (consistent with how sub-branch 3's `copyWorkflow` worked in the live env), and the post-save `loadWorkflow` fetch detects a mismatch by failing with `Workflow "X" not found`. §3.8 surfaces that as a `WorkflowNotFoundError` warning toast directing the user to refresh the workflows list. If we ever discover the backend does rewrite names, the right fix is for the gateway to do an export and find-by-best-match heuristic, or for the cloud API to start returning the canonical name in the import response — neither is in scope here.
- **`E2E_*` model name pollution:** if the cleanup step crashes hard (e.g. node process killed), models named `E2E_*` accumulate on the dev cyoda env. Tolerable — they're trivially identifiable and deletable manually; a periodic cleanup script is out of scope.

## 6. Branching and delivery

- **Branch:** `feature/cyoda-go-support-cloud-workflow-editor`, off `feature/cyoda-go-support`.
- **PR target:** `feature/cyoda-go-support` (squash-merged, matching sub-branches 1–3).
- **Plan:** `docs/superpowers/plans/2026-04-17-cloud-workflow-editor.md` (written next, by the `superpowers:writing-plans` skill — produces a step-by-step task list with bite-sized commits).
- **Execution:** `superpowers:subagent-driven-development` — fresh implementer subagent per task, two-stage spec + code-quality review after each, same process as sub-branch 3.
