# Cyoda-Go backend support — design spec

**Date:** 2026-04-16
**Status:** approved for planning
**Owner:** paul@cyoda.com

## 1. Summary

`cyoda-go` is a digital twin of Cyoda Cloud. It exposes the Cyoda Cloud REST surface but does **not** expose any of the legacy platform administration endpoints (`/platform-api`, `/platform-processing`, `/platform-common`). The `cyoda-env-dashboard` app currently relies on those platform endpoints for most of its functionality; only a subset of features can therefore be offered against a cyoda-go backend.

This spec describes how the dashboard will be extended to support cyoda-go as a first-class backend target, behind the build-time feature flag `VITE_FEATURE_FLAG_IS_CYODA_GO`, and how the workflow configuration access layer will be refactored onto the new document-based Cyoda Cloud workflow API (`docs/cyoda-cloud/api/openapi-workflow.yml`) for every cloud-family deployment (both cyoda-cloud and cyoda-go).

The refactor is large enough that it will ship on a long-running feature branch decomposed into seven independently reviewable sub-branches.

## 2. Scope

### In scope

- New build-time flag `VITE_FEATURE_FLAG_IS_CYODA_GO`.
- Adjust `HelperFeatureFlags` so that `IS_CYODA_GO=true` implies `IS_CYODA_CLOUD=true`, enforced in code (not env).
- Menu and route gating in `apps/saas-app`: under `IS_CYODA_GO=true`, only Trino, Lifecycle (Workflows + Instances), and Entity Viewer are reachable; Reporting, Tasks, and Processing-Manager are hidden and their routes are not registered.
- Refactor the workflow access layer in `packages/statemachine-react` behind a strategy interface (`WorkflowGateway`) with two implementations:
  - `LegacyPlatformWorkflowGateway` — wraps the existing granular `/platform-api/statemachine/...` CRUD surface, used when `IS_CYODA_CLOUD=false`.
  - `CloudWorkflowGateway` — calls the new document-based `/model/{entityName}/{modelVersion}/workflow/{export,import}` endpoints, used when `IS_CYODA_CLOUD=true` (which transitively covers cyoda-go).
- New cloud-mode UI for workflows: two-stage Workflows list (entity-model picker → workflows for that model) and a single-page workflow editor at `/workflow/:entityName/:modelVersion/:workflowName` (plus `.../new`). No per-state/transition/criteria/processor detail pages in cloud mode.
- Instances port: a parallel `InstancesGateway` abstraction with `LegacyPlatformInstancesGateway` (current behavior) and `CloudInstancesGateway` (backed by the cloud entity-search API and `/entity/{entityId}`), gated by `IS_CYODA_CLOUD`.
- Vite proxy and dev-server adjustments so that `/platform-*` proxy entries are not registered under cyoda-go.
- E2E coverage for the cyoda-go flows, running against a real cyoda-go container.

### Out of scope

- Cloud-equivalent implementations of Reporting, Tasks, Processing-Manager. Those features are hidden under cyoda-go; their cloud ports are future sub-specs.
- User-facing "replace all workflows" / upload UX (`importMode: REPLACE` as a user action). Internally REPLACE is used only to implement delete; no user-facing REPLACE action is exposed in v1.
- `importMode: ACTIVATE` exposure.
- Runtime flipping of `IS_CYODA_GO`. Like every `VITE_*` var, it is inlined at build time.
- Migration tooling between legacy and cloud workflow representations. An installation is one or the other.
- Interactive graph editing in cloud mode. The graph is read-only initially; interactive editing is a possible future sub-spec.
- Rename of a workflow's `name` field after creation. See §7.3 and §11.
- Changes to `tools/backend-mock-server`. That mock targets processing-manager only; E2E relies on cyoda-go in Docker.

## 3. Feature flags

### 3.1 New flag

`VITE_FEATURE_FLAG_IS_CYODA_GO` — boolean, default `false`. Build-time only. Added to:

- `.env.template` (root)
- `apps/saas-app/.env.template`
- `ENV_FILES_GUIDE.md`

Documentation in those files must state explicitly: "`IS_CYODA_GO=true` implies `IS_CYODA_CLOUD=true` at runtime; you do not need to set both, though doing so is harmless."

### 3.2 Helper changes

`packages/http-api-react/src/utils/HelperFeatureFlags.ts` gains:

