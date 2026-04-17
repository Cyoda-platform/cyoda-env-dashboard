import React from 'react';
import { describe, it, expect } from 'vitest';
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
    draft:  { transitions: [{ name: 'go', next: 'review', manual: false }] },
    review: { transitions: [{
      name: 'reject', next: 'draft', manual: true, disabled: true,
      processors: [{ type: 'externalized', name: 'audit' }],
      criterion: { type: 'simple', jsonPath: '$.x', operation: 'EQUALS', value: 'y' } as any,
    }] },
  },
};

function renderIt() {
  const store = createWorkflowEditorStore();
  store.getState().hydrate(doc);
  const result = render(
    <App>
      <WorkflowEditorStoreContext.Provider value={store}>
        <TabularView />
      </WorkflowEditorStoreContext.Provider>
    </App>
  );
  return { store, ...result };
}

describe('TabularView', () => {
  it('renders one row per transition (across all states)', () => {
    renderIt();
    expect(screen.getByText('go')).toBeInTheDocument();
    expect(screen.getByText('reject')).toBeInTheDocument();
  });

  it('shows Manual / Auto / Disabled tags appropriately', () => {
    renderIt();
    // Manual tag for "reject" row, Auto tag for "go"
    expect(screen.getByText('Auto')).toBeInTheDocument();
    expect(screen.getByText('Manual')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('shows criterion Yes/No', () => {
    renderIt();
    expect(screen.getByText('Yes')).toBeInTheDocument();   // reject has criterion
    expect(screen.getByText('No')).toBeInTheDocument();    // go does not
  });

  it('Edit button opens TransitionEditDrawer for that row', async () => {
    renderIt();
    const editButtons = screen.getAllByRole('button', { name: /^Edit$/ });
    await userEvent.click(editButtons[0]);
    expect(await screen.findByText('Edit transition')).toBeInTheDocument();
  });

  it('Delete with Popconfirm calls store.deleteTransition', async () => {
    const { store } = renderIt();
    const deleteButtons = screen.getAllByRole('button', { name: /^Delete$/ });
    await userEvent.click(deleteButtons[0]);
    // AntD Popconfirm shows OK/Cancel
    const ok = await screen.findByRole('button', { name: /^OK$/ });
    await userEvent.click(ok);
    // After delete, "go" is gone from the table.
    expect(screen.queryByText('go')).not.toBeInTheDocument();
    // The store now has 0 transitions in draft.
    expect(store.getState().current!.states.draft.transitions).toEqual([]);
  });
});
