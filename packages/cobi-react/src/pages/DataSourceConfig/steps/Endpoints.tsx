import React, { useState } from 'react';
import { Button, Table, Space, Tag, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataSourceConfigDto } from '../../../types';
import EndpointDialog from '../dialogs/EndpointDialog';
import TestConnectionDialog from '../dialogs/TestConnectionDialog';
import RawDataDialog from '../dialogs/RawDataDialog';

const { confirm } = Modal;

interface EndpointsProps {
  config: DataSourceConfigDto;
  onChange: (updates: Partial<DataSourceConfigDto>) => void;
}

const Endpoints: React.FC<EndpointsProps> = ({ config, onChange }) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [testDialogVisible, setTestDialogVisible] = useState(false);
  const [testingEndpoint, setTestingEndpoint] = useState<any>(null);
  const [testingConnection, setTestingConnection] = useState<any>(null);
  const [rawDataVisible, setRawDataVisible] = useState(false);
  const [rawDataContent, setRawDataContent] = useState('');

  // Get endpoint type from @bean
  const getEndpointType = (endpoint: any): string => {
    const bean = endpoint['@bean'] || '';
    if (bean.includes('Http')) return 'HTTP';
    if (bean.includes('Sql')) return 'SQL';
    if (bean.includes('Workflow')) return 'Workflow';
    if (bean.includes('BlobStorage')) return 'Blob Storage';
    return 'Unknown';
  };

  // Handle add endpoint
  const handleAdd = () => {
    if (config.connections.length === 0) {
      message.warning('Please add at least one connection first');
      return;
    }
    setEditingEndpoint(null);
    setEditingIndex(-1);
    setDialogVisible(true);
  };

  // Handle edit endpoint
  const handleEdit = (endpoint: any, index: number) => {
    setEditingEndpoint(endpoint);
    setEditingIndex(index);
    setDialogVisible(true);
  };

  // Handle delete endpoint
  const handleDelete = (index: number) => {
    confirm({
      title: 'Delete Endpoint',
      content: 'Are you sure you want to delete this endpoint?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        const newEndpoints = [...config.endpoints];
        newEndpoints.splice(index, 1);
        onChange({ endpoints: newEndpoints });
        message.success('Endpoint deleted');
      },
    });
  };

  // Handle test endpoint
  const handleTest = (endpoint: any) => {
    // Find the connection for this endpoint
    const connection = config.connections[0]; // Assuming first connection for now
    if (!connection) {
      message.error('No connection available for testing');
      return;
    }
    setTestingEndpoint(endpoint);
    setTestingConnection(connection);
    setTestDialogVisible(true);
  };

  const handleTestSuccess = (responseContent: string) => {
    setRawDataContent(responseContent);
    setRawDataVisible(true);
  };

  const handleViewRawData = () => {
    if (rawDataContent) {
      setRawDataVisible(true);
    } else {
      message.warning('No test data available. Please test an endpoint first.');
    }
  };

  // Handle save from dialog
  const handleSave = (endpoint: any) => {
    const newEndpoints = [...config.endpoints];
    
    if (editingIndex >= 0) {
      // Update existing
      newEndpoints[editingIndex] = endpoint;
      message.success('Endpoint updated');
    } else {
      // Add new
      newEndpoints.push(endpoint);
      message.success('Endpoint added');
    }
    
    onChange({ endpoints: newEndpoints });
    setDialogVisible(false);
  };

  // Table columns
  const columns: ColumnsType<any> = [
    {
      title: 'Operation',
      dataIndex: 'operation',
      key: 'operation',
    },
    {
      title: 'Type',
      key: 'type',
      render: (_, record) => (
        <Tag color="green">{getEndpointType(record)}</Tag>
      ),
    },
    {
      title: 'Query / Path',
      key: 'query',
      ellipsis: true,
      render: (_, record) => {
        if (record.query) return record.query;
        if (record.type) return record.type;
        return '-';
      },
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (method) => method || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record, index) => (
        <Space size="small">
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record, index)}
          />
          <Button
            type="default"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(index)}
          />
          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleTest(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="endpoints-step">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            disabled={config.connections.length === 0}
          >
            Add Endpoint
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={handleViewRawData}
            disabled={!rawDataContent}
          >
            View Test Data
          </Button>
        </Space>
        {config.connections.length === 0 && (
          <span style={{ marginLeft: 12, color: '#999' }}>
            Add a connection first
          </span>
        )}
      </div>

      <Table
        dataSource={config.endpoints}
        columns={columns}
        rowKey={(_, index) => `endpoint-${index}`}
        pagination={false}
        locale={{ emptyText: 'No endpoints configured. Click "Add Endpoint" to get started.' }}
      />

      <EndpointDialog
        visible={dialogVisible}
        endpoint={editingEndpoint}
        connections={config.connections}
        onSave={handleSave}
        onCancel={() => setDialogVisible(false)}
      />

      <TestConnectionDialog
        visible={testDialogVisible}
        endpoint={testingEndpoint}
        connection={testingConnection}
        onClose={() => setTestDialogVisible(false)}
        onSuccess={handleTestSuccess}
      />

      <RawDataDialog
        visible={rawDataVisible}
        content={rawDataContent}
        onClose={() => setRawDataVisible(false)}
      />
    </div>
  );
};

export default Endpoints;

