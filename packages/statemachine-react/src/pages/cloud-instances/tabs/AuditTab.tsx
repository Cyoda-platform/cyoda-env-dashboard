import React, { useState } from 'react';
import { Button, Space, Table, Tag, Typography } from 'antd';
import { EyeOutlined, BranchesOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getInstancesGateway, type EntityChange } from '../../../gateways';
import { EntityAtTransactionModal } from '../EntityAtTransactionModal';
import { StateMachineAuditModal } from '../StateMachineAuditModal';

const { Text } = Typography;

export interface AuditTabProps {
  entityId: string;
}

export const AuditTab: React.FC<AuditTabProps> = ({ entityId }) => {
  const query = useQuery({
    queryKey: ['cloud-instances', 'changes', entityId],
    queryFn: () => getInstancesGateway().loadChanges(entityId),
  });
  const [viewTxn, setViewTxn] = useState<string | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);

  const columns = [
    { title: 'Transaction ID', dataIndex: 'transactionId', key: 'transactionId' },
    {
      title: 'Time', dataIndex: 'timestamp', key: 'time',
      render: (t: string) => t ? new Date(t).toLocaleString() : '',
    },
    { title: 'User', dataIndex: 'user', key: 'user' },
    {
      title: 'Change Type', dataIndex: 'changeType', key: 'changeType',
      render: (v: string) => <Tag color={v === 'CREATE' || v === 'CREATED' ? 'green' : v === 'UPDATE' || v === 'UPDATED' ? 'blue' : 'red'}>{v}</Tag>,
    },
    {
      title: '# Changed Fields', dataIndex: 'fieldsChangedCount', key: 'fieldsChangedCount',
      render: (n?: number) => n !== undefined ? <Tag>{n}</Tag> : '-',
    },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, row: EntityChange) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} title="View entity at this transaction" onClick={() => setViewTxn(row.transactionId)} />
          <Button size="small" icon={<BranchesOutlined />} title="State Machine Audit" onClick={() => setAuditOpen(true)} />
        </Space>
      ),
    },
  ];

  if (query.isLoading) return <Text>Loading…</Text>;
  if (query.isError) return <Text type="danger">Failed to load: {(query.error as Error).message}</Text>;

  return (
    <>
      <Table rowKey="transactionId" dataSource={query.data ?? []} columns={columns as any} size="small" pagination={{ pageSize: 10, showSizeChanger: true }} />
      {viewTxn && (
        <EntityAtTransactionModal open={!!viewTxn} onClose={() => setViewTxn(null)} entityId={entityId} transactionId={viewTxn} />
      )}
      <StateMachineAuditModal open={auditOpen} onClose={() => setAuditOpen(false)} entityId={entityId} />
    </>
  );
};
