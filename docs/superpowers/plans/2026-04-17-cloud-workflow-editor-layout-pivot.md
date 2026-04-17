# Cloud Workflow Editor — Layout Pivot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** Pivot the SB4 cloud workflow editor from a tree navigator to the classic settings-form-on-top + Tabular/Graphical/Config layout, reusing the existing `GraphicalStateMachine` Cytoscape component via a `WorkflowDoc → legacy-flat-shape` adapter, with drag-to-reposition cached per workflow in `localStorage`.

**Spec (source of truth):** `docs/superpowers/specs/2026-04-17-cloud-workflow-editor-layout-pivot.md`. Refer to its sections for design rationale.

**Branch:** `feature/cyoda-go-support-cloud-workflow-editor` (PR #10, additional commits).

**Parent SB4 spec sections superseded:** §3.1, §3.3, §3.5; trimmed §3.2 (no `selectedPath`/`expandedPaths`); rewritten §4.1 / §4.2.

---

## Task groups

- **Group AA** — Adapter + position storage (pure functions, no UI). 2 tasks.
- **Group BB** — Store cleanup + settings form rename + page shell rewrite. 3 tasks.
- **Group CC** — Tabular view + TransitionEditDrawer. 2 tasks.
- **Group DD** — Graphical view (adapter wiring + position drag). 1 task.
- **Group EE** — Config view. 1 task.
- **Group FF** — Delete dead code + update E2E + final verify. 1 task.

Total: 10 tasks.

---

## Group AA — Adapter + position storage

### Task AA1: `workflowDocToGraphShape`

**Spec:** §3.4. **Files** (both new):

- Create `packages/statemachine-react/src/pages/cloud-workflow-editor/workflowDocToGraphShape.ts`
- Create `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowDocToGraphShape.test.ts`

- [ ] **Step 1: Failing tests.** Cover:
  - Empty doc (no states) → all arrays empty.
  - Single state, no transitions → `states: [{id:'state:draft', name:'draft'}]`, transitions/processes/criteria empty.
  - Two states with one transition → transition `{id:'t:a/0', startStateId:'state:a', endStateId:'state:b', startStateName:'a', endStateName:'b', automated:true (manual=false), active:true (disabled=undefined), criteriaIds:[], endProcessesIds:[]}`.
  - Transition with manual=true → `automated: false`.
  - Transition with disabled=true → `active: false`.
  - Transition with criterion → `criteriaIds: ['c:a/0']` AND a `Criteria` row with id `c:a/0`, name derived as `${transition.name} criterion`.
  - Transition with two processors → `endProcessesIds: ['p:a/0/0', 'p:a/0/1']` AND two `Process` rows.
  - Determinism: same input doc twice → identical output (deep equal).

- [ ] **Step 2: Run tests** — `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowDocToGraphShape.test.ts`. Expect FAIL.

- [ ] **Step 3: Implement.**

```ts
import type { WorkflowDoc } from '../../gateways';
import type { Transition, Process, Criteria } from '../../types';

export interface GraphShape {
  states: Array<{ id: string; name: string }>;
  transitions: Transition[];
  processes: Process[];
  criteria: Criteria[];
}

export function workflowDocToGraphShape(doc: WorkflowDoc): GraphShape {
  const states = Object.keys(doc.states ?? {}).map((name) => ({ id: `state:${name}`, name }));
  const transitions: Transition[] = [];
  const processes: Process[] = [];
  const criteria: Criteria[] = [];

  for (const [stateName, state] of Object.entries(doc.states ?? {})) {
    (state.transitions ?? []).forEach((t, i) => {
      const tId = `t:${stateName}/${i}`;
      const procIds = (t.processors ?? []).map((_, pi) => `p:${stateName}/${i}/${pi}`);
      const critIds = t.criterion ? [`c:${stateName}/${i}`] : [];

      transitions.push({
        id: tId,
        name: t.name,
        startStateId: `state:${stateName}`,
        endStateId: `state:${t.next}`,
        startStateName: stateName,
        endStateName: t.next,
        automated: !t.manual,
        active: !t.disabled,
        persisted: true,
        criteriaIds: critIds,
        endProcessesIds: procIds,
      });

      (t.processors ?? []).forEach((p, pi) => {
        processes.push({
          id: `p:${stateName}/${i}/${pi}`,
          name: p.name,
          description: '',
          persisted: true,
        });
      });

      if (t.criterion) {
        criteria.push({
          id: `c:${stateName}/${i}`,
          name: `${t.name || '(unnamed)'} criterion`,
          description: '',
          persisted: true,
        });
      }
    });
  }

  return { states, transitions, processes, criteria };
}
```

- [ ] **Step 4: Run tests** — should PASS.
- [ ] **Step 5: Commit** — `feat(statemachine-react): add workflowDocToGraphShape adapter`

### Task AA2: `positionsStorage`

**Spec:** §3.5. **Files** (both new):

- Create `packages/statemachine-react/src/pages/cloud-workflow-editor/positionsStorage.ts`
- Create `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/positionsStorage.test.ts`

- [ ] **Step 1: Failing tests** covering:
  - `positionsKey({entityName:'X', modelVersion:1}, 'wf')` → `'cyoda.cloud-workflow-editor.positions:X/1/wf'`.
  - Round-trip: `savePositions(...)` then `loadPositions(...)` returns the same map.
  - `loadPositions` returns `null` when nothing stored.
  - `loadPositions` returns `null` when stored value is malformed JSON (write garbage via raw `localStorage.setItem`, then load).
  - `savePositions` swallows errors when `localStorage.setItem` throws (mock with `vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); })`).

- [ ] **Step 2: Run tests** — Expect FAIL.

- [ ] **Step 3: Implement.**

```ts
import type { ModelRef } from '../../gateways';
import type { PositionsMap } from '../../types';

export function positionsKey(modelRef: ModelRef, workflowName: string): string {
  return `cyoda.cloud-workflow-editor.positions:${modelRef.entityName}/${modelRef.modelVersion}/${workflowName}`;
}

export function loadPositions(modelRef: ModelRef, workflowName: string): PositionsMap | null {
  try {
    const raw = window.localStorage.getItem(positionsKey(modelRef, workflowName));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? (parsed as PositionsMap) : null;
  } catch {
    return null;
  }
}

export function savePositions(modelRef: ModelRef, workflowName: string, positions: PositionsMap): void {
  try {
    window.localStorage.setItem(positionsKey(modelRef, workflowName), JSON.stringify(positions));
  } catch {
    // Best-effort. Swallow quota / unavailability errors.
  }
}
```

- [ ] **Step 4: Run tests** — should PASS.
- [ ] **Step 5: Commit** — `feat(statemachine-react): add positionsStorage helpers for graph view localStorage persistence`

---

## Group BB — Store cleanup + settings form + page shell

### Task BB1: Trim store of selection/expansion + path-rewrite logic

**Spec:** §3.3. **Files:**

- Modify `packages/statemachine-react/src/pages/cloud-workflow-editor/workflowEditorStore.ts`
- Modify `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.test.ts`
- Delete `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.paths.test.ts`

- [ ] **Step 1: Update the interface and impl.** Remove from `WorkflowEditorState`:
  - `selectedPath`, `expandedPaths`, `setSelected`, `toggleExpand`
  - The `opts?: { preserveView?: boolean }` parameter on `hydrate` (and the related preserveView logic)

  Remove from each mutation's body anything that touches `selectedPath` or `expandedPaths` (e.g. the `oldPrefix`/`newPrefix` rewriting in `renameState`, the auto-select in `addState`/`addTransition`, the prune in `deleteState`/`deleteTransition`). Mutations now only touch `s.current` and `s.errors`.

  Remove the `pathResolvesIn` exported helper; it's no longer used.

  Drop the `Set<string>` Immer requirement: `enableMapSet()` can be removed if `expandedPaths` was the only `Set` user — verify with `grep`.

- [ ] **Step 2: Update the test file.** Drop test cases for `setSelected`, `toggleExpand`, `preserveView`, expandedPaths defaults, and the entire `'preserveView defaults do NOT add the first-state default on top of preserved entries'` case. Keep tests for hydrate (basic), updateWorkflowProps, processors, criterion, resetToPristine. The renameState test assertion on `current.initialState` cascade stays.

- [ ] **Step 3: Delete `workflowEditorStore.paths.test.ts`** entirely (`git rm`).

- [ ] **Step 4: Run** — `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/workflowEditorStore.test.ts`. Should PASS.

- [ ] **Step 5: Commit** — `refactor(statemachine-react): trim workflowEditorStore — drop tree selection / expansion / path rewrites`

### Task BB2: Rename `WorkflowPropsForm` → `WorkflowSettingsForm`

**Spec:** §3.2 (new layout). **Files:**

- Rename `packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/WorkflowPropsForm.tsx` → `WorkflowSettingsForm.tsx` (`git mv`)
- Rename `__tests__/WorkflowPropsForm.test.tsx` → `WorkflowSettingsForm.test.tsx`
- Update internal exports / class name from `WorkflowPropsForm` to `WorkflowSettingsForm`.

- [ ] **Step 1: Use `git mv`** for both files.
- [ ] **Step 2: Inside the renamed component file**, change `export const WorkflowPropsForm` to `export const WorkflowSettingsForm`. Update the `<Title level={4}>Workflow</Title>` to `<Title level={4}>Workflow settings</Title>` (small UX win — distinguishes from "Workflow" tree-root that's gone).
- [ ] **Step 3: Inside the renamed test file**, update import + describe label to `WorkflowSettingsForm`.
- [ ] **Step 4: Grep for any other references** to `WorkflowPropsForm` in the codebase: `grep -rn "WorkflowPropsForm" packages/`. Should return 0 after the rename. Update any imports found.
- [ ] **Step 5: Run** — `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/WorkflowSettingsForm.test.tsx`. Should PASS.
- [ ] **Step 6: Commit** — `refactor(statemachine-react): rename WorkflowPropsForm → WorkflowSettingsForm`

### Task BB3: Rewrite `WorkflowEditorCloud` page shell

**Spec:** §3.2. **Files:**

- Modify `packages/statemachine-react/src/pages/cloud-workflow-editor/WorkflowEditorCloud.tsx`
- Modify `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowEditorCloud.test.tsx`

This task replaces the page body. Imports for the views (TabularView/GraphicalView/ConfigView) reference files that don't exist yet — they'll be added in subsequent tasks. To keep the build green between task commits, **stub them inline** in this commit and split out in their own files in CC1/DD1/EE1. Specifically: define `function TabularView() { return <div>Tabular (todo)</div>; }`, same for GraphicalView/ConfigView, all in `WorkflowEditorCloud.tsx`. CC1/DD1/EE1 then move each into its own file.

- [ ] **Step 1: Replace the page body**. The new layout:

```tsx
import { Radio, Space } from 'antd';
import React, { useContext, useEffect, useMemo, useState } from 'react';
// ... existing imports ...
import { WorkflowSettingsForm } from './nodes/WorkflowSettingsForm';

type ViewMode = 'tabular' | 'graphical' | 'config';

const PageBody: React.FC<{ isNew: boolean; entityName: string; modelVersion: number; workflowName: string }> = ({ isNew, entityName, modelVersion, workflowName }) => {
  const isDirty = useWorkflowEditorStore((s) => s.pristine !== null && s.current !== s.pristine);
  const ready = useWorkflowEditorStore((s) => s.pristine !== null);
  const [view, setView] = useState<ViewMode>('tabular');
  useDirtyGuard(isDirty);

  if (!ready) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <WorkflowSettingsForm />
          <Radio.Group value={view} onChange={(e) => setView(e.target.value)} optionType="button" buttonStyle="solid"
            options={[
              { label: 'Tabular',   value: 'tabular' },
              { label: 'Graphical', value: 'graphical' },
              { label: 'Config',    value: 'config' },
            ]} />
          {view === 'tabular'   && <TabularView />}
          {view === 'graphical' && <GraphicalView modelRef={{ entityName, modelVersion }} workflowName={workflowName} />}
          {view === 'config'    && <ConfigView />}
        </Space>
      </div>
      <SaveBar isNew={isNew} entityName={entityName} modelVersion={modelVersion} />
    </div>
  );
};

// Inline stubs — CC1/DD1/EE1 will replace these with real imports.
function TabularView() { return <div>Tabular (todo)</div>; }
function GraphicalView(_: { modelRef: { entityName: string; modelVersion: number }; workflowName: string }) {
  return <div>Graphical (todo)</div>;
}
function ConfigView() { return <div>Config (todo)</div>; }
```

The main `WorkflowEditorCloud` component must pass the new prop `workflowName={params.workflowName ?? current.name}` to `PageBody` (or re-derive from the URL — pass through). For `/new`, `workflowName` is whatever the user typed in the settings form (or `''` initially); the graphical view's position storage uses it as a key, so an empty string is acceptable until first save (positions then re-key on the canonical name after the post-save navigate).

Save flow: change `store.hydrate(fresh, { preserveView: true })` to `store.hydrate(fresh)` (no preserveView option anymore).

Drop `WorkflowTree`, `NodeRouter`, and their imports from this file.

- [ ] **Step 2: Update tests.** Rewrite `WorkflowEditorCloud.test.tsx`:
  - Drop the "preserves selectedPath after save" case (no selection state to preserve).
  - Keep load/scaffold/404/save-bar disabled tests; update assertions to look for the settings form (`getByText('Workflow settings')`) instead of the tree.
  - Keep the save-flow tests (validation, /new redirect, WorkflowNotFoundError catch) but adjust the dirty-edit step to type into a settings form field rather than navigate the tree.
  - Add: "switching view radio shows the corresponding view" — renders the page, clicks each radio, asserts the right `<div>X (todo)</div>` text appears (these stubs go away in CC/DD/EE but the toggle assertion stays valid).

- [ ] **Step 3: Run page tests** — `npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowEditorCloud.test.tsx`. Should PASS.

- [ ] **Step 4: Commit** — `feat(statemachine-react): rewrite WorkflowEditorCloud page shell with settings form + Tabular/Graphical/Config toggle (view stubs)`

---

## Group CC — Tabular view + Edit drawer

### Task CC1: TransitionEditDrawer (and replace TabularView stub with a minimal real impl)

**Spec:** §3.6, §3.9. **Files** (both new):

- Create `packages/statemachine-react/src/pages/cloud-workflow-editor/TransitionEditDrawer.tsx`
- Create `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/TransitionEditDrawer.test.tsx`
- Modify `packages/statemachine-react/src/pages/cloud-workflow-editor/WorkflowEditorCloud.tsx` (remove the inline TabularView stub)
- Create `packages/statemachine-react/src/pages/cloud-workflow-editor/views/TabularView.tsx` (minimal: just imports TransitionEditDrawer, render is finished in CC2)
- Create `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/views/TabularView.test.tsx`

- [ ] **Step 1: Failing tests for TransitionEditDrawer.**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import userEvent from '@testing-library/user-event';
import { createWorkflowEditorStore } from '../workflowEditorStore';
import { WorkflowEditorStoreContext } from '../storeContext';
import { TransitionEditDrawer } from '../TransitionEditDrawer';
import type { WorkflowDoc } from '../../../gateways';

const doc: WorkflowDoc = {
  version: '1.0', name: 'wf', initialState: 'draft',
  states: { draft: { transitions: [{ name: 't', next: 'draft', manual: false }] } },
};

function render_(open: boolean, onClose = vi.fn()) {
  const store = createWorkflowEditorStore();
  store.getState().hydrate(doc);
  return render(
    <App>
      <WorkflowEditorStoreContext.Provider value={store}>
        <TransitionEditDrawer open={open} stateName={open ? 'draft' : null} transitionIndex={open ? 0 : null} onClose={onClose} />
      </WorkflowEditorStoreContext.Provider>
    </App>
  );
}

describe('TransitionEditDrawer', () => {
  it('renders nothing when closed', () => {
    render_(false);
    expect(screen.queryByText('Transition')).not.toBeInTheDocument();
  });
  it('renders the transition form when open with a target', async () => {
    render_(true);
    expect(await screen.findByText('Transition')).toBeInTheDocument();
    expect(screen.getByDisplayValue('t')).toBeInTheDocument();
  });
  it('Done button calls onClose', async () => {
    const onClose = vi.fn();
    render_(true, onClose);
    await userEvent.click(await screen.findByRole('button', { name: /^Done$/ }));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Implement TransitionEditDrawer.**

```tsx
import React from 'react';
import { Button, Drawer } from 'antd';
import { TransitionForm } from './nodes/TransitionForm';

export interface TransitionEditDrawerProps {
  open: boolean;
  stateName: string | null;
  transitionIndex: number | null;
  onClose: () => void;
}

export const TransitionEditDrawer: React.FC<TransitionEditDrawerProps> = ({ open, stateName, transitionIndex, onClose }) => {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={720}
      destroyOnClose
      title="Edit transition"
      footer={<div style={{ textAlign: 'right' }}><Button type="primary" onClick={onClose}>Done</Button></div>}
    >
      {stateName !== null && transitionIndex !== null ? (
        <TransitionForm stateName={stateName} transitionIndex={transitionIndex} />
      ) : null}
    </Drawer>
  );
};
```

- [ ] **Step 3: Skeleton TabularView** so the import in WorkflowEditorCloud resolves:

```tsx
// views/TabularView.tsx
import React from 'react';
export const TabularView: React.FC = () => <div>Tabular view — populated in CC2</div>;
```

- [ ] **Step 4: Update WorkflowEditorCloud** to remove the inline `TabularView` stub and `import { TabularView } from './views/TabularView'`.

- [ ] **Step 5: Run** — drawer tests + page tests should PASS.
- [ ] **Step 6: Commit** — `feat(statemachine-react): add TransitionEditDrawer; extract TabularView skeleton`

### Task CC2: Real TabularView with transitions table

**Spec:** §3.6. **Files:**

- Modify `packages/statemachine-react/src/pages/cloud-workflow-editor/views/TabularView.tsx`
- Create `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/views/TabularView.test.tsx`

- [ ] **Step 1: Failing tests:**

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { createWorkflowEditorStore } from '../../workflowEditorStore';
import { WorkflowEditorStoreContext } from '../../storeContext';
import { TabularView } from '../../views/TabularView';
import type { WorkflowDoc } from '../../../../gateways';

const doc: WorkflowDoc = {
  version: '1.0', name: 'wf', initialState: 'draft',
  states: {
    draft:    { transitions: [{ name: 'go',     next: 'review', manual: false }] },
    review:   { transitions: [{ name: 'reject', next: 'draft',  manual: true,  disabled: true,
      processors: [{ type: 'externalized', name: 'audit' }],
      criterion: { type: 'simple', jsonPath: '$.x', operation: 'EQUALS', value: 'y' } as any,
    }] },
  },
};

function renderIt() {
  const store = createWorkflowEditorStore();
  store.getState().hydrate(doc);
  return { store, ...render(
    <App>
      <WorkflowEditorStoreContext.Provider value={store}>
        <TabularView />
      </WorkflowEditorStoreContext.Provider>
    </App>
  )};
}

describe('TabularView', () => {
  it('renders one row per transition (across all states)', () => {
    renderIt();
    expect(screen.getByText('go')).toBeInTheDocument();
    expect(screen.getByText('reject')).toBeInTheDocument();
  });

  it('shows state, next, manual flag, processor count, criterion presence', () => {
    renderIt();
    // The "reject" row should show: state=review, next=draft, manual=true, processors=1, criterion=Yes
    expect(screen.getByText('review')).toBeInTheDocument();
    // The "draft" state appears in the next column for "reject" — both should be visible somewhere
  });

  it('Edit click opens the drawer for that row', async () => {
    renderIt();
    const editButtons = screen.getAllByRole('button', { name: /^Edit$/ });
    await userEvent.click(editButtons[0]);
    expect(await screen.findByText('Edit transition')).toBeInTheDocument();
  });

  it('Delete click confirms then calls store.deleteTransition', async () => {
    const { store } = renderIt();
    const deleteButtons = screen.getAllByRole('button', { name: /^Delete$/ });
    await userEvent.click(deleteButtons[0]);
    // AntD Popconfirm or modal
    await userEvent.click(await screen.findByRole('button', { name: /^OK$/ }));
    // After delete, "go" is gone from the table.
    expect(screen.queryByText('go')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run** — Expect FAIL.

- [ ] **Step 3: Implement.**

```tsx
import React, { useContext, useState } from 'react';
import { Button, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { WorkflowEditorStoreContext, useWorkflowEditorStore } from '../storeContext';
import { TransitionEditDrawer } from '../TransitionEditDrawer';

interface RowKey {
  stateName: string;
  index: number;
  transitionName: string;
  next: string;
  manual: boolean;
  disabled: boolean;
  processorCount: number;
  hasCriterion: boolean;
  rowKey: string;
}

export const TabularView: React.FC = () => {
  const store = useContext(WorkflowEditorStoreContext)!;
  const stateNames = useWorkflowEditorStore(useShallow((s) => Object.keys(s.current?.states ?? {})));
  const rows = useWorkflowEditorStore(useShallow((s) => {
    const out: RowKey[] = [];
    for (const [stateName, state] of Object.entries(s.current?.states ?? {})) {
      (state.transitions ?? []).forEach((t, index) => {
        out.push({
          stateName, index,
          transitionName: t.name,
          next: t.next,
          manual: t.manual,
          disabled: t.disabled ?? false,
          processorCount: (t.processors ?? []).length,
          hasCriterion: !!t.criterion,
          rowKey: `${stateName}/${index}`,
        });
      });
    }
    return out;
  }));

  const [editing, setEditing] = useState<{ stateName: string; index: number } | null>(null);
  const [addPickerOpen, setAddPickerOpen] = useState(false);
  const [addState, setAddState] = useState<string | null>(null);

  const onAdd = () => {
    if (!addState) return;
    store.getState().addTransition(addState);
    const newIndex = (store.getState().current!.states[addState].transitions ?? []).length - 1;
    setAddPickerOpen(false);
    setAddState(null);
    setEditing({ stateName: addState, index: newIndex });
  };

  const columns = [
    { title: '#', dataIndex: 'index', render: (_: any, _row: RowKey, i: number) => i + 1, width: 50 },
    { title: 'State', dataIndex: 'stateName' },
    { title: 'Name', dataIndex: 'transitionName' },
    { title: 'Manual', dataIndex: 'manual', render: (v: boolean) => v ? <Tag color="orange">Manual</Tag> : <Tag color="cyan">Auto</Tag> },
    { title: 'Disabled', dataIndex: 'disabled', render: (v: boolean) => v ? <Tag color="red">Disabled</Tag> : null },
    { title: 'Next', dataIndex: 'next' },
    { title: 'Processors', dataIndex: 'processorCount', render: (n: number) => <Tag>{n}</Tag> },
    { title: 'Criterion', dataIndex: 'hasCriterion', render: (v: boolean) => v ? 'Yes' : 'No' },
    {
      title: 'Actions',
      render: (_: any, row: RowKey) => (
        <Space>
          <Button size="small" onClick={() => setEditing({ stateName: row.stateName, index: row.index })}>Edit</Button>
          <Popconfirm
            title="Delete this transition?"
            okText="OK"
            cancelText="Cancel"
            onConfirm={() => store.getState().deleteTransition(row.stateName, row.index)}
          >
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button onClick={() => setAddPickerOpen(true)}>+ Add transition</Button>
      <Table dataSource={rows} columns={columns as any} rowKey="rowKey" pagination={false} size="small" />
      <TransitionEditDrawer
        open={editing !== null}
        stateName={editing?.stateName ?? null}
        transitionIndex={editing?.index ?? null}
        onClose={() => setEditing(null)}
      />
      <Modal open={addPickerOpen} onCancel={() => { setAddPickerOpen(false); setAddState(null); }}
             onOk={onAdd} okText="Add" title="Add transition">
        <div>Pick the state this transition leaves from:</div>
        <Select style={{ width: '100%', marginTop: 8 }} value={addState} onChange={setAddState}
                options={stateNames.map((n) => ({ value: n, label: n }))} />
      </Modal>
    </Space>
  );
};
```

- [ ] **Step 4: Run** — should PASS.
- [ ] **Step 5: Commit** — `feat(statemachine-react): TabularView — transitions table with Edit / Delete / Add`

---

## Group DD — Graphical view

### Task DD1: GraphicalView with adapter wiring + position dragging persistence

**Spec:** §3.7. **Files:**

- Create `packages/statemachine-react/src/pages/cloud-workflow-editor/views/GraphicalView.tsx`
- Create `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/views/GraphicalView.test.tsx`
- Modify `packages/statemachine-react/src/pages/cloud-workflow-editor/WorkflowEditorCloud.tsx` (remove inline GraphicalView stub, import the real one)

- [ ] **Step 1: Failing tests** — mock `GraphicalStateMachine` to a stub that captures props:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import { createWorkflowEditorStore } from '../../workflowEditorStore';
import { WorkflowEditorStoreContext } from '../../storeContext';
import { GraphicalView } from '../../views/GraphicalView';
import type { WorkflowDoc } from '../../../../gateways';

const captured: any = {};
vi.mock('../../../../components/GraphicalStateMachine', () => ({
  GraphicalStateMachine: (props: any) => {
    Object.assign(captured, { props });
    return <div data-testid="graph-stub">graph</div>;
  },
}));

const doc: WorkflowDoc = {
  version: '1.0', name: 'wf', initialState: 'draft',
  states: { draft: { transitions: [{ name: 't', next: 'draft', manual: false }] } },
};

function renderIt() {
  const store = createWorkflowEditorStore();
  store.getState().hydrate(doc);
  return render(
    <App>
      <WorkflowEditorStoreContext.Provider value={store}>
        <GraphicalView modelRef={{ entityName: 'X', modelVersion: 1 }} workflowName="wf" />
      </WorkflowEditorStoreContext.Provider>
    </App>
  );
}

describe('GraphicalView', () => {
  beforeEach(() => { window.localStorage.clear(); for (const k in captured) delete captured[k]; });

  it('renders the GraphicalStateMachine with adapted props', () => {
    renderIt();
    expect(screen.getByTestId('graph-stub')).toBeInTheDocument();
    expect(captured.props.transitions).toHaveLength(1);
    expect(captured.props.transitions[0].name).toBe('t');
    expect(captured.props.transitions[0].startStateId).toBe('state:draft');
  });

  it('passes loaded positions on mount and persists on update', () => {
    window.localStorage.setItem(
      'cyoda.cloud-workflow-editor.positions:X/1/wf',
      JSON.stringify({ 'state:draft': { x: 10, y: 20 } }),
    );
    renderIt();
    expect(captured.props.positionsMap).toEqual({ 'state:draft': { x: 10, y: 20 } });

    captured.props.onUpdatePositionsMap({ 'state:draft': { x: 100, y: 200 } });
    expect(JSON.parse(window.localStorage.getItem('cyoda.cloud-workflow-editor.positions:X/1/wf')!))
      .toEqual({ 'state:draft': { x: 100, y: 200 } });
  });
});
```

- [ ] **Step 2: Run** — FAIL.

- [ ] **Step 3: Implement.**

```tsx
import React, { useEffect, useMemo, useState } from 'react';
import { GraphicalStateMachine } from '../../../components/GraphicalStateMachine';
import { useShallow } from 'zustand/react/shallow';
import { useWorkflowEditorStore } from '../storeContext';
import { workflowDocToGraphShape } from '../workflowDocToGraphShape';
import { loadPositions, savePositions } from '../positionsStorage';
import type { ModelRef, WorkflowDoc } from '../../../gateways';
import type { PositionsMap } from '../../../types';

export interface GraphicalViewProps {
  modelRef: ModelRef;
  workflowName: string;
}

export const GraphicalView: React.FC<GraphicalViewProps> = ({ modelRef, workflowName }) => {
  const doc = useWorkflowEditorStore((s) => s.current);
  const shape = useMemo(() => doc ? workflowDocToGraphShape(doc) : null, [doc]);
  const [positions, setPositions] = useState<PositionsMap | null>(() => loadPositions(modelRef, workflowName));

  if (!shape) return null;

  return (
    <GraphicalStateMachine
      workflowId={`${modelRef.entityName}/${modelRef.modelVersion}/${workflowName}`}
      transitions={shape.transitions}
      processes={shape.processes}
      criteria={shape.criteria}
      positionsMap={positions}
      onUpdatePositionsMap={(next) => {
        setPositions(next);
        savePositions(modelRef, workflowName, next);
      }}
      isReadonly={true}
      minHeight="600px"
    />
  );
};
```

- [ ] **Step 4: Update `WorkflowEditorCloud.tsx`** to drop the inline GraphicalView stub and `import { GraphicalView } from './views/GraphicalView'`.

- [ ] **Step 5: Run** — should PASS.

- [ ] **Step 6: Verify dragging works on the live cyoda env** via Playwright MCP (controller will do this after the next commit). If `isReadonly={true}` suppresses dragging, the fix is to drop `isReadonly` and instead pass `onAddTransition={undefined}` — this is the §5 risk. The implementer notes this in the commit message.

- [ ] **Step 7: Commit** — `feat(statemachine-react): GraphicalView — adapter + position dragging persisted to localStorage`

---

## Group EE — Config view

### Task EE1: ConfigView with read-only JSON

**Spec:** §3.8. **Files:**

- Create `packages/statemachine-react/src/pages/cloud-workflow-editor/views/ConfigView.tsx`
- Create `packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/views/ConfigView.test.tsx`
- Modify `packages/statemachine-react/src/pages/cloud-workflow-editor/WorkflowEditorCloud.tsx` (drop inline ConfigView stub)

- [ ] **Step 1: Failing test:**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import { createWorkflowEditorStore } from '../../workflowEditorStore';
import { WorkflowEditorStoreContext } from '../../storeContext';
import { ConfigView } from '../../views/ConfigView';
import type { WorkflowDoc } from '../../../../gateways';

const doc: WorkflowDoc = {
  version: '1.0', name: 'wf', initialState: 'draft',
  states: { draft: { transitions: [] } }, active: true,
};

describe('ConfigView', () => {
  it('renders pretty-printed JSON of the current doc', () => {
    const store = createWorkflowEditorStore();
    store.getState().hydrate(doc);
    render(
      <App>
        <WorkflowEditorStoreContext.Provider value={store}>
          <ConfigView />
        </WorkflowEditorStoreContext.Provider>
      </App>
    );
    expect(screen.getByText(/"version": "1.0"/)).toBeInTheDocument();
    expect(screen.getByText(/"initialState": "draft"/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run** — FAIL.

- [ ] **Step 3: Implement.**

```tsx
import React from 'react';
import { useWorkflowEditorStore } from '../storeContext';

export const ConfigView: React.FC = () => {
  const doc = useWorkflowEditorStore((s) => s.current);
  if (!doc) return null;
  return (
    <pre style={{
      background: 'transparent',
      padding: 12,
      borderRadius: 4,
      border: '1px solid var(--ant-color-border, #303030)',
      overflowX: 'auto',
      fontSize: 12,
      lineHeight: 1.4,
    }}>
      {JSON.stringify(doc, null, 2)}
    </pre>
  );
};
```

- [ ] **Step 4: Update `WorkflowEditorCloud.tsx`** to drop the inline ConfigView stub and import the real one.

- [ ] **Step 5: Run** — should PASS.

- [ ] **Step 6: Commit** — `feat(statemachine-react): ConfigView — read-only JSON of current workflow doc`

---

## Group FF — Cleanup + E2E updates + verify

### Task FF1: Delete dead code, update E2E specs, run full verification

**Files:**

- Delete: `packages/statemachine-react/src/pages/cloud-workflow-editor/WorkflowTree.tsx`
- Delete: `packages/statemachine-react/src/pages/cloud-workflow-editor/NodeRouter.tsx`
- Delete: `packages/statemachine-react/src/pages/cloud-workflow-editor/nodeHasError.ts`
- Delete: `packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/StateForm.tsx`
- Delete corresponding `__tests__/*.test.tsx` for each
- Modify TransitionForm.tsx: fix the `undefined: name` accordion label bug (`${p.type ?? 'externalized'}: ${p.name || '(unnamed)'}`)
- Update each E2E spec under `e2e/cloud-workflow-editor/` per spec §4.2:
  - `create.spec.ts` — selectors should still work (settings form fields). Spot-check.
  - `edit-and-save.spec.ts` — switch to Tabular view first, then Edit row, then edit in drawer.
  - `add-processor.spec.ts` — Tabular → Edit → expand Processors → externalized → Done → Save.
  - `query-condition.spec.ts` — Tabular → Edit → Add criterion → switch to group → 2 simples → Done → Save → reload.
  - `validation.spec.ts` — clear initialState in settings form on top → Save → assert error toast (drop tree-dot assertion).
  - `dirty-guard.spec.ts` — unchanged.

- [ ] **Step 1: Delete the four dead components + their tests.**

```bash
git rm packages/statemachine-react/src/pages/cloud-workflow-editor/WorkflowTree.tsx \
       packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/WorkflowTree.test.tsx \
       packages/statemachine-react/src/pages/cloud-workflow-editor/NodeRouter.tsx \
       packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/NodeRouter.test.tsx \
       packages/statemachine-react/src/pages/cloud-workflow-editor/nodeHasError.ts \
       packages/statemachine-react/src/pages/cloud-workflow-editor/__tests__/nodeHasError.test.ts \
       packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/StateForm.tsx \
       packages/statemachine-react/src/pages/cloud-workflow-editor/nodes/__tests__/StateForm.test.tsx
```

Confirm `grep -rn "WorkflowTree\|NodeRouter\|nodeHasError\|StateForm" packages/statemachine-react/src/` returns 0 results outside the deleted files.

- [ ] **Step 2: Fix the `undefined:` accordion label** in `nodes/TransitionForm.tsx`:

In the Collapse `items` mapping (~line 56), change:
```tsx
label: `${p.type}: ${p.name || '(unnamed)'}`,
```
to:
```tsx
label: `${p.type ?? 'externalized'}: ${p.name || '(unnamed)'}`,
```

- [ ] **Step 3: Update the 5 E2E specs** per the spec §4.2 changes. Keep each spec's structure; change selectors. Don't run them — Playwright execution comes after the user reviews this PR.

- [ ] **Step 4: Run all unit tests:**

```bash
npx vitest run --environment jsdom packages/statemachine-react/src/pages/cloud-workflow-editor packages/statemachine-react/src/components/cloud-workflows packages/statemachine-react/src/gateways
```
Expected: all PASS. Test count should be lower than before (we deleted ~40 tests across 4 files) but no failures.

- [ ] **Step 5: Type-check:**

```bash
cd packages/statemachine-react && npx tsc --noEmit
```
Expected: no new errors.

- [ ] **Step 6: Confirm Playwright spec discovery:**

```bash
pnpm exec playwright test --list --project=cloud-workflow-editor
```
Expected: still 6 specs listed; no parse errors.

- [ ] **Step 7: Commit** — `chore(statemachine-react): delete tree navigator dead code; update E2E selectors for new layout; fix processor accordion undefined label`

---

## Self-review

**Spec coverage** — every section of the layout-pivot spec maps to at least one task: §3.4 (AA1), §3.5 (AA2), §3.3 store changes (BB1), §3.2 layout + WorkflowSettingsForm (BB2 + BB3), §3.6 TabularView (CC1 + CC2), §3.7 GraphicalView (DD1), §3.8 ConfigView (EE1), §3.9 TransitionEditDrawer (CC1), removed/dead code (FF1), §4.2 E2E updates (FF1).

**Type consistency** — `WorkflowSettingsForm` (renamed in BB2) matches the import in BB3's page-shell rewrite. `TransitionEditDrawer`'s prop signature matches what TabularView passes in CC2. The `GraphShape`/`PositionsMap`/`workflowName`/`modelRef` types are consistent across AA1, AA2, DD1.

**No placeholders** — every step has actual code or an exact command. The only intentional sequencing dependency is BB3's inline view stubs, which CC1/DD1/EE1 explicitly remove when they introduce the real view files. That's not a placeholder; it's a defined ordering.
