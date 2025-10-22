/**
 * Transitions List Component
 * Display and manage transitions for a workflow
 * Migrated from: .old_project/packages/statemachine/src/components/TransitionsList.vue
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tooltip, Modal, message } from 'antd';
import { PlusOutlined, CopyOutlined, DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTransitionsList, useDeleteTransition, useCopyTransition } from '../hooks/useStatemachine';
import { StatesListModal } from './StatesListModal';
import type { PersistedType } from '../types';

const { confirm } = Modal;

interface TransitionsListProps {
  workflowId: string;
  persistedType: PersistedType;
  entityClassName: string;
}

interface TransitionRow {
  key: string;
  index: number;
  id: string;
  name: string;
  active: boolean;
  persisted: boolean;
  automated: boolean;
  startStateName: string;
  startStateId: string;
  endStateName: string;
  endStateId: string;
}

export const TransitionsList: React.FC<TransitionsListProps> = ({
  workflowId,
  persistedType,
  entityClassName,
}) => {
  const navigate = useNavigate();
  const isRuntime = persistedType === 'transient';
  const [statesModalVisible, setStatesModalVisible] = useState(false);

  // Queries
  const { data: transitions = [], isLoading, refetch } = useTransitionsList(persistedType, workflowId);

  // Mutations
  const deleteTransitionMutation = useDeleteTransition();
  const copyTransitionMutation = useCopyTransition();
  
  // Table data
  const tableData = useMemo<TransitionRow[]>(() => {
    return transitions.map((transition: any, index: number) => ({
      key: transition.id,
      index: index + 1,
      id: transition.id,
      name: transition.name,
      active: transition.active !== undefined ? transition.active : true,
      persisted: transition.persisted !== undefined ? transition.persisted : true,
      automated: transition.automated || false,
      startStateName: transition.startStateName || transition.fromState || 'None',
      startStateId: transition.startStateId || transition.fromState,
      endStateName: transition.endStateName || transition.toState || 'None',
      endStateId: transition.endStateId || transition.toState,
    }));
  }, [transitions]);
  
  // Handlers
  const handleAddNew = () => {
    navigate(
      `/transition/new?workflowId=${workflowId}&persistedType=${persistedType}&entityClassName=${entityClassName}`
    );
  };

  const handleShowStates = () => {
    setStatesModalVisible(true);
  };

  const handleViewTransition = (record: TransitionRow) => {
    navigate(
      `/transition/${record.id}?workflowId=${workflowId}&persistedType=${persistedType}&entityClassName=${entityClassName}`
    );
  };

  const handleCopy = async (record: TransitionRow) => {
    try {
      const newTransitionId = await copyTransitionMutation.mutateAsync({
        persistedType,
        workflowId,
        transitionId: record.id,
      });

      message.success('Transition copied successfully');
      refetch();

      // Navigate to the new transition
      navigate(
        `/transition/${newTransitionId}?workflowId=${workflowId}&persistedType=${persistedType}&entityClassName=${entityClassName}`
      );
    } catch (error) {
      message.error('Failed to copy transition');
    }
  };
  
  const handleDelete = (record: TransitionRow) => {
    confirm({
      title: 'Delete confirmation',
      content: 'Are you sure you want to delete this transition?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteTransitionMutation.mutateAsync({
            persistedType,
            workflowId,
            transitionId: record.id,
          });
          message.success('Transition deleted successfully');
          refetch();
        } catch (error) {
          message.error('Failed to delete transition');
        }
      },
    });
  };
  
  const handleViewState = (record: TransitionRow, stateType: 'start' | 'end') => {
    const stateId = stateType === 'start' ? record.startStateId : record.endStateId;
    if (!stateId || stateId.toLowerCase() === 'none') return;

    navigate(
      `/state/${stateId}?workflowId=${workflowId}&persistedType=${persistedType}&entityClassName=${entityClassName}`
    );
  };
  
  // Table columns
  const columns: ColumnsType<TransitionRow> = [
    {
      title: '№',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      render: (index: number, record) => (
        <a onClick={() => handleViewTransition(record)}>{index}</a>
      ),
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      width: 150,
      sorter: (a, b) => Number(a.active) - Number(b.active),
      render: (active: boolean) => (
        <span style={{ color: active ? '#52c41a' : '#ff4d4f' }}>
          {active ? 'Yes' : 'No'}
        </span>
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
      title: 'Automated',
      dataIndex: 'automated',
      key: 'automated',
      width: 150,
      sorter: (a, b) => Number(a.automated) - Number(b.automated),
      render: (automated: boolean) => (
        <span style={{ color: automated ? '#1890ff' : '#999' }}>
          {automated ? 'Auto' : 'Manual'}
        </span>
      ),
    },
    {
      title: 'Transition',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <a onClick={() => handleViewTransition(record)}>{name}</a>
      ),
    },
    {
      title: 'Start state',
      dataIndex: 'startStateName',
      key: 'startStateName',
      sorter: (a, b) => a.startStateName.localeCompare(b.startStateName),
      render: (name: string, record) => {
        if (name.toLowerCase() === 'none' || !record.persisted) {
          return <span>{name}</span>;
        }
        return <a onClick={() => handleViewState(record, 'start')}>{name}</a>;
      },
    },
    {
      title: 'End state',
      dataIndex: 'endStateName',
      key: 'endStateName',
      sorter: (a, b) => a.endStateName.localeCompare(b.endStateName),
      render: (name: string, record) => {
        if (!record.persisted) {
          return <span>{name}</span>;
        }
        return <a onClick={() => handleViewState(record, 'end')}>{name}</a>;
      },
    },
    ...(!isRuntime
      ? [
          {
            title: 'Transition Actions',
            key: 'actions',
            width: 180,
            render: (_: any, record: TransitionRow) => (
              <Space size="small">
                <Tooltip title="Copy">
                  <Button
                    type="primary"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(record)}
                    loading={copyTransitionMutation.isPending}
                  />
                </Tooltip>
                <Tooltip title="Delete">
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record)}
                    loading={deleteTransitionMutation.isPending}
                  />
                </Tooltip>
              </Space>
            ),
          },
        ]
      : []),
  ];
  
  return (
    <div id="transitions-list" className="transitions-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Transitions</h2>
        {!isRuntime && (
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
              Create new transition
            </Button>
            <Button type="primary" icon={<UnorderedListOutlined />} onClick={handleShowStates}>
              List of states
            </Button>
          </Space>
        )}
      </div>
      
      <Table
        columns={columns}
        dataSource={tableData}
        loading={isLoading}
        bordered
        pagination={false}
      />

      <StatesListModal
        visible={statesModalVisible}
        onClose={() => setStatesModalVisible(false)}
        workflowId={workflowId}
        persistedType={persistedType}
        entityClassName={entityClassName}
      />
    </div>
  );
};

export default TransitionsList;

