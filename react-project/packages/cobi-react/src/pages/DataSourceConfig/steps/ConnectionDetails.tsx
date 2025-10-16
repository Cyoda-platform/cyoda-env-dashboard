import React, { useState } from 'react';
import { Button, Table, Space, Tag, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataSourceConfigDto } from '../../../types';
import ConnectionDialog from '../dialogs/ConnectionDialog';

const { confirm } = Modal;

interface ConnectionDetailsProps {
  config: DataSourceConfigDto;
  onChange: (updates: Partial<DataSourceConfigDto>) => void;
}

const ConnectionDetails: React.FC<ConnectionDetailsProps> = ({ config, onChange }) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingConnection, setEditingConnection] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  // Get connection type from @bean
  const getConnectionType = (connection: any): string => {
    const bean = connection['@bean'] || '';
    if (bean.includes('Http')) return 'HTTP';
    if (bean.includes('Sql')) return 'SQL';
    if (bean.includes('Workflow')) return 'Workflow';
    if (bean.includes('BlobStorage')) return 'Blob Storage';
    return 'Unknown';
  };

  // Handle add connection
  const handleAdd = () => {
    setEditingConnection(null);
    setEditingIndex(-1);
    setDialogVisible(true);
  };

  // Handle edit connection
  const handleEdit = (connection: any, index: number) => {
    setEditingConnection(connection);
    setEditingIndex(index);
    setDialogVisible(true);
  };

  // Handle delete connection
  const handleDelete = (index: number) => {
    confirm({
      title: 'Delete Connection',
      content: 'Are you sure you want to delete this connection?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        const newConnections = [...config.connections];
        newConnections.splice(index, 1);
        onChange({ connections: newConnections });
        message.success('Connection deleted');
      },
    });
  };

  // Handle save from dialog
  const handleSave = (connection: any) => {
    const newConnections = [...config.connections];
    
    if (editingIndex >= 0) {
      // Update existing
      newConnections[editingIndex] = connection;
      message.success('Connection updated');
    } else {
      // Add new
      newConnections.push(connection);
      message.success('Connection added');
    }
    
    onChange({ connections: newConnections });
    setDialogVisible(false);
  };

  // Table columns
  const columns: ColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      key: 'type',
      render: (_, record) => (
        <Tag color="blue">{getConnectionType(record)}</Tag>
      ),
    },
    {
      title: 'Base URL / JDBC URL',
      key: 'url',
      render: (_, record) => {
        if (record.baseUrl) return record.baseUrl;
        if (record.jdbcUrl) return record.jdbcUrl;
        if (record.entityClass) return record.entityClass;
        return '-';
      },
    },
    {
      title: 'Auth Type',
      dataIndex: 'authType',
      key: 'authType',
      render: (authType) => authType || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
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
        </Space>
      ),
    },
  ];

  return (
    <div className="connection-details-step">
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Connection
        </Button>
      </div>

      <Table
        dataSource={config.connections}
        columns={columns}
        rowKey={(_, index) => `connection-${index}`}
        pagination={false}
        locale={{ emptyText: 'No connections configured. Click "Add Connection" to get started.' }}
      />

      <ConnectionDialog
        visible={dialogVisible}
        connection={editingConnection}
        onSave={handleSave}
        onCancel={() => setDialogVisible(false)}
      />
    </div>
  );
};

export default ConnectionDetails;

