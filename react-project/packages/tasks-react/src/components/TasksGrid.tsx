/**
 * TasksGrid Component
 * Main tasks table with pagination
 * Migrated from: .old_project/packages/tasks/src/views/tasks/index/TasksGrid.vue
 */

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Table, Button, Tooltip, Pagination } from 'antd';
import { EditOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { HelperDictionary, HelperFormat } from '@cyoda/ui-lib-react';
import { useTasksPerPage, useTasksState } from '../hooks/useTasks';
import { BulkUpdateForm } from './BulkUpdateForm';
import { TasksNotifications, taskEventBus, type TaskEvent } from './TasksNotifications';
import type { Task, TaskFilterType, TableRow } from '../types';
import type { ColumnsType } from 'antd/es/table';

interface TasksGridProps {
  filter: TaskFilterType;
  isApplyRealData: boolean;
}

// Memoized priority arrow component
const PriorityArrow = memo<{ priority: number }>(({ priority }) => {
  const Icon = priority > 5 ? ArrowUpOutlined : ArrowDownOutlined;
  const color = priority > 5 ? 'red' : 'green';

  return (
    <span style={{ color }}>
      <Icon />
    </span>
  );
});
PriorityArrow.displayName = 'PriorityArrow';

// Memoized priority cell component
const PriorityCell = memo<{ text: string; priority: number }>(({ text, priority }) => {
  return (
    <span>
      {text} <PriorityArrow priority={priority} />
    </span>
  );
});
PriorityCell.displayName = 'PriorityCell';

// Memoized operations cell component
const OperationsCell = memo<{ onView: () => void }>(({ onView }) => {
  return (
    <Tooltip title="Edit task">
      <Button
        type="default"
        icon={<EditOutlined />}
        onClick={onView}
        aria-label="Edit task"
      />
    </Tooltip>
  );
});
OperationsCell.displayName = 'OperationsCell';

export const TasksGrid: React.FC<TasksGridProps> = memo(({ filter, isApplyRealData }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  // Build query params
  const params = useMemo(() => {
    const queryParams = {
      page: currentPage - 1,
      size: pageSize,
      state: filter.status_id || '',
      assignee: filter.assignee_id || '',
      priority: filter.priority_id || '',
    };
    console.log('🔍 TasksGrid filter:', filter);
    console.log('🔍 TasksGrid params:', queryParams);
    return queryParams;
  }, [currentPage, pageSize, filter]);

  // Fetch tasks
  const { data, isLoading, refetch } = useTasksPerPage(params);

  // Update local tasks when data changes
  useEffect(() => {
    if (data?.content) {
      setLocalTasks(data.content);
    }
  }, [data]);

  // Handle real-time task updates (matching Vue implementation)
  useEffect(() => {
    if (!isApplyRealData) return;

    const handleTaskUpdate = (taskEvent: TaskEvent) => {
      const updatedTask = taskEvent.alertTask;

      setLocalTasks((prevTasks) => {
        // Check if task matches current filters (matching Vue logic)
        let shouldInclude = true;

        if (filter.status_id !== '' && filter.status_id !== updatedTask.state) {
          shouldInclude = false;
        }
        if (filter.assignee_id !== '' && filter.assignee_id !== updatedTask.assignee) {
          shouldInclude = false;
        }
        if (filter.priority_id !== '' && filter.priority_id !== String(updatedTask.priority)) {
          shouldInclude = false;
        }

        if (!shouldInclude) {
          return prevTasks;
        }

        // Find existing task
        const existingIndex = prevTasks.findIndex(t => t.id === updatedTask.id);

        if (existingIndex !== -1) {
          // Update existing task
          const newTasks = [...prevTasks];
          newTasks[existingIndex] = updatedTask;
          return newTasks;
        } else {
          // Add new task at the beginning
          const newTasks = [updatedTask, ...prevTasks];
          // Keep only pageSize tasks
          if (newTasks.length > pageSize) {
            newTasks.pop();
          }
          return newTasks;
        }
      });
    };

    taskEventBus.on(handleTaskUpdate);
    return () => taskEventBus.off(handleTaskUpdate);
  }, [isApplyRealData, filter, pageSize]);

  // Transform tasks to table rows
  const tableData: TableRow[] = useMemo(() => {
    if (localTasks.length === 0) return [];

    return localTasks.map((task: Task): TableRow => ({
      id: task.id,
      title: task.title,
      state: HelperFormat.toLowerCase(task.state),
      priority: task.priority,
      priority_name: HelperDictionary.getLabel('priorities', task.priority),
      assigned_to_name: task.assignee,
      timestamp: 0,
      timestamp_name: HelperFormat.date(task.createdDatetime),
      agent_event: task.message,
      task,
    }));
  }, [localTasks]);

  // Handle view task - memoized to prevent re-creating on every render
  const handleView = useCallback((row: TableRow) => {
    navigate(`/tasks/${row.id}`);
  }, [navigate]);

  // Handle selection change - memoized
  const handleSelectionChange = useCallback((selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  }, []);

  // Handle page change - memoized
  const handlePageChange = useCallback((page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  }, []);

  // Table columns - memoized to prevent re-creating on every render
  const columns: ColumnsType<TableRow> = useMemo(() => [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 180,
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      width: 180,
      sorter: (a, b) => a.state.localeCompare(b.state),
    },
    {
      title: 'Priority',
      dataIndex: 'priority_name',
      key: 'priority_name',
      width: 180,
      sorter: (a, b) => a.priority - b.priority,
      render: (text, record) => (
        <PriorityCell text={text} priority={record.priority} />
      ),
    },
    {
      title: 'Assigned To',
      dataIndex: 'assigned_to_name',
      key: 'assigned_to_name',
      sorter: (a, b) => a.assigned_to_name.localeCompare(b.assigned_to_name),
    },
    {
      title: 'Created',
      dataIndex: 'timestamp_name',
      key: 'timestamp_name',
      sorter: (a, b) => a.timestamp - b.timestamp,
    },
    {
      title: 'Operations',
      key: 'operations',
      render: (_, record) => (
        <OperationsCell onView={() => handleView(record)} />
      ),
    },
  ], [handleView]);

  // Row selection config - memoized
  const rowSelection = useMemo(() => ({
    selectedRowKeys,
    onChange: handleSelectionChange,
  }), [selectedRowKeys, handleSelectionChange]);

  // Handle bulk update completion - memoized
  const handleBulkUpdated = useCallback(() => {
    setSelectedRowKeys([]);
    refetch();
  }, [refetch]);

  // Selected rows - memoized
  const selectedRows = useMemo(() =>
    tableData.filter(row => selectedRowKeys.includes(row.id)),
    [tableData, selectedRowKeys]
  );

  return (
    <div className="tasks-grid" role="region" aria-label="Tasks management">
      <TasksNotifications />
      <div>
        <h2 id="tasks-heading">Tasks</h2>
      </div>
      <div className="wrap-table">
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={tableData}
          loading={isLoading}
          rowKey="id"
          pagination={false}
          aria-labelledby="tasks-heading"
          aria-busy={isLoading}
          aria-describedby="tasks-description"
        />
        <div id="tasks-description" className="sr-only">
          Table showing {data?.totalElements || 0} tasks with columns for title, status, priority, assignee, created date, and operations
        </div>

        {selectedRowKeys.length > 0 && (
          <div role="region" aria-label="Bulk update form" aria-live="polite">
            <BulkUpdateForm
              multipleSelection={selectedRows}
              onUpdated={handleBulkUpdated}
            />
          </div>
        )}

        <nav aria-label="Tasks pagination" style={{ marginTop: 16, textAlign: 'center' }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={data?.totalElements || 0}
            showSizeChanger
            showTotal={(total) => `Total ${total} items`}
            pageSizeOptions={[5, 10, 20]}
            onChange={handlePageChange}
            aria-label="Pagination navigation"
          />
        </nav>
      </div>
    </div>
  );
});
TasksGrid.displayName = 'TasksGrid';

