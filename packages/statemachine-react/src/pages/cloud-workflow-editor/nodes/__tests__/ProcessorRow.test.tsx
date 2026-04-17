import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { createWorkflowEditorStore } from '../../workflowEditorStore';
import { WorkflowEditorStoreContext } from '../../storeContext';
import { ProcessorRow } from '../ProcessorRow';
import type { WorkflowDoc } from '../../../../gateways';

const doc: WorkflowDoc = {
  version: '1.0', name: 'wf', initialState: 'draft',
  states: {
    draft: {
      transitions: [{
        name: 't', next: 'draft', manual: false,
        processors: [
          { type: 'externalized', name: 'p1', executionMode: 'SYNC' },
          { type: 'scheduled', name: 'p2', config: { delayMs: 1000, transition: 't' } },
        ],
      }],
    },
  },
};

function renderRow(idx: number, store: ReturnType<typeof createWorkflowEditorStore>) {
  return render(
    <App>
      <WorkflowEditorStoreContext.Provider value={store}>
        <ProcessorRow stateName="draft" transitionIndex={0} processorIndex={idx} />
      </WorkflowEditorStoreContext.Provider>
    </App>
  );
}

describe('ProcessorRow', () => {
  let store: ReturnType<typeof createWorkflowEditorStore>;
  beforeEach(() => { store = createWorkflowEditorStore(); store.getState().hydrate(doc); });

  it('renders externalized fields for an externalized processor', () => {
    renderRow(0, store);
    expect(screen.getByDisplayValue('p1')).toBeInTheDocument();
    // executionMode shown as a Select with value SYNC
    expect(screen.getByText('SYNC')).toBeInTheDocument();
  });

  it('renders scheduled fields for a scheduled processor', () => {
    renderRow(1, store);
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('t')).toBeInTheDocument();
  });

  it('typing into name updates the store', async () => {
    renderRow(0, store);
    const input = screen.getByDisplayValue('p1');
    await userEvent.clear(input);
    await userEvent.type(input, 'renamed');
    expect(store.getState().current!.states.draft.transitions![0].processors![0].name).toBe('renamed');
  });
});
