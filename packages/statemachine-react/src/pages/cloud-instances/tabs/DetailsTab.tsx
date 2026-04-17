import React, { useState } from 'react';
import { Space, Switch, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getInstancesGateway, type ModelRef } from '../../../gateways';
import { CloudEntityTree } from '../CloudEntityTree';

const { Title, Text } = Typography;

export interface DetailsTabProps {
  entityId: string;
  modelRef: ModelRef | null;
  workflowName: string;
}

export const DetailsTab: React.FC<DetailsTabProps> = ({ entityId }) => {
  const [showEmpty, setShowEmpty] = useState(true);
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
        <Text><Text strong>Previous Transition: </Text>{meta?.previousTransition ?? '-'}</Text>
        <Text><Text strong>Created Date: </Text>{meta?.creationDate ?? '-'}</Text>
        <Text><Text strong>Last updated date: </Text>{meta?.lastUpdateTime ?? '-'}</Text>
      </Space>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4}>Entity</Title>
        <Space>
          <Text>Show Empty Fields</Text>
          <Switch checked={showEmpty} onChange={setShowEmpty} />
        </Space>
      </div>
      <CloudEntityTree value={data ?? {}} showEmpty={showEmpty} />
    </Space>
  );
};
