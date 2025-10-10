/**
 * TasksGrid Component
 * Main tasks table with pagination
 * Migrated from: .old_project/packages/tasks/src/views/tasks/index/TasksGrid.vue
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Tooltip, Pagination } from 'antd';
import { EditOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { HelperDictionary, HelperFormat } from '@cyoda/ui-lib-react';
import { useTasksPerPage, useTasksState } from '../hooks/useTasks';
import { BulkUpdateForm } from './BulkUpdateForm';
import type { Task, TaskFilterType, TableRow } from '../types';
import type { ColumnsType } from 'antd/es/table';

interface TasksGridProps {
  filter: TaskFilterType;
  isApplyRealData: boolean;
}

export const TasksGrid: React.FC<TasksGridProps> = ({ filter, isApplyRealData }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Build query params
  const params = useMemo(() => ({
    page: currentPage - 1,
    size: pageSize,
    state: filter.status_id || '',
    assignee: filter.assignee_id || '',
    priority: filter.priority_id || '',
  }), [currentPage, pageSize, filter]);

  // Fetch tasks
  const { data, isLoading, refetch } = useTasksPerPage(params);

  // Transform tasks to table rows
  const tableData: TableRow[] = useMemo(() => {
    if (!data?.content) return [];
    
    return data.content.map((task: Task): TableRow => ({
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
  }, [data]);

  // Priority arrow icon
  const priorityArrow = (priority: number) => {
    return priority > 5 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  };

  // Priority arrow color
  const priorityArrowColor = (priority: number) => {
    return priority > 5 ? 'red' : 'green';
  };

  // Handle view task
  const handleView = (row: TableRow) => {
    navigate(`/tasks/${row.id}`);
  };

  // Handle selection change
  const handleSelectionChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  // Handle page change
  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // Table columns
  const columns: ColumnsType<TableRow> = [
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
        <span>
          {text}{' '}
          <span style={{ color: priorityArrowColor(record.priority) }}>
            {priorityArrow(record.priority)}
          </span>
        </span>
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
        <Tooltip title="Edit">
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => handleView(record)}
          />
        </Tooltip>
      ),
    },
  ];

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: handleSelectionChange,
  };

  return (
    <div className="tasks-grid">
      <div>
        <h2>Tasks</h2>
      </div>
      <div className="wrap-table">
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={tableData}
          loading={isLoading}
          rowKey="id"
          pagination={false}
        />

        {selectedRowKeys.length > 0 && (
          <BulkUpdateForm
            multipleSelection={tableData.filter(row => selectedRowKeys.includes(row.id))}
            onUpdated={() => {
              setSelectedRowKeys([]);
              refetch();
            }}
          />
        )}

        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={data?.totalElements || 0}
          showSizeChanger
          showTotal={(total) => `Total ${total} items`}
          pageSizeOptions={[5, 10, 20]}
          onChange={handlePageChange}
          style={{ marginTop: 16, textAlign: 'right' }}
        />
      </div>
    </div>
  );
};

