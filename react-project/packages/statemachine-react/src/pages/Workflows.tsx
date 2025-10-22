/**
 * Workflows Page
 * Main workflows list view with filtering and actions
 * Migrated from: .old_project/packages/statemachine/src/views/Workflows.vue
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Space, Tooltip, Modal, message, Card } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  CopyOutlined,
  DeleteOutlined,
  TableOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useWorkflowsList,
  useWorkflowEnabledTypes,
  useDeleteWorkflow,
  useCopyWorkflow,
} from '../hooks/useStatemachine';
import { ExportImport } from '../components/ExportImport';
import type { Workflow, WorkflowTableRow } from '../types';

const { confirm } = Modal;

export const Workflows: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // Queries
  const { data: workflows = [], isLoading, refetch } = useWorkflowsList();
  const { data: workflowEnabledTypes = [] } = useWorkflowEnabledTypes();
  
  // Mutations
  const deleteWorkflowMutation = useDeleteWorkflow();
  const copyWorkflowMutation = useCopyWorkflow();
  
  // Helper function to get persisted type
  const getPersistedType = (persisted: boolean): 'persisted' | 'transient' => {
    return persisted ? 'persisted' : 'transient';
  };
  
  // Table data with filtering
  const tableData = useMemo<WorkflowTableRow[]>(() => {
    return workflows
      .map((workflow: Workflow) => {
        let entityClassNameLabel = workflow.entityClassName;

        // Find entity type info
        const entityRow = workflowEnabledTypes.find(
          (item: any) => item.name === workflow.entityClassName || item.value === workflow.entityClassName
        );

        if (entityRow) {
          entityClassNameLabel = entityRow.label || entityRow.name || workflow.entityClassName;
        }

        return {
          ...workflow,
          key: workflow.id,
          entityClassNameLabel,
        };
      })
      .filter((workflow) => {
        if (!filter) return true;
        const filterLower = filter.toLowerCase();
        return (
          workflow.name.toLowerCase().includes(filterLower) ||
          workflow.entityClassNameLabel.toLowerCase().includes(filterLower)
        );
      });
  }, [workflows, workflowEnabledTypes, filter]);

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

      // Navigate to the new workflow
      navigate(
        `/workflow/${newWorkflowId}?persistedType=${persistedType}&entityClassName=${record.entityClassName}`
      );
    } catch (error) {
      message.error('Failed to copy workflow');
    }
  };
  
  const handleDeleteWorkflow = (record: WorkflowTableRow) => {
    confirm({
      title: 'Delete confirmation',
      content: 'Are you sure you want to delete this workflow?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteWorkflowMutation.mutateAsync(record.id);
          message.success('Workflow deleted successfully');
          refetch();
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
      render: (active: boolean) => (
        <span style={{ color: active ? '#52c41a' : '#ff4d4f' }}>
          {active ? 'Yes' : 'No'}
        </span>
      ),
      sorter: (a, b) => Number(a.active) - Number(b.active),
    },
    {
      title: 'Persisted',
      dataIndex: 'persisted',
      key: 'persisted',
      width: 130,
      render: (persisted: boolean) => (
        <span style={{ color: persisted ? '#52c41a' : '#ff4d4f' }}>
          {persisted ? 'Yes' : 'No'}
        </span>
      ),
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