- `isCyodaGo()` — returns the raw value of `VITE_FEATURE_FLAG_IS_CYODA_GO`.
- `isCyodaCloud()` — **changed**. Now returns `rawCyodaCloudFlag || isCyodaGo()`. A misconfigured env that sets only `IS_CYODA_GO=true` still produces the correct cloud behavior.
- `isReportingAvailable()` — returns `!isCyodaGo()` (the existing reporting feature has no flag of its own today; if one is added later, combine with `&&`).
- `isTasksAvailable()` — returns `!isCyodaGo() && isTasksEnabled()` (preserves the existing `VITE_FEATURE_FLAG_TASKS` contract).
- `isProcessingManagerAvailable()` — returns `!isCyodaGo()`.

`isTrinoSqlSchemaEnabled()`, `isUseModelsInfo()`, and the remaining helpers are unchanged. Trino is explicitly available under cyoda-go.

### 3.3 Call-site gating

`apps/saas-app/src/components/LeftSideMenu.tsx` and `apps/saas-app/src/routes/index.tsx` consume the new `isReportingAvailable / isTasksAvailable / isProcessingManagerAvailable` helpers. Routes for unavailable features are not registered; the existing `<Route path="*" element={<Navigate to="/workflows" replace />} />` catches any pasted URL for a hidden feature.

## 4. Workflow data-layer architecture

### 4.1 The gateway boundary

A new module `packages/statemachine-react/src/gateways/` introduces the abstraction. The interface is narrow and stable:

```ts
interface ModelRef {
  entityName: string;
  modelVersion: number;
}

interface WorkflowGateway {
  listWorkflows(modelRef: ModelRef | null): Promise<WorkflowSummary[]>;
  loadWorkflow(modelRef: ModelRef | null, name: string): Promise<WorkflowDoc>;
  saveWorkflow(modelRef: ModelRef | null, doc: WorkflowDoc, mode: 'MERGE'): Promise<void>;
  deleteWorkflow(modelRef: ModelRef | null, name: string): Promise<void>;
  copyWorkflow(modelRef: ModelRef | null, sourceName: string, newName: string): Promise<void>;
}
```

- `modelRef` is `null` in legacy mode; `LegacyPlatformWorkflowGateway` ignores it.
- `WorkflowDoc` matches the cloud `WorkflowConfiguration` schema (`openapi-workflow.yml#/components/schemas/WorkflowConfiguration`). In legacy mode the gateway adapts its richer internal model to/from this shape so cloud-mode callers never see the legacy-only fields.
- `saveWorkflow` takes `mode: 'MERGE'` explicitly even though only MERGE is accepted today; this documents intent and gives us a single place to add other modes if the set ever grows. `REPLACE` is used internally by `deleteWorkflow` on the cloud gateway and is not part of the public contract.

### 4.2 Factory

`getWorkflowGateway(): WorkflowGateway` returns the correct instance based on `HelperFeatureFlags.isCyodaCloud()`. This is the only place where the flag is read for workflow operations; downstream code is flag-free.

### 4.3 Legacy implementation

`LegacyPlatformWorkflowGateway` wraps the existing calls in `packages/statemachine-react/src/stores/statemachineStore.ts`. The granular state/transition/criteria/processor methods (`getStatesList`, `postState`, etc.) remain accessible to the legacy pages (`State.tsx`, `Transition.tsx`, `Criteria.tsx`, `Process.tsx`) **but only via the legacy gateway** — they are *not* members of `WorkflowGateway`, so the cloud code path cannot call them by mistake.

### 4.4 Cloud implementation

`CloudWorkflowGateway`:

- `listWorkflows({ entityName, modelVersion })` → `GET /model/{entityName}/{modelVersion}/workflow/export`; maps `response.workflows[]` to `WorkflowSummary[]`.
- `loadWorkflow({ entityName, modelVersion }, name)` → same export call, filters by `name` client-side (the API exports the full collection; a per-name endpoint does not exist).
- `saveWorkflow({ entityName, modelVersion }, doc, 'MERGE')` → `POST /model/{entityName}/{modelVersion}/workflow/import` with body `{ importMode: 'MERGE', workflows: [doc] }`.
- `deleteWorkflow({ entityName, modelVersion }, name)` → load all; filter out the target; validate the remaining set is non-empty; `POST .../workflow/import` with `{ importMode: 'REPLACE', workflows: remaining }`. If the remaining set is empty, reject with a typed `CannotDeleteLastWorkflowError` *before* hitting the network.
- `copyWorkflow({ entityName, modelVersion }, sourceName, newName)` → load source; validate `newName` is unique within the loaded list; produce an in-memory clone with `name: newName`; `saveWorkflow` it with MERGE. Source remains untouched.

