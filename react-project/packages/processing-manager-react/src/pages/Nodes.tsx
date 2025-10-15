/**
 * Nodes Page
 * Migrated from @cyoda/processing-manager/src/views/Nodes.vue
 */

import React from 'react';
import { Card, Table, Spin, Alert, Typography } from 'antd';
import { ClusterOutlined } from '@ant-design/icons';
import { Layout } from '../components/layout';
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
    navigate(`/nodes/${record.name}`);
  };

  const columns: ColumnsType<NodeData> = [
    {
      title: '',
      key: 'icon',
      width: 50,
      render: () => <ClusterOutlined style={{ fontSize: '20px' }} />,
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
      render: (status: string | null) => status === null ? 'Unknown' : status,
    },
  ];

  const tableData: NodeData[] = data?.pmNodes?.map((node: any) => ({
    name: node.hostname || node.name,
    status: node.status || 'Unknown',
  })) || [];

  return (
    <Layout>
      <div style={{ padding: '24px' }}>
        <Title level={1}>Nodes</Title>
        <Card>
          {isLoading && <Spin size="large" />}

          {error && (
            <Alert
              message="Error"
              description="Failed to load cluster statistics"
              type="error"
              showIcon
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
              pagination={false}
            />
          )}
        </Card>
      </div>
    </Layout>
  );
}

