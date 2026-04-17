import React, { useState } from 'react';
import { Alert, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getInstancesGateway, type ModelRef } from '../../../gateways';
import { JsonEditor } from '../JsonEditor';
import { TransitionList } from '../TransitionList';
import './DetailsTab.css';

const { Title, Text } = Typography;

const MetaRow: React.FC<{ label: string; value?: string | null; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="cloud-meta-row">
    <div className="cloud-meta-label">{label}</div>
    <div className={`cloud-meta-value${mono ? ' cloud-meta-mono' : ''}`}>{value ?? '—'}</div>
  </div>
);

export interface DetailsTabProps {
  entityId: string;
  modelRef: ModelRef | null;
  workflowName: string;
}

export const DetailsTab: React.FC<DetailsTabProps> = ({ entityId, modelRef, workflowName }) => {
  const query = useQuery({
    queryKey: ['cloud-instances', 'load', entityId],
    queryFn: () => getInstancesGateway().load(entityId),
  });

  const [editedBody, setEditedBody] = useState<Record<string, unknown> | undefined>(undefined);
  const [parseValid, setParseValid] = useState(true);

  if (query.isLoading) return <Text>Loading…</Text>;
  if (query.isError) return <Text type="danger">Failed to load: {(query.error as Error).message}</Text>;

  const { data, meta } = query.data!;
  const dataUpdatedAt = query.dataUpdatedAt;

  const onJsonChange = ({ parsed, valid }: { parsed: unknown; valid: boolean }) => {
    setParseValid(valid);
    if (valid && parsed && typeof parsed === 'object') {
      setEditedBody(parsed as Record<string, unknown>);
    }
  };

  const bodyForFire = editedBody ?? data;

  return (
    <div className="cloud-details-tab">
      <Title level={4}>Standard fields</Title>
      <div className="cloud-meta-list">
        <MetaRow label="Id" value={meta?.id} mono />
        <MetaRow label="State" value={meta?.state} />
        <MetaRow label="Created Date" value={meta?.creationDate} mono />
        <MetaRow label="Last Updated" value={meta?.lastUpdateTime} mono />
      </div>
      <TransitionList
        entityId={entityId}
        modelRef={modelRef}
        workflowName={workflowName}
        entityBody={bodyForFire}
        currentState={meta?.state ?? ''}
        disabled={!parseValid}
      />
      <div>
        <div className="cloud-entity-header">
          <Title level={4} style={{ margin: 0 }}>Entity</Title>
          {!parseValid && <Alert type="warning" message="Invalid JSON — fix to enable transitions" showIcon />}
        </div>
        <JsonEditor
          value={data}
          onChange={onJsonChange}
          height={520}
          resetKey={dataUpdatedAt}
        />
      </div>
    </div>
  );
};