### 4.5 Store changes

The Zustand `statemachineStore` retains only UI state (`selectedWorkflow`, `selectedEntityClassName`, new `selectedModelRef`). All API plumbing moves to the gateways. This cleanly separates concerns and shrinks a test target that has grown unwieldy.

### 4.6 React Query hooks

`useWorkflowsList`, `useWorkflow`, `useCreateWorkflow`, `useUpdateWorkflow`, `useDeleteWorkflow`, `useCopyWorkflow` are rewritten to call `getWorkflowGateway()` and to accept `modelRef: ModelRef | null` where appropriate. Cache keys extend to include the model ref for cloud mode. Legacy callers pass `null` and the legacy gateway ignores it.

## 5. Cloud workflow API — semantics and mapping

### 5.1 Identity

A cloud workflow is identified by `(entityName, modelVersion, name)`. The doc has no opaque ID; `name` is the unique handle within `(entityName, modelVersion)`.

### 5.2 Listing

The cloud API has no cross-model workflow list. The Workflows page becomes a two-stage UX:

- Stage A — entity-model picker: lists `(entityName, modelVersion)` pairs from the existing models-info path that `IS_CYODA_CLOUD=true` already drives in the Entity Viewer. Selection persists in `statemachineStore.selectedModelRef` *and* in the URL (`/workflows?entityName=Customer&modelVersion=1`) so reload and deep links work.
- Stage B — workflows for the chosen model: renders `workflow/export`'s `workflows[]` as a table.

### 5.3 Save

Every save (create and update) is a `POST .../workflow/import` with `importMode: 'MERGE'` and a single-element `workflows: [doc]`. MERGE updates that one workflow if the `name` already exists in the model and creates it otherwise; other workflows are untouched.

### 5.4 Delete (and the ≥1 invariant)

A Cyoda entity model requires at least one workflow. Delete is implemented as REPLACE-minus-target: load the current set, remove the target, `POST .../workflow/import` with `importMode: 'REPLACE'` and the remaining workflows. The gateway enforces the ≥1 invariant before the network call. The UI disables the delete button in the list when the list has exactly one row and surfaces a tooltip explaining why; a race past that guard shows a friendly error toast.

### 5.5 Deactivate

Deactivate is a property, not a deletion. It is a MERGE save of the single workflow with `active: false`. Reversible. Offered as a toggle in the editor's workflow-level form and as a row action in the workflows list.

### 5.6 Copy

Copy (duplicate) asks for a new `name`, validates it is unique in the current list, and MERGE-saves a clone of the source with the new name. This also serves as the user-facing substitute for rename.

### 5.7 Rename

Renaming a workflow is **not** supported in v1. The `name` field is rendered read-only in the editor for an existing workflow. Users who need "rename" use Copy (to create the new-named workflow) then Delete (to remove the old one), which requires the model to have more than one workflow. This restriction is documented in a tooltip next to the disabled field.

### 5.8 Versioning

The workflow doc has its own `version` field (schema version, default `"1.0"`). The editor passes through whatever the server returns for existing workflows and defaults new workflows to `"1.0"`. Schema-version evolution is a server concern and out of scope here.

## 6. UI changes

### 6.1 Menu

`LeftSideMenu.tsx`: each top-level item is wrapped in the appropriate `isXxxAvailable()` helper. Under cyoda-go the visible items are Trino, Lifecycle (Workflows + Instances), Entity Viewer, plus the always-on footer items (Logout, Version, Theme). Label text is unchanged.

### 6.2 Routes

`routes/index.tsx`:

- Legacy-only routes (rendered only when `!isCyodaCloud()`): `/workflow/new`, `/workflow/:workflowId`, `/state/:stateId`, `/transition/:transitionId`, `/criteria/:criteriaId`, `/process/:processId`.
- Cloud-only routes (rendered only when `isCyodaCloud()`): `/workflow/:entityName/:modelVersion/new`, `/workflow/:entityName/:modelVersion/:workflowName` (path params URL-encoded).
- Shared routes (both modes): `/workflows`, `/instances`, `/instances/:instanceId`, `/entity-viewer`, plus whichever of `/trino`, `/reporting/*`, `/tasks/*`, `/processing-ui/*` are available in the current mode.
- `defaultRoute` remains `/workflows`.
- The existing catch-all redirect to `/workflows` stays.

