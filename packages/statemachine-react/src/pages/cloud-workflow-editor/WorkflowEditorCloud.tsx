import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';
import { App } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { createWorkflowEditorStore } from './workflowEditorStore';
import { WorkflowEditorStoreContext, useWorkflowEditorStore } from './storeContext';
import { WorkflowTree } from './WorkflowTree';
import { NodeRouter } from './NodeRouter';
import { useDirtyGuard } from './useDirtyGuard';
import { validateWorkflowDoc } from './validateWorkflowDoc';
import { getWorkflowGateway } from '../../gateways';
import { statemachineKeys } from '../../hooks/useStatemachine';
import { MustHaveActiveWorkflowError, WorkflowNotFoundError } from '../../gateways/errors';
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
      <PageBody isNew={isNew} entityName={modelRef.entityName} modelVersion={modelRef.modelVersion} />
    </WorkflowEditorStoreContext.Provider>
  );
};

const PageBody: React.FC<{ isNew: boolean; entityName: string; modelVersion: number }> = ({ isNew, entityName, modelVersion }) => {
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
      <SaveBar isNew={isNew} entityName={entityName} modelVersion={modelVersion} />
    </div>
  );
};

const SaveBar: React.FC<{ isNew: boolean; entityName: string; modelVersion: number }> = ({ isNew, entityName, modelVersion }) => {
  const store = useContext(WorkflowEditorStoreContext)!;
  const isDirty = useWorkflowEditorStore((s) => s.pristine !== null && s.current !== s.pristine);
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const current = store.getState().current;
    if (!current) return;
    setSaving(true);
    try {
      const issues = validateWorkflowDoc(current);
      if (issues.length > 0) {
        store.getState().setErrors(issues);
        store.getState().setSelected(issues[0].path);
        // expand ancestors of the first error
        const parts = issues[0].path.split('/').filter(Boolean);
        let acc = '';
        for (const part of parts) {
          acc += '/' + part;
          if (!store.getState().expandedPaths.has(acc)) store.getState().toggleExpand(acc);
        }
        message.error('Validation failed — see highlighted fields.');
        setSaving(false);
        return;
      }
      const modelRef = { entityName, modelVersion };
      await getWorkflowGateway().saveWorkflow(modelRef, current, 'MERGE');
      try {
        const fresh = await queryClient.fetchQuery({
          queryKey: statemachineKeys.workflowDoc(modelRef, current.name),
          queryFn: () => getWorkflowGateway().loadWorkflow(modelRef, current.name),
        });
        store.getState().hydrate(fresh, { preserveView: true });
        if (isNew) navigate(`/workflow/${entityName}/${modelVersion}/${current.name}`, { replace: true });
        message.success('Workflow saved');
      } catch (err: any) {
        if (err instanceof WorkflowNotFoundError) {
          message.warning('Save succeeded but the saved workflow could not be re-loaded by name. Refresh the workflows list.');
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      if (err instanceof MustHaveActiveWorkflowError) message.error('Cannot deactivate the only active workflow');
      else message.error(err.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onDiscard = () => {
    modal.confirm({
      title: 'Discard all unsaved changes? This cannot be undone.',
      okText: 'Discard',
      cancelText: 'Keep editing',
      onOk: () => store.getState().resetToPristine(),
    });
  };

  return (
    <div style={{ borderTop: '1px solid #eee', padding: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
      <Button onClick={onDiscard} disabled={!isDirty || saving}>Discard changes</Button>
      <Button type="primary" loading={saving} disabled={!isDirty || saving} onClick={onSave}>Save</Button>
    </div>
  );
};

export default WorkflowEditorCloud;
