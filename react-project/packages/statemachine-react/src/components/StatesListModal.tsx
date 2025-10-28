/**
 * States List Modal Component
 * Display and manage states for a workflow in a modal
 * Migrated from: .old_project/packages/statemachine/src/components/StatesListPopUp.vue
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Table, Input, Button, Space, Tooltip, App } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useStatesList, useDeleteState } from '../hooks/useStatemachine';
import { StateIndicator } from './StateIndicator';
import type { PersistedType } from '../types';

interface StatesListModalProps {
  visible: boolean;
  onClose: () => void;
  workflowId: string;
  persistedType: PersistedType;
  entityClassName: string;
}

interface StateRow {
  key: string;
  id: string;
  name: string;
  persisted: boolean;
  creationDate?: number;
}

export const StatesListModal: React.FC<StatesListModalProps> = ({
  visible,
  onClose,
  workflowId,
  persistedType,
  entityClassName,
}) => {
  const { modal, message } = App.useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  
  // Queries
  const { data: states = [], isLoading, refetch } = useStatesList(persistedType, workflowId, visible);
  
  // Mutations
  const deleteStateMutation = useDeleteState();
  
  // Filtered table data
  const tableData = useMemo<StateRow[]>(() => {
    return states
      .filter((state: any) => {
        if (!filter) return true;
        return state.name?.toLowerCase().includes(filter.toLowerCase());
      })
      .map((state: any) => ({
        key: state.id,
        id: state.id,
        name: state.name,
        persisted: state.persisted !== undefined ? state.persisted : true,
        creationDate: state.creationDate,
      }));
  }, [states, filter]);
  
  // Handlers
  const handleEdit = (record: StateRow) => {
    const statePersistedType = record.persisted ? 'persisted' : 'transient';
    navigate(
      `/state/${record.id}?workflowId=${workflowId}&persistedType=${statePersistedType}&entityClassName=${entityClassName}`
    );
    onClose();
  };
  
  const handleDelete = (record: StateRow) => {
    if (record.name.toLowerCase() === 'none') {
      message.warning('Cannot delete "None" state');
      return;
    }

    modal.confirm({
      title: 'Delete confirmation',
      content: 'Are you sure you want to delete this state? Before deleting, please make sure that this state is not used in any of the transitions.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const statePersistedType = record.persisted ? 'persisted' : 'runtime';
          await deleteStateMutation.mutateAsync({
            persistedType: statePersistedType,
            workflowId,
            stateId: record.id,
          });
          message.success('State deleted successfully');
          refetch();
        } catch (error) {
          message.error('Failed to delete state');
        }
      },
    });
  };
  
  // Table columns
  const columns: ColumnsType<StateRow> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Persisted',
      dataIndex: 'persisted',
      key: 'persisted',
      width: 150,
      sorter: (a, b) => Number(a.persisted) - Number(b.persisted),
      render: (persisted: boolean) => <StateIndicator state={persisted} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: StateRow) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.name.toLowerCase() !== 'none' && (
            <Tooltip title="Delete">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
                loading={deleteStateMutation.isPending}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];
  
  return (
    <Modal
      title="List of states"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={800}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Input
          placeholder="Filter states..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          allowClear
          style={{ maxWidth: 400 }}
        />
        
        <Table
          columns={columns}
          dataSource={tableData}
          loading={isLoading}
          bordered
          size="small"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} states`,
          }}
        />
      </Space>
    </Modal>
  );
};

export default StatesListModal;