### 6.3 Workflows list — cloud mode

A new component `WorkflowsCloud` in `packages/statemachine-react/src/pages/` is rendered by `/workflows` when `isCyodaCloud()`. Responsibilities:

- Stage A model picker (searchable select over the cloud models-info list).
- Stage B workflows table (columns: `name`, `desc`, `active`, `initialState`, `criterion` summary, row actions Edit / Duplicate / Deactivate / Delete).
- Create button → `/workflow/:entityName/:modelVersion/new`.
- URL reflects the selected model: `?entityName=...&modelVersion=...`.
- The legacy `Workflows` component continues to render for `!isCyodaCloud()`. The branch lives inside `Workflows.tsx`'s top-level render; no separate route entry.

### 6.4 Single-page workflow editor — cloud mode

A new component `WorkflowEditorCloud` in `packages/statemachine-react/src/pages/`:

- **Load:** for `/workflow/:entityName/:modelVersion/:workflowName`, fetches via `gateway.loadWorkflow(modelRef, name)`. For `/workflow/:entityName/:modelVersion/new`, starts from a scaffold doc (`version: "1.0"`, one placeholder state as `initialState`, empty `states` map, `active: true`, no top-level `criterion`).
- **Layout:** left panel with a tree (workflow-level properties at the top, then states → transitions); right panel shows the form for the currently selected tree node. The tree uses the existing graphical-view styling where sensible.
- **Nested concepts inline:** transition-level criteria (`QueryCondition` types: simple, group, function) and processors (externalized, scheduled) are inline sub-forms on the transition form. A small, focused `QueryConditionEditor` component is built for this purpose (see §11 risk note). No separate routes for criteria/processors in cloud mode.
- **Save:** a single "Save" button. Client-side validation enforces the doc schema invariants from `openapi-workflow.yml`: required `version`, `name`, `initialState`, `states` with at least one entry; each transition has `name`, `next`, `manual`. On success, `gateway.saveWorkflow(modelRef, doc, 'MERGE')`.
- **Dirty tracking:** a boolean `hasChanges`; a `beforeunload` / `useBlocker` confirm-dialog when navigating away with unsaved edits.
- **Graph view:** reuses `graphicalStatemachineStore` rendering in **read-only** mode. Interactive dragging / transition-drawing on cloud is explicitly a non-goal for v1.

### 6.5 Instances port

A new `InstancesGateway` with two implementations and factory, same pattern as workflows:

- `LegacyPlatformInstancesGateway`: wraps the existing `/platform-api/statemachine/instances` behavior.
- `CloudInstancesGateway`: uses the cloud entity-search API and `/entity/{entityId}`. The detailed cloud-API-to-UI mapping is deferred to the Instances sub-branch's own plan, where `openapi-entity-search.yml` will be consulted in depth. This spec commits only to the interface and the boundary.

UI on `/instances` and `/instances/:instanceId` stays structurally the same (list + detail). Filters available in the UI reduce under cloud mode to what the cloud API supports; the legacy-only filters are hidden behind the gateway boundary.

## 7. Vite dev-server and proxy

`apps/saas-app/vite.config.ts`:

- Reads `VITE_FEATURE_FLAG_IS_CYODA_GO` alongside `VITE_APP_BASE_URL`.
- When `IS_CYODA_GO=true`, does **not** register the `/platform-api`, `/platform-processing`, `/platform-common` proxy entries. The `/api` and `/auth` proxy entries are registered in both modes.
- The fail-fast check at the top of the config gets an additional branch: if `IS_CYODA_GO=true`, require `VITE_APP_BASE_URL` to be set (same as today) and emit a clear error otherwise.
- `.devcontainer/`, `tools/start-backend.sh`, and `tools/connect-backend.sh` are audited during the Vite proxy sub-branch; fixes are limited to what is actually broken under cyoda-go — no speculative cleanup.

## 8. Testing strategy

### 8.1 Unit tests (Vitest)

