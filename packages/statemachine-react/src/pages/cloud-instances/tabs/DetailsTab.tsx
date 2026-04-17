import React, { useState } from 'react';
import { Radio, Space, Switch, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getInstancesGateway, type ModelRef } from '../../../gateways';
import { CloudEntityTree } from '../CloudEntityTree';
import { TransitionList } from '../TransitionList';

const { Title, Text } = Typography;

export interface DetailsTabProps {
  entityId: string;
  modelRef: ModelRef | null;
  workflowName: string;
}

export const DetailsTab: React.FC<DetailsTabProps> = ({ entityId, modelRef, workflowName }) => {
  const [showEmpty, setShowEmpty] = useState(true);
  const [bodyView, setBodyView] = useState<'tree' | 'json'>('tree');
  const query = useQuery({
    queryKey: ['cloud-instances', 'load', entityId],
    queryFn: () => getInstancesGateway().load(entityId),
  });

  if (query.isLoading) return <Text>Loading…</Text>;
  if (query.isError) return <Text type="danger">Failed to load: {(query.error as Error).message}</Text>;

  const { data, meta } = query.data!;
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Title level={4}>Standard fields</Title>
      <Space direction="vertical">
        <Text><Text strong>Id: </Text>{meta?.id ?? '-'}</Text>
        <Text><Text strong>State: </Text>{meta?.state ?? '-'}</Text>
        <Text><Text strong>Created Date: </Text>{meta?.creationDate ?? '-'}</Text>
        <Text><Text strong>Last updated date: </Text>{meta?.lastUpdateTime ?? '-'}</Text>
      </Space>
      <TransitionList
        entityId={entityId}
        modelRef={modelRef}
        workflowName={workflowName}
        entityBody={data}
        currentState={meta?.state ?? ''}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4}>Entity</Title>
        <Space>
          <Radio.Group value={bodyView} onChange={(e) => setBodyView(e.target.value)} options={[
            { label: 'Tree', value: 'tree' },
            { label: 'JSON', value: 'json' },
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
        <pre style={{ padding: 12, fontSize: 12, lineHeight: 1.4, overflowX: 'auto' }}>
          {JSON.stringify(data ?? {}, null, 2)}
        </pre>
      )}
    </Space>
  );
};
