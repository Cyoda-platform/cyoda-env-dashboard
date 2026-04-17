# Cyoda-Go Cloud Workflows List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `WorkflowsCloudStub` (sub-branch 2) with the real cloud Workflows list page: a searchable entity-model picker (Stage A), a workflows table for the chosen model with row actions Edit / Duplicate / Rename / Deactivate / Delete (Stage B), URL state persistence, and a disruptive delete confirmation dialog.

**Architecture:** A `WorkflowsCloud` page composes three small focused components: `ModelPicker` (searchable select backed by `GET /model/`), `WorkflowsTable` (Ant Design table with row actions), and two dialogs (`NameInputDialog` reused for Duplicate/Rename, `DeleteWorkflowDialog` for the disruptive delete UX). Row actions dispatch through the gateway-backed React Query hooks already shipped in sub-branch 2 (`useCopyWorkflow`, `useRenameWorkflow`, `useUpdateWorkflow`, `useDeleteWorkflow`). The cloud editor itself ships in sub-branch 4 — this sub-branch lands a thin `WorkflowEditorCloudPlaceholder` page so Edit/Create navigation works today.

**Tech Stack:** TypeScript 5, React 18, Vite 6, Vitest, React Testing Library, React Router 6 (`useSearchParams`), TanStack Query, Ant Design 5 (Table, Select, Modal, Form, message).

**Spec:** `docs/superpowers/specs/2026-04-16-cyoda-go-support-design.md` §5.2, §5.4 (delete dialog), §5.5 (deactivate), §5.6 (copy), §5.7 (rename), §6.3 (Workflows list cloud mode), §9.2 sub-branch 3.

---

## Implementation choices made for this sub-branch

1. **Model picker uses `GET /model/`, not the platform-api `/platform-api/entity-info/fetch/models-info`.** The spec §5.2 originally referenced "the existing models-info path that `IS_CYODA_CLOUD=true` already drives in the Entity Viewer" — that path is `/platform-api/entity-info/fetch/models-info`, which works on cyoda-cloud but NOT on cyoda-go (no platform endpoints). Real-world testing surfaced that `GET /model/` is a cloud-native endpoint that returns `[{id, modelName, modelVersion, currentState, modelUpdateDate?}]` — works on both cyoda-cloud and cyoda-go. Task 1 corrects the spec; Task 2/3 add the type + API call.
2. **Rename and Duplicate share the `NameInputDialog` component.** Both prompt for a new name, validate uniqueness against the loaded workflows, and dispatch the corresponding mutation. The dialog is mode-agnostic; the page passes the right title and callback.
3. **The cloud editor placeholder is a single static page.** Real editor lands in sub-branch 4. The placeholder shows the route params so a developer testing the navigation can confirm Edit and Create wire up correctly.
4. **The disruptive delete dialog reads the snapshot timestamp from React Query's `dataUpdatedAt`.** Refresh-snapshot button calls the `refetch` from the same query.

---

## File Structure

| Path | Action | Responsibility |
| --- | --- | --- |
| `docs/superpowers/specs/2026-04-16-cyoda-go-support-design.md` | Modify | §5.2 spec correction: model-list endpoint is `GET /model/`. |
| `packages/http-api-react/src/api/entities.ts` | Modify | Add `EntityModelListItem` type + `getEntityModelList()` calling `GET /model/`. |
| `packages/statemachine-react/src/gateways/index.ts` | Modify | Re-export `EntityModelListItem` from `@cyoda/http-api-react` so it's reachable from the gateways barrel. |
| `packages/http-api-react/src/api/entities.test.ts` | Modify | Add tests for the new function. |
| `packages/statemachine-react/src/hooks/useStatemachine.ts` | Modify | Add `useEntityModelList()` hook + cache key. |
| `packages/statemachine-react/src/hooks/useStatemachine.test.tsx` | Modify | Test for the new hook. |
| `packages/statemachine-react/src/components/cloud-workflows/ModelPicker.tsx` | Create | Stage-A picker: searchable select + version display. |
| `packages/statemachine-react/src/components/cloud-workflows/ModelPicker.test.tsx` | Create | Tests: list rendering, selection callback, loading state, empty state. |
| `packages/statemachine-react/src/components/cloud-workflows/WorkflowsTable.tsx` | Create | Stage-B table: columns + row-action buttons; receives handlers as props. |
| `packages/statemachine-react/src/components/cloud-workflows/WorkflowsTable.test.tsx` | Create | Tests: column rendering, row-action button clicks invoke handler props. |
| `packages/statemachine-react/src/components/cloud-workflows/NameInputDialog.tsx` | Create | Reusable name-input dialog (Duplicate + Rename). Validates uniqueness. |
| `packages/statemachine-react/src/components/cloud-workflows/NameInputDialog.test.tsx` | Create | Tests: open/close, validation, submit callback. |
| `packages/statemachine-react/src/components/cloud-workflows/DeleteWorkflowDialog.tsx` | Create | Disruptive delete: lists kept-workflows, snapshot timestamp, type-the-name confirm, refresh-snapshot. |
| `packages/statemachine-react/src/components/cloud-workflows/DeleteWorkflowDialog.test.tsx` | Create | Tests: kept-list rendering, type-name gating, refresh callback, ≥1-invariant copy. |
| `packages/statemachine-react/src/pages/WorkflowsCloud.tsx` | Create | Composes picker + table + dialogs; URL state via `useSearchParams`. |
| `packages/statemachine-react/src/pages/WorkflowsCloud.test.tsx` | Create | Integration tests: picker → table → action flows; URL state persistence. |
| `packages/statemachine-react/src/pages/WorkflowEditorCloudPlaceholder.tsx` | Create | Static page rendering the route params (`entityName`, `modelVersion`, `workflowName`). |
| `packages/statemachine-react/src/pages/Workflows.tsx` | Modify | Replace `WorkflowsCloudStub` import with `WorkflowsCloud`. |
| `packages/statemachine-react/src/pages/WorkflowsCloudStub.tsx` | Delete | Replaced by `WorkflowsCloud`. |
| `packages/statemachine-react/src/pages/WorkflowsCloudStub.test.tsx` | Delete | Same. |
| `packages/statemachine-react/src/index.ts` | Modify | Replace stub barrel export with `WorkflowsCloud` + `WorkflowEditorCloudPlaceholder`. |
| `apps/saas-app/src/routes/index.tsx` | Modify | Register `/workflow/:entityName/:modelVersion/new` and `/workflow/:entityName/:modelVersion/:workflowName` routes (cloud-only) pointing to the placeholder. |

No `apps/saas-app` changes beyond routes. Hook signatures from sub-branch 2 (`useCopyWorkflow`, `useRenameWorkflow`, `useUpdateWorkflow`, `useDeleteWorkflow`) used as-is.

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

Expected: branch up to date with origin. The parent should have both Foundation (`dad1119`) and Workflow Gateway (`498fc9a`) merged.

- [ ] **Step 3: Cut the sub-branch**

```bash
git checkout -b feature/cyoda-go-support-cloud-workflows-list
```

Expected: now on `feature/cyoda-go-support-cloud-workflows-list`. Every commit in this plan lands here.

---

## Spec correction

### Task 1: Update spec §5.2 to reference `GET /model/`

**Files:**
- Modify: `docs/superpowers/specs/2026-04-16-cyoda-go-support-design.md`

The spec §5.2 says: "lists `(entityName, modelVersion)` pairs from the existing models-info path that `IS_CYODA_CLOUD=true` already drives in the Entity Viewer." That path is `/platform-api/entity-info/fetch/models-info`, which doesn't exist on cyoda-go. Real-world testing surfaced that `GET /model/` is a cloud-native model-list endpoint working on both cloud and cyoda-go. Update the spec.

- [ ] **Step 1: Edit the spec**

In `/Users/paul/dev/cyoda-env-dashboard/docs/superpowers/specs/2026-04-16-cyoda-go-support-design.md`, find §5.2 (the bullet starting with "Stage A — entity-model picker"). The current text reads:

```
- Stage A — entity-model picker: lists `(entityName, modelVersion)` pairs from the existing models-info path that `IS_CYODA_CLOUD=true` already drives in the Entity Viewer. Selection persists in `statemachineStore.selectedModelRef` *and* in the URL (`/workflows?entityName=Customer&modelVersion=1`) so reload and deep links work.
```

Replace with:

```
- Stage A — entity-model picker: lists `(entityName, modelVersion)` pairs from `GET /model/`, which returns `[{id, modelName, modelVersion, currentState, modelUpdateDate?}]`. This is a cloud-native endpoint available on both cyoda-cloud and cyoda-go (it does NOT require the legacy `/platform-api/...` surface). Selection persists in `statemachineStore.selectedModelRef` *and* in the URL (`/workflows?entityName=Customer&modelVersion=1`) so reload and deep links work.
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-04-16-cyoda-go-support-design.md
git commit -m "docs(spec): correct cloud Workflows model picker source endpoint

The original spec §5.2 referenced /platform-api/entity-info/fetch/models-info,
which doesn't exist on cyoda-go. Real-world testing surfaced GET /model/ as
a cloud-native endpoint with the right shape. Updated the spec to match
reality before sub-branch 3 implementation."
```

---

## Type and API plumbing

### Task 2: Add `getEntityModelList()` API function and `EntityModelListItem` type

**Files:**
- Modify: `packages/http-api-react/src/api/entities.ts`
- Modify: `packages/http-api-react/src/api/entities.test.ts`

- [ ] **Step 1: Write the failing test**

