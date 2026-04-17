/**
 * InstanceDetailCloud — cloud-mode instance detail page with 5 tabs.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-instances-design.md §3.8
 */
import React, { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Space, Tabs, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ModelRef } from '../../gateways';
import { DetailsTab } from './tabs/DetailsTab';
import { WorkflowTab } from './tabs/WorkflowTab';
import { AuditTab } from './tabs/AuditTab';
import { DataLineageTab } from './tabs/DataLineageTab';
import { useResolvedWorkflowName } from './useResolvedWorkflowName';

const { Title, Text } = Typography;

export const InstanceDetailCloud: React.FC = () => {
  const { instanceId: entityId } = useParams<{ instanceId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const entityName = searchParams.get('entityName') ?? '';
  const modelVersionParam = searchParams.get('modelVersion');
  const modelVersion = modelVersionParam === null ? NaN : Number(modelVersionParam);
  const urlWorkflowName = searchParams.get('workflowName') ?? undefined;
  const modelRef = useMemo<ModelRef | null>(() => (
    entityName && !Number.isNaN(modelVersion) ? { entityName, modelVersion } : null
  ), [entityName, modelVersion]);

  const { workflowName, isLoading: workflowNameLoading } = useResolvedWorkflowName(modelRef, urlWorkflowName);

  const items = useMemo(() => [
    { key: 'details', label: 'Details', children: <DetailsTab entityId={entityId!} modelRef={modelRef} workflowName={workflowName ?? ''} /> },
    { key: 'workflow', label: 'Workflow', children: <WorkflowTab entityId={entityId!} modelRef={modelRef} workflowName={workflowName ?? ''} /> },
    { key: 'audit', label: 'Audit', children: <AuditTab entityId={entityId!} /> },
    { key: 'lineage', label: 'Data Lineage', children: <DataLineageTab entityId={entityId!} /> },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [entityId, modelRef, workflowName]);

  if (!entityId) return null;

  return (
    <Space direction="vertical" style={{ width: '100%', padding: 16 }} size="middle">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(
        `/instances?entityName=${encodeURIComponent(entityName)}&modelVersion=${modelVersion}`,
      )}>Back to Instances</Button>
      <Title level={2}>Instances / {workflowNameLoading ? '…' : (workflowName ?? '(no workflow)')}</Title>
      <Text>ID: <Text strong>{entityId}</Text>{modelRef ? ` | Model: ${modelRef.modelVersion}` : ''}</Text>
      <Tabs items={items} />
    </Space>
  );
};


