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
  CloudInstancesGateway.ts                       # NEW
  CloudInstancesGateway.test.ts                  # NEW
  LegacyPlatformInstancesGateway.ts              # NEW: throws for most ops
  LegacyPlatformInstancesGateway.test.ts         # NEW
  index.ts                                       # MODIFIED: add getInstancesGateway() factory
  errors.ts                                      # unchanged (NotImplementedInLegacyError reused)

packages/statemachine-react/src/pages/cloud-instances/
  InstancesCloud.tsx                             # NEW
  InstanceDetailCloud.tsx                        # NEW
  AdvancedSearchDrawer.tsx                       # NEW: JSON textarea → /search/direct
  __tests__/
    InstancesCloud.test.tsx
    InstanceDetailCloud.test.tsx
    AdvancedSearchDrawer.test.tsx
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
  totalCount?: number;       // optional; cloud may not always return
}

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
    pageSize: number;
    pageNumber: number;        // 1-indexed for parity with the cloud API
    entityIds?: string[];      // simple ID-list filter
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
| `list(modelRef, opts)` | `GET /entity/{entityName}/{modelVersion}?pageSize&pageNumber` | If `opts.entityIds` is provided, fall through to `search` with a generated GroupCondition that ORs `EQUALS entityId` for each id (the cloud list endpoint has no entity-IDs param). |
| `search(modelRef, criterion, opts)` | `POST /search/direct/{entityName}/{modelVersion}` body=`criterion` query=`limit, pointInTime` | The criterion object is passed through verbatim — it's the user's JSON from the Advanced Search Drawer or the synthesized one from `list(... entityIds)`. |
| `load(entityId, opts)` | `GET /entity/{entityId}?pointInTime&transactionId` | Returns the cloud entity envelope; the gateway extracts `data` + `meta` (already-existing helpers `extractCyodaEntityData` / `extractCyodaEntityMeta` in `http-api-react`). |
| `loadChanges(entityId, opts)` | `GET /entity/{entityId}/changes?pointInTime` | Maps response to `EntityChange[]`. |
| `fireTransition(entityId, transition, body)` | `PUT /entity/JSON/{entityId}/{transition}` body=`body` | `format=JSON` always. Body is the (possibly-edited) entity body the user is firing the transition with. |
| `delete(entityId)` | `DELETE /entity/{entityId}` | Returns void. |

### 3.4 `LegacyPlatformInstancesGateway`

Implements `list` only (wrapping the existing `POST /platform-api/statemachine/instances` flow that the current legacy `Instances.tsx` uses), so cloud-mode test fixtures + parity tests have a sibling implementation. Throws `NotImplementedInLegacyError` for `search`, `loadChanges`, `fireTransition`, `delete`. The legacy UI bypasses this gateway entirely and keeps its existing direct-call code, mirroring SB2's pattern (PR #8) where `LegacyPlatformWorkflowGateway` was symmetric scaffolding never consumed by the legacy page.

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
   - Comma-separated entity-IDs textbox (same affordance as legacy "Search by id"). On Search click → `gateway.list(modelRef, { pageSize: 20, pageNumber: 1, entityIds })`.
   - "Advanced" button → opens `AdvancedSearchDrawer`.
3. **Table** (per legacy column set, cloud-mapped): Entity Id / Entity / Current Workflow / State / Created / Updated / Action (Open).
4. **Pagination** (Prev / Next / Page size — same UX as legacy).

Click "Open" on a row → `navigate(\`/instances/${entityId}?entityName=${entityName}&modelVersion=${v}&workflowName=${currentWorkflowName ?? ''}\`)`. The detail page uses URL params to know the entity context.

URL state: `?entityName=...&modelVersion=...&page=N` so a refresh keeps the selected model + page. Mirrors SB3's URL-state pattern.

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

On Search click: `gateway.search(modelRef, parsed, {})`. Replaces the table content. The pagination resets; the cloud `/search/direct` returns up to `limit` rows (default 1000) without paging — for v1 we render all returned rows and add a banner "Showing first N of unknown total — refine your search if needed." A real paged search-result API exists at `/search/async/...` but is out of scope.

### 3.8 `InstanceDetailCloud` page

URL: `/instances/:entityId?entityName=...&modelVersion=...&workflowName=...`.

Top-of-page header (matches legacy):
- "Back to Instances" button → `/instances?entityName=...&modelVersion=...`
- "Instances / `<workflowName>`" + ID line.