In `/Users/paul/dev/cyoda-env-dashboard/packages/http-api-react/src/api/entities.test.ts`, locate the existing `describe` block for the entities API (search for the file's top-level `describe`). At the very end of that describe — immediately before its closing `});` — append:

```ts
  describe('getEntityModelList', () => {
    it('GETs /model/ and returns the array', async () => {
      const items = [
        { id: 'a', modelName: 'Customer', modelVersion: 1, currentState: 'LOCKED' },
        { id: 'b', modelName: 'Order', modelVersion: 2, currentState: 'LOCKED', modelUpdateDate: '2026-04-10T17:43:39.410939-07:00' },
      ];
      vi.mocked(axios.get).mockResolvedValueOnce({ data: items, status: 200, statusText: 'OK', headers: {}, config: {} as any });

      const response = await getEntityModelList();

      expect(axios.get).toHaveBeenCalledWith('/model/');
      expect(response.data).toEqual(items);
    });
  });
```

If the test file's import block doesn't already import `getEntityModelList`, add it to the existing import line from `./entities`.

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/http-api-react/src/api/entities.test.ts -t "getEntityModelList"
```

Expected: fails with `getEntityModelList is not a function` (or similar import error).

- [ ] **Step 3: Implement `getEntityModelList`**

In `/Users/paul/dev/cyoda-env-dashboard/packages/http-api-react/src/api/entities.ts`, immediately **after** `getEntityModelExport` (search for the function definition; it returns `axios.get<SimpleViewModel>(...)`), insert:

```ts
/**
 * Item shape returned by `GET /model/` (cloud-native model-list endpoint).
 *
 * Used by the cloud Workflows page's stage-A model picker. The `modelName`
 * field is what becomes `entityName` on `ModelRef`. This is the canonical
 * declaration; `@cyoda/statemachine-react` re-exports it through its
 * gateways barrel.
 */
export interface EntityModelListItem {
  id: string;
  modelName: string;
  modelVersion: number;
  currentState: string;
  modelUpdateDate?: string;
}

/**
 * List all entity models in the cloud backend.
 *
 * Cloud-native: works on both cyoda-cloud and cyoda-go. Returns
 * `[{id, modelName, modelVersion, currentState, modelUpdateDate?}]`.
 * The cloud Workflows page's model picker is the primary consumer.
 */
export function getEntityModelList() {
  return axios.get<EntityModelListItem[]>('/model/');
}
```

- [ ] **Step 4: Run to verify the test passes**

```bash
pnpm exec vitest run packages/http-api-react/src/api/entities.test.ts -t "getEntityModelList"
```

Expected: 1 test passes.

- [ ] **Step 5: Commit**

```bash
git add packages/http-api-react/src/api/entities.ts \
        packages/http-api-react/src/api/entities.test.ts
git commit -m "feat(http-api-react): add getEntityModelList() for GET /model/"
```

### Task 3: Re-export `EntityModelListItem` from the gateways barrel

The type lives in `@cyoda/http-api-react` (Task 2). Re-export through the gateways barrel so `statemachine-react` consumers can import all gateway-related types from one place.

**Files:**
- Modify: `packages/statemachine-react/src/gateways/index.ts`

- [ ] **Step 1: Add the re-export**

Open `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/gateways/index.ts`. After the existing `export type { ... } from './workflowDocTypes';` block, add a separate re-export from http-api-react:

```ts
// Re-export from http-api-react so callers can import all gateway-related
// types from one place.
export type { EntityModelListItem } from '@cyoda/http-api-react';
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit -p packages/statemachine-react/tsconfig.json 2>&1 | grep -E "(gateways/index|EntityModelListItem)" | head -3
```

Expected: no output (the re-export resolves cleanly because Task 2 just added the symbol).

- [ ] **Step 3: Commit**

```bash
git add packages/statemachine-react/src/gateways/index.ts
git commit -m "feat(statemachine-react): re-export EntityModelListItem from gateways barrel"
```

### Task 4: Add `useEntityModelList()` React Query hook

**Files:**
- Modify: `packages/statemachine-react/src/hooks/useStatemachine.ts`
- Modify: `packages/statemachine-react/src/hooks/useStatemachine.test.tsx`

- [ ] **Step 1: Write the failing test**

In `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/hooks/useStatemachine.test.tsx`, find the existing `useEntityParentClasses` describe-block (or any other late-in-file describe). Append a new describe-block before the outer closing `});`:

```ts
  describe('useEntityModelList', () => {
    it('calls getEntityModelList and returns the data', async () => {
      const items = [
        { id: 'a', modelName: 'Customer', modelVersion: 1, currentState: 'LOCKED' },
      ];
      vi.mocked(getEntityModelList).mockResolvedValue({
        data: items,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const { result } = renderHook(() => useEntityModelList(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(getEntityModelList).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(items);
    });
  });
```

You'll need to add the imports/mock at the top of the file:

```ts
import { getEntityModelList } from '@cyoda/http-api-react';
import { useEntityModelList } from './useStatemachine';
```

…and add `getEntityModelList` to the existing `vi.mock('@cyoda/http-api-react', ...)` factory's return. Find the `vi.mock('@cyoda/http-api-react', async () => { ... })` block and add `getEntityModelList: vi.fn(),` to the returned object (alongside `HelperFeatureFlags`).

If `@cyoda/http-api-react` isn't yet mocked at the file level (only the gateway is), add a top-level mock:

```ts
vi.mock('@cyoda/http-api-react', async () => {
  const actual = await vi.importActual<any>('@cyoda/http-api-react');
  return {
    ...actual,
    getEntityModelList: vi.fn(),
  };
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/hooks/useStatemachine.test.tsx -t "useEntityModelList"
```

Expected: fails with `useEntityModelList is not defined`.

- [ ] **Step 3: Implement the hook**

In `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/hooks/useStatemachine.ts`:

A. Add the import at the top of the file (alongside the existing imports). Find:

```ts
import { axios } from '@cyoda/http-api-react';
```

…and replace with:

```ts
import { axios, getEntityModelList } from '@cyoda/http-api-react';
import type { EntityModelListItem } from '@cyoda/http-api-react';
```

(If the existing import is not exactly that shape — e.g., uses a multi-line import block — add `getEntityModelList` and `EntityModelListItem` alongside the existing `axios` import.)

B. In the `statemachineKeys` object, immediately **after** the `entityParentClasses` entry, add:

```ts
  entityModelList: () => [...statemachineKeys.all, 'entity-model-list'] as const,
```

C. Add the new hook immediately **after** `useEntityParentClasses` (near the end of the file):

```ts
/**
 * Lists all entity models in the cloud backend via GET /model/.
 * Used by the cloud Workflows page's model picker (Stage A).
 */
export function useEntityModelList() {
  return useQuery<EntityModelListItem[]>({
    queryKey: statemachineKeys.entityModelList(),
    queryFn: async () => {
      const response = await getEntityModelList();
      return response.data ?? [];
    },
  });
}
```

- [ ] **Step 4: Run to verify the test passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/hooks/useStatemachine.test.tsx -t "useEntityModelList"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/hooks/useStatemachine.ts \
        packages/statemachine-react/src/hooks/useStatemachine.test.tsx
git commit -m "feat(statemachine-react): add useEntityModelList hook"
```

---

## ModelPicker component

### Task 5: ModelPicker — bootstrap

**Files:**
- Create: `packages/statemachine-react/src/components/cloud-workflows/ModelPicker.tsx`
- Create: `packages/statemachine-react/src/components/cloud-workflows/ModelPicker.test.tsx`

The component is a controlled select: receives `value: ModelRef | null` and `onChange: (next: ModelRef | null) => void`. Internally calls `useEntityModelList()` and renders an Ant Design `Select` with one option per `(modelName, modelVersion)` pair, sorted by `modelUpdateDate` descending (most recent first), then by `modelName` asc.

- [ ] **Step 1: Write the bootstrap test**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/components/cloud-workflows/ModelPicker.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ModelPicker } from './ModelPicker';
import { useEntityModelList } from '../../hooks/useStatemachine';

vi.mock('../../hooks/useStatemachine', async () => {
  const actual = await vi.importActual<any>('../../hooks/useStatemachine');
  return {
    ...actual,
    useEntityModelList: vi.fn(),
  };
});

function renderWithClient(node: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
}

describe('ModelPicker', () => {
  beforeEach(() => {
    vi.mocked(useEntityModelList).mockReset();
  });

  it('renders the select control', () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
      isError: false,
    } as any);

    renderWithClient(<ModelPicker value={null} onChange={vi.fn()} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/components/cloud-workflows/ModelPicker.test.tsx
```

Expected: fails with `Failed to resolve import "./ModelPicker"`.

- [ ] **Step 3: Implement the bootstrap**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/components/cloud-workflows/ModelPicker.tsx`:

```tsx
/**
 * ModelPicker — Stage-A picker for the cloud Workflows page.
 *
 * Renders a searchable Ant Design Select populated from `useEntityModelList()`.
 * Each option represents a `(modelName, modelVersion)` pair. Selection emits
 * a `ModelRef` to the parent via `onChange`; null clears the selection.
 */

import React, { useMemo } from 'react';
import { Select } from 'antd';
import { useEntityModelList } from '../../hooks/useStatemachine';
import type { ModelRef } from '../../gateways';

export interface ModelPickerProps {
  value: ModelRef | null;
  onChange: (next: ModelRef | null) => void;
}

export const ModelPicker: React.FC<ModelPickerProps> = ({ value, onChange }) => {
  const { data, isLoading, isError, error } = useEntityModelList();

  const options = useMemo(() => {
    const items = data ?? [];
    return [...items]
      .sort((a, b) => {
        const da = a.modelUpdateDate ?? '';
        const db = b.modelUpdateDate ?? '';
        if (da !== db) return db.localeCompare(da); // recent first
        return a.modelName.localeCompare(b.modelName);
      })
      .map((item) => ({
        value: `${item.modelName}::${item.modelVersion}`,
        label: `${item.modelName} (v${item.modelVersion})`,
        modelName: item.modelName,
        modelVersion: item.modelVersion,
      }));
  }, [data]);

  const selectedKey = value ? `${value.entityName}::${value.modelVersion}` : undefined;

  return (
    <Select
      role="combobox"
      style={{ minWidth: 320 }}
      placeholder="Select an entity model"
      showSearch
      allowClear
      loading={isLoading}
      status={isError ? 'error' : undefined}
      value={selectedKey}
      onChange={(key) => {
        if (!key) {
          onChange(null);
          return;
        }
        const opt = options.find((o) => o.value === key);
        if (opt) onChange({ entityName: opt.modelName, modelVersion: opt.modelVersion });
      }}
      options={options.map(({ value, label }) => ({ value, label }))}
      filterOption={(input, opt) =>
        (opt?.label as string).toLowerCase().includes(input.toLowerCase())
      }
      notFoundContent={
        isError ? `Failed to load: ${(error as Error)?.message ?? 'unknown'}` : 'No models'
      }
    />
  );
};
```

- [ ] **Step 4: Run to verify the bootstrap test passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/components/cloud-workflows/ModelPicker.test.tsx
```

Expected: 1 test passes.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/components/cloud-workflows/ModelPicker.tsx \
        packages/statemachine-react/src/components/cloud-workflows/ModelPicker.test.tsx
git commit -m "feat(statemachine-react): scaffold ModelPicker component"
```

### Task 6: ModelPicker — list rendering and selection

**Files:**
- Modify: `packages/statemachine-react/src/components/cloud-workflows/ModelPicker.test.tsx`

- [ ] **Step 1: Write the failing test**

Append to `ModelPicker.test.tsx` before the outer closing `});`:

```tsx
  it('lists models from the hook, sorted by modelUpdateDate desc then modelName asc', async () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [
        { id: '1', modelName: 'Customer', modelVersion: 1, currentState: 'LOCKED', modelUpdateDate: '2026-04-10T10:00:00Z' },
        { id: '2', modelName: 'Order', modelVersion: 2, currentState: 'LOCKED', modelUpdateDate: '2026-04-12T10:00:00Z' },
        { id: '3', modelName: 'Apple', modelVersion: 1, currentState: 'LOCKED' }, // no date — sorts last
      ],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    renderWithClient(<ModelPicker value={null} onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole('combobox'));

    const options = await screen.findAllByText(/v\d+\)/);
    // Expected order: Order (newest), Customer (next), Apple (no date — last; alphabetical among undated)
    expect(options[0]).toHaveTextContent('Order (v2)');
    expect(options[1]).toHaveTextContent('Customer (v1)');
    expect(options[2]).toHaveTextContent('Apple (v1)');
  });

  it('emits ModelRef on selection', async () => {
    const onChange = vi.fn();
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [
        { id: '1', modelName: 'Customer', modelVersion: 1, currentState: 'LOCKED' },
      ],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    renderWithClient(<ModelPicker value={null} onChange={onChange} />);

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Customer (v1)'));

    expect(onChange).toHaveBeenCalledWith({ entityName: 'Customer', modelVersion: 1 });
  });

  it('emits null when the selection is cleared', async () => {
    const onChange = vi.fn();
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [
        { id: '1', modelName: 'Customer', modelVersion: 1, currentState: 'LOCKED' },
      ],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    renderWithClient(
      <ModelPicker value={{ entityName: 'Customer', modelVersion: 1 }} onChange={onChange} />
    );

    // Ant Design renders a clear button when allowClear and a value is set.
    // The button has aria-label "icon: close-circle" — we click it via testid lookup.
    const clearBtn = screen.getByLabelText('icon: close-circle');
    await userEvent.click(clearBtn);

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('shows the load-error message when the hook reports isError', () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
      isError: true,
      error: new Error('boom'),
    } as any);

    renderWithClient(<ModelPicker value={null} onChange={vi.fn()} />);

    // Open the dropdown so the notFoundContent renders.
    return userEvent.click(screen.getByRole('combobox')).then(() => {
      expect(screen.getByText(/Failed to load: boom/)).toBeInTheDocument();
    });
  });
```

- [ ] **Step 2: Run the new tests**

```bash
pnpm exec vitest run packages/statemachine-react/src/components/cloud-workflows/ModelPicker.test.tsx
```

Expected: all tests in the file pass (the ModelPicker implementation from Task 5 already covers the listed behaviors). If any fail, fix the implementation in `ModelPicker.tsx` to match — typical issues are search filter case sensitivity, `allowClear` placement, or `notFoundContent` not showing on error.

- [ ] **Step 3: Commit**

```bash
git add packages/statemachine-react/src/components/cloud-workflows/ModelPicker.test.tsx
git commit -m "test(statemachine-react): cover ModelPicker list/select/clear/error paths"
```

---

## NameInputDialog component

Used by both Duplicate and Rename row actions. Receives `open`, `title`, `existingNames` (for uniqueness validation), `initialValue`, `onSubmit(newName)`, `onCancel`. The dialog is mode-agnostic — the page configures it for either flow.

### Task 7: NameInputDialog

**Files:**
- Create: `packages/statemachine-react/src/components/cloud-workflows/NameInputDialog.tsx`
- Create: `packages/statemachine-react/src/components/cloud-workflows/NameInputDialog.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/components/cloud-workflows/NameInputDialog.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { NameInputDialog } from './NameInputDialog';

function renderWithApp(node: React.ReactNode) {
  return render(<App>{node}</App>);
}

describe('NameInputDialog', () => {
  let onSubmit: ReturnType<typeof vi.fn>;
  let onCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSubmit = vi.fn();
    onCancel = vi.fn();
  });

  it('does not render when closed', () => {
    renderWithApp(
      <NameInputDialog
        open={false}
        title="Rename workflow"
        existingNames={[]}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    expect(screen.queryByText('Rename workflow')).not.toBeInTheDocument();
  });

  it('renders the title and input when open', () => {
    renderWithApp(
      <NameInputDialog
        open
        title="Rename workflow"
        existingNames={[]}
        initialValue="OldName"
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    expect(screen.getByText('Rename workflow')).toBeInTheDocument();
    expect(screen.getByLabelText(/new name/i)).toHaveValue('OldName');
  });

  it('submits the entered name and closes', async () => {
    renderWithApp(
      <NameInputDialog
        open
        title="Duplicate"
        existingNames={['A', 'B']}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    const input = screen.getByLabelText(/new name/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'NewName');
    await userEvent.click(screen.getByRole('button', { name: /ok/i }));

    expect(onSubmit).toHaveBeenCalledWith('NewName');
  });

  it('blocks submit and shows an error when name is empty', async () => {
    renderWithApp(
      <NameInputDialog
        open
        title="Duplicate"
        existingNames={[]}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('blocks submit and shows an error when name conflicts with an existing one', async () => {
    renderWithApp(
      <NameInputDialog
        open
        title="Duplicate"
        existingNames={['Premium', 'Standard']}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    const input = screen.getByLabelText(/new name/i);
    await userEvent.type(input, 'Premium');
    await userEvent.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('cancel button calls onCancel', async () => {
    renderWithApp(
      <NameInputDialog
        open
        title="Duplicate"
        existingNames={[]}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/components/cloud-workflows/NameInputDialog.test.tsx
```

Expected: fails with `Failed to resolve import "./NameInputDialog"`.

- [ ] **Step 3: Implement the dialog**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/components/cloud-workflows/NameInputDialog.tsx`:

```tsx
/**
 * NameInputDialog — reusable name-input modal for Duplicate and Rename flows.
 *
 * Receives `existingNames` to enforce uniqueness client-side. Submits the
 * entered name via `onSubmit`. The page wires this to `useCopyWorkflow` (for
 * Duplicate) or `useRenameWorkflow` (for Rename).
 */

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input } from 'antd';

export interface NameInputDialogProps {
  open: boolean;
  title: string;
  existingNames: string[];
  initialValue?: string;
  onSubmit: (newName: string) => void;
  onCancel: () => void;
}

export const NameInputDialog: React.FC<NameInputDialogProps> = ({
  open,
  title,
  existingNames,
  initialValue,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm<{ name: string }>();

  // Reset the form whenever the dialog opens.
  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ name: initialValue ?? '' });
    }
  }, [open, initialValue, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values.name.trim());
    } catch {
      // form validation errors are surfaced inline by Ant Design.
    }
  };

  return (
    <Modal title={title} open={open} onOk={handleOk} onCancel={onCancel} destroyOnClose>
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="New name"
          rules={[
            {
              required: true,
              message: 'Name is required',
              validator: (_rule, value: string) => {
                const trimmed = (value ?? '').trim();
                if (!trimmed) return Promise.reject(new Error('Name is required'));
                if (existingNames.includes(trimmed)) {
                  return Promise.reject(new Error(`A workflow named "${trimmed}" already exists`));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input autoFocus aria-label="new name" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
```

- [ ] **Step 4: Run to verify the tests pass**

```bash
pnpm exec vitest run packages/statemachine-react/src/components/cloud-workflows/NameInputDialog.test.tsx
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/components/cloud-workflows/NameInputDialog.tsx \
        packages/statemachine-react/src/components/cloud-workflows/NameInputDialog.test.tsx
git commit -m "feat(statemachine-react): add NameInputDialog component for Duplicate/Rename"
```

---

## DeleteWorkflowDialog component

Per spec §5.4, this dialog is **disruptive by design**. It must:
- List by name every workflow that will remain after the delete
- Show the snapshot timestamp the kept-list was built from
- Require the user to type the exact `name` of the target before the destructive button enables
- Offer a "Refresh snapshot" button that re-runs the export (caller-provided callback)

### Task 8: DeleteWorkflowDialog — bootstrap and basic rendering

**Files:**
- Create: `packages/statemachine-react/src/components/cloud-workflows/DeleteWorkflowDialog.tsx`
- Create: `packages/statemachine-react/src/components/cloud-workflows/DeleteWorkflowDialog.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/components/cloud-workflows/DeleteWorkflowDialog.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { DeleteWorkflowDialog } from './DeleteWorkflowDialog';

function renderWithApp(node: React.ReactNode) {
  return render(<App>{node}</App>);
}

const baseProps = {
  open: true,
  targetName: 'DeleteMe',
  keptNames: ['Premium', 'Standard'],
  snapshotAt: new Date('2026-04-16T15:30:45.000Z'),
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
  onRefresh: vi.fn(),
};

describe('DeleteWorkflowDialog', () => {
  beforeEach(() => {
    baseProps.onConfirm = vi.fn();
    baseProps.onCancel = vi.fn();
    baseProps.onRefresh = vi.fn();
  });

  it('does not render when closed', () => {
    renderWithApp(<DeleteWorkflowDialog {...baseProps} open={false} />);
    expect(screen.queryByText(/delete workflow/i)).not.toBeInTheDocument();
  });

  it('renders the target name, the kept list, and the snapshot timestamp when open', () => {
    renderWithApp(<DeleteWorkflowDialog {...baseProps} />);

    // Title or body mentions the target.
    expect(screen.getByText(/DeleteMe/)).toBeInTheDocument();

    // Kept-list shows both kept workflows.
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();

    // Snapshot timestamp is rendered (HH:MM:SS format).
    expect(screen.getByText(/15:30:45/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/components/cloud-workflows/DeleteWorkflowDialog.test.tsx
```

Expected: fails with `Failed to resolve import "./DeleteWorkflowDialog"`.

- [ ] **Step 3: Implement the dialog**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/components/cloud-workflows/DeleteWorkflowDialog.tsx`:

```tsx
/**
 * DeleteWorkflowDialog — disruptive delete confirmation per spec §5.4.
 *
 * The cloud delete is implemented as REPLACE-minus-target (export → filter →
 * REPLACE-import). Between the export and the import, another user could have
 * mutated the model. To make the race risk visible, this dialog:
 *
 *   - Lists every workflow that will remain after the delete (`keptNames`).
 *   - Shows the timestamp of the export the kept-list was built from.
 *   - Requires the user to type the exact `targetName` to enable the button.
 *   - Offers a Refresh button that re-runs the export upstream.
 *
 * The ≥1 invariant is enforced by the gateway BEFORE any POST, so the dialog
 * is never reached when only the target exists. This component is a UI safety
 * layer, not the invariant enforcement.
 */

import React, { useState, useEffect } from 'react';
import { Modal, List, Input, Typography, Space, Button } from 'antd';

const { Text, Paragraph } = Typography;

export interface DeleteWorkflowDialogProps {
  open: boolean;
  targetName: string;
  /** Workflows that will remain after delete. The dialog renders them by name. */
  keptNames: string[];
  /** Timestamp of the snapshot the kept-list was built from. */
  snapshotAt: Date;
  onConfirm: () => void;
  onCancel: () => void;
  onRefresh: () => void;
}

const formatTime = (d: Date): string =>
  d.toISOString().substring(11, 19); // HH:MM:SS

export const DeleteWorkflowDialog: React.FC<DeleteWorkflowDialogProps> = ({
  open,
  targetName,
  keptNames,
  snapshotAt,
  onConfirm,
  onCancel,
  onRefresh,
}) => {
  const [typed, setTyped] = useState('');

  // Reset the typed-confirm field every time the dialog opens.
  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  const canConfirm = typed.trim() === targetName;

  return (
    <Modal
      title={`Delete workflow "${targetName}"`}
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={`Delete ${targetName}`}
      okType="danger"
      okButtonProps={{ disabled: !canConfirm }}
      destroyOnClose
      width={640}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Paragraph>
          This delete uses REPLACE on the entity model. Workflows kept after the delete:
        </Paragraph>
        <List
          size="small"
          bordered
          dataSource={keptNames}
          renderItem={(name) => <List.Item>{name}</List.Item>}
        />
        <Text type="secondary">
          Snapshot taken at {formatTime(snapshotAt)} — other users' changes after that
          time may be overwritten.{' '}
          <Button size="small" onClick={onRefresh}>
            Refresh snapshot
          </Button>
        </Text>
        <div>
          <label htmlFor="confirm-name">
            Type <Text strong>{targetName}</Text> to enable Delete:
          </label>
          <Input
            id="confirm-name"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            aria-label="confirm name"
            autoFocus
          />
        </div>
      </Space>
    </Modal>
  );
};
```

- [ ] **Step 4: Run to verify the tests pass**

```bash
pnpm exec vitest run packages/statemachine-react/src/components/cloud-workflows/DeleteWorkflowDialog.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/components/cloud-workflows/DeleteWorkflowDialog.tsx \
        packages/statemachine-react/src/components/cloud-workflows/DeleteWorkflowDialog.test.tsx
git commit -m "feat(statemachine-react): scaffold DeleteWorkflowDialog with kept-list rendering"
```

### Task 9: DeleteWorkflowDialog — type-name gating, refresh callback, confirm

**Files:**
- Modify: `packages/statemachine-react/src/components/cloud-workflows/DeleteWorkflowDialog.test.tsx`

- [ ] **Step 1: Write the failing tests**

Append to the file before the outer closing `});`:

```tsx
  it('disables the destructive button until the user types the exact target name', async () => {
    renderWithApp(<DeleteWorkflowDialog {...baseProps} />);

    const button = screen.getByRole('button', { name: /^Delete DeleteMe$/ });
    expect(button).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/confirm name/i), 'DeleteMe');

    expect(button).toBeEnabled();
  });

  it('keeps the destructive button disabled if the typed name is wrong', async () => {
    renderWithApp(<DeleteWorkflowDialog {...baseProps} />);
    const button = screen.getByRole('button', { name: /^Delete DeleteMe$/ });

    await userEvent.type(screen.getByLabelText(/confirm name/i), 'Wrong');

    expect(button).toBeDisabled();
  });

  it('invokes onConfirm when the button is clicked after correct name is typed', async () => {
    const onConfirm = vi.fn();
    renderWithApp(<DeleteWorkflowDialog {...baseProps} onConfirm={onConfirm} />);

    await userEvent.type(screen.getByLabelText(/confirm name/i), 'DeleteMe');
    await userEvent.click(screen.getByRole('button', { name: /^Delete DeleteMe$/ }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('invokes onRefresh when the Refresh button is clicked', async () => {
    const onRefresh = vi.fn();
    renderWithApp(<DeleteWorkflowDialog {...baseProps} onRefresh={onRefresh} />);

    await userEvent.click(screen.getByRole('button', { name: /refresh snapshot/i }));

    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('invokes onCancel when the Cancel button is clicked', async () => {
    const onCancel = vi.fn();
    renderWithApp(<DeleteWorkflowDialog {...baseProps} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('resets the typed name when reopened', async () => {
    const { rerender } = renderWithApp(<DeleteWorkflowDialog {...baseProps} />);
    await userEvent.type(screen.getByLabelText(/confirm name/i), 'DeleteMe');

    rerender(<App><DeleteWorkflowDialog {...baseProps} open={false} /></App>);
    rerender(<App><DeleteWorkflowDialog {...baseProps} open={true} /></App>);

    expect(screen.getByLabelText(/confirm name/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /^Delete DeleteMe$/ })).toBeDisabled();
  });
```

- [ ] **Step 2: Run to verify the tests pass**

```bash
pnpm exec vitest run packages/statemachine-react/src/components/cloud-workflows/DeleteWorkflowDialog.test.tsx
```

Expected: 8 tests pass (the 2 from Task 8 plus the 6 new ones). The implementation in Task 8 already satisfies them; if any fails, fix the implementation.

- [ ] **Step 3: Commit**

```bash
git add packages/statemachine-react/src/components/cloud-workflows/DeleteWorkflowDialog.test.tsx
git commit -m "test(statemachine-react): cover DeleteWorkflowDialog gating, refresh, cancel, reset"
```

---

## WorkflowsTable component

Renders the workflows list with columns and per-row action buttons. Receives all data and handlers as props (presentational; the page composes it with the hooks and dialogs).

### Task 10: WorkflowsTable — bootstrap and column rendering

**Files:**
- Create: `packages/statemachine-react/src/components/cloud-workflows/WorkflowsTable.tsx`
- Create: `packages/statemachine-react/src/components/cloud-workflows/WorkflowsTable.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/components/cloud-workflows/WorkflowsTable.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { WorkflowsTable } from './WorkflowsTable';
import type { WorkflowSummary } from '../../gateways';

function renderWithApp(node: React.ReactNode) {
  return render(<App>{node}</App>);
}

const sampleSummaries: WorkflowSummary[] = [
  { name: 'Premium', desc: 'Premium customers', active: true, initialState: 'draft' },
  { name: 'Standard', desc: undefined, active: false, initialState: 'pending' },
];

const baseProps = {
  workflows: sampleSummaries,
  loading: false,
  onEdit: vi.fn(),
  onDuplicate: vi.fn(),
  onRename: vi.fn(),
  onDeactivate: vi.fn(),
  onActivate: vi.fn(),
  onDelete: vi.fn(),
};

describe('WorkflowsTable', () => {
  beforeEach(() => {
    baseProps.onEdit = vi.fn();
    baseProps.onDuplicate = vi.fn();
    baseProps.onRename = vi.fn();
    baseProps.onDeactivate = vi.fn();
    baseProps.onActivate = vi.fn();
    baseProps.onDelete = vi.fn();
  });

  it('renders one row per workflow with name, description, active status, initial state', () => {
    renderWithApp(<WorkflowsTable {...baseProps} />);

    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Premium customers')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('renders an empty placeholder when workflows is empty', () => {
    renderWithApp(<WorkflowsTable {...baseProps} workflows={[]} />);
    expect(screen.getByText(/no workflows/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/components/cloud-workflows/WorkflowsTable.test.tsx
```

Expected: fails with `Failed to resolve import "./WorkflowsTable"`.

- [ ] **Step 3: Implement the table**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/components/cloud-workflows/WorkflowsTable.tsx`:

```tsx
/**
 * WorkflowsTable — Stage-B presentation component.
 *
 * Receives an array of WorkflowSummary plus per-row action handlers from the page.
 * The Delete button is disabled when only one workflow remains (≥1 invariant)
 * to surface the constraint client-side; the gateway also enforces it.
 */

import React from 'react';
import { Table, Button, Space, Tag, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { WorkflowSummary } from '../../gateways';

export interface WorkflowsTableProps {
  workflows: WorkflowSummary[];
  loading: boolean;
  onEdit: (name: string) => void;
  onDuplicate: (name: string) => void;
  onRename: (name: string) => void;
  onDeactivate: (name: string) => void;
  onActivate: (name: string) => void;
  onDelete: (name: string) => void;
}

export const WorkflowsTable: React.FC<WorkflowsTableProps> = ({
  workflows,
  loading,
  onEdit,
  onDuplicate,
  onRename,
  onDeactivate,
  onActivate,
  onDelete,
}) => {
  const onlyOne = workflows.length === 1;

  const columns: ColumnsType<WorkflowSummary> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Description',
      dataIndex: 'desc',
      key: 'desc',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (v?: boolean) =>
        v ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
    },
    {
      title: 'Initial state',
      dataIndex: 'initialState',
      key: 'initialState',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_v, row) => (
        <Space>
          <Button size="small" onClick={() => onEdit(row.name)}>
            Edit
          </Button>
          <Button size="small" onClick={() => onDuplicate(row.name)}>
            Duplicate
          </Button>
          <Button size="small" onClick={() => onRename(row.name)}>
            Rename
          </Button>
          {row.active ? (
            <Button size="small" onClick={() => onDeactivate(row.name)}>
              Deactivate
            </Button>
          ) : (
            <Button size="small" onClick={() => onActivate(row.name)}>
              Activate
            </Button>
          )}
          <Button
            size="small"
            danger
            disabled={onlyOne}
            title={
              onlyOne
                ? 'A model must have at least one workflow — cannot delete the last one.'
                : undefined
            }
            onClick={() => onDelete(row.name)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  if (workflows.length === 0 && !loading) {
    return <Empty description="No workflows in this model" />;
  }

  return (
    <Table
      rowKey="name"
      columns={columns}
      dataSource={workflows}
      loading={loading}
      pagination={false}
    />
  );
};
```

- [ ] **Step 4: Run to verify the tests pass**

```bash
pnpm exec vitest run packages/statemachine-react/src/components/cloud-workflows/WorkflowsTable.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/components/cloud-workflows/WorkflowsTable.tsx \
        packages/statemachine-react/src/components/cloud-workflows/WorkflowsTable.test.tsx
git commit -m "feat(statemachine-react): scaffold WorkflowsTable with columns and empty state"
```

### Task 11: WorkflowsTable — row action callbacks

**Files:**
- Modify: `packages/statemachine-react/src/components/cloud-workflows/WorkflowsTable.test.tsx`

- [ ] **Step 1: Write the failing tests**

Append before the outer closing `});`:

```tsx
  it('Edit button click invokes onEdit with the row name', async () => {
    renderWithApp(<WorkflowsTable {...baseProps} />);

    const editButtons = screen.getAllByRole('button', { name: /^Edit$/ });
    await userEvent.click(editButtons[0]);

    expect(baseProps.onEdit).toHaveBeenCalledWith('Premium');
  });

  it('Duplicate button click invokes onDuplicate', async () => {
    renderWithApp(<WorkflowsTable {...baseProps} />);

    const buttons = screen.getAllByRole('button', { name: /^Duplicate$/ });
    await userEvent.click(buttons[1]); // Standard's Duplicate

    expect(baseProps.onDuplicate).toHaveBeenCalledWith('Standard');
  });

  it('Rename button click invokes onRename', async () => {
    renderWithApp(<WorkflowsTable {...baseProps} />);

    const buttons = screen.getAllByRole('button', { name: /^Rename$/ });
    await userEvent.click(buttons[0]);

    expect(baseProps.onRename).toHaveBeenCalledWith('Premium');
  });

  it('shows Deactivate for active workflow and Activate for inactive', async () => {
    renderWithApp(<WorkflowsTable {...baseProps} />);

    // Premium is active → has Deactivate
    expect(screen.getAllByRole('button', { name: /^Deactivate$/ })).toHaveLength(1);
    // Standard is inactive → has Activate
    expect(screen.getAllByRole('button', { name: /^Activate$/ })).toHaveLength(1);
  });

  it('Deactivate button invokes onDeactivate; Activate invokes onActivate', async () => {
    renderWithApp(<WorkflowsTable {...baseProps} />);

    await userEvent.click(screen.getByRole('button', { name: /^Deactivate$/ }));
    expect(baseProps.onDeactivate).toHaveBeenCalledWith('Premium');

    await userEvent.click(screen.getByRole('button', { name: /^Activate$/ }));
    expect(baseProps.onActivate).toHaveBeenCalledWith('Standard');
  });

  it('Delete button is disabled when there is only one workflow (>=1 invariant)', () => {
    const onlyOne = sampleSummaries.slice(0, 1);
    renderWithApp(<WorkflowsTable {...baseProps} workflows={onlyOne} />);

    const deleteBtn = screen.getByRole('button', { name: /^Delete$/ });
    expect(deleteBtn).toBeDisabled();
  });

  it('Delete button is enabled when there are >=2 workflows; click invokes onDelete', async () => {
    renderWithApp(<WorkflowsTable {...baseProps} />);

    const deleteButtons = screen.getAllByRole('button', { name: /^Delete$/ });
    expect(deleteButtons[0]).toBeEnabled();
    await userEvent.click(deleteButtons[0]);

    expect(baseProps.onDelete).toHaveBeenCalledWith('Premium');
  });
```

- [ ] **Step 2: Run the new tests**

```bash
pnpm exec vitest run packages/statemachine-react/src/components/cloud-workflows/WorkflowsTable.test.tsx
```

Expected: all 9 tests pass (2 from Task 10 + 7 new ones).

- [ ] **Step 3: Commit**

```bash
git add packages/statemachine-react/src/components/cloud-workflows/WorkflowsTable.test.tsx
git commit -m "test(statemachine-react): cover WorkflowsTable row actions and >=1 invariant"
```

---

## WorkflowsCloud page

The page composes ModelPicker + WorkflowsTable + the two dialogs, drives the URL state, wires action handlers to the gateway-backed mutation hooks.

### Task 12: WorkflowsCloud page — bootstrap

**Files:**
- Create: `packages/statemachine-react/src/pages/WorkflowsCloud.tsx`
- Create: `packages/statemachine-react/src/pages/WorkflowsCloud.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/pages/WorkflowsCloud.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { App } from 'antd';
import { WorkflowsCloud } from './WorkflowsCloud';
import { useEntityModelList, useWorkflowsList } from '../hooks/useStatemachine';

vi.mock('../hooks/useStatemachine', async () => {
  const actual = await vi.importActual<any>('../hooks/useStatemachine');
  return {
    ...actual,
    useEntityModelList: vi.fn(),
    useWorkflowsList: vi.fn(),
  };
});

function renderPage(initialPath: string = '/workflows') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialPath]}>
        <App>
          <WorkflowsCloud />
        </App>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('WorkflowsCloud', () => {
  beforeEach(() => {
    vi.mocked(useEntityModelList).mockReset();
    vi.mocked(useWorkflowsList).mockReset();
  });

  it('renders the model picker', () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);
    vi.mocked(useWorkflowsList).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    renderPage();

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
pnpm exec vitest run packages/statemachine-react/src/pages/WorkflowsCloud.test.tsx
```

Expected: fails with `Failed to resolve import "./WorkflowsCloud"`.

- [ ] **Step 3: Implement the page skeleton**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/pages/WorkflowsCloud.tsx`:

```tsx
/**
 * WorkflowsCloud — the cloud Workflows list page (sub-branch 3).
 *
 * Two-stage UX:
 *   - Stage A: ModelPicker selects (entityName, modelVersion).
 *   - Stage B: WorkflowsTable lists the workflows for that model with row actions.
 *
 * URL state: ?entityName=...&modelVersion=... persists the selection so reload
 * and deep links work. The selectedModelRef is mirrored into statemachineStore
 * so other pages can read it.
 */

import React from 'react';
import { Space, Typography } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { ModelPicker } from '../components/cloud-workflows/ModelPicker';
import { WorkflowsTable } from '../components/cloud-workflows/WorkflowsTable';
import { useWorkflowsList } from '../hooks/useStatemachine';
import type { ModelRef } from '../gateways';

const { Title, Paragraph } = Typography;

function readModelRefFromUrl(params: URLSearchParams): ModelRef | null {
  const entityName = params.get('entityName');
  const versionStr = params.get('modelVersion');
  if (!entityName || !versionStr) return null;
  const v = parseInt(versionStr, 10);
  if (Number.isNaN(v)) return null;
  return { entityName, modelVersion: v };
}

export const WorkflowsCloud: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const modelRef = readModelRefFromUrl(searchParams);

  const setModelRef = (next: ModelRef | null) => {
    if (next === null) {
      setSearchParams({}, { replace: false });
    } else {
      setSearchParams(
        { entityName: next.entityName, modelVersion: String(next.modelVersion) },
        { replace: false }
      );
    }
  };

  const workflowsQuery = useWorkflowsList(modelRef);
  const workflows = workflowsQuery.data ?? [];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Workflows</Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Paragraph>Select an entity model to view its workflows.</Paragraph>
          <ModelPicker value={modelRef} onChange={setModelRef} />
        </div>

        {modelRef && (
          <WorkflowsTable
            workflows={workflows}
            loading={workflowsQuery.isLoading}
            onEdit={(name) => {
              // TODO(task-15): navigate to /workflow/:entityName/:modelVersion/:name
              console.warn('Edit not wired yet:', name);
            }}
            onDuplicate={(name) => {
              console.warn('Duplicate not wired yet:', name);
            }}
            onRename={(name) => {
              console.warn('Rename not wired yet:', name);
            }}
            onDeactivate={(name) => {
              console.warn('Deactivate not wired yet:', name);
            }}
            onActivate={(name) => {
              console.warn('Activate not wired yet:', name);
            }}
            onDelete={(name) => {
              console.warn('Delete not wired yet:', name);
            }}
          />
        )}
      </Space>
    </div>
  );
};
```

- [ ] **Step 4: Run to verify the bootstrap test passes**

```bash
pnpm exec vitest run packages/statemachine-react/src/pages/WorkflowsCloud.test.tsx
```

Expected: 1 test passes.

- [ ] **Step 5: Commit**

```bash
git add packages/statemachine-react/src/pages/WorkflowsCloud.tsx \
        packages/statemachine-react/src/pages/WorkflowsCloud.test.tsx
git commit -m "feat(statemachine-react): scaffold WorkflowsCloud page with ModelPicker + table"
```

### Task 13: WorkflowsCloud page — URL state persistence

**Files:**
- Modify: `packages/statemachine-react/src/pages/WorkflowsCloud.test.tsx`

- [ ] **Step 1: Write the failing tests**

Append before the outer closing `});`:

```tsx
  it('initializes from ?entityName + ?modelVersion in the URL', async () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);
    vi.mocked(useWorkflowsList).mockReturnValue({
      data: [
        { name: 'Premium', desc: undefined, active: true, initialState: 'draft' },
      ],
      isLoading: false,
    } as any);

    renderPage('/workflows?entityName=Customer&modelVersion=1');

    // The table should render because modelRef was read from the URL.
    await waitFor(() => {
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });
    // Hook was called with the parsed modelRef.
    expect(useWorkflowsList).toHaveBeenCalledWith({ entityName: 'Customer', modelVersion: 1 });
  });

  it('does not render the table if the URL has no model ref', () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);
    vi.mocked(useWorkflowsList).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    renderPage('/workflows');

    expect(screen.queryByText(/no workflows/i)).not.toBeInTheDocument();
  });

  it('passes null to useWorkflowsList when no model is selected', () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);
    vi.mocked(useWorkflowsList).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    renderPage('/workflows');

    expect(useWorkflowsList).toHaveBeenCalledWith(null);
  });
```

- [ ] **Step 2: Run to verify the new tests pass**

```bash
pnpm exec vitest run packages/statemachine-react/src/pages/WorkflowsCloud.test.tsx
```

Expected: all 4 tests pass (1 from Task 12 + 3 new ones). The implementation already satisfies them.

- [ ] **Step 3: Commit**

```bash
git add packages/statemachine-react/src/pages/WorkflowsCloud.test.tsx
git commit -m "test(statemachine-react): cover WorkflowsCloud URL-state initialization"
```

### Task 14: WorkflowsCloud page — wire row actions to mutations and dialogs

**Files:**
- Modify: `packages/statemachine-react/src/pages/WorkflowsCloud.tsx`
- Modify: `packages/statemachine-react/src/pages/WorkflowsCloud.test.tsx`

- [ ] **Step 1: Write the failing tests**

Append to the test file before the outer closing `});`:

```tsx
  it('Duplicate row action opens the NameInputDialog', async () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);
    vi.mocked(useWorkflowsList).mockReturnValue({
      data: [
        { name: 'Premium', desc: undefined, active: true, initialState: 'draft' },
      ],
      isLoading: false,
    } as any);

    renderPage('/workflows?entityName=Customer&modelVersion=1');

    await userEvent.click(screen.getByRole('button', { name: /^Duplicate$/ }));
    await waitFor(() => {
      expect(screen.getByText('Duplicate workflow "Premium"')).toBeInTheDocument();
    });
  });

  it('Rename row action opens the NameInputDialog with the source name pre-filled', async () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);
    vi.mocked(useWorkflowsList).mockReturnValue({
      data: [
        { name: 'Premium', desc: undefined, active: true, initialState: 'draft' },
      ],
      isLoading: false,
    } as any);

    renderPage('/workflows?entityName=Customer&modelVersion=1');

    await userEvent.click(screen.getByRole('button', { name: /^Rename$/ }));
    await waitFor(() => {
      expect(screen.getByText('Rename workflow "Premium"')).toBeInTheDocument();
      expect(screen.getByLabelText(/new name/i)).toHaveValue('Premium');
    });
  });

  it('Delete row action opens the DeleteWorkflowDialog with the kept-list', async () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);
    vi.mocked(useWorkflowsList).mockReturnValue({
      data: [
        { name: 'Premium', desc: undefined, active: true, initialState: 'draft' },
        { name: 'Standard', desc: undefined, active: false, initialState: 'pending' },
      ],
      isLoading: false,
      dataUpdatedAt: Date.now(),
    } as any);

    renderPage('/workflows?entityName=Customer&modelVersion=1');

    const deleteButtons = await screen.findAllByRole('button', { name: /^Delete$/ });
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      // Dialog title mentions the target.
      expect(screen.getByText(/Delete workflow "Premium"/)).toBeInTheDocument();
      // Kept-list shows the remaining workflow.
      expect(screen.getByText('Standard')).toBeInTheDocument();
    });
  });
```

You'll need to import `userEvent`:

```ts
import userEvent from '@testing-library/user-event';
```

…at the top of the test file if it isn't already.

- [ ] **Step 2: Run to verify the tests fail**

```bash
pnpm exec vitest run packages/statemachine-react/src/pages/WorkflowsCloud.test.tsx -t "row action"
```

Expected: tests fail because the page's row-action handlers currently just `console.warn`.

- [ ] **Step 3: Wire the row actions in `WorkflowsCloud.tsx`**

In `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/pages/WorkflowsCloud.tsx`, replace the entire file with:

```tsx
/**
 * WorkflowsCloud — the cloud Workflows list page (sub-branch 3).
 *
 * Two-stage UX:
 *   - Stage A: ModelPicker selects (entityName, modelVersion).
 *   - Stage B: WorkflowsTable lists the workflows for that model with row actions.
 *
 * URL state: ?entityName=...&modelVersion=... persists the selection so reload
 * and deep links work.
 *
 * Row actions dispatch through the gateway-backed React Query hooks:
 *   - Edit       → navigate to the cloud editor route (placeholder until sub-branch 4)
 *   - Duplicate  → NameInputDialog → useCopyWorkflow
 *   - Rename     → NameInputDialog (initial = source name) → useRenameWorkflow
 *   - Deactivate → useUpdateWorkflow with active: false
 *   - Activate   → useUpdateWorkflow with active: true
 *   - Delete     → DeleteWorkflowDialog → useDeleteWorkflow
 */

import React, { useState } from 'react';
import { Space, Typography, App as AntApp } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ModelPicker } from '../components/cloud-workflows/ModelPicker';
import { WorkflowsTable } from '../components/cloud-workflows/WorkflowsTable';
import { NameInputDialog } from '../components/cloud-workflows/NameInputDialog';
import { DeleteWorkflowDialog } from '../components/cloud-workflows/DeleteWorkflowDialog';
import {
  useWorkflowsList,
  useCopyWorkflow,
  useRenameWorkflow,
  useUpdateWorkflow,
  useDeleteWorkflow,
} from '../hooks/useStatemachine';
import { getWorkflowGateway } from '../gateways';
import type { ModelRef } from '../gateways';

const { Title, Paragraph } = Typography;

function readModelRefFromUrl(params: URLSearchParams): ModelRef | null {
  const entityName = params.get('entityName');
  const versionStr = params.get('modelVersion');
  if (!entityName || !versionStr) return null;
  const v = parseInt(versionStr, 10);
  if (Number.isNaN(v)) return null;
  return { entityName, modelVersion: v };
}

type DialogState =
  | { kind: 'none' }
  | { kind: 'duplicate'; sourceName: string }
  | { kind: 'rename'; oldName: string }
  | { kind: 'delete'; targetName: string };

export const WorkflowsCloud: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const modelRef = readModelRefFromUrl(searchParams);

  const setModelRef = (next: ModelRef | null) => {
    if (next === null) {
      setSearchParams({}, { replace: false });
    } else {
      setSearchParams(
        { entityName: next.entityName, modelVersion: String(next.modelVersion) },
        { replace: false }
      );
    }
  };

  const { message } = AntApp.useApp();
  const workflowsQuery = useWorkflowsList(modelRef);
  const workflows = workflowsQuery.data ?? [];

  const copyMutation = useCopyWorkflow();
  const renameMutation = useRenameWorkflow();
  const updateMutation = useUpdateWorkflow();
  const deleteMutation = useDeleteWorkflow();

  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });

  const closeDialog = () => setDialog({ kind: 'none' });

  // For Deactivate / Activate we need the full doc to MERGE-save with active toggled.
  // Pull on-demand: when a row's button is clicked we load the doc, then save.
  const handleActiveToggle = async (name: string, active: boolean) => {
    if (!modelRef) return;
    try {
      const gateway = getWorkflowGateway();
      const doc = await gateway.loadWorkflow(modelRef, name);
      await updateMutation.mutateAsync({ modelRef, doc: { ...doc, active } });
      message.success(active ? `Activated "${name}"` : `Deactivated "${name}"`);
    } catch (err) {
      message.error(`Failed to ${active ? 'activate' : 'deactivate'} "${name}": ${(err as Error).message}`);
    }
  };

  const handleEdit = (name: string) => {
    if (!modelRef) return;
    navigate(`/workflow/${encodeURIComponent(modelRef.entityName)}/${modelRef.modelVersion}/${encodeURIComponent(name)}`);
  };

  const handleDuplicateConfirm = async (newName: string) => {
    if (dialog.kind !== 'duplicate' || !modelRef) return;
    try {
      await copyMutation.mutateAsync({
        modelRef,
        sourceName: dialog.sourceName,
        newName,
      });
      message.success(`Copied "${dialog.sourceName}" to "${newName}"`);
      closeDialog();
    } catch (err) {
      message.error(`Copy failed: ${(err as Error).message}`);
    }
  };

  const handleRenameConfirm = async (newName: string) => {
    if (dialog.kind !== 'rename' || !modelRef) return;
    try {
      await renameMutation.mutateAsync({
        modelRef,
        oldName: dialog.oldName,
        newName,
      });
      message.success(`Renamed "${dialog.oldName}" to "${newName}"`);
      closeDialog();
    } catch (err) {
      message.error(`Rename failed: ${(err as Error).message}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (dialog.kind !== 'delete' || !modelRef) return;
    try {
      await deleteMutation.mutateAsync({ modelRef, name: dialog.targetName });
      message.success(`Deleted "${dialog.targetName}"`);
      closeDialog();
    } catch (err) {
      message.error(`Delete failed: ${(err as Error).message}`);
    }
  };

  const existingNames = workflows.map((w) => w.name);

  // Snapshot timestamp for the disruptive delete dialog.
  const snapshotAt = workflowsQuery.dataUpdatedAt
    ? new Date(workflowsQuery.dataUpdatedAt)
    : new Date();

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Workflows</Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Paragraph>Select an entity model to view its workflows.</Paragraph>
          <ModelPicker value={modelRef} onChange={setModelRef} />
        </div>

        {modelRef && (
          <WorkflowsTable
            workflows={workflows}
            loading={workflowsQuery.isLoading}
            onEdit={handleEdit}
            onDuplicate={(name) => setDialog({ kind: 'duplicate', sourceName: name })}
            onRename={(name) => setDialog({ kind: 'rename', oldName: name })}
            onDeactivate={(name) => handleActiveToggle(name, false)}
            onActivate={(name) => handleActiveToggle(name, true)}
            onDelete={(name) => setDialog({ kind: 'delete', targetName: name })}
          />
        )}
      </Space>

      {dialog.kind === 'duplicate' && (
        <NameInputDialog
          open
          title={`Duplicate workflow "${dialog.sourceName}"`}
          existingNames={existingNames}
          onSubmit={handleDuplicateConfirm}
          onCancel={closeDialog}
        />
      )}

      {dialog.kind === 'rename' && (
        <NameInputDialog
          open
          title={`Rename workflow "${dialog.oldName}"`}
          existingNames={existingNames.filter((n) => n !== dialog.oldName)}
          initialValue={dialog.oldName}
          onSubmit={handleRenameConfirm}
          onCancel={closeDialog}
        />
      )}

      {dialog.kind === 'delete' && (
        <DeleteWorkflowDialog
          open
          targetName={dialog.targetName}
          keptNames={existingNames.filter((n) => n !== dialog.targetName)}
          snapshotAt={snapshotAt}
          onConfirm={handleDeleteConfirm}
          onCancel={closeDialog}
          onRefresh={() => {
            workflowsQuery.refetch();
          }}
        />
      )}
    </div>
  );
};
```

- [ ] **Step 4: Run the row-action tests**

```bash
pnpm exec vitest run packages/statemachine-react/src/pages/WorkflowsCloud.test.tsx -t "row action"
```

Expected: 3 tests pass (Duplicate, Rename, Delete dialog opening).

- [ ] **Step 5: Run the full file**

```bash
pnpm exec vitest run packages/statemachine-react/src/pages/WorkflowsCloud.test.tsx
```

Expected: 7 tests pass (4 from earlier + 3 new).

- [ ] **Step 6: Commit**

```bash
git add packages/statemachine-react/src/pages/WorkflowsCloud.tsx \
        packages/statemachine-react/src/pages/WorkflowsCloud.test.tsx
git commit -m "feat(statemachine-react): WorkflowsCloud wires row actions to mutations + dialogs"
```

---

## Cloud editor route placeholder

The Edit row-action and Create flows navigate to cloud editor routes that don't exist yet. We register a thin placeholder page so navigation works during sub-branch 3 testing.

### Task 15: WorkflowEditorCloudPlaceholder

**Files:**
- Create: `packages/statemachine-react/src/pages/WorkflowEditorCloudPlaceholder.tsx`

No test for this — it's a static placeholder.

- [ ] **Step 1: Implement the placeholder**

Create `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/pages/WorkflowEditorCloudPlaceholder.tsx`:

```tsx
/**
 * WorkflowEditorCloudPlaceholder — temporary page rendered at
 *   /workflow/:entityName/:modelVersion/:workflowName
 *   /workflow/:entityName/:modelVersion/new
 *
 * Sub-branch 4 replaces this with the real cloud workflow editor. This
 * placeholder is here so Edit and Create navigation from the Workflows page
 * has a target that confirms the route params were threaded correctly.
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Space, Result } from 'antd';

const { Title, Text, Paragraph } = Typography;

export const WorkflowEditorCloudPlaceholder: React.FC = () => {
  const params = useParams<{ entityName: string; modelVersion: string; workflowName?: string }>();
  const isNew = params.workflowName === undefined;

  return (
    <div style={{ padding: 24 }}>
      <Result
        status="info"
        title={isNew ? 'Create new workflow (placeholder)' : 'Edit workflow (placeholder)'}
        subTitle="The cloud workflow editor lands in sub-branch 4."
        extra={
          <Space direction="vertical">
            <Title level={5}>Route params</Title>
            <Text>
              entityName: <Text code>{params.entityName}</Text>
            </Text>
            <Text>
              modelVersion: <Text code>{params.modelVersion}</Text>
            </Text>
            {!isNew && (
              <Text>
                workflowName: <Text code>{params.workflowName}</Text>
              </Text>
            )}
            <Paragraph>
              <Link to="/workflows">← Back to workflows</Link>
            </Paragraph>
          </Space>
        }
      />
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add packages/statemachine-react/src/pages/WorkflowEditorCloudPlaceholder.tsx
git commit -m "feat(statemachine-react): add WorkflowEditorCloudPlaceholder page

Sub-branch 4 will replace this with the real cloud editor. The placeholder
confirms route params are threaded correctly so Edit/Create navigation can
be tested today."
```

### Task 16: Register the cloud editor routes in saas-app

**Files:**
- Modify: `apps/saas-app/src/routes/index.tsx`

- [ ] **Step 1: Add the lazy import**

In `/Users/paul/dev/cyoda-env-dashboard/apps/saas-app/src/routes/index.tsx`, find the existing block of `React.lazy(() => import('@cyoda/statemachine-react')...)` imports near the top. After the existing `Workflows` import, add:

```tsx
const WorkflowEditorCloudPlaceholder = React.lazy(() =>
  import('@cyoda/statemachine-react').then((m) => ({ default: m.WorkflowEditorCloudPlaceholder }))
);
```

- [ ] **Step 2: Add the routes**

In the same file, find the existing Lifecycle route block (around the existing `<Route path="workflows" element={<Workflows />} />` line). Add the cloud editor routes after the legacy `/workflow/...` routes, gated by `isCyodaCloud()`:

```tsx
        {/* Cloud workflow editor (placeholder in sub-branch 3; real editor in sub-branch 4) */}
        {HelperFeatureFlags.isCyodaCloud() && (
          <>
            <Route
              path="workflow/:entityName/:modelVersion/new"
              element={<WorkflowEditorCloudPlaceholder />}
            />
            <Route
              path="workflow/:entityName/:modelVersion/:workflowName"
              element={<WorkflowEditorCloudPlaceholder />}
            />
          </>
        )}
```

If `HelperFeatureFlags` isn't already imported in the file, add:

```tsx
import { HelperFeatureFlags } from '@cyoda/http-api-react';
```

…to the top imports.

- [ ] **Step 3: Type-check**

```bash
pnpm exec tsc --noEmit -p apps/saas-app/tsconfig.json 2>&1 | grep -E "routes/index" | head -5
```

Expected: no output (no new errors). The pre-existing 161 errors elsewhere in the package are unchanged.

- [ ] **Step 4: Commit**

```bash
git add apps/saas-app/src/routes/index.tsx
git commit -m "feat(saas-app): register cloud workflow editor routes (placeholder)

Routes /workflow/:entityName/:modelVersion/new and
/workflow/:entityName/:modelVersion/:workflowName are registered under
isCyodaCloud() gating, pointing to WorkflowEditorCloudPlaceholder until
sub-branch 4 lands the real editor."
```

---

## Replace the stub and clean up

### Task 17: Switch Workflows.tsx to render WorkflowsCloud

**Files:**
- Modify: `packages/statemachine-react/src/pages/Workflows.tsx`

- [ ] **Step 1: Update the import and the early return**

In `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/pages/Workflows.tsx`, find:

```tsx
import { WorkflowsCloudStub } from './WorkflowsCloudStub';
```

Replace with:

```tsx
import { WorkflowsCloud } from './WorkflowsCloud';
```

Then find the early return:

```tsx
  if (HelperFeatureFlags.isCyodaCloud()) {
    return <WorkflowsCloudStub />;
  }
```

Replace with:

```tsx
  if (HelperFeatureFlags.isCyodaCloud()) {
    return <WorkflowsCloud />;
  }
```

- [ ] **Step 2: Verify the legacy Workflows tests still pass**

```bash
pnpm exec vitest run packages/statemachine-react/src/pages/Workflows.test.tsx
```

Expected: every legacy test passes (the legacy tests don't set `IS_CYODA_CLOUD=true`, so the early return doesn't fire and the legacy code path renders).

- [ ] **Step 3: Commit**

```bash
git add packages/statemachine-react/src/pages/Workflows.tsx
git commit -m "feat(statemachine-react): render WorkflowsCloud in cloud mode (replaces stub)"
```

### Task 18: Update package barrel exports

**Files:**
- Modify: `packages/statemachine-react/src/index.ts`

- [ ] **Step 1: Replace the stub export and add the new pages**

In `/Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/index.ts`, find:

```ts
export { WorkflowsCloudStub } from './pages/WorkflowsCloudStub';
```

Replace with:

```ts
export { WorkflowsCloud } from './pages/WorkflowsCloud';
export { WorkflowEditorCloudPlaceholder } from './pages/WorkflowEditorCloudPlaceholder';
```

- [ ] **Step 2: Commit**

```bash
git add packages/statemachine-react/src/index.ts
git commit -m "feat(statemachine-react): re-export WorkflowsCloud + WorkflowEditorCloudPlaceholder"
```

### Task 19: Delete the stub files

**Files:**
- Delete: `packages/statemachine-react/src/pages/WorkflowsCloudStub.tsx`
- Delete: `packages/statemachine-react/src/pages/WorkflowsCloudStub.test.tsx`

- [ ] **Step 1: Delete the files**

```bash
rm /Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/pages/WorkflowsCloudStub.tsx
rm /Users/paul/dev/cyoda-env-dashboard/packages/statemachine-react/src/pages/WorkflowsCloudStub.test.tsx
```

- [ ] **Step 2: Verify nothing else still imports the stub**

```bash
grep -rn "WorkflowsCloudStub" /Users/paul/dev/cyoda-env-dashboard/packages /Users/paul/dev/cyoda-env-dashboard/apps 2>/dev/null
```

Expected: no output (every reference was already replaced in Tasks 17 and 18).

- [ ] **Step 3: Commit**

```bash
git add -A packages/statemachine-react/src/pages/WorkflowsCloudStub.tsx \
          packages/statemachine-react/src/pages/WorkflowsCloudStub.test.tsx
git commit -m "chore(statemachine-react): remove WorkflowsCloudStub (replaced by WorkflowsCloud)"
```

---

## Verification

### Task 20: Full automated verification

**Files:** none modified

- [ ] **Step 1: Run all directly-affected test files**

```bash
pnpm exec vitest run \
  packages/statemachine-react/src/gateways \
  packages/statemachine-react/src/hooks/useStatemachine.test.tsx \
  packages/statemachine-react/src/components/cloud-workflows \
  packages/statemachine-react/src/pages/WorkflowsCloud.test.tsx \
  packages/statemachine-react/src/pages/Workflows.test.tsx \
  packages/statemachine-react/src/__tests__/edge-cases/error-handling.test.tsx \
  packages/http-api-react/src/api/entities.test.ts
```

Expected: every test passes. Capture pass/fail counts.

- [ ] **Step 2: Run the full statemachine-react suite**

```bash
pnpm exec vitest run packages/statemachine-react
```

Expected: every test passes that was passing on `feature/cyoda-go-support` parent. Pre-existing failures (`StateIndicator` snapshots, `GraphicalStateMachine/{layouts,utils}.test.ts`, `useEntity.test.tsx`, `InstanceDetail.test.tsx`) are tolerated.

- [ ] **Step 3: Type-check unchanged**

```bash
pnpm exec tsc --noEmit -p packages/statemachine-react/tsconfig.json 2>&1 | grep -c "^packages/statemachine-react"
```

Expected: roughly 77 (same as parent). Compare with the parent baseline by checking out `feature/cyoda-go-support` briefly if needed.

- [ ] **Step 4: Confirm git status**

```bash
git status
git log --oneline feature/cyoda-go-support..HEAD | head -25
```

Expected: `git status` shows only the unrelated `docs/cyoda-cloud/api/*` modifications. The log shows ~20 commits matching the task list.

### Task 21: Push and open the PR

**Files:** none

- [ ] **Step 1: Push the sub-branch**

```bash
git push -u origin feature/cyoda-go-support-cloud-workflows-list
```

If the credential helper prompts, use the same token-env workaround prior sub-branches used.

- [ ] **Step 2: Open the PR against the parent feature branch**

```bash
gh pr create \
  --base feature/cyoda-go-support \
  --head feature/cyoda-go-support-cloud-workflows-list \
  --title "Cloud Workflows list: real page with model picker, table, row actions" \
  --body "$(cat <<'EOF'
## Summary

Sub-branch 3 of 7 of the cyoda-go support build. Replaces the `WorkflowsCloudStub` with the real cloud Workflows list page:

- **Model picker** (Stage A) — searchable Ant Design Select backed by `GET /model/`. Lists `(modelName, modelVersion)` pairs sorted by `modelUpdateDate` desc.
- **Workflows table** (Stage B) — Ant Design Table with columns name, description, active status, initial state, plus per-row Edit / Duplicate / Rename / Deactivate / Activate / Delete buttons.
- **NameInputDialog** — reusable name-input modal for Duplicate and Rename. Validates uniqueness client-side.
- **DeleteWorkflowDialog** — disruptive delete UX per spec §5.4: lists kept workflows, shows snapshot timestamp, requires typing the target name to enable Delete, has a Refresh-snapshot button.
- **URL state persistence** — `?entityName=...&modelVersion=...` reflects the picker selection. Reload and deep links work.
- **Cloud editor route placeholder** — `/workflow/:entityName/:modelVersion/new` and `/workflow/:entityName/:modelVersion/:workflowName` registered, pointing to `WorkflowEditorCloudPlaceholder`. Sub-branch 4 replaces the placeholder.
- **Spec correction** — §5.2 now references `GET /model/` instead of the platform-only models-info endpoint (real-world testing surfaced the cloud-native one).

## What landed

- `getEntityModelList()` API + `useEntityModelList()` hook + `EntityModelListItem` type.
- `ModelPicker`, `WorkflowsTable`, `NameInputDialog`, `DeleteWorkflowDialog` components in `packages/statemachine-react/src/components/cloud-workflows/` with comprehensive unit tests.
- `WorkflowsCloud` page composing them all.
- `WorkflowEditorCloudPlaceholder` page (replaced in sub-branch 4).
- `Workflows.tsx` early-return now renders `WorkflowsCloud` (not the stub).
- `WorkflowsCloudStub.tsx` and its test deleted.

## Behavior changes worth flagging

- The cyoda cloud picker calls `GET /model/`. Cyoda-cloud and cyoda-go both support this; legacy mode (no `IS_CYODA_CLOUD`) doesn't reach this page.
- Row actions now use the gateway-backed mutation hooks (`useCopyWorkflow`, `useRenameWorkflow`, `useUpdateWorkflow`, `useDeleteWorkflow`) introduced in sub-branch 2.
- Activate / Deactivate use `useUpdateWorkflow` after first loading the doc via `gateway.loadWorkflow` so we MERGE-save the full doc with `active` toggled rather than synthesizing a partial doc.

## Spec / plan

- Design: `docs/superpowers/specs/2026-04-16-cyoda-go-support-design.md` §5.2, §5.4, §5.5, §5.6, §5.7, §6.3, §9.2 sub-branch 3.
- Implementation plan: `docs/superpowers/plans/2026-04-16-cyoda-go-cloud-workflows-list.md`.

## Test plan

- [x] All component test files green (ModelPicker, WorkflowsTable, NameInputDialog, DeleteWorkflowDialog).
- [x] WorkflowsCloud page test green.
- [x] Hooks + gateway tests green.
- [x] Legacy Workflows.test.tsx unchanged.
- [x] Type-check error count unchanged.
- [ ] Manual smoke against cyoda cloud: navigate to `/workflows`, select a model from the picker, confirm workflows render, exercise each row action (Duplicate, Rename, Activate/Deactivate, Delete with the disruptive dialog). **Reviewer to verify.**
- [ ] Manual smoke (legacy mode): existing legacy Workflows page renders unchanged.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Verify the PR opened cleanly**

```bash
gh pr view --json number,url,baseRefName,headRefName,state
```

Confirm: base is `feature/cyoda-go-support`, head is `feature/cyoda-go-support-cloud-workflows-list`, state is `OPEN`.

---

## Done

When this PR merges into `feature/cyoda-go-support`, sub-branch 3 is complete. Sub-branch 4 (cloud workflow editor — replaces `WorkflowEditorCloudPlaceholder`) gets its own plan when ready.
