/**
 * Configurations List Page
 * Displays all source configurations (CSV, XML, JDBC)
 */

import React, { useMemo } from 'react';
import { Table, Input, Button, Space, Tag, Typography, Card } from 'antd';
import { EditOutlined, PlayCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAllConfigs, useRunJdbcConfig } from '../hooks/useSourceConfig';
import { useSourceConfigStore } from '../stores/sourceConfigStore';
import type { UploadConfig, JdbcSourceConfig } from '../types';
import { formatDate } from '../utils/helpers';
import ConfigForm from '../components/ConfigForm';
import FileUploadDialog from '../components/FileUploadDialog';
import './ConfigurationsList.css';

const { Title } = Typography;
const { Search } = Input;

const ConfigurationsList: React.FC = () => {
  const { data: configs, isLoading } = useAllConfigs();
  const { mutate: runJdbcConfig } = useRunJdbcConfig();
  
  const filterText = useSourceConfigStore((state) => state.filterText);
  const setFilterText = useSourceConfigStore((state) => state.setFilterText);
  const setEditingConfig = useSourceConfigStore((state) => state.setEditingConfig);
  const setCreateDialogOpen = useSourceConfigStore((state) => state.setCreateDialogOpen);
  const setUploadDialogOpen = useSourceConfigStore((state) => state.setUploadDialogOpen);

  // Filter configurations
  const filteredConfigs = useMemo(() => {
    if (!configs) return [];
    if (!filterText) return configs;
    
    return configs.filter((config) =>
      config.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [configs, filterText]);

  // Calculate number of configured columns
  const calculateConfiguredColumns = (config: UploadConfig): number => {
    return config.columnMappingConfigs.filter((col: any) => col.dstAliasName).length;
  };

  // Check if config is JDBC type
  const isJdbcConfig = (config: UploadConfig): config is JdbcSourceConfig => {
    return 'srcSql' in config;
  };

  // Handle edit
  const handleEdit = (config: UploadConfig) => {
    setEditingConfig(config);
    setCreateDialogOpen(true);
  };

  // Handle run (for JDBC configs)
  const handleRun = (config: UploadConfig) => {
    if (config.id && isJdbcConfig(config)) {
      runJdbcConfig(config.id);
    }
  };

  // Expandable row render
  const expandedRowRender = (record: UploadConfig) => {
    const columns: ColumnsType<any> = [];

    // Add columns based on file type
    if ('fileType' in record) {
      if (record.fileType === 'CSV') {
        columns.push({
          title: 'CSV Column Name',
          dataIndex: 'csvColumnName',
          key: 'csvColumnName',
          width: 180,
        });
      } else if (record.fileType === 'XML') {
        columns.push(
          {
            title: 'XML Column Name',
            dataIndex: 'xmlColumnName',
            key: 'xmlColumnName',
            width: 180,
          },
          {
            title: 'XML Column XPath',
            dataIndex: 'xmlColumnXPath',
            key: 'xmlColumnXPath',
            width: 180,
          }
        );
      }
    } else if (isJdbcConfig(record)) {
      columns.push(
        {
          title: 'Column Name',
          dataIndex: 'srcColumnName',
          key: 'srcColumnName',
          width: 180,
        },
        {
          title: 'Column Type',
          dataIndex: 'srcColumnType',
          key: 'srcColumnType',
          width: 180,
        }
      );
    }

    // Common columns
    columns.push(
      {
        title: 'Alias',
        dataIndex: 'dstAliasName',
        key: 'dstAliasName',
        width: 180,
        render: (text) => text || '-',
      },
      {
        title: 'Mapper Class',
        dataIndex: 'mapperClass',
        key: 'mapperClass',
        width: 180,
        render: (text) => (text ? text.split('$').pop() : '-'),
      },
      {
        title: 'Mapper Parameters',
        dataIndex: 'mapperFormatParam',
        key: 'mapperFormatParam',
        width: 180,
        render: (text) => text || '-',
      }
    );

    return (
      <Table
        columns={columns}
        dataSource={record.columnMappingConfigs}
        pagination={false}
        rowKey={(_, index) => `col-${index}`}
        size="small"
      />
    );
  };

  // Main table columns
  const columns: ColumnsType<UploadConfig> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          {'fileType' in record && record.fileType === 'XML' && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              Base XPath: {record.xmlBaseXPath}
            </div>
          )}
          {isJdbcConfig(record) && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              SQL: {record.srcSql}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      width: 100,
      render: (_, record) => {
        const type = 'fileType' in record ? record.fileType : 'JDBC';
        const color = type === 'CSV' ? 'blue' : type === 'XML' ? 'green' : 'orange';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Date of Creation',
      dataIndex: 'creationDate',
      key: 'creationDate',
      width: 150,
      render: (date) => (date ? formatDate(date) : '-'),
    },
    {
      title: 'Date Last Edit',
      dataIndex: 'lastUpdateTime',
      key: 'lastUpdateTime',
      width: 150,
      render: (date) => (date ? formatDate(date) : '-'),
    },
    {
      title: 'Created User',
      dataIndex: 'creatorUser',
      key: 'creatorUser',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: 'Configured Columns',
      key: 'configuredColumns',
      width: 150,
      render: (_, record) => calculateConfiguredColumns(record),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          {isJdbcConfig(record) && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleRun(record)}
              size="small"
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="configurations-list">
      <Card>
        <div className="configurations-list-header">
          <Title level={4}>List of Configs</Title>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingConfig(null);
                setCreateDialogOpen(true);
              }}
            >
              Create Configuration
            </Button>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setUploadDialogOpen(true)}
            >
              Ingest Source
            </Button>
          </Space>
        </div>

        <div className="configurations-list-filter">
          <Search
            placeholder="Filter configurations"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredConfigs}
          loading={isLoading}
          rowKey={(record) => record.id || record.name}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => record.columnMappingConfigs.length > 0,
          }}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} configurations`,
          }}
        />
      </Card>

      {/* Configuration Form Dialog */}
      <ConfigForm />

      {/* File Upload Dialog */}
      <FileUploadDialog />
    </div>
  );
};

export default ConfigurationsList;

