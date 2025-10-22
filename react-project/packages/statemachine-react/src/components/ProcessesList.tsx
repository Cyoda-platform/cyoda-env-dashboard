/**
 * Processes List Component
 * Display and manage processes for a workflow
 * Migrated from: .old_project/packages/statemachine/src/components/ProcessesList.vue
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tooltip, Modal, message } from 'antd';
import { PlusOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useProcessesList, useDeleteProcess, useCopyProcess } from '../hooks/useStatemachine';
import type { PersistedType } from '../types';

const { confirm } = Modal;

interface ProcessesListProps {
  workflowId: string;
  persistedType: PersistedType;
  entityClassName: string;
}

interface ProcessRow {
  key: string;
  id: string;
  name: string;
  description: string;
  persisted: boolean;
  isTemplate: boolean;
}

export const ProcessesList: React.FC<ProcessesListProps> = ({
  workflowId,
  persistedType,
  entityClassName,
}) => {
  const navigate = useNavigate();
  
  // Queries
  const { data: processes = [], isLoading, refetch } = useProcessesList(entityClassName);

  // Mutations
  const deleteProcessMutation = useDeleteProcess();
  const copyProcessMutation = useCopyProcess();
  
  // Table data
  const tableData = useMemo<ProcessRow[]>(() => {
    return processes.map((process: any) => ({
      key: process.id?.persistedId || process.id?.runtimeId || process.id,
      id: process.id?.persistedId || process.id?.runtimeId || process.id,
      name: process.name,
      description: process.description || '',
      persisted: process.persisted !== undefined ? process.persisted : true,
      isTemplate: process.isTemplate || false,
    }));
  }, [processes]);
  
  // Handlers
  const handleAddNew = () => {
    navigate(
      `/process/new?workflowId=${workflowId}&persistedType=persisted&entityClassName=${entityClassName}&workflowPersistedType=${persistedType}`
    );
  };

  const handleViewProcess = (record: ProcessRow) => {
    const processPersistedType = record.persisted ? 'persisted' : 'transient';
    navigate(
      `/process/${record.id}?persistedType=${processPersistedType}&entityClassName=${entityClassName}&workflowId=${workflowId}&workflowPersistedType=${persistedType}`
    );
  };

  const handleCopy = async (record: ProcessRow) => {
    try {
      const processPersistedType = record.persisted ? 'persisted' : 'transient';
      const newProcessId = await copyProcessMutation.mutateAsync({
        persistedType: processPersistedType,
        processId: record.id,
      });

      message.success('Process copied successfully');
      refetch();

      // Navigate to the new process
      navigate(
        `/process/${newProcessId}?persistedType=${processPersistedType}&entityClassName=${entityClassName}&workflowId=${workflowId}&workflowPersistedType=${persistedType}`
      );
    } catch (error) {
      message.error('Failed to copy process');
    }
  };
  
  const handleDelete = (record: ProcessRow) => {
    confirm({
      title: 'Delete confirmation',
      content: 'Are you sure you want to delete this process?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const processPersistedType = record.persisted ? 'persisted' : 'transient';
          await deleteProcessMutation.mutateAsync({
            persistedType: processPersistedType,
            processId: record.id,
          });
          message.success('Process deleted successfully');
          refetch();
        } catch (error) {
          message.error('Failed to delete process');
        }
      },
    });
  };
  
  // Table columns
  const columns: ColumnsType<ProcessRow> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <a onClick={() => handleViewProcess(record)}>{name}</a>
      ),
    },
    {
      title: 'Persisted',
      dataIndex: 'persisted',
      key: 'persisted',
      width: 150,
      sorter: (a, b) => Number(a.persisted) - Number(b.persisted),
      render: (persisted: boolean) => (
        <span style={{ color: persisted ? '#52c41a' : '#ff4d4f' }}>
          {persisted ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      title: 'Template',
      dataIndex: 'isTemplate',
      key: 'isTemplate',
      width: 150,
      sorter: (a, b) => Number(a.isTemplate) - Number(b.isTemplate),
      render: (isTemplate: boolean) => (
        <span style={{ color: isTemplate ? '#1890ff' : '#999' }}>
          {isTemplate ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_: any, record: ProcessRow) => (
        <Space size="small">
          <Tooltip title="Copy">
            <Button
              type="primary"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record)}
              loading={copyProcessMutation.isPending}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              loading={deleteProcessMutation.isPending}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  return (
    <div id="processes-list" className="processes-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Processes</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Create new process
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={tableData}
        loading={isLoading}
        bordered
        pagination={false}
      />
    </div>
  );
};

export default ProcessesList;

