import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { createWorkflowEditorStore } from '../../workflowEditorStore';
import { WorkflowEditorStoreContext } from '../../storeContext';
import { TransitionForm } from '../TransitionForm';
import type { WorkflowDoc } from '../../../../gateways';

const doc: WorkflowDoc = {
  version: '1.0', name: 'wf', initialState: 'draft',
  states: {
    draft: { transitions: [{ name: 't', next: 'review', manual: false }] },
    review: { transitions: [] },
  },
};

function renderForm(store: ReturnType<typeof createWorkflowEditorStore>) {
  return render(
    <App>
      <WorkflowEditorStoreContext.Provider value={store}>
        <TransitionForm stateName="draft" transitionIndex={0} />
      </WorkflowEditorStoreContext.Provider>
    </App>
  );
}

describe('TransitionForm', () => {
  let store: ReturnType<typeof createWorkflowEditorStore>;
  beforeEach(() => { store = createWorkflowEditorStore(); store.getState().hydrate(doc); });

  it('renders name, next, manual, and Processors accordion section', () => {
    renderForm(store);
    expect(screen.getByDisplayValue('t')).toBeInTheDocument();
    // "next" Select shows "review"
    expect(screen.getByText('review')).toBeInTheDocument();
    expect(screen.getByText(/Processors/i)).toBeInTheDocument();
  });

  it('typing into name updates the store', async () => {
    renderForm(store);
    const input = screen.getByDisplayValue('t');
    await userEvent.clear(input);
    await userEvent.type(input, 'renamed');
    expect(store.getState().current!.states.draft.transitions![0].name).toBe('renamed');
  });

  it('"+ Add processor" opens the type chooser; choosing externalized appends', async () => {
    renderForm(store);
    await userEvent.click(screen.getByRole('button', { name: /add processor/i }));
    await userEvent.click(screen.getByRole('button', { name: /externalized/i }));
    expect(store.getState().current!.states.draft.transitions![0].processors).toHaveLength(1);
    expect(store.getState().current!.states.draft.transitions![0].processors![0].type).toBe('externalized');
  });
});
