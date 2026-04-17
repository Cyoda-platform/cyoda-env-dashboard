import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
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
        <TransitionEditDrawer
          open={open}
          stateName={open ? 'draft' : null}
          transitionIndex={open ? 0 : null}
          onClose={onClose}
        />
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