- `HelperFeatureFlags`: truth-table covering every combination of `(IS_CYODA_CLOUD, IS_CYODA_GO)`, including the auto-implication; assertions on every `isXxxAvailable()` helper.
- `CloudWorkflowGateway`: `vi.mock`'d axios; assert URLs, params, body shape for list/load/save/delete/copy; explicit test for the `CannotDeleteLastWorkflowError` invariant and the REPLACE flow; explicit test for the single-element `workflows: [doc]` MERGE envelope.
- `LegacyPlatformWorkflowGateway`: port the relevant tests from `packages/statemachine-react/src/stores/statemachineStore.test.ts` so legacy endpoint shapes remain covered.
- React Query hooks: assert they call the factory and the factory returns the right gateway based on the flag (`vi.mock` the factory itself in hook tests).
- `WorkflowsCloud` and `WorkflowEditorCloud`: render tests with a mocked gateway, covering load, edit, save, error, dirty-navigation-block, and client-side validation paths.
- `CloudInstancesGateway`: unit coverage defined in the Instances sub-branch.

### 8.2 E2E (Playwright)

- `playwright.config.ts` gains infrastructure to start cyoda-go in Docker before the run and stop it after. The Vite `webServer` entry is configured to point at the cyoda-go container URL.
- A test-mode env file (e.g. `apps/saas-app/.env.test.go`) sets `VITE_FEATURE_FLAG_IS_CYODA_GO=true` and the container's base URL.
- New specs under `e2e/`:
  - Menu shape under cyoda-go (only Trino, Lifecycle, Entity Viewer visible).
  - Cloud workflows list two-stage flow (model picker → workflows table), URL-state persistence.
  - Cloud workflow editor: create, edit, save (MERGE), duplicate, deactivate.
  - Delete ≥1 invariant (success when ≥2 workflows exist; button disabled when exactly 1; error toast on race).
  - Instances list + detail under cloud mode.
  - Each spec is tagged (e.g. `@cyoda-go`) so the suite can be filtered.
- Legacy-mode E2E specs continue to run against the legacy backend in a separate Playwright project.

### 8.3 CI

- Every sub-PR: lint, type-check, unit tests.
- PRs into `main` (i.e. the final integration PR from `feature/cyoda-go-support`): full Playwright run against both projects (legacy + cyoda-go).
- Nightly against the feature branch: full Playwright run.

## 9. Branching and delivery

### 9.1 Branch layout

- `main` — stable.
- `feature/cyoda-go-support` — long-running integration branch, cut from `main` as part of sub-branch 1.
- `feature/cyoda-go-support/<task-slug>` — sub-branches, cut from the feature branch, PR'd back into the feature branch. CI on sub-PRs runs lint / type-check / unit tests only.
- Final integration PR: `feature/cyoda-go-support → main` once all sub-branches are green and E2E passes end-to-end against cyoda-go and against a legacy backend.

### 9.2 Sub-branches (in order)

1. **Foundation** (`.../foundation`): env var; `HelperFeatureFlags` changes including the auto-implication and new availability helpers; menu + route gates in the SaaS app; env templates and `ENV_FILES_GUIDE.md`. No functional code change to workflow or Instances behavior. Legacy mode unchanged.
2. **Workflow data layer** (`.../workflow-gateway`): introduce `WorkflowGateway` + `LegacyPlatformWorkflowGateway` + `CloudWorkflowGateway` + factory; rewrite React Query hooks; shrink the store to UI state only. Legacy UI still works; cloud UI renders only a stub page that exercises the gateway end-to-end via manual test.
3. **Workflow list — cloud** (`.../workflow-list-cloud`): `WorkflowsCloud` page, entity-model picker, URL-state persistence, row actions (Edit wires to a stub editor; Duplicate/Deactivate/Delete implemented).
4. **Workflow editor — cloud** (`.../workflow-editor-cloud`): `WorkflowEditorCloud`, tree+form UI, `QueryConditionEditor` component, MERGE save, Copy, Deactivate toggle, Delete flow with ≥1 invariant, read-only graph view.
5. **Instances port** (`.../instances-cloud`): `InstancesGateway` interface + two implementations; UI updates to drive list and detail through the gateway; cloud API mapping detailed in this sub-branch's plan.
6. **Vite proxy & dev-server** (`.../vite-proxy`): proxy gating; fail-fast checks; audit of `.devcontainer` and tools scripts.
7. **E2E coverage** (`.../e2e-cyoda-go`): Docker'd cyoda-go in Playwright config; new specs; CI wiring for E2E on PRs to `main` and nightly.

