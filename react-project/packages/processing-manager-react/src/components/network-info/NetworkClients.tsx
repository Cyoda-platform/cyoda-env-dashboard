/**
 * Network Clients Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabNetworkInfo/PmNetworkClients.vue
 */

import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNetworkClients } from '../../hooks/usePlatformCommon';

interface NetworkClient {
  id: string;
  address: string;
  port: number;
  connected: boolean;
  lastSeen?: string;
}

export const NetworkClients: React.FC = () => {
  const { data: clientsData = [], isLoading } = useNetworkClients();

  const columns: ColumnsType<NetworkClient> = [
    {
      title: 'Client ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      sorter: (a, b) => a.address.localeCompare(b.address),
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
      sorter: (a, b) => a.port - b.port,
    },
    {
      title: 'Status',
      dataIndex: 'connected',
      key: 'connected',
      render: (connected: boolean) => (
        <span style={{ color: connected ? '#52c41a' : '#ff4d4f' }}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      ),
    },
    {
      title: 'Last Seen',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      render: (date: string) => date || '-',
    },
  ];

  return (
    <div>
      <h3>Network Clients</h3>
      <Table
        columns={columns}
        dataSource={Array.isArray(clientsData) ? clientsData : []}
        rowKey="id"
        bordered
        loading={isLoading}
        pagination={{
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />
    </div>
  );
};

export default NetworkClients;

