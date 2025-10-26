/**
 * Nodes Page
 * Migrated from @cyoda/processing-manager/src/views/Nodes.vue
 * Redesigned to integrate with saas-app layout
 */

import React from 'react';
import { Card, Table, Spin, Alert, Typography, Tag } from 'antd';
import { ClusterOutlined } from '@ant-design/icons';
import { useClusterStats } from '../hooks';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface NodeData {
  name: string;
  status: string;
}

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
      render: (status: string | null) => {
        if (status === null || status === 'Unknown') {
          return <Tag color="default">Unknown</Tag>;
        }
        return status === 'ONLINE'
          ? <Tag color="success">Online</Tag>
          : <Tag color="error">Offline</Tag>;
      },
    },
  ];

  const tableData: NodeData[] = data?.pmNodes?.map((node: any) => ({
    name: node.hostname || node.name,
    status: node.status || 'Unknown',
  })) || [];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        Processing Nodes
      </Title>

      <Card>
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        )}

        {error && (
          <Alert
            message="Error"
            description="Failed to load cluster statistics"
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
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
            }}
          />
        )}
      </Card>
    </div>
  );
}

