/**
 * WorkflowsCloud — the cloud Workflows list page (sub-branch 3).
 *
 * Two-stage UX:
 *   - Stage A: ModelPicker selects (entityName, modelVersion).
 *   - Stage B: WorkflowsTable lists the workflows for that model with row actions.
 *
 * URL state: ?entityName=...&modelVersion=... persists the selection so reload
 * and deep links work.
 *
 * Row actions dispatch through the gateway-backed React Query hooks:
 *   - Edit       → navigate to the cloud editor route (placeholder until sub-branch 4)
 *   - Duplicate  → NameInputDialog → useCopyWorkflow
 *   - Rename     → NameInputDialog (initial = source name) → useRenameWorkflow
 *   - Deactivate → useUpdateWorkflow with active: false
 *   - Activate   → useUpdateWorkflow with active: true
 *   - Delete     → DeleteWorkflowDialog → useDeleteWorkflow
 */

import React, { useState } from 'react';
import { Space, Typography, App as AntApp } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ModelPicker } from '../components/cloud-workflows/ModelPicker';
import { WorkflowsTable } from '../components/cloud-workflows/WorkflowsTable';
import { NameInputDialog } from '../components/cloud-workflows/NameInputDialog';
import { DeleteWorkflowDialog } from '../components/cloud-workflows/DeleteWorkflowDialog';
import {
  useWorkflowsList,
  useCopyWorkflow,
  useRenameWorkflow,
  useUpdateWorkflow,
  useDeleteWorkflow,
} from '../hooks/useStatemachine';
import { getWorkflowGateway } from '../gateways';
import type { ModelRef } from '../gateways';

const { Title, Paragraph } = Typography;

function readModelRefFromUrl(params: URLSearchParams): ModelRef | null {
  const entityName = params.get('entityName');
  const versionStr = params.get('modelVersion');
  if (!entityName || !versionStr) return null;
  const v = parseInt(versionStr, 10);
  if (Number.isNaN(v)) return null;
  return { entityName, modelVersion: v };
}

type DialogState =
  | { kind: 'none' }
  | { kind: 'duplicate'; sourceName: string }
  | { kind: 'rename'; oldName: string }
  | { kind: 'delete'; targetName: string };

export const WorkflowsCloud: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const modelRef = readModelRefFromUrl(searchParams);

  const setModelRef = (next: ModelRef | null) => {
    if (next === null) {
      setSearchParams({}, { replace: false });
    } else {
      setSearchParams(
        { entityName: next.entityName, modelVersion: String(next.modelVersion) },
        { replace: false }
      );
    }
  };

  const { message } = AntApp.useApp();
  const workflowsQuery = useWorkflowsList(modelRef);
  const workflows = workflowsQuery.data ?? [];

  const copyMutation = useCopyWorkflow();
  const renameMutation = useRenameWorkflow();
  const updateMutation = useUpdateWorkflow();
  const deleteMutation = useDeleteWorkflow();

  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });

  const closeDialog = () => setDialog({ kind: 'none' });

  // For Deactivate / Activate we need the full doc to MERGE-save with active toggled.
  // Pull on-demand: when a row's button is clicked we load the doc, then save.
  const handleActiveToggle = async (name: string, active: boolean) => {
    if (!modelRef) return;
    try {
      const gateway = getWorkflowGateway();
      const doc = await gateway.loadWorkflow(modelRef, name);
      await updateMutation.mutateAsync({ modelRef, doc: { ...doc, active } });
      message.success(active ? `Activated "${name}"` : `Deactivated "${name}"`);
    } catch (err) {
      message.error(`Failed to ${active ? 'activate' : 'deactivate'} "${name}": ${(err as Error).message}`);
    }
  };

  const handleEdit = (name: string) => {
    if (!modelRef) return;
    navigate(`/workflow/${encodeURIComponent(modelRef.entityName)}/${modelRef.modelVersion}/${encodeURIComponent(name)}`);
  };

  const handleDuplicateConfirm = async (newName: string) => {
    if (dialog.kind !== 'duplicate' || !modelRef) return;
    try {
      await copyMutation.mutateAsync({
        modelRef,
        sourceName: dialog.sourceName,
        newName,
      });
      message.success(`Copied "${dialog.sourceName}" to "${newName}"`);
      closeDialog();
    } catch (err) {
      message.error(`Copy failed: ${(err as Error).message}`);
    }
  };

  const handleRenameConfirm = async (newName: string) => {
    if (dialog.kind !== 'rename' || !modelRef) return;
    try {
      await renameMutation.mutateAsync({
        modelRef,
        oldName: dialog.oldName,
        newName,
      });
      message.success(`Renamed "${dialog.oldName}" to "${newName}"`);
      closeDialog();
    } catch (err) {
      message.error(`Rename failed: ${(err as Error).message}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (dialog.kind !== 'delete' || !modelRef) return;
    try {
      await deleteMutation.mutateAsync({ modelRef, name: dialog.targetName });
      message.success(`Deleted "${dialog.targetName}"`);
      closeDialog();
    } catch (err) {
      message.error(`Delete failed: ${(err as Error).message}`);
    }
  };

  const existingNames = workflows.map((w) => w.name);

  // Snapshot timestamp for the disruptive delete dialog.
  const snapshotAt = workflowsQuery.dataUpdatedAt
    ? new Date(workflowsQuery.dataUpdatedAt)
    : new Date();

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Workflows</Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Paragraph>Select an entity model to view its workflows.</Paragraph>
          <ModelPicker value={modelRef} onChange={setModelRef} />
        </div>

        {modelRef && (
          <WorkflowsTable
            workflows={workflows}
            loading={workflowsQuery.isLoading}
            onEdit={handleEdit}
            onDuplicate={(name) => setDialog({ kind: 'duplicate', sourceName: name })}
            onRename={(name) => setDialog({ kind: 'rename', oldName: name })}
            onDeactivate={(name) => handleActiveToggle(name, false)}
            onActivate={(name) => handleActiveToggle(name, true)}
            onDelete={(name) => setDialog({ kind: 'delete', targetName: name })}
          />
        )}
      </Space>

      {dialog.kind === 'duplicate' && (
        <NameInputDialog
          open
          title={`Duplicate workflow "${dialog.sourceName}"`}
          existingNames={existingNames}
          confirmLoading={copyMutation.isPending}
          onSubmit={handleDuplicateConfirm}
          onCancel={closeDialog}
        />
      )}

      {dialog.kind === 'rename' && (
        <NameInputDialog
          open
          title={`Rename workflow "${dialog.oldName}"`}
          existingNames={existingNames}
          allowedValue={dialog.oldName}
          initialValue={dialog.oldName}
          confirmLoading={renameMutation.isPending}
          onSubmit={handleRenameConfirm}
          onCancel={closeDialog}
        />
      )}

      {dialog.kind === 'delete' && (
        <DeleteWorkflowDialog
          open
          targetName={dialog.targetName}
          keptNames={existingNames.filter((n) => n !== dialog.targetName)}
          snapshotAt={snapshotAt}
          confirmLoading={deleteMutation.isPending}
          onConfirm={handleDeleteConfirm}
          onCancel={closeDialog}
          onRefresh={() => {
            workflowsQuery.refetch();
          }}
        />
      )}
    </div>
  );
};
