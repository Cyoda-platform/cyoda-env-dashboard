/**
 * Workflows Page
 * Main workflows list view with filtering and actions
 * Migrated from: .old_project/packages/statemachine/src/views/Workflows.vue
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Space, Tooltip, App, Card } from 'antd';
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
import {
  useWorkflowsList,
  useWorkflowEnabledTypes,
  useDeleteWorkflow,
  useCopyWorkflow,
} from '../hooks/useStatemachine';
import { useTableState } from '../hooks/useTableState';
import { useQueryInvalidation } from '../hooks/useQueryInvalidation';
import { ExportImport } from '../components/ExportImport';
import { StateIndicator } from '../components/StateIndicator';
import { ResizableTitle } from '../components/ResizableTitle';
import { HelperStorage } from '@cyoda/ui-lib-react';
import './Workflows.scss';
import { useGlobalUiSettingsStore } from '@cyoda/http-api-react';
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
  const { data: workflows = [], isLoading, refetch } = useWorkflowsList();
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

  // Helper function to map entity type
  const entityTypeMapper = (type: string): string => {
    const map: Record<string, string> = {
      BUSINESS: 'Business',
      PERSISTENCE: 'Technical',
    };
    return map[type] || type;
  };

  // Table data with filtering and sorting
  const tableData = useMemo<WorkflowTableRow[]>(() => {
    let filtered = workflows
      .map((workflow: Workflow) => {
        // Get short class name (last part after the last dot)
        const entityShortClassName = workflow.entityClassName.split('.').pop() || workflow.entityClassName;
        let entityClassNameLabel = entityShortClassName;
        let entityTypeValue = null;

        // Only use entity type info if available (feature flag equivalent)
        if (hasEntityTypeInfo) {
          // Find entity type info
          const entityRow = workflowEnabledTypes.find(
            (item: any) => item.name === workflow.entityClassName || item.value === workflow.entityClassName
          );

          if (entityRow && entityRow.type) {
            // Append entity type label to the short name
            entityTypeValue = entityRow.type;
            const typeLabel = entityTypeMapper(entityRow.type);
            entityClassNameLabel = `${entityShortClassName} (${typeLabel})`;
          }
        }

        return {
          ...workflow,
          key: workflow.id,
          entityClassNameLabel,
          entityType: entityTypeValue,
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
      });

    return filtered;
  }, [workflows, workflowEnabledTypes, tableState.filter, entityType, hasEntityTypeInfo]);

  // Get selected workflows for export
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
      const persistedType = getPersistedType(record.persisted);
      const newWorkflowId = await copyWorkflowMutation.mutateAsync({
        persistedType,
        workflowId: record.id,
      });

      message.success('Workflow copied successfully');

      // Navigate to the new workflow as 'persisted' so it can be edited
      navigate(
        `/workflow/${newWorkflowId}?persistedType=persisted&entityClassName=${record.entityClassName}`
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
          await deleteWorkflowMutation.mutateAsync(record.id);
          message.success('Workflow deleted successfully');

          // Clear selection if deleted workflow was selected
          setSelectedRowKeys(prev => prev.filter(key => key !== record.key));

          // Invalidate workflows list to refresh data
          invalidateWorkflowsList();
        } catch (error) {
          message.error('Failed to delete workflow');
        }
      },
    });
  };
  
  // Table columns with resizable support
  const columns: ColumnsType<WorkflowTableRow> = useMemo(() => [
    {
      title: 'Entity',
      dataIndex: 'entityClassNameLabel',
      key: 'entityClassNameLabel',
      width: columnWidths.entityClassNameLabel,
      sorter: (a, b) => a.entityClassNameLabel.localeCompare(b.entityClassNameLabel),
      onHeaderCell: () => ({
        width: columnWidths.entityClassNameLabel,
        onResize: handleResize('entityClassNameLabel'),
      }),
    },
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
      width: 260,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Workflow">
            <Button
              type="primary"
              size="small"
              icon={<SearchOutlined />}
              onClick={() => handleViewWorkflow(record)}
            />
          </Tooltip>
          <Tooltip title="Instances">
            <Button
              type="primary"
              size="small"
              icon={<TableOutlined />}
              onClick={() => handleViewInstances(record)}
            />
          </Tooltip>
          <Tooltip title="Copy workflow">
            <Button
              type="primary"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopyWorkflow(record)}
              loading={copyWorkflowMutation.isPending}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteWorkflow(record)}
              loading={deleteWorkflowMutation.isPending}
            />
          </Tooltip>
        </Space>
      ),
      width: columnWidths.operations,
      onHeaderCell: () => ({
        width: columnWidths.operations,
        onResize: handleResize('operations'),
      }),
    },
  ], [columnWidths, handleResize, handleViewWorkflow, handleViewInstances, handleCopyWorkflow, handleDeleteWorkflow, copyWorkflowMutation.isPending, deleteWorkflowMutation.isPending]);
  
  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <h1 className="page-title">Workflows</h1>

      <Card variant="borderless">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Header with filter and create button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        </Space>
      </Card>
    </div>
  );
};

export default Workflows;

