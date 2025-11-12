/**
 * ReportConfigsStream Component
 * Stream report configurations list and management
 * 
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/ConfigEditorReportsStream.vue
 */

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tooltip, Divider, Modal, message, Space, Upload } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  StopOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  DownloadOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import type { ResizeCallbackData } from 'react-resizable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axios, useGlobalUiSettingsStore, getReportingFetchTypes } from '@cyoda/http-api-react';
import moment from 'moment';
import CreateReportDialog from '../components/CreateReportDialog';
import HistoryFilter from '../components/HistoryFilter';
import ReportScheduling from '../components/ReportScheduling';
import { ConfigEditorStreamGrid, ConfigEditorStreamGridRef } from '@cyoda/ui-lib-react';
import { HelperStorage } from '@cyoda/ui-lib-react';
import { ResizableTitle } from '../components/ResizableTitle';
import type { HistoryFilterForm } from '../utils/HelperReportDefinition';
import type { ReportDefinition } from '../types';
import HelperReportDefinition from '../utils/HelperReportDefinition';
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
  entityType?: string | null;
}

export const ReportConfigsStream: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storage = new HelperStorage();
  const { entityType } = useGlobalUiSettingsStore();

  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<TableRow[]>([]);
  const [filterForm, setFilterForm] = useState<HistoryFilterForm>(
    HelperReportDefinition.reportHistoryDefaultFilter()
  );
  const [showScheduling, setShowScheduling] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>();
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);

  const streamGridRef = useRef<ConfigEditorStreamGridRef>(null);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('reportConfigsStream:columnWidths', {});
    const defaultWidths = {
      name: 200,
      description: 300,
      requestClass: 200,
      createDateTime: 150,
      user: 120,
      state: 100,
      action: 200,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Sort state - load from localStorage
  const [sortField, setSortField] = useState<string | null>(() => {
    return storage.get('reportConfigsStream:sortField', null);
  });
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(() => {
    return storage.get('reportConfigsStream:sortOrder', null);
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('reportConfigsStream:columnWidths', columnWidths);
    }
  }, [columnWidths]);

  // Save sort settings to localStorage
  useEffect(() => {
    storage.set('reportConfigsStream:sortField', sortField);
    storage.set('reportConfigsStream:sortOrder', sortOrder);
  }, [sortField, sortOrder]);

  // Handle column resize
  const handleResize = useCallback((key: string) => {
    return (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      setColumnWidths((prev) => {
        const oldWidth = prev[key];
        const newWidth = size.width;
        const delta = newWidth - oldWidth;

        const otherKeys = Object.keys(prev).filter(k => k !== key);
        if (otherKeys.length === 0) {
          return { ...prev, [key]: newWidth };
        }

        const totalOtherWidth = otherKeys.reduce((sum, k) => sum + prev[k], 0);
        const newWidths = { ...prev, [key]: newWidth };

        otherKeys.forEach(k => {
          const proportion = prev[k] / totalOtherWidth;
          const adjustment = delta * proportion;
          newWidths[k] = Math.max(50, prev[k] - adjustment);
        });

        return newWidths;
      });
    };
  }, []);

  // Fetch stream report definitions
  const { data: definitions = [], isLoading, refetch } = useQuery({
    queryKey: ['streamReportDefinitions'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/platform-api/stream-data/config/list`);
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch entity types
  const { data: entityData = [] } = useQuery({
    queryKey: ['entityTypes'],
    queryFn: async () => {
      try {
        const { data } = await getReportingFetchTypes();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn('Failed to load entity types:', error);
        return [];
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_BASE}/platform-api/stream-data/config?configId=${encodeURIComponent(id)}`);
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
    // Ensure definitions is an array
    if (!Array.isArray(definitions)) {
      console.error('definitions is not an array:', definitions);
      return [];
    }

    let data = definitions
      .map((report) => {
        const entity = report.streamDataDef?.requestClass?.split('.').pop() || '';
        const entityClass = report.streamDataDef?.requestClass;

        // Find entity type info
        const entityTypeInfo = entityData.find((el: any) =>
          typeof el === 'object' ? el.name === entityClass : el === entityClass
        );
        const entityTypeValue = typeof entityTypeInfo === 'object' ? entityTypeInfo.type : null;

        let entityClassNameLabel = entity;
        if (entityTypeValue) {
          entityClassNameLabel += ` (${entityTypeValue === 'BUSINESS' ? 'Business' : 'Technical'})`;
        }

        return {
          ...report,
          entity,
          entityClassNameLabel,
          createdHuman: moment(report.createDate).format('YYYY-MM-DD HH:mm'),
          deleteLoading: false,
          loadingReportButton: false,
          entityType: entityTypeValue,
        } as TableRow;
      })
      .reverse();

    // Filter by entity type from global toggle
    if (entityData.length > 0 && entityData.some((et: any) => typeof et === 'object' && et.type)) {
      data = data.filter((item: any) => {
        // If entity has type info, filter by it
        if (item.entityType) {
          return item.entityType === entityType;
        }
        // If no type info, show in both modes (backward compatibility)
        return true;
      });
    }

    // Apply other filters
    data = HelperReportDefinition.applyFiltersForReportTables(data, filterForm);

    return data;
  }, [definitions, entityData, filterForm, entityType]);

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
      const defaultDef = HelperReportDefinition.reportStreamDefinition();
      const configDefinition = {
        name: values.name,
        description: values.description,
        streamDataDef: {
          ...defaultDef.streamDataDef,
          requestClass: values.requestClass,
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
        },
      };

      const { data } = await axios.post(
        `${API_BASE}/platform-api/stream-data/config`,
        configDefinition
      );

      console.log('Created stream report, response:', data);
      const reportId = typeof data === 'string' ? data : data.id;
      console.log('Navigating to stream report editor with ID:', reportId);

      message.success('Stream report created successfully');
      setCreateDialogVisible(false);

      // Invalidate the query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['streamReportDefinitions'] });

      navigate(`/tableau/reports/stream/${reportId}?isNew=true`);
    } catch (error) {
      message.error('Failed to create stream report');
    }
  };

  const handleEdit = (record: TableRow) => {
    navigate(`/tableau/reports/stream/${record.id}`);
  };

  const handleRun = async (record: TableRow) => {
    if (streamGridRef.current) {
      // Set the definition ID and open the dialog
      streamGridRef.current.setDefinitionId(record.id);
      streamGridRef.current.setDialogVisible(true);
    }
  };

  // Fetch stream definition
  const handleFetchDefinition = async (definitionId: string) => {
    try {
      console.log('Fetching stream definition:', definitionId);
      const { data: definition } = await axios.get(
        `${API_BASE}/platform-api/stream-data/config?configId=${encodeURIComponent(definitionId)}`
      );
      console.log('Fetched stream definition:', definition);
      return definition;
    } catch (error) {
      console.error('Failed to fetch stream definition:', error);
      message.error('Failed to fetch stream definition');
      throw error;
    }
  };

  // Load stream data for the grid
  const handleLoadStreamData = async (request: any) => {
    try {
      console.log('Loading stream data with request:', request);

      const { data: streamData } = await axios.post(
        `${API_BASE}/platform-api/stream-data/get`,
        request
      );

      console.log('Stream data response:', streamData);
      return streamData;
    } catch (error) {
      console.error('Failed to load stream data:', error);
      message.error('Failed to load stream data');
      return { rows: [] };
    }
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
    setFilterForm(HelperReportDefinition.reportHistoryDefaultFilter());
    storage.remove('tableSaveState:configEditorReportsStream:table');
    storage.remove('historyReports:filterForm');
    message.success('State reset successfully');
  };

  const handleExport = async () => {
    if (selectedRows.length === 0) {
      message.warning('Please select at least one report to export');
      return;
    }

    try {
      setExportLoading(true);
      const ids = selectedRows.map((row) => row.id);

      // Use the export endpoint
      const { data: exportResponse } = await axios.get(
        `${API_BASE}/platform-api/stream-data/export-by-ids?includeIds=${ids.join(',')}`
      );

      const definitions = exportResponse;

      // Create export data
      const exportData = {
        data: {
          value: definitions,
        },
        type: 'reportsStream',
        exportDate: new Date().toISOString(),
      };

      // Download as JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `export_stream_reports_${ids.join('-')}.json`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('Reports exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Failed to export reports');
    } finally {
      setExportLoading(false);
    }
  };

  const handleImport = async (file: File) => {
    try {
      setImportLoading(true);
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.data?.value || !Array.isArray(importData.data.value)) {
        message.error('Invalid import file format');
        return false;
      }

      // Import each definition
      let successCount = 0;
      let failCount = 0;

      // Use the import endpoint
      try {
        await axios.post(
          `${API_BASE}/platform-api/stream-data/import`,
          importData.data.value
        );
        successCount = importData.data.value.length;
      } catch (error) {
        console.error('Failed to import definitions:', error);
        failCount = importData.data.value.length;
      }

      if (successCount > 0) {
        message.success(`Successfully imported ${successCount} report(s)`);
        refetch();
      }

      if (failCount > 0) {
        message.warning(`Failed to import ${failCount} report(s)`);
      }

      return false; // Prevent default upload behavior
    } catch (error) {
      console.error('Import failed:', error);
      message.error('Failed to import reports');
      return false;
    } finally {
      setImportLoading(false);
    }
  };

  const columns: TableColumnsType<TableRow> = [
    {
      title: 'Config',
      dataIndex: 'name',
      key: 'name',
      width: columnWidths.name,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortField === 'name' ? sortOrder : null,
      onHeaderCell: () => ({
        width: columnWidths.name,
        onResize: handleResize('name'),
      }),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: columnWidths.description,
      sorter: (a, b) => (a.description || '').localeCompare(b.description || ''),
      sortOrder: sortField === 'description' ? sortOrder : null,
      onHeaderCell: () => ({
        width: columnWidths.description,
        onResize: handleResize('description'),
      }),
    },
    {
      title: 'Type',
      dataIndex: 'entityClassNameLabel',
      key: 'entityClassNameLabel',
      width: columnWidths.requestClass,
      sorter: (a, b) => a.entityClassNameLabel.localeCompare(b.entityClassNameLabel),
      sortOrder: sortField === 'entityClassNameLabel' ? sortOrder : null,
      onHeaderCell: () => ({
        width: columnWidths.requestClass,
        onResize: handleResize('requestClass'),
      }),
    },
    {
      title: 'User',
      dataIndex: 'owner',
      key: 'owner',
      width: columnWidths.user,
      sorter: (a, b) => a.owner.localeCompare(b.owner),
      sortOrder: sortField === 'owner' ? sortOrder : null,
      onHeaderCell: () => ({
        width: columnWidths.user,
        onResize: handleResize('user'),
      }),
    },
    {
      title: 'Created',
      dataIndex: 'createdHuman',
      key: 'createdHuman',
      width: columnWidths.createDateTime,
      sorter: (a, b) => a.createDate.localeCompare(b.createDate),
      sortOrder: sortField === 'createdHuman' ? sortOrder : null,
      onHeaderCell: () => ({
        width: columnWidths.createDateTime,
        onResize: handleResize('createDateTime'),
      }),
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: columnWidths.action,
      onHeaderCell: () => ({
        width: columnWidths.action,
        onResize: handleResize('action'),
      }),
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
    onChange: (newSelectedRowKeys: React.Key[], selectedRows: TableRow[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(selectedRows);
    },
  };

  return (
    <div className="report-configs-stream">
      <h1 className="page-title">Stream reports</h1>
      <div className="report-configs-stream__actions">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateNew}>
            Create New
          </Button>

          <Tooltip title="Export selected reports">
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={handleExport}
              loading={exportLoading}
              disabled={selectedRows.length === 0}
            >
              Export
            </Button>
          </Tooltip>

          <Tooltip title="Import previously exported reports">
            <Upload
              accept=".json"
              showUploadList={false}
              beforeUpload={handleImport}
            >
              <Button
                type="default"
                icon={<DownloadOutlined />}
                loading={importLoading}
              >
                Import
              </Button>
            </Upload>
          </Tooltip>

          <Divider type="vertical" />

          <Tooltip title="Reset state: filters, table settings, etc.">
            <Button icon={<UndoOutlined />} onClick={handleResetState}>
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
        onChange={(pagination, filters, sorter: any) => {
          // Handle sorting
          if (sorter && !Array.isArray(sorter)) {
            if (sorter.order) {
              setSortField(sorter.columnKey || sorter.field);
              setSortOrder(sorter.order);
            } else {
              // Clear sorting
              setSortField(null);
              setSortOrder(null);
            }
          }
        }}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
        size="small"
        bordered
        pagination={{
          pageSize: pageSize,
          pageSizeOptions: ['5', '10', '20', '50'],
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          className: 'pagination-bar',
          selectComponentClass: undefined,
          onShowSizeChange: (current, size) => setPageSize(size),
        }}
      />

      <CreateReportDialog
        visible={createDialogVisible}
        onCancel={() => setCreateDialogVisible(false)}
        onCreate={handleCreateReport}
        title="Create New Stream Data Report Definition"
        hideFields={{ description: true }}
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

      <ConfigEditorStreamGrid
        ref={streamGridRef}
        isDeleteAvailable={true}
        onFetchDefinition={handleFetchDefinition}
        onLoadData={handleLoadStreamData}
      />
    </div>
  );
};

export default ReportConfigsStream;

