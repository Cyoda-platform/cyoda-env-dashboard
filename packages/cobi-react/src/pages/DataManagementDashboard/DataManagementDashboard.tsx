import React, { useState, useMemo, useRef } from 'react';
import { Card, Input, Table, Button, Space, Tag, Divider } from 'antd';
import { PlayCircleOutlined, ProjectOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getListAll, datasources } from '../../api/dataSourceConfigApi';
import { getListAllDataMappings } from '../../api/dataMappingApi';
import type { DataSourceConfigDto, MappingConfigDto } from '../../types';
import DiagramDialog, { DiagramDialogRef } from './components/DiagramDialog';
import DataSourceConfigDialogRequest, {
  DataSourceConfigDialogRequestRef,
} from './components/ExecuteDialog/DataSourceConfigDialogRequest';
import ConnectionExecutions from './components/ConnectionExecutions';
import './DataManagementDashboard.css';

const DataManagementDashboard: React.FC = () => {
  const [filter, setFilter] = useState('');
  const diagramDialogRef = useRef<DiagramDialogRef>(null);
  const executeDialogRef = useRef<DataSourceConfigDialogRequestRef>(null);

  // Fetch data source configurations
  const { data: dataSourceConfigs = [], isLoading } = useQuery({
    queryKey: ['dataSourceConfigs'],
    queryFn: async () => {
      const response = await getListAll();
      return response.data || [];
    },
  });

  // Fetch data mappings
  const { data: dataMappings = [] } = useQuery({
    queryKey: ['dataMappings'],
    queryFn: async () => {
      const response = await getListAllDataMappings();
      return response.data || [];
    },
  });

  // Fetch datasources with params
  const { data: datasourcesData } = useQuery({
    queryKey: ['datasources'],
    queryFn: async () => {
      const response = await datasources();
      return response.data || {};
    },
  });

  // Filter configurations
  const filteredData = useMemo(() => {
    if (!filter) return dataSourceConfigs;
    const lowerFilter = filter.toLowerCase();
    return dataSourceConfigs.filter((config: DataSourceConfigDto) =>
      config.name?.toLowerCase().includes(lowerFilter) ||
      config.description?.toLowerCase().includes(lowerFilter)
    );
  }, [dataSourceConfigs, filter]);

  const getDataMappingNameById = (id: string) => {
    const mapping = dataMappings.find((m: MappingConfigDto) => m.id === id);
    return mapping?.name || '-';
  };

  const getConnectionType = (connection: any) => {
    if (connection.httpConnection) return 'HTTP';
    if (connection.sqlConnection) return 'SQL';
    if (connection.workflowConnection) return 'Workflow';
    return 'Unknown';
  };

  const getAuthTypeName = (authType: string) => {
    const authTypes: Record<string, string> = {
      BASIC: 'Basic',
      BEARER: 'Bearer',
      OAUTH2: 'OAuth 2.0',
      API_KEY: 'API Key',
      NONE: 'None',
    };
    return authTypes[authType] || authType || '-';
  };

  const handlePlay = (record: DataSourceConfigDto) => {
    if (!datasourcesData || !datasourcesData.data_sources) {
      console.error('Datasources not loaded');
      return;
    }

    const dataSource = datasourcesData.data_sources.find((ds: any) => ds.id === record.id);
    if (!dataSource) {
      console.error('Data source not found');
      return;
    }

    executeDialogRef.current?.openDialog(dataSource, record);
  };

  const handleViewDiagram = (record: DataSourceConfigDto) => {
    diagramDialogRef.current?.open(record);
  };

  const expandedRowRender = (record: DataSourceConfigDto) => {
    return (
      <div className="expanded-row-content">
        <h3>Connections</h3>
        <Table
          dataSource={record.connections || []}
          pagination={false}
          size="small"
          rowKey={(row, index) => `conn-${index}`}
        >
          <Table.Column
            title="Type"
            key="type"
            render={(_, row: any) => <Tag color="blue">{getConnectionType(row)}</Tag>}
          />
          <Table.Column title="Base URL" dataIndex="baseUrl" key="baseUrl" />
          <Table.Column
            title="Auth Type"
            dataIndex="authType"
            key="authType"
            render={(authType) => getAuthTypeName(authType)}
          />
        </Table>

        <h3 style={{ marginTop: 16 }}>Endpoints</h3>
        <Table
          dataSource={record.endpoints || []}
          pagination={false}
          size="small"
          rowKey={(row, index) => `endpoint-${index}`}
        >
          <Table.Column title="Operation" dataIndex="operation" key="operation" />
          <Table.Column
            title="Data Mapping"
            key="mapping"
            render={(_, row: any) => getDataMappingNameById(row.consumerConfig?.configId)}
          />
          <Table.Column title="Query" dataIndex="query" key="query" />
          <Table.Column title="Method" dataIndex="method" key="method" />
          <Table.Column
            title="Connection Timeout"
            dataIndex="connectionTimeout"
            key="connectionTimeout"
            render={(val) => val || '-'}
          />
          <Table.Column
            title="Read/Write Timeout"
            dataIndex="readWriteTimeout"
            key="readWriteTimeout"
            render={(val) => val || '-'}
          />
          <Table.Column title="Type" dataIndex="type" key="type" />
        </Table>
      </div>
    );
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: DataSourceConfigDto, b: DataSourceConfigDto) =>
        (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Updated at',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      sorter: (a: DataSourceConfigDto, b: DataSourceConfigDto) =>
        (a.lastUpdated || 0) - (b.lastUpdated || 0),
      render: (lastUpdated: number) =>
        lastUpdated ? dayjs(lastUpdated).format('YYYY-MM-DD HH:mm:ss') : '-',
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: DataSourceConfigDto) => (
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => handlePlay(record)}
          />
          <Button
            type="default"
            icon={<ProjectOutlined />}
            onClick={() => handleViewDiagram(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="data-management-dashboard">
      <Card>
        <h4>List of runnable data source connections</h4>

        <div style={{ marginBottom: 16, marginTop: 16 }}>
          <Input
            placeholder="Filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: '50%' }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          expandable={{
            expandedRowRender,
          }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          bordered
        />
      </Card>

      <Divider />

      <Card>
        <h4>List of Connection Executions</h4>
        <ConnectionExecutions />
      </Card>

      <DiagramDialog ref={diagramDialogRef} />
      <DataSourceConfigDialogRequest ref={executeDialogRef} />
    </div>
  );
};

export default DataManagementDashboard;

