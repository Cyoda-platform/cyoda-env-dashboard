# Cloud Workflow Editor — Layout Pivot (sub-branch 4 addendum)

> **Parent design:** `docs/superpowers/specs/2026-04-17-cloud-workflow-editor-design.md` (v4). This addendum supersedes §3.1, §3.3, §3.5, and parts of §4.1 of that spec. The data plumbing (store core, validator, save flow, gateway prep, `QueryConditionEditor`, `useDirtyGuard`) is unchanged.
>
> **Branch:** `feature/cyoda-go-support-cloud-workflow-editor` (PR #10). Lands as additional commits on the existing PR — does NOT spawn a new sub-branch.

## 1. Why

Manual smoke-test of the v1 editor against the live cyoda env exposed a UX problem: the tree-based navigator (left tree, right form per node) is unfriendly compared to the classic legacy editor, which presents a settings form on top + a 3-way layout toggle (Tabular / Graphical / Config) below. The legacy graph view is the most-loved part — pan/zoom, color-coded states + transitions + criteria + processes, manual repositioning. We want both views in the cloud editor too.

Per Anthropic-preferred-discovery: don't ship the tree editor and rip it out in a follow-up PR — the tree shouldn't ship at all. So PR #10 stays open, and this work lands as additional commits before merge.

## 2. Scope

### In scope

- **Layout pivot.** Replace the page body (tree + NodeRouter + per-node forms) with the classic pattern:
  - Settings form on top (always visible): name, description, version, initial state, active, workflow-level criterion.
  - Radio toggle below: **Tabular** / **Graphical** / **Config**.
  - Sticky save bar (Save + Discard) unchanged.
- **Tabular view.** A single transitions table (one row per `state.transitions[i]`) with columns: # / State / Name / Manual / Disabled / Next / Processors (count) / Criterion (yes/no) / Actions (Edit / Delete). Edit opens a Drawer hosting the existing `TransitionForm` (which embeds the Processors accordion + `QueryConditionEditor`).
- **Graphical view.** Reuses the existing `GraphicalStateMachine` Cytoscape component via a `WorkflowDoc → legacy-flat-shape` adapter. Read-only structurally (no draw-new-transition), but **drag-to-reposition is enabled** and positions persist to `localStorage` keyed per `(entityName, modelVersion, workflowName)`.
- **Config view.** Read-only JSON of the current `WorkflowDoc` (the in-memory `current`, not the server doc).
- **Adapter** (`workflowDocToGraphShape.ts`): pure function from `WorkflowDoc → { transitions: Transition[]; processes: Process[]; criteria: Criteria[] }` (the legacy shapes the graph component consumes). Synthetic IDs are deterministic from doc structure: `state:<name>`, `t:<state>/<i>`, `p:<state>/<ti>/<pi>`, `c:<state>/<ti>`. Names of states are used as state IDs (states have no other identity in the cloud doc).
- **Position storage** (`positionsStorage.ts`): localStorage helpers `loadPositions(modelRef, workflowName) → PositionsMap | null` and `savePositions(modelRef, workflowName, PositionsMap) → void`. Storage key: `cyoda.cloud-workflow-editor.positions:${entityName}/${modelVersion}/${workflowName}`. Throws nothing on failure (e.g. quota exceeded) — best effort.

### Removed (deleted from PR #10)

- `WorkflowTree.tsx` + tests
- `NodeRouter.tsx` + tests
- `nodes/StateForm.tsx` + tests (state-level editing happens via the Tabular view's transition rows; state rename is a follow-up)
- `nodeHasError.ts` + tests (no tree → no node bubbling)
- `selectedPath`, `expandedPaths` state + actions in `workflowEditorStore` (they were only meaningful for the tree)
- Path-rewrite logic in store mutations + the entire `workflowEditorStore.paths.test.ts` file (since path mutation no longer needs to drag selection/expansion along)

### Renamed / refactored

- `WorkflowPropsForm.tsx` → `WorkflowSettingsForm.tsx`. Same fields, slight layout reflow to fit the "always visible on top" position. Test file renamed to match.
- `TransitionForm.tsx` stays in place but is now mounted inside a Drawer (`TransitionEditDrawer`) opened by the Tabular row's Edit button. It still reads/writes through the store, just via a different host.

### Out of scope (still deferred)

- Drawing new transitions on the graph
- Renaming states (not in tabular row UX; can be added as a follow-up affordance)
- `array` and `lifecycle` query condition types
- Undo/redo
- Migrating `BrowserRouter` → `createBrowserRouter` so `useBlocker` catches sidebar nav (still tracked separately)
- Fixing the legacy `playwright.config.ts` defaults

## 3. Architecture

### 3.1 New file layout (replaces v4 §3.1)

```
packages/statemachine-react/src/pages/cloud-workflow-editor/
  WorkflowEditorCloud.tsx                 # page shell: settings form + layout toggle + save bar (rewritten body)
  workflowEditorStore.ts                  # store — selection/expansion/path-rewrite gone
  storeContext.ts                         # unchanged
  validateWorkflowDoc.ts                  # unchanged
  useDirtyGuard.ts                        # unchanged
  workflowDocToGraphShape.ts              # NEW: adapter
  positionsStorage.ts                     # NEW: localStorage helpers
  views/                                  # NEW directory
    TabularView.tsx
    GraphicalView.tsx
    ConfigView.tsx
  TransitionEditDrawer.tsx                # NEW: hosts TransitionForm in a Drawer
  index.ts                                # unchanged
  __tests__/
    workflowEditorStore.test.ts           # trimmed (path tests gone)
    validateWorkflowDoc.test.ts           # unchanged
    validateWorkflowDoc.perf.test.ts      # unchanged
    workflowDocToGraphShape.test.ts       # NEW
    positionsStorage.test.ts              # NEW
    WorkflowEditorCloud.test.tsx          # rewritten for new layout
    TransitionEditDrawer.test.tsx         # NEW
    views/
      TabularView.test.tsx
      GraphicalView.test.tsx
      ConfigView.test.tsx
  nodes/
    WorkflowSettingsForm.tsx              # renamed from WorkflowPropsForm
    TransitionForm.tsx                    # unchanged
    ProcessorRow.tsx                      # unchanged
    __tests__/
      WorkflowSettingsForm.test.tsx
      TransitionForm.test.tsx
      ProcessorRow.test.tsx
  # DELETED: WorkflowTree.tsx, NodeRouter.tsx, nodeHasError.ts, nodes/StateForm.tsx,
  #          and their __tests__ counterparts; workflowEditorStore.paths.test.ts.

packages/statemachine-react/src/components/cloud-workflows/
  QueryConditionEditor.tsx                # unchanged
  QueryConditionEditor.test.tsx           # unchanged
```

Each view file is ≤ ~200 lines. The adapter + position storage are pure functions.

### 3.2 Page layout (replaces v4 §3.3)

```
┌──────────────────────────────────────────────────────────┐
│  WorkflowSettingsForm                                    │
│  (Name / Description / Version / Initial state /         │
│   Active switch / Workflow-level criterion)              │
├──────────────────────────────────────────────────────────┤
│  [ Tabular ] [ Graphical ] [ Config ]   ← AntD Radio     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  <selected view here, vertically scrollable>             │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  [ Discard changes ]  [ Save ]   (sticky)                │
└──────────────────────────────────────────────────────────┘
```

The radio toggle's selection lives in component-local state on `WorkflowEditorCloud`. Default: **Tabular**. Not persisted across page loads (cheap to add later if requested).

### 3.3 Store changes (amends v4 §3.2)

`WorkflowEditorState` loses these members:

- `selectedPath: string` — gone
- `expandedPaths: Set<string>` — gone
- `setSelected(path)` — gone
- `toggleExpand(path)` — gone

Mutations lose their path-rewrite logic — they only mutate `current` and clear `errors` now:

- `renameState`: still cascades `initialState`. No `selectedPath`/`expandedPaths` updates.
- `addState`, `deleteState`, `addTransition`, `deleteTransition`: same, no path bookkeeping.

`hydrate(doc, opts)`: drop `preserveView` semantics — there's no view state to preserve. The `opts` parameter is removed. Save flow simplifies to `store.hydrate(fresh)` (no preserveView option).

The remaining store API stays: `current`, `pristine`, `errors`, `hydrate`, `setErrors`, `updateWorkflowProps`, `renameState`, `addState`, `deleteState`, `addTransition`, `deleteTransition`, `updateTransition`, `addProcessor`, `updateProcessor`, `deleteProcessor`, `setTransitionCriterion`, `resetToPristine`.

### 3.4 Adapter `workflowDocToGraphShape`

```ts
import type { WorkflowDoc } from '../../gateways';
import type { Transition, Process, Criteria } from '../../types';

export interface GraphShape {
  states: Array<{ id: string; name: string }>;     // legacy graph also wants states; pre-derived
  transitions: Transition[];
  processes: Process[];
  criteria: Criteria[];
}

export function workflowDocToGraphShape(doc: WorkflowDoc): GraphShape;
```

**ID scheme** (deterministic, stable for a given doc shape):

- State id = `state:${stateName}` (state name is unique within a doc)
- Transition id = `t:${stateName}/${index}`
- Processor id = `p:${stateName}/${transitionIndex}/${processorIndex}`
- Criterion id = `c:${stateName}/${transitionIndex}` (only emitted if `transition.criterion` is defined)

**Field mapping** (one transition per row):

```
{
  id: 't:draft/0',
  name: t.name,
  workflowId: '<unused-by-graph>',
  startStateId: 'state:draft',
  endStateId:   'state:' + t.next,
  startStateName: 'draft',
  endStateName:   t.next,
  automated: !t.manual,           // legacy "automated" = our "not manual"
  active:    !t.disabled,
  persisted: true,
  criteriaIds:    t.criterion ? ['c:draft/0'] : [],
  endProcessesIds: (t.processors ?? []).map((_, pi) => 'p:draft/0/' + pi),
}
```

**Why state ids include a `state:` prefix:** so the graph's positions map can also key state nodes with the same `state:` prefix without colliding with transition/process/criterion IDs. The legacy graph component already treats positions as a flat `id → {x,y}` map.

The reverse direction (graph → doc) is not needed because the graph is structurally read-only. Position changes only affect the persisted `PositionsMap`, not the doc.

### 3.5 Position storage

```ts
import type { ModelRef } from '../../gateways';
import type { PositionsMap } from '../../types';

export function positionsKey(modelRef: ModelRef, workflowName: string): string;
// → "cyoda.cloud-workflow-editor.positions:<entityName>/<modelVersion>/<workflowName>"

export function loadPositions(modelRef: ModelRef, workflowName: string): PositionsMap | null;
// Returns null if missing, malformed, or storage unavailable. Never throws.

export function savePositions(modelRef: ModelRef, workflowName: string, positions: PositionsMap): void;
// Best-effort write. Swallows quota / unavailability errors.
```

Storage corruption (e.g. a future change to ID scheme) is harmless because graph IDs that aren't in the loaded map fall back to the auto-layout. We don't need a version number in the storage payload.

### 3.6 Tabular view

```tsx
interface TabularViewProps {} // no props — reads from store

// Renders an AntD Table with rows derived from store.current.
// One row per (state, transition).
// Columns:
//   #          (index, sortable)
//   State      (state name, sortable)
//   Name       (transition name)
//   Manual     (Tag)
//   Disabled   (Tag)
//   Next       (state name)
//   Processors (count Tag)
//   Criterion  (Yes/No)
//   Actions    (Edit, Delete)
//
// Edit → opens TransitionEditDrawer for (stateName, index)
// Delete → store.deleteTransition(stateName, index) (with AntD modal.confirm)
//
// Above the table: a "+ Add transition" button that opens a small
// Modal asking "Which state?" (Select), then store.addTransition(stateName)
// AND opens the drawer for the new transition.
```

A separate "Processes" or "Criteria" table is intentionally NOT created — in cloud docs these live inline per-transition with no first-class identity, so a separate table would be misleading and edits would still need to bounce through the transition row. The Edit drawer (TransitionForm) already shows the processors accordion and the criterion editor for the focused transition.

### 3.7 Graphical view

```tsx
interface GraphicalViewProps {
  modelRef: ModelRef;
  workflowName: string;       // for position storage key
}

// Subscribes to store.current, runs workflowDocToGraphShape on it.
// Loads positions on mount; saves on every onUpdatePositionsMap callback.
// Renders <GraphicalStateMachine ... isReadonly={true} /> with the
// adapted props. minHeight matches the legacy editor (e.g. "600px").
```

`isReadonly={true}` disables the "Add transition" affordance. Drag-to-reposition is built into the graph component independently of this prop (positions are computed and emitted via `onUpdatePositionsMap` regardless of readonly mode — verified by reading the component).

### 3.8 Config view

```tsx
// Renders store.current as pretty-printed JSON inside a read-only AntD
// Input.TextArea (or pre block with monospace font + scrolling).
// No edit affordance.
// A "Copy to clipboard" button is a nice-to-have; v1 ships without it.
```

### 3.9 TransitionEditDrawer

```tsx
interface TransitionEditDrawerProps {
  open: boolean;
  stateName: string | null;
  transitionIndex: number | null;
  onClose: () => void;
}

// AntD Drawer (right-side, ~720px wide).
// When open + stateName + transitionIndex are set, renders <TransitionForm
// stateName={stateName} transitionIndex={transitionIndex} />.
// The drawer's footer has just a "Done" button that calls onClose; edits
// are saved live to the store (Save bar at the page level commits to backend).
```

## 4. Testing changes

### 4.1 Unit (Vitest) — amends v4 §4.1

**Removed tests** (because the components are deleted):

- `workflowEditorStore.paths.test.ts` (path-rewrites are gone)
- `nodeHasError.test.ts`
- `WorkflowTree.test.tsx`
- `NodeRouter.test.tsx`
- `StateForm.test.tsx`

**Updated tests:**

- `workflowEditorStore.test.ts`: drop the `setSelected`/`toggleExpand`/`preserveView` cases; keep the rest.
- `WorkflowEditorCloud.test.tsx`: rewrite for the new layout. Asserts the settings form renders, the layout toggle works (default Tabular), and the save flow + Discard still work. Drops the "preserveView preserved selectedPath" case (no selection state to preserve).
- `WorkflowPropsForm.test.tsx` → `WorkflowSettingsForm.test.tsx`: rename, no semantic change.

**New tests:**

- `workflowDocToGraphShape.test.ts` — table-driven: empty doc / single state / nested transitions / processors / criteria. Asserts ID determinism (same input → same IDs) and field mapping (manual → automated inverted, disabled → active inverted, etc.).
- `positionsStorage.test.ts` — round-trip save/load; key shape; behavior when localStorage throws (mock `setItem` to throw, confirm no exception escapes); behavior when stored value is malformed JSON (returns null).
- `TabularView.test.tsx` — renders one row per transition; Edit button opens the drawer; Delete confirms then calls `deleteTransition`; "+ Add transition" picker calls `addTransition` and opens the drawer for the new row.
- `GraphicalView.test.tsx` — renders `<GraphicalStateMachine>` with the adapted shape (mock the component to a stub that captures props); position-update callback writes to localStorage via `savePositions`; on mount, loads positions and passes them through.
- `ConfigView.test.tsx` — renders the JSON of `current` in the textarea/pre; updates when the doc changes.
- `TransitionEditDrawer.test.tsx` — renders the form when open; closes on Done; doesn't render when closed.

### 4.2 E2E (Playwright) — amends v4 §4.2

The 6 specs from sub-branch 4 mostly still apply, with selector updates:

- `create.spec.ts` — type the workflow name, click Save (no tree click needed). Already structured this way.
- `edit-and-save.spec.ts` — switch to Tabular view, click Edit on a row, edit in the drawer, Done, Save. Update selectors.
- `add-processor.spec.ts` — Tabular → Edit row → expand Processors accordion → Add → externalized → fill name → Done → Save. Update selectors.
- `query-condition.spec.ts` — Tabular → Edit row → Add criterion → switch to group → add 2 simples → Done → Save → reload → re-open → assert. Update selectors.
- `validation.spec.ts` — clear `initialState` in the settings form (top of page) → Save → assert error toast. Tree-node red badge assertion is dropped (no tree).
- `dirty-guard.spec.ts` — unchanged (popstate-based, didn't depend on tree).
- **NEW** `graphical-positions.spec.ts` — open editor → switch to Graphical → drag a node → reload → switch to Graphical again → assert the moved node is at the saved position. (Requires a deterministic node position assertion via `localStorage.getItem`; hairy in Playwright. Mark `it.skip` if too brittle on first try; the `positionsStorage.test.ts` unit test already covers the storage round-trip.)

## 5. Risks & open questions

- **Adapter ID stability across renames:** if the user renames a state, every transition's `startStateId`/`endStateId` (which embed the state name) shifts. The graph's persisted positions key by these IDs; positions for the renamed state's nodes are lost on rename. Acceptable trade-off — alternative would require a stable UUID per state in the doc, which the cloud schema doesn't provide.
- **`GraphicalStateMachine.isReadonly={true}` may also disable drag:** unverified at spec-write time. Verified at plan execution; if dragging IS suppressed by `isReadonly`, the plan adds a small fork in the prop wiring (e.g. drop `isReadonly` and rely on `onAddTransition={undefined}` to suppress the create affordance instead).
- **localStorage quota:** positions for many workflows could fill the storage. Each workflow's payload is ~hundreds of bytes per node × ~tens of nodes = a few KB max, so 5MB localStorage budget supports thousands of workflows. Not a real concern.
- **The "undefined: ProcessDatasetExport" cosmetic bug** noted from the prior smoke test (the accordion label reads `undefined: name` when `processor.type` is missing on the doc) is fixed in this pivot — `TransitionForm` is reused as-is, so the accordion label rendering is unchanged. The fix is independent: change the label fallback to `${p.type ?? 'externalized'}: ${p.name}`. Done as part of the `TransitionForm` cleanup task.

## 6. Branching and delivery

- Same branch (`feature/cyoda-go-support-cloud-workflow-editor`), same PR (#10).
- Squash-merge into `feature/cyoda-go-support` per convention.
- Plan: `docs/superpowers/plans/2026-04-17-cloud-workflow-editor-layout-pivot.md`.
- Execution: `superpowers:subagent-driven-development`, same as the rest of SB4.
