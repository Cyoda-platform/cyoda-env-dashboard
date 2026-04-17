import React from 'react';
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
    const { container } = render(
      <App>
        <WorkflowEditorStoreContext.Provider value={store}>
          <ConfigView />
        </WorkflowEditorStoreContext.Provider>
      </App>
    );
    // The <pre> contains the full JSON; assert text fragments.
    expect(container.textContent).toContain('"version": "1.0"');
    expect(container.textContent).toContain('"initialState": "draft"');
  });
});