5 tabs in this order (matches legacy):

#### 3.8.1 DetailsTab

Reads `gateway.load(entityId)`. Renders:
- "Standard fields": Id, State, Previous Transition, Created Date, Last updated date — all from `meta`.
- "Transition Entity": list of allowed transitions for the current state, fetched from `CloudWorkflowGateway.loadWorkflow(modelRef, workflowName)` filtered to `states[meta.state].transitions`. Each transition is a button that opens a confirm/edit modal (the legacy `EntityTransitions` UX). On confirm → `gateway.fireTransition(entityId, transitionName, currentEntityBody)`. On success → invalidate the query so the page re-renders with the new state.
- "Entity": rendered key-value of the entity body (`data`). Reuse legacy `EntityDetailTree` component if it doesn't depend on platform-api shape; else a simple recursive renderer. (Investigate at plan-writing time.)

#### 3.8.2 WorkflowTab

Similar to legacy. Loads the workflow doc (`CloudWorkflowGateway.loadWorkflow(modelRef, workflowName)`) and adapts via `workflowDocToGraphShape` (SB4). Renders the read-only `GraphicalStateMachine` with `currentState={meta.state}` so the active state highlights. Position dragging persisted via SB4's `positionsStorage` keyed by `(entityName, modelVersion, workflowName)` (the same key SB4's editor uses, so positions are shared between editor and instance-detail).

Header section: list of available transitions for the current state — same UX as DetailsTab's "Transition Entity" list (simply re-render that subcomponent here).

#### 3.8.3 AuditTab

Reads `gateway.loadChanges(entityId)` (returns `EntityChange[]`). Renders an AntD `Table` matching the legacy column set: Transaction ID / Time (UUID/Date) / State From / State To / User / Change Type. Pagination via AntD's table built-in (client-side, since the cloud `/changes` endpoint streams everything for a given entity).

#### 3.8.4 DataLineageTab

Reads `gateway.loadChanges(entityId)`. Renders:

1. **Filter** — date-range picker (Start date → End date). Filters the timeline.
2. **Vertical timeline** — one row per change, "newest first" (matching legacy). Each row: timestamp + "No. changed fields [N]" (where N is computed from the diff against the immediately-prior version) + a checkbox.
3. **Compare button** — enabled when exactly two checkboxes are checked. Click → `Promise.all([gateway.load(entityId, { pointInTime: t1 }), gateway.load(entityId, { pointInTime: t2 })])`, then renders the `CodeEditor` with `diff: true`, original=`older.data` (pretty JSON), modified=`newer.data` (pretty JSON). Same Monaco diff editor + the existing dark/light themes (already styled in `monacoTheme.ts`).

Computing "No. changed fields [N]" lazily: the timeline doesn't pre-fetch every version. The number is shown only after the user clicks Compare on a pair, OR we can fetch sequential pairs as the user expands rows — for v1, ship without the per-row count (hide that label) to avoid the round-trip storm. Show the count only in the diff view header. This is a deliberate scope-cut from legacy parity.

#### 3.8.5 JsonTab

Reads `gateway.load(entityId)` → renders the entity envelope (or just `.data`) in a read-only Monaco editor. Same component the legacy uses.

### 3.9 Helper rename

In `packages/http-api-react/src/utils/HelperFeatureFlags.ts`:

Old: `static isCloudWorkflowsActive(entityType: 'BUSINESS' | 'PERSISTENCE'): boolean`

New: `static isCloudBusinessActive(entityType: 'BUSINESS' | 'PERSISTENCE'): boolean`

Body unchanged: `return this.isCyodaCloud() && entityType === 'BUSINESS';`

Call sites to update (verified via grep at plan-writing time):
- `packages/statemachine-react/src/pages/Workflows.tsx` (SB3 router)
- Test mocks in `packages/saas-app/__tests__/edge-cases/error-handling.test.tsx`
- Other call sites surfaced by `grep -rn "isCloudWorkflowsActive" packages/ apps/`

This is a mechanical rename. Add a one-line `@deprecated` shim that re-exports the new name under the old name? **No** — sub-branches 1-4 have shipped, but they're all in our PR pipeline. Pure rename, no shim, no compat layer.

## 4. Testing strategy

### 4.1 Unit (Vitest)

