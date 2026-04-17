/**
 * Workflows Page
 * Main workflows list view with filtering and actions
 * Migrated from: .old_project/packages/statemachine/src/views/Workflows.vue
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Space, Tooltip, App } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  CopyOutlined,
  DeleteOutlined,
  TableOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ResizeCallbackData } from 'react-resizable';
import { useQuery } from '@tanstack/react-query';
import {
  statemachineKeys,
  useWorkflowEnabledTypes,
  useDeleteWorkflow,
  useCopyWorkflow,
} from '../hooks/useStatemachine';
import { useStatemachineStore } from '../stores/statemachineStore';
import { useTableState } from '../hooks/useTableState';
import { useQueryInvalidation } from '../hooks/useQueryInvalidation';
import { ExportImport } from '../components/ExportImport';
import { StateIndicator } from '../components/StateIndicator';
import { ResizableTitle } from '@cyoda/ui-lib-react';
import { HelperStorage } from '@cyoda/ui-lib-react';
import './Workflows.scss';
import { useGlobalUiSettingsStore } from '@cyoda/http-api-react';
import { HelperFeatureFlags } from '@cyoda/http-api-react';
import { WorkflowsCloudStub } from './WorkflowsCloudStub';
import { getPersistedType } from '../utils/helpers';
import type { Workflow, WorkflowTableRow } from '../types';

/**
 * Extract timestamp from UUID v1
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/helpers/HelperFormat.ts
 */
function getTimeFromUuid(uuid: string): number {
  try {
    const uuid_arr = uuid.split('-');
    if (uuid_arr.length !== 5) return Date.now();

    const time_str = [uuid_arr[2].substring(1), uuid_arr[1], uuid_arr[0]].join('');
    const int_time = parseInt(time_str, 16) - 122192928000000000;

    return Math.floor(int_time / 10000);
  } catch (error) {
    return Date.now();
  }
}

