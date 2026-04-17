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

const { Title, Text } = Typography;

export const InstanceDetailCloud: React.FC = () => {
  const { entityId } = useParams<{ entityId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const entityName = searchParams.get('entityName') ?? '';
  const modelVersion = Number(searchParams.get('modelVersion'));
  const workflowName = searchParams.get('workflowName') ?? '';
  const modelRef: ModelRef | null = entityName && !Number.isNaN(modelVersion)
    ? { entityName, modelVersion } : null;

  const items = useMemo(() => [
    { key: 'details', label: 'Details', children: <DetailsTab /> },
    { key: 'workflow', label: 'Workflow', children: <WorkflowTab /> },
    { key: 'audit', label: 'Audit', children: <AuditTab /> },
    { key: 'lineage', label: 'Data Lineage', children: <DataLineageTab /> },
    { key: 'json', label: 'JSON', children: <JsonTab /> },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  if (!entityId) return null;

  return (
    <Space direction="vertical" style={{ width: '100%', padding: 16 }} size="middle">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(
        `/instances?entityName=${encodeURIComponent(entityName)}&modelVersion=${modelVersion}`,
      )}>Back to Instances</Button>
      <Title level={2}>Instances / {workflowName || '(no workflow)'}</Title>
      <Text>ID: <Text strong>{entityId}</Text>{modelRef ? ` | Model: ${modelRef.modelVersion}` : ''}</Text>
      <Tabs items={items} />
    </Space>
  );
};

// Inline stubs — E3-E7 will replace these with real imports.
function DetailsTab() { return <div>Details (todo)</div>; }
function WorkflowTab() { return <div>Workflow (todo)</div>; }
function AuditTab() { return <div>Audit (todo)</div>; }
function DataLineageTab() { return <div>Data Lineage (todo)</div>; }
function JsonTab() { return <div>JSON (todo)</div>; }
