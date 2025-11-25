/**
 * ReportConfigs Page
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/ConfigEditorReports.vue
 */

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Table, Button, Tooltip, Space, Divider, Upload, App } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  CopyOutlined,
  PlayCircleOutlined,
  StopOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { axios, useGlobalUiSettingsStore, getReportingFetchTypes, useReportStatus, runReportFromPredefinedConfig } from '@cyoda/http-api-react';
import moment from 'moment';
import { exportReportsByIds, importReports, createReportDefinition } from '@cyoda/http-api-react';
import CreateReportDialog, { type CreateReportDialogRef, type CreateReportFormData } from '../components/CreateReportDialog';
import CloneReportDialog, { type CloneReportDialogRef } from '../components/CloneReportDialog';
import ConfigEditorReportsFilter from '../components/ConfigEditorReportsFilter';
import { ResizableTitle } from '../components/ResizableTitle';
import HelperReportDefinition from '../utils/HelperReportDefinition';
import { HelperStorage } from '@cyoda/ui-lib-react';
import type { ReportDefinition } from '../types';
import './ReportConfigs.scss';

interface ReportConfigRow {
  id: string;
  name: string;
  description: string;
  entity: string;
  entityClassNameLabel: string;
  username: string;
  created: string;
  createdHuman: string;
  loadingReportButton: boolean;
  reportId?: string;
  reportExecutionTime: number;
  groupingVersion?: string;
  entityType?: string | null;
}

interface RunningReport {
  configName: string;
  reportId: string;
  status: string;
  groupingVersion?: string;
}

interface ReportConfigsProps {
  onResetState?: () => void;
}

interface FilterForm {
  search?: string;
  authors?: string[];
  entities?: string[];
  states?: string[];
  types?: string[];
  time_custom?: Date | null;
}

/**
 * Component to track report status and update running reports list
 */
const ReportStatusTracker: React.FC<{
  reportId: string;
  groupingVersion?: string;
  configName: string;
  onStatusChange: (reportId: string, status: string) => void;
}> = ({ reportId, groupingVersion, configName, onStatusChange }) => {
  const { notification } = App.useApp();

  const { data: statusData } = useReportStatus(reportId, groupingVersion, {
    enabled: !!reportId,
  });

  const prevStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!statusData?.content?.status) return;

    const currentStatus = statusData.content.status;

    // Only notify and update if status actually changed
    if (prevStatusRef.current && prevStatusRef.current !== currentStatus) {
      if (currentStatus === 'SUCCESSFUL') {
        notification.success({
          message: 'Success',
          description: `Report ${configName} has completed`,
        });
      } else if (currentStatus === 'FAILED') {
        notification.error({
          message: 'Error',
          description: `Report ${configName} has failed`,
        });
      }
    }

    prevStatusRef.current = currentStatus;
    onStatusChange(reportId, currentStatus);
  }, [statusData, reportId, configName, onStatusChange, notification]);

  return null;
};