export const Workflows: React.FC = () => {
  // When cyoda-cloud (or cyoda-go) is in use, render the stub cloud page.
  // The real cloud Workflows UI lands in sub-branch 3.
  if (HelperFeatureFlags.isCyodaCloud()) {
    return <WorkflowsCloudStub />;
  }

  const { modal, message } = App.useApp();
  const navigate = useNavigate();
  const storage = useMemo(() => new HelperStorage(), []);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = storage.get('workflows:columnWidths', {});
    const defaultWidths = {
      entityClassNameLabel: 180,
      name: 180,
      active: 100,
      persisted: 130,
      operations: 150,
    };
    return saved && Object.keys(saved).length > 0 ? saved : defaultWidths;
  });

  // Save column widths to localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      storage.set('workflows:columnWidths', columnWidths);
    }
  }, [columnWidths, storage]);

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

  // Table state persistence
  const { tableState, handleTableChange, setFilter } = useTableState({
    storageKey: 'workflowsTable',
    defaultPageSize: 10,
    syncWithUrl: true,
  });

  // Query invalidation (replaces event bus)
  const { invalidateWorkflowsList } = useQueryInvalidation();

  // Global UI settings
  const { entityType } = useGlobalUiSettingsStore();

  // Queries
  // The legacy table reads richer fields (id, entityClassName, persisted,
  // creationDate, etc.) than WorkflowGateway.listWorkflows projects into a
  // WorkflowSummary. Bypass the gateway here and call the legacy store
  // directly — same pattern WorkflowForm.tsx already uses for create/update.
  // The cloud branch above already returns to WorkflowsCloudStub, so this
  // only runs in legacy mode. Sub-branch 3 replaces this whole list page
  // with the real cloud Workflows UI; until then, legacy must keep working
  // against the legacy backend's full record shape.
  const { data: workflows = [], isLoading, refetch } = useQuery<Workflow[]>({
    queryKey: statemachineKeys.workflowsList(null),
    queryFn: async () => {
      const response = await useStatemachineStore.getState().getAllWorkflowsList(undefined);
      const data = response?.data;
      return Array.isArray(data) ? data : [];
    },
  });
  const { data: workflowEnabledTypes = [] } = useWorkflowEnabledTypes();

  // Check if entity type info is available (feature flag equivalent)
  // The backend returns either:
  // 1. Array of objects with 'type' field when feature is enabled: [{name, value, label, type}, ...]
  // 2. Array of strings when feature is disabled: ['com.cyoda.model.Entity', ...]
  const hasEntityTypeInfo = useMemo(() => {
    if (workflowEnabledTypes.length === 0) return false;

    // Check if first item is an object with 'type' field
    const firstItem = workflowEnabledTypes[0];
    return typeof firstItem === 'object' && firstItem !== null && 'type' in firstItem;
  }, [workflowEnabledTypes]);

  // Mutations
  const deleteWorkflowMutation = useDeleteWorkflow();
  const copyWorkflowMutation = useCopyWorkflow();

  // Table data with filtering and sorting
  const tableData = useMemo<WorkflowTableRow[]>(() => {
    let filtered = workflows
    .map((workflow: Workflow) => {
      const parts = workflow.entityClassName.split('.');
      let entityClassNameLabel: string;
      let version: string | null = null;
      let entityTypeValue = null;

      // Only use entity type info if available (feature flag equivalent)
      if (hasEntityTypeInfo) {
        // Find entity type info
        const entityRow = workflowEnabledTypes.find(
          (item: any) => item.name === workflow.entityClassName || item.value === workflow.entityClassName
        );

        if (entityRow && entityRow.type) {
          // Store entity type for filtering
          entityTypeValue = entityRow.type;
        }
      }

      // Parse entity name and version based on entity type
      if (entityTypeValue === 'BUSINESS') {
        // Business entities: format is "entityName.version" (e.g., "travel.1001")
        // Entity = everything before last dot, Version = last part
        entityClassNameLabel = parts.length >= 2 ? parts.slice(0, -1).join('.') : workflow.entityClassName;
        version = parts.length >= 2 ? parts[parts.length - 1] : null;
      } else {
        // Technical entities: format is full package name (e.g., "com.cyoda.tdb.model.metadata.EntityModel")
        // Show full entity name, no version
        entityClassNameLabel = workflow.entityClassName;
      }

      return {
        ...workflow,
        key: workflow.id,
        entityClassNameLabel,
        entityType: entityTypeValue,
        version,
      };
    })
      .filter((workflow) => {
        // Filter by entity type only if entity type info is available
        if (hasEntityTypeInfo && workflow.entityType && workflow.entityType !== entityType) {
          return false;
        }

        // Filter by search text
        if (!tableState.filter) return true;
        const filterLower = tableState.filter.toLowerCase();
        return (
          workflow.name.toLowerCase().includes(filterLower) ||
          workflow.entityClassNameLabel.toLowerCase().includes(filterLower)
        );
      })
      .sort((a, b) => {
        // Sort by creation date: newest first (descending order)
        if (!a.creationDate && !b.creationDate) return 0;
        if (!a.creationDate) return 1;
        if (!b.creationDate) return -1;
        return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
      });

    return filtered;
  }, [workflows, workflowEnabledTypes, tableState.filter, entityType, hasEntityTypeInfo]);

  // Get selected workflows for export
  // TODO(sub-branch-3): WorkflowSummary doesn't carry the legacy `id`; the
  // legacy gateway's listWorkflows assigns the legacy id to the summary's
  // `name` field. We use `name` as the row key here to match that mapping.
  const selectedWorkflows = useMemo(() => {
    return workflows.filter((w) => selectedRowKeys.includes(w.id));
  }, [workflows, selectedRowKeys]);
  
  // Handlers
  const handleCreateNew = () => {
    navigate('/workflow/new');
  };

  const handleViewWorkflow = (record: WorkflowTableRow) => {
    const persistedType = getPersistedType(record.persisted);
    navigate(
      `/workflow/${record.id}?persistedType=${persistedType}&entityClassName=${record.entityClassName}`
    );
  };

  const handleViewInstances = (record: WorkflowTableRow) => {
    navigate(`/instances?entityClassName=${record.entityClassName}`);
  };
  
  const handleCopyWorkflow = async (record: WorkflowTableRow) => {
    try {
      // Legacy mode: the gateway uses record.id (the legacy UUID) as the
      // sourceName; record.name is the human-readable label used for the
      // suggested copy name. The gateway returns the gateway-key of the new
      // workflow (in legacy mode, the new legacy id) so we can navigate
      // without a follow-up fetch.
      const { key: newWorkflowKey } = await copyWorkflowMutation.mutateAsync({
        modelRef: null,
        sourceName: record.id,
        newName: `${record.name} (copy)`,
      });

      message.success('Workflow copied successfully');

      // Navigate to the new workflow as 'persisted' so it can be edited.
      navigate(
        `/workflow/${newWorkflowKey}?persistedType=persisted&entityClassName=${record.entityClassName}`
      );
    } catch (error) {
      message.error('Failed to copy workflow');
    }
  };
  
  const handleDeleteWorkflow = (record: WorkflowTableRow) => {
    modal.confirm({
      title: 'Delete confirmation',
      content: 'Are you sure you want to delete this workflow?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteWorkflowMutation.mutateAsync({ modelRef: null, name: record.id });
          message.success('Workflow deleted successfully');

          // Clear selection if deleted workflow was selected
          setSelectedRowKeys(prev => prev.filter(key => key !== record.key));

          // Invalidate workflows list to refresh data
          invalidateWorkflowsList();
        } catch (error: any) {
          // Extract error message from different possible locations in the response
          const responseData = error?.response?.data;
          let errorMessage = '';
          let errorCode = '';

          // Try to extract error code and message from various response formats
          if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (responseData) {
            errorCode = responseData.code || responseData.errorCode || '';
            // Check multiple possible fields for error message
            errorMessage = responseData.detail || responseData.message || responseData.error || responseData.errorMessage || responseData.details || '';
          }

          // Fallback to error.message if we couldn't extract from response
          if (!errorMessage) {
            errorMessage = error?.message || '';
          }

          // Check for specific error codes and provide user-friendly messages
          if (errorCode === 'ILLEGAL_DELETE_TRANSITIONS_NOT_EMPTY' || errorMessage.includes('ILLEGAL_DELETE_TRANSITIONS_NOT_EMPTY') || errorMessage.includes('transitionIds')) {
            modal.error({
              title: 'Cannot Delete Workflow',
              content: 'This workflow cannot be deleted because it has transitions. Please delete all transitions first, then try again.',
              okText: 'OK',
            });
          } else if (errorCode === 'ILLEGAL_DELETE_STATES_NOT_EMPTY' || errorMessage.includes('ILLEGAL_DELETE_STATES_NOT_EMPTY') || errorMessage.includes('stateIds')) {
            modal.error({
              title: 'Cannot Delete Workflow',
              content: 'This workflow cannot be deleted because it has states. Please delete all states first, then try again.',
              okText: 'OK',
            });
          } else if (errorCode === 'ILLEGAL_DELETE_CRITERIA_NOT_EMPTY' || errorMessage.includes('ILLEGAL_DELETE_CRITERIA_NOT_EMPTY') || errorMessage.includes('criteriaIds')) {
            modal.error({
              title: 'Cannot Delete Workflow',
              content: 'This workflow cannot be deleted because it has criteria. Please delete all criteria first, then try again.',
              okText: 'OK',
            });
          } else if (errorCode === 'ILLEGAL_DELETE_PROCESSES_NOT_EMPTY' || errorMessage.includes('ILLEGAL_DELETE_PROCESSES_NOT_EMPTY') || errorMessage.includes('processIds')) {
            modal.error({
              title: 'Cannot Delete Workflow',
              content: 'This workflow cannot be deleted because it has processes. Please delete all processes first, then try again.',
              okText: 'OK',
            });
          } else {
            // Generic error message
            modal.error({
              title: 'Error',
              content: errorMessage || 'Failed to delete workflow',
              okText: 'OK',
            });
          }
        }
      },
    });
  };
  
  // Table columns with resizable support
  const columns: ColumnsType<WorkflowTableRow> = useMemo(() => [
    {
      title: entityType === 'BUSINESS' ? 'Business Entity' : 'Technical Entity',
      dataIndex: 'entityClassNameLabel',
      key: 'entityClassNameLabel',
      width: columnWidths.entityClassNameLabel,
      sorter: (a, b) => a.entityClassNameLabel.localeCompare(b.entityClassNameLabel),
      onHeaderCell: () => ({
        width: columnWidths.entityClassNameLabel,
        onResize: handleResize('entityClassNameLabel'),
      }),
    },
  // Version column - only for Business entities
  ...(entityType === 'BUSINESS' ? [{
    title: 'Version',
    dataIndex: 'version',
    key: 'version',
    width: 80,
  }] : []),
  {
    title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: columnWidths.name,
      sorter: (a, b) => a.name.localeCompare(b.name),
      onHeaderCell: () => ({
        width: columnWidths.name,
        onResize: handleResize('name'),
      }),
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      width: columnWidths.active,
      render: (active: boolean) => <StateIndicator state={active} />,
      sorter: (a, b) => Number(a.active) - Number(b.active),
      onHeaderCell: () => ({
        width: columnWidths.active,
        onResize: handleResize('active'),
      }),
    },
    {
      title: 'Persisted',
      dataIndex: 'persisted',
      key: 'persisted',
      width: columnWidths.persisted,
      render: (persisted: boolean) => <StateIndicator state={persisted} />,
      sorter: (a, b) => Number(a.persisted) - Number(b.persisted),
      onHeaderCell: () => ({
        width: columnWidths.persisted,
        onResize: handleResize('persisted'),
      }),
    },
    {
      title: 'Creation Date',
      dataIndex: 'creationDate',
      key: 'creationDate',
      width: 200,
      render: (date: string | number, record: WorkflowTableRow) => {
        let dateObj: Date;

        if (date) {
          dateObj = new Date(date);
          if (isNaN(dateObj.getTime())) {
            // If date is invalid, try to extract from UUID
            dateObj = new Date(getTimeFromUuid(record.id));
          }
        } else {
          // No creationDate - extract from UUID as fallback
          dateObj = new Date(getTimeFromUuid(record.id));
        }

        if (isNaN(dateObj.getTime())) return '-';

        // Format as DD.MM.YYYY HH:mm:ss to match Vue version
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getSeconds()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
      },
      sorter: (a, b) => {
        const getTimestamp = (workflow: WorkflowTableRow) => {
          if (workflow.creationDate) {
            const time = new Date(workflow.creationDate).getTime();
            if (!isNaN(time)) return time;
          }
          return getTimeFromUuid(workflow.id);
        };
        return getTimestamp(a) - getTimestamp(b);
      },
      defaultSortOrder: 'descend',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: columnWidths.operations,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Workflow">
            <Button
              type="default"
              size="small"
              icon={<SearchOutlined />}
              onClick={() => handleViewWorkflow(record)}
            />
          </Tooltip>
          <Tooltip title="Instances">
            <Button
              type="default"
              size="small"
              icon={<TableOutlined />}
              onClick={() => handleViewInstances(record)}
            />
          </Tooltip>
          <Tooltip title="Copy workflow">
            <Button
              type="default"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopyWorkflow(record)}
              loading={copyWorkflowMutation.isPending}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="default"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteWorkflow(record)}
              loading={deleteWorkflowMutation.isPending}
            />
          </Tooltip>
        </Space>
      ),
      onHeaderCell: () => ({
        width: columnWidths.operations,
        onResize: handleResize('operations'),
      }),
    },
  ], [columnWidths, handleResize, handleViewWorkflow, handleViewInstances, handleCopyWorkflow, handleDeleteWorkflow, copyWorkflowMutation.isPending, deleteWorkflowMutation.isPending, entityType]);
  
  return (
    <div className="workflows-page">
      {/* Header */}
      <h1 className="page-title">Workflows</h1>

      {/* Header with filter and create button */}
      <div className="workflows-header">
        <Input
          placeholder="Filter workflows"
          value={tableState.filter || ''}
          onChange={(e) => setFilter(e.target.value)}
          allowClear
          style={{ maxWidth: 400 }}
          prefix={<SearchOutlined />}
        />
        <Space>
          <ExportImport
            selectedWorkflows={selectedWorkflows}
            onImportSuccess={() => refetch()}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateNew}
          >
            Create new workflow
          </Button>
        </Space>
      </div>

      {/* Table */}
      <Table
          columns={columns}
          dataSource={tableData}
          loading={isLoading}
          components={{
            header: {
              cell: ResizableTitle,
            },
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            current: tableState.currentPage,
            pageSize: tableState.pageSize,
            pageSizeOptions: ['5', '10', '20', '50'],
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} workflows`,
            className: 'pagination-bar',
          }}
          onChange={handleTableChange}
          bordered
        />
    </div>
  );
};

export default Workflows;

