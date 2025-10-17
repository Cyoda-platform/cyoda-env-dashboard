import React, { useState, useMemo } from 'react';
import { Card, Table, Button, Input, Space, Tag, Modal, message, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  PlayCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useDataSourceConfigs, useDeleteDataSourceConfig } from '../../hooks/useDataSourceConfig';
import type { DataSourceConfigDto } from '../../types';
import { AIGenerateButton } from '../../components/AIGenerate';
import dayjs from 'dayjs';
import './DataSourceConfigIndex.css';

const { confirm } = Modal;

const DataSourceConfigIndex: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Fetch data source configurations
  const { data: configs = [], isLoading } = useDataSourceConfigs();
  const deleteConfig = useDeleteDataSourceConfig();

  // Filter configurations
  const filteredConfigs = useMemo(() => {
    if (!filter) return configs;

    const lowerFilter = filter.toLowerCase();
    return configs.filter((config: DataSourceConfigDto) => {
      return (
        config.name.toLowerCase().includes(lowerFilter) ||
        config.description.toLowerCase().includes(lowerFilter) ||
        config.endpoints.some((endpoint: any) =>
          endpoint.operation?.toLowerCase().includes(lowerFilter)
        )
      );
    });
  }, [configs, filter]);

  // Get connection type from @bean
  const getConnectionType = (connection: any): string => {
    const bean = connection['@bean'] || '';
    if (bean.includes('Http')) return 'HTTP';
    if (bean.includes('Sql')) return 'SQL';
    if (bean.includes('Workflow')) return 'Workflow';
    if (bean.includes('BlobStorage')) return 'Blob Storage';
    return 'Unknown';
  };

  // Get auth type display name
  const getAuthTypeName = (authType?: string): string => {
    if (!authType) return '-';
    return authType.replace(/_/g, ' ');
  };

  // Handle delete
  const handleDelete = (config: DataSourceConfigDto) => {
    confirm({
      title: 'Delete Configuration',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${config.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          if (config.id) {
            await deleteConfig.mutateAsync(config.id);
            message.success('Configuration deleted successfully');
          }
        } catch (error) {
          message.error('Failed to delete configuration');
        }
      },
    });
  };

  // Handle delete selected
  const handleDeleteSelected = () => {
    confirm({
      title: 'Delete Selected Configurations',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete ${selectedRowKeys.length} configuration(s)?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          for (const key of selectedRowKeys) {
            await deleteConfig.mutateAsync(key as string);
          }
          message.success('Configurations deleted successfully');
          setSelectedRowKeys([]);
        } catch (error) {
          message.error('Failed to delete configurations');
        }
      },
    });
  };

  // Handle copy
  const handleCopy = (config: DataSourceConfigDto) => {
    const copiedConfig = {
      ...config,
      id: null,
      name: `${config.name} (Copy)`,
      virtual: { isVirtual: true, autoSaveKey: `virtual-${Date.now()}` },
    };

    // Navigate to edit page with copied config
    navigate('/data-mapper/data-source-config-creation/configuration', {
      state: { config: copiedConfig },
    });
  };

  // Handle run/play
  const handleRun = (_config: DataSourceConfigDto) => {
    message.info('Run configuration feature coming soon');
  };

  // Table columns
  const columns: ColumnsType<DataSourceConfigDto> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: DataSourceConfigDto) => (
        <div>
          <div>{name}</div>
          {record.virtual?.isVirtual && (
            <Tag color="orange" style={{ marginTop: 4 }}>Draft</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Updated At',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      sorter: (a, b) => (a.lastUpdated || 0) - (b.lastUpdated || 0),
      defaultSortOrder: 'descend',
      render: (lastUpdated?: number) =>
        lastUpdated ? dayjs(lastUpdated).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => navigate(`/data-mapper/data-source-config-creation/${record.id || record.virtual?.autoSaveKey}`)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
          <Tooltip title="Copy">
            <Button
              type="default"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record)}
            />
          </Tooltip>
          {!record.virtual && (
            <Tooltip title="Run">
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => handleRun(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Expandable row render
  const expandedRowRender = (record: DataSourceConfigDto) => {
    return (
      <div className="expanded-row-content">
        <div className="expanded-section">
          <h4>Connections</h4>
          <Table
            dataSource={record.connections}
            pagination={false}
            size="small"
            rowKey={(_, index) => `connection-${index}`}
            columns={[
              {
                title: 'Type',
                key: 'type',
                render: (connection) => (
                  <Tag color="blue">{getConnectionType(connection)}</Tag>
                ),
              },
              {
                title: 'Base URL',
                dataIndex: 'baseUrl',
                key: 'baseUrl',
                render: (url) => url || '-',
              },
              {
                title: 'Auth Type',
                dataIndex: 'authType',
                key: 'authType',
                render: (authType) => getAuthTypeName(authType),
              },
            ]}
          />
        </div>

        <div className="expanded-section">
          <h4>Endpoints</h4>
          <Table
            dataSource={record.endpoints as any[]}
            pagination={false}
            size="small"
            rowKey={(_, index) => `endpoint-${index}`}
            columns={[
              {
                title: 'Operation',
                dataIndex: 'operation',
                key: 'operation',
              },
              {
                title: 'Query',
                dataIndex: 'query',
                key: 'query',
                ellipsis: true,
                render: (query) => query || '-',
              },
              {
                title: 'Method',
                dataIndex: 'method',
                key: 'method',
                render: (method) => method || '-',
              },
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                render: (type) => type || '-',
              },
            ]}
          />
        </div>
      </div>
    );
  };

  const handleAIGenerateSuccess = () => {
    console.log('AI Generate completed successfully');
    // TODO: Refresh the data source configs list
  };

  return (
    <div className="data-source-config-index">
      <Card>
        <div className="header-section">
          <h2>Data Source Configurations</h2>
          <Space>
            <Button
              type="default"
              danger
              disabled={selectedRowKeys.length === 0}
              onClick={handleDeleteSelected}
            >
              Delete Selected
            </Button>
            <AIGenerateButton type="dataSource" onSuccess={handleAIGenerateSuccess} />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/data-mapper/data-source-config-creation/configuration')}
            >
              Create Configuration
            </Button>
          </Space>
        </div>

        <div className="filter-section">
          <Input
            placeholder="Filter by name, description, or operation"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: '100%', maxWidth: 400 }}
            allowClear
          />
        </div>

        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          columns={columns}
          dataSource={filteredConfigs}
          loading={isLoading}
          rowKey={(record) => record.id || record.virtual?.autoSaveKey || ''}
          expandable={{
            expandedRowRender,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `Total ${total} configurations`,
          }}
        />
      </Card>
    </div>
  );
};

export default DataSourceConfigIndex;

