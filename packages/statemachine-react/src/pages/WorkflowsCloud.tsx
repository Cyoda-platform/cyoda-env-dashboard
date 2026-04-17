/**
 * WorkflowsCloud — the cloud Workflows list page (sub-branch 3).
 *
 * Two-stage UX:
 *   - Stage A: ModelPicker selects (entityName, modelVersion).
 *   - Stage B: WorkflowsTable lists the workflows for that model with row actions.
 *
 * URL state: ?entityName=...&modelVersion=... persists the selection so reload
 * and deep links work. The selectedModelRef is mirrored into statemachineStore
 * so other pages can read it.
 */

import React from 'react';
import { Space, Typography } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { ModelPicker } from '../components/cloud-workflows/ModelPicker';
import { WorkflowsTable } from '../components/cloud-workflows/WorkflowsTable';
import { useWorkflowsList } from '../hooks/useStatemachine';
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

export const WorkflowsCloud: React.FC = () => {
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

  const workflowsQuery = useWorkflowsList(modelRef);
  const workflows = workflowsQuery.data ?? [];

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
            onEdit={(name) => {
              // TODO(task-15): navigate to /workflow/:entityName/:modelVersion/:name
              console.warn('Edit not wired yet:', name);
            }}
            onDuplicate={(name) => {
              console.warn('Duplicate not wired yet:', name);
            }}
            onRename={(name) => {
              console.warn('Rename not wired yet:', name);
            }}
            onDeactivate={(name) => {
              console.warn('Deactivate not wired yet:', name);
            }}
            onActivate={(name) => {
              console.warn('Activate not wired yet:', name);
            }}
            onDelete={(name) => {
              console.warn('Delete not wired yet:', name);
            }}
          />
        )}
      </Space>
    </div>
  );
};
