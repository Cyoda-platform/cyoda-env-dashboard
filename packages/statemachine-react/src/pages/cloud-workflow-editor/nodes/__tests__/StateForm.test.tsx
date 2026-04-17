import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { createWorkflowEditorStore } from '../../workflowEditorStore';
import { WorkflowEditorStoreContext } from '../../storeContext';
import { StateForm } from '../StateForm';
import type { WorkflowDoc } from '../../../../gateways';

const doc: WorkflowDoc = {
  version: '1.0', name: 'wf', initialState: 'draft',
  states: { draft: { transitions: [{ name: 't', next: 'draft', manual: false }] } },
};

function renderWithStore(s: ReturnType<typeof createWorkflowEditorStore>) {
  return render(
    <App>
      <WorkflowEditorStoreContext.Provider value={s}>
        <StateForm stateName="draft" />
      </WorkflowEditorStoreContext.Provider>
    </App>
  );
}

describe('StateForm', () => {
  let store: ReturnType<typeof createWorkflowEditorStore>;
  beforeEach(() => { store = createWorkflowEditorStore(); store.getState().hydrate(doc); });

  it('renders the state name and the transition count', () => {
    renderWithStore(store);
    expect(screen.getByText(/draft/)).toBeInTheDocument();
    expect(screen.getByText(/1 transition/i)).toBeInTheDocument();
  });

  it('"+ Add transition" calls store.addTransition with the state name', async () => {
    renderWithStore(store);
    await userEvent.click(screen.getByRole('button', { name: /add transition/i }));
    expect(store.getState().current!.states.draft.transitions).toHaveLength(2);
  });
});
