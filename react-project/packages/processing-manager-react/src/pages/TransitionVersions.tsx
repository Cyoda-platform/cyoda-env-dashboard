/**
 * Transition Versions Page
 * Migrated from @cyoda/processing-manager/src/views/TransitionVersions.vue
 */

import { useState } from 'react';
import { Card, Typography, Table, Input, Select, Space, Breadcrumb, Spin, Alert, Tag } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { useParams, useNavigate } from 'react-router-dom';
import { useEntityVersions } from '../hooks';
import type { EntityVersion } from '../types';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function TransitionVersions() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    entityType: undefined as string | undefined,
    entityId: '',
    search: '',
  });

  const { data, isLoading, error } = useEntityVersions({
    entityType: filters.entityType,
    entityId: filters.entityId,
  });

  const columns: ColumnsType<EntityVersion> = [
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      width: 100,
      sorter: (a, b) => a.version - b.version,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Entity ID',
      dataIndex: 'entityId',
      key: 'entityId',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 150,
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 120,
      render: (user?: string) => user || '-',
    },
    {
      title: 'Changes',
      dataIndex: 'changes',
      key: 'changes',
      width: 100,
      render: (changes: any[]) => changes?.length || 0,
    },
  ];

  const filteredData = data?.filter((version) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        version.entityId?.toLowerCase().includes(searchLower) ||
        version.entityType?.toLowerCase().includes(searchLower) ||
        version.user?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const breadcrumbItems = [
    {
      title: (
        <span>
          <HomeOutlined />
          <span style={{ marginLeft: 8 }}>Processing</span>
        </span>
      ),
      onClick: () => navigate('/processing-ui'),
    },
    {
      title: 'Nodes',
      onClick: () => navigate('/processing-ui/nodes'),
    },
    {
      title: name,
      onClick: () => navigate(`/processing-ui/nodes/${name}`),
    },
    {
      title: 'Entity Versions',
    },
  ];

  return (
    
      <div style={{ padding: '24px' }}>
        <Breadcrumb
          items={breadcrumbItems}
          style={{ marginBottom: 16 }}
        />

        <Card>
          <Title level={2}>Entity Versions</Title>
          <p style={{ color: '#666', marginBottom: 24 }}>
            Node: <strong>{name}</strong>
          </p>

          <Space style={{ marginBottom: 16 }} wrap>
            <Search
              placeholder="Search versions..."
              allowClear
              style={{ width: 250 }}
              onSearch={(value) => setFilters({ ...filters, search: value })}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />

            <Input
              placeholder="Entity ID"
              allowClear
              style={{ width: 200 }}
              onChange={(e) => setFilters({ ...filters, entityId: e.target.value })}
            />

            <Select
              placeholder="Entity Type"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => setFilters({ ...filters, entityType: value })}
            >
              <Option value="BUSINESS">BUSINESS</Option>
              <Option value="TECHNICAL">TECHNICAL</Option>
              <Option value="REFERENCE">REFERENCE</Option>
            </Select>
          </Space>

          {error && (
            <Alert
              message="Error"
              description="Failed to load entity versions"
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" tip="Loading versions..." />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey={(record) => `${record.entityId}-${record.version}`}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} versions`,
              }}
              scroll={{ x: 900 }}
            />
          )}
        </Card>
      </div>
    
  );
}

