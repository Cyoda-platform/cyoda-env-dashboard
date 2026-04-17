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