const ReportConfigs: React.FC<ReportConfigsProps> = ({ onResetState }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storage = useMemo(() => new HelperStorage(), []);
  const { entityType } = useGlobalUiSettingsStore();
  const { message, modal } = App.useApp();

  const createDialogRef = useRef<CreateReportDialogRef>(null);
  const cloneDialogRef = useRef<CloneReportDialogRef>(null);

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [filterForm, setFilterForm] = useState<FilterForm>({});
  const [runningReports, setRunningReports] = useState<RunningReport[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [pageSize, setPageSize] = useState<number>(50);

  // Column widths state - load from localStorage
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('reportConfigs:columnWidths', {}) as Record<string, number> | null;
    const defaultWidths: Record<string, number> = {
      name: 200,
      description: 250,
      entityClassNameLabel: 180,
      username: 120,
      createdHuman: 150,
      action: 180,
    };
    // Check if saved has any keys, if not use defaults
    return (saved && Object.keys(saved).length > 0) ? saved : defaultWidths;
  });

  // Sort state - load from localStorage
  const [sortField, setSortField] = useState<string | null>(() => {
    return storage.get('reportConfigs:sortField', null);
  });
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(() => {
    return storage.get('reportConfigs:sortOrder', null);
  });

  // Save column widths to localStorage whenever they change
  useEffect(() => {
    storage.set('reportConfigs:columnWidths', columnWidths);
  }, [columnWidths, storage]);

  // Save sort settings to localStorage whenever they change
  useEffect(() => {
    storage.set('reportConfigs:sortField', sortField);
    storage.set('reportConfigs:sortOrder', sortOrder);
  }, [sortField, sortOrder, storage]);

  // Load entity types for filtering
  const { data: entityTypesData = [] } = useQuery({
    queryKey: ['entityTypes'],
    queryFn: async () => {
      try {
        const response = await getReportingFetchTypes();
        const data = response.data;
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('ReportConfigs - Failed to load entity types:', error);
        return [];
      }
    },
  });

  // Load report definitions
  const { data: definitions = [], isLoading, refetch } = useQuery({
    queryKey: ['reportDefinitions'],
    queryFn: async () => {
      try {
        const { data } = await axios.get('/platform-api/reporting/definitions', {
          params: {
            fields: ['id', 'description', 'type', 'userId', 'creationDate'],
            size: 999,
          },
        });

        const defs = data._embedded?.gridConfigFieldsViews || [];

        // Load user information (optional - gracefully handle if endpoint doesn't exist)
        const userIds = defs.map((el: any) => el.gridConfigFields.userId).filter(Boolean);
        const uniqueUserIds = [...new Set(userIds)];

        if (uniqueUserIds.length > 0) {
          try {
            const { data: users } = await axios.post('/platform-api/users/get-by-ids', uniqueUserIds);

            return defs.map((el: any) => {
              el.gridConfigFields.user = users.find((user: any) => user.userId === el.gridConfigFields.userId);
              return el;
            });
          } catch (userError) {
            // If user endpoint doesn't exist, just return defs without user info
            console.warn('Failed to load user information (endpoint may not exist):', userError);
            return defs;
          }
        }

        return defs;
      } catch (error) {
        console.error('Failed to load report definitions:', error);
        return [];
      }
    },
  });

  // Transform definitions to table data
  const tableData = useMemo((): ReportConfigRow[] => {
    let data = definitions.map((report: any) => {
      const runningReport = runningReports.find((el) => el.configName === report.gridConfigFields.id);

      // Extract name from ID: "CYODA-Activity-fff" -> "fff"
      const name = report.gridConfigFields.id.split('-').slice(2).join('-');

      // Find entity type info
      const entityClass = report.gridConfigFields.type;
      const entityTypeInfo = entityTypesData.find((et: any) => {
        if (typeof et === 'object') {
          // Extract short class name from full class name
          // e.g., 'com.cyoda.tdb.model.search.SearchUsageEntity' -> 'SearchUsageEntity'
          const shortName = et.name.split('.').pop();
          return shortName === entityClass;
        }
        return et === entityClass;
      });
      const entityTypeValue = typeof entityTypeInfo === 'object' ? entityTypeInfo.type : null;

      return {
        id: report.gridConfigFields.id,
        groupingVersion: runningReport?.groupingVersion,
        name,
        entity: report.gridConfigFields.type,
        entityClassNameLabel: report.gridConfigFields.type,
        username: report.gridConfigFields.user?.username || '',
        description: report.gridConfigFields.description,
        loadingReportButton: runningReport?.status === 'RUNNING',
        created: report.gridConfigFields.creationDate || '',
        createdHuman: report.gridConfigFields.creationDate
          ? moment(report.gridConfigFields.creationDate).format('YYYY-MM-DD HH:mm')
          : '',
        reportId: runningReport?.reportId,
        reportExecutionTime: runningReport?.reportId ? 2 : 0,
        entityType: entityTypeValue,
      };
    });

    // Filter by entity type from global toggle
    if (entityTypesData.length > 0 && entityTypesData.some((et: any) => typeof et === 'object' && et.type)) {
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
  }, [definitions, runningReports, filterForm, entityType, entityTypesData]);

  // Extract unique users for filter
  const usersOptions = useMemo((): { value: string; label: string }[] => {
    const users = definitions
      .filter((report: any) => report.gridConfigFields.user)
      .map((report: any) => ({
        value: report.gridConfigFields.user.username,
        label: report.gridConfigFields.user.username,
      }));

    return Array.from(new Map(users.map((u: { value: string; label: string }) => [u.value, u])).values());
  }, [definitions]);

  // Extract unique entities for filter
  const entityOptions = useMemo((): { value: string; label: string }[] => {
    const entities = definitions.map((report: any) => ({
      value: report.gridConfigFields.type,
      label: report.gridConfigFields.type,
    }));

    return Array.from(new Map(entities.map((e: { value: string; label: string }) => [e.value, e])).values());
  }, [definitions]);

  // State options for filter
  const stateOptions = useMemo((): { value: string; label: string }[] => {
    return [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INACTIVE', label: 'Inactive' },
      { value: 'DRAFT', label: 'Draft' },
      { value: 'ARCHIVED', label: 'Archived' },
    ];
  }, []);

  // Load report types
  const { data: typeOptions = [] } = useQuery({
    queryKey: ['reportTypes'],
    queryFn: async () => {
      try {
        const { data } = await axios.get('/platform-api/reporting/types');
        const types = data._embedded?.strings || [];
        return types.map((type: string) => ({
          value: type,
          label: type,
        }));
      } catch (error) {
        console.error('Failed to load report types:', error);
        return [];
      }
    },
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: async (formData: CreateReportFormData) => {
      const configDefinition = {
        ...HelperReportDefinition.reportDefinition(),
        '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
        description: formData.description,
        requestClass: formData.requestClass,
        condition: {
          '@bean': 'com.cyoda.core.conditions.GroupCondition',
          operator: 'OR',
          conditions: [],
        },
      };

      const { data } = await createReportDefinition(formData.name, configDefinition);
      return data;
    },
    onSuccess: (data) => {
      message.success('New Report Was Created');
      refetch();
      navigate(`/tableau/report-editor/${data.content}?isNew=true`);
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to create report');
    },
  });

  // Clone report mutation
  const cloneReportMutation = useMutation({
    mutationFn: async ({ reportId, newName, newDescription }: { reportId: string; newName: string; newDescription: string }) => {
      // Load existing config
      const { data: configData } = await axios.get(`/platform-api/reporting/definitions/${encodeURIComponent(reportId)}`);
      const configDefinition = { ...configData.content, description: newDescription };

      // Create new config with cloned data
      const { data } = await axios.post(
        `/platform-api/reporting/definitions?name=${encodeURIComponent(newName)}`,
        configDefinition
      );
      return data;
    },
    onSuccess: (data) => {
      message.success('Report cloned successfully');
      refetch();
      navigate(`/tableau/report-editor/${data.content}`);
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to clone report');
    },
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async ({ reportId, cascade = false }: { reportId: string; cascade?: boolean }) => {
      const encodedId = encodeURIComponent(reportId);
      const url = cascade
        ? `/platform-api/reporting/definitions/${encodedId}?cascade=true`
        : `/platform-api/reporting/definitions/${encodedId}`;
      await axios.delete(url);
    },
    onSuccess: () => {
      message.success('Report deleted successfully');
      refetch();
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to delete report');
    },
  });

  // Run report mutation
  const runReportMutation = useMutation({
    mutationFn: async (configId: string) => {
      const { data } = await runReportFromPredefinedConfig(configId);
      return data;
    },
    onSuccess: (data, configId) => {
      message.success('Report execution started');
      // Add to running reports
      // data.content is an object with reportId and groupingVersion
      const reportId = data.content?.reportId || data.content;
      const groupingVersion = data.content?.groupingVersion;
      setRunningReports((prev) => [
        ...prev,
        { configName: configId, reportId, groupingVersion, status: 'RUNNING' },
      ]);
      queryClient.invalidateQueries({ queryKey: ['reports', 'history'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to run report');
    },
  });

  // Cancel report mutation
  const cancelReportMutation = useMutation({
    mutationFn: async ({ reportId, groupingVersion }: { reportId: string; groupingVersion?: string }) => {
      // Use DELETE method with groupingVersion as in the old project
      if (groupingVersion) {
        await axios.delete(`/platform-api/reporting/report/${encodeURIComponent(reportId)}/${groupingVersion}`);
      } else {
        // Fallback to POST if no groupingVersion
        await axios.post(`/platform-api/reporting/report/${encodeURIComponent(reportId)}/cancel`);
      }
    },
    onSuccess: (_, { reportId }) => {
      message.success('Report cancelled');
      // Remove from running reports
      setRunningReports((prev) => prev.filter((r) => r.reportId !== reportId));
      queryClient.invalidateQueries({ queryKey: ['reports', 'history'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to cancel report');
    },
  });

  // Handle status change from ReportStatusTracker
  const handleStatusChange = useCallback((reportId: string, status: string) => {
    setRunningReports((prev) => {
      // If status is not RUNNING, remove from running reports
      if (status !== 'RUNNING' && status !== 'STARTED') {
        return prev.filter((r) => r.reportId !== reportId);
      }

      // Update status if report exists
      const existingIndex = prev.findIndex((r) => r.reportId === reportId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], status };
        return updated;
      }

      return prev;
    });
  }, []);

  // Handlers
  const handleCreateReport = useCallback((formData: CreateReportFormData) => {
    return createReportMutation.mutateAsync(formData);
  }, [createReportMutation]);

  const handleCloneReport = useCallback((reportId: string, newName: string, newDescription: string) => {
    return cloneReportMutation.mutateAsync({ reportId, newName, newDescription });
  }, [cloneReportMutation]);

  const handleDeleteReport = useCallback((row: ReportConfigRow) => {
    modal.confirm({
      title: 'Confirm',
      content: 'Do you really want to delete this record?',
      onOk: async () => {
        try {
          await deleteReportMutation.mutateAsync({ reportId: row.id });
        } catch (error: any) {
          if (error.message?.includes('Cannot delete config')) {
            modal.confirm({
              title: 'Warning',
              content: `${error.response?.data?.detail || error.message} Do you want delete with reports?`,
              onOk: async () => {
                await deleteReportMutation.mutateAsync({ reportId: row.id, cascade: true });
              },
            });
          }
        }
      },
    });
  }, [deleteReportMutation, modal]);

  const handleRunReport = useCallback((row: ReportConfigRow) => {
    runReportMutation.mutate(row.id);
  }, [runReportMutation]);

  const handleCancelReport = useCallback((row: ReportConfigRow) => {
    if (!row.reportId) return;

    // Find groupingVersion from runningReports
    const runningReport = runningReports.find((r) => r.reportId === row.reportId);
    const groupingVersion = runningReport?.groupingVersion || row.groupingVersion;

    modal.confirm({
      title: 'Cancel Report',
      content: 'Are you sure you want to cancel this running report?',
      onOk: () => {
        cancelReportMutation.mutate({ reportId: row.reportId!, groupingVersion });
      },
    });
  }, [cancelReportMutation, modal, runningReports]);

  const handleEditReport = useCallback((row: ReportConfigRow) => {
    navigate(`/tableau/report-editor/${encodeURIComponent(row.id)}`);
  }, [navigate]);

  const handleCloneClick = useCallback((row: ReportConfigRow) => {
    cloneDialogRef.current?.open(row.id, row.name, row.description);
  }, []);

  const handleExport = useCallback(async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one report to export');
      return;
    }

    try {
      setExportLoading(true);
      const { data } = await exportReportsByIds(selectedRowKeys);

      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export_${selectedRowKeys.map(id => id.toLowerCase()).join('-AND-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('Reports exported successfully');
    } catch (error: any) {
      console.error('Export failed:', error);
      message.error(error.message || 'Failed to export reports');
    } finally {
      setExportLoading(false);
    }
  }, [selectedRowKeys]);

  const handleImport = useCallback(async (file: File) => {
    try {
      setImportLoading(true);

      // Read file content
      const text = await file.text();
      const data = JSON.parse(text);

      // Import reports
      await importReports(data);

      message.success('Reports imported successfully');
      refetch();
    } catch (error: any) {
      console.error('Import failed:', error);
      message.error(error.message || 'Failed to import reports');
    } finally {
      setImportLoading(false);
    }

    // Prevent upload
    return false;
  }, [refetch]);

  const handleResetState = useCallback(() => {
    setFilterForm({});
    storage.remove('tableSaveState:configEditorReports:table');
    storage.remove('reportConfigs:columnWidths');
    // Reset column widths to defaults
    setColumnWidths({
      name: 200,
      description: 250,
      entityClassNameLabel: 180,
      username: 120,
      createdHuman: 150,
      action: 180,
    });
    refetch();
  }, [storage, refetch]);

  // Handle column resize
  const handleResize = useCallback((key: string) => {
    return (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      setColumnWidths((prev) => ({
        ...prev,
        [key]: size.width,
      }));
    };
  }, []);

  // Table columns with resizable widths
  const columns: ColumnsType<ReportConfigRow> = useMemo(() => {
    const resizableColumns: ColumnsType<ReportConfigRow> = [
      {
        title: 'Config',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
        sortOrder: sortField === 'name' ? sortOrder : null,
        width: columnWidths.name,
        ellipsis: true,
        onHeaderCell: () => {
          const w = columnWidths.name;
          return {
            width: w,
            onResize: handleResize('name'),
          } as any;
        },
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
        width: columnWidths.description,
        onHeaderCell: () => {
          const w = columnWidths.description;
          return {
            width: w,
            onResize: handleResize('description'),
          } as any;
        },
      },
      {
        title: 'Type',
        dataIndex: 'entityClassNameLabel',
        key: 'entity',
        width: columnWidths.entityClassNameLabel,
        ellipsis: {
          showTitle: true,
        },
        sorter: (a, b) => a.entityClassNameLabel.localeCompare(b.entityClassNameLabel),
        sortOrder: sortField === 'entity' ? sortOrder : null,
        render: (text: string) => (
          <Tooltip title={text}>
            <span>{text}</span>
          </Tooltip>
        ),
        onHeaderCell: () => {
          const w = columnWidths.entityClassNameLabel;
          return {
            width: w,
            onResize: handleResize('entityClassNameLabel'),
          } as any;
        },
      },
      {
        title: 'User',
        dataIndex: 'username',
        key: 'username',
        width: columnWidths.username,
        ellipsis: true,
        sorter: (a, b) => a.username.localeCompare(b.username),
        sortOrder: sortField === 'username' ? sortOrder : null,
        onHeaderCell: () => {
          const w = columnWidths.username;
          return {
            width: w,
            onResize: handleResize('username'),
          } as any;
        },
      },
      {
        title: 'Created',
        dataIndex: 'createdHuman',
        key: 'created',
        width: columnWidths.createdHuman,
        sorter: (a, b) => a.created.localeCompare(b.created),
        sortOrder: sortField === 'created' ? sortOrder : null,
        onHeaderCell: () => {
          const w = columnWidths.createdHuman;
          return {
            width: w,
            onResize: handleResize('createdHuman'),
          } as any;
        },
      },
      {
        title: 'Action',
        key: 'action',
        width: columnWidths.action,
        fixed: 'right',
        onHeaderCell: () => {
          const w = columnWidths.action;
          return {
            width: w,
            onResize: handleResize('action'),
          } as any;
        },
        render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditReport(record)}
              disabled={record.loadingReportButton}
            />
          </Tooltip>
          <Tooltip title="Clone">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCloneClick(record)}
              disabled={record.loadingReportButton}
            />
          </Tooltip>
          {!record.loadingReportButton ? (
            <Tooltip title="Run">
              <Button
                type="text"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleRunReport(record)}
                loading={record.loadingReportButton}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Cancel">
              <Button
                type="text"
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={() => handleCancelReport(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteReport(record)}
              disabled={record.loadingReportButton}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return resizableColumns;
}, [columnWidths, sortField, sortOrder, handleResize, handleEditReport, handleCloneClick, handleRunReport, handleCancelReport, handleDeleteReport]);

  return (
    <App>
      <div className="report-configs">
      <div className="flex-buttons">
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => createDialogRef.current?.open()}
          >
            Create New
          </Button>

          <Divider type="vertical" />

          <Tooltip title="Export selected reports">
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={handleExport}
              loading={exportLoading}
              disabled={selectedRowKeys.length === 0}
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

          <Button icon={<ReloadOutlined />} onClick={handleResetState}>
            Reset State
          </Button>
        </Space>
      </div>

      <ConfigEditorReportsFilter
        value={filterForm}
        onChange={setFilterForm}
        usersOptions={usersOptions}
        entityOptions={entityOptions}
        stateOptions={stateOptions}
        typeOptions={typeOptions}
      />

      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="id"
        loading={isLoading}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[]),
        }}
        rowClassName={(record) => (record.id === selectedRowId ? 'success-row' : '')}
        onRow={(record) => ({
          onClick: () => setSelectedRowId(record.id),
        })}
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
        pagination={{
          pageSize: pageSize,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          className: 'pagination-bar',
          selectComponentClass: undefined,
          onShowSizeChange: (current, size) => setPageSize(size),
        }}
        scroll={{ x: 1100 }}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
      />

      <CreateReportDialog ref={createDialogRef} onConfirm={handleCreateReport} />
      <CloneReportDialog ref={cloneDialogRef} onConfirm={handleCloneReport} />

      {/* Report status trackers - one for each running report */}
      {runningReports.map((report) => (
        <ReportStatusTracker
          key={report.reportId}
          reportId={report.reportId}
          groupingVersion={report.groupingVersion}
          configName={report.configName}
          onStatusChange={handleStatusChange}
        />
      ))}
      </div>
    </App>
  );
};

export default ReportConfigs;