- `CloudInstancesGateway.test.ts` — `vi.mock`'d axios; assert URLs, query params, body shape for every method. Special cases:
  - `list(modelRef, { entityIds: [...] })` falls through to `/search/direct` with a synthesized GroupCondition.
  - `load` extracts `data` + `meta` correctly from the cloud envelope.
  - `loadChanges` maps the response to the `EntityChange` shape.
  - `fireTransition` sends `format=JSON` and the body as-is.
- `LegacyPlatformInstancesGateway.test.ts` — `list` round-trips the platform-api shape; other methods throw `NotImplementedInLegacyError`.
- `getInstancesGateway()` — flag-flip test mirroring the existing `getWorkflowGateway` test.
- `InstancesCloud.test.tsx` — render with mocked gateway. Asserts: model picker reflects in URL, table renders one row per item, pagination clicks call `list` with `pageNumber++`/`pageNumber--`, "Open" navigates with the right query string, Advanced button opens the drawer.
- `AdvancedSearchDrawer.test.tsx` — JSON parse failure disables the Search button + shows error; valid JSON enables Search; Search click calls `gateway.search(modelRef, parsed)` and replaces the table content.
- `InstanceDetailCloud.test.tsx` — renders all 5 tabs; clicking each tab loads the right data via the gateway; back-button navigates to `/instances?entityName=...`.
- Per-tab tests (5 files): fixture-driven render + interaction. The DataLineage tab's diff is asserted by mocking `CodeEditor` to a stub that captures `original` + `modified` props.
- `Instances.tsx` + `InstanceDetail.tsx` router tests: assert correct branch for `(BUSINESS, cloud-on)` vs other combinations.

### 4.2 E2E (Playwright)

New project `cloud-instances` in `playwright.config.ts` (mirrors the SB4 pattern: separate `testDir`, separate `baseURL`, `chromium` project's `testIgnore` pattern updated to include `cloud-instances/**`).

Specs (test against an existing **locked + ingested** model on the dev cyoda env — `Dataset.1` or `DatasetExport.1` per docs/feature-matrix.md):

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

## 5. Risks & open questions

- **Cloud `/entity/{entityName}/{modelVersion}` response shape** — at spec-write time only the OpenAPI declares it; field names `pageSize`/`pageNumber` are 1-indexed but the response shape (does it return `hasMore`? a `totalCount`?) is unverified. Plan execution opens an axios call against the dev env first to lock down the parser.
- **`EntityDetailTree` reusability** — the legacy component lives in `@cyoda/ui-lib-react`; if it depends on legacy-specific data shape (e.g. `@bean` envelope), the cloud DetailsTab needs a thin adapter or its own renderer. Decided at plan-writing time after reading the component.
- **`fireTransition` body** — the cloud `PUT /entity/JSON/{entityId}/{transition}` requires the full entity body in the request payload. For "fire and don't change data" UX, the gateway resends the just-loaded body. Risk: a stale body racing against a concurrent update would silently overwrite. Mitigation: re-load (`gateway.load(entityId)`) immediately before fireTransition; show a brief "Refreshing entity…" before the transition modal opens. The cloud API has no optimistic-concurrency token.
- **DataLineage point-in-time precision** — `pointInTime` is ISO-8601. The `/changes` response has timestamps to ms precision; passing those verbatim to `/entity/{entityId}?pointInTime=...` should give the entity state immediately after that change. Verify at plan-execution time that there's no off-by-one between "change at T" and "state retrieved with pointInTime=T".
- **Entity-IDs filter via `/search/direct`** — synthesizing a GroupCondition with N OR-ed `EQUALS entityId` clauses works for small N but is O(N) in the search payload. Keep a sanity ceiling (e.g. ≤100 IDs) before falling through; for larger N the caller is over-using the filter. Surface a Filter validation error in the UI at >100 IDs.
- **Helper rename blast radius** — verified at plan-execution time by grep; there are call sites in SB3 + SB4 + saas-app tests. All mechanical.

## 6. Branching and delivery

- **Branch:** `feature/cyoda-go-support-cloud-instances`, off `feature/cyoda-go-support`.
- **PR target:** `feature/cyoda-go-support`. Squash-merge per convention.
- **Plan:** `docs/superpowers/plans/2026-04-17-cloud-instances.md` (written next, by the `superpowers:writing-plans` skill).
- **Execution:** `superpowers:subagent-driven-development`, same process as sub-branches 3 + 4.
