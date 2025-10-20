/**
 * StreamReports Page
 * Main page for managing stream report configurations
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/ConfigEditorReportsStream.vue
 */

import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, message, Modal, Divider } from 'antd';
import { PlusOutlined, EditOutlined, PlayCircleOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import moment from 'moment';
import ConfigEditorReportsFilter from '../components/ConfigEditorReportsFilter';
import CreateReportDialog from '../components/CreateReportDialog';
import { ConfigEditorStreamGrid } from '@cyoda/ui-lib-react';
import HelperReportDefinition from '../utils/HelperReportDefinition';
import './StreamReports.scss';

interface StreamReportDefinition {
  id: string;
  name: string;
  description: string;
  owner: string;
  createDate: string;
  streamDataDef: {
    requestClass: string;
    columns: any[];
    condition: any;
    colDefs: any[];
    aliasDefs: any[];
    rangeCondition: any;
    rangeOrder: 'ASC' | 'DESC';
  };
}

interface TableDataRow {
  id: string;
  name: string;
  username: string;
  description: string;
  createdHuman: string;
  created: string;
  entity: string;
  entityClassNameLabel: string;
  deleteLoading: boolean;
  loadingReportButton: boolean;
}

const StreamReports: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterForm, setFilterForm] = useState({
    search: '',
    authors: [] as string[],
    entities: [] as string[],
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const createDialogRef = useRef<any>(null);
  const streamGridRef = useRef<any>(null);

  // Fetch stream report definitions
  const { data: definitions = [], isLoading } = useQuery({
    queryKey: ['streamReportDefinitions'],
    queryFn: async () => {
      const { data } = await axios.get('/platform-api/streamdata/definitions');
      return data._embedded?.streamDataConfigDefs || [];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/platform-api/streamdata/definitions/${id}`);
    },
    onSuccess: () => {
      message.success('Stream report deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['streamReportDefinitions'] });
    },
    onError: () => {
      message.error('Failed to delete stream report');
    },
  });

  // Run stream report mutation
  const runMutation = useMutation({
    mutationFn: async (definition: StreamReportDefinition) => {
      const request = {
        '@bean': 'com.cyoda.core.streamdata.StreamDataRequest',
        sdDef: definition.streamDataDef,
        offset: 0,
        length: 100,
        pointTime: null,
      };
      await axios.post('/platform-api/streamdata/data', request);
      return definition;
    },
    onSuccess: (_result, definition) => {
      // Open stream grid dialog with results
      if (streamGridRef.current) {
        streamGridRef.current.open({
          sdDef: definition.streamDataDef,
          offset: 0,
          length: 100,
          pointTime: null,
        });
      }
    },
    onError: () => {
      message.error('Failed to run stream report');
    },
  });

  // Transform definitions to table data
  const tableData: TableDataRow[] = useMemo(() => {
    return definitions.map((report: StreamReportDefinition) => {
      const entity = report.streamDataDef.requestClass.split('.').pop() || '';
      return {
        id: report.id,
        name: report.name,
        username: report.owner,
        description: report.description || '',
        createdHuman: moment(report.createDate).format('YYYY-MM-DD HH:mm'),
        created: report.createDate,
        entity,
        entityClassNameLabel: entity,
        deleteLoading: false,
        loadingReportButton: false,
      };
    });
  }, [definitions]);

  // Apply filters
  const filteredData = useMemo(() => {
    return HelperReportDefinition.applyFiltersForReportTables(tableData, filterForm);
  }, [tableData, filterForm]);

  // Get unique authors and entities for filter
  const usersOptions = useMemo(() => {
    const users = [...new Set(tableData.map((d) => d.username))];
    return users.map((u) => ({ value: u, label: u }));
  }, [tableData]);

  const entityOptions = useMemo(() => {
    const entities = [...new Set(tableData.map((d) => d.entity))];
    return entities.map((e) => ({ value: e, label: e }));
  }, [tableData]);

  const handleEdit = (record: TableDataRow) => {
    navigate(`/tableau/stream-report-editor/${record.id}`);
  };

  const handleRun = (record: TableDataRow) => {
    const definition = definitions.find((d: StreamReportDefinition) => d.id === record.id);
    if (definition) {
      runMutation.mutate(definition);
    }
  };

  const handleDelete = (record: TableDataRow) => {
    Modal.confirm({
      title: 'Delete Stream Report',
      content: `Are you sure you want to delete "${record.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  const handleCreateNew = async (values: any) => {
    const newDefinition = {
      '@bean': 'com.cyoda.core.streamdata.StreamDataConfigDef',
      name: values.name,
      description: values.description || '',
      streamDataDef: {
        requestClass: values.requestClass,
        rangeOrder: 'ASC',
        rangeCondition: {
          '@bean': '',
          fieldName: '',
          operation: '',
          value: {
            '@type': '',
            value: '',
          },
        },
        condition: {
          '@bean': 'com.cyoda.core.conditions.GroupCondition',
          operator: 'OR',
          conditions: [],
        },
        columns: [],
        colDefs: [],
        aliasDefs: [],
      },
    };

    const { data } = await axios.post('/platform-api/streamdata/definitions', newDefinition);
    message.success('Stream report created successfully');
    queryClient.invalidateQueries({ queryKey: ['streamReportDefinitions'] });

    // Navigate to editor
    if (data.id) {
      navigate(`/tableau/stream-report-editor/${data.id}?isNew=true`);
    }
  };

  const handleResetState = () => {
    setFilterForm({
      search: '',
      authors: [],
      entities: [],
    });
    setSelectedRowKeys([]);
  };

  const columns: TableColumnsType<TableDataRow> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Entity',
      dataIndex: 'entityClassNameLabel',
      key: 'entity',
    },
    {
      title: 'Author',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Created',
      dataIndex: 'createdHuman',
      key: 'created',
      sorter: (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleRun(record)}
            loading={record.loadingReportButton}
          >
            Run
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            loading={record.deleteLoading}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="stream-reports-page">
      <div className="page-header">
        <h1>Stream Reports</h1>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => createDialogRef.current?.open()}
          >
            Create New
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleResetState}
          >
            Reset State
          </Button>
        </Space>
      </div>

      <ConfigEditorReportsFilter
        value={filterForm}
        onChange={(newFilter) => setFilterForm({
          search: newFilter.search || '',
          authors: newFilter.authors || [],
          entities: newFilter.entities || [],
        })}
        usersOptions={usersOptions}
        entityOptions={entityOptions}
      />

      <Divider />

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
      />

      <CreateReportDialog
        ref={createDialogRef}
        onConfirm={handleCreateNew}
        title="Create New Stream Data Report Definition"
        hideFields={{ description: false }}
      />

      <ConfigEditorStreamGrid
        ref={streamGridRef}
        isDeleteAvailable={true}
      />
    </div>
  );
};

export default StreamReports;

