import React, { useContext, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Result } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { createWorkflowEditorStore } from './workflowEditorStore';
import { WorkflowEditorStoreContext, useWorkflowEditorStore } from './storeContext';
import { WorkflowTree } from './WorkflowTree';
import { NodeRouter } from './NodeRouter';
import { useDirtyGuard } from './useDirtyGuard';
import { getWorkflowGateway } from '../../gateways';
import { statemachineKeys } from '../../hooks/useStatemachine';
import type { WorkflowDoc } from '../../gateways';

const SCAFFOLD: WorkflowDoc = {
  version: '1.0', name: '', initialState: 'draft',
  states: { draft: { transitions: [] } }, active: true,
};

export const WorkflowEditorCloud: React.FC = () => {
  const params = useParams<{ entityName: string; modelVersion: string; workflowName?: string }>();
  const store = useMemo(() => createWorkflowEditorStore(), []);

  const isBadRef = !params.entityName || Number.isNaN(Number(params.modelVersion));
  const modelRef = { entityName: params.entityName ?? '', modelVersion: Number(params.modelVersion) };
  const isNew = !params.workflowName || params.workflowName === 'new';

  const query = useQuery({
    queryKey: statemachineKeys.workflowDoc(modelRef, params.workflowName),
    queryFn: () => getWorkflowGateway().loadWorkflow(modelRef, params.workflowName!),
    enabled: !isBadRef && !isNew,
  });

  // Hydrate once when fresh data arrives or for /new.
  useEffect(() => {
    if (store.getState().pristine !== null) return;
    if (isNew && !isBadRef) store.getState().hydrate(SCAFFOLD);
    else if (query.data) store.getState().hydrate(query.data);
  }, [store, isNew, isBadRef, query.data]);

  if (isBadRef) {
    return <Result status="404" title="Bad workflow URL" subTitle="entityName or modelVersion missing or invalid." extra={<a href="/workflows">Back to workflows</a>} />;
  }

  return (
    <WorkflowEditorStoreContext.Provider value={store}>
      <PageBody />
    </WorkflowEditorStoreContext.Provider>
  );
};

const PageBody: React.FC = () => {
  const isDirty = useWorkflowEditorStore((s) => s.pristine !== null && s.current !== s.pristine);
  const ready = useWorkflowEditorStore((s) => s.pristine !== null);
  useDirtyGuard(isDirty);

  if (!ready) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: '0 0 320px', borderRight: '1px solid #eee' }}>
          <WorkflowTree />
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <NodeRouter />
        </div>
      </div>
      <SaveBar />
    </div>
  );
};

const SaveBar: React.FC = () => {
  const isDirty = useWorkflowEditorStore((s) => s.pristine !== null && s.current !== s.pristine);
  return (
    <div style={{ borderTop: '1px solid #eee', padding: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
      <Button disabled={!isDirty}>Discard changes</Button>
      <Button type="primary" disabled={!isDirty}>Save</Button>
    </div>
  );
};

export default WorkflowEditorCloud;
