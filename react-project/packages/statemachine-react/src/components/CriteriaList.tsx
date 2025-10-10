/**
 * Criteria List Component
 * Display and manage criteria for a workflow
 * Migrated from: .old_project/packages/statemachine/src/components/CriteriaList.vue
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tooltip, Modal, message } from 'antd';
import { PlusOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useCriteriaList, useDeleteCriteria } from '../hooks/useStatemachine';
import type { PersistedType } from '../types';

const { confirm } = Modal;

interface CriteriaListProps {
  workflowId: string;
  persistedType: PersistedType;
  entityClassName: string;
}

interface CriteriaRow {
  key: string;
  id: string;
  name: string;
  description: string;
  persisted: boolean;
}

export const CriteriaList: React.FC<CriteriaListProps> = ({
  workflowId,
  persistedType,
  entityClassName,
}) => {
  const navigate = useNavigate();
  
  // Queries
  const { data: criteriaList = [], isLoading, refetch } = useCriteriaList(entityClassName);
  
  // Mutations
  const deleteCriteriaMutation = useDeleteCriteria();
  
  // Table data
  const tableData = useMemo<CriteriaRow[]>(() => {
    return criteriaList.map((criteria: any) => ({
      key: criteria.id,
      id: criteria.id,
      name: criteria.name || criteria.id,
      description: criteria.description || '',
      persisted: criteria.persisted !== undefined ? criteria.persisted : true,
    }));
  }, [criteriaList]);
  
  // Handlers
  const handleAddNew = () => {
    navigate(
      `/statemachine/criteria/new?persistedType=persisted&entityClassName=${entityClassName}&workflowPersistedType=${persistedType}&workflowId=${workflowId}`
    );
  };
  
  const handleViewCriteria = (record: CriteriaRow) => {
    const criteriaPersistedType = record.persisted ? 'persisted' : 'transient';
    navigate(
      `/statemachine/criteria/${record.id}?persistedType=${criteriaPersistedType}&entityClassName=${entityClassName}&workflowPersistedType=${persistedType}&workflowId=${workflowId}`
    );
  };
  
  const handleCopy = async (_record: CriteriaRow) => {
    // TODO: Implement copy functionality
    message.info('Copy criteria coming soon');
  };
  
  const handleDelete = (record: CriteriaRow) => {
    confirm({
      title: 'Delete confirmation',
      content: 'Are you sure you want to delete this criteria?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const criteriaPersistedType = record.persisted ? 'persisted' : 'transient';
          await deleteCriteriaMutation.mutateAsync({
            persistedType: criteriaPersistedType,
            criteriaId: record.id,
          });
          message.success('Criteria deleted successfully');
          refetch();
        } catch (error) {
          message.error('Failed to delete criteria');
        }
      },
    });
  };
  
  // Table columns
  const columns: ColumnsType<CriteriaRow> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <a onClick={() => handleViewCriteria(record)}>{name}</a>
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_: any, record: CriteriaRow) => (
        <Space size="small">
          <Tooltip title="Copy">
            <Button
              type="primary"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              loading={deleteCriteriaMutation.isPending}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  return (
    <div id="criteria-list" className="criteria-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Custom criteria</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Create new criterion
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

export default CriteriaList;

