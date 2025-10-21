/**
 * ReportConfigsStream Component
 * Stream report configurations list and management
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/ConfigEditorReportsStream.vue
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tooltip, Divider, Modal, message, Space } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  StopOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import moment from 'moment';
import CreateReportDialog from '../components/CreateReportDialog';
import HistoryFilter from '../components/HistoryFilter';
import ReportTemplates from '../components/ReportTemplates';
import ReportScheduling from '../components/ReportScheduling';
import { ConfigEditorStreamGrid, ConfigEditorStreamGridRef } from '@cyoda/ui-lib-react';
import { HelperStorage } from '@cyoda/ui-lib-react';
import type { HistoryFilterForm } from '../utils/HelperReportDefinition';
import type { ReportDefinition } from '../types';
import { HelperReportDefinition } from '../utils/HelperReportDefinition';
import './ReportConfigsStream.scss';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

interface StreamReportConfig {
  id: string;
  name: string;
  description?: string;
  owner: string;
  createDate: string;
  streamDataDef: {
    requestClass: string;
  };
}

interface TableRow extends StreamReportConfig {
  entity: string;
  entityClassNameLabel: string;
  createdHuman: string;
  deleteLoading?: boolean;
  loadingReportButton?: boolean;
  reportExecutionTime?: number;
}

export const ReportConfigsStream: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storage = new HelperStorage();

  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [filterForm, setFilterForm] = useState<HistoryFilterForm>({
    status: [],
    authors: [],
    times: [],
    entities: [],
    time_custom: '',
    search: '',
  });
  const [showTemplates, setShowTemplates] = useState(false);
  const [showScheduling, setShowScheduling] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>();

  const streamGridRef = useRef<ConfigEditorStreamGridRef>(null);

  // Fetch stream report definitions
  const { data: definitions = [], isLoading, refetch } = useQuery({
    queryKey: ['streamReportDefinitions'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/platform-api/reporting/stream-definitions`);
      return data as StreamReportConfig[];
    },
  });

  // Fetch entity types
  const { data: entityData = [] } = useQuery({
    queryKey: ['entityTypes'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/platform-api/entity-info/fetch/types`);
      return data;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_BASE}/platform-api/reporting/stream-definitions/${id}`);
    },
    onSuccess: () => {
      message.success('Stream report deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['streamReportDefinitions'] });
    },
    onError: () => {
      message.error('Failed to delete stream report');
    },
  });

  const tableData = useMemo(() => {
    let data = definitions
      .map((report) => {
        const entity = report.streamDataDef.requestClass.split('.').pop() || '';
        const entityRow = entityData.find((el: any) => el.name === report.streamDataDef.requestClass);
        let entityClassNameLabel = entity;
        if (entityRow) {
          entityClassNameLabel += ` (${entityRow.type || 'BUSINESS'})`;
        }

        return {
          ...report,
          entity,
          entityClassNameLabel,
          createdHuman: moment(report.createDate).format('YYYY-MM-DD HH:mm'),
          deleteLoading: false,
          loadingReportButton: false,
        } as TableRow;
      })
      .reverse();

    // Apply filters
    data = HelperReportDefinition.applyFiltersForReportTables(data, filterForm);

    return data;
  }, [definitions, entityData, filterForm]);

  const usersOptions = useMemo(() => {
    const users = definitions.map((report) => ({
      value: report.owner,
      label: report.owner,
    }));
    return Array.from(new Map(users.map((item) => [item.value, item])).values());
  }, [definitions]);

  const entityOptions = useMemo(() => {
    const entities = definitions.map((report) => {
      const entity = report.streamDataDef.requestClass.split('.').pop() || '';
      return {
        value: entity,
        label: entity,
      };
    });
    return Array.from(new Map(entities.map((item) => [item.value, item])).values());
  }, [definitions]);

  const handleCreateNew = () => {
    setCreateDialogVisible(true);
  };

  const handleCreateReport = async (values: any) => {
    try {
      const configDefinition = {
        name: values.name,
        description: values.description,
        streamDataDef: {
          requestClass: values.requestClass,
          columns: [],
          colDefs: [],
          aliasDefs: [],
          condition: {
            '@bean': 'com.cyoda.core.conditions.GroupCondition',
            operator: 'OR',
            conditions: [],
          },
          rangeCondition: {
            '@bean': 'com.cyoda.core.conditions.queryable.GreaterThan',
            fieldName: 'creationDate',
            operation: 'GREATER_THAN',
            value: {
              '@type': 'java.util.Date',
              value: moment().format('YYYY-MM-DD[T]00:00:00.SSSZ'),
            },
          },
          rangeOrder: 'ASC',
        },
      };

      const { data } = await axios.post(
        `${API_BASE}/platform-api/reporting/stream-definitions`,
        configDefinition
      );

      message.success('Stream report created successfully');
      setCreateDialogVisible(false);
      navigate(`/tableau/reports/stream/${data}?isNew=true`);
    } catch (error) {
      message.error('Failed to create stream report');
    }
  };

  const handleEdit = (record: TableRow) => {
    navigate(`/tableau/reports/stream/${record.id}`);
  };

  const handleRun = async (record: TableRow) => {
    streamGridRef.current?.open();
    // TODO: Load stream data for this report
  };

  const handleDelete = (record: TableRow) => {
    Modal.confirm({
      title: 'Confirm!',
      content: 'Do you really want to remove?',
      onOk: async () => {
        await deleteMutation.mutateAsync(record.id);
      },
    });
  };

  const handleResetState = () => {
    setFilterForm({
      status: [],
      authors: [],
      times: [],
      entities: [],
      time_custom: '',
      search: '',
    });
    storage.deleteByKey('tableSaveState:configEditorReportsStream:table');
  };

  const columns: TableColumnsType<TableRow> = [
    {
      title: 'Config',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      sorter: (a, b) => (a.description || '').localeCompare(b.description || ''),
    },
    {
      title: 'Type',
      dataIndex: 'entityClassNameLabel',
      key: 'entityClassNameLabel',
      sorter: (a, b) => a.entityClassNameLabel.localeCompare(b.entityClassNameLabel),
    },
    {
      title: 'User',
      dataIndex: 'owner',
      key: 'owner',
      width: 150,
      sorter: (a, b) => a.owner.localeCompare(b.owner),
    },
    {
      title: 'Created',
      dataIndex: 'createdHuman',
      key: 'createdHuman',
      width: 150,
      sorter: (a, b) => a.createDate.localeCompare(b.createDate),
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Run">
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleRun(record)}
              loading={record.loadingReportButton}
            />
          </Tooltip>
          <Tooltip title="Schedule">
            <Button
              type="default"
              icon={<ClockCircleOutlined />}
              onClick={() => {
                setSelectedReportId(record.id);
                setShowScheduling(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              loading={record.deleteLoading}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div className="report-configs-stream">
      <div className="report-configs-stream__actions">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateNew}>
            Create New
          </Button>

          <Button type="default" onClick={() => setShowTemplates(true)}>
            Create from Template
          </Button>

          <Tooltip title="Reset state: filters, table settings, etc.">
            <Button icon={<ReloadOutlined />} onClick={handleResetState}>
              Reset state
            </Button>
          </Tooltip>
        </Space>
      </div>

      <HistoryFilter
        value={filterForm}
        onChange={setFilterForm}
        usersOptions={usersOptions}
        entityOptions={entityOptions}
      />

      <Divider />

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={tableData}
        rowKey="id"
        loading={isLoading}
        size="small"
        bordered
        pagination={{
          defaultPageSize: 10,
          pageSizeOptions: ['5', '10', '20', '50'],
          showSizeChanger: true,
        }}
      />

      <CreateReportDialog
        visible={createDialogVisible}
        onCancel={() => setCreateDialogVisible(false)}
        onCreate={handleCreateReport}
        title="Create New Stream Data Report Definition"
        hideFields={{ description: true, valuationPointTime: false }}
      />

      {/* Report Templates Modal */}
      <ReportTemplates
        visible={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={(template: ReportDefinition) => {
          // Create a new stream report from template
          handleCreateReport({
            name: template.name || 'New Stream Report from Template',
            entityClass: template.entityClass || '',
            reportDefinition: template,
          });
          setShowTemplates(false);
        }}
      />

      {/* Report Scheduling Modal */}
      <ReportScheduling
        visible={showScheduling}
        reportId={selectedReportId}
        onClose={() => {
          setShowScheduling(false);
          setSelectedReportId(undefined);
        }}
      />

      <ConfigEditorStreamGrid ref={streamGridRef} isDeleteAvailable={true} />
    </div>
  );
};

export default ReportConfigsStream;

