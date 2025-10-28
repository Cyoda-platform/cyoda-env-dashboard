/**
 * Workflows Page
 * Main workflows list view with filtering and actions
 * Migrated from: .old_project/packages/statemachine/src/views/Workflows.vue
 */

import React, { useState, useMemo } from 'react';
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
import {
  useWorkflowsList,
  useWorkflowEnabledTypes,
  useDeleteWorkflow,
  useCopyWorkflow,
} from '../hooks/useStatemachine';
import { ExportImport } from '../components/ExportImport';
import { StateIndicator } from '../components/StateIndicator';
import { useGlobalUiSettingsStore } from '@cyoda/http-api-react';
import type { Workflow, WorkflowTableRow } from '../types';

export const Workflows: React.FC = () => {
  const { modal, message } = App.useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

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
    console.log('[Workflows] workflowEnabledTypes:', workflowEnabledTypes);
    console.log('[Workflows] Feature flag VITE_FEATURE_FLAG_USE_MODELS_INFO:', import.meta.env.VITE_FEATURE_FLAG_USE_MODELS_INFO);

    if (workflowEnabledTypes.length === 0) {
      console.log('[Workflows] hasEntityTypeInfo: false (empty array)');
      return false;
    }

    // Check if first item is an object with 'type' field
    const firstItem = workflowEnabledTypes[0];
    const hasType = typeof firstItem === 'object' && firstItem !== null && 'type' in firstItem;
    console.log('[Workflows] First item:', firstItem);
    console.log('[Workflows] hasEntityTypeInfo:', hasType);

    return hasType;
  }, [workflowEnabledTypes]);

  // Mutations
  const deleteWorkflowMutation = useDeleteWorkflow();
  const copyWorkflowMutation = useCopyWorkflow();
  
  // Helper function to get persisted type
  const getPersistedType = (persisted: boolean): 'persisted' | 'transient' => {
    return persisted ? 'persisted' : 'transient';
  };
  
  // Helper function to map entity type
  const entityTypeMapper = (type: string): string => {
    const map: Record<string, string> = {
      BUSINESS: 'Business',
      PERSISTENCE: 'Technical',
    };
    return map[type] || type;
  };

  // Table data with filtering
  const tableData = useMemo<WorkflowTableRow[]>(() => {
    console.log('[Workflows] Building table data...');
    console.log('[Workflows] workflows count:', workflows.length);
    console.log('[Workflows] entityType filter:', entityType);

    const mapped = workflows.map((workflow: Workflow) => {
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

          console.log(`[Workflows] Workflow ${workflow.name} (${workflow.entityClassName}):`, {
            found: true,
            entityType: entityTypeValue,
            typeLabel,
            entityClassNameLabel,
          });
        } else {
          console.log(`[Workflows] Workflow ${workflow.name} (${workflow.entityClassName}):`, {
            found: !!entityRow,
            hasType: entityRow ? 'type' in entityRow : false,
            entityRow,
          });
        }
      }

      return {
        ...workflow,
        key: workflow.id,
        entityClassNameLabel,
        entityType: entityTypeValue,
      };
    });

    console.log('[Workflows] Mapped workflows:', mapped);

    const filtered = mapped.filter((workflow) => {
      // Filter by entity type only if entity type info is available
      if (hasEntityTypeInfo && workflow.entityType && workflow.entityType !== entityType) {
        console.log(`[Workflows] Filtering out ${workflow.name}: type ${workflow.entityType} !== ${entityType}`);
        return false;
      }

      // Filter by search text
      if (!filter) return true;
      const filterLower = filter.toLowerCase();
      return (
        workflow.name.toLowerCase().includes(filterLower) ||
        workflow.entityClassNameLabel.toLowerCase().includes(filterLower)
      );
    });

    console.log('[Workflows] Filtered workflows:', filtered);
    return filtered;
  }, [workflows, workflowEnabledTypes, filter, entityType, hasEntityTypeInfo]);

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

          // Refetch to update the table
          await refetch();
        } catch (error) {
          message.error('Failed to delete workflow');
        }
      },
    });
  };
  
  // Table columns
  const columns: ColumnsType<WorkflowTableRow> = [
    {
      title: 'Entity',
      dataIndex: 'entityClassNameLabel',
      key: 'entityClassNameLabel',
      sorter: (a, b) => a.entityClassNameLabel.localeCompare(b.entityClassNameLabel),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      width: 100,
      render: (active: boolean) => <StateIndicator state={active} />,
      sorter: (a, b) => Number(a.active) - Number(b.active),
    },
    {
      title: 'Persisted',
      dataIndex: 'persisted',
      key: 'persisted',
      width: 130,
      render: (persisted: boolean) => <StateIndicator state={persisted} />,
      sorter: (a, b) => Number(a.persisted) - Number(b.persisted),
    },
    {
      title: 'Creation Date',
      dataIndex: 'creationDate',
      key: 'creationDate',
      width: 200,
      render: (date: number) => new Date(date).toLocaleString(),
      sorter: (a, b) => a.creationDate - b.creationDate,
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
    },
  ];
  
  return (
    <div style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ margin: 0 }}>Workflows</h1>
      </div>

      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Header with filter and create button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Input
              placeholder="Filter workflows"
              value={filter}
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
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            pagination={{
              defaultPageSize: 10,
              pageSizeOptions: ['5', '10', '20', '50'],
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} workflows`,
            }}
            bordered
          />
        </Space>
      </Card>
    </div>
  );
};

export default Workflows;

