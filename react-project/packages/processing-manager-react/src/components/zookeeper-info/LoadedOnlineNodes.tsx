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
  const { data: nodesData, isLoading } = useZkOnlineNodes();

  const columns: ColumnsType<OnlineNode> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
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

  // Render a table for each node type (DEFAULT, PROCESSING, TOOLBOX)
  const renderTable = (title: string, data: OnlineNode[] = []) => (
    <div key={title} style={{ marginBottom: 24 }}>
      <h4>{title}</h4>
      <Table
        columns={columns}
        dataSource={data}
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

  return (
    <div>
      <h3>Loaded Online Nodes</h3>
      {nodesData && typeof nodesData === 'object' && !Array.isArray(nodesData) ? (
        <>
          {renderTable('Default', (nodesData as any).DEFAULT)}
          {renderTable('Processing', (nodesData as any).PROCESSING)}
          {renderTable('Toolbox', (nodesData as any).TOOLBOX)}
        </>
      ) : (
        renderTable('All Nodes', Array.isArray(nodesData) ? nodesData : [])
      )}
    </div>
  );
};

export default LoadedOnlineNodes;

