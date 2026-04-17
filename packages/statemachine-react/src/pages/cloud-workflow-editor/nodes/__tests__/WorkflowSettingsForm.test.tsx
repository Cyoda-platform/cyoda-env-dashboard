import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { createWorkflowEditorStore } from '../../workflowEditorStore';
import { WorkflowEditorStoreContext } from '../../storeContext';
import { WorkflowSettingsForm } from '../WorkflowSettingsForm';
import type { WorkflowDoc } from '../../../../gateways';

const doc: WorkflowDoc = {
  version: '1.0', name: 'wf', initialState: 'draft', active: true,
  states: { draft: { transitions: [] } },
};

function renderWithStore(store: ReturnType<typeof createWorkflowEditorStore>) {
  return render(
    <App>
      <WorkflowEditorStoreContext.Provider value={store}>
        <WorkflowSettingsForm />
      </WorkflowEditorStoreContext.Provider>
    </App>
  );
}

describe('WorkflowSettingsForm', () => {
  let store: ReturnType<typeof createWorkflowEditorStore>;
  beforeEach(() => { store = createWorkflowEditorStore(); store.getState().hydrate(doc); });

  it('renders the workflow fields populated from the store', () => {
    renderWithStore(store);
    expect(screen.getByDisplayValue('wf')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1.0')).toBeInTheDocument();
  });

  it('typing into the name field updates the store', async () => {
    renderWithStore(store);
    const input = screen.getByDisplayValue('wf');
    await userEvent.clear(input);
    await userEvent.type(input, 'renamed');
    expect(store.getState().current!.name).toBe('renamed');
  });
});
