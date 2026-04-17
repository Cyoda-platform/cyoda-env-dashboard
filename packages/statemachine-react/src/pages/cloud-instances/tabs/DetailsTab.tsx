import React, { useState } from 'react';
import { Radio, Space, Switch, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getInstancesGateway, type ModelRef } from '../../../gateways';
import { CloudEntityTree } from '../CloudEntityTree';
import { JsonView } from '../JsonView';
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
  const [showEmpty, setShowEmpty] = useState(true);
  const [bodyView, setBodyView] = useState<'tree' | 'json'>('json');
  const query = useQuery({
    queryKey: ['cloud-instances', 'load', entityId],
    queryFn: () => getInstancesGateway().load(entityId),
  });

  if (query.isLoading) return <Text>Loading…</Text>;
  if (query.isError) return <Text type="danger">Failed to load: {(query.error as Error).message}</Text>;

  const { data, meta } = query.data!;

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <div>
        <Title level={4}>Standard fields</Title>
        <div className="cloud-meta-list">
          <MetaRow label="Id" value={meta?.id} mono />
          <MetaRow label="State" value={meta?.state} />
          <MetaRow label="Created Date" value={meta?.creationDate} mono />
          <MetaRow label="Last Updated" value={meta?.lastUpdateTime} mono />
        </div>
      </div>
      <TransitionList
        entityId={entityId}
        modelRef={modelRef}
        workflowName={workflowName}
        entityBody={data}
        currentState={meta?.state ?? ''}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>Entity</Title>
        <Space>
          <Radio.Group value={bodyView} onChange={(e) => setBodyView(e.target.value)} options={[
            { label: 'JSON', value: 'json' },
            { label: 'Tree', value: 'tree' },
          ]} optionType="button" buttonStyle="solid" size="small" />
          {bodyView === 'tree' && (
            <>
              <Text>Show Empty Fields</Text>
              <Switch checked={showEmpty} onChange={setShowEmpty} />
            </>
          )}
        </Space>
      </div>
      {bodyView === 'tree' ? (
        <CloudEntityTree value={data ?? {}} showEmpty={showEmpty} />
      ) : (
        <JsonView value={data} maxHeight={600} />
      )}
    </Space>
  );
};
