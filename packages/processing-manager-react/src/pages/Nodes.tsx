/**
 * Nodes Page
 * Migrated from @cyoda/processing-manager/src/views/Nodes.vue
 * Redesigned to integrate with saas-app layout
 */

import React from 'react';
import { Table, Spin, Alert, Tag } from 'antd';
import { ClusterOutlined } from '@ant-design/icons';
import { useClusterStats } from '../hooks';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import './Nodes.scss';

interface NodeData {
  name: string;
  status: string;
  baseUrl?: string;
}

// Helper function to check if node is online
// If status is not provided or unknown, we check if node has baseUrl (means it's reachable)
// Otherwise we check if status indicates online state
const isNodeOnline = (status?: string, baseUrl?: string): boolean => {
  // If no status provided, check if node has baseUrl (means it's in the cluster and reachable)
  if (!status || status === 'Unknown') {
    return !!baseUrl;
  }

  const upperStatus = status.toUpperCase();
  // Check for various online status values
  return upperStatus === 'ONLINE' ||
         upperStatus === 'RUNNING' ||
         upperStatus === 'UP' ||
         upperStatus === 'ACTIVE';
};

export default function Nodes() {
  const { data, isLoading, error } = useClusterStats();
  const navigate = useNavigate();

  const handleRowClick = (record: NodeData) => {
    navigate(`/processing-ui/nodes/${record.name}`);
  };

  const columns: ColumnsType<NodeData> = [
    {
      title: '',
      key: 'icon',
      width: 50,
      render: () => <ClusterOutlined style={{ fontSize: '20px', color: '#1890ff' }} />,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status: string | null, record: NodeData) => {
        if (!status || status === 'Unknown') {
          // If status is unknown but node has baseUrl, consider it online
          return isNodeOnline(status, record.baseUrl)
            ? <Tag color="success">Online</Tag>
            : <Tag color="default">Unknown</Tag>;
        }
        return isNodeOnline(status, record.baseUrl)
          ? <Tag color="success">Online</Tag>
          : <Tag color="error">Offline</Tag>;
      },
    },
  ];

  const tableData: NodeData[] = data?.pmNodes?.map((node: any) => ({
    name: node.hostname || node.name,
    status: node.status || 'Unknown',
    baseUrl: node.baseUrl,
  })) || [];

  return (
    <div className="processing-nodes">
      <h1 className="page-title">Processing Nodes</h1>

      {isLoading && (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      )}

      {error && (
        <div className="error-container">
          <Alert
            message="Error"
            description="Failed to load cluster statistics"
            type="error"
            showIcon
          />
        </div>
      )}

      {data && (
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="name"
          bordered
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} nodes`,
            position: ['bottomCenter'],
          }}
        />
      )}
    </div>
  );
}

