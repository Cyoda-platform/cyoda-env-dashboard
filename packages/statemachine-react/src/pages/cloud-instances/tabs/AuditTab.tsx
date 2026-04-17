import React from 'react';
import { Table, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getInstancesGateway, type EntityChange } from '../../../gateways';

const { Text } = Typography;

export interface AuditTabProps {
  entityId: string;
}

export const AuditTab: React.FC<AuditTabProps> = ({ entityId }) => {
  const query = useQuery({
    queryKey: ['cloud-instances', 'changes', entityId],
    queryFn: () => getInstancesGateway().loadChanges(entityId),
  });

  const columns = [
    { title: 'Transaction ID', dataIndex: 'transactionId', key: 'transactionId' },
    {
      title: 'Time (UUID/Date)', key: 'time',
      render: (_: any, row: EntityChange) => row.timestamp,
    },
    { title: 'State From', dataIndex: 'stateFrom', key: 'stateFrom', render: (v?: string) => v ?? 'None' },
    { title: 'State To', dataIndex: 'stateTo', key: 'stateTo', render: (v?: string) => v ?? '-' },
    { title: 'User', dataIndex: 'user', key: 'user' },
    {
      title: 'Change Type', dataIndex: 'changeType', key: 'changeType',
      render: (v: string) => <Tag color={v === 'CREATE' ? 'green' : v === 'UPDATE' ? 'blue' : 'red'}>{v}</Tag>,
    },
  ];

  if (query.isLoading) return <Text>Loading…</Text>;
  if (query.isError) return <Text type="danger">Failed to load: {(query.error as Error).message}</Text>;

  return (
    <Table
      rowKey="transactionId"
      dataSource={query.data ?? []}
      columns={columns as any}
      size="small"
      pagination={{ pageSize: 10, showSizeChanger: true }}
    />
  );
};
