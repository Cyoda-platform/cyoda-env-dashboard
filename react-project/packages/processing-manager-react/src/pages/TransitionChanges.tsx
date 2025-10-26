/**
 * Transition Changes Page
 * Migrated from @cyoda/processing-manager/src/views/TransitionChanges.vue
 */

import { useState } from 'react';
import { Card, Typography, Table, Input, Select, Space, Breadcrumb, Spin, Alert, Tag } from 'antd';
import { HomeOutlined, ArrowRightOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { useParams, useNavigate } from 'react-router-dom';
import { useEntityChanges } from '../hooks';
import type { EntityChange } from '../types';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function TransitionChanges() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    entityId: '',
    field: '',
    search: '',
  });

  const { data, isLoading, error } = useEntityChanges({
    entityId: filters.entityId,
  });

  const renderValue = (value: any) => {
    if (value === null || value === undefined) {
      return <Tag color="default">null</Tag>;
    }
    if (typeof value === 'object') {
      return (
        <pre style={{
          margin: 0,
          fontSize: '12px',
          maxWidth: '200px',
          overflow: 'auto'
        }}>
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    return String(value);
  };

  const columns: ColumnsType<EntityChange> = [
    {
      title: 'Field',
      dataIndex: 'field',
      key: 'field',
      width: 150,
      filters: Array.from(new Set(data?.map(c => c.field) || [])).map(field => ({
        text: field,
        value: field,
      })),
      onFilter: (value, record) => record.field === value,
    },
    {
      title: 'Old Value',
      dataIndex: 'oldValue',
      key: 'oldValue',
      width: 250,
      render: (value) => (
        <div style={{
          background: '#fff1f0',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ffccc7'
        }}>
          {renderValue(value)}
        </div>
      ),
    },
    {
      title: '',
      key: 'arrow',
      width: 50,
      align: 'center',
      render: () => <ArrowRightOutlined style={{ color: '#1890ff' }} />,
    },
    {
      title: 'New Value',
      dataIndex: 'newValue',
      key: 'newValue',
      width: 250,
      render: (value) => (
        <div style={{
          background: '#f6ffed',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #b7eb8f'
        }}>
          {renderValue(value)}
        </div>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      defaultSortOrder: 'descend',
    },
  ];

  const filteredData = data?.filter((change) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        change.field?.toLowerCase().includes(searchLower) ||
        String(change.oldValue)?.toLowerCase().includes(searchLower) ||
        String(change.newValue)?.toLowerCase().includes(searchLower)
      );
    }
    if (filters.field) {
      return change.field === filters.field;
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
      title: 'Entity Changes',
    },
  ];

  return (
    
      <div style={{ padding: '24px' }}>
        <Breadcrumb
          items={breadcrumbItems}
          style={{ marginBottom: 16 }}
        />

        <Card>
          <Title level={2}>Entity Changes</Title>
          <p style={{ color: '#666', marginBottom: 24 }}>
            Node: <strong>{name}</strong>
          </p>

          <Space style={{ marginBottom: 16 }} wrap>
            <Search
              placeholder="Search changes..."
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
              placeholder="Field"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => setFilters({ ...filters, field: value })}
            >
              {Array.from(new Set(data?.map(c => c.field) || [])).map(field => (
                <Option key={field} value={field}>{field}</Option>
              ))}
            </Select>
          </Space>

          {error && (
            <Alert
              message="Error"
              description="Failed to load entity changes"
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" tip="Loading changes..." />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey={(record) => `${record.field}-${record.timestamp}`}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} changes`,
              }}
              scroll={{ x: 1000 }}
            />
          )}
        </Card>
      </div>
    
  );
}

