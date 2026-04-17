# Cloud Instances — design spec (sub-branch 5 of feature/cyoda-go-support)

> **Parent design:** `docs/superpowers/specs/2026-04-16-cyoda-go-support-design.md` §6.5. This spec is a focused expansion of that section, building on the gateway pattern established by sub-branch 2 (PR #8) and the cloud-vs-legacy router pattern established by sub-branch 3 (PR #9).
>
> **Branch:** `feature/cyoda-go-support-cloud-instances`, off `feature/cyoda-go-support`.

## 1. Summary

Port the `/instances` and `/instances/:instanceId` pages to the cloud entity API, achieving parity with the legacy editor (5 detail tabs all functional) with one deliberate simplification: the legacy "Advanced search" rangeCondition form is replaced by a JSON textarea that submits directly to `POST /search/direct/{entityName}/{modelVersion}`.

The work follows the same shape as sub-branches 2 + 3 + 4: a new `InstancesGateway` interface with two implementations and a factory, plus thin-router page components that branch between cloud and legacy at the top level.

## 2. Scope

### In scope

- `InstancesGateway` interface + `CloudInstancesGateway` (full impl) + `LegacyPlatformInstancesGateway` (symmetry-only, throws `NotImplementedInLegacyError` for ops the legacy UI doesn't call) + `getInstancesGateway()` factory.
- `Instances.tsx` becomes a thin router (cloud branch when `isCloudBusinessActive(entityType)`; legacy otherwise). Existing legacy code extracted to `<InstancesLegacy />`.
- `InstanceDetail.tsx` becomes a thin router with the same gating. Existing legacy code extracted to `<InstanceDetailLegacy />`.
- `InstancesCloud` page (new): model picker (reuses `ModelPicker` from SB3) → paginated entities table → "Advanced search" Drawer with a Monaco JSON textarea that submits the body to `/search/direct/...`.
- `InstanceDetailCloud` page (new): five tabs matching legacy parity:
  - **Details** — standard fields + entity body (already partly cloud-aware via `getCyodaCloudEntity`).
  - **Workflow** — manual transition fire UI + read-only graphical state machine. Reuses `GraphicalStateMachine` via `workflowDocToGraphShape` (SB4).
  - **Audit** — table from `GET /entity/{entityId}/changes`.
  - **Data Lineage** — timeline from `/changes` + checkbox-based pair selection + Monaco diff (reuses `CodeEditor` from `@cyoda/ui-lib-react` in `diff: true` mode, exactly as the legacy `DataLineageCompare`).
  - **JSON** — raw entity JSON.
- Helper rename: `isCloudWorkflowsActive(entityType)` → `isCloudBusinessActive(entityType)` in `packages/http-api-react/src/utils/HelperFeatureFlags.ts`. Update all call sites (sub-branches 3 + 4 use it). Same logic, broader name; the gating now spans workflows + instances + future cloud business features.
- Unit tests + Playwright E2E (parity with prior sub-branches' coverage levels).

### Out of scope (deferred)

- A query-builder UI for `/search/direct` (the simplified JSON textarea ships first; richer UX is its own design problem when needed).
- Async search (`/search/async/...`) — the sync `/search/direct` covers small-to-medium datasets per the OpenAPI; async is a future sub-branch when result sets exceed the 1000-row sync limit.
- Cloud entity-stats integration (`/entity/stats/...`) — not present in legacy; nice-to-have for a future dashboard.
- Migration of `apps/saas-app/src/App.tsx` from `BrowserRouter` to `createBrowserRouter` (still tracked separately).

## 3. Architecture

### 3.1 File layout

```
packages/statemachine-react/src/gateways/
  InstancesGateway.ts                            # NEW: interface
  CloudInstancesGateway.ts                       # NEW: full impl
  CloudInstancesGateway.test.ts                  # NEW
  index.ts                                       # MODIFIED: add getInstancesGateway() factory (cloud-only; see §3.4)
  errors.ts                                      # MODIFIED: add TooManyEntityIdsError (see §3.3)

packages/statemachine-react/src/pages/cloud-instances/
  InstancesCloud.tsx                             # NEW
  InstanceDetailCloud.tsx                        # NEW
  AdvancedSearchDrawer.tsx                       # NEW: JSON textarea → /search/direct
  CloudEntityTree.tsx                            # NEW: ~50-line recursive renderer for cloud JSON body (see §3.8.1)
  __tests__/
    InstancesCloud.test.tsx
    InstanceDetailCloud.test.tsx
    AdvancedSearchDrawer.test.tsx
    CloudEntityTree.test.tsx
  tabs/
    DetailsTab.tsx
    WorkflowTab.tsx
    AuditTab.tsx
    DataLineageTab.tsx
    JsonTab.tsx
    __tests__/
      DetailsTab.test.tsx
      WorkflowTab.test.tsx
      AuditTab.test.tsx
      DataLineageTab.test.tsx
      JsonTab.test.tsx

packages/statemachine-react/src/pages/
  Instances.tsx                                  # MODIFIED: thin router; existing body → InstancesLegacy
  InstancesLegacy.tsx                            # NEW (extracted from Instances.tsx)
  InstanceDetail.tsx                             # MODIFIED: thin router
  InstanceDetailLegacy.tsx                       # NEW (extracted from InstanceDetail.tsx)

packages/http-api-react/src/utils/HelperFeatureFlags.ts  # MODIFIED: rename isCloudWorkflowsActive → isCloudBusinessActive

packages/statemachine-react/src/index.ts          # MODIFIED: re-export new pages

apps/saas-app/src/routes/index.tsx                # unchanged (routes still target Instances + InstanceDetail; routers handle the branch internally)

e2e/cloud-instances/                              # NEW directory
  list.spec.ts
  detail-tabs.spec.ts
  advanced-search.spec.ts
  fire-transition.spec.ts
  data-lineage.spec.ts
playwright.config.ts                              # MODIFIED: add cloud-instances project (mirrors cloud-workflow-editor)
```

Each tab file ≤ ~200 lines. Heavy components (graph in WorkflowTab, diff in DataLineageTab) reuse existing implementations rather than re-rolling.

### 3.2 `InstancesGateway` interface

```ts
import type { ModelRef } from './workflowDocTypes';

export interface InstancesPage {
  items: EntitySummary[];
  hasMore: boolean;
}
// No `totalCount` — neither cloud `GET /entity/{entityName}/{modelVersion}` nor
// `POST /search/direct/...` documents a totalCount in the response. The UI shows
// "Showing N items" (count of `items` returned) and uses `hasMore` for the Next-page button.

export interface EntitySummary {
  entityId: string;
  entityName: string;
  modelVersion: number;
  state: string;
  currentWorkflowId?: string;   // legacy convention; cloud uses workflowName
  currentWorkflowName?: string; // cloud
  creationDate?: string;
  lastUpdateTime?: string;
  deleted?: boolean;
}

export interface EntityChange {
  transactionId: string;
  timestamp: string;          // ISO
  user?: string;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE';
  stateFrom?: string;
  stateTo?: string;
}

export interface InstancesGateway {
  list(modelRef: ModelRef, opts: {
    /** Required for the unfiltered list path. Ignored when `entityIds` is set (the
     *  fall-through to /search/direct doesn't page; see §3.3). */
    pageSize?: number;
    /** 1-indexed per cloud API convention (verify against live env at plan execution).
     *  Required for the unfiltered list path; ignored when `entityIds` is set. */
    pageNumber?: number;
    /** ≤100 entity IDs accepted; >100 throws TooManyEntityIdsError (§3.3). */
    entityIds?: string[];
  }): Promise<InstancesPage>;

  search(modelRef: ModelRef, criterion: unknown, opts: {
    limit?: number;
    pointInTime?: string;
  }): Promise<InstancesPage>;

  load(entityId: string, opts?: {
    pointInTime?: string;
    transactionId?: string;
  }): Promise<{ data: unknown; meta: EntitySummary }>;

  loadChanges(entityId: string, opts?: {
    pointInTime?: string;
  }): Promise<EntityChange[]>;

  fireTransition(entityId: string, transition: string, body: unknown): Promise<void>;

  delete(entityId: string): Promise<void>;
}
```

`load`'s return shape splits the entity body (`data`) from the lifecycle metadata (`meta`) so the Details tab can render both without re-fetching.

### 3.3 `CloudInstancesGateway` — endpoint mapping

| Method | Cloud endpoint | Notes |
|---|---|---|
| `list(modelRef, opts)` | `GET /entity/{entityName}/{modelVersion}?pageSize&pageNumber` | If `opts.entityIds` is provided, fall through to `search` with a generated GroupCondition that ORs `EQUALS entityId` for each id (the cloud list endpoint has no entity-IDs param). **The fall-through path drops pagination** — `pageSize`/`pageNumber` are ignored; the synthesized search returns up to the sync limit (1000 by default) in a single page. The UI in §3.6 disables the pagination controls and shows a "showing N matches" banner when the entity-IDs filter is active. Validation: ≤100 entity IDs accepted; >100 returns a `TooManyEntityIdsError` rather than emitting a runaway payload. |
| `search(modelRef, criterion, opts)` | `POST /search/direct/{entityName}/{modelVersion}` body=`criterion` query=`limit, pointInTime` | The criterion object is passed through verbatim — it's the user's JSON from the Advanced Search Drawer or the synthesized one from `list(... entityIds)`. |
| `load(entityId, opts)` | `GET /entity/{entityId}?pointInTime&transactionId` | Returns the cloud entity envelope; the gateway extracts `data` + `meta` (already-existing helpers `extractCyodaEntityData` / `extractCyodaEntityMeta` in `http-api-react`). |
| `loadChanges(entityId, opts)` | `GET /entity/{entityId}/changes?pointInTime` | Maps response to `EntityChange[]`. |
| `fireTransition(entityId, transition, body)` | `PUT /entity/JSON/{entityId}/{transition}` body=`body` | `format=JSON` always. Body is the (possibly-edited) entity body the user is firing the transition with. |
| `delete(entityId)` | `DELETE /entity/{entityId}` | Returns void. |

### 3.4 No `LegacyPlatformInstancesGateway`

**Deliberate divergence from SB2's pattern.** SB2 introduced `LegacyPlatformWorkflowGateway` for symmetry, and SB3/SB4 never consumed it from a legacy code path. That scaffolding has zero callers today and tends to drift from the interface over time. We're not repeating the mistake here.

`getInstancesGateway()` returns a `CloudInstancesGateway` unconditionally — only `<InstancesCloud />` and `<InstanceDetailCloud />` ever call it, and they're only mounted when `isCloudBusinessActive(entityType)` is true. Callers that reach `getInstancesGateway()` outside cloud-business mode are programming errors; the factory does NOT silently return a no-op shim.

`<InstancesLegacy />` and `<InstanceDetailLegacy />` keep their existing direct-call code paths (`useInstances`, `useEntityLoad`, etc.) — same as today's `Instances.tsx`/`InstanceDetail.tsx`, just renamed/extracted.

**Why keep `getInstancesGateway()` as a one-liner factory rather than `new CloudInstancesGateway()` directly?** It's a DI seam for tests. Cloud page tests `vi.mock('../../gateways', () => ({ getInstancesGateway: vi.fn() }))` and supply a mock instance per test — same pattern SB3/SB4 use. Constructing the class inline would force tests to mock the class export instead, which is fiddlier with `class` and changes the test idiom away from the rest of the codebase. Worth the one line.

(If we ever need a legacy implementation — e.g. to shrink the legacy components onto the same gateway for parity — we add it then; until then YAGNI.)

### 3.5 Page routers

`Instances.tsx`:

```tsx
export const Instances: React.FC = () => {
  const { entityType } = useGlobalUiSettingsStore();
  if (HelperFeatureFlags.isCloudBusinessActive(entityType)) {
    return <InstancesCloud />;
  }
  return <InstancesLegacy />;
};
```

(Hooks called unconditionally per the §3.5 sub-branch-3 rules-of-hooks lesson — the helper call + entityType read are not React hooks; the renderer-branch is straight ternary.)

`InstanceDetail.tsx`: same pattern.

`InstancesLegacy.tsx`: byte-for-byte the current `Instances.tsx` body, just renamed/extracted. Same for `InstanceDetailLegacy.tsx`.

### 3.6 `InstancesCloud` page

Layout, top to bottom:

1. **Model picker** (reuses `ModelPicker` from SB3) — selects `(entityName, modelVersion)`.
2. **Filter toolbar**:
   - Comma-separated entity-IDs textbox (same affordance as legacy "Search by id"). On Search click → `gateway.list(modelRef, { pageSize: 20, pageNumber: 1, entityIds })`. **When the entity-IDs filter is active, pagination is disabled in the UI**; the cloud sync-search returns up to the limit in one shot. ≤100 IDs accepted; >100 surfaces a banner "Too many IDs — refine to ≤100 or use Advanced Search".
   - "Advanced" button → opens `AdvancedSearchDrawer`.
3. **Table** (per legacy column set, cloud-mapped): Entity Id / Entity / Current Workflow / State / Created / Updated / Action (Open).
4. **Pagination** (Prev / Next / Page size — same UX as legacy). Hidden / disabled when the entity-IDs filter or Advanced Search is active.

Click "Open" on a row → navigates to `/instances/<entityId>?entityName=<entityName>&modelVersion=<v>&workflowName=<currentWorkflowName>` (URL-encoded). The detail page uses URL params to know the entity context.

URL state: `?entityName=...&modelVersion=...&page=N` so a refresh keeps the selected model + page. Mirrors SB3's URL-state pattern. **Filter state and Advanced Search results are NOT serialized to the URL** — both are in-memory only. A refresh after running a filter or Advanced Search drops them and re-loads the unfiltered first page. This is deliberate: serializing a free-form JSON criterion to a query string would produce something horrible, and serializing the entity-IDs list scales poorly.

### 3.7 `AdvancedSearchDrawer`

Right-side AntD `Drawer`, ~720px wide. Body:

- A Monaco JSON editor (using existing `CodeEditor` from `@cyoda/ui-lib-react`) pre-filled with a commented template:
  ```json
  {
    "type": "group",
    "operator": "AND",
    "conditions": [
      { "type": "simple", "jsonPath": "$.field", "operation": "EQUALS", "value": "..." }
    ]
  }
  ```
- A "Documentation" link to `https://docs.cyoda.net/guides/query-api/` (per the OpenAPI's contact info).
- Footer: "Search" button (disabled if JSON parse fails, with an inline error message near the editor) + "Cancel".

On Search click: `gateway.search(modelRef, parsed, {})`. Replaces the table content. The pagination is hidden while Advanced Search results are showing; the cloud `/search/direct` returns up to `limit` rows (default 1000) without paging — for v1 we render all returned rows and add a banner "Showing N matches (sync search; refine if N is at the limit)". A real paged search-result API exists at `/search/async/...` but is out of scope.

**The Drawer's JSON state is component-local.** It's not serialized to the URL or persisted to localStorage. Closing the drawer or refreshing the page loses the typed-in JSON. Acceptable because the Drawer is a power-user affordance and serializing arbitrary JSON to a query string is awful UX.

### 3.8 `InstanceDetailCloud` page

URL: `/instances/:entityId?entityName=...&modelVersion=...&workflowName=...`.

Top-of-page header (matches legacy):
- "Back to Instances" button → `/instances?entityName=...&modelVersion=...`
- "Instances / `<workflowName>`" + ID line.

5 tabs in this order (matches legacy):

**Shared workflow-doc fetch across DetailsTab and WorkflowTab.** Both tabs need `CloudWorkflowGateway.loadWorkflow(modelRef, workflowName)` (DetailsTab uses it for the "Transition Entity" allowed-transitions list; WorkflowTab uses it for the graph). Both call `useQuery({ queryKey: statemachineKeys.workflowDoc(modelRef, workflowName), … })` with the same key — TanStack Query dedupes to a single network request. Reviewers seeing two `useQuery` calls should not flag this as a double-fetch.

(Note on the key name: SB4's spec called it `cloudWorkflow`, but the actual factory entry in `packages/statemachine-react/src/hooks/useStatemachine.ts` is named **`workflowDoc`** — the SB4 implementer caught the spec/code drift during execution and the file's name is canonical. SB5 uses `workflowDoc`.)

**`positionsStorage` location.** SB4 introduced `positionsStorage.ts` inside `pages/cloud-workflow-editor/` for editor use. WorkflowTab consumes it too (so positions move with the user across editor + instance-detail). To avoid coupling SB5 to SB4's internal layout, **this PR relocates `positionsStorage.ts` and its tests from `pages/cloud-workflow-editor/` into `packages/statemachine-react/src/shared/`** (or `pages/cloud-shared/` — implementer's call) and updates SB4's editor imports. The contract (`positionsKey`, `loadPositions`, `savePositions`) is unchanged.

#### 3.8.1 DetailsTab

Reads `gateway.load(entityId)`. Renders:
- "Standard fields": Id, State, Previous Transition, Created Date, Last updated date — all from `meta`.
- "Transition Entity": list of allowed transitions for the current state, fetched from `CloudWorkflowGateway.loadWorkflow(modelRef, workflowName)` filtered to `states[meta.state].transitions`. Each transition is a button that opens a confirm/edit modal (the legacy `EntityTransitions` UX). On confirm → `gateway.fireTransition(entityId, transitionName, currentEntityBody)`. On success → invalidate the query so the page re-renders with the new state.
- "Entity": rendered key-value of the entity body (`data`). **A new small `CloudEntityTree` renderer** lives in this sub-branch — `EntityDetailTree` (the legacy component in `@cyoda/ui-lib-react`) is coupled to the legacy `Entity[]` shape (one entry per field with `columnInfo`/`value`/`type` LEAF/LIST/EMBEDDED/MAP), which the cloud `getCyodaCloudEntity` does NOT return — cloud returns the actual JSON body. Adapting cloud-JSON → legacy-`Entity[]` would be ~100 lines of misdirection; a direct recursive renderer for the cloud JSON tree is ~50 lines and is honest about the data shape. Lives at `packages/statemachine-react/src/pages/cloud-instances/CloudEntityTree.tsx`. Supports the same "show empty fields" toggle the legacy component has.

#### 3.8.2 WorkflowTab

Loads the workflow doc (`CloudWorkflowGateway.loadWorkflow(modelRef, workflowName)`) and adapts via `workflowDocToGraphShape` (SB4). Renders the read-only `GraphicalStateMachine` with `currentState={meta.state}` so the active state highlights. Position dragging persists via the relocated `positionsStorage` (see note above) keyed by `(entityName, modelVersion, workflowName)` — same key SB4's editor uses, so positions follow the user between the editor and instance-detail.

Header section: list of available transitions for the current state — same UX as DetailsTab's "Transition Entity" list (simply re-render that subcomponent here).

#### 3.8.3 AuditTab

Reads `gateway.loadChanges(entityId)` (returns `EntityChange[]`). Renders an AntD `Table` matching the legacy column set: Transaction ID / Time (UUID/Date) / State From / State To / User / Change Type. Pagination via AntD's table built-in (client-side, since the cloud `/changes` endpoint streams everything for a given entity).

#### 3.8.4 DataLineageTab

Reads `gateway.loadChanges(entityId)`. Renders:

1. **Filter** — date-range picker (Start date → End date). Filters the timeline.
2. **Vertical timeline** — one row per change, **newest first** (matching legacy). Each row: timestamp + a checkbox.
3. **Compare button** — enabled iff exactly two checkboxes are checked. Click → `Promise.all([gateway.load(entityId, { pointInTime: olderTimestamp }), gateway.load(entityId, { pointInTime: newerTimestamp })])`, then renders the `CodeEditor` with `diff: true`, `original={olderJson}`, `modified={newerJson}` — so the diff shows additions/deletions in the same direction as a typical "what changed since the older version" reading.

**Checkbox-pair selection rule:** the user can keep checking boxes; the component maintains a queue of the last-two-checked **by click order** (NOT by row timestamp). Checking a third box automatically un-checks **whichever of the two was checked first by click-order** (FIFO over click time, not over the row's data timestamp). Visually, the two currently-selected boxes get a distinct highlight (e.g. green); a third click flips the highlight to the new pair without forcing the user to manually un-check first.

(Spelling out the click-order vs timestamp-order distinction because in a newest-first list, "older" is ambiguous between "row with the earlier data timestamp" and "checkbox the user clicked earlier." The intended UX is the latter — a moving 2-box window over the user's click sequence.)

**Older/newer derivation:** since the timeline is newest-first, when the user has two checks `[A, B]` (where `A` is positionally above `B` in the rendered list), `A.timestamp >= B.timestamp` and so `older = B.timestamp`, `newer = A.timestamp`. The component sorts the two selected timestamps before passing to the Promise.all to avoid relying on render order.

Computing a "No. changed fields [N]" per-row label is intentionally NOT shipped in v1 — pre-fetching every version to compute deltas is a round-trip storm. The count appears only in the diff view header after Compare runs. Deliberate scope-cut from legacy parity; flagged in §4.3.

#### 3.8.5 JsonTab

Reads `gateway.load(entityId)` → renders the entity envelope (or just `.data`) in a read-only Monaco editor. Same component the legacy uses.

### 3.9 Helper rename

In `packages/http-api-react/src/utils/HelperFeatureFlags.ts`:

Old: `static isCloudWorkflowsActive(entityType: 'BUSINESS' | 'PERSISTENCE'): boolean`

New: `static isCloudBusinessActive(entityType: 'BUSINESS' | 'PERSISTENCE'): boolean`

Body unchanged: `return this.isCyodaCloud() && entityType === 'BUSINESS';`

Call sites to update (verified via grep at plan-writing time):
- `packages/statemachine-react/src/pages/Workflows.tsx` (SB3 router)
- `packages/statemachine-react/src/pages/cloud-workflow-editor/*` references via the helper (SB4)
- Test mocks in `apps/saas-app/__tests__/edge-cases/error-handling.test.tsx`
- Any other call sites surfaced by `grep -rn "isCloudWorkflowsActive" packages/ apps/`

**Blast radius decision:** SB3 (PR #9) and SB4 (PR #10) are merged into `feature/cyoda-go-support`. The rename lands in SB5's PR; SB3/SB4 callers in those merged commits are updated in the same PR. Any still-open child PR off `feature/cyoda-go-support` rebases onto SB5's merge commit and picks up the new name.

Concrete call-site count from `grep -rn "isCloudWorkflowsActive" packages/ apps/ --include='*.ts' --include='*.tsx'` at spec-write time: **10 hits across 5 files** (the helper itself + its existing tests + `Workflows.tsx` router + `Workflows.test.tsx` describe block + the `error-handling.test.tsx` mock). All mechanical to update. **No deprecation shim** — a shim would just be code-debt with no caller benefit.

## 4. Testing strategy

### 4.1 Unit (Vitest)

- `CloudInstancesGateway.test.ts` — `vi.mock`'d axios; assert URLs, query params, body shape for every method. Specific cases:
  - `list(modelRef, opts)` (no entityIds) → `GET /entity/{name}/{ver}?pageSize&pageNumber` with the right paths.
  - `list(modelRef, { entityIds: [3 ids] })` → falls through to `/search/direct`; assert the **synthesized criterion** is exactly `{ type: 'group', operator: 'OR', conditions: [{ type:'simple', jsonPath:'$.id', operation:'EQUALS', value: '<id>' }, …] }` for each id (or whatever the chosen jsonPath is — pin it to a literal in this test).
  - `list(modelRef, { entityIds: 101 ids })` → throws `TooManyEntityIdsError` synchronously, no axios call.
  - `load` extracts `data` + `meta` correctly from the cloud envelope (uses `extractCyodaEntityData` / `extractCyodaEntityMeta`).
  - `loadChanges` maps the response to the `EntityChange` shape (assert exact field renames).
  - `fireTransition` sends to URL path `/entity/JSON/{entityId}/{transition}` (the `JSON` is a path segment, not a query param) and includes the body verbatim.
  - `delete` sends `DELETE /entity/{entityId}` and returns void.
- **No `LegacyPlatformInstancesGateway` tests** — see §3.4 (the gateway doesn't exist).
- `getInstancesGateway()` — single test asserting it returns a `CloudInstancesGateway` instance. No flag-flip branch (see §3.4).
- `HelperFeatureFlags.test.ts` — **add a test** for the renamed `isCloudBusinessActive(entityType)`: returns true under cloud-mode + `'BUSINESS'`; returns false under cloud-mode + `'PERSISTENCE'`; returns false under legacy mode regardless. Also pin the OLD name absence with: `expect((HelperFeatureFlags as any).isCloudWorkflowsActive).toBeUndefined()` (the `as any` cast is needed because TS would otherwise reject the property access; this is the assertion form that actually catches a botched merge that re-introduces the old method on the class).
- `InstancesCloud.test.tsx` — render with mocked gateway. Asserts: model picker reflects in URL, table renders one row per item, pagination clicks call `list` with `pageNumber++`/`pageNumber--`, "Open" navigates with the right query string, Advanced button opens the drawer, **entity-IDs filter with >100 IDs surfaces a UI banner and does NOT call the gateway**. (Validation owner: **UI-side pre-check** in `InstancesCloud.tsx` runs the count first and surfaces the banner without a round-trip; the gateway's `TooManyEntityIdsError` from §3.3 is the belt-and-braces backstop in case a future caller bypasses the page UI. Tests cover both layers — the UI test for the banner-without-call path, and the gateway test for the synchronous-throw path.)
- `AdvancedSearchDrawer.test.tsx` — JSON parse failure disables the Search button + shows error; valid JSON enables Search; Search click calls `gateway.search(modelRef, parsed)` and replaces the table content. **No test for "drawer state survives close-and-reopen"** — it deliberately doesn't (§4.3).
- `InstanceDetailCloud.test.tsx` — renders all 5 tabs; clicking each tab loads the right data via the gateway; back-button navigates to `/instances?entityName=...`.
- Per-tab tests (5 files): fixture-driven render + interaction. The DataLineage tab's diff is asserted by mocking `CodeEditor` to a stub that captures `original` + `modified` props. **DataLineage interaction tests:** check 2 boxes → Compare enabled; check a 3rd box → the older of the previous pair gets unchecked + new highlight is on the new pair; Compare passes `older` and `newer` in the right direction (assert via the captured `original` prop = older entity body).
- `Instances.tsx` + `InstanceDetail.tsx` router tests: assert correct branch for `(BUSINESS, cloud-on)` → cloud component; everything else → legacy component.

### 4.2 E2E (Playwright)

New project `cloud-instances` in `playwright.config.ts` (mirrors the SB4 pattern: separate `testDir`, separate `baseURL`, `chromium` project's `testIgnore` pattern updated to include `cloud-instances/**`).

Specs (test against an existing **locked + ingested** model on the dev cyoda env — `Dataset.1` or `DatasetExport.1` per docs/feature-matrix.md). **All specs URL-preselect the model** with `/instances?entityName=DatasetExport&modelVersion=1` to skip the model-picker dropdown click — picker interaction in jsdom-style harnesses is fragile (depends on how many models the env returns, AntD Select's portal placement, etc.) and the model-picker behavior itself is already covered by SB3's specs. Specs that exercise the picker explicitly say so:

- `list.spec.ts` — login → /instances → pick model from picker → table shows ≥1 row → Open first row → URL changes to /instances/:id with query string.
- `detail-tabs.spec.ts` — open an existing instance → click each of the 5 tabs → assert each renders something distinguishable (Details has "Standard fields", Workflow has the SVG canvas, Audit has the change table, Data Lineage has the timeline, JSON has Monaco).
- `advanced-search.spec.ts` — open Advanced Search Drawer → paste a `{"type":"group","operator":"AND","conditions":[...]}` JSON → click Search → table updates.
- `fire-transition.spec.ts` — find an instance in a state with manual transitions available → click a transition → confirm → instance state updates (round-trip via `loadChanges` + re-render).
- `data-lineage.spec.ts` — open an instance with multiple changes (or use an instance the test seeds via gateway.fireTransition first to create a second version) → switch to Data Lineage → check two checkboxes → Compare → assert Monaco diff renders.

Fixtures: reuse `e2e/fixtures/auth.ts` from SB4. The `testModel` fixture from SB4 isn't directly reusable because Instances tests need data, not just a model. Two options for the data setup:
- Use an existing pre-populated model (`DatasetExport.1` already has rows on the dev env per smoke-tests in this conversation). Faster, less isolated, depends on env state.
- New `seededTestModel` fixture: create model → lock model (`PUT /model/.../lock`) → ingest N entities via `POST /entity/JSON/{entityName}/{modelVersion}` → tests run → delete model. Slower, fully isolated.

Recommend **the existing-model approach** for v1 specs since the ingested-data fixture is its own substantial scope; a follow-up PR can add the `seededTestModel` fixture if/when test isolation becomes a problem.

### 4.3 What's deliberately NOT covered

- Async search (`/search/async/...`) — out of scope.
- The "No. changed fields [N]" per-row label in DataLineage timeline — deferred.
- Cross-instance bulk actions — not in legacy either.
- **Advanced Search drawer state survives close-and-reopen** — explicitly a non-feature per §3.7. Drawer JSON is component-local and resets on close. No test asserts persistence; no test asserts the loss either.
- **Concurrent fireTransition races** — the API is last-write-wins (§5). Not asserted in unit tests; would require an integration test with two simulated actors.

## 5. Risks & open questions

- **Cloud `/entity/{entityName}/{modelVersion}` response shape and pageNumber base** — at spec-write time only the OpenAPI declares it; the response shape (does it return `hasMore`? items? something else?) and whether `pageNumber` is 0-indexed or 1-indexed are unverified. Plan execution opens an axios call against the dev env first to lock both down before the gateway parser hardens. Off-by-one here would show up as "page 1 is empty but page 2 has the first 20 rows" — easy to spot in smoke testing.
- **`EntityDetailTree` reusability** — the legacy component lives in `@cyoda/ui-lib-react`; if it depends on legacy-specific data shape (e.g. `@bean` envelope), the cloud DetailsTab needs a thin adapter or its own renderer. Decided at plan-writing time after reading the component.
- **`fireTransition` is last-write-wins.** The cloud `PUT /entity/JSON/{entityId}/{transition}` requires the full entity body in the request payload, and the cloud API has no optimistic-concurrency token (no ETag, no `If-Match`). When the user clicks a transition button, the page (a) re-loads the entity body via `gateway.load(entityId)` BEFORE opening the transition modal, then (b) opens the modal pre-populated with that fresh body, then (c) PUTs the body the user confirmed. The pre-flight reload narrows the user-facing staleness window — opening a stale tab and clicking a transition no longer silently submits ancient data — but **does not prevent concurrent-update races**. If another actor updates the entity between (b) and (c), this PUT overwrites their change. We accept this; the legacy code has the same property; designing optimistic concurrency belongs at the API layer, not the UI.
- **DataLineage point-in-time precision** — `pointInTime` is ISO-8601. The `/changes` response has timestamps to ms precision; passing those verbatim to `/entity/{entityId}?pointInTime=...` should give the entity state immediately after that change. Verify at plan-execution time that there's no off-by-one between "change at T" and "state retrieved with pointInTime=T".
- **Entity-IDs filter via `/search/direct`** — synthesizing a GroupCondition with N OR-ed `EQUALS entityId` clauses works for small N but is O(N) in the search payload. Keep a sanity ceiling (e.g. ≤100 IDs) before falling through; for larger N the caller is over-using the filter. Surface a Filter validation error in the UI at >100 IDs.
- **Helper rename blast radius** — verified at plan-execution time by grep; there are call sites in SB3 + SB4 + saas-app tests. All mechanical.

## 6. Branching and delivery

- **Branch:** `feature/cyoda-go-support-cloud-instances`, off `feature/cyoda-go-support`.
- **PR target:** `feature/cyoda-go-support`. Squash-merge per convention.
- **Plan:** `docs/superpowers/plans/2026-04-17-cloud-instances.md` (written next, by the `superpowers:writing-plans` skill).
- **Execution:** `superpowers:subagent-driven-development`, same process as sub-branches 3 + 4.

**Commit ordering on the PR:** the rename (`isCloudWorkflowsActive` → `isCloudBusinessActive`) and the `positionsStorage` relocation are cross-sub-branch refactors that touch SB3+SB4 territory. Land them as the **first two commits** on the PR, before any `CloudInstancesGateway` work, so a reviewer reading the diff sees:

1. `refactor(http-api-react): rename isCloudWorkflowsActive → isCloudBusinessActive`
2. `refactor(statemachine-react): relocate positionsStorage from cloud-workflow-editor to shared/`
3. then the SB5 feature commits

This keeps the "is the rename correct?" question separable from the "is the new gateway correct?" question. Squash-merge collapses them, but the reviewer's reading order is preserved.
