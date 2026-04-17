import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import { createWorkflowEditorStore } from '../workflowEditorStore';
import { WorkflowEditorStoreContext } from '../storeContext';
import { NodeRouter } from '../NodeRouter';
import type { WorkflowDoc } from '../../../gateways';

const doc: WorkflowDoc = {
  version: '1.0', name: 'wf', initialState: 'draft',
  states: { draft: { transitions: [{ name: 't', next: 'draft', manual: false }] } },
};

function renderRouter(s: ReturnType<typeof createWorkflowEditorStore>) {
  return render(
    <App>
      <WorkflowEditorStoreContext.Provider value={s}>
        <NodeRouter />
      </WorkflowEditorStoreContext.Provider>
    </App>
  );
}

describe('NodeRouter', () => {
  let store: ReturnType<typeof createWorkflowEditorStore>;
  beforeEach(() => { store = createWorkflowEditorStore(); store.getState().hydrate(doc); });

  it('renders WorkflowSettingsForm for selectedPath="/"', () => {
    renderRouter(store);
    expect(screen.getByText('Workflow settings')).toBeInTheDocument();   // Title from WorkflowSettingsForm
  });

  it('renders StateForm for /states/<name>', () => {
    store.getState().setSelected('/states/draft');
    renderRouter(store);
    expect(screen.getByText(/State: draft/i)).toBeInTheDocument();
  });

  it('renders TransitionForm for /states/<name>/transitions/<i>', () => {
    store.getState().setSelected('/states/draft/transitions/0');
    renderRouter(store);
    expect(screen.getByText('Transition')).toBeInTheDocument();
  });
});
