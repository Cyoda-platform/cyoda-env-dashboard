import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import { createWorkflowEditorStore } from '../../workflowEditorStore';
import { WorkflowEditorStoreContext } from '../../storeContext';
import type { WorkflowDoc } from '../../../../gateways';

// Capture the props passed to GraphicalStateMachine via a vi.mock stub.
const captured: any = {};
vi.mock('../../../../components/GraphicalStateMachine', () => ({
  GraphicalStateMachine: (props: any) => {
    Object.assign(captured, { props });
    return <div data-testid="graph-stub">graph</div>;
  },
}));

import { GraphicalView } from '../../views/GraphicalView';

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
  beforeEach(() => {
    window.localStorage.clear();
    for (const k of Object.keys(captured)) delete captured[k];
  });

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
