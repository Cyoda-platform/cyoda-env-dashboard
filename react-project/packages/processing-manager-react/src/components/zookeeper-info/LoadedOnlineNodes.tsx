/**
 * Loaded Online Nodes Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabZKInfo/PmLoadedOnlineNodes.vue
 */

import React from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useZkOnlineNodes } from '../../hooks/usePlatformCommon';

interface OnlineNode {
  id: string;
  hostname: string;
  ip: string;
  port: number;
  status: string;
  lastHeartbeat?: string;
}

interface LoadedOnlineNodesProps {
  clusterStateClientNodes?: any;
}

export const LoadedOnlineNodes: React.FC<LoadedOnlineNodesProps> = ({
  clusterStateClientNodes = {},
}) => {
  const { data: nodesData = [], isLoading } = useZkOnlineNodes();

  const columns: ColumnsType<OnlineNode> = [
    {
      title: 'Hostname',
      dataIndex: 'hostname',
      key: 'hostname',
      sorter: (a, b) => a.hostname.localeCompare(b.hostname),
    },
    {
      title: 'IP Address',
      dataIndex: 'ip',
      key: 'ip',
      sorter: (a, b) => a.ip.localeCompare(b.ip),
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
      sorter: (a, b) => a.port - b.port,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'ONLINE' ? 'green' : status === 'OFFLINE' ? 'red' : 'default';
        return <Tag color={color}>{status || 'UNKNOWN'}</Tag>;
      },
    },
    {
      title: 'Last Heartbeat',
      dataIndex: 'lastHeartbeat',
      key: 'lastHeartbeat',
      render: (date: string) => date || '-',
    },
  ];

  return (
    <div>
      <h3>Loaded Online Nodes</h3>
      <Table
        columns={columns}
        dataSource={Array.isArray(nodesData) ? nodesData : []}
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

export default LoadedOnlineNodes;

