/**
 * ReportConfigs Page
 * Migrated from: .old_project/packages/http-api/src/views/ConfigEditor/ConfigEditorReports.vue
 */

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Table, Button, Tooltip, Modal, message, Space, Divider, Upload } from 'antd';
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
import axios from 'axios';
import moment from 'moment';
import { exportReportsByIds, importReports } from '@cyoda/http-api-react';
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

const ReportConfigs: React.FC<ReportConfigsProps> = ({ onResetState }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storage = useMemo(() => new HelperStorage(), []);
  
  const createDialogRef = useRef<CreateReportDialogRef>(null);
  const cloneDialogRef = useRef<CloneReportDialogRef>(null);

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [filterForm, setFilterForm] = useState<FilterForm>({});
  const [runningReports, setRunningReports] = useState<RunningReport[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // Column widths state - load from localStorage
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('reportConfigs:columnWidths', {});
    return saved || {
      name: 200,
      description: 250,
      entityClassNameLabel: 180,
      username: 120,
      createdHuman: 150,
      action: 180,
    };
  });

  // Save column widths to localStorage whenever they change
  useEffect(() => {
    storage.set('reportConfigs:columnWidths', columnWidths);
  }, [columnWidths, storage]);

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

        // Load user information
        const userIds = defs.map((el: any) => el.gridConfigFields.userId).filter(Boolean);
        const uniqueUserIds = [...new Set(userIds)];

        if (uniqueUserIds.length > 0) {
          const { data: users } = await axios.post('/platform-api/users/list', uniqueUserIds);

          return defs.map((el: any) => {
            el.gridConfigFields.user = users.find((user: any) => user.userId === el.gridConfigFields.userId);
            return el;
          });
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

      return {
        id: report.gridConfigFields.id,
        groupingVersion: runningReport?.groupingVersion,
        name: report.gridConfigFields.name || report.gridConfigFields.id,
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
      };
    });

    // Apply filters
    data = HelperReportDefinition.applyFiltersForReportTables(data, filterForm);

    return data;
  }, [definitions, runningReports, filterForm]);

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

      const { data } = await axios.post(
        `/platform-api/reporting/definitions?name=${encodeURIComponent(formData.name)}`,
        configDefinition
      );
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
      const { data: configData } = await axios.get(`/platform-api/reporting/definitions/${reportId}`);
      const configDefinition = { ...configData.content, description: newDescription };

      // Create new config with cloned data
      const { data } = await axios.post(
        `/platform-api/reporting/definitions/${newName}`,
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
      const url = cascade
        ? `/platform-api/reporting/definitions/${reportId}?cascade=true`
        : `/platform-api/reporting/definitions/${reportId}`;
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
      const { data } = await axios.post(`/platform-api/pre?gridConfig=${encodeURIComponent(configId)}`);
      return data;
    },
    onSuccess: (data, configId) => {
      message.success('Report execution started');
      // Add to running reports
      setRunningReports((prev) => [
        ...prev,
        { configName: configId, reportId: data.content, status: 'RUNNING' },
      ]);
      queryClient.invalidateQueries({ queryKey: ['reports', 'history'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to run report');
    },
  });

  // Cancel report mutation
  const cancelReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      await axios.post(`/platform-api/reporting/report/${reportId}/cancel`);
    },
    onSuccess: (_, reportId) => {
      message.success('Report cancelled');
      // Remove from running reports
      setRunningReports((prev) => prev.filter((r) => r.reportId !== reportId));
      queryClient.invalidateQueries({ queryKey: ['reports', 'history'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to cancel report');
    },
  });

  // Handlers
  const handleCreateReport = useCallback((formData: CreateReportFormData) => {
    return createReportMutation.mutateAsync(formData);
  }, [createReportMutation]);

  const handleCloneReport = useCallback((reportId: string, newName: string, newDescription: string) => {
    return cloneReportMutation.mutateAsync({ reportId, newName, newDescription });
  }, [cloneReportMutation]);

  const handleDeleteReport = useCallback((row: ReportConfigRow) => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Do you really want to delete this record?',
      onOk: async () => {
        try {
          await deleteReportMutation.mutateAsync({ reportId: row.id });
        } catch (error: any) {
          if (error.message?.includes('Cannot delete config')) {
            Modal.confirm({
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
  }, [deleteReportMutation]);

  const handleRunReport = useCallback((row: ReportConfigRow) => {
    runReportMutation.mutate(row.id);
  }, [runReportMutation]);

  const handleCancelReport = useCallback((row: ReportConfigRow) => {
    if (!row.reportId) return;

    Modal.confirm({
      title: 'Cancel Report',
      content: 'Are you sure you want to cancel this running report?',
      onOk: () => {
        cancelReportMutation.mutate(row.reportId!);
      },
    });
  }, [cancelReportMutation]);

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
}, [columnWidths, handleResize, handleEditReport, handleCloneClick, handleRunReport, handleCancelReport, handleDeleteReport]);

  return (
    <div className="report-configs">
      <h1 className="label">Report Configurations</h1>

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

      <Divider />

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
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
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
    </div>
  );
};

export default ReportConfigs;

