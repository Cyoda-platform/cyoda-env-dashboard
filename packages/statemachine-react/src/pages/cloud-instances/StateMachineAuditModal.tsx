import React, { useState } from 'react';
import { Modal, Select, Space, Table, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getInstancesGateway, type AuditEvent } from '../../gateways';

const { Text } = Typography;

export interface StateMachineAuditModalProps {
  open: boolean;
  onClose: () => void;
  entityId: string;
  /** When provided, the audit query is scoped to a single transaction. */
  transactionId?: string;
}

export const StateMachineAuditModal: React.FC<StateMachineAuditModalProps> = ({ open, onClose, entityId, transactionId }) => {
  const [severity, setSeverity] = useState<'INFO' | 'ERROR' | 'DEBUG' | 'WARN'>('DEBUG');
  const query = useQuery({
    queryKey: ['cloud-instances', 'audit', entityId, transactionId ?? null, severity],
    queryFn: () => getInstancesGateway().loadAuditEvents(entityId, { severity, limit: 50, transactionId }),
    enabled: open,
  });
  const items = query.data?.items ?? [];

  const columns = [
    {
      title: 'Time', dataIndex: 'utcTime',
      render: (t: string) => t ? new Date(t).toLocaleString() : '',
    },
    {
      title: 'Severity', dataIndex: 'severity',
      render: (s: string) => {
        const color = s === 'ERROR' ? 'red' : s === 'WARN' ? 'orange' : s === 'DEBUG' ? 'default' : 'blue';
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: 'Actor', dataIndex: 'actor',
      render: (a: AuditEvent['actor']) => a?.name ?? '',
    },
    { title: 'Transaction ID', dataIndex: 'transactionId' },
    { title: 'State', dataIndex: 'state', render: (s?: string) => s ?? '-' },
    { title: 'Event Type', dataIndex: 'eventType', render: (e?: string) => e ?? '' },
    { title: 'Details', dataIndex: 'details', render: (d?: string) => <Text style={{ fontSize: 11 }}>{d ?? ''}</Text> },
  ];

  const title = transactionId
    ? `State Machine Audit — Transaction: ${transactionId}`
    : `State Machine Audit — Entity: ${entityId}`;

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={1200} title={title}>
      <Space style={{ marginBottom: 12 }}>
        <Text>Minimum Severity:</Text>
        <Select value={severity} onChange={setSeverity} style={{ width: 120 }}
          options={[
            { value: 'DEBUG', label: 'DEBUG' },
            { value: 'INFO',  label: 'INFO' },
            { value: 'WARN',  label: 'WARN' },
            { value: 'ERROR', label: 'ERROR' },
          ]} />
      </Space>
      <Table dataSource={items} columns={columns as any} rowKey={(r) => `${r.transactionId}/${r.utcTime}/${r.eventType ?? r.changeType ?? ''}`} size="small" loading={query.isLoading} pagination={{ pageSize: 10 }} />
    </Modal>
  );
};
