import React from 'react';
import { Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getInstancesGateway } from '../../../gateways';

const { Text } = Typography;

export interface JsonTabProps {
  entityId: string;
}

export const JsonTab: React.FC<JsonTabProps> = ({ entityId }) => {
  const query = useQuery({
    queryKey: ['cloud-instances', 'load', entityId],
    queryFn: () => getInstancesGateway().load(entityId),
  });
  if (query.isLoading) return <Text>Loading…</Text>;
  if (query.isError) return <Text type="danger">Failed to load: {(query.error as Error).message}</Text>;
  return (
    <pre style={{ padding: 12, fontSize: 12, lineHeight: 1.4, overflowX: 'auto' }}>
      {JSON.stringify(query.data?.data ?? {}, null, 2)}
    </pre>
  );
};