### 9.3 Review discipline

Each sub-branch PR includes: a link to this spec, a link to its own plan document, a short change summary, and a "how this was tested" section. Sub-branches merge only after approval. The feature branch is never force-pushed. Rebases onto `main` happen at sub-branch boundaries when `main` has moved.

## 10. Risks and non-goals

### 10.1 Risks

- **QueryCondition shape divergence.** The cloud doc's `criterion` uses `QueryCondition` (simple / group / function) defined in `openapi-common.yml`. The legacy granular criteria editor has a different UX and data shape. We will not try to reuse it. A new, focused `QueryConditionEditor` component is built in sub-branch 4. If the cloud `QueryCondition` schema evolves, only that component and the cloud gateway change.
- **Export-then-filter for single-workflow load.** `CloudWorkflowGateway.loadWorkflow` fetches the full export and filters client-side. If a model ever has hundreds of workflows the payload could grow large. Acceptable for v1 given realistic workload sizes; a per-name endpoint is a server-side change tracked separately if needed.
- **Model ref persistence.** The Workflows list persists the selected model ref in both URL and store. Users navigating between workflows within the same model keep their context; switching models resets it. Deep links work. This should not surprise users, but it is a behavior change from the legacy flat list; the PR description calls it out explicitly.
- **Race on delete.** Between load-all and REPLACE-save, another user could add or remove a workflow. The REPLACE import would then overwrite their change. Mitigation: ensure the Delete flow includes an explicit confirmation dialog that lists the workflows being kept, and rely on cyoda-cloud's existing concurrency handling. Perfect optimistic concurrency (If-Match / ETag) is a server-side capability we don't currently have; flagged as future work.

### 10.2 Non-goals (recap)

- Cloud ports of Reporting / Tasks / Processing-Manager.
- User-facing REPLACE/ACTIVATE workflow import UX.
- Runtime toggling of `IS_CYODA_GO`.
- Workflow name rename.
- Interactive graph editing in cloud mode.
- Migration tooling between legacy and cloud workflow models.
- Changes to `tools/backend-mock-server`.

## 11. Open decisions carried into sub-branch plans

These are deliberately deferred to their sub-branch plans so the respective specs can be detailed against the right artifacts:

- **Instances**: exact cloud API mapping (filters, pagination, detail shape). To be resolved against `openapi-entity-search.yml` and `/entity/{entityId}` in sub-branch 5's plan.
- **Docker'd cyoda-go**: which image, which tag, which startup arguments, which seed data. To be resolved in sub-branch 7's plan.
- **Vite proxy audit**: whether `.devcontainer` and the `tools/*-backend.sh` scripts need any updates beyond the `vite.config.ts` changes. Inventory done, fixes scoped, during sub-branch 6.

## 12. Acceptance checklist for the feature-branch → main PR

- [ ] `VITE_FEATURE_FLAG_IS_CYODA_GO=true` launches the app with only Trino, Lifecycle (Workflows + Instances), and Entity Viewer visible.
- [ ] Under cyoda-go, every reachable page loads without any call to `/platform-*` endpoints.
- [ ] Under cloud mode (both cyoda-cloud and cyoda-go), the Workflows list shows the two-stage model-picker → workflows flow; URL state is preserved on reload and deep links.
- [ ] Cloud workflow editor can create, edit, save (MERGE), duplicate, deactivate, and delete workflows; delete refuses when only one workflow remains and disables the button in the list.
- [ ] Under legacy mode (`IS_CYODA_CLOUD=false`), all existing workflow / state / transition / criteria / processor pages continue to function exactly as before.
- [ ] Instances list and detail work under both modes, with filters restricted appropriately under cloud mode.
- [ ] Unit test suite passes; Playwright legacy project passes; Playwright cyoda-go project passes against a cyoda-go container.
- [ ] `HelperFeatureFlags` matrix tests pass for every `(IS_CYODA_CLOUD, IS_CYODA_GO)` combination.
- [ ] `ENV_FILES_GUIDE.md`, root `.env.template`, and `apps/saas-app/.env.template` all describe `VITE_FEATURE_FLAG_IS_CYODA_GO` and its implication on `IS_CYODA_CLOUD`.
